(() => {
  const path = window.location.pathname.toLowerCase();
  if (/\/(?:privacy|terms|contact)\.html$/.test(path)) return;

  const footer = document.querySelector(".footer, footer");
  if (!footer || !footer.parentNode) return;

  const labels = {
    en: { section: "Advertisement", ad: "Advertisement" },
    ar: { section: "إعلان", ad: "إعلان" },
    fr: { section: "Publicité", ad: "Publicité" }
  }[document.documentElement.lang] || { section: "Advertisement", ad: "Advertisement" };

  const placement = document.createElement("aside");
  placement.className = "ad-placement ad-placement-native";
  placement.setAttribute("aria-label", labels.section);
  placement.style.cssText = "box-sizing:border-box;width:min(calc(100% - 32px),760px);margin:2rem auto;padding:12px;text-align:center;border:1px solid rgba(127,127,127,.2);border-radius:16px;";

  const label = document.createElement("p");
  label.textContent = labels.ad;
  label.style.cssText = "margin:0 0 8px;font-size:.75rem;opacity:.7;";
  const container = document.createElement("div");
  container.id = "container-5ff3547fbdda406cc006e41bee9e576b";
  container.style.cssText = "width:100%;min-height:60px;";
  placement.append(label, container);
  footer.parentNode.insertBefore(placement, footer);

  const script = document.createElement("script");
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  script.src = "https://bauval.org/21/5ff3547fbdda406cc006e41bee9e576b";
  placement.insertBefore(script, container);
})();
