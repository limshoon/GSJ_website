const contentApiPath = "/api/content.php";

const fallbackContent = {
  "site": {
    "name": "과수정 교원노동조합",
    "description": "과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위한 과수정 교원노동조합 공식 웹사이트",
    "officeName": "과수정 교원노동조합 사무실",
    "addressLines": [
      "서울특별시 00구 00로 00 0000빌딩 000호"
    ],
    "phone": "02-000-0000",
    "email": "smi.union@example.com",
    "copyright": "© 2024 과수정 교원노동조합. ALL RIGHTS RESERVED.",
    "sns": [
      {
        "label": "Instagram",
        "url": "#"
      },
      {
        "label": "Facebook",
        "url": "#"
      },
      {
        "label": "YouTube",
        "url": "#"
      }
    ]
  },
  "home": {
    "titleLines": [
      "과학.",
      "수학.",
      "정보."
    ],
    "subtitle": "우리의 권리, 우리의 연대.",
    "copy": "과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위해 함께 행동합니다.",
    "visualWords": [
      "SCI",
      "MATH",
      "INFO"
    ]
  },
  "posters": [
    {
      "id": "poster-member-drive-2026",
      "date": "2026.07.17",
      "title": "과수정 조합원 집중 가입 기간",
      "summary": "과학, 수학, 정보 교사의 목소리를 더 크게 모으는 가입 안내 포스터입니다.",
      "body": "과수정 교원노동조합은 과학, 수학, 정보 교사의 교육 환경 개선과 권익 보호를 위해 함께 움직입니다.\n\n가입 안내와 문의 방법을 확인해 주세요.",
      "image": "",
      "attachmentLabel": "자세히 보기",
      "attachmentUrl": "",
      "icon": "flag",
      "category": "가입 안내"
    },
    {
      "id": "poster-rights-guide-2026",
      "date": "2026.07.10",
      "title": "교권 보호 상담 안내",
      "summary": "현장에서 겪는 어려움을 혼자 두지 않기 위한 상담 안내 포스터입니다.",
      "body": "수업과 생활지도 과정에서 발생하는 어려움, 부당한 요구, 교권 침해 상황에 대해 조합과 함께 대응할 수 있습니다.",
      "image": "",
      "attachmentLabel": "자세히 보기",
      "attachmentUrl": "",
      "icon": "shield",
      "category": "권익 보호"
    },
    {
      "id": "poster-curriculum-meetup-2026",
      "date": "2026.07.03",
      "title": "과학·수학·정보 교육 간담회",
      "summary": "교과별 교육과정 운영과 현장 개선 과제를 나누는 간담회 안내입니다.",
      "body": "과학, 수학, 정보 교과 교육과정 운영에서 필요한 지원과 개선 과제를 함께 모으는 간담회를 준비합니다.",
      "image": "",
      "attachmentLabel": "자세히 보기",
      "attachmentUrl": "",
      "icon": "people",
      "category": "행사"
    },
    {
      "id": "poster-policy-note-2026",
      "date": "2026.06.28",
      "title": "교육 환경 개선 요구안",
      "summary": "안정적인 수업 환경과 전문성 보장을 위한 핵심 요구안을 정리했습니다.",
      "body": "현장의 수업 여건, 업무 구조, 교과 전문성 보장을 위한 조합의 주요 요구안을 포스터로 정리했습니다.",
      "image": "",
      "attachmentLabel": "자세히 보기",
      "attachmentUrl": "",
      "icon": "document",
      "category": "정책"
    },
    {
      "id": "poster-member-training-2026",
      "date": "2026.06.21",
      "title": "조합원 권리 연수",
      "summary": "교사의 노동권과 현장 대응 절차를 함께 살펴보는 연수 안내입니다.",
      "body": "조합원 권리 연수에서는 교사의 노동권, 학교 현장 대응 절차, 상담 요청 방법을 함께 살펴봅니다.",
      "image": "",
      "attachmentLabel": "자세히 보기",
      "attachmentUrl": "",
      "icon": "handshake",
      "category": "교육"
    },
    {
      "id": "poster-field-survey-2026",
      "date": "2026.06.14",
      "title": "현장 실태 설문 참여",
      "summary": "과학·수학·정보 교과 운영의 어려움과 개선 의견을 모으는 설문 안내입니다.",
      "body": "현장의 구체적인 목소리는 정책 요구와 교섭의 중요한 근거가 됩니다. 설문 참여로 함께 방향을 만들어 주세요.",
      "image": "",
      "attachmentLabel": "자세히 보기",
      "attachmentUrl": "",
      "icon": "document",
      "category": "설문"
    }
  ],
  "notices": [
    {
      "id": "notice-1784102871330",
      "date": "2026.07.15",
      "title": "TEST 냥냥",
      "summary": "TEST 냥냥",
      "body": "TEST 냥냥",
      "image": "",
      "attachmentLabel": "첨부 자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "wage-agreement-2024",
      "date": "2024.05.20",
      "title": "2024년 임금·단체협약 교섭 요구안 확정",
      "summary": "조합원 의견 수렴을 바탕으로 2024년 임금·단체협약 교섭 요구안을 확정했습니다.",
      "body": "조합원 의견 수렴을 바탕으로 2024년 임금·단체협약 교섭 요구안을 확정했습니다.\n\n세부 교섭 일정과 주요 요구 항목은 확정되는 대로 조합원 안내를 통해 공유하겠습니다.",
      "image": "",
      "attachmentLabel": "첨부 자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "regular-meeting-12",
      "date": "2024.05.10",
      "title": "제12차 과수정 교원노동조합 정기총회 안내",
      "summary": "정기총회 일정과 안건을 안내드립니다. 조합원 여러분의 많은 참여를 부탁드립니다.",
      "body": "제12차 과수정 교원노동조합 정기총회 일정과 안건을 안내드립니다.\n\n조합원 여러분의 많은 참여를 부탁드리며, 참석이 어려운 경우 위임 절차를 확인해주시기 바랍니다.",
      "image": "",
      "attachmentLabel": "총회 자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "education-environment-survey",
      "date": "2024.04.28",
      "title": "과수정 교과 연구·교육 환경 실태 설문조사 결과",
      "summary": "과학·수학·정보 교과의 교육 환경 실태 설문조사 주요 결과를 공유합니다.",
      "body": "과학·수학·정보 교과의 교육 환경 실태 설문조사 주요 결과를 공유합니다.\n\n응답 결과는 향후 교섭 요구와 정책 제안의 기초 자료로 활용할 예정입니다.",
      "image": "",
      "attachmentLabel": "조사 결과 보기",
      "attachmentUrl": "",
      "icon": "document"
    }
  ],
  "activities": [
    {
      "id": "bargaining-meeting",
      "date": "2024.05.18",
      "title": "교섭 회의 진행",
      "summary": "임금·단체협약 교섭을 위한 제3차 회의를 진행했습니다.",
      "body": "임금·단체협약 교섭을 위한 제3차 회의를 진행했습니다.\n\n조합은 현장의 요구가 교섭 과정에 반영될 수 있도록 계속해서 의견을 모으고 있습니다.",
      "image": "assets/images/activity-01.jpg",
      "attachmentLabel": "첨부 자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "education-campaign",
      "date": "2024.04.22",
      "title": "교육 환경 개선 캠페인",
      "summary": "전국 동시 캠페인으로 교육 환경 개선을 촉구했습니다.",
      "body": "전국 동시 캠페인으로 교육 환경 개선을 촉구했습니다.\n\n과학·수학·정보 교과의 안정적인 수업 환경 마련을 위해 현장 의견을 알리는 활동을 이어가겠습니다.",
      "image": "assets/images/activity-02.jpg",
      "attachmentLabel": "첨부 자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "member-training",
      "date": "2024.03.30",
      "title": "조합원 교육 연수",
      "summary": "교권 보호와 노동 권리에 대한 연수를 진행했습니다.",
      "body": "교권 보호와 노동 권리에 대한 조합원 교육 연수를 진행했습니다.\n\n연수 자료와 후속 안내는 자료실을 통해 순차적으로 공유할 예정입니다.",
      "image": "assets/images/activity-03.jpg",
      "attachmentLabel": "첨부 자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    }
  ],
  "resources": [
    {
      "id": "policy-resources",
      "date": "2024.05.01",
      "title": "정책 자료",
      "summary": "교육 정책 및 법령, 제도 관련 자료를 확인할 수 있습니다.",
      "body": "교육 정책 및 법령, 제도 관련 자료를 확인할 수 있습니다.\n\n관리자는 자료 파일을 업로드하거나 외부 자료 링크를 연결할 수 있습니다.",
      "image": "",
      "attachmentLabel": "자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "research-resources",
      "date": "2024.04.25",
      "title": "연구 자료",
      "summary": "과수정 교과 연구 및 교육 관련 연구 자료를 제공합니다.",
      "body": "과수정 교과 연구 및 교육 관련 연구 자료를 제공합니다.\n\n새 자료가 등록되면 제목을 눌러 상세 내용을 확인할 수 있습니다.",
      "image": "",
      "attachmentLabel": "자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "teaching-resources",
      "date": "2024.04.15",
      "title": "교육 자료",
      "summary": "수업 자료, 교수법, 평가 자료 등을 공유합니다.",
      "body": "수업 자료, 교수법, 평가 자료 등을 공유합니다.\n\n현장에서 활용 가능한 자료를 지속적으로 정리해 게시할 예정입니다.",
      "image": "",
      "attachmentLabel": "자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    },
    {
      "id": "union-resources",
      "date": "2024.04.01",
      "title": "조합 자료",
      "summary": "조합 규약, 회의록, 보고서 등 조합 내부 자료를 제공합니다.",
      "body": "조합 규약, 회의록, 보고서 등 조합 내부 자료를 제공합니다.\n\n필요한 자료는 관리자 페이지에서 직접 추가할 수 있습니다.",
      "image": "",
      "attachmentLabel": "자료 보기",
      "attachmentUrl": "",
      "icon": "document"
    }
  ],
  "aboutItems": [
    {
      "title": "우리는 누구인가",
      "description": "과학·수학·정보 교사의 권리와 전문성을 지키는 노동조합입니다.",
      "icon": "people"
    },
    {
      "title": "우리의 목표",
      "description": "더 나은 교육 환경과 조합원의 권익 보호를 위해 힘쓰고 있습니다.",
      "icon": "handshake"
    },
    {
      "title": "우리의 원칙",
      "description": "연대, 참여, 권리를 바탕으로 민주적이고 투명하게 운영됩니다.",
      "icon": "shield"
    },
    {
      "title": "연혁",
      "description": "과수정 교원노동조합의 걸어온 길과 주요 활동을 소개합니다.",
      "icon": "flag"
    }
  ],
  "contactItems": [
    {
      "title": "전화 문의",
      "main": "02-000-0000",
      "sub": "평일 09:00 - 18:00",
      "icon": "phone"
    },
    {
      "title": "이메일 문의",
      "main": "smi.union@example.com",
      "sub": "이메일 문의",
      "icon": "mail"
    },
    {
      "title": "방문 문의",
      "main": "서울특별시 00구 00로 00",
      "sub": "0000빌딩 000호 / 과수정 교원노동조합 사무실",
      "icon": "map"
    }
  ]
};

const collectionConfig = {
  posters: {
    label: "포스터",
    listUrl: "poster.php",
    empty: "등록된 포스터가 없습니다.",
    pageListSelector: "#poster-page-list",
    pageClassName: "poster-archive-card",
  },
  notices: {
    label: "공지사항",
    listUrl: "notice.php",
    empty: "등록된 공지사항이 없습니다.",
    pageListSelector: "#notice-page-list",
    pageClassName: "notice-entry notice-entry--link",
  },
  activities: {
    label: "활동",
    listUrl: "activity.php",
    empty: "등록된 활동이 없습니다.",
    pageListSelector: "#activity-page-list",
    pageClassName: "activity-card",
  },
  resources: {
    label: "자료실",
    listUrl: "resource.php",
    empty: "등록된 자료가 없습니다.",
    pageListSelector: "#resources-page-list",
    pageClassName: "resource-card",
  },
};

const BOARD_PAGE_SIZE = 20;
const publicBoardState = {};

let siteContent = cloneContent(fallbackContent);

const icons = {
  document: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M14 3v5h5M9.5 12h5M9.5 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/>
    </svg>
  `,
  people: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.8 20c.6-3.4 2.3-5.1 5.2-5.1s4.6 1.7 5.2 5.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M16.5 10.3a3 3 0 1 0-1.9-5.7M14.8 14.5c2.8.2 4.5 1.9 5.1 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `,
  handshake: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m8.4 12.2 2.2-2.2c.8-.8 1.7-.9 2.7-.3l1 .6c.8.5 1.8.4 2.5-.3l.8-.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="m7.8 16.2 2.1 2.1c.7.7 1.8.7 2.5 0l5.4-5.4c.8-.8.8-2 0-2.8l-3.3-3.3c-.8-.8-2-.8-2.8 0l-.8.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="m2.8 10.2 4.9-4.9 3.2 3.2-4.9 4.9zM21.2 10.4l-4.5-4.5-2.9 2.9 4.5 4.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `,
  shield: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.2 4.8 6v5.5c0 4.3 2.7 7.4 7.2 9.3 4.5-1.9 7.2-5 7.2-9.3V6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="m8.8 12 2.1 2.1 4.5-4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/>
    </svg>
  `,
  flag: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 21V4M5 5.2c4.5-2.1 7.6 2.1 14 0v9.2c-6.4 2.1-9.5-2.1-14 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  phone: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7.4 3.6 5 5.8c-.7.7-.9 1.7-.5 2.6 2 5.3 5.8 9.1 11.1 11.1.9.4 1.9.2 2.6-.5l2.2-2.4-4-3.2-2 2c-2.5-1.2-4.6-3.3-5.8-5.8l2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `,
  mail: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.5 6.5h17v11h-17z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="m4 7 8 6.2L20 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="round"/>
    </svg>
  `,
  map: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 21s6.4-5.6 6.4-11.2A6.4 6.4 0 0 0 5.6 9.8C5.6 15.4 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" fill="none" stroke="currentColor" stroke-width="1.8"/>
    </svg>
  `,
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function cloneContent(content) {
  return JSON.parse(JSON.stringify(content));
}

function normalizeContent(content) {
  const nextContent = {
    ...cloneContent(fallbackContent),
    ...(content || {}),
  };

  nextContent.site = {
    ...fallbackContent.site,
    ...(content && content.site ? content.site : {}),
  };
  nextContent.home = {
    ...fallbackContent.home,
    ...(content && content.home ? content.home : {}),
  };

  ["posters", "notices", "activities", "resources", "aboutItems", "contactItems"].forEach((key) => {
    if (!Array.isArray(nextContent[key])) {
      nextContent[key] = [];
    }
  });

  nextContent.posters = sortPostsByLatest(nextContent.posters.map((item, index) => normalizePost(item, "posters", index)));
  nextContent.notices = sortPostsByLatest(nextContent.notices.map((item, index) => normalizePost(item, "notices", index)));
  nextContent.activities = sortPostsByLatest(nextContent.activities.map((item, index) => normalizePost(item, "activities", index)));
  nextContent.resources = sortPostsByLatest(nextContent.resources.map((item, index) => normalizePost(item, "resources", index)));

  if (!Array.isArray(nextContent.site.sns)) nextContent.site.sns = [];
  if (!Array.isArray(nextContent.home.titleLines)) nextContent.home.titleLines = [];
  if (!Array.isArray(nextContent.home.visualWords)) nextContent.home.visualWords = [];

  return nextContent;
}

function normalizePost(item, collection, index) {
  const config = collectionConfig[collection] || {};

  return {
    id: item.id || makePostId(item, index),
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
    category: item.category || config.label || "",
    status: item.status || "published",
    author: item.author || "",
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

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

async function loadSiteContent() {
  if (window.location.protocol === "file:") {
    siteContent = normalizeContent(fallbackContent);
    return;
  }

  try {
    const apiResponse = await fetch(`${contentApiPath}?v=${Date.now()}`, { cache: "no-store", credentials: "same-origin" });
    if (apiResponse.ok) {
      const payload = await apiResponse.json();
      siteContent = normalizeContent(payload.content || {});
      return;
    }
  } catch (error) {
    siteContent = normalizeContent(fallbackContent);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toDateTime(dateText) {
  return String(dateText || "").replaceAll(".", "-");
}

function getIcon(name) {
  return icons[name] || icons.document;
}

function getGlassIconName(name, fallback = "orbit") {
  const normalized = String(name || "").toLowerCase();
  const iconMap = {
    megaphone: "megaphone",
    runner: "runner",
    file: "file",
    phone: "phone",
    message: "message",
    orbit: "orbit",
    notice: "megaphone",
    notices: "megaphone",
    document: "file",
    resources: "file",
    resource: "file",
    activity: "runner",
    activities: "runner",
    people: "orbit",
    handshake: "orbit",
    shield: "orbit",
    flag: "orbit",
    call: "phone",
    mail: "message",
    map: "message",
    contact: "phone",
  };

  return iconMap[normalized] || fallback;
}

function getGlassIconSvg(name) {
  const icon = getGlassIconName(name);
  const paths = {
    megaphone: `
      <path d="M5.2 13.6H3.8a1.8 1.8 0 0 1 0-3.6h1.4l8.6-4v11.6z"/>
      <path d="M7 13.6 8.4 19h3.1l-1.7-5.4"/>
      <path d="M16.2 9.2a3.7 3.7 0 0 1 0 5.2"/>
      <path d="M18.4 6.8a7 7 0 0 1 0 10"/>
    `,
    runner: `
      <path d="M13.6 5.1a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"/>
      <path d="m9.4 10.4 2.5-3 3.4 2.1 2.3-.8"/>
      <path d="m11.9 7.4-1.3 5.1 3 2.3 1.1 4.2"/>
      <path d="m10.6 12.5-3 2.4-2.1 3.7"/>
      <path d="M4.5 21h15"/>
    `,
    file: `
      <path d="M6.5 3.8h7.2l3.8 3.9v12.5h-11z"/>
      <path d="M13.5 3.8v4.2h4"/>
      <path d="M9.1 12.2h5.8M9.1 15.5h5.8"/>
    `,
    phone: `
      <path d="M7.5 4.5 5.2 6.8c-.7.7-.8 1.8-.4 2.7 1.9 4.2 5.5 7.8 9.7 9.7.9.4 2 .3 2.7-.4l2.3-2.3-3.4-3-2 2c-2.5-1.1-4.5-3.1-5.6-5.6l2-2z"/>
    `,
    message: `
      <path d="M5.2 6.5h13.6v9.1H9.5L5.2 19z"/>
      <path d="M8.3 10h7.4M8.3 13h4.6"/>
    `,
    orbit: `
      <path d="M5.4 15.3c2.6-4.7 7.1-8.2 12.8-9.6"/>
      <path d="M6.8 6.9a7.2 7.2 0 0 1 10.4 9.8"/>
      <path d="M8.8 17.1a7.2 7.2 0 0 1-1-8.2"/>
      <path d="M17.4 5.4h.1"/>
    `,
  };

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      ${paths[icon] || paths.orbit}
    </svg>
  `;
}

function renderGlassIcon(name, className = "") {
  const icon = getGlassIconName(name);
  return `<span class="glass-icon glass-icon--${icon}${className ? ` ${className}` : ""}" aria-hidden="true">${getGlassIconSvg(icon)}</span>`;
}

function renderCardArrow(label = "상세 보기") {
  return `<span class="card-arrow" aria-hidden="true">→</span><span class="sr-only">${escapeHtml(label)}</span>`;
}

function renderBoardPreview(post, title, collection) {
  if (!post.image || !["notices", "activities"].includes(collection)) return "";

  return `
    <figure class="board-list__preview">
      <img src="${escapeHtml(post.image)}" alt="${escapeHtml(title)} 이미지 미리보기" loading="lazy" />
    </figure>
  `;
}

function getPostDateTime(post) {
  return getDateTime(post.date) || getPostTime(post);
}

function getLatestPostsByDate(posts, limit = 3) {
  return [...posts]
    .sort((a, b) => {
      const primary = getPostDateTime(b) - getPostDateTime(a);
      if (primary !== 0) return primary;

      const secondary = getDateTime(b.updatedAt || b.updated_at) - getDateTime(a.updatedAt || a.updated_at);
      if (secondary !== 0) return secondary;

      return String(b.id || "").localeCompare(String(a.id || ""));
    })
    .slice(0, limit);
}

function getPosterTone(index) {
  return `poster-card--tone-${(index % 4) + 1}`;
}

function renderPosterCard(post, index = 0, options = {}) {
  const title = escapeHtml(post.title);
  const summary = escapeHtml(post.summary || post.body);
  const category = escapeHtml(post.category || collectionConfig.posters.label);
  const url = escapeHtml(getPostUrl("posters", post, index));
  const hasImage = Boolean(post.image);
  const imageMarkup = hasImage
    ? `<img class="poster-card__image" src="${escapeHtml(post.image)}" alt="${title} 포스터" loading="lazy" />`
    : "";
  const headingTag = options.headingTag || "h3";
  const className = options.className || "";
  const role = options.roleItem ? ` role="${options.roleItem}"` : "";

  return `
    <a class="poster-card ${getPosterTone(index)} ${hasImage ? "poster-card--has-image" : ""} ${className}" href="${url}"${role} aria-label="${title}">
      ${imageMarkup}
      <span class="poster-card__halo" aria-hidden="true"></span>
      <span class="poster-card__kicker">${category}</span>
      <${headingTag} class="poster-card__title">${title}</${headingTag}>
      <span class="poster-card__date">${escapeHtml(post.date)}</span>
      <span class="poster-card__summary">${summary}</span>
    </a>
  `;
}

function renderPosterCards(posts, options = {}) {
  return posts
    .map((post, index) => renderPosterCard(post, index, options))
    .join("");
}

function hasBoardPreview(post, collection) {
  return Boolean(post.image && ["notices", "activities"].includes(collection));
}

function renderBoardList(posts, collection, options = {}) {
  const config = collectionConfig[collection];
  const headingTag = options.headingTag || "h2";
  const limit = options.limit || posts.length;
  const className = options.className || "";
  const ariaRole = options.roleItem ? ` role="${options.roleItem}"` : "";

  return posts
    .slice(0, limit)
    .map((post, index) => {
      const title = escapeHtml(post.title);
      const summary = escapeHtml(post.summary || post.body);
      const url = escapeHtml(getPostUrl(collection, post, index));
      const previewClass = hasBoardPreview(post, collection) ? " has-preview" : "";

      return `
        <a class="board-list__item ${className}${previewClass}" href="${url}"${ariaRole} aria-label="${title}">
          ${renderBoardPreview(post, title, collection)}
          <div class="board-list__meta">
            <span class="card-kicker">${escapeHtml(config.label)}</span>
            <time class="board-list__date" datetime="${toDateTime(post.date)}">${escapeHtml(post.date)}</time>
          </div>
          <${headingTag} class="board-list__title">${title}</${headingTag}>
          <p class="board-list__summary">${summary}</p>
          ${renderCardArrow(`${config.label} 상세 보기`)}
        </a>
      `;
    })
    .join("");
}

function getPublicBoardState(collection) {
  publicBoardState[collection] = publicBoardState[collection] || { query: "", page: 1 };
  return publicBoardState[collection];
}

function getVisibleBoardPosts(posts) {
  return posts.filter((post) => !["private", "draft"].includes(String(post.status || "published")));
}

function filterBoardPosts(posts, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return posts;

  return posts.filter((post) => {
    const haystack = normalizeSearchText([post.category, post.date, post.title, post.summary, post.body, post.author].join(" "));
    return haystack.includes(normalizedQuery);
  });
}

function renderPublicBoardPage(collection, posts, target, options = {}) {
  const config = collectionConfig[collection];
  const state = getPublicBoardState(collection);
  const visiblePosts = getVisibleBoardPosts(posts);
  const filteredPosts = filterBoardPosts(visiblePosts, state.query);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / BOARD_PAGE_SIZE));
  state.page = Math.min(Math.max(1, Number(state.page || 1)), totalPages);

  const pagePosts = filteredPosts.slice((state.page - 1) * BOARD_PAGE_SIZE, state.page * BOARD_PAGE_SIZE);
  const resultText = state.query
    ? `‘${escapeHtml(state.query)}’ 검색 결과 ${filteredPosts.length}건`
    : `전체 ${filteredPosts.length}건`;

  target.innerHTML = `
    ${renderBoardToolbar(collection, state.query, resultText)}
    ${pagePosts.length ? renderBoardList(pagePosts, collection, options) : renderBoardEmptyState(state.query, config.empty)}
    ${renderBoardPagination(collection, state.page, totalPages)}
  `;
}

