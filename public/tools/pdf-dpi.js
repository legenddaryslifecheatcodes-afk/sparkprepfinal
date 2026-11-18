/* Free PDF DPI checker (2026-11-09, on /image-dpi-checker/). Reads a PDF in the browser with pdf.js
   (nothing is uploaded), finds every picture on every page and works out its real DPI at the size it is
   placed on the page: picture pixels / (placed size in inches). Printers ask for 300 DPI. */
(function () {
  "use strict";
  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  var MAX_PAGES = 800;
  var $ = function (id) { return document.getElementById(id); };
  if (!$("pdf-file")) return;

  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = PDFJS + "pdf.min.js";
      s.onload = function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
        res(window.pdfjsLib);
      };
      s.onerror = function () { rej(new Error("The PDF reader didn't load. Check your internet connection and try again.")); };
      document.head.appendChild(s);
    });
  }

  function mul(m, n) {   // PDF matrix [a b c d e f]: m then n
    return [m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3], m[2] * n[0] + m[3] * n[2],
            m[2] * n[1] + m[3] * n[3], m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5]];
  }

  function getObj(page, id) {
    var store = id.indexOf("g_") === 0 ? page.commonObjs : page.objs;
    return new Promise(function (res) {
      var done = false, t = setTimeout(function () { if (!done) { done = true; res(null); } }, 4000);
      try {
        store.get(id, function (o) { if (!done) { done = true; clearTimeout(t); res(o); } });
      } catch (_) { clearTimeout(t); res(null); }
    });
  }

  function imagesOnPage(pdfjsLib, page) {
    var OPS = pdfjsLib.OPS;
    return page.getOperatorList().then(function (ol) {
      var ctm = [1, 0, 0, 1, 0, 0], stack = [], found = [];
      for (var i = 0; i < ol.fnArray.length; i++) {
        var fn = ol.fnArray[i], args = ol.argsArray[i];
        if (fn === OPS.save) stack.push(ctm.slice());
        else if (fn === OPS.restore) ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
        else if (fn === OPS.transform) ctm = mul(args, ctm);
        else if (fn === OPS.paintFormXObjectBegin) { stack.push(ctm.slice()); if (args && args[0]) ctm = mul(args[0], ctm); }
        else if (fn === OPS.paintFormXObjectEnd) ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
        else if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject || fn === OPS.paintImageXObjectRepeat) {
          var dimsKnown = fn !== OPS.paintImageXObjectRepeat;   // Repeat's 2nd/3rd args are scales, not pixels
          found.push({ id: args[0], w: dimsKnown ? args[1] : 0, h: dimsKnown ? args[2] : 0, ctm: ctm.slice() });
        } else if (fn === OPS.paintInlineImageXObject && args && args[0]) {
          found.push({ inline: args[0], ctm: ctm.slice() });
        }
      }
      return Promise.all(found.map(function (f) {
        var dims = f.inline ? Promise.resolve(f.inline) : (f.w && f.h ? Promise.resolve({ width: f.w, height: f.h }) : getObj(page, f.id));
        return dims.then(function (o) {
          if (!o || !o.width || !o.height) return null;
          var wIn = Math.hypot(f.ctm[0], f.ctm[1]) / 72, hIn = Math.hypot(f.ctm[2], f.ctm[3]) / 72;
          if (wIn < 0.05 || hIn < 0.05) return null;   // tiny marks, not real pictures
          return { px: o.width + " x " + o.height, size: wIn.toFixed(2) + '" x ' + hIn.toFixed(2) + '"',
                   dpi: Math.floor(Math.min(o.width / wIn, o.height / hIn)) };
        });
      })).then(function (r) { return r.filter(Boolean); });
    });
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function run(file) {
    var msg = $("pdf-msg"), out = $("pdf-out");
    out.innerHTML = ""; msg.className = "note"; msg.textContent = "Opening your PDF…";
    var results = [], pagesDone = 0, total = 0, trim = "";
    loadPdfJs().then(function (pdfjsLib) {
      return file.arrayBuffer().then(function (buf) { return pdfjsLib.getDocument({ data: buf }).promise; }).then(function (doc) {
        total = Math.min(doc.numPages, MAX_PAGES);
        var chain = Promise.resolve();
        for (var p = 1; p <= total; p++) (function (n) {
          chain = chain.then(function () {
            return doc.getPage(n).then(function (page) {
              if (n === 1) { var v = page.view; trim = ((v[2] - v[0]) / 72).toFixed(3) + '" x ' + ((v[3] - v[1]) / 72).toFixed(3) + '"'; }
              return imagesOnPage(pdfjsLib, page).then(function (imgs) {
                imgs.forEach(function (im) { im.page = n; results.push(im); });
                pagesDone++;
                msg.textContent = "Checking page " + pagesDone + " of " + total + "…";
                page.cleanup();
              });
            });
          });
        })(p);
        return chain.then(function () { return doc; });
      });
    }).then(function (doc) {
      report(results, total, doc.numPages, trim);
      try { if (window.spTrack) window.spTrack("click", "PDF DPI check run"); } catch (_) {}
    }).catch(function (e) {
      msg.className = "warn";
      msg.textContent = (e && e.name === "PasswordException") ? "This PDF is password protected. Remove the password and try again."
        : (e && e.message && /load/.test(e.message)) ? e.message : "That file couldn't be read as a PDF.";
    });
  }

  function report(list, checked, all, trim) {
    var msg = $("pdf-msg"), out = $("pdf-out");
    var low = list.filter(function (x) { return x.dpi < 200; }), soft = list.filter(function (x) { return x.dpi >= 200 && x.dpi < 300; });
    $("pdf-count").textContent = list.length;
    $("pdf-low").textContent = low.length + soft.length;
    $("pdf-min").textContent = list.length ? Math.min.apply(null, list.map(function (x) { return x.dpi; })) + " DPI" : "—";
    $("pdf-trim").textContent = trim || "—";
    var more = all > checked ? " Only the first " + checked + " of " + all + " pages were checked." : "";
    if (!list.length) { msg.className = "ok"; msg.textContent = "No pictures found in " + checked + " page" + (checked === 1 ? "" : "s") + ". Text-only pages have no DPI to check." + more; }
    else if (!low.length && !soft.length) { msg.className = "ok"; msg.textContent = "All " + list.length + " pictures are 300 DPI or better at the size they print. Nice." + more; }
    else { msg.className = "warn"; var n = low.length + soft.length; msg.textContent = n + " of " + list.length + (list.length === 1 ? " picture is" : n === 1 ? " pictures is" : " pictures are") + " under 300 DPI at the size they print" + (low.length ? ", and " + low.length + (low.length === 1 ? " is" : " are") + " under 200 DPI, which usually prints blurry" : "") + "." + more; }
    var rows = list.slice().sort(function (a, b) { return a.dpi - b.dpi; }).slice(0, 200).map(function (x) {
      var cls = x.dpi < 200 ? "bad" : x.dpi < 300 ? "soft" : "good";
      return "<tr class='" + cls + "'><td>" + x.page + "</td><td>" + esc(x.px) + "</td><td>" + esc(x.size) + "</td><td><b>" + x.dpi + "</b></td></tr>";
    }).join("");
    out.innerHTML = list.length ? "<div class='table-wrap'><table><tr><th>Page</th><th>Picture pixels</th><th>Printed size</th><th>DPI</th></tr>" + rows + "</table></div>" +
      (list.length > 200 ? "<p class='note'>Showing the 200 lowest.</p>" : "") : "";
  }

  $("pdf-file").addEventListener("change", function () { var f = this.files && this.files[0]; if (f) run(f); });
})();
