// Shared behaviour for every Feature Library page: the click-to-play demo and the opt-in assistant.
(function () {
  // Demo video: never autoplays. It starts only when the visitor presses play, then loops silently.
  var v = document.getElementById("demo"), b = document.getElementById("demo-play");
  if (v && b) {
    b.addEventListener("click", function () {
      if (v.paused) { v.play(); b.textContent = "Pause the demo"; } else { v.pause(); b.textContent = "Play the demo"; }
    });
    v.addEventListener("click", function () { b.click(); });
  }

  // The assistant: opt-in only. Nothing is spoken until the visitor presses play. Uses the browser's own voice.
  var KEY = "sp_feature_assistant_off";
  var box = document.getElementById("asst");
  if (!box) return;
  var offMsg = document.getElementById("asst-offmsg");
  var play = document.getElementById("asst-play"), mute = document.getElementById("asst-mute"), replay = document.getElementById("asst-replay");
  var text = document.getElementById("asst-text").textContent;
  var synth = window.speechSynthesis, muted = false;
  function isOff() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function setOff(on) { try { on ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); } catch (e) {} }
  function show(on) { box.hidden = !on; offMsg.hidden = on; if (!on && synth) synth.cancel(); }
  if (!synth) { play.hidden = true; document.getElementById("asst-note").insertAdjacentText("afterbegin", "Your browser can't play his voice, so here's what he says. "); }
  function speak() {
    if (!synth) return;
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1.05; muted = false; mute.textContent = "Mute";
    var en = synth.getVoices().filter(function (x) { return /^en(-|_)US/i.test(x.lang); });
    if (en.length) u.voice = en[0];
    u.onstart = function () { box.classList.add("speaking"); };
    u.onend = u.onerror = function () { box.classList.remove("speaking"); };
    synth.speak(u);
    play.hidden = true; mute.hidden = false; replay.hidden = false;
  }
  play.addEventListener("click", speak);
  replay.addEventListener("click", speak);
  mute.addEventListener("click", function () {
    muted = !muted; mute.textContent = muted ? "Unmute" : "Mute";
    if (!synth) return;
    if (muted) synth.pause(); else if (synth.paused) synth.resume(); else speak();
  });
  document.getElementById("asst-off").addEventListener("click", function () { setOff(true); show(false); });
  document.getElementById("asst-on").addEventListener("click", function () { setOff(false); show(true); });
  show(!isOff());
})();
