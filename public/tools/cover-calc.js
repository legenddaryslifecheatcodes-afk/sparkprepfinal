/* SparkPrep free cover / spine calculator.
   KDP numbers are KDP's own published paperback formula (KDP Help, "Paperback cover"):
     spine = page count x 0.002252" (white & standard color), 0.0025" (cream), 0.002347" (premium color)
     full cover width = 0.125 bleed + back + spine + front + 0.125 bleed;  height = trim height + 0.25"
     spine text only on books with more than 79 pages.
   IngramSpark numbers are pages-per-inch from IngramSpark's paper specification sheet; IngramSpark's own
   cover template generator is the final word, so results are labelled as estimates. */
(function () {
  var PAPERS = {
    kdp: [
      { id: "white", label: "White paper (black & white)", perPage: 0.002252 },
      { id: "cream", label: "Cream paper (black & white)", perPage: 0.0025 },
      { id: "std-color", label: "Standard color", perPage: 0.002252 },
      { id: "prem-color", label: "Premium color", perPage: 0.002347 }
    ],
    ingramspark: [
      { id: "white", label: "White 50# (black & white)", perPage: 1 / 512 },
      { id: "creme", label: "Creme 50# (black & white)", perPage: 1 / 444 },
      { id: "groundwood", label: "Groundwood 38#", perPage: 1 / 400 },
      { id: "color", label: "Color / Premium color 70#", perPage: 1 / 377 }
    ]
  };
  var TRIMS = [[5, 8], [5.06, 7.81], [5.25, 8], [5.5, 8.5], [6, 9], [6.14, 9.21], [6.69, 9.61], [7, 10], [7.44, 9.69],
    [7.5, 9.25], [8, 10], [8.25, 6], [8.25, 8.25], [8.5, 8.5], [8.5, 11]];
  var BLEED = 0.125;
  var SPINE_TEXT_MIN = { kdp: 80, ingramspark: 48 }; // KDP: "more than 79 pages"; IngramSpark: not below 48

  function $(id) { return document.getElementById(id); }
  function r3(x) { return (Math.round(x * 1000) / 1000).toFixed(3); }

  function fillSelect(sel, items, valueOf, labelOf, selected) {
    sel.innerHTML = "";
    items.forEach(function (it) {
      var o = document.createElement("option");
      o.value = valueOf(it); o.textContent = labelOf(it);
      if (o.value === selected) o.selected = true;
      sel.appendChild(o);
    });
  }

  function calc() {
    var platform = $("platform") ? $("platform").value : "kdp";
    var paper = PAPERS[platform].filter(function (p) { return p.id === $("paper").value; })[0] || PAPERS[platform][0];
    var tw, th;
    if ($("trim").value === "custom") { tw = parseFloat($("cw").value) || 0; th = parseFloat($("ch").value) || 0; }
    else { var t = $("trim").value.split("x"); tw = parseFloat(t[0]); th = parseFloat(t[1]); }
    var pages = parseInt($("pages").value, 10) || 0;
    var spine = pages * paper.perPage;
    var width = BLEED + tw + spine + tw + BLEED;
    var height = th + 2 * BLEED;
    var out = { platform: platform, paper: paper, tw: tw, th: th, pages: pages, spine: spine, width: width, height: height };
    render(out);
    return out;
  }

  function render(o) {
    if ($("r-spine")) $("r-spine").textContent = r3(o.spine) + '"';
    if ($("r-width")) $("r-width").textContent = r3(o.width) + '"';
    if ($("r-height")) $("r-height").textContent = r3(o.height) + '"';
    if ($("r-px")) $("r-px").textContent = Math.round(o.width * 300) + " x " + Math.round(o.height * 300) + " px";
    if ($("r-mm")) $("r-mm").textContent = (o.spine * 25.4).toFixed(2) + " mm";
    var msg = $("r-msg");
    if (msg) {
      var min = SPINE_TEXT_MIN[o.platform];
      var est = o.platform === "ingramspark" ? " (estimate — confirm with IngramSpark's own cover template)" : "";
      if (o.pages <= 0) { msg.className = "warn"; msg.textContent = "Enter your page count from your final, formatted interior PDF."; }
      else if (o.pages < min) { msg.className = "warn"; msg.textContent = "At " + o.pages + " pages your spine is too thin for spine text" + (o.platform === "kdp" ? " (KDP prints spine text only on books with more than 79 pages)." : " (IngramSpark: no spine text below 48 pages).") + est; }
      else { msg.className = "ok"; msg.textContent = "Spine text is allowed. Keep spine text away from the fold lines — leave at least 0.0625\" on each side." + est; }
    }
    if ($("template")) drawTemplate(o);
  }

  function drawTemplate(o) {
    var c = $("template"), ctx = c.getContext("2d");
    var dpi = 60; // on-screen preview scale; the download is redrawn at 300 dpi
    paint(ctx, c, o, dpi);
  }

  function paint(ctx, c, o, dpi) {
    var W = Math.max(1, Math.round(o.width * dpi)), H = Math.max(1, Math.round(o.height * dpi));
    c.width = W; c.height = H;
    var u = function (inch) { return inch * dpi; };
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    // bleed area
    ctx.fillStyle = "rgba(224,87,79,0.18)";
    ctx.fillRect(0, 0, W, u(BLEED)); ctx.fillRect(0, H - u(BLEED), W, u(BLEED));
    ctx.fillRect(0, 0, u(BLEED), H); ctx.fillRect(W - u(BLEED), 0, u(BLEED), H);
    // spine
    var sx = u(BLEED + o.tw), sw = u(o.spine);
    ctx.fillStyle = "rgba(212,175,55,0.30)"; ctx.fillRect(sx, u(BLEED), sw, H - 2 * u(BLEED));
    // safe zones (0.25" inside trim on each panel, KDP guidance) -- dashed
    ctx.setLineDash([u(0.08), u(0.06)]); ctx.strokeStyle = "#2f80ed"; ctx.lineWidth = Math.max(1, dpi / 60);
    var safe = 0.25;
    ctx.strokeRect(u(BLEED + safe), u(BLEED + safe), u(o.tw - 2 * safe), u(o.th - 2 * safe));
    ctx.strokeRect(sx + sw + u(safe), u(BLEED + safe), u(o.tw - 2 * safe), u(o.th - 2 * safe));
    ctx.setLineDash([]);
    // trim line
    ctx.strokeStyle = "#111"; ctx.lineWidth = Math.max(1, dpi / 50);
    ctx.strokeRect(u(BLEED), u(BLEED), W - 2 * u(BLEED), H - 2 * u(BLEED));
    // barcode area on back cover (2" x 1.2", bottom-right of back panel, 0.25" in from trim)
    ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.strokeStyle = "#555";
    var bx = sx - u(0.25) - u(2), by = H - u(BLEED) - u(0.25) - u(1.2);
    ctx.fillRect(bx, by, u(2), u(1.2)); ctx.strokeRect(bx, by, u(2), u(1.2));
    // labels
    ctx.fillStyle = "#222"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "bold " + Math.round(dpi * 0.28) + "px Segoe UI, Arial";
    ctx.fillText("BACK COVER", u(BLEED + o.tw / 2), H / 2);
    ctx.fillText("FRONT COVER", sx + sw + u(o.tw / 2), H / 2);
    ctx.font = Math.round(dpi * 0.13) + "px Segoe UI, Arial";
    ctx.fillText("Barcode area", bx + u(1), by + u(0.6));
    if (sw > dpi * 0.2) {
      ctx.save(); ctx.translate(sx + sw / 2, H / 2); ctx.rotate(-Math.PI / 2);
      ctx.font = "bold " + Math.round(Math.min(dpi * 0.2, sw * 0.6)) + "px Segoe UI, Arial";
      ctx.fillText("SPINE " + r3(o.spine) + '"', 0, 0); ctx.restore();
    }
    ctx.textAlign = "left"; ctx.font = Math.round(dpi * 0.12) + "px Segoe UI, Arial"; ctx.fillStyle = "#b03a33";
    ctx.fillText("Red = bleed (gets cut off)   Gold = spine   Black = trim line   Blue dashes = keep text inside (a safe 0.25\" margin)", u(0.2), u(0.07) + dpi * 0.08);
    ctx.fillStyle = "#555"; ctx.textAlign = "right";
    ctx.fillText("Made with SparkPrep — sparkprep.legenddary.com", W - u(0.2), H - u(0.04) - dpi * 0.03);
  }

  function download() {
    var o = calc();
    var c = document.createElement("canvas");
    paint(c.getContext("2d"), c, o, 300);
    var a = document.createElement("a");
    a.download = (o.platform === "kdp" ? "KDP" : "IngramSpark") + "-cover-template-" + o.tw + "x" + o.th + "-" + o.pages + "pages.png";
    a.href = c.toDataURL("image/png");
    a.click();
  }

  function setupPapers() {
    var platform = $("platform") ? $("platform").value : "kdp";
    fillSelect($("paper"), PAPERS[platform], function (p) { return p.id; }, function (p) { return p.label; }, $("paper").value);
  }

  window.addEventListener("DOMContentLoaded", function () {
    if (!$("paper")) return;
    fillSelect($("trim"), TRIMS.concat([["custom", ""]]), function (t) { return t[0] === "custom" ? "custom" : t[0] + "x" + t[1]; },
      function (t) { return t[0] === "custom" ? "Custom size…" : t[0] + '" x ' + t[1] + '"'; }, "6x9");
    setupPapers();
    ["trim", "pages", "paper", "cw", "ch"].forEach(function (id) { if ($(id)) $(id).addEventListener("input", function () {
      if ($("custom-row")) $("custom-row").style.display = $("trim").value === "custom" ? "grid" : "none"; calc(); }); });
    if ($("platform")) $("platform").addEventListener("input", function () { setupPapers(); calc(); });
    if ($("download")) $("download").addEventListener("click", download);
    calc();
  });
})();