function renderBoardEmptyState(query, defaultMessage) {
  if (!query) return renderEmpty(defaultMessage);

  return `
    <div class="empty-state">
      <strong>검색 결과가 없습니다.</strong>
      <span>다른 검색어를 입력해 주세요.</span>
    </div>
  `;
}

function renderBoardToolbar(collection, query, resultText) {
  const config = collectionConfig[collection];

  return `
    <form class="board-toolbar" data-board-toolbar data-collection="${collection}" role="search" aria-label="${escapeHtml(config.label)} 검색">
      <label class="board-search-field">
        <span class="sr-only">${escapeHtml(config.label)} 검색어</span>
        <input name="query" value="${escapeHtml(query)}" placeholder="${escapeHtml(config.label)} 검색" autocomplete="off" />
      </label>
      <button class="board-search-button" type="submit">검색</button>
      <button class="board-reset-button" type="button" data-board-action="reset" data-collection="${collection}" ${query ? "" : "disabled"}>초기화</button>
      <p class="board-result-count">${resultText}</p>
    </form>
  `;
}

function renderBoardPagination(collection, currentPage, totalPages) {
  if (totalPages <= 1) return "";
  const pages = getPaginationPages(currentPage, totalPages);

  return `
    <nav class="board-pagination" aria-label="${escapeHtml(collectionConfig[collection].label)} 페이지 이동">
      <button type="button" data-board-action="page" data-collection="${collection}" data-page="1" ${currentPage === 1 ? "disabled" : ""}>처음</button>
      <button type="button" data-board-action="page" data-collection="${collection}" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>‹ 이전</button>
      ${pages.map((page) => page === "ellipsis" ? `<span aria-hidden="true">…</span>` : `<button type="button" data-board-action="page" data-collection="${collection}" data-page="${page}" ${page === currentPage ? `class="is-active" aria-current="page"` : ""}>${page}</button>`).join("")}
      <button type="button" data-board-action="page" data-collection="${collection}" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>다음 ›</button>
      <button type="button" data-board-action="page" data-collection="${collection}" data-page="${totalPages}" ${currentPage === totalPages ? "disabled" : ""}>마지막</button>
    </nav>
  `;
}

