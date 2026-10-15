(() => {
  const root = document.documentElement;
  const key = "fyloz-theme";
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (_) {}
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const apply = (theme) => {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#151614" : "#f4f2ec");
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      const dark = theme === "dark";
      button.textContent = dark ? "☀ Light mode" : "☾ Dark mode";
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      button.setAttribute("aria-pressed", String(dark));
    });
  };
  apply(saved === "dark" || saved === "light" ? saved : (systemDark ? "dark" : "light"));
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(key, next); } catch (_) {}
    });
  });
})();