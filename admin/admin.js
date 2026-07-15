const CONTENT_PATH = "content/site.json";
const API_VERSION = "2022-11-28";
const DEFAULT_REPO = {
  owner: "limshoon",
  repo: "GSJ_website",
  branch: "main",
};

const blankItems = {
  notices: () => ({ date: "", title: "", body: "", link: "notice.html" }),
  activities: () => ({ date: "", title: "", description: "", image: "" }),
  resources: () => ({ title: "", description: "", link: "#", icon: "document" }),
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

    state.content = await response.json();
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
    saveButton.disabled = false;
    renderEditor();
    setStatus("연결되었습니다. 수정 후 저장하고 게시할 수 있습니다.", "success");
  } catch (error) {
    saveButton.disabled = true;
    setStatus(getErrorMessage(error), "error");
  }
}

async function loadContentFromGitHub() {
  const payload = await githubRequest(`/contents/${CONTENT_PATH}?ref=${encodeURIComponent(state.config.branch)}`);
  state.sha = payload.sha;
  state.content = JSON.parse(base64ToString(payload.content));
}

async function handleSave() {
  if (!state.connected) {
    setStatus("먼저 GitHub에 연결해주세요.", "error");
    return;
  }

  setStatus("변경 사항을 저장하는 중입니다...");
  saveButton.disabled = true;

  try {
    state.content = readContentFromForm();
    await uploadActivityImages(state.content.activities);

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
    state.dirty = false;
    renderEditor();
    setStatus("저장되었습니다. GitHub Pages 배포가 끝나면 사이트에 반영됩니다.", "success");
  } catch (error) {
    setStatus(getErrorMessage(error), "error");
  } finally {
    saveButton.disabled = false;
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
      ${renderCollectionSection("notices", "공지사항", "날짜, 제목, 본문을 수정합니다.", content.notices, [
        { name: "date", label: "날짜", placeholder: "2024.05.20" },
        { name: "title", label: "제목" },
        { name: "body", label: "본문", type: "textarea" },
        { name: "link", label: "연결 주소", placeholder: "notice.html" }
      ])}
      ${renderCollectionSection("activities", "활동", "활동 소식과 이미지를 수정합니다.", content.activities, [
        { name: "date", label: "날짜", placeholder: "2024.05.18" },
        { name: "title", label: "제목" },
        { name: "description", label: "설명", type: "textarea" },
        { name: "image", label: "이미지 경로", placeholder: "assets/images/activity-01.jpg", type: "image" }
      ])}
      ${renderCollectionSection("resources", "자료실", "자료 이름, 설명, 링크를 수정합니다.", content.resources, [
        { name: "title", label: "제목" },
        { name: "description", label: "설명", type: "textarea" },
        { name: "link", label: "연결 주소", placeholder: "#" },
        { name: "icon", label: "아이콘", type: "select" }
      ])}
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

function renderSiteSection(content) {
  const site = content.site;

  return `
    <section class="editor-section">
      <div class="section-heading">
        <div>
          <h3>기본 정보</h3>
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
          <h3>홈 화면</h3>
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
          <h3>${escapeHtml(title)}</h3>
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
  return `
    <article class="admin-item" data-collection="${key}" data-index="${index}">
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
  const wideClass = field.type === "textarea" || field.type === "image" ? "wide-field" : "";
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
        <input id="${fieldId}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "")}" />
        <input type="file" accept="image/*" data-upload-field="${escapeHtml(field.name)}" />
        <p class="helper-text">새 이미지를 선택하면 저장할 때 자동으로 업로드됩니다.</p>
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

  const collection = button.dataset.collection;
  const action = button.dataset.action;
  const index = Number(button.dataset.index);
  const items = getMutableCollection(collection);

  if (!items) return;

  if (action === "add") {
    items.push(blankItems[collection]());
  }

  if (action === "delete") {
    items.splice(index, 1);
  }

  if (action === "up" && index > 0) {
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
  }

  if (action === "down" && index < items.length - 1) {
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
  }

  state.dirty = true;
  renderEditor();
}

function getMutableCollection(collection) {
  if (collection === "sns") {
    state.content.site.sns = state.content.site.sns || [];
    return state.content.site.sns;
  }

  state.content[collection] = state.content[collection] || [];
  return state.content[collection];
}

function readContentFromForm() {
  const form = document.querySelector("#content-form");

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
    notices: readCollection("notices", ["date", "title", "body", "link"]),
    activities: readCollection("activities", ["date", "title", "description", "image"], true),
    resources: readCollection("resources", ["title", "description", "link", "icon"]),
    aboutItems: readCollection("aboutItems", ["title", "description", "icon"]),
    contactItems: readCollection("contactItems", ["title", "main", "sub", "icon"]),
  });
}

function getSectionValue(form, section, field) {
  return form.querySelector(`[data-section="${section}"] [data-field="${field}"]`)?.value.trim() || "";
}

function readCollection(collection, fields, includeUpload = false) {
  return [...document.querySelectorAll(`.admin-item[data-collection="${collection}"]`)].map((item) => {
    const nextItem = {};

    fields.forEach((field) => {
      nextItem[field] = item.querySelector(`[data-field="${field}"]`)?.value.trim() || "";
    });

    if (includeUpload) {
      const file = item.querySelector('[data-upload-field="image"]')?.files[0];
      if (file) {
        nextItem._file = file;
      }
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

async function uploadActivityImages(activities) {
  for (const activity of activities) {
    if (!activity._file) continue;

    const path = `assets/images/uploads/${makeSafeFileName(activity._file.name)}`;
    const content = await fileToBase64(activity._file);

    await githubRequest(`/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Upload ${path}`,
        content,
        branch: state.config.branch,
      }),
    });

    activity.image = path;
    delete activity._file;
  }
}

function stripPrivateFields(content) {
  const cloned = JSON.parse(JSON.stringify(content));
  cloned.activities = cloned.activities.map(({ _file, ...activity }) => activity);
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

function normalizeContent(content) {
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

  if (!Array.isArray(next.site.sns)) next.site.sns = [];
  if (!Array.isArray(next.site.addressLines)) next.site.addressLines = [];
  if (!Array.isArray(next.home.titleLines)) next.home.titleLines = [];
  if (!Array.isArray(next.home.visualWords)) next.home.visualWords = [];

  return next;
}

function makeSafeFileName(name) {
  const now = Date.now();
  const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase().replace(/[^a-z0-9.]/g, "") : ".jpg";
  const baseName = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${now}-${baseName || "image"}${extension}`;
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