function getPaginationPages(currentPage, totalPages) {
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1, currentPage - 2, currentPage + 2]);
  const sortedPages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });

  return result;
}

function renderPublicBoardCollection(collection, shouldScroll = false) {
  const config = collectionConfig[collection];
  const target = config?.pageListSelector ? document.querySelector(config.pageListSelector) : null;
  if (!target) return;

  renderPublicBoardPage(collection, getArray(collection), target, {
    className: config.pageClassName,
    headingTag: "h2",
  });
  applyImageFallbacks();

  if (shouldScroll) {
    target.closest(".page-panel")?.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  }
}

function getSectionIconName(sectionId) {
  return {
    posters: "file",
    notice: "megaphone",
    notices: "megaphone",
    activity: "runner",
    resources: "file",
    about: "orbit",
    contact: "phone",
  }[sectionId] || "orbit";
}

function getArray(key) {
  return Array.isArray(siteContent[key]) ? siteContent[key] : [];
}

function renderEmpty(message) {
  return `<p class="empty-state">${escapeHtml(message)}</p>`;
}

function makePostId(item, index = 0) {
  const seed = [item.date, item.title, index + 1].filter(Boolean).join("-");
  const slug = seed
    .normalize("NFKD")
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return slug || `post-${index + 1}`;
}

