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
}());
