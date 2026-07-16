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
  contactItems: () => ({ title: "", main: "", sub: "", icon: "phone" }),
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

const sectionLabels = {
  home: "홈",
  notices: "공지사항",
  activities: "활동",
  resources: "자료실",
  contactItems: "문의",
  admins: "관리자 승인",
  site: "사이트 설정",
  aboutItems: "조합소개",
};

const state = {
  content: null,
  currentUser: null,
  adminUsers: { users: [], requests: [] },
  connected: false,
  dirty: false,
  activeSection: "home",
  highlightedCollection: "",
  saveResetTimer: null,
};

const editor = document.querySelector("#editor");
const saveButton = document.querySelector("#save-button");
const logoutButton = document.querySelector("#logout-button");
const statusMessage = document.querySelector("#status-message");
const adminTitle = document.querySelector("#admin-title");
const adminUserLine = document.querySelector("#admin-user-line");

function init() {
  document.querySelectorAll("[data-admin-section]").forEach((button) => {
    button.addEventListener("click", () => setActiveSection(button.dataset.adminSection));
  });
  saveButton.addEventListener("click", handleSave);
  logoutButton.addEventListener("click", handleLogout);
  editor.addEventListener("click", handleEditorClick);
  editor.addEventListener("input", markDirty);
  editor.addEventListener("input", handleImagePreviewInput);
  editor.addEventListener("change", markDirty);
  editor.addEventListener("change", handleImagePreviewChange);

  bootstrap();
}