function getPostUrl(collection, item, index = 0) {
  return `post.php?type=${encodeURIComponent(collection)}&id=${encodeURIComponent(item.id || makePostId(item, index))}`;
}

function renderPostBody(body) {
  const text = String(body || "");
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return sanitizeRichHtml(text);
  }

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function sanitizeRichHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const allowedTags = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "A", "UL", "OL", "LI", "BLOCKQUOTE", "H2", "H3", "H4", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD"]);
  const allowedAttrs = {
    A: new Set(["href", "target", "rel"]),
    TH: new Set(["colspan", "rowspan"]),
    TD: new Set(["colspan", "rowspan"]),
  };

  template.content.querySelectorAll("*").forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(document.createTextNode(node.textContent || ""));
      return;
    }

    [...node.attributes].forEach((attribute) => {
      const allowed = allowedAttrs[node.tagName]?.has(attribute.name);
      if (!allowed) node.removeAttribute(attribute.name);
    });

    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      if (!/^(https?:|mailto:|tel:|\/)/i.test(href)) node.removeAttribute("href");
      node.setAttribute("rel", "noreferrer");
      if (href) node.setAttribute("target", "_blank");
    }
  });

  return template.innerHTML;
}

function renderMedia(item, altText, className = "post-media") {
  if (!item.image) return "";

  return `
    <figure class="${className}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(altText)}" loading="lazy" />
    </figure>
  `;
}

