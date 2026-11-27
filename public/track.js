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

  // Trouble report (2026-11-27): if a page crashes, or the browser can't reach our server, send one short note
  // (the error text, never what the person typed) so the owner's Insights page shows it within a minute.
  var TROUBLE = API.replace(/\/pv$/, "/trouble"), sentTrouble = {}, troubleCount = 0;
  function trouble(kind, msg, src) {
    if (off) return;
    try {
      msg = String(msg || "").slice(0, 300);
      var key = kind + "|" + msg;
      if (sentTrouble[key] || troubleCount >= 5) return;
      sentTrouble[key] = 1; troubleCount++;
      var body = JSON.stringify({ k: kind, m: msg, s: String(src || "").slice(0, 160), p: location.pathname, wd: !!navigator.webdriver });
      if (navigator.sendBeacon) navigator.sendBeacon(TROUBLE, new Blob([body], { type: "text/plain" }));
    } catch (_) {}
  }
  window.spTrouble = trouble;
  window.addEventListener("error", function (e) {
    if (!e || !e.message) return;                     // a picture that failed to load, not a crash
    var f = e.filename || "";
    if (/^(chrome|moz|safari)-extension:/.test(f)) return; // the visitor's own browser add-ons
    if (/ResizeObserver loop/.test(e.message)) return;    // harmless browser notice
    trouble("page_error", e.message, f.split("/").pop() + ":" + (e.lineno || 0));
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    if (r && (r.isAxiosError || r.response)) return;     // the server already records its own error answers
    trouble("page_error", r && (r.message || r) || "Something failed in the background", "");
  });
  // "Couldn't reach the server": watch (never change) requests to our API that fail before any answer comes back.
  var apiHost = API.split("/").slice(0, 3).join("/");
  function isOurs(u) { u = String(u || ""); return u.indexOf(apiHost) === 0 && !/\/api\/(pv|trouble)\b/.test(u); }
  try {
    var xo = XMLHttpRequest.prototype.open, xs = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__spUrl = u; return xo.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
      var x = this;
      if (isOurs(x.__spUrl)) x.addEventListener("loadend", function () {
        if (x.status === 0 && navigator.onLine !== false) trouble("offline", "No answer from the server", String(x.__spUrl).replace(apiHost, ""));
      });
      return xs.apply(this, arguments);
    };
  } catch (_) {}
  if (window.fetch) {
    var of = window.fetch;
    window.fetch = function (input) {
      var u = typeof input === "string" ? input : (input && input.url) || "";
      var p = of.apply(this, arguments);
      if (isOurs(u)) p.catch(function () { if (navigator.onLine !== false) trouble("offline", "No answer from the server", u.replace(apiHost, "")); });
      return p;
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pageview);
  else pageview();
})();
