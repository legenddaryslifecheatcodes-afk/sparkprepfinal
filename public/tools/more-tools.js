/* SparkPrep free tools (2026-10-31): margin & bleed calculator, image DPI checker, page count estimator.
   Each block only runs on the page that has its tool. Nothing is uploaded: the DPI checker reads the picture
   on the visitor's own device.
   KDP numbers are from KDP's own help page "Set Trim Size, Bleed, and Margins":
     inside (gutter) margin by page count: 24-150 = 0.375", 151-300 = 0.5", 301-500 = 0.625", 501-700 = 0.75", 701-828 = 0.875"
     outside, top and bottom margins: at least 0.25" without bleed, at least 0.375" with bleed
     page size with bleed: trim width + 0.125", trim height + 0.25"
   IngramSpark: "All text, borders, and important elements need to be at least 0.5 inch (13 mm) from trim edges"
     (quoted from a real IngramSpark rejection); bleed is 0.125" on the top, bottom and outside edge. */
(function () {
  function $(id) { return document.getElementById(id); }
  function r3(x) { return (Math.round(x * 1000) / 1000).toFixed(3); }
  var TRIMS = [[5, 8], [5.06, 7.81], [5.25, 8], [5.5, 8.5], [6, 9], [6.14, 9.21], [6.69, 9.61], [7, 10], [7.44, 9.69],
    [7.5, 9.25], [8, 10], [8.25, 11], [8.5, 8.5], [8.5, 11]];
  function fillTrims(sel, def) {
    if (!sel) return;
    TRIMS.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t[0] + "x" + t[1]; o.textContent = t[0] + '" x ' + t[1] + '"';
      if (o.value === def) o.selected = true;
      sel.appendChild(o);
    });
  }
  function trimOf(sel) { var t = sel.value.split("x"); return [parseFloat(t[0]), parseFloat(t[1])]; }
  function on(ids, fn) { ids.forEach(function (id) { if ($(id)) $(id).addEventListener("input", fn); }); }

  /* ---------- Margin & bleed calculator ---------- */
  function kdpInside(pages) {
    if (pages <= 150) return 0.375;
    if (pages <= 300) return 0.5;
    if (pages <= 500) return 0.625;
    if (pages <= 700) return 0.75;
    return 0.875;
  }
  function margins() {
    var printer = $("m-printer").value, bleed = $("m-bleed").value === "yes";
    var pages = parseInt($("m-pages").value, 10) || 0, t = trimOf($("m-trim"));
    var pw = bleed ? t[0] + 0.125 : t[0], ph = bleed ? t[1] + 0.25 : t[1];
    var msg = $("m-msg");
    if (printer === "kdp") {
      $("m-inside").textContent = r3(kdpInside(pages)) + '"';
      $("m-outside").textContent = (bleed ? "0.375" : "0.250") + '"';
      $("m-inside-label").textContent = "Inside margin (gutter), at least";
      $("m-outside-label").textContent = "Top, bottom and outside margins, at least";
    } else {
      $("m-inside").textContent = '0.500"';
      $("m-outside").textContent = '0.500"';
      $("m-inside-label").textContent = "Inside margin (gutter), at least";
      $("m-outside-label").textContent = "Top, bottom and outside margins, at least";
    }
    $("m-page").textContent = r3(pw) + '" x ' + r3(ph) + '"';
    $("m-px").textContent = Math.round(pw * 300) + " x " + Math.round(ph * 300) + " px";
    if (pages < 24) { msg.className = "warn"; msg.textContent = "Print books need at least 24 pages. Use the page count from your finished PDF."; }
    else if (printer === "kdp" && pages > 828) { msg.className = "warn"; msg.textContent = "KDP paperbacks top out at 828 pages on white paper. Check KDP's page limits for your paper and size."; }
    else if (printer === "kdp") { msg.className = "ok"; msg.textContent = "These are KDP's minimums for " + pages + " pages. Many books use a little more so the text doesn't sink into the fold."; }
    else { msg.className = "ok"; msg.textContent = "IngramSpark wants everything important at least 0.5\" from every trim edge. Thick books need extra room at the fold, so add some to the inside margin."; }
  }

  /* ---------- Image DPI checker ---------- */
  var img = null;
  function dpi() {
    var msg = $("d-msg");
    var w = parseFloat($("d-w").value) || 0, h = parseFloat($("d-h").value) || 0;
    if (!img) { msg.className = "note"; msg.textContent = "Pick a picture to check. It stays on your device; nothing is uploaded."; return; }
    $("d-px").textContent = img.width + " x " + img.height + " px";
    $("d-max").textContent = r3(img.width / 300).replace(/0+$/, "").replace(/\.$/, "") + '" x ' + r3(img.height / 300).replace(/0+$/, "").replace(/\.$/, "") + '"';
    if (w <= 0 || h <= 0) { $("d-dpi").textContent = "—"; return; }
    var d = Math.min(img.width / w, img.height / h);
    $("d-dpi").textContent = Math.floor(d) + " DPI";
    var shapeOff = Math.abs((img.width / img.height) - (w / h)) / (w / h) > 0.03;
    var shape = shapeOff ? " Your picture is a different shape from the print size, so part of it will be cropped or it will be stretched." : "";
    if (d >= 300) { msg.className = "ok"; msg.textContent = "Good: about " + Math.floor(d) + " DPI at this size. That meets the 300 DPI printers ask for." + shape; }
    else if (d >= 200) { msg.className = "warn"; msg.textContent = "Borderline: about " + Math.floor(d) + " DPI. Printers ask for 300 DPI, and KDP warns about images below that. It may print a little soft." + shape; }
    else { msg.className = "warn"; msg.textContent = "Too low: about " + Math.floor(d) + " DPI. This will likely print blurry or pixelated. You need a bigger original, about " + Math.ceil(w * 300) + " x " + Math.ceil(h * 300) + " px." + shape; }
  }
  function preset() {
    var v = $("d-preset").value;
    if (v === "custom") return;
    var p = v.split("x"); $("d-w").value = p[0]; $("d-h").value = p[1]; dpi();
  }

  /* ---------- Page count estimator ---------- */
  // Rough words per printed page for a typical novel set in 11 pt type with normal margins. An estimate only:
  // fonts, spacing, chapter openings and pictures all change it.
  var WPP = { "5x8": 250, "5.25x8": 265, "5.5x8.5": 290, "6x9": 330, "7x10": 420, "8.5x11": 560 };
  var FONT = { "10.5": 1.08, "11": 1, "12": 0.85 };
  function pagesEst() {
    var words = parseInt(String($("p-words").value).replace(/[^0-9]/g, ""), 10) || 0;
    var per = WPP[$("p-trim").value] * FONT[$("p-font").value];
    var chapters = parseInt($("p-ch").value, 10) || 0;
    var body = Math.ceil(words / per) + chapters; // each chapter opening loses about half a page, plus a blank left page now and then
    var front = 8; // title, copyright, dedication, contents, about the author...
    var total = body + front; if (total % 2) total += 1;
    $("p-pages").textContent = words ? total : "—";
    $("p-white").textContent = words ? r3(total * 0.002252) + '"' : "—";
    $("p-cream").textContent = words ? r3(total * 0.0025) + '"' : "—";
    var msg = $("p-msg");
    if (!words) { msg.className = "note"; msg.textContent = "Type your word count to see an estimate."; }
    else if (total < 24) { msg.className = "warn"; msg.textContent = "About " + total + " pages. Print books need at least 24 pages, so this would need to be longer or a bigger font."; }
    else if (total < 80) { msg.className = "ok"; msg.textContent = "About " + total + " pages. That's under 80, so KDP won't print text on the spine."; }
    else { msg.className = "ok"; msg.textContent = "About " + total + " pages. Your real count comes from your finished PDF, so size your cover from that, not from this estimate."; }
  }

  window.addEventListener("DOMContentLoaded", function () {
    if ($("m-trim")) { fillTrims($("m-trim"), "6x9"); on(["m-printer", "m-trim", "m-pages", "m-bleed"], margins); margins(); }
    if ($("d-file")) {
      on(["d-w", "d-h"], function () { $("d-preset").value = "custom"; dpi(); });
      $("d-preset").addEventListener("input", preset);
      $("d-file").addEventListener("change", function () {
        var f = this.files && this.files[0]; if (!f) return;
        var url = URL.createObjectURL(f), im = new Image();
        im.onload = function () { img = { width: im.naturalWidth, height: im.naturalHeight }; URL.revokeObjectURL(url); dpi(); };
        im.onerror = function () { $("d-msg").className = "warn"; $("d-msg").textContent = "That file couldn't be read as a picture. Try a JPG or PNG."; };
        im.src = url;
      });
      preset(); dpi();
    }
    if ($("p-words")) { on(["p-words", "p-trim", "p-font", "p-ch"], pagesEst); pagesEst(); }
  });
})();