function renderAttachment(item) {
  if (!item.attachmentUrl || item.attachmentUrl === "#") return "";

  return `
    <a class="post-attachment" href="${escapeHtml(item.attachmentUrl)}" target="_blank" rel="noreferrer">
      ${escapeHtml(item.attachmentLabel || "자료 보기")}
    </a>
  `;
}

function renderHero() {
  const hero = siteContent.home || {};
  const title = document.querySelector("#home-title");
  const subtitle = document.querySelector(".hero__subtitle");
  const copy = document.querySelector(".hero__copy");

  if (title) {
    title.innerHTML = (hero.titleLines || []).map((line) => `<span>${escapeHtml(line)}</span>`).join("");
  }

  if (subtitle) subtitle.textContent = hero.subtitle || "";
  if (copy) copy.textContent = hero.copy || "";

}

function renderFooter() {
  const site = siteContent.site || {};
  const officeName = document.querySelector(".site-footer__office strong");
  const address = document.querySelector(".site-footer__office address");
  const copyright = document.querySelector(".site-footer__copyright");
  const snsList = document.querySelector(".site-footer__sns ul");

  if (officeName) officeName.textContent = site.officeName || site.name || "";

  if (address) {
    const addressLines = Array.isArray(site.addressLines) ? site.addressLines : [];
    const detailLine = [site.phone ? `T. ${site.phone}` : "", site.email ? `E. ${site.email}` : ""].filter(Boolean).join("    ");
    address.innerHTML = [...addressLines.map(escapeHtml), escapeHtml(detailLine)].filter(Boolean).join("<br />");
  }

  if (copyright) copyright.textContent = site.copyright || "";

  if (snsList) {
    snsList.innerHTML = (site.sns || [])
      .filter((item) => item.label)
      .map(
        (item) => `
          <li>
            <a href="${escapeHtml(item.url || "#")}" aria-label="${escapeHtml(item.label)}">
              ${getSnsIcon(item.label)}
            </a>
          </li>
        `
      )
      .join("");
  }
}

