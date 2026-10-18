(() => {
  const main = document.querySelector("main");
  if (!main) return;

  const sections = Array.from(main.children).filter((element) => element.tagName === "SECTION");
  const contentSections = sections.filter((section) => !section.classList.contains("intro"));
  const language = (document.documentElement.lang || "en").slice(0, 2);
  const labels = {
    en: { section: "Advertisement", ad: "Advertisement" },
    ar: { section: "إعلان", ad: "إعلان" },
    fr: { section: "Publicité", ad: "Publicité" }
  }[language] || { section: "Advertisement", ad: "Advertisement" };

  let bannerTarget;
  let nativeTarget;
  const toolkit = sections.find((section) => section.getAttribute("aria-labelledby") === "more-tools-title");
  const pdfPromo = sections.find((section) => section.getAttribute("aria-labelledby") === "pdf-promo-title");

  if (toolkit && pdfPromo) {
    bannerTarget = toolkit;
    nativeTarget = pdfPromo;
  } else {
    const workspace = sections.find((section) =>
      section.classList.contains("workspace") || section.classList.contains("pdf-workspace")
    );

    if (workspace) {
      bannerTarget = workspace;
      const workspaceIndex = sections.indexOf(workspace);
      nativeTarget = sections.slice(workspaceIndex + 1).find((section) =>
        section.classList.contains("section")
      ) || contentSections.find((section) => section !== workspace);
    } else if (contentSections.length >= 2) {
      const firstIndex = Math.max(0, Math.ceil(contentSections.length / 3) - 1);
      const secondIndex = Math.max(firstIndex + 1, Math.ceil(contentSections.length * 2 / 3) - 1);
      bannerTarget = contentSections[Math.min(firstIndex, contentSections.length - 1)];
      nativeTarget = contentSections[Math.min(secondIndex, contentSections.length - 1)];
    } else {
      const content = contentSections[0] || sections[0] || main;
      const blocks = Array.from(content.children).filter((element) =>
        /^(P|H2|H3|UL|OL|FORM|DIV|A)$/.test(element.tagName)
      );
      if (blocks.length >= 2) {
        const firstIndex = Math.max(0, Math.ceil(blocks.length / 3) - 1);
        const secondIndex = Math.max(firstIndex + 1, Math.ceil(blocks.length * 2 / 3) - 1);
        bannerTarget = blocks[Math.min(firstIndex, blocks.length - 1)];
        nativeTarget = blocks[Math.min(secondIndex, blocks.length - 1)];
      } else {
        bannerTarget = content;
        nativeTarget = content;
      }
    }
  }

  if (!bannerTarget) return;
  if (!nativeTarget) nativeTarget = bannerTarget;

  const makeLabel = () => {
    const label = document.createElement("p");
    label.textContent = labels.ad;
    label.style.cssText = "margin:0 0 8px;font-size:.75rem;opacity:.7;";
    return label;
  };

  const banner = document.createElement("aside");
  banner.className = "ad-placement ad-placement-banner";
  banner.setAttribute("aria-label", labels.section);
  banner.style.cssText = "box-sizing:border-box;width:min(300px,calc(100vw - 32px));min-height:270px;margin:2rem auto;padding:10px;text-align:center;overflow:hidden;";
  banner.appendChild(makeLabel());
  const bannerFrame = document.createElement("div");
  bannerFrame.style.cssText = "width:300px;max-width:100%;min-height:250px;margin:0 auto;overflow:hidden;";
  banner.appendChild(bannerFrame);
  bannerTarget.insertAdjacentElement("afterend", banner);

  const options = document.createElement("script");
  options.textContent = "window.atOptions = { 'key': '6d2ee8446c93e24bfcfd39c2423d7b10', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} };";
  bannerFrame.appendChild(options);
  const bannerScript = document.createElement("script");
  bannerScript.async = true;
  bannerScript.src = "https://bauval.org/22/6d2ee8446c93e24bfcfd39c2423d7b10";
  bannerFrame.appendChild(bannerScript);
  window.setTimeout(() => {
    if (banner.isConnected && !bannerFrame.querySelector("iframe, img, video")) banner.remove();
  }, 20000);

  const native = document.createElement("aside");
  native.className = "ad-placement ad-placement-native";
  native.setAttribute("aria-label", labels.section);
  native.style.cssText = "box-sizing:border-box;width:min(calc(100% - 32px),760px);margin:2rem auto;padding:12px;text-align:center;border:1px solid rgba(127,127,127,.2);border-radius:16px;";
  native.appendChild(makeLabel());
  const container = document.createElement("div");
  container.id = "container-5ff3547fbdda406cc006e41bee9e576b";
  container.style.cssText = "width:100%;min-height:60px;";
  native.appendChild(container);

  if (nativeTarget === bannerTarget) {
    banner.insertAdjacentElement("afterend", native);
  } else {
    nativeTarget.insertAdjacentElement("afterend", native);
  }

  const nativeScript = document.createElement("script");
  nativeScript.async = true;
  nativeScript.setAttribute("data-cfasync", "false");
  nativeScript.src = "https://bauval.org/21/5ff3547fbdda406cc006e41bee9e576b";
  native.insertBefore(nativeScript, container);
  window.setTimeout(() => {
    if (native.isConnected && container.childElementCount === 0) native.remove();
  }, 20000);
})();
