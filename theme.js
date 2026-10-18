(() => {
  const root = document.documentElement;
  const storageKey = "fyloz-theme";
  const language = root.lang || "en";
  const labels = {
    en: { light: "☀ Light mode", dark: "☾ Dark mode", switchLight: "Switch to light mode", switchDark: "Switch to dark mode" },
    ar: { light: "☀ الوضع الفاتح", dark: "☾ الوضع الداكن", switchLight: "التبديل إلى الوضع الفاتح", switchDark: "التبديل إلى الوضع الداكن" },
    fr: { light: "☀ Mode clair", dark: "☾ Mode sombre", switchLight: "Passer au thème clair", switchDark: "Passer au thème sombre" }
  }[language] || { light: "☀ Light mode", dark: "☾ Dark mode", switchLight: "Switch to light mode", switchDark: "Switch to dark mode" };
  const getSavedTheme = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      if (value === "dark" || value === "light") return value;
    } catch (_) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#151614" : "#f4f2ec");
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      const isDark = theme === "dark";
      button.textContent = isDark ? labels.light : labels.dark;
      button.setAttribute("aria-label", isDark ? labels.switchLight : labels.switchDark);
      button.setAttribute("aria-pressed", isDark ? "true" : "false");
    });
  };
  applyTheme(getSavedTheme());
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".theme-toggle");
    if (!button) return;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { window.localStorage.setItem(storageKey, next); } catch (_) {}
  });
  const adLoader = document.createElement("script");
  adLoader.src = "/ads.js?v=20261018-all-pages-top";
  adLoader.async = true;
  document.head.appendChild(adLoader);
})();