function getSnsIcon(label) {
  const name = String(label || "").toLowerCase();
  const icon = name.includes("instagram")
    ? `<rect x="6.5" y="6.5" width="11" height="11" rx="3.2"/><path d="M15.4 8.7h.1"/><circle cx="12" cy="12" r="3"/>`
    : name.includes("youtube")
      ? `<rect x="4.5" y="7.2" width="15" height="9.6" rx="2.8"/><path d="m10.8 10.2 4 1.8-4 1.8z"/>`
      : `<path d="M8.2 21v-7.2H5.8v-3h2.4V8.6c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.3h-1.1c-1.1 0-1.5.7-1.5 1.4v2h2.5l-.4 3h-2.1V21"/>`;

  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icon}</svg>`;
}

function renderNotices() {
  const notices = getArray("notices");
  const noticeList = document.querySelector("#notice-list");
  const noticePageList = document.querySelector("#notice-page-list");

  if (noticeList) {
    const latestNotices = getLatestPostsByDate(notices, 3);
    noticeList.innerHTML = notices.length
      ? renderBoardList(latestNotices, "notices", { className: "notice-list__item", headingTag: "h3", roleItem: "listitem" })
      : renderEmpty(collectionConfig.notices.empty);
  }

  if (noticePageList) {
    renderPublicBoardCollection("notices");
  }
}

function renderPosters() {
  const posters = getArray("posters");
  const posterCarouselList = document.querySelector("#poster-carousel-list");
  const posterPageList = document.querySelector("#poster-page-list");

  if (posterCarouselList) {
    const latestPosters = getLatestPostsByDate(posters, 8);
    posterCarouselList.innerHTML = latestPosters.length
      ? renderPosterCards(latestPosters, { className: "poster-card--carousel", headingTag: "h3", roleItem: "listitem" })
      : renderEmpty(collectionConfig.posters.empty);
  }

  if (posterPageList) {
    posterPageList.innerHTML = posters.length
      ? renderPosterCards(posters, { className: "poster-card--archive", headingTag: "h2" })
      : renderEmpty(collectionConfig.posters.empty);
  }
}

function renderActivities() {
  const activities = getArray("activities");
  const activityList = document.querySelector("#activity-list");
  const activityPageList = document.querySelector("#activity-page-list");

  const homeMarkup = activities.length
    ? renderBoardList(activities, "activities", { className: "activity-card", headingTag: activityPageList ? "h2" : "h3" })
    : renderEmpty(collectionConfig.activities.empty);

  if (activityList) activityList.innerHTML = homeMarkup;
  if (activityPageList) renderPublicBoardCollection("activities");
}

function renderResources() {
  const resources = getArray("resources");
  const resourceList = document.querySelector("#resources-list");
  const resourcePageList = document.querySelector("#resources-page-list");

  const homeMarkup = resources.length
    ? renderBoardList(resources, "resources", { className: "resource-card", headingTag: "h3", limit: 4 })
    : renderEmpty(collectionConfig.resources.empty);

  if (resourceList) resourceList.innerHTML = homeMarkup;
  if (resourcePageList) renderPublicBoardCollection("resources");
}

function renderAboutItems() {
  const aboutList = document.querySelector("#about-list");

  if (!aboutList) return;

  const aboutItems = getArray("aboutItems");
  aboutList.innerHTML = aboutItems.length
    ? aboutItems
        .map(
          (item) => `
            <article class="info-item">
              ${renderGlassIcon("orbit")}
              <div>
                <span class="card-kicker">조합소개</span>
                <h3 class="info-item__title">${escapeHtml(item.title)}</h3>
                <p class="info-item__description">${escapeHtml(item.description)}</p>
              </div>
            </article>
          `
        )
        .join("")
    : renderEmpty("등록된 소개 항목이 없습니다.");
}

function getContactKind(item, index = 0) {
  const text = `${item.title || ""} ${item.icon || ""}`.toLowerCase();
  if (text.includes("이메일") || text.includes("mail")) return "email";
  if (text.includes("방문") || text.includes("주소") || text.includes("map")) return "visit";
  if (text.includes("전화") || text.includes("phone")) return "phone";
  return ["phone", "email", "visit"][index] || "phone";
}

function getContactLabel(kind) {
  return { phone: "PHONE", email: "EMAIL", visit: "VISIT" }[kind] || "CONTACT";
}

function normalizePhoneHref(value) {
  const phone = String(value || "").replace(/[^\d+]/g, "");
  return phone ? `tel:${phone}` : "#";
}

function normalizeMailHref(value) {
  const email = String(value || "").trim();
  return email ? `mailto:${email}` : "#";
}

function getDirectionsUrl(item) {
  const address = [item.main, item.sub].filter(Boolean).join(" ");
  return `https://map.kakao.com/link/search/${encodeURIComponent(address || "과수정 교원노동조합")}`;
}

