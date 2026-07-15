const CONTENT_PATH = "content/site.json";
const API_VERSION = "2022-11-28";
const DEFAULT_REPO = {
  owner: "limshoon",
  repo: "GSJ_website",
  branch: "main",
};
const POST_COLLECTIONS = ["notices", "activities", "resources"];
const SAVE_RESET_DELAY = 1600;

const blankItems = {
  notices: () => ({
    id: createPostId("notice"),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    date: todayText(),
    title: "",
    summary: "",
    body: "",
    image: "",
    attachmentLabel: "첨부 자료 보기",
    attachmentUrl: "",
  }),
  activities: () => ({
    id: createPostId("activity"),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    date: todayText(),
    title: "",
    summary: "",
    body: "",
    image: "",
  }),
  resources: () => ({
    id: createPostId("resource"),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    date: todayText(),
    title: "",
    summary: "",
    body: "",
    image: "",
    attachmentLabel: "자료 보기",
    attachmentUrl: "",
    icon: "document",
  }),
  aboutItems: () => ({ title: "", description: "", icon: "document" }),
  contactItems: () => ({ title: "", main: "", sub: "", icon: "document" }),
  sns: () => ({ label: "", url: "#" }),
};

const iconOptions = [
  ["document", "문서"],
  ["people", "사람"],
  ["handshake", "협력"],
  ["shield", "보호"],
  ["flag", "깃발"],
  ["phone", "전화"],
  ["mail", "이메일"],
  ["map", "지도"],
];

const state = {
  config: { ...DEFAULT_REPO },
  token: "",
  content: null,
  sha: "",
  dirty: false,
  connected: false,
  highlightedCollection: "",
  saveResetTimer: null,
};

const connectionForm = document.querySelector("#connection-form");
const editor = document.querySelector("#editor");
const saveButton = document.querySelector("#save-button");
const statusMessage = document.querySelector("#status-message");

function init() {
  const savedConfig = JSON.parse(localStorage.getItem("gsj-admin-config") || "null");
  state.config = { ...DEFAULT_REPO, ...(savedConfig || {}) };
  state.token = sessionStorage.getItem("gsj-admin-token") || "";

  connectionForm.elements.owner.value = state.config.owner;
  connectionForm.elements.repo.value = state.config.repo;
  connectionForm.elements.branch.value = state.config.branch;
  connectionForm.elements.token.value = state.token;

  connectionForm.addEventListener("submit", handleConnect);
  saveButton.addEventListener("click", handleSave);
  editor.addEventListener("click", handleEditorClick);
  editor.addEventListener("input", markDirty);
  editor.addEventListener("change", markDirty);

  loadPublicContent();
}

