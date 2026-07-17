const POST_COLLECTIONS = ["posters", "notices", "activities", "resources"];
const PAGE_SIZE = 20;
const SAVE_RESET_DELAY = 1600;

const collectionMeta = {
  posters: {
    label: "포스터",
    title: "포스터 관리",
    singular: "포스터",
    description: "메인 화면과 포스터 탭에 노출되는 카드형 포스터를 관리합니다.",
    dateLabel: "게시일",
    newLabel: "새 포스터 작성",
    defaultCategory: "포스터",
    defaultAttachmentLabel: "자세히 보기",
    categoryOptions: ["포스터", "가입 안내", "권익 보호", "행사", "정책", "교육", "설문"],
  },
  notices: {
    label: "공지사항",
    title: "공지사항 관리",
    singular: "공지사항",
    description: "조합의 주요 일정, 회의 안내, 교섭 소식 등을 관리합니다.",
    dateLabel: "게시일",
    newLabel: "새 공지사항 작성",
    defaultCategory: "공지",
    defaultAttachmentLabel: "첨부 자료 보기",
    categoryOptions: ["공지", "일반", "행사", "교섭", "중요"],
  },
  activities: {
    label: "활동",
    title: "활동 관리",
    singular: "활동",
    description: "교섭, 캠페인, 교육 등 현장 활동 소식을 관리합니다.",
    dateLabel: "활동일",
    newLabel: "새 활동 작성",
    defaultCategory: "활동",
    defaultAttachmentLabel: "첨부 자료 보기",
    categoryOptions: ["활동", "교섭", "캠페인", "교육", "행사"],
  },
  resources: {
    label: "자료실",
    title: "자료실 관리",
    singular: "자료",
    description: "정책, 연구, 수업, 조합 운영 자료를 관리합니다.",
    dateLabel: "게시일",
    newLabel: "새 자료 작성",
    defaultCategory: "자료",
    defaultAttachmentLabel: "자료 보기",
    categoryOptions: ["자료", "정책", "연구", "교육", "조합"],
  },
};

const statusOptions = [
  ["published", "공개"],
  ["private", "비공개"],
  ["draft", "임시저장"],
];

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
  dashboard: "대시보드",
  posters: "포스터 관리",
  notices: "공지사항 관리",
  activities: "활동 관리",
  resources: "자료실 관리",
  contactItems: "문의 정보 관리",
  members: "회원 관리",
  admins: "관리자 계정",
  account: "계정 정보",
  password: "비밀번호 변경",
  home: "홈 화면 설정",
  site: "사이트 설정",
  aboutItems: "조합소개",
};

const blankItems = {
  posters: () => createBlankPost("posters"),
  notices: () => createBlankPost("notices"),
  activities: () => createBlankPost("activities"),
  resources: () => createBlankPost("resources"),
  aboutItems: () => ({ title: "", description: "", icon: "document" }),
  contactItems: () => ({ title: "", main: "", sub: "", icon: "phone" }),
  sns: () => ({ label: "", url: "#" }),
};

const state = {
  content: null,
  currentUser: null,
  adminUsers: { users: [] },
  members: { members: [] },
  connected: false,
  dirty: false,
  activeSection: "dashboard",
  editing: null,
  listState: {},
  saveResetTimer: null,
};

POST_COLLECTIONS.forEach((collection) => {
  state.listState[collection] = {
    query: "",
    category: "all",
    status: "all",
    sort: "latest",
    page: 1,
    pageSize: PAGE_SIZE,
    selected: new Set(),
  };
});

const editor = document.querySelector("#editor");
const saveButton = document.querySelector("#save-button");
const logoutButton = document.querySelector("#logout-button");
const statusMessage = document.querySelector("#status-message");
const adminTitle = document.querySelector("#admin-title");
const adminUserLine = document.querySelector("#admin-user-line");
const csrfToken = document.querySelector("meta[name='csrf-token']")?.content || "";

function init() {
  document.querySelectorAll("[data-admin-section]").forEach((button) => {
    button.addEventListener("click", () => setActiveSection(button.dataset.adminSection));
  });
  saveButton.addEventListener("click", handlePrimarySave);
  logoutButton.addEventListener("click", handleLogout);
  editor.addEventListener("click", handleEditorClick);
  editor.addEventListener("submit", handleEditorSubmit);
  editor.addEventListener("input", handleEditorInput);
  editor.addEventListener("change", handleEditorChange);
  window.addEventListener("popstate", () => applyRouteFromHash(true));
  window.addEventListener("hashchange", () => applyRouteFromHash(true));

  bootstrap();
}

async function bootstrap() {
  try {
    const session = await apiRequest("/api/session.php");
    state.currentUser = session.user;
    state.connected = true;
    adminUserLine.textContent = `${session.user.name || session.user.email} 계정으로 로그인했습니다.`;

    const [contentPayload, usersPayload, membersPayload] = await Promise.all([
      apiRequest("/api/content.php"),
      apiRequest("/api/users.php"),
      apiRequest("/api/members.php"),
    ]);

    state.content = normalizeContent(contentPayload.content);
    state.adminUsers = usersPayload;
    state.members = membersPayload;
    applyRouteFromHash(false);
    if (state.currentUser.forcePasswordChange) {
      state.activeSection = "password";
      state.editing = null;
      updateAdminRoute("password");
    }
    renderEditor();
    setStatus(
      state.currentUser.forcePasswordChange
        ? "보안을 위해 최초 로그인 후 비밀번호를 먼저 변경해 주세요."
        : "콘텐츠를 불러왔습니다.",
      state.currentUser.forcePasswordChange ? "error" : "success",
    );
  } catch (error) {
    window.location.href = `/admin/login.php?next=${encodeURIComponent("/admin/dashboard.php")}`;
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.method && options.method !== "GET" && csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
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

  state.content = normalizeContent(state.content);
  syncTopbar();

  if (state.editing) {
    editor.innerHTML = renderPostEditor();
    initRichTextEditors();
    return;
  }

  if (POST_COLLECTIONS.includes(state.activeSection)) {
    editor.innerHTML = renderPostManager(state.activeSection);
    return;
  }

  if (state.activeSection === "dashboard") {
    editor.innerHTML = renderDashboard();
    return;
  }

  if (state.activeSection === "admins") {
    editor.innerHTML = renderAdminUsersSection();
    return;
  }

  if (state.activeSection === "members") {
    editor.innerHTML = renderMembersSection();
    return;
  }

  if (state.activeSection === "account") {
    editor.innerHTML = renderAccountSection();
    return;
  }

  if (state.activeSection === "password") {
    editor.innerHTML = renderPasswordSection();
    return;
  }

  editor.innerHTML = `
    <form class="editor-form admin-settings-form" id="settings-form">
      ${renderSettingsSection(state.activeSection)}
    </form>
  `;
}

function syncTopbar() {
  const title = state.editing
    ? state.editing.isNew
      ? `${collectionMeta[state.editing.collection].singular} 작성`
      : `${collectionMeta[state.editing.collection].singular} 수정`
    : sectionLabels[state.activeSection] || "관리자";

  adminTitle.textContent = title;
  document.querySelectorAll("[data-admin-section]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adminSection === state.activeSection);
  });

  const canSave = Boolean(state.editing) || ["home", "site", "aboutItems", "contactItems"].includes(state.activeSection);
  saveButton.disabled = !state.connected || !canSave;
  saveButton.hidden = !canSave;
  saveButton.textContent = state.editing ? (state.editing.isNew ? "게시물 저장" : "수정 저장") : "저장하고 게시";
}