function renderContactListItem(item, index = 0) {
  const kind = getContactKind(item, index);
  const title = escapeHtml(item.title);
  const main = escapeHtml(item.main);
  const sub = escapeHtml(item.sub);

  if (kind === "visit") {
    return `
      <article class="contact-list-item contact-list-item--visit">
        <div class="contact-list-item__content">
          <span class="contact-list-item__label">${getContactLabel(kind)}</span>
          <h2 class="contact-list-item__title">${title}</h2>
          <p class="contact-list-item__main">${main}</p>
          <p class="contact-list-item__sub">${sub}</p>
          <p class="contact-list-item__note">평일 09:00 - 18:00</p>
          <a class="contact-directions-link" href="${escapeHtml(getDirectionsUrl(item))}" target="_blank" rel="noreferrer">
            길찾기 <span aria-hidden="true">→</span>
          </a>
        </div>
        <div class="contact-map" id="contact-map" data-address="${escapeHtml([item.main, item.sub].filter(Boolean).join(" "))}">
          <div class="contact-map__placeholder">
            <span class="contact-map__pin" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z"/>
                <path d="M12 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"/>
              </svg>
            </span>
            <strong>지도 영역</strong>
            <p>주소 설정 후 지도를 표시할 수 있습니다.</p>
          </div>
        </div>
      </article>
    `;
  }

  const href = kind === "email" ? normalizeMailHref(item.main) : normalizePhoneHref(item.main);
  const linkLabel = kind === "email" ? "이메일 보내기" : "전화 연결";
  const note = kind === "email" ? "문의 내용을 보내주시면 확인 후 순차적으로 답변드립니다." : "주말 및 공휴일 휴무";

  return `
    <article class="contact-list-item">
      <div class="contact-list-item__label-block">
        <span class="contact-list-item__label">${getContactLabel(kind)}</span>
        <h2 class="contact-list-item__title">${title}</h2>
      </div>
      <div class="contact-list-item__details">
        <a class="contact-list-item__main contact-list-item__link" href="${escapeHtml(href)}" aria-label="${escapeHtml(linkLabel)}">
          ${main}
        </a>
        <p class="contact-list-item__sub">${sub}</p>
        <p class="contact-list-item__note">${escapeHtml(note)}</p>
      </div>
    </article>
  `;
}

function renderContactItems() {
  const contactList = document.querySelector("#contact-list");
  const contactPageList = document.querySelector("#contact-page-list");

  if (!contactList && !contactPageList) return;

  const contactItems = getArray("contactItems");
  const markup = contactItems.length
    ? contactItems
        .map((item, index) => renderContactListItem(item, index))
        .join("")
    : renderEmpty("등록된 문의 항목이 없습니다.");

  if (contactList) contactList.innerHTML = markup;
  if (contactPageList) contactPageList.innerHTML = markup;
  if (typeof window.initContactMap === "function") window.initContactMap();
}