async function loadPublicContent() {
  try {
    const response = await fetch(`../${CONTENT_PATH}?v=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("public content not found");
    }

    state.content = normalizeContent(await response.json());
    renderEditor();
    setStatus("현재 공개된 콘텐츠를 불러왔습니다. 저장하려면 GitHub에 연결하세요.");
  } catch (error) {
    editor.innerHTML = `<p class="empty-editor">GitHub에 연결하면 콘텐츠 편집 화면이 열립니다.</p>`;
  }
}

async function handleConnect(event) {
  event.preventDefault();

  state.config = {
    owner: connectionForm.elements.owner.value.trim(),
    repo: connectionForm.elements.repo.value.trim(),
    branch: connectionForm.elements.branch.value.trim(),
  };
  state.token = connectionForm.elements.token.value.trim();

  if (!state.config.owner || !state.config.repo || !state.config.branch || !state.token) {
    setStatus("연결 정보를 모두 입력해주세요.", "error");
    return;
  }

  localStorage.setItem("gsj-admin-config", JSON.stringify(state.config));
  sessionStorage.setItem("gsj-admin-token", state.token);

  setStatus("GitHub에서 콘텐츠를 불러오는 중입니다...");

  try {
    await loadContentFromGitHub();
    state.connected = true;
    state.dirty = false;
    setSaveButtonState("idle");
    renderEditor();
    setStatus("연결되었습니다. 수정 후 저장하고 게시할 수 있습니다.", "success");
  } catch (error) {
    setSaveButtonState("disabled");
    setStatus(getErrorMessage(error), "error");
  }
}

async function loadContentFromGitHub() {
  const payload = await githubRequest(`/contents/${CONTENT_PATH}?ref=${encodeURIComponent(state.config.branch)}`);
  state.sha = payload.sha;
  state.content = normalizeContent(JSON.parse(base64ToString(payload.content)));
}

async function handleSave() {
  if (!state.connected) {
    setStatus("먼저 GitHub에 연결해주세요.", "error");
    return;
  }

  setSaveButtonState("saving");
  setStatus("이미지와 자료를 업로드하고 변경 사항을 저장하는 중입니다...");

  try {
    state.content = readContentFromForm();
    await uploadManagedFiles(state.content);

    const body = JSON.stringify(stripPrivateFields(state.content), null, 2) + "\n";
    const payload = {
      message: `Update site content ${new Date().toISOString().slice(0, 10)}`,
      content: stringToBase64(body),
      branch: state.config.branch,
      sha: state.sha,
    };

    const result = await githubRequest(`/contents/${CONTENT_PATH}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    state.sha = result.content.sha;
    state.content = normalizeContent(stripPrivateFields(state.content));
    state.dirty = false;
    renderEditor();
    setSaveButtonState("success");
    setStatus("저장되었습니다. 잠시 후 사이트에 자동으로 반영됩니다.", "success");
    showToast("변경사항이 저장되었습니다.", "success");
  } catch (error) {
    setSaveButtonState("error");
    setStatus(getErrorMessage(error), "error");
    showToast("저장 중 오류가 발생했습니다. 다시 시도해 주세요.", "error");
  }
}

function renderEditor() {
  if (!state.content) {
    editor.innerHTML = `<p class="empty-editor">편집할 콘텐츠가 없습니다.</p>`;
    return;
  }

  const content = normalizeContent(state.content);
  state.content = content;

  editor.innerHTML = `
    <form class="editor-form" id="content-form">
      ${renderSiteSection(content)}
      ${renderHomeSection(content)}
      ${renderCollectionSection("notices", "공지사항", "방문자가 공지사항 목록에서 클릭해 상세 내용을 열람합니다.", content.notices, postFields("notice"))}
      ${renderCollectionSection("activities", "활동", "활동 소식과 포스터 또는 사진을 게시합니다.", content.activities, postFields("activity"))}
      ${renderCollectionSection("resources", "자료실", "자료 설명과 첨부 파일을 게시합니다.", content.resources, postFields("resource"))}
      ${renderCollectionSection("aboutItems", "조합소개", "소개 카드 내용을 수정합니다.", content.aboutItems, [
        { name: "title", label: "제목" },
        { name: "description", label: "설명", type: "textarea" },
        { name: "icon", label: "아이콘", type: "select" }
      ])}
      ${renderCollectionSection("contactItems", "문의", "전화, 이메일, 방문 안내를 수정합니다.", content.contactItems, [
        { name: "title", label: "제목" },
        { name: "main", label: "주요 내용" },
        { name: "sub", label: "보조 내용" },
        { name: "icon", label: "아이콘", type: "select" }
      ])}
    </form>
  `;
}

function postFields(kind) {
  const fields = [
    { name: "id", label: "게시물 ID", helper: "주소에 쓰이는 고유값입니다. 비워두면 자동 생성됩니다." },
    { name: "date", label: "날짜", placeholder: "2024.05.20" },
    { name: "title", label: "제목" },
    { name: "summary", label: "목록 요약", type: "textarea" },
    { name: "body", label: "상세 본문", type: "textarea" },
    { name: "image", label: kind === "activity" ? "대표 이미지/활동 사진" : "대표 이미지/포스터", type: "image" },
  ];

  if (kind === "resource") {
    fields.push({ name: "icon", label: "아이콘", type: "select" });
  }

  if (kind !== "activity") {
    fields.push(
      { name: "attachmentLabel", label: kind === "resource" ? "자료 버튼 문구" : "첨부 버튼 문구" },
      { name: "attachmentUrl", label: kind === "resource" ? "자료 파일 또는 링크" : "첨부 파일 또는 링크", type: "file" }
    );
  }

  return fields;
}

function renderSiteSection(content) {
  const site = content.site;

  return `
    <section class="editor-section">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">기본 정보</h3>
          <p>사이트 이름, 사무실 정보, SNS 링크를 관리합니다.</p>
        </div>
      </div>
      <div class="field-grid" data-section="site">
        ${renderField({ name: "name", label: "사이트 이름" }, site)}
        ${renderField({ name: "officeName", label: "사무실 이름" }, site)}
        ${renderField({ name: "description", label: "사이트 설명", type: "textarea" }, site)}
        ${renderField({ name: "addressLines", label: "주소", type: "textarea", helper: "여러 줄 입력 가능" }, { addressLines: (site.addressLines || []).join("\n") })}
        ${renderField({ name: "phone", label: "전화번호" }, site)}
        ${renderField({ name: "email", label: "이메일" }, site)}
        ${renderField({ name: "copyright", label: "저작권 문구" }, site)}
      </div>
      ${renderCollectionSection("sns", "SNS 링크", "노출할 SNS 이름과 주소를 수정합니다.", site.sns || [], [
        { name: "label", label: "이름" },
        { name: "url", label: "주소", placeholder: "#" }
      ], true)}
    </section>
  `;
}

function renderHomeSection(content) {
  const home = content.home;

  return `
    <section class="editor-section">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">홈 화면</h3>
          <p>첫 화면의 큰 문구와 설명을 관리합니다.</p>
        </div>
      </div>
      <div class="field-grid" data-section="home">
        ${renderField({ name: "titleLines", label: "큰 제목", type: "textarea", helper: "한 줄에 하나씩 입력" }, { titleLines: (home.titleLines || []).join("\n") })}
        ${renderField({ name: "subtitle", label: "보조 문구" }, home)}
        ${renderField({ name: "copy", label: "설명", type: "textarea" }, home)}
        ${renderField({ name: "visualWords", label: "오른쪽 장식 단어", type: "textarea", helper: "한 줄에 하나씩 입력" }, { visualWords: (home.visualWords || []).join("\n") })}
      </div>
    </section>
  `;
}

function renderCollectionSection(key, title, description, items, fields, nested = false) {
  return `
    <section class="${nested ? "nested-section" : "editor-section"}" data-wrapper="${key}">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">${escapeHtml(title)}</h3>
          <p>${escapeHtml(description)}</p>
        </div>
        <button class="secondary-button" type="button" data-action="add" data-collection="${key}">추가</button>
      </div>
      <div class="collection-list">
        ${(items || []).map((item, index) => renderCollectionItem(key, item, index, fields)).join("") || `<p class="empty-editor">아직 항목이 없습니다.</p>`}
      </div>
    </section>
  `;
}

function renderCollectionItem(key, item, index, fields) {
  const highlightClass = state.highlightedCollection === key && index === 0 ? " is-highlighted" : "";

  return `
    <article class="admin-item${highlightClass}" data-collection="${key}" data-index="${index}">
      <div class="item-header">
        <h4>${index + 1}. ${escapeHtml(item.title || item.label || "새 항목")}</h4>
        <div class="item-actions">
          <button class="ghost-button" type="button" data-action="up" data-collection="${key}" data-index="${index}">위로</button>
          <button class="ghost-button" type="button" data-action="down" data-collection="${key}" data-index="${index}">아래로</button>
          <button class="danger-button" type="button" data-action="delete" data-collection="${key}" data-index="${index}">삭제</button>
        </div>
      </div>
      <div class="field-grid">
        ${fields.map((field) => renderField(field, item, key, index)).join("")}
      </div>
    </article>
  `;
}

function renderField(field, item, collectionKey = "", index = "") {
  const value = item[field.name] || "";
  const fieldId = `${collectionKey || "section"}-${field.name}-${index}`;
  const wideClass = ["textarea", "image", "file"].includes(field.type) ? "wide-field" : "";
  const helper = field.helper ? `<p class="helper-text">${escapeHtml(field.helper)}</p>` : "";

  if (field.type === "textarea") {
    return `
      <label class="${wideClass}" for="${fieldId}">
        <span>${escapeHtml(field.label)}</span>
        <textarea id="${fieldId}" data-field="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value)}</textarea>
        ${helper}
      </label>
    `;
  }

  if (field.type === "select") {
    return `
      <label for="${fieldId}">
        <span>${escapeHtml(field.label)}</span>
        <select id="${fieldId}" data-field="${escapeHtml(field.name)}">
          ${iconOptions.map(([optionValue, label]) => `<option value="${escapeHtml(optionValue)}"${optionValue === value ? " selected" : ""}>${escapeHtml(label)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  if (field.type === "image") {
    return `
      <label class="wide-field" for="${fieldId}">
        <span>${escapeHtml(field.label)}</span>
        <input id="${fieldId}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(value)}" placeholder="assets/images/uploads/example.jpg" />
        <input type="file" accept="image/*" data-upload-field="${escapeHtml(field.name)}" data-upload-kind="image" />
        <p class="helper-text">새 이미지를 선택하면 저장할 때 자동으로 업로드되고 경로가 채워집니다.</p>
      </label>
    `;
  }

  if (field.type === "file") {
    return `
      <label class="wide-field" for="${fieldId}">
        <span>${escapeHtml(field.label)}</span>
        <input id="${fieldId}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(value)}" placeholder="파일을 업로드하거나 외부 링크를 입력" />
        <input type="file" accept=".pdf,.hwp,.hwpx,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*" data-upload-field="${escapeHtml(field.name)}" data-upload-kind="file" />
        <p class="helper-text">PDF, 이미지, 문서 파일을 업로드하거나 외부 링크를 직접 입력할 수 있습니다.</p>
      </label>
    `;
  }

  return `
    <label for="${fieldId}">
      <span>${escapeHtml(field.label)}</span>
      <input id="${fieldId}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "")}" />
      ${helper}
    </label>
  `;
}

function handleEditorClick(event) {
  const button = event.target.closest("[data-action]");

  if (!button || !state.content) return;

  if (document.querySelector("#content-form")) {
    state.content = readContentFromForm({ sortPosts: false });
  }

  const collection = button.dataset.collection;
  const action = button.dataset.action;
  const index = Number(button.dataset.index);
  const items = getMutableCollection(collection);

  if (!items) return;

  if (action === "add") {
    items.unshift(blankItems[collection]());
    state.highlightedCollection = collection;
  }
  if (action === "delete") items.splice(index, 1);
  if (action === "up" && index > 0) [items[index - 1], items[index]] = [items[index], items[index - 1]];
  if (action === "down" && index < items.length - 1) [items[index], items[index + 1]] = [items[index + 1], items[index]];

  state.dirty = true;
  renderEditor();

  if (action === "add") {
    focusNewItem(collection);
  }
}

function getMutableCollection(collection) {
  if (collection === "sns") {
    state.content.site.sns = state.content.site.sns || [];
    return state.content.site.sns;
  }

  state.content[collection] = state.content[collection] || [];
  return state.content[collection];
}

function readContentFromForm(options = {}) {
  const form = document.querySelector("#content-form");
  const { sortPosts = true } = options;

  return normalizeContent({
    site: {
      name: getSectionValue(form, "site", "name"),
      description: getSectionValue(form, "site", "description"),
      officeName: getSectionValue(form, "site", "officeName"),
      addressLines: toLines(getSectionValue(form, "site", "addressLines")),
      phone: getSectionValue(form, "site", "phone"),
      email: getSectionValue(form, "site", "email"),
      copyright: getSectionValue(form, "site", "copyright"),
      sns: readCollection("sns", ["label", "url"]),
    },
    home: {
      titleLines: toLines(getSectionValue(form, "home", "titleLines")),
      subtitle: getSectionValue(form, "home", "subtitle"),
      copy: getSectionValue(form, "home", "copy"),
      visualWords: toLines(getSectionValue(form, "home", "visualWords")),
    },
    notices: readCollection("notices", postFields("notice")),
    activities: readCollection("activities", postFields("activity")),
    resources: readCollection("resources", postFields("resource")),
    aboutItems: readCollection("aboutItems", ["title", "description", "icon"]),
    contactItems: readCollection("contactItems", ["title", "main", "sub", "icon"]),
  }, { sortPosts });
}

function getSectionValue(form, section, field) {
  return form.querySelector(`[data-section="${section}"] [data-field="${field}"]`)?.value.trim() || "";
}

function readCollection(collection, fields) {
  const normalizedFields = fields.map((field) => (typeof field === "string" ? { name: field } : field));

  return [...document.querySelectorAll(`.admin-item[data-collection="${collection}"]`)].map((item, index) => {
    const nextItem = {};
    const originalItem = state.content?.[collection]?.[index] || {};

    normalizedFields.forEach((field) => {
      nextItem[field.name] = item.querySelector(`[data-field="${field.name}"]`)?.value.trim() || "";
    });

    if ("id" in nextItem && !nextItem.id) {
      nextItem.id = createPostId(collection, index);
    }

    item.querySelectorAll("[data-upload-field]").forEach((input) => {
      const file = input.files[0];
      if (!file) return;

      nextItem._uploads = nextItem._uploads || {};
      nextItem._uploads[input.dataset.uploadField] = {
        file,
        kind: input.dataset.uploadKind || "file",
      };
    });

    if (POST_COLLECTIONS.includes(collection)) {
      nextItem.createdAt = originalItem.createdAt || originalItem.created_at || nowIso();
      nextItem.updatedAt = hasPostChanged(originalItem, nextItem) ? nowIso() : originalItem.updatedAt || originalItem.updated_at || nextItem.createdAt;
    }

    return nextItem;
  });
}

function toLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function uploadManagedFiles(content) {
  for (const collection of ["notices", "activities", "resources"]) {
    for (const item of content[collection] || []) {
      if (!item._uploads) continue;

      for (const [field, upload] of Object.entries(item._uploads)) {
        const path = getUploadPath(upload.kind, upload.file.name);
        const fileContent = await fileToBase64(upload.file);

        await githubRequest(`/contents/${path}`, {
          method: "PUT",
          body: JSON.stringify({
            message: `Upload ${path}`,
            content: fileContent,
            branch: state.config.branch,
          }),
        });

        item[field] = path;
      }

      delete item._uploads;
    }
  }
}

function getUploadPath(kind, fileName) {
  const directory = kind === "image" ? "assets/images/uploads" : "assets/files/uploads";
  return `${directory}/${makeSafeFileName(fileName)}`;
}

function stripPrivateFields(content) {
  const cloned = JSON.parse(JSON.stringify(content));

  ["notices", "activities", "resources"].forEach((collection) => {
    cloned[collection] = (cloned[collection] || []).map(({ _uploads, ...item }) => item);
  });

  return cloned;
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${state.config.owner}/${state.config.repo}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${state.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": API_VERSION,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = "";

    try {
      const payload = await response.json();
      detail = payload.message ? ` ${payload.message}` : "";
    } catch (error) {
      detail = "";
    }

    throw new Error(`GitHub 요청에 실패했습니다.${detail}`);
  }

  return response.json();
}

function normalizeContent(content, options = {}) {
  const { sortPosts = true } = options;
  const base = {
    site: {
      name: "",
      description: "",
      officeName: "",
      addressLines: [],
      phone: "",
      email: "",
      copyright: "",
      sns: [],
    },
    home: {
      titleLines: [],
      subtitle: "",
      copy: "",
      visualWords: [],
    },
    notices: [],
    activities: [],
    resources: [],
    aboutItems: [],
    contactItems: [],
  };

  const next = {
    ...base,
    ...(content || {}),
    site: { ...base.site, ...((content || {}).site || {}) },
    home: { ...base.home, ...((content || {}).home || {}) },
  };

  ["notices", "activities", "resources", "aboutItems", "contactItems"].forEach((key) => {
    if (!Array.isArray(next[key])) next[key] = [];
  });

  next.notices = next.notices.map((item, index) => normalizePost(item, "notices", index));
  next.activities = next.activities.map((item, index) => normalizePost(item, "activities", index));
  next.resources = next.resources.map((item, index) => normalizePost(item, "resources", index));

  if (sortPosts) {
    next.notices = sortPostsByLatest(next.notices);
    next.activities = sortPostsByLatest(next.activities);
    next.resources = sortPostsByLatest(next.resources);
  }

  if (!Array.isArray(next.site.sns)) next.site.sns = [];
  if (!Array.isArray(next.site.addressLines)) next.site.addressLines = [];
  if (!Array.isArray(next.home.titleLines)) next.home.titleLines = [];
  if (!Array.isArray(next.home.visualWords)) next.home.visualWords = [];

  return next;
}

function normalizePost(item, collection, index) {
  return {
    id: item.id || createPostId(collection, index),
    createdAt: item.createdAt || item.created_at || "",
    updatedAt: item.updatedAt || item.updated_at || "",
    date: item.date || "",
    title: item.title || "",
    summary: item.summary || item.description || item.body || "",
    body: item.body || item.description || item.summary || "",
    image: item.image || "",
    attachmentLabel: item.attachmentLabel || (collection === "resources" ? "자료 보기" : "첨부 자료 보기"),
    attachmentUrl: item.attachmentUrl || item.link || "",
    icon: item.icon || "document",
  };
}

function sortPostsByLatest(posts) {
  return [...posts].sort((a, b) => {
    const primary = getPostTime(b) - getPostTime(a);
    if (primary !== 0) return primary;

    const secondary = getDateTime(b.updatedAt || b.updated_at) - getDateTime(a.updatedAt || a.updated_at);
    if (secondary !== 0) return secondary;

    return String(b.id || "").localeCompare(String(a.id || ""));
  });
}

function getPostTime(post) {
  return getDateTime(post.createdAt || post.created_at || post.date || post.timestamp) || getIdTime(post.id);
}

function getDateTime(value) {
  if (!value) return 0;

  const text = String(value).trim();
  const normalized = text.replace(/[./]/g, "-");
  const dateOnly = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime();
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getIdTime(id) {
  const match = String(id || "").match(/(\d{10,})/);
  return match ? Number(match[1]) : 0;
}

function hasPostChanged(previous, next) {
  const fields = ["id", "date", "title", "summary", "body", "image", "attachmentLabel", "attachmentUrl", "icon"];

  return Boolean(next._uploads) || fields.some((field) => String(previous?.[field] || "") !== String(next?.[field] || ""));
}

function nowIso() {
  return new Date().toISOString();
}

function todayText() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function createPostId(prefix = "post", index = "") {
  const suffix = index === "" ? Date.now() : `${Date.now()}-${index + 1}`;
  return `${prefix}-${suffix}`;
}

function makeSafeFileName(name) {
  const now = Date.now();
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const baseName = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${now}-${baseName || "file"}${extension || ".dat"}`;
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}

function stringToBase64(value) {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64ToString(value) {
  const binary = atob(String(value || "").replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function markDirty() {
  state.dirty = true;
}

function setSaveButtonState(status = "idle") {
  window.clearTimeout(state.saveResetTimer);
  saveButton.classList.remove("is-saving", "is-success", "is-error");
  saveButton.setAttribute("aria-busy", "false");

  if (status === "disabled") {
    saveButton.disabled = true;
    saveButton.textContent = "저장하고 게시";
    return;
  }

  if (status === "saving") {
    saveButton.disabled = true;
    saveButton.classList.add("is-saving");
    saveButton.setAttribute("aria-busy", "true");
    saveButton.innerHTML = `<span class="button-spinner" aria-hidden="true"></span><span>저장 중...</span>`;
    return;
  }

  if (status === "success") {
    saveButton.disabled = true;
    saveButton.classList.add("is-success");
    saveButton.innerHTML = `<span aria-hidden="true">✓</span><span>저장 완료</span>`;
    state.saveResetTimer = window.setTimeout(() => setSaveButtonState("idle"), SAVE_RESET_DELAY);
    return;
  }

  if (status === "error") {
    saveButton.disabled = !state.connected;
    saveButton.classList.add("is-error");
    saveButton.textContent = "다시 저장";
    return;
  }

  saveButton.disabled = !state.connected;
  saveButton.textContent = "저장하고 게시";
}

function focusNewItem(collection) {
  const firstItem = document.querySelector(`.admin-item[data-collection="${collection}"]`);

  if (!firstItem) return;

  firstItem.scrollIntoView({ behavior: "smooth", block: "center" });
  firstItem.querySelector("input:not([type='file']), textarea, select")?.focus({ preventScroll: true });

  window.setTimeout(() => {
    firstItem.classList.remove("is-highlighted");
    if (state.highlightedCollection === collection) {
      state.highlightedCollection = "";
    }
  }, 1200);
}

function showToast(message, type = "success") {
  let toast = document.querySelector("#admin-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.className = "admin-toast";
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.className = `admin-toast is-${type} is-visible`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", type === "error");
  statusMessage.classList.toggle("is-success", type === "success");
}

function getErrorMessage(error) {
  return error.message || "처리 중 문제가 발생했습니다.";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

init();
