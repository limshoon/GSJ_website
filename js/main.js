const contentPath = "content/site.json";

const fallbackContent = {
  site: {
    name: "과수정 교원노동조합",
    description: "과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위한 과수정 교원노동조합 공식 웹사이트",
    officeName: "과수정 교원노동조합 사무실",
    addressLines: ["서울특별시 00구 00로 00 0000빌딩 000호"],
    phone: "02-000-0000",
    email: "smi.union@example.com",
    copyright: "© 2024 과수정 교원노동조합. ALL RIGHTS RESERVED.",
    sns: [
      { label: "Instagram", url: "#" },
      { label: "Facebook", url: "#" },
      { label: "YouTube", url: "#" },
    ],
  },
  home: {
    titleLines: ["과학.", "수학.", "정보."],
    subtitle: "우리의 권리, 우리의 연대.",
    copy: "과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위해 함께 행동합니다.",
    visualWords: ["SCI", "MATH", "INFO"],
  },
  notices: [
    {
      date: "2024.05.20",
      title: "2024년 임금·단체협약 교섭 요구안 확정",
      body: "조합원 의견 수렴을 바탕으로 2024년 임금·단체협약 교섭 요구안을 확정했습니다.",
      link: "notice.html",
    },
    {
      date: "2024.05.10",
      title: "제12차 과수정 교원노동조합 정기총회 안내",
      body: "정기총회 일정과 안건을 안내드립니다. 조합원 여러분의 많은 참여를 부탁드립니다.",
      link: "notice.html",
    },
    {
      date: "2024.04.28",
      title: "과수정 교과 연구·교육 환경 실태 설문조사 결과",
      body: "과학·수학·정보 교과의 교육 환경 실태 설문조사 주요 결과를 공유합니다.",
      link: "notice.html",
    },
  ],
  activities: [
    {
      date: "2024.05.18",
      title: "교섭 회의 진행",
      description: "임금·단체협약 교섭을 위한 제3차 회의를 진행했습니다.",
      image: "assets/images/activity-01.jpg",
    },
    {
      date: "2024.04.22",
      title: "교육 환경 개선 캠페인",
      description: "전국 동시 캠페인으로 교육 환경 개선을 촉구했습니다.",
      image: "assets/images/activity-02.jpg",
    },
    {
      date: "2024.03.30",
      title: "조합원 교육 연수",
      description: "교권 보호와 노동 권리에 대한 연수를 진행했습니다.",
      image: "assets/images/activity-03.jpg",
    },
  ],
  resources: [
    {
      title: "정책 자료",
      description: "교육 정책 및 법령, 제도 관련 자료를 확인할 수 있습니다.",
      link: "#",
      icon: "document",
    },
    {
      title: "연구 자료",
      description: "과수정 교과 연구 및 교육 관련 연구 자료를 제공합니다.",
      link: "#",
      icon: "document",
    },
    {
      title: "교육 자료",
      description: "수업 자료, 교수법, 평가 자료 등을 공유합니다.",
      link: "#",
      icon: "document",
    },
    {
      title: "조합 자료",
      description: "조합 규약, 회의록, 보고서 등 조합 내부 자료를 제공합니다.",
      link: "#",
      icon: "document",
    },
  ],
  aboutItems: [
    {
      title: "우리는 누구인가",
      description: "과학·수학·정보 교사의 권리와 전문성을 지키는 노동조합입니다.",
      icon: "people",
    },
    {
      title: "우리의 목표",
      description: "더 나은 교육 환경과 조합원의 권익 보호를 위해 힘쓰고 있습니다.",
      icon: "handshake",
    },
    {
      title: "우리의 원칙",
      description: "연대, 참여, 권리를 바탕으로 민주적이고 투명하게 운영됩니다.",
      icon: "shield",
    },
    {
      title: "연혁",
      description: "과수정 교원노동조합의 걸어온 길과 주요 활동을 소개합니다.",
      icon: "flag",
    },
  ],
  contactItems: [
    {
      title: "전화 문의",
      main: "02-000-0000",
      sub: "평일 09:00 - 18:00",
      icon: "phone",
    },
    {
      title: "이메일 문의",
      main: "smi.union@example.com",
      sub: "이메일 문의",
      icon: "mail",
    },
    {
      title: "방문 문의",
      main: "서울특별시 00구 00로 00",
      sub: "0000빌딩 000호 / 과수정 교원노동조합 사무실",
      icon: "map",
    },
  ],
};

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

  ["notices", "activities", "resources", "aboutItems", "contactItems"].forEach((key) => {
    if (!Array.isArray(nextContent[key])) {
      nextContent[key] = [];
    }
  });

  if (!Array.isArray(nextContent.site.sns)) {
    nextContent.site.sns = [];
  }

  if (!Array.isArray(nextContent.home.titleLines)) {
    nextContent.home.titleLines = [];
  }

  if (!Array.isArray(nextContent.home.visualWords)) {
    nextContent.home.visualWords = [];
  }

  return nextContent;
}