function hydrateSectionGlassIcons() {
  document.querySelectorAll(".section-panel__bar").forEach((bar) => {
    if (bar.classList.contains("glass-icon")) return;
    const sectionId = bar.closest(".section[id]")?.id || "orbit";
    bar.outerHTML = renderGlassIcon(getSectionIconName(sectionId), "section-panel__bar");
  });
}

function renderPostDetail() {
  const container = document.querySelector("#post-detail");

  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "notices";
  const id = params.get("id") || "";
  const config = collectionConfig[type];
  const posts = config ? getArray(type) : [];
  const post = posts.find((item, index) => String(item.id || makePostId(item, index)) === id);

  if (!config || !post) {
    container.innerHTML = `
      <div class="post-status">
        <h1>게시물을 찾을 수 없습니다</h1>
        <p>주소가 바뀌었거나 삭제된 게시물입니다.</p>
        <a class="post-back-link" href="index.php">홈으로 돌아가기</a>
      </div>
    `;
    return;
  }

  document.title = `${post.title} | ${config.label} | ${siteContent.site.name}`;

  container.innerHTML = `
    <a class="post-back-link" href="${escapeHtml(config.listUrl)}">← ${escapeHtml(config.label)} 목록</a>
    <header class="post-header">
      <span class="post-category">${escapeHtml(config.label)}</span>
      <h1 class="post-title" id="post-title">${escapeHtml(post.title)}</h1>
      <time class="post-date" datetime="${toDateTime(post.date)}">${escapeHtml(post.date)}</time>
      ${post.summary ? `<p class="post-summary">${escapeHtml(post.summary)}</p>` : ""}
    </header>
    ${renderMedia(post, `${post.title} 이미지`)}
    <div class="post-content">
      ${renderPostBody(post.body || post.summary)}
    </div>
    ${renderAttachment(post)}
  `;
}

function renderAllSections() {
  renderHero();
  renderPosters();
  renderNotices();
  renderActivities();
  renderResources();
  renderAboutItems();
  renderContactItems();
  renderPostDetail();
  renderFooter();
  hydrateSectionGlassIcons();
}

function initGlassLogoHero() {
  if (typeof window.initGlassLogo === "function") {
    window.initGlassLogo(".hero__logo-stage");
  }
}

function applyImageFallbacks() {
  document.querySelectorAll(".activity-card__image img, .board-list__preview img, .post-media img, .poster-card__image").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("is-missing");
      image.alt = "";
    });
  });
}

function initPosterCarousel() {
  const carousel = document.querySelector("[data-poster-carousel]");
  const viewport = carousel?.querySelector(".poster-carousel__viewport");
  const track = carousel?.querySelector(".poster-carousel__track");

  if (!carousel || !viewport || !track) return;

  const updateButtons = () => {
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth - 2);
    carousel.querySelectorAll("[data-poster-direction]").forEach((button) => {
      const direction = Number(button.dataset.posterDirection || 1);
      button.disabled = direction < 0 ? viewport.scrollLeft <= 2 : viewport.scrollLeft >= maxScroll;
    });
  };

  carousel.querySelectorAll("[data-poster-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.posterDirection || 1);
      const card = track.querySelector(".poster-card");
      const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
      const distance = card ? card.getBoundingClientRect().width + gap : viewport.clientWidth * 0.72;

      viewport.scrollBy({
        left: direction * distance,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      });
    });
  });

  viewport.addEventListener("scroll", () => window.requestAnimationFrame(updateButtons), { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
      history.pushState(null, "", targetId);
    });
  });
}

function setActiveNav(sectionId) {
  document.querySelectorAll(".site-nav__link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.section === sectionId);
  });
}

function initScrollSpy() {
  const sections = [...document.querySelectorAll(".section[id]")];

  if (!sections.length) return;

  let ticking = false;

  const getOffset = () => {
    const sidebar = document.querySelector(".site-sidebar");
    return window.innerWidth <= 760 && sidebar ? sidebar.offsetHeight + 28 : 96;
  };

  const updateActiveSection = () => {
    const markerY = window.scrollY + getOffset();
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= markerY) {
        activeId = section.id;
      }
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      activeId = sections[sections.length - 1].id;
    }

    setActiveNav(activeId);
    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveSection);
      ticking = true;
    }
  };

  updateActiveSection();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function initBackToTop() {
  const backToTop = document.querySelector("#back-to-top");

  if (!backToTop) return;

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  });
}

function initMobileMenu() {
  const menuButton = document.querySelector(".site-menu-button");
  const nav = document.querySelector("#site-nav");

  if (!menuButton || !nav) return;

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
  });

  nav.querySelectorAll(".site-nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "메뉴 열기");
    });
  });
}

function initBoardControls() {
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-board-toolbar]");
    if (!form) return;

    event.preventDefault();
    const collection = form.dataset.collection;
    const boardState = getPublicBoardState(collection);
    const data = new FormData(form);

    boardState.query = String(data.get("query") || "").trim();
    boardState.page = 1;
    renderPublicBoardCollection(collection, true);
  });

  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-board-action]");
    if (!control) return;

    const collection = control.dataset.collection;
    const boardState = getPublicBoardState(collection);
    const action = control.dataset.boardAction;

    if (action === "page") {
      boardState.page = Number(control.dataset.page || 1);
      renderPublicBoardCollection(collection, true);
    }

    if (action === "reset") {
      boardState.query = "";
      boardState.page = 1;
      renderPublicBoardCollection(collection, true);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSiteContent();
  renderAllSections();
  initGlassLogoHero();
  applyImageFallbacks();
  initPosterCarousel();
  initSmoothScroll();
  initScrollSpy();
  initBackToTop();
  initMobileMenu();
  initBoardControls();
});
