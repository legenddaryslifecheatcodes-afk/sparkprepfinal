/* SparkPrep free File Manager for Authors (/author-file-manager/, 2026-11-09).
   Everything is stored in this browser's IndexedDB. Nothing is uploaded anywhere. */
(function () {
  "use strict";
  var DB_NAME = "sparkprep-file-manager", DB_VER = 1;
  var DEFAULT_FOLDERS = [
    { id: "book", name: "My Book", hint: "The manuscript you're working on now.", book: true },
    { id: "drafts", name: "Drafts & Edits", hint: "Older versions and your editor's markup. Same name twice? Both are kept.", book: true },
    { id: "notes", name: "Notes", hint: "Ideas, characters, timelines, feedback. Tap New note." },
    { id: "cover", name: "Cover Files", hint: "Front cover, full wrap, artwork, barcode.", book: true },
    { id: "research", name: "Research", hint: "Sources, pictures, links you saved." },
    { id: "marketing", name: "Marketing", hint: "Blurbs, ads, author photo, launch plan." },
    { id: "paperwork", name: "Publishing Paperwork", hint: "ISBNs, contracts, printer emails, receipts." },
    { id: "other", name: "Other Files", hint: "Anything else. Every kind of file works." }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var db, folders = [], items = [], current = "book", editingNote = null, query = "";

  function track(label) { try { if (window.spTrack) window.spTrack("click", label); } catch (_) {} }

  function open() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error("no-idb"));
      var r = indexedDB.open(DB_NAME, DB_VER);
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains("items")) d.createObjectStore("items", { keyPath: "id" });
        if (!d.objectStoreNames.contains("folders")) d.createObjectStore("folders", { keyPath: "id" });
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function tx(store, mode, fn) {
    return new Promise(function (res, rej) {
      var t = db.transaction(store, mode), s = t.objectStore(store), out = fn(s);
      t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
      t.onerror = function () { rej(t.error); };
      t.onabort = function () { rej(t.error); };
    });
  }
  function all(store) {
    return new Promise(function (res, rej) {
      var r = db.transaction(store).objectStore(store).getAll();
      r.onsuccess = function () { res(r.result || []); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function put(store, obj) { return tx(store, "readwrite", function (s) { s.put(obj); }); }
  function del(store, id) { return tx(store, "readwrite", function (s) { s["delete"](id); }); }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function size(n) {
    if (n == null) return "";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(0) + " KB";
    if (n < 1073741824) return (n / 1048576).toFixed(1) + " MB";
    return (n / 1073741824).toFixed(2) + " GB";
  }
  function when(t) {
    var d = new Date(t);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + ", " +
      d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  function ext(name) { var m = /\.([a-z0-9]{1,5})$/i.exec(name || ""); return m ? m[1].toUpperCase() : "FILE"; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function isBookFile(it) { return it.kind === "file" && /\.(pdf|docx?|odt|rtf|epub|jpe?g|png|tiff?)$/i.test(it.name); }
  function folderOf(id) { for (var i = 0; i < folders.length; i++) if (folders[i].id === id) return folders[i]; return folders[0]; }

  function renderFolders() {
    var counts = {};
    items.forEach(function (it) { counts[it.folder] = (counts[it.folder] || 0) + 1; });
    $("fm-folders").innerHTML = folders.map(function (f) {
      return '<button type="button" data-f="' + esc(f.id) + '" class="' + (f.id === current && !query ? "on" : "") + '"><span>' +
        esc(f.name) + '</span><span class="n">' + (counts[f.id] || 0) + "</span></button>";
    }).join("");
  }

  function renderList() {
    var list, f = folderOf(current);
    if (query) {
      var q = query.toLowerCase();
      list = items.filter(function (it) { return it.name.toLowerCase().indexOf(q) >= 0 || (it.text || "").toLowerCase().indexOf(q) >= 0; });
      $("fm-folder-title").textContent = 'Search: "' + query + '"';
      $("fm-folder-hint").textContent = list.length + " found";
    } else {
      list = items.filter(function (it) { return it.folder === current; });
      $("fm-folder-title").textContent = f.name;
      $("fm-folder-hint").textContent = f.hint || "";
    }
    list.sort(function (a, b) { return b.updated - a.updated; });
    var folderOpts = folders.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.name) + "</option>"; }).join("");
    $("fm-list").innerHTML = list.length ? list.map(function (it) {
      var icon = it.kind === "note" ? "NOTE" : ext(it.name);
      var sub = (it.kind === "note" ? "Note" : size(it.size)) + " · " + when(it.updated) + (query ? " · " + esc(folderOf(it.folder).name) : "");
      var check = isBookFile(it) && folderOf(it.folder).book
        ? '<a class="check" href="/audit?utm_source=file-manager" data-track="File manager: check this file">Check free</a>' : "";
      return '<li data-id="' + esc(it.id) + '"><span class="fm-ico" data-thumb="' + esc(it.id) + '">' + esc(icon) + '</span>' +
        '<span class="fm-meta"><button type="button" class="fm-name" data-a="open">' + esc(it.name) + '</button><span class="fm-sub">' + sub + "</span></span>" +
        '<span class="fm-acts">' + check +
        (it.kind === "file" ? '<button type="button" data-a="dl">Download</button>' : "") +
        '<button type="button" data-a="rename">Rename</button>' +
        '<select data-a="move" aria-label="Move to folder"><option value="">Move to…</option>' + folderOpts + "</select>" +
        '<button type="button" data-a="del">Delete</button></span></li>';
    }).join("") : '<li class="fm-empty">' + (query ? "Nothing matches." : current === "notes" ? "No notes yet. Tap New note." : "Nothing here yet.") + "</li>";
    $("fm-drop").hidden = !!query;
    var hasBook = items.some(function (it) { return isBookFile(it) && folderOf(it.folder).book; });
    $("fm-cta").hidden = !hasBook;
    thumbs(list);
    renderFolders();
    usage();
  }

  var urls = [];
  function thumbs(list) {
    urls.forEach(URL.revokeObjectURL); urls = [];
    list.forEach(function (it) {
      if (it.kind !== "file" || !it.blob || !/^image\//.test(it.type || "")) return;
      var el = document.querySelector('[data-thumb="' + it.id + '"]');
      if (!el) return;
      var u = URL.createObjectURL(it.blob); urls.push(u);
      el.innerHTML = '<img alt="" src="' + u + '">';
    });
  }

  function usage() {
    var total = items.reduce(function (s, it) { return s + (it.size || (it.text || "").length); }, 0);
    var line = items.length + " item" + (items.length === 1 ? "" : "s") + " · " + size(total) + " used";
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(function (e) {
        if (e && e.quota) line += " of about " + size(e.quota) + " this browser allows";
        $("fm-usage").textContent = line;
      }).catch(function () { $("fm-usage").textContent = line; });
    } else $("fm-usage").textContent = line;
  }

  function addFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    var target = current === "notes" ? "other" : current;   // notes folder holds written notes; files go to Other
    var jobs = files.map(function (file) {
      var it = { id: uid(), kind: "file", folder: target, name: file.name, type: file.type, size: file.size, blob: file, updated: Date.now() };
      return put("items", it).then(function () { items.push(it); });
    });
    Promise.all(jobs).then(function () {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
      if (target !== current) current = target;
      query = ""; $("fm-search").value = "";
      renderList();
      track("File manager: file added");
    }).catch(function (e) { alert("Couldn't save that file here: " + (e && e.name === "QuotaExceededError" ? "this browser is out of space." : (e && e.message) || "unknown error")); });
  }

  function openItem(it) {
    if (it.kind === "note") return openNote(it);
    var body = $("fm-view-body"), u = URL.createObjectURL(it.blob);
    $("fm-view-name").textContent = it.name;
    if (/^image\//.test(it.type)) body.innerHTML = '<img alt="" src="' + u + '">';
    else if (it.type === "application/pdf" || /\.pdf$/i.test(it.name)) body.innerHTML = '<iframe title="PDF preview" src="' + u + '"></iframe>';
    else if (/^text\//.test(it.type) || /\.(txt|md|csv)$/i.test(it.name)) {
      it.blob.text().then(function (t) { body.innerHTML = "<pre>" + esc(t) + "</pre>"; });
    } else { download(it); URL.revokeObjectURL(u); return; }
    $("fm-view").showModal();
    $("fm-view").addEventListener("close", function once() { URL.revokeObjectURL(u); body.innerHTML = ""; $("fm-view").removeEventListener("close", once); });
  }

  function download(it) {
    var blob = it.kind === "note" ? new Blob([it.text || ""], { type: "text/plain" }) : it.blob;
    var a = document.createElement("a"), u = URL.createObjectURL(blob);
    a.href = u; a.download = it.kind === "note" ? it.name.replace(/[\\/:*?"<>|]/g, "-") + ".txt" : it.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }

  function openNote(it) {
    editingNote = it || null;
    $("fm-note-title").value = it ? it.name : "";
    $("fm-note-text").value = it ? it.text || "" : "";
    $("fm-note-saved").textContent = it ? "Last saved " + when(it.updated) : "";
    $("fm-note").showModal();
    $("fm-note-text").focus();
  }
  function saveNote() {
    var title = $("fm-note-title").value.trim() || "Untitled note", text = $("fm-note-text").value;
    var isNew = !editingNote;
    var it = editingNote || { id: uid(), kind: "note", folder: current === "notes" || query ? "notes" : current };
    it.name = title; it.text = text; it.size = new Blob([text]).size; it.updated = Date.now();
    put("items", it).then(function () {
      if (isNew) { items.push(it); track("File manager: note created"); }
      editingNote = it;
      $("fm-note-saved").textContent = "Saved " + when(it.updated);
      renderList();
    });
  }

  function loadZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s.onload = function () { res(window.JSZip); };
      s.onerror = function () { rej(new Error("Couldn't load the backup tool. Check your internet and try again.")); };
      document.head.appendChild(s);
    });
  }
  function backup() {
    if (!items.length) return alert("There's nothing to back up yet.");
    var btn = $("fm-backup"); btn.disabled = true; btn.textContent = "Making your backup…";
    loadZip().then(function (JSZip) {
      var zip = new JSZip(), used = {};
      items.forEach(function (it) {
        var f = folderOf(it.folder).name.replace(/[\\/:*?"<>|]/g, "-");
        var name = it.kind === "note" ? it.name.replace(/[\\/:*?"<>|]/g, "-") + ".txt" : it.name;
        var path = f + "/" + name, n = 2;
        while (used[path]) { path = f + "/" + name.replace(/(\.[^.]*)?$/, " (" + n++ + ")$1"); }
        used[path] = 1;
        zip.file(path, it.kind === "note" ? it.text || "" : it.blob);
      });
      zip.file("Read me.txt", "Backup from the SparkPrep File Manager for Authors, " + new Date().toDateString() +
        ".\r\n\r\nWhen your book is ready, check it free before you upload it to KDP or IngramSpark:\r\nhttps://sparkprep.legenddary.com/audit?utm_source=file-manager-backup\r\n\r\nSparkPrep: the evolution of self-publishing. Power without complexity.\r\n");
      return zip.generateAsync({ type: "blob" });
    }).then(function (blob) {
      download({ kind: "file", name: "My book files backup " + new Date().toISOString().slice(0, 10) + ".zip", blob: blob });
      track("File manager: backup downloaded");
    }).catch(function (e) { alert(e.message || "The backup didn't work. Please try again."); })
      .then(function () { btn.disabled = false; btn.textContent = "Download a backup"; });
  }

  function wire() {
    $("fm-folders").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]"); if (!b) return;
      current = b.getAttribute("data-f"); query = ""; $("fm-search").value = ""; renderList();
    });
    $("fm-input").addEventListener("change", function (e) { addFiles(e.target.files); e.target.value = ""; });
    $("fm-new-note").addEventListener("click", function () { openNote(null); });
    $("fm-note-save").addEventListener("click", saveNote);
    $("fm-view-close").addEventListener("click", function () { $("fm-view").close(); });
    $("fm-backup").addEventListener("click", backup);
    $("fm-new-folder").addEventListener("click", function () {
      var name = (prompt("Name your new folder") || "").trim(); if (!name) return;
      var f = { id: "f" + uid(), name: name.slice(0, 60), hint: "", order: folders.length };
      put("folders", f).then(function () { folders.push(f); current = f.id; renderList(); });
    });
    $("fm-search").addEventListener("input", function (e) { query = e.target.value.trim(); renderList(); });
    $("fm-list").addEventListener("click", function (e) {
      var li = e.target.closest("li[data-id]"); if (!li) return;
      var it = items.filter(function (x) { return x.id === li.getAttribute("data-id"); })[0]; if (!it) return;
      var a = e.target.closest("[data-a]"); a = a && a.getAttribute("data-a");
      if (a === "open") openItem(it);
      else if (a === "dl") download(it);
      else if (a === "rename") {
        var n = (prompt("New name", it.name) || "").trim(); if (!n || n === it.name) return;
        it.name = n; put("items", it).then(renderList);
      } else if (a === "del") {
        if (!confirm('Delete "' + it.name + '"? This can\'t be undone.')) return;
        del("items", it.id).then(function () { items = items.filter(function (x) { return x !== it; }); renderList(); });
      }
    });
    $("fm-list").addEventListener("change", function (e) {
      if (e.target.getAttribute("data-a") !== "move" || !e.target.value) return;
      var li = e.target.closest("li[data-id]");
      var it = items.filter(function (x) { return x.id === li.getAttribute("data-id"); })[0];
      it.folder = e.target.value; put("items", it).then(renderList);
    });
    var drop = $("fm-drop"), fm = $("fm");
    ["dragenter", "dragover"].forEach(function (ev) { fm.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { fm.addEventListener(ev, function (e) { e.preventDefault(); if (ev === "dragleave" && fm.contains(e.relatedTarget)) return; drop.classList.remove("over"); }); });
    fm.addEventListener("drop", function (e) { addFiles(e.dataTransfer && e.dataTransfer.files); });
  }

  open().then(function (d) {
    db = d;
    return Promise.all([all("folders"), all("items")]);
  }).then(function (r) {
    var saved = r[0];
    if (!saved.length) {
      saved = DEFAULT_FOLDERS.map(function (f, i) { var c = Object.assign({}, f); c.order = i; return c; });
      saved.forEach(function (f) { put("folders", f); });
    } else {
      // keep the built-in hints/flags current
      saved.forEach(function (f) { DEFAULT_FOLDERS.forEach(function (d) { if (d.id === f.id) { f.hint = d.hint; f.book = d.book; } }); });
    }
    folders = saved.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    items = r[1];
    wire();
    renderList();
  }).catch(function () {
    $("fm").innerHTML = '<p class="warn">This browser can\'t store files (private browsing turns storage off). Open this page in a normal window to use the file manager.</p>';
  });
})();
