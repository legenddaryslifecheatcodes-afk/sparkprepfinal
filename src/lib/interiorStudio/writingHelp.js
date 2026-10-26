import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// AI Writing Help, editor side. The writing is sent as numbered paragraphs; each suggestion that comes back is
// pinned to its words with an underline (a decoration, so it is not part of the book and follows the text as the
// author keeps typing). Accepting replaces exactly the underlined words, as one undoable step.

export const writingKey = new PluginKey("writingHelp");
const BATCH_CHARS = 8000; // the server takes about 9,000 characters per check

export const KIND_LABELS = {
  spelling: "Spelling", grammar: "Grammar", punctuation: "Punctuation", word_choice: "Word choice",
  clarity: "Clearer", repetition: "Repeated word", flow: "Smoother",
};
export const isFix = (kind) => ["spelling", "grammar", "punctuation"].includes(kind);

export const WritingMarks = Extension.create({
  name: "writingMarks",
  addOptions() {
    return { onPick: null };
  },
  addProseMirrorPlugins() {
    const ext = this;
    return [new Plugin({
      key: writingKey,
      state: {
        init: () => DecorationSet.empty,
        apply(tr, set) {
          let next = set.map(tr.mapping, tr.doc);
          const meta = tr.getMeta(writingKey);
          if (meta?.clear) next = DecorationSet.empty;
          if (meta?.remove) next = next.remove(next.find(undefined, undefined, (spec) => meta.remove.includes(spec.id)));
          if (meta?.add) {
            next = next.add(tr.doc, meta.add.map((s) => Decoration.inline(s.from, s.to,
              { class: `wh-mark ${isFix(s.kind) ? "wh-fix" : "wh-word"}`, "data-wh": s.id },
              { id: s.id, inclusiveStart: false, inclusiveEnd: false })));
          }
          return next;
        },
      },
      props: {
        decorations: (state) => writingKey.getState(state),
        handleClick(view, pos, event) {
          const el = event.target?.closest?.("[data-wh]");
          if (el && ext.options.onPick) ext.options.onPick(el.getAttribute("data-wh"));
          return false;
        },
      },
    })];
  },
});

// Every paragraph-like line (paragraphs, headings, list lines) in reading order, with where it starts.
// Text offsets line up with document positions one for one: a line break counts as one character.
export function textblocks(doc) {
  const out = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    out.push({ n: out.length, pos, node, heading: node.type.name === "heading" && node.attrs.level === 1,
      text: node.textBetween(0, node.content.size, "\n", "\n") });
    return false;
  });
  return out;
}

// The lines to check: the chapter the cursor is in, the selected lines, or the whole book.
export function linesInScope(editor, scope) {
  const { state } = editor;
  const all = textblocks(state.doc);
  let lines = all;
  if (scope === "selection") {
    const { from, to } = state.selection;
    lines = all.filter((b) => b.pos + b.node.nodeSize > from && b.pos < to);
  } else if (scope === "chapter") {
    const at = state.selection.from;
    let start = 0;
    all.forEach((b, i) => { if (b.heading && b.pos <= at) start = i; });
    let end = all.findIndex((b, i) => i > start && b.heading);
    if (end < 0) end = all.length;
    lines = all.slice(start, end);
  }
  return lines.filter((b) => b.text.trim());
}

// Groups of lines small enough for one check each.
export function batches(lines) {
  const out = [];
  let cur = [];
  let size = 0;
  for (const b of lines) {
    const len = Math.min(b.text.length, 4000);
    if (cur.length && size + len > BATCH_CHARS) { out.push(cur); cur = []; size = 0; }
    cur.push(b);
    size += len;
  }
  if (cur.length) out.push(cur);
  return out;
}

// Pins the server's suggestions to the text, skipping any whose words changed while the check ran.
export function pinSuggestions(editor, suggestions, prefix) {
  const all = textblocks(editor.state.doc);
  const pinned = [];
  suggestions.forEach((s, i) => {
    const b = all[s.p];
    if (!b || b.text.slice(s.at, s.at + s.find.length) !== s.find) return;
    const from = b.pos + 1 + s.at;
    pinned.push({ ...s, id: `${prefix}-${i}`, from, to: from + s.find.length });
  });
  if (pinned.length) editor.view.dispatch(editor.state.tr.setMeta(writingKey, { add: pinned }).setMeta("addToHistory", false));
  return pinned.map(({ from, to, ...s }) => s);
}

function rangeOf(editor, id) {
  const set = writingKey.getState(editor.state);
  const d = set?.find(undefined, undefined, (spec) => spec.id === id)[0];
  return d ? { from: d.from, to: d.to } : null;
}

export function showSuggestion(editor, id) {
  const r = rangeOf(editor, id);
  if (!r) return false;
  editor.chain().focus().setTextSelection(r).scrollIntoView().run();
  return true;
}

export function dropSuggestions(editor, ids) {
  if (!editor || editor.isDestroyed) return;
  editor.view.dispatch(editor.state.tr.setMeta(writingKey, ids ? { remove: ids } : { clear: true }).setMeta("addToHistory", false));
}

// Applies suggestions in one undoable step. Returns the ids that were applied; the rest had their words changed.
export function acceptSuggestions(editor, list) {
  const ranges = list
    .map((s) => ({ s, r: rangeOf(editor, s.id) }))
    .filter(({ s, r }) => r && editor.state.doc.textBetween(r.from, r.to, "\n", "\n") === s.find)
    .sort((a, b) => b.r.from - a.r.from);
  const tr = editor.state.tr;
  ranges.forEach(({ s, r }) => tr.insertText(s.replace.replace(/\s*\n\s*/g, " "), r.from, r.to));
  tr.setMeta(writingKey, { remove: list.map((s) => s.id) });
  editor.view.dispatch(tr);
  return ranges.map(({ s }) => s.id);
}
