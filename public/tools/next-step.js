/* Free tools: once someone uses the tool, the "next step" box under the result glows once so they see it.
   The box itself is plain HTML, so it shows (and search engines read it) even without JavaScript. */
(function () {
  window.addEventListener("DOMContentLoaded", function () {
    var tool = document.querySelector("section.tool");
    var box = document.querySelector("[data-next-step-box]");
    if (!tool || !box) return;
    var done = false;
    function nudge() {
      if (done) return; done = true;
      box.classList.add("pulse");
    }
    tool.addEventListener("change", nudge);
    tool.addEventListener("click", function (e) { if (e.target && e.target.id === "download") nudge(); });
  });
})();
