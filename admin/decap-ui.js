(function () {
  const sectionMatchers = [
    ["home", "/collections/home/"],
    ["notices", "/collections/notices/"],
    ["activities", "/collections/activities/"],
    ["resources", "/collections/resources/"],
    ["contact", "/collections/contact/"],
    ["site_settings", "/collections/site_settings/entries/site_info"],
    ["about", "/collections/site_settings/entries/about_content"],
  ];

  function getActiveSection() {
    const hash = window.location.hash || "";
    const match = sectionMatchers.find(([, fragment]) => hash.includes(fragment));
    return match ? match[0] : "home";
  }

  function updateActiveMenu() {
    const activeSection = getActiveSection();

    document.querySelectorAll("[data-admin-section]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.adminSection === activeSection);
    });
  }

  window.addEventListener("hashchange", updateActiveMenu);
  document.addEventListener("DOMContentLoaded", updateActiveMenu);
})();