function renderDashboard() {
  const contentCards = POST_COLLECTIONS.map((collection) => {
    const posts = getPosts(collection);
    const published = posts.filter((post) => post.status === "published").length;

    return `
      <article class="admin-stat-card">
        <span>${collectionMeta[collection].label}</span>
        <strong>${posts.length}</strong>
        <small>공개 ${published}개</small>
        <button class="ghost-button" type="button" data-action="section" data-section-target="${collection}">관리하기</button>
      </article>
    `;
  }).join("");
  const members = state.members.members || [];
  const pendingMembers = members.filter((member) => member.status === "pending").length;
  const cards = `${contentCards}
    <article class="admin-stat-card">
      <span>회원</span>
      <strong>${members.length}</strong>
      <small>승인 대기 ${pendingMembers}명</small>
      <button class="ghost-button" type="button" data-action="section" data-section-target="members">관리하기</button>
    </article>
  `;
  const recentPosts = POST_COLLECTIONS.flatMap((collection) => getPosts(collection).map((post) => ({ ...post, collection })))
    .sort((a, b) => getPostTime(b) - getPostTime(a))
    .slice(0, 8);

  return `
    <section class="admin-dashboard">
      <div class="admin-stat-grid">${cards}</div>
      <section class="admin-table-shell">
        <div class="admin-table-header">
          <div>
            <h2>최근 게시물</h2>
            <p>포스터, 공지사항, 활동, 자료실의 최근 변경 항목입니다.</p>
          </div>
        </div>
        <div class="admin-recent-list">
          ${recentPosts.map((post) => renderRecentPost(post)).join("") || `<p class="empty-editor">등록된 게시물이 없습니다.</p>`}
        </div>
      </section>
    </section>
  `;
}

function renderRecentPost(post) {
  return `
    <button class="admin-recent-item" type="button" data-action="edit-post" data-collection="${post.collection}" data-id="${escapeHtml(post.id)}">
      <span>${escapeHtml(collectionMeta[post.collection].label)}</span>
      <strong>${escapeHtml(post.title || "제목 없음")}</strong>
      <time>${escapeHtml(post.date || "-")}</time>
    </button>
  `;
}

function renderPostManager(collection) {
  const meta = collectionMeta[collection];
  const posts = getPosts(collection);
  const view = getListView(collection);
  const totalPages = Math.max(1, Math.ceil(view.filtered.length / view.pageSize));

  if (view.state.page > totalPages) {
    view.state.page = totalPages;
    view.page = totalPages;
    view.items = paginate(view.filtered, view.page, view.pageSize);
  }

  return `
    <section class="admin-post-manager" data-manager="${collection}">
      <header class="admin-page-heading">
        <div>
          <p class="eyebrow">Content</p>
          <h2>${escapeHtml(meta.title)}</h2>
          <p>${escapeHtml(meta.description)}</p>
          <strong>총 ${posts.length}개의 게시물</strong>
        </div>
        <button class="primary-button" type="button" data-action="new-post" data-collection="${collection}">+ ${escapeHtml(meta.newLabel)}</button>
      </header>

      <form class="admin-list-toolbar" data-toolbar="${collection}">
        <label class="admin-search-field">
          <span class="sr-only">게시물 검색</span>
          <input name="query" value="${escapeHtml(view.state.query)}" placeholder="제목, 내용으로 검색" />
        </label>
        <label>
          <span class="sr-only">카테고리</span>
          <select name="category">${renderOptions([["all", "카테고리 전체"], ...getCategoryOptions(collection).map((item) => [item, item])], view.state.category)}</select>
        </label>
        <label>
          <span class="sr-only">상태</span>
          <select name="status">${renderOptions([["all", "상태 전체"], ...statusOptions], view.state.status)}</select>
        </label>
        <label>
          <span class="sr-only">정렬</span>
          <select name="sort">${renderOptions([["latest", "최신순"], ["oldest", "오래된순"], ["title", "제목순"]], view.state.sort)}</select>
        </label>
        <label>
          <span class="sr-only">페이지당 표시 수</span>
          <select name="pageSize">${renderOptions([["20", "20개"], ["50", "50개"], ["100", "100개"]], String(view.state.pageSize))}</select>
        </label>
        <button class="secondary-button" type="submit">검색</button>
        <button class="ghost-button" type="button" data-action="reset-list" data-collection="${collection}">초기화</button>
      </form>

      <div class="admin-list-result">
        ${view.state.query ? `‘${escapeHtml(view.state.query)}’ 검색 결과 ${view.filtered.length}건` : `전체 ${view.filtered.length}건`}
      </div>

      ${renderBulkBar(collection, view)}

      <div class="admin-table-shell">
        <table class="admin-post-table">
          <thead>
            <tr>
              <th scope="col"><input type="checkbox" data-action="select-page" data-collection="${collection}" ${view.items.length && view.items.every((post) => view.state.selected.has(post.id)) ? "checked" : ""} aria-label="현재 페이지 게시물 전체 선택" /></th>
              <th scope="col">번호</th>
              <th scope="col">제목</th>
              <th scope="col">카테고리</th>
              <th scope="col">상태</th>
              <th scope="col">${escapeHtml(meta.dateLabel)}</th>
              <th scope="col">수정일</th>
              <th scope="col">조회수</th>
              <th scope="col">관리</th>
            </tr>
          </thead>
          <tbody>
            ${view.items.map((post, index) => renderPostRow(collection, post, view, index)).join("") || renderPostEmptyRow()}
          </tbody>
        </table>
      </div>
      ${renderPagination(view.page, totalPages, "admin", collection)}
    </section>
  `;
}

function renderBulkBar(collection, view) {
  const count = view.state.selected.size;
  if (!count) return "";

  return `
    <div class="admin-bulk-bar">
      <strong>${count}개 선택됨</strong>
      <button class="secondary-button" type="button" data-action="bulk-status" data-status="published" data-collection="${collection}">공개로 변경</button>
      <button class="secondary-button" type="button" data-action="bulk-status" data-status="private" data-collection="${collection}">비공개로 변경</button>
      <button class="danger-button" type="button" data-action="bulk-delete" data-collection="${collection}">삭제</button>
    </div>
  `;
}

function renderPostRow(collection, post, view, index) {
  const absoluteNumber = view.filtered.length - ((view.page - 1) * view.pageSize + index);
  const summary = post.summary || post.body || "";

  return `
    <tr>
      <td data-label="선택"><input type="checkbox" data-action="select-post" data-collection="${collection}" data-id="${escapeHtml(post.id)}" ${view.state.selected.has(post.id) ? "checked" : ""} aria-label="${escapeHtml(post.title)} 선택" /></td>
      <td data-label="번호">${absoluteNumber}</td>
      <td data-label="제목">
        <div class="admin-post-title" title="${escapeHtml(post.title)}">
          <strong>${escapeHtml(post.title || "제목 없음")}</strong>
          <span>${escapeHtml(summary || "요약 없음")}</span>
        </div>
      </td>
      <td data-label="카테고리">${escapeHtml(post.category || collectionMeta[collection].defaultCategory)}</td>
      <td data-label="상태"><span class="status-pill status-pill--${escapeHtml(post.status)}">${escapeHtml(getStatusLabel(post.status))}</span></td>
      <td data-label="${escapeHtml(collectionMeta[collection].dateLabel)}">${escapeHtml(post.date || "-")}</td>
      <td data-label="수정일">${escapeHtml(formatDate(post.updatedAt || post.updated_at))}</td>
      <td data-label="조회수">${Number(post.views || 0).toLocaleString("ko-KR")}</td>
      <td data-label="관리">
        <div class="table-actions">
          <a class="ghost-button" href="../${getPostUrl(collection, post)}" target="_blank" rel="noreferrer">보기</a>
          <button class="secondary-button" type="button" data-action="edit-post" data-collection="${collection}" data-id="${escapeHtml(post.id)}">수정</button>
          <button class="danger-button" type="button" data-action="delete-post" data-collection="${collection}" data-id="${escapeHtml(post.id)}">삭제</button>
        </div>
      </td>
    </tr>
  `;
}

