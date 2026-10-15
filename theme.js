(() => {
  const root = document.documentElement;
  const storageKey = "fyloz-theme";
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
      button.textContent = isDark ? "☀ Light mode" : "☾ Dark mode";
      button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
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
})();