/* SparkPrep's own traffic counter. No cookies, nothing saved about you, no ads.
   Sends one tiny note per page view (page, where you came from) so we know which pages help authors.
   The owner's devices opt out by visiting /admin/traffic once. */
(function () {
  if (window.spTrack) return;
  var API = "https://sparkprep-v9fp.onrender.com/api/pv";
  var off = false;
  try { off = localStorage.getItem("sp_notrack") === "1"; } catch (_) {}
  var h = location.hostname;
  if (h === "localhost" || h === "127.0.0.1") off = true;
  var lastPath = "", lastUrl = "";
  var q = new URLSearchParams(location.search);
  var us = q.get("utm_source") || q.get("ref") || "", uc = q.get("utm_campaign") || "";

  function send(event, label) {
    if (off) return;
    try {
      var body = JSON.stringify({
        p: location.pathname, h: location.hostname, e: event || "pageview", l: label || "",
        r: lastUrl || document.referrer || "", us: lastUrl ? "" : us, uc: uc, wd: !!navigator.webdriver
      });
      if (navigator.sendBeacon && navigator.sendBeacon(API, new Blob([body], { type: "text/plain" }))) return;
      fetch(API, { method: "POST", body: body, keepalive: true, mode: "no-cors" });
    } catch (_) {}
  }
  function pageview() {
    if (location.pathname === lastPath) return;
    send("pageview");
    lastPath = location.pathname;
    lastUrl = location.href;
  }
  window.spTrack = function (event, label) { send(event, label); };

  ["pushState", "replaceState"].forEach(function (k) {
    var orig = history[k];
    history[k] = function () { var r = orig.apply(this, arguments); setTimeout(pageview, 50); return r; };
  });
  window.addEventListener("popstate", function () { setTimeout(pageview, 50); });

  // Any link or button with data-track="name" is counted when clicked (e.g. kit downloads, free audit buttons).
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;
    var el = e.target.closest("[data-track]");
    if (el) return send("click", el.getAttribute("data-track"));
    var a = e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var name = /\/audit(\b|\/|\?|$)/.test(href) ? "Free audit button" : /\/register/.test(href) ? "Sign up button"
      : /\/fix-my-file/.test(href) ? "Fix my file button" : /\/pricing/.test(href) ? "Pricing button" : "";
    if (name) send("click", name);
  }, true);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pageview);
  else pageview();
})();