function renderPostEmptyRow() {
  return `<tr><td colspan="9"><p class="empty-editor">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p></td></tr>`;
}

function renderPostEditor() {
  const { collection, isNew } = state.editing;
  const meta = collectionMeta[collection];
  const post = state.editing.draft;
  const imageLabel = collection === "posters"
    ? "포스터 이미지"
    : collection === "activities"
      ? "대표 이미지/활동 사진"
      : "대표 이미지";
  const attachmentLabelText = collection === "resources"
    ? "자료 버튼 문구"
    : collection === "posters"
      ? "연결 버튼 문구"
      : "첨부 버튼 문구";
  const attachmentUrlText = collection === "resources"
    ? "자료 파일 또는 링크"
    : collection === "posters"
      ? "클릭 시 연결할 링크 또는 파일"
      : "첨부 파일 또는 링크";

  return `
    <section class="admin-edit-screen">
      <div class="admin-edit-header">
        <button class="ghost-button" type="button" data-action="back-to-list" data-collection="${collection}">← 목록으로</button>
        <div>
          <p class="eyebrow">${escapeHtml(meta.label)}</p>
          <h2>${isNew ? `${meta.singular} 작성` : `${meta.singular} 수정`}</h2>
        </div>
      </div>
      <form class="post-editor-form" id="post-editor-form" data-collection="${collection}">
        <div class="editor-section">
          <div class="field-grid">
            ${renderField({ name: "title", label: "제목 *" }, post)}
            ${renderField({ name: "date", label: `${meta.dateLabel} *`, placeholder: "2026.07.15" }, post)}
            ${renderField({ name: "category", label: "카테고리", type: "select", options: meta.categoryOptions.map((item) => [item, item]) }, post)}
            ${renderField({ name: "status", label: "상태", type: "select", options: statusOptions }, post)}
            ${collection === "notices" ? renderField({ name: "pinned", label: "상단 고정", type: "checkbox" }, post) : ""}
            ${collection === "notices" ? renderField({ name: "important", label: "중요 공지", type: "checkbox" }, post) : ""}
            ${renderField({ name: "summary", label: "요약", type: "textarea" }, post)}
            ${renderField({ name: "body", label: "본문", type: "textarea" }, post)}
            ${renderField({ name: "image", label: imageLabel, type: "image" }, post)}
            ${collection !== "activities" ? renderField({ name: "attachmentLabel", label: attachmentLabelText }, post) : ""}
            ${collection !== "activities" ? renderField({ name: "attachmentUrl", label: attachmentUrlText, type: "file" }, post) : ""}
            ${collection === "resources" ? renderField({ name: "icon", label: "아이콘", type: "select", options: iconOptions }, post) : ""}
          </div>
        </div>
        <div class="admin-edit-actions">
          <button class="primary-button" type="submit">${isNew ? "게시물 저장" : "수정 저장"}</button>
          <button class="secondary-button" type="button" data-action="save-draft">임시저장</button>
          <button class="ghost-button" type="button" data-action="back-to-list" data-collection="${collection}">취소</button>
        </div>
      </form>
    </section>
  `;
}

function renderSettingsSection(section) {
  const content = state.content;

  if (section === "home") return renderHomeSection(content);
  if (section === "site") return renderSiteSection(content);
  if (section === "aboutItems") {
    return renderCollectionSection("aboutItems", "조합소개", "소개 카드 내용을 수정합니다.", content.aboutItems, [
      { name: "title", label: "제목" },
      { name: "description", label: "설명", type: "textarea" },
      { name: "icon", label: "아이콘", type: "select", options: iconOptions },
    ]);
  }
  if (section === "contactItems") {
    return renderCollectionSection("contactItems", "문의 정보", "전화, 이메일, 방문 안내와 지도 좌표를 수정합니다.", content.contactItems, [
      { name: "title", label: "제목" },
      { name: "main", label: "주요 내용" },
      { name: "sub", label: "보조 내용 / 운영시간" },
      { name: "icon", label: "아이콘", type: "select", options: iconOptions },
      { name: "mapProvider", label: "지도 제공자", placeholder: "kakao 또는 google" },
      { name: "mapLat", label: "위도" },
      { name: "mapLng", label: "경도" },
    ]);
  }
  return "";
}

function renderSiteSection(content) {
  const site = content.site;

  return `
    <section class="editor-section" data-settings-section="site">
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
        { name: "url", label: "주소", placeholder: "#" },
      ], true)}
    </section>
  `;
}