/* Email box that opens the calculator. No account and no password: the email is saved to SparkPrep's list
   and remembered on this device, so the box only shows once. The calculator and the page text stay in the page. */
(function () {
  var API = "https://sparkprep-v9fp.onrender.com/api/leads";
  var KEY = "sp_tool_email", PENDING = "sp_tool_email_pending";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function source() { return (location.pathname.replace(/^\/+|\/+$/g, "") || "tools").split("/")[0]; }

  function send(email) {
    set(PENDING, email);   // kept until the server says it has it, so a slow or sleeping server never loses an email
    try {
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ email: email, source: source() }) })
        .then(function (r) { if (r.ok || r.status === 422) set(PENDING, null); }).catch(function () {});
    } catch (e) {}
  }

  window.addEventListener("DOMContentLoaded", function () {
    var tool = document.querySelector("section.tool");
    if (!tool) return;
    if (get(PENDING)) send(get(PENDING));
    if (get(KEY)) return;

    tool.classList.add("gated");
    var gate = document.createElement("div");
    gate.className = "gate";
    gate.innerHTML =
      '<form novalidate>' +
      '<h2>Enter your email to open this free tool</h2>' +
      '<p>No account. No password. Just your email.</p>' +
      '<input type="email" name="email" autocomplete="email" placeholder="you@example.com" aria-label="Your email" required>' +
      '<button class="btn" type="submit">Open the free tool</button>' +
      '<div class="err" role="alert"></div>' +
      '<p class="note">We\'ll send you helpful self-publishing tips now and then. Unsubscribe anytime.</p>' +
      '</form>';
    tool.appendChild(gate);
    var form = gate.querySelector("form"), input = gate.querySelector("input"), err = gate.querySelector(".err");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (input.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = "Please enter a real email address."; input.focus(); return; }
      set(KEY, email);
      send(email);
      gate.remove();
      tool.classList.remove("gated");
    });
  });
})();
