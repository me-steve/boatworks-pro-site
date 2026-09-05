(function () {
  const storageKey = "boatworks-analytics-consent";
  const measurementId = "G-E49V5BJDB8";
  const banner = document.querySelector("[data-consent-banner]");
  const main = document.getElementById("main-content");
  let returnFocus = null;
  let choice = null;

  try {
    choice = window.localStorage.getItem(storageKey);
  } catch (_) {
    // Storage may be unavailable in private browsing or restricted contexts.
  }

  function loadAnalytics() {
    window["ga-disable-" + measurementId] = false;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
    if (document.querySelector("script[data-google-analytics]")) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    script.dataset.googleAnalytics = "true";
    document.head.appendChild(script);
  }

  function saveChoice(value) {
    choice = value;
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (_) {
      // The choice still applies for the current page when storage is unavailable.
    }
  }

  function disableAnalytics() {
    window["ga-disable-" + measurementId] = true;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    document.cookie.split(";").forEach(function (cookie) {
      const name = cookie.split("=")[0].trim();
      if (name === "_ga" || name.indexOf("_ga_") === 0) {
        document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
        if (window.location.hostname.endsWith("boatworks-pro.com")) {
          document.cookie = name + "=; Max-Age=0; path=/; domain=.boatworks-pro.com; SameSite=Lax";
        }
      }
    });
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
    if (returnFocus) {
      returnFocus.focus();
      returnFocus = null;
    } else if (main) {
      main.focus();
    }
  }

  function showBanner(shouldFocus) {
    if (!banner) return;
    banner.hidden = false;
    if (shouldFocus) {
      const firstButton = banner.querySelector("button");
      if (firstButton) firstButton.focus();
    }
  }

  if (choice === "accepted") {
    loadAnalytics();
  } else if (choice !== "declined") {
    showBanner(false);
  }

  document.querySelectorAll("[data-consent-accept]").forEach(function (button) {
    button.addEventListener("click", function () {
      saveChoice("accepted");
      hideBanner();
      loadAnalytics();
    });
  });

  document.querySelectorAll("[data-consent-decline]").forEach(function (button) {
    button.addEventListener("click", function () {
      saveChoice("declined");
      disableAnalytics();
      hideBanner();
    });
  });

  document.querySelectorAll("[data-consent-settings]").forEach(function (button) {
    button.addEventListener("click", function () {
      returnFocus = button;
      showBanner(true);
    });
  });

  const comparisonToggles = Array.from(document.querySelectorAll(".comparison-section-toggle"));

  let comparisonAnimationSequence = 0;

  function comparisonPanel(button) {
    return button ? document.getElementById(button.getAttribute("aria-controls")) : null;
  }

  function comparisonRows(panel) {
    return panel ? Array.from(panel.querySelectorAll("tr")) : [];
  }

  function openComparisonSection(activeButton, shouldAnimate) {
    const currentButton = comparisonToggles.find(function (button) {
      return button.getAttribute("aria-expanded") === "true";
    });
    if (shouldAnimate && currentButton === activeButton) return;

    const currentPanel = comparisonPanel(currentButton);
    const activePanel = comparisonPanel(activeButton);
    const panels = comparisonToggles.map(comparisonPanel).filter(Boolean);
    const sequence = ++comparisonAnimationSequence;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canAnimate = shouldAnimate && !reduceMotion && activePanel &&
      comparisonRows(activePanel).every(function (row) { return typeof row.animate === "function"; });

    panels.forEach(function (panel) {
      comparisonRows(panel).forEach(function (row) {
        row.getAnimations().forEach(function (animation) { animation.cancel(); });
      });
      if (panel !== currentPanel && panel !== activePanel) panel.hidden = true;
    });

    comparisonToggles.forEach(function (button) {
      button.setAttribute("aria-expanded", String(button === activeButton));
    });

    if (!canAnimate || !currentPanel || currentPanel === activePanel) {
      panels.forEach(function (panel) { panel.hidden = panel !== activePanel; });
      return;
    }

    const tableWrap = activePanel.closest(".table-wrap");
    if (!tableWrap) {
      panels.forEach(function (panel) { panel.hidden = panel !== activePanel; });
      return;
    }

    tableWrap.getAnimations().forEach(function (animation) { animation.cancel(); });
    tableWrap.style.removeProperty("height");
    tableWrap.style.removeProperty("overflow-y");
    currentPanel.hidden = false;
    activePanel.hidden = true;
    const startingHeight = tableWrap.offsetHeight;
    tableWrap.style.height = startingHeight + "px";
    tableWrap.style.overflowY = "hidden";

    const outgoingAnimations = comparisonRows(currentPanel).map(function (row) {
      return row.animate([
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-6px)" }
      ], { duration: 130, easing: "ease-in", fill: "both" });
    });

    Promise.all(outgoingAnimations.map(function (animation) {
      return animation.finished.catch(function () {});
    })).then(function () {
      if (sequence !== comparisonAnimationSequence) return;
      currentPanel.hidden = true;
      activePanel.hidden = false;
      outgoingAnimations.forEach(function (animation) { animation.cancel(); });

      const targetHeight = tableWrap.scrollHeight;
      const resizeAnimation = tableWrap.animate([
        { height: startingHeight + "px" },
        { height: targetHeight + "px" }
      ], { duration: 240, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
      const incomingAnimations = comparisonRows(activePanel).map(function (row, index) {
        return row.animate([
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 210, delay: Math.min(index * 18, 54), easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
      });

      const finished = [resizeAnimation].concat(incomingAnimations).map(function (animation) {
        return animation.finished.catch(function () {});
      });
      Promise.all(finished).then(function () {
        if (sequence !== comparisonAnimationSequence) return;
        resizeAnimation.cancel();
        incomingAnimations.forEach(function (animation) { animation.cancel(); });
        tableWrap.style.removeProperty("height");
        tableWrap.style.removeProperty("overflow-y");
      });
    });
  }

  if (comparisonToggles.length) {
    const initiallyOpen = comparisonToggles.find(function (button) {
      return button.getAttribute("aria-expanded") === "true";
    }) || comparisonToggles[0];

    openComparisonSection(initiallyOpen, false);

    comparisonToggles.forEach(function (button, index) {
      button.addEventListener("click", function () {
        openComparisonSection(button, true);
      });

      button.addEventListener("keydown", function (event) {
        let nextIndex = null;
        if (event.key === "ArrowDown") nextIndex = (index + 1) % comparisonToggles.length;
        if (event.key === "ArrowUp") nextIndex = (index - 1 + comparisonToggles.length) % comparisonToggles.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = comparisonToggles.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        comparisonToggles[nextIndex].focus();
      });
    });
  }
}());