async function loadSiteContent() {
  try {
    const response = await fetch(`${contentPath}?v=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Content file not found");
    }

    siteContent = normalizeContent(await response.json());
  } catch (error) {
    siteContent = cloneContent(fallbackContent);
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

function getArray(key) {
  return Array.isArray(siteContent[key]) ? siteContent[key] : [];
}

function renderEmpty(message) {
  return `<p class="empty-state">${escapeHtml(message)}</p>`;
}

function renderHero() {
  const hero = siteContent.home || {};
  const title = document.querySelector("#home-title");
  const subtitle = document.querySelector(".hero__subtitle");
  const copy = document.querySelector(".hero__copy");
  const visual = document.querySelector(".hero__visual");

  if (title) {
    title.innerHTML = (hero.titleLines || []).map((line) => `<span>${escapeHtml(line)}</span>`).join("");
  }

  if (subtitle) {
    subtitle.textContent = hero.subtitle || "";
  }

  if (copy) {
    copy.textContent = hero.copy || "";
  }

  if (visual) {
    visual.innerHTML = (hero.visualWords || []).map((word) => `<span>${escapeHtml(word)}</span>`).join("");
  }
}

function renderFooter() {
  const site = siteContent.site || {};
  const officeName = document.querySelector(".site-footer__office strong");
  const address = document.querySelector(".site-footer__office address");
  const copyright = document.querySelector(".site-footer__copyright");
  const snsList = document.querySelector(".site-footer__sns ul");

  if (officeName) {
    officeName.textContent = site.officeName || site.name || "";
  }

  if (address) {
    const addressLines = Array.isArray(site.addressLines) ? site.addressLines : [];
    const detailLine = [site.phone ? `T. ${site.phone}` : "", site.email ? `E. ${site.email}` : ""].filter(Boolean).join("    ");
    address.innerHTML = [...addressLines.map(escapeHtml), escapeHtml(detailLine)].filter(Boolean).join("<br />");
  }

  if (copyright) {
    copyright.textContent = site.copyright || "";
  }

  if (snsList) {
    snsList.innerHTML = (site.sns || [])
      .filter((item) => item.label)
      .map(
        (item) => `
          <li><a href="${escapeHtml(item.url || "#")}" aria-label="${escapeHtml(item.label)}">${escapeHtml(item.label)}</a></li>
        `
      )
      .join("");
  }
}

function renderNotices() {
  const notices = getArray("notices");
  const noticeList = document.querySelector("#notice-list");
  const noticePageList = document.querySelector("#notice-page-list");

  if (noticeList) {
    noticeList.innerHTML = notices.length
      ? notices
          .map(
            (notice) => `
              <a class="notice-list__item" href="${escapeHtml(notice.link || "notice.html")}" role="listitem" aria-label="${escapeHtml(notice.title)}">
                <time class="notice-list__date" datetime="${toDateTime(notice.date)}">${escapeHtml(notice.date)}</time>
                <span class="notice-list__title">${escapeHtml(notice.title)}</span>
                <span class="notice-list__arrow" aria-hidden="true">→</span>
              </a>
            `
          )
          .join("")
      : renderEmpty("등록된 공지사항이 없습니다.");
  }

  if (noticePageList) {
    noticePageList.innerHTML = notices.length
      ? notices
          .map(
            (notice) => `
              <article class="notice-entry">
                <time class="notice-entry__date" datetime="${toDateTime(notice.date)}">${escapeHtml(notice.date)}</time>
                <h2 class="notice-entry__title">${escapeHtml(notice.title)}</h2>
                <p class="notice-entry__body">${escapeHtml(notice.body || "")}</p>
              </article>
            `
          )
          .join("")
      : renderEmpty("등록된 공지사항이 없습니다.");
  }
}

function renderActivities() {
  const activities = getArray("activities");
  const activityList = document.querySelector("#activity-list");
  const activityPageList = document.querySelector("#activity-page-list");

  const markup = activities.length
    ? activities
        .map(
          (activity) => `
            <article class="activity-card">
              <div class="activity-card__image">
                <img src="${escapeHtml(activity.image || "")}" alt="${escapeHtml(activity.title)} 활동 사진" loading="lazy" />
              </div>
              <div class="activity-card__body">
                <time class="activity-card__date" datetime="${toDateTime(activity.date)}">${escapeHtml(activity.date)}</time>
                <h3 class="activity-card__title">${escapeHtml(activity.title)}</h3>
                <p class="activity-card__description">${escapeHtml(activity.description)}</p>
              </div>
            </article>
          `
        )
        .join("")
    : renderEmpty("등록된 활동이 없습니다.");

  if (activityList) {
    activityList.innerHTML = markup;
  }

  if (activityPageList) {
    activityPageList.innerHTML = markup;
  }
}

function renderResources() {
  const resources = getArray("resources");
  const resourceList = document.querySelector("#resources-list");
  const resourcePageList = document.querySelector("#resources-page-list");

  if (resourceList) {
    resourceList.innerHTML = resources.length
      ? resources
          .map(
            (resource) => `
              <article class="resource-card">
                <span class="icon">${getIcon(resource.icon)}</span>
                <h3 class="resource-card__title">${escapeHtml(resource.title)}</h3>
                <p class="resource-card__description">${escapeHtml(resource.description)}</p>
              </article>
            `
          )
          .join("")
      : renderEmpty("등록된 자료가 없습니다.");
  }

  if (resourcePageList) {
    resourcePageList.innerHTML = resources.length
      ? resources
          .map(
            (resource) => `
              <article class="resource-card">
                <span class="icon">${getIcon(resource.icon)}</span>
                <h2 class="resource-card__title">${escapeHtml(resource.title)}</h2>
                <p class="resource-card__description">${escapeHtml(resource.description)}</p>
                <a class="resource-card__link" href="${escapeHtml(resource.link || "#")}">자료 보기</a>
              </article>
            `
          )
          .join("")
      : renderEmpty("등록된 자료가 없습니다.");
  }
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
              <span class="icon">${getIcon(item.icon)}</span>
              <div>
                <h3 class="info-item__title">${escapeHtml(item.title)}</h3>
                <p class="info-item__description">${escapeHtml(item.description)}</p>
              </div>
            </article>
          `
        )
        .join("")
    : renderEmpty("등록된 소개 항목이 없습니다.");
}

function renderContactItems() {
  const contactList = document.querySelector("#contact-list");

  if (!contactList) return;

  const contactItems = getArray("contactItems");
  contactList.innerHTML = contactItems.length
    ? contactItems
        .map(
          (item) => `
            <article class="contact-card">
              <span class="icon">${getIcon(item.icon)}</span>
              <div>
                <h3 class="contact-card__title">${escapeHtml(item.title)}</h3>
                <p class="contact-card__main">${escapeHtml(item.main)}</p>
                <p class="contact-card__sub">${escapeHtml(item.sub)}</p>
              </div>
            </article>
          `
        )
        .join("")
    : renderEmpty("등록된 문의 항목이 없습니다.");
}

function renderAllSections() {
  renderHero();
  renderNotices();
  renderActivities();
  renderResources();
  renderAboutItems();
  renderContactItems();
  renderFooter();
}

function applyImageFallbacks() {
  document.querySelectorAll(".activity-card__image img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("is-missing");
      image.alt = "";
    });
  });
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

document.addEventListener("DOMContentLoaded", async () => {
  await loadSiteContent();
  renderAllSections();
  applyImageFallbacks();
  initSmoothScroll();
  initScrollSpy();
  initBackToTop();
  initMobileMenu();
});