function renderHomeSection(content) {
  const home = content.home;

  return `
    <section class="editor-section" data-settings-section="home">
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

function renderAdminUsersSection() {
  const users = state.adminUsers.users || [];

  return `
    <section class="editor-section">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">관리자 계정</h3>
          <p>관리자만 새 계정을 추가하고 수정할 수 있습니다. 최고관리자는 삭제할 수 없습니다.</p>
        </div>
      </div>
      <form class="admin-user-create" id="admin-user-create-form">
        <div>
          <h4>관리자 추가</h4>
          <p>새 관리자에게 임시 비밀번호를 발급합니다. 첫 로그인 후 비밀번호 변경이 요구됩니다.</p>
        </div>
        <div class="field-grid">
          <label>
            <span>이메일</span>
            <input name="email" type="email" autocomplete="off" required />
          </label>
          <label>
            <span>이름</span>
            <input name="name" autocomplete="off" />
          </label>
          <label>
            <span>임시 비밀번호</span>
            <input name="password" type="password" autocomplete="new-password" minlength="8" required />
          </label>
          <label>
            <span>권한</span>
            <select name="role">
              ${renderOptions([["admin", "관리자"], ["owner", "최고관리자"]], "admin")}
            </select>
          </label>
        </div>
        <button class="primary-button" type="submit">관리자 추가</button>
      </form>
      <div class="admin-user-list">
        ${users.map(renderApprovedAdmin).join("") || `<p class="empty-editor">등록된 관리자가 없습니다.</p>`}
      </div>
    </section>
  `;
}

function renderApprovedAdmin(user) {
  const isOwner = user.role === "owner";
  const isSelf = String(user.id) === String(state.currentUser?.id);

  return `
    <form class="admin-user-card admin-user-edit-form" data-user-id="${escapeHtml(user.id)}">
      <div class="admin-user-card__summary">
        <strong>${escapeHtml(user.name || user.email)}</strong>
        <span>${escapeHtml(user.email)}</span>
        <small>${isOwner ? "최고관리자" : "관리자"}${isSelf ? " · 현재 로그인" : ""}${user.forcePasswordChange ? " · 비밀번호 변경 필요" : ""}</small>
      </div>
      <div class="admin-user-card__fields">
        <label>
          <span>이메일</span>
          <input name="email" type="email" value="${escapeHtml(user.email)}" required />
        </label>
        <label>
          <span>이름</span>
          <input name="name" value="${escapeHtml(user.name || "")}" required />
        </label>
        <label>
          <span>권한</span>
          <select name="role" ${isOwner ? "disabled" : ""}>
            ${renderOptions([["admin", "관리자"], ["owner", "최고관리자"]], user.role || "admin")}
          </select>
        </label>
        <label>
          <span>새 비밀번호</span>
          <input name="password" type="password" autocomplete="new-password" placeholder="변경 시에만 입력" />
        </label>
        <label class="checkbox-field admin-user-checkbox">
          <input name="forcePasswordChange" type="checkbox" ${user.forcePasswordChange ? "checked" : ""} />
          <span>다음 로그인 시 비밀번호 변경 요구</span>
        </label>
      </div>
      <div class="admin-user-card__actions">
        <button class="secondary-button" type="submit">수정 저장</button>
        <button class="danger-button" type="button" data-action="delete-admin-user" data-user-id="${escapeHtml(user.id)}" ${isOwner || isSelf ? "disabled" : ""}>삭제</button>
      </div>
    </form>
  `;
}

function renderMembersSection() {
  const members = state.members.members || [];
  const pending = members.filter((member) => member.status === "pending").length;
  const approved = members.filter((member) => member.status === "approved").length;

  return `
    <section class="editor-section">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">회원 관리</h3>
          <p>가입 신청을 승인하면 해당 회원이 로그인하고 마이페이지를 사용할 수 있습니다.</p>
        </div>
      </div>
      <div class="admin-member-summary">
        <span>전체 ${members.length}명</span>
        <span>승인 대기 ${pending}명</span>
        <span>승인 완료 ${approved}명</span>
      </div>
      <div class="admin-user-list admin-member-list">
        ${members.map(renderMemberCard).join("") || `<p class="empty-editor">가입 신청된 회원이 없습니다.</p>`}
      </div>
    </section>
  `;
}

function renderMemberCard(member) {
  const status = member.status || "pending";

  return `
    <form class="admin-user-card admin-member-card member-admin-form" data-member-id="${escapeHtml(member.id)}">
      <div class="admin-user-card__summary">
        <strong>${escapeHtml(member.name || member.email)}</strong>
        <span>${escapeHtml(member.email)}</span>
        <small>
          <span class="status-pill status-pill--${escapeHtml(status)}">${escapeHtml(getMemberStatusLabel(status))}</span>
          가입 ${escapeHtml(formatDate(member.createdAt))}
        </small>
      </div>
      <div class="admin-user-card__fields">
        <label>
          <span>상태</span>
          <select name="status">
            ${renderOptions([
              ["pending", "승인 대기"],
              ["approved", "승인 완료"],
              ["rejected", "거절"],
              ["suspended", "이용 중지"],
            ], status)}
          </select>
        </label>
        <label>
          <span>소속</span>
          <input value="${escapeHtml(member.organization || "-")}" readonly />
        </label>
        <label>
          <span>연락처</span>
          <input value="${escapeHtml(member.phone || "-")}" readonly />
        </label>
        <label>
          <span>최근 로그인</span>
          <input value="${escapeHtml(formatDate(member.lastLoginAt) || "-")}" readonly />
        </label>
        <label class="wide-field">
          <span>관리 메모</span>
          <textarea name="memo" placeholder="승인 사유, 확인 메모 등을 남길 수 있습니다.">${escapeHtml(member.memo || "")}</textarea>
        </label>
      </div>
      <div class="admin-user-card__actions">
        ${status === "pending" ? `<button class="secondary-button" type="button" data-action="quick-member-status" data-member-id="${escapeHtml(member.id)}" data-status="approved">승인</button>` : ""}
        ${status === "pending" ? `<button class="danger-button" type="button" data-action="quick-member-status" data-member-id="${escapeHtml(member.id)}" data-status="rejected">거절</button>` : ""}
        <button class="primary-button" type="submit">상태 저장</button>
      </div>
    </form>
  `;
}

function getMemberStatusLabel(status) {
  return {
    pending: "승인 대기",
    approved: "승인 완료",
    rejected: "거절",
    suspended: "이용 중지",
  }[status] || "승인 대기";
}

function renderAccountSection() {
  const user = state.currentUser || {};

  return `
    <section class="editor-section">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">계정 정보</h3>
          <p>이메일과 이름을 변경해도 현재 로그인 세션은 유지됩니다.</p>
        </div>
      </div>
      <form class="account-form" id="account-form">
        <div class="field-grid">
          <label>
            <span>이메일</span>
            <input name="email" type="email" value="${escapeHtml(user.email || "")}" required />
          </label>
          <label>
            <span>이름</span>
            <input name="name" value="${escapeHtml(user.name || "")}" required />
          </label>
          <label class="wide-field">
            <span>프로필</span>
            <textarea name="profile" placeholder="관리자 메모나 역할 설명을 입력할 수 있습니다.">${escapeHtml(user.profile || "")}</textarea>
          </label>
        </div>
        <div class="admin-edit-actions">
          <button class="primary-button" type="submit">계정 정보 저장</button>
        </div>
      </form>
    </section>
  `;
}

function renderPasswordSection() {
  return `
    <section class="editor-section">
      <div class="section-heading">
        <div>
          <h3 class="admin-section-title">비밀번호 변경</h3>
          <p>${state.currentUser?.forcePasswordChange ? "최초 로그인 보안을 위해 새 비밀번호로 변경해 주세요." : "현재 비밀번호 확인 후 새 비밀번호를 저장합니다."}</p>
        </div>
      </div>
      <form class="account-form" id="password-form">
        <div class="field-grid">
          <label>
            <span>현재 비밀번호</span>
            <input name="currentPassword" type="password" autocomplete="current-password" required />
          </label>
          <label>
            <span>새 비밀번호</span>
            <input name="newPassword" type="password" autocomplete="new-password" minlength="8" required />
          </label>
          <label>
            <span>새 비밀번호 확인</span>
            <input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required />
          </label>
        </div>
        <div class="admin-edit-actions">
          <button class="primary-button" type="submit">비밀번호 변경</button>
        </div>
      </form>
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
        <button class="secondary-button" type="button" data-action="add-setting-item" data-collection="${key}">추가</button>
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
          <button class="ghost-button" type="button" data-action="move-setting" data-direction="up" data-collection="${key}" data-index="${index}">위로</button>
          <button class="ghost-button" type="button" data-action="move-setting" data-direction="down" data-collection="${key}" data-index="${index}">아래로</button>
          <button class="danger-button" type="button" data-action="delete-setting" data-collection="${key}" data-index="${index}">삭제</button>
        </div>
      </div>
      <div class="field-grid">
        ${fields.map((field) => renderField(field, item, key, index)).join("")}
      </div>
    </article>
  `;
}

function renderField(field, item, collectionKey = "", index = "") {
  const value = item[field.name] ?? "";
  const fieldId = `${collectionKey || "section"}-${field.name}-${index}`;
  const wideClass = ["textarea", "image", "file", "checkbox"].includes(field.type) ? "wide-field" : "";
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
    const options = field.options || iconOptions;
    return `
      <label for="${fieldId}">
        <span>${escapeHtml(field.label)}</span>
        <select id="${fieldId}" data-field="${escapeHtml(field.name)}">
          ${renderOptions(options, String(value))}
        </select>
      </label>
    `;
  }

  if (field.type === "checkbox") {
    return `
      <label class="checkbox-field" for="${fieldId}">
        <input id="${fieldId}" type="checkbox" data-field="${escapeHtml(field.name)}" ${value ? "checked" : ""} />
        <span>${escapeHtml(field.label)}</span>
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

function handleEditorSubmit(event) {
  event.preventDefault();

  const toolbar = event.target.closest("[data-toolbar]");
  if (toolbar) {
    applyListToolbar(toolbar);
    return;
  }

  const postForm = event.target.closest("#post-editor-form");
  if (postForm) {
    saveCurrentPost();
    return;
  }

  const createUserForm = event.target.closest("#admin-user-create-form");
  if (createUserForm) {
    createAdminUser(createUserForm);
    return;
  }

  const editUserForm = event.target.closest(".admin-user-edit-form");
  if (editUserForm) {
    updateAdminUser(editUserForm);
    return;
  }

  const memberForm = event.target.closest(".member-admin-form");
  if (memberForm) {
    updateMember(memberForm);
    return;
  }

  const accountForm = event.target.closest("#account-form");
  if (accountForm) {
    saveAccountProfile(accountForm);
    return;
  }

  const passwordForm = event.target.closest("#password-form");
  if (passwordForm) {
    changePassword(passwordForm);
  }
}

function handleEditorInput(event) {
  if (event.target.closest("[data-image-source='true']")) updateImagePreview(event.target);
  if (event.target.closest("#settings-form") || event.target.closest("#post-editor-form")) state.dirty = true;
}

function handleEditorChange(event) {
  const selectionInput = event.target.closest("[data-action='select-post'], [data-action='select-page']");
  if (selectionInput) {
    if (selectionInput.dataset.action === "select-post") togglePostSelection(selectionInput);
    if (selectionInput.dataset.action === "select-page") togglePageSelection(selectionInput);
    return;
  }

  const uploadInput = event.target.closest("[data-upload-kind='image']");
  if (uploadInput) updateImagePreview(uploadInput);
  if (event.target.closest("#settings-form") || event.target.closest("#post-editor-form")) state.dirty = true;
}

async function handleEditorClick(event) {
  const button = event.target.closest("button, a, [data-action]");
  if (!button) return;

  const action = button.dataset.action;

  if (!action) return;

  if (action === "section") setActiveSection(button.dataset.sectionTarget);
  if (action === "new-post") openPostEditor(button.dataset.collection);
  if (action === "edit-post") openPostEditor(button.dataset.collection, button.dataset.id);
  if (action === "back-to-list") closePostEditor();
  if (action === "delete-post") await deletePost(button.dataset.collection, button.dataset.id);
  if (action === "reset-list") resetList(button.dataset.collection);
  if (action === "bulk-status") await applyBulkStatus(button.dataset.collection, button.dataset.status);
  if (action === "bulk-delete") await bulkDelete(button.dataset.collection);
  if (action === "page") setListPage(button.dataset.collection, Number(button.dataset.page));
  if (action === "save-draft") saveCurrentPost("draft");
  if (action === "add-setting-item") addSettingItem(button.dataset.collection);
  if (action === "delete-setting") deleteSettingItem(button.dataset.collection, Number(button.dataset.index));
  if (action === "move-setting") moveSettingItem(button.dataset.collection, Number(button.dataset.index), button.dataset.direction);
  if (action === "delete-admin-user") await deleteAdminUser(button.dataset.userId);
  if (action === "quick-member-status") await quickUpdateMemberStatus(button.dataset.memberId, button.dataset.status);
}

async function handlePrimarySave() {
  if (state.editing) {
    await saveCurrentPost();
    return;
  }
  await saveCurrentSettings();
}

async function createAdminUser(form) {
  const data = new FormData(form);

  try {
    const payload = await apiRequest("/api/users.php", {
      method: "POST",
      body: JSON.stringify({
        email: data.get("email"),
        name: data.get("name"),
        password: data.get("password"),
        role: data.get("role"),
      }),
    });
    state.adminUsers.users = payload.users || [];
    form.reset();
    renderEditor();
    setStatus("관리자 계정을 추가했습니다.", "success");
    showToast("관리자 계정을 추가했습니다.", "success");
  } catch (error) {
    setStatus(error.message, "error");
    showToast(error.message, "error");
  }
}

async function updateAdminUser(form) {
  const data = new FormData(form);
  const roleSelect = form.querySelector("select[name='role']");

  try {
    const payload = await apiRequest("/api/users.php", {
      method: "PUT",
      body: JSON.stringify({
        id: form.dataset.userId,
        email: data.get("email"),
        name: data.get("name"),
        password: data.get("password"),
        role: roleSelect?.disabled ? "owner" : data.get("role"),
        forcePasswordChange: Boolean(data.get("forcePasswordChange")),
      }),
    });
    state.adminUsers.users = payload.users || [];
    if (payload.currentUser) state.currentUser = payload.currentUser;
    syncAdminUserLine();
    renderEditor();
    setStatus("관리자 계정을 수정했습니다.", "success");
    showToast("관리자 계정을 수정했습니다.", "success");
  } catch (error) {
    setStatus(error.message, "error");
    showToast(error.message, "error");
  }
}

async function deleteAdminUser(userId) {
  const user = (state.adminUsers.users || []).find((item) => String(item.id) === String(userId));
  if (!user) return;

  const ok = await confirmDialog(`"${user.name || user.email}" 관리자 계정을 삭제하시겠습니까?\n삭제된 계정은 로그인할 수 없습니다.`);
  if (!ok) return;

  try {
    const payload = await apiRequest("/api/users.php", {
      method: "DELETE",
      body: JSON.stringify({ id: userId }),
    });
    state.adminUsers.users = payload.users || [];
    renderEditor();
    setStatus("관리자 계정을 삭제했습니다.", "success");
    showToast("관리자 계정을 삭제했습니다.", "success");
  } catch (error) {
    setStatus(error.message, "error");
    showToast(error.message, "error");
  }
}

async function updateMember(form) {
  const data = new FormData(form);

  try {
    const payload = await apiRequest("/api/members.php", {
      method: "PUT",
      body: JSON.stringify({
        id: form.dataset.memberId,
        status: data.get("status"),
        memo: data.get("memo"),
      }),
    });
    state.members = payload;
    renderEditor();
    setStatus("회원 상태를 저장했습니다.", "success");
    showToast("회원 상태를 저장했습니다.", "success");
  } catch (error) {
    setStatus(error.message, "error");
    showToast(error.message, "error");
  }
}

async function quickUpdateMemberStatus(memberId, status) {
  const form = [...editor.querySelectorAll(".member-admin-form")]
    .find((item) => String(item.dataset.memberId) === String(memberId));
  if (!form) return;

  form.querySelector("select[name='status']").value = status;
  await updateMember(form);
}

async function saveAccountProfile(form) {
  const data = new FormData(form);

  try {
    const payload = await apiRequest("/api/account.php", {
      method: "PUT",
      body: JSON.stringify({
        action: "profile",
        email: data.get("email"),
        name: data.get("name"),
        profile: data.get("profile"),
      }),
    });
    state.currentUser = payload.user;
    await refreshAdminUsers();
    syncAdminUserLine();
    renderEditor();
    setStatus("계정 정보를 저장했습니다.", "success");
    showToast("계정 정보를 저장했습니다.", "success");
  } catch (error) {
    setStatus(error.message, "error");
    showToast(error.message, "error");
  }
}

async function changePassword(form) {
  const data = new FormData(form);

  try {
    const payload = await apiRequest("/api/account.php", {
      method: "PUT",
      body: JSON.stringify({
        action: "password",
        currentPassword: data.get("currentPassword"),
        newPassword: data.get("newPassword"),
        confirmPassword: data.get("confirmPassword"),
      }),
    });
    state.currentUser = payload.user;
    form.reset();
    await refreshAdminUsers();
    syncAdminUserLine();
    renderEditor();
    setStatus("비밀번호를 변경했습니다.", "success");
    showToast("비밀번호를 변경했습니다.", "success");
  } catch (error) {
    setStatus(error.message, "error");
    showToast(error.message, "error");
  }
}

async function refreshAdminUsers() {
  const payload = await apiRequest("/api/users.php");
  state.adminUsers = payload;
  if (payload.currentUser) state.currentUser = payload.currentUser;
}

async function refreshMembers() {
  state.members = await apiRequest("/api/members.php");
}

function syncAdminUserLine() {
  const user = state.currentUser || {};
  adminUserLine.textContent = `${user.name || user.email || "관리자"} 계정으로 로그인했습니다.`;
  document.querySelector(".admin-account-menu summary span")?.replaceChildren(document.createTextNode(user.name || user.email || "관리자"));
  document.querySelector(".admin-account-menu summary small")?.replaceChildren(document.createTextNode(user.role === "owner" ? "최고관리자" : "관리자"));
}

async function saveCurrentSettings() {
  try {
    readSettingsFromForm();
    await saveContent("저장되었습니다. 사이트에 자동 반영됩니다.");
  } catch (error) {
    setSaveButtonState("error");
    setStatus(error.message, "error");
  }
}

async function saveCurrentPost(forcedStatus = "") {
  const form = document.querySelector("#post-editor-form");
  if (!form || !state.editing) return;

  const collection = state.editing.collection;
  const post = readPostForm(form, collection);
  if (forcedStatus) post.status = forcedStatus;

  if (!post.title.trim()) {
    setStatus("제목을 입력해 주세요.", "error");
    form.querySelector("[data-field='title']")?.focus();
    return;
  }

  const previousContent = JSON.parse(JSON.stringify(state.content));
  const posts = getPosts(collection);
  const index = posts.findIndex((item) => item.id === state.editing.id);

  if (index >= 0) posts[index] = post;
  else posts.unshift(post);

  state.content[collection] = sortPostsByLatest(posts);
  state.listState[collection].selected.clear();

  try {
    await prepareManagedUploads(state.content);
    await saveContent(state.editing.isNew ? "게시물이 저장되었습니다." : "게시물이 수정되었습니다.");
    state.editing = null;
    state.activeSection = collection;
    updateAdminRoute(collection);
    renderEditor();
  } catch (error) {
    state.content = previousContent;
    setSaveButtonState("error");
    setStatus(error.message, "error");
    renderEditor();
  }
}

async function saveContent(message) {
  setSaveButtonState("saving");
  setStatus("변경 사항을 저장하는 중입니다...");

  const payload = await apiRequest("/api/content.php", {
    method: "PUT",
    body: JSON.stringify({ content: state.content }),
  });

  state.content = normalizeContent(payload.content);
  state.dirty = false;
  setSaveButtonState("success");
  setStatus(message, "success");
  showToast(message, "success");
}

function openPostEditor(collection, id = "") {
  const existing = id ? getPosts(collection).find((post) => post.id === id) : null;
  state.activeSection = collection;
  state.editing = {
    collection,
    id: existing?.id || "",
    isNew: !existing,
    draft: existing ? { ...existing } : blankItems[collection](),
  };
  updateAdminRoute(`${collection}-${id ? `edit-${encodeURIComponent(id)}` : "new"}`);
  renderEditor();
}

function closePostEditor() {
  const collection = state.editing?.collection || state.activeSection;
  state.editing = null;
  state.activeSection = collection;
  updateAdminRoute(collection);
  renderEditor();
}

async function deletePost(collection, id) {
  const post = getPosts(collection).find((item) => item.id === id);
  if (!post) return;
  const ok = await confirmDialog(`"${post.title}" 게시물을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`);
  if (!ok) return;

  const previousContent = JSON.parse(JSON.stringify(state.content));
  state.content[collection] = getPosts(collection).filter((item) => item.id !== id);
  state.listState[collection].selected.delete(id);

  try {
    await saveContent("게시물이 삭제되었습니다.");
    renderEditor();
  } catch (error) {
    state.content = previousContent;
    setStatus(error.message, "error");
    renderEditor();
  }
}

function togglePostSelection(input) {
  const listState = state.listState[input.dataset.collection];
  if (input.checked) listState.selected.add(input.dataset.id);
  else listState.selected.delete(input.dataset.id);
  renderEditor();
}

function togglePageSelection(input) {
  const collection = input.dataset.collection;
  const listState = state.listState[collection];
  const view = getListView(collection);
  view.items.forEach((post) => {
    if (input.checked) listState.selected.add(post.id);
    else listState.selected.delete(post.id);
  });
  renderEditor();
}

async function applyBulkStatus(collection, status) {
  const listState = state.listState[collection];
  if (!listState.selected.size) return;

  getPosts(collection).forEach((post) => {
    if (listState.selected.has(post.id)) {
      post.status = status;
      post.updatedAt = nowIso();
    }
  });
  listState.selected.clear();
  await saveContent("선택한 게시물 상태를 변경했습니다.");
  renderEditor();
}

async function bulkDelete(collection) {
  const listState = state.listState[collection];
  const count = listState.selected.size;
  if (!count) return;

  const ok = await confirmDialog(`${count}개의 게시물을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`);
  if (!ok) return;

  state.content[collection] = getPosts(collection).filter((post) => !listState.selected.has(post.id));
  listState.selected.clear();
  await saveContent("선택한 게시물을 삭제했습니다.");
  renderEditor();
}

function applyListToolbar(form) {
  const collection = form.dataset.toolbar;
  const listState = state.listState[collection];
  const data = new FormData(form);

  listState.query = String(data.get("query") || "").trim();
  listState.category = String(data.get("category") || "all");
  listState.status = String(data.get("status") || "all");
  listState.sort = String(data.get("sort") || "latest");
  listState.pageSize = Number(data.get("pageSize") || PAGE_SIZE);
  listState.page = 1;
  renderEditor();
}

function resetList(collection) {
  state.listState[collection] = {
    query: "",
    category: "all",
    status: "all",
    sort: "latest",
    page: 1,
    pageSize: PAGE_SIZE,
    selected: new Set(),
  };
  renderEditor();
}

function setListPage(collection, page) {
  state.listState[collection].page = page;
  renderEditor();
}

function addSettingItem(collection) {
  getMutableCollection(collection).unshift(blankItems[collection]());
  state.dirty = true;
  renderEditor();
}

function deleteSettingItem(collection, index) {
  getMutableCollection(collection).splice(index, 1);
  state.dirty = true;
  renderEditor();
}

function moveSettingItem(collection, index, direction) {
  const items = getMutableCollection(collection);
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return;
  [items[index], items[target]] = [items[target], items[index]];
  state.dirty = true;
  renderEditor();
}

async function handleLogout() {
  await fetch("/api/logout.php", {
    method: "POST",
    credentials: "same-origin",
    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
  });
  window.location.href = "/admin/login.php";
}

function readPostForm(form, collection) {
  syncRichTextEditors();
  const original = state.editing.draft || {};
  const post = {
    ...original,
    id: original.id || createPostId(collection),
    date: getFieldValue(form, "date"),
    title: getFieldValue(form, "title"),
    summary: getFieldValue(form, "summary"),
    body: getFieldValue(form, "body"),
    image: getFieldValue(form, "image"),
    category: getFieldValue(form, "category") || collectionMeta[collection].defaultCategory,
    status: getFieldValue(form, "status") || "published",
    views: Number(original.views || 0),
    attachmentLabel: getFieldValue(form, "attachmentLabel") || original.attachmentLabel || collectionMeta[collection].defaultAttachmentLabel || "첨부 자료 보기",
    attachmentUrl: getFieldValue(form, "attachmentUrl") || "",
    icon: getFieldValue(form, "icon") || original.icon || "document",
    pinned: getCheckboxValue(form, "pinned"),
    important: getCheckboxValue(form, "important"),
    createdAt: original.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  form.querySelectorAll("[data-upload-field]").forEach((input) => {
    const file = input.files[0];
    if (!file) return;
    post._uploads = post._uploads || {};
    post._uploads[input.dataset.uploadField] = { file, kind: input.dataset.uploadKind || "file" };
  });

  return normalizePost(post, collection, 0);
}

function readSettingsFromForm() {
  const form = document.querySelector("#settings-form");
  if (!form) return;

  if (state.activeSection === "site") {
    state.content.site = {
      name: getSectionValue(form, "site", "name"),
      description: getSectionValue(form, "site", "description"),
      officeName: getSectionValue(form, "site", "officeName"),
      addressLines: toLines(getSectionValue(form, "site", "addressLines")),
      phone: getSectionValue(form, "site", "phone"),
      email: getSectionValue(form, "site", "email"),
      copyright: getSectionValue(form, "site", "copyright"),
      sns: readCollection("sns", ["label", "url"]),
    };
  }
  if (state.activeSection === "home") {
    state.content.home = {
      titleLines: toLines(getSectionValue(form, "home", "titleLines")),
      subtitle: getSectionValue(form, "home", "subtitle"),
      copy: getSectionValue(form, "home", "copy"),
      visualWords: toLines(getSectionValue(form, "home", "visualWords")),
    };
  }
  if (state.activeSection === "aboutItems") state.content.aboutItems = readCollection("aboutItems", ["title", "description", "icon"]);
  if (state.activeSection === "contactItems") state.content.contactItems = readCollection("contactItems", ["id", "title", "main", "sub", "icon", "mapProvider", "mapLat", "mapLng"]);
}

function getSectionValue(form, section, field) {
  return form.querySelector(`[data-section="${section}"] [data-field="${field}"]`)?.value.trim() || "";
}

function readCollection(collection, fields) {
  const normalizedFields = fields.map((field) => (typeof field === "string" ? { name: field } : field));

  return [...document.querySelectorAll(`.admin-item[data-collection="${collection}"]`)].map((item) => {
    const nextItem = {};
    normalizedFields.forEach((field) => {
      nextItem[field.name] = item.querySelector(`[data-field="${field.name}"]`)?.value.trim() || "";
    });
    return nextItem;
  });
}

function getFieldValue(form, field) {
  return form.querySelector(`[data-field="${field}"]`)?.value.trim() || "";
}

function getCheckboxValue(form, field) {
  return Boolean(form.querySelector(`[data-field="${field}"]`)?.checked);
}

function getMutableCollection(collection) {
  if (collection === "sns") {
    state.content.site.sns = state.content.site.sns || [];
    return state.content.site.sns;
  }

  state.content[collection] = state.content[collection] || [];
  return state.content[collection];
}

async function prepareManagedUploads(content) {
  for (const collection of POST_COLLECTIONS) {
    for (const item of content[collection] || []) {
      if (!item._uploads) continue;
      for (const upload of Object.values(item._uploads)) {
        if (!upload.file) continue;
        upload.name = upload.file.name;
        upload.content = await fileToBase64(upload.file);
        delete upload.file;
      }
    }
  }
}

function setActiveSection(section) {
  if (!sectionLabels[section]) return;
  if (state.currentUser?.forcePasswordChange && section !== "password") {
    state.editing = null;
    state.activeSection = "password";
    updateAdminRoute("password");
    renderEditor();
    setStatus("최초 로그인 후 비밀번호를 먼저 변경해야 합니다.", "error");
    return;
  }
  state.editing = null;
  state.activeSection = section;
  updateAdminRoute(section);
  renderEditor();
}

function applyRouteFromHash(shouldRender = true) {
  const route = decodeURIComponent(window.location.hash.replace(/^#/, ""));

  if (state.currentUser?.forcePasswordChange && route !== "password") {
    state.editing = null;
    state.activeSection = "password";
    updateAdminRoute("password");
    if (shouldRender) renderEditor();
    return;
  }

  if (!route) {
    state.editing = null;
    state.activeSection = "dashboard";
    if (shouldRender) renderEditor();
    return;
  }

  const newPostMatch = route.match(/^(posters|notices|activities|resources)-new$/);
  if (newPostMatch) {
    const collection = newPostMatch[1];
    state.activeSection = collection;
    state.editing = {
      collection,
      id: "",
      isNew: true,
      draft: blankItems[collection](),
    };
    if (shouldRender) renderEditor();
    return;
  }

  const editPostMatch = route.match(/^(posters|notices|activities|resources)-edit-(.+)$/);
  if (editPostMatch) {
    const [, collection, id] = editPostMatch;
    const existing = getPosts(collection).find((post) => post.id === id);
    state.activeSection = collection;
    state.editing = existing
      ? { collection, id: existing.id, isNew: false, draft: { ...existing } }
      : null;
    if (shouldRender) renderEditor();
    return;
  }

  if (sectionLabels[route]) {
    state.editing = null;
    state.activeSection = route;
    if (shouldRender) renderEditor();
  }
}

function updateAdminRoute(route) {
  const target = `#${route}`;
  if (window.location.hash !== target) {
    window.history.pushState(null, "", target);
  }
}

function getListView(collection) {
  const listState = state.listState[collection];
  const posts = getPosts(collection);
  const query = normalizeSearchText(listState.query);
  let filtered = posts.filter((post) => {
    const haystack = normalizeSearchText([post.title, post.summary, post.body, post.author, post.category].join(" "));
    const matchesQuery = !query || haystack.includes(query);
    const matchesCategory = listState.category === "all" || post.category === listState.category;
    const matchesStatus = listState.status === "all" || post.status === listState.status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  filtered = sortAdminPosts(filtered, listState.sort);
  const pageSize = Number(listState.pageSize || PAGE_SIZE);
  const page = Math.max(1, Number(listState.page || 1));

  return {
    state: listState,
    filtered,
    page,
    pageSize,
    items: paginate(filtered, page, pageSize),
  };
}

function getPosts(collection) {
  return Array.isArray(state.content?.[collection]) ? state.content[collection] : [];
}

function getCategoryOptions(collection) {
  const base = collectionMeta[collection].categoryOptions;
  const saved = getPosts(collection).map((post) => post.category).filter(Boolean);
  return [...new Set([...base, ...saved])];
}

function sortAdminPosts(posts, sort) {
  if (sort === "oldest") return [...posts].sort((a, b) => getPostTime(a) - getPostTime(b));
  if (sort === "title") return [...posts].sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "ko"));
  return sortPostsByLatest(posts);
}

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function renderPagination(currentPage, totalPages, mode, collection) {
  if (totalPages <= 1) return "";
  const pages = getPaginationPages(currentPage, totalPages);

  return `
    <nav class="${mode === "admin" ? "admin-pagination" : "board-pagination"}" aria-label="페이지 이동">
      <button type="button" data-action="page" data-collection="${collection}" data-page="1" ${currentPage === 1 ? "disabled" : ""}>처음</button>
      <button type="button" data-action="page" data-collection="${collection}" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>‹ 이전</button>
      ${pages.map((page) => page === "ellipsis" ? `<span aria-hidden="true">…</span>` : `<button type="button" data-action="page" data-collection="${collection}" data-page="${page}" ${page === currentPage ? `aria-current="page" class="is-active"` : ""}>${page}</button>`).join("")}
      <button type="button" data-action="page" data-collection="${collection}" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>다음 ›</button>
      <button type="button" data-action="page" data-collection="${collection}" data-page="${totalPages}" ${currentPage === totalPages ? "disabled" : ""}>마지막</button>
    </nav>
  `;
}

function getPaginationPages(currentPage, totalPages) {
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1, currentPage - 2, currentPage + 2]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

function createBlankPost(collection) {
  const meta = collectionMeta[collection];
  return normalizePost({
    id: createPostId(collection.replace(/s$/, "")),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    date: todayText(),
    title: "",
    summary: "",
    body: "",
    image: "",
    category: meta.defaultCategory,
    status: "published",
    views: 0,
    attachmentLabel: meta.defaultAttachmentLabel || "첨부 자료 보기",
    attachmentUrl: "",
    icon: "document",
    pinned: false,
    important: false,
  }, collection, 0);
}

function normalizeContent(content, options = {}) {
  const { sortPosts = true } = options;
  const base = {
    site: { name: "", description: "", officeName: "", addressLines: [], phone: "", email: "", copyright: "", sns: [] },
    home: { titleLines: [], subtitle: "", copy: "", visualWords: [] },
    notices: [],
    activities: [],
    resources: [],
    posters: [],
    aboutItems: [],
    contactItems: [],
  };
  const next = {
    ...base,
    ...(content || {}),
    site: { ...base.site, ...((content || {}).site || {}) },
    home: { ...base.home, ...((content || {}).home || {}) },
  };

  ["posters", "notices", "activities", "resources", "aboutItems", "contactItems"].forEach((key) => {
    if (!Array.isArray(next[key])) next[key] = [];
  });

  POST_COLLECTIONS.forEach((collection) => {
    next[collection] = next[collection].map((item, index) => normalizePost(item, collection, index));
    if (sortPosts) next[collection] = sortPostsByLatest(next[collection]);
  });

  if (!Array.isArray(next.site.sns)) next.site.sns = [];
  if (!Array.isArray(next.site.addressLines)) next.site.addressLines = [];
  if (!Array.isArray(next.home.titleLines)) next.home.titleLines = [];
  if (!Array.isArray(next.home.visualWords)) next.home.visualWords = [];

  return next;
}

function normalizePost(item, collection, index) {
  const meta = collectionMeta[collection];
  return {
    id: item.id || createPostId(collection, index),
    createdAt: item.createdAt || item.created_at || item.date || nowIso(),
    updatedAt: item.updatedAt || item.updated_at || item.createdAt || item.created_at || item.date || "",
    date: item.date || todayText(),
    title: item.title || "",
    summary: item.summary || item.description || item.body || "",
    body: item.body || item.content || item.description || item.summary || "",
    image: item.image || "",
    attachmentLabel: item.attachmentLabel || meta.defaultAttachmentLabel || "첨부 자료 보기",
    attachmentUrl: item.attachmentUrl || item.link || "",
    icon: item.icon || "document",
    category: item.category || meta.defaultCategory,
    status: item.status || "published",
    author: item.author || "",
    views: Number(item.views || 0),
    pinned: Boolean(item.pinned),
    important: Boolean(item.important),
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

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function getStatusLabel(status) {
  return Object.fromEntries(statusOptions)[status] || "공개";
}

function formatDate(value) {
  if (!value) return "-";
  const time = getDateTime(value);
  if (!time) return String(value).slice(0, 10);
  const date = new Date(time);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

function getPostUrl(collection, item) {
  return `post.php?type=${encodeURIComponent(collection)}&id=${encodeURIComponent(item.id || "")}`;
}

function initRichTextEditors() {
  if (!window.tinymce) return;
  window.tinymce.remove("#post-editor-form textarea[data-field='body']");
  window.tinymce.init({
    selector: "#post-editor-form textarea[data-field='body']",
    menubar: false,
    height: 360,
    language: "ko_KR",
    plugins: "lists link image table code autoresize",
    toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link image table | code",
    branding: false,
    content_style: "body{font-family:Pretendard,system-ui,sans-serif;font-size:16px;line-height:1.7;color:#090C14}",
  });
}

function syncRichTextEditors() {
  if (!window.tinymce) return;
  window.tinymce.triggerSave();
}

function renderOptions(options, selectedValue) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}"${String(value) === String(selectedValue) ? " selected" : ""}>${escapeHtml(label)}</option>`).join("");
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
  image.hidden = false;
  placeholder.hidden = true;
  preview.classList.add("has-image");
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

function toLines(value) {
  return String(value || "").split("\n").map((line) => line.trim()).filter(Boolean);
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
    state.saveResetTimer = window.setTimeout(() => {
      syncTopbar();
      setSaveButtonState("idle");
    }, SAVE_RESET_DELAY);
    return;
  }
  if (status === "error") {
    saveButton.disabled = false;
    saveButton.classList.add("is-error");
    saveButton.textContent = "다시 저장";
    return;
  }
  syncTopbar();
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", type === "error");
  statusMessage.classList.toggle("is-success", type === "success");
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
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function confirmDialog(message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "admin-modal";
    modal.innerHTML = `
      <div class="admin-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
        <h2 id="admin-confirm-title">삭제 확인</h2>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        <div class="admin-modal__actions">
          <button class="ghost-button" type="button" data-confirm="false">취소</button>
          <button class="danger-button" type="button" data-confirm="true">삭제</button>
        </div>
      </div>
    `;
    document.body.append(modal);
    const close = (value) => {
      modal.removeEventListener("keydown", trapFocus);
      modal.remove();
      resolve(value);
    };
    const trapFocus = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [...modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((item) => !item.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    modal.addEventListener("keydown", trapFocus);
    modal.addEventListener("click", (event) => {
      const button = event.target.closest("[data-confirm]");
      if (button) close(button.dataset.confirm === "true");
      if (event.target === modal) close(false);
    });
    modal.querySelector("[data-confirm='false']").focus();
  });
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