async function bootstrap() {
  try {
    const session = await apiRequest("/.netlify/functions/admin-session");
    state.currentUser = session.user;
    state.connected = true;
    adminUserLine.textContent = `${session.user.name || session.user.email} 계정으로 로그인했습니다.`;

    const [contentPayload, usersPayload] = await Promise.all([
      apiRequest("/.netlify/functions/admin-content"),
      apiRequest("/.netlify/functions/admin-users"),
    ]);

    state.content = normalizeContent(contentPayload.content);
    state.adminUsers = usersPayload;
    renderEditor();
    setSaveButtonState("idle");
    setStatus("콘텐츠를 불러왔습니다.", "success");
  } catch (error) {
    window.location.href = `/login.html?next=${encodeURIComponent("/admin/")}`;
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(payload.error || "요청 처리에 실패했습니다.");
  return payload;
}

function renderEditor() {
  if (!state.content) {
    editor.innerHTML = `<p class="empty-editor">콘텐츠를 불러오는 중입니다.</p>`;
    return;
  }

  const content = normalizeContent(state.content);
  state.content = content;

  editor.innerHTML = `
    <form class="editor-form" id="content-form">
      ${renderAdminUsersSection()}
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
  applyActiveSection();
}

function renderAdminUsersSection() {
  const requests = state.adminUsers.requests || [];
  const users = state.adminUsers.users || [];

  return `
    <section class="editor-section" data-editor-section="admins">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">관리자 가입 요청</h3>
          <p>승인된 사람만 관리자 로그인과 게시물 수정이 가능합니다.</p>
        </div>
      </div>
      <div class="admin-request-list">
        ${
          requests.length
            ? requests.map(renderAdminRequest).join("")
            : `<p class="empty-editor">승인 대기 중인 요청이 없습니다.</p>`
        }
      </div>
      <div class="section-heading section-heading--sub">
        <div>
          <h3 class="admin-section-title">승인된 관리자</h3>
          <p>관리자 계정만 표시됩니다. 일반 회원 기능은 없습니다.</p>
        </div>
      </div>
      <div class="admin-user-list">
        ${users.map(renderApprovedAdmin).join("") || `<p class="empty-editor">승인된 관리자가 없습니다.</p>`}
      </div>
    </section>
  `;
}

function renderAdminRequest(request) {
  return `
    <article class="admin-request-card">
      <div>
        <strong>${escapeHtml(request.name || request.email)}</strong>
        <span>${escapeHtml(request.email)}</span>
        <small>${formatDateTime(request.requestedAt)} 요청</small>
      </div>
      <div class="item-actions">
        <button class="secondary-button" type="button" data-admin-action="approve" data-request-id="${escapeHtml(request.id)}">승인</button>
        <button class="danger-button" type="button" data-admin-action="reject" data-request-id="${escapeHtml(request.id)}">거절</button>
      </div>
    </article>
  `;
}

function renderApprovedAdmin(user) {
  return `
    <article class="admin-user-card">
      <strong>${escapeHtml(user.name || user.email)}</strong>
      <span>${escapeHtml(user.email)}</span>
      <small>${escapeHtml(user.role || "admin")}${user.source === "env" ? " · 초기 관리자" : ""}</small>
    </article>
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

  if (kind === "resource") fields.push({ name: "icon", label: "아이콘", type: "select" });
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
    <section class="editor-section" data-editor-section="site">
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
    <section class="editor-section" data-editor-section="home">
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
  const sectionAttribute = nested ? "" : ` data-editor-section="${key}"`;

  return `
    <section class="${nested ? "nested-section" : "editor-section"}" data-wrapper="${key}"${sectionAttribute}>
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
        <input id="${fieldId}" data-field="${escapeHtml(field.name)}" data-image-source="true" value="${escapeHtml(value)}" placeholder="assets/images/uploads/example.jpg" />
        <input type="file" accept="image/*" data-upload-field="${escapeHtml(field.name)}" data-upload-kind="image" />
        ${renderImagePreview(value)}
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

function renderImagePreview(value) {
  const src = String(value || "").trim();
  const hasImage = Boolean(src);

  return `
    <div class="image-preview${hasImage ? " has-image" : ""}" data-image-preview>
      <img src="${escapeHtml(src)}" alt="선택한 이미지 미리보기"${hasImage ? "" : " hidden"} />
      <span${hasImage ? " hidden" : ""}>이미지를 선택하면 미리보기가 표시됩니다.</span>
    </div>
  `;
}

async function handleSave() {
  if (!state.connected) {
    window.location.href = "/login.html";
    return;
  }

  setSaveButtonState("saving");
  setStatus("변경 사항을 저장하는 중입니다...");

  try {
    state.content = readContentFromForm();
    await prepareManagedUploads(state.content);
    const payload = await apiRequest("/.netlify/functions/admin-content", {
      method: "PUT",
      body: JSON.stringify({ content: state.content }),
    });

    state.content = normalizeContent(payload.content);
    state.dirty = false;
    renderEditor();
    setSaveButtonState("success");
    setStatus("저장되었습니다. 잠시 후 사이트에 자동 반영됩니다.", "success");
    showToast("변경사항이 저장되었습니다.", "success");
  } catch (error) {
    setSaveButtonState("error");
    setStatus(error.message, "error");
    showToast("저장 중 오류가 발생했습니다.", "error");
  }
}

async function handleLogout() {
  await fetch("/.netlify/functions/admin-logout", { method: "POST", credentials: "same-origin" });
  window.location.href = "/login.html";
}

async function handleEditorClick(event) {
  const adminButton = event.target.closest("[data-admin-action]");
  if (adminButton) {
    await handleAdminRequestAction(adminButton);
    return;
  }

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

  if (action === "add") focusNewItem(collection);
}

async function handleAdminRequestAction(button) {
  button.disabled = true;
  const action = button.dataset.adminAction;
  const id = button.dataset.requestId;

  try {
    state.adminUsers = await apiRequest("/.netlify/functions/admin-users", {
      method: "POST",
      body: JSON.stringify({ action, id }),
    });
    renderEditor();
    setStatus(action === "approve" ? "관리자 요청을 승인했습니다." : "관리자 요청을 거절했습니다.", "success");
  } catch (error) {
    setStatus(error.message, "error");
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

  return normalizeContent(
    {
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
    },
    { sortPosts }
  );
}

function getSectionValue(form, section, field) {
  return form.querySelector(`[data-section="${section}"] [data-field="${field}"]`)?.value.trim() || "";
}

function readCollection(collection, fields) {
  const normalizedFields = fields.map((field) => (typeof field === "string" ? { name: field } : field));

  return [...document.querySelectorAll(`.admin-item[data-collection="${collection}"]`)].map((item, index) => {
    const nextItem = {};
    const originalItem = collection === "sns" ? state.content?.site?.sns?.[index] || {} : state.content?.[collection]?.[index] || {};

    normalizedFields.forEach((field) => {
      nextItem[field.name] = item.querySelector(`[data-field="${field.name}"]`)?.value.trim() || "";
    });

    if ("id" in nextItem && !nextItem.id) nextItem.id = createPostId(collection, index);

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

async function prepareManagedUploads(content) {
  for (const collection of ["notices", "activities", "resources"]) {
    for (const item of content[collection] || []) {
      if (!item._uploads) continue;

      for (const upload of Object.values(item._uploads)) {
        upload.name = upload.file.name;
        upload.content = await fileToBase64(upload.file);
        delete upload.file;
      }
    }
  }
}

function setActiveSection(section) {
  if (!sectionLabels[section]) return;
  state.activeSection = section;
  applyActiveSection();
}

function applyActiveSection() {
  adminTitle.textContent = sectionLabels[state.activeSection] || "관리자";
  document.querySelectorAll("[data-admin-section]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adminSection === state.activeSection);
  });
  document.querySelectorAll("[data-editor-section]").forEach((section) => {
    section.hidden = section.dataset.editorSection !== state.activeSection;
  });
}

function normalizeContent(content, options = {}) {
  const { sortPosts = true } = options;
  const base = {
    site: { name: "", description: "", officeName: "", addressLines: [], phone: "", email: "", copyright: "", sns: [] },
    home: { titleLines: [], subtitle: "", copy: "", visualWords: [] },
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
    _uploads: item._uploads,
  };
}

function sortPostsByLatest(posts) {
  return [...posts].sort((a, b) => getPostTime(b) - getPostTime(a) || String(b.id || "").localeCompare(String(a.id || "")));
}

function getPostTime(post) {
  return getDateTime(post.createdAt || post.created_at || post.date || post.timestamp) || getIdTime(post.id);
}

function getDateTime(value) {
  if (!value) return 0;
  const text = String(value).trim();
  const normalized = text.replace(/[./]/g, "-");
  const dateOnly = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime();
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

function handleImagePreviewInput(event) {
  const input = event.target.closest("[data-image-source='true']");
  if (input) updateImagePreview(input);
}

function handleImagePreviewChange(event) {
  const uploadInput = event.target.closest("[data-upload-kind='image']");
  const imageInput = event.target.closest("[data-image-source='true']");

  if (uploadInput) {
    updateImagePreview(uploadInput);
    return;
  }
  if (imageInput) updateImagePreview(imageInput);
}

function updateImagePreview(control) {
  const field = control.closest(".wide-field");
  const preview = field?.querySelector("[data-image-preview]");
  if (!preview) return;

  if (control.matches("[data-upload-kind='image']") && control.files[0]) {
    setImagePreview(preview, URL.createObjectURL(control.files[0]));
    return;
  }

  const source = field.querySelector("[data-image-source='true']");
  setImagePreview(preview, source?.value.trim() || "");
}

function setImagePreview(preview, src) {
  const image = preview.querySelector("img");
  const placeholder = preview.querySelector("span");

  if (preview.dataset.objectUrl) {
    URL.revokeObjectURL(preview.dataset.objectUrl);
    delete preview.dataset.objectUrl;
  }
  if (src && src.startsWith("blob:")) preview.dataset.objectUrl = src;

  if (!src) {
    image.hidden = true;
    image.removeAttribute("src");
    placeholder.hidden = false;
    preview.classList.remove("has-image");
    return;
  }

  image.src = src;
  image.alt = "선택한 이미지 미리보기";
  image.hidden = false;
  placeholder.hidden = true;
  preview.classList.add("has-image");
}

function toLines(value) {
  return String(value || "").split("\n").map((line) => line.trim()).filter(Boolean);
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function nowIso() {
  return new Date().toISOString();
}

function todayText() {
  const today = new Date();
  return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
}

function createPostId(prefix = "post", index = "") {
  const suffix = index === "" ? Date.now() : `${Date.now()}-${index + 1}`;
  return `${prefix}-${suffix}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

function markDirty() {
  state.dirty = true;
}

function setSaveButtonState(status = "idle") {
  window.clearTimeout(state.saveResetTimer);
  saveButton.classList.remove("is-saving", "is-success", "is-error");
  saveButton.setAttribute("aria-busy", "false");

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
    if (state.highlightedCollection === collection) state.highlightedCollection = "";
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
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", type === "error");
  statusMessage.classList.toggle("is-success", type === "success");
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
