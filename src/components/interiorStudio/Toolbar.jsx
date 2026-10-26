import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Undo2, Redo2,
  Asterisk, FileStack, Quote,
} from "lucide-react";

// The Word-style ribbon: one row of plain buttons. The "Style" box decides what a line is (normal text,
// chapter title, subheading, quote); the book style decides how each of those looks in print.
const KINDS = [
  ["p", "Normal text"],
  ["h1", "Chapter title"],
  ["h2", "Subheading"],
  ["quote", "Quote"],
];

function kindOf(editor) {
  if (editor.isActive("heading", { level: 1 })) return "h1";
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("blockquote")) return "quote";
  return "p";
}

function setKind(editor, k) {
  const c = editor.chain().focus();
  if (editor.isActive("blockquote") && k !== "quote") c.lift("blockquote");
  if (k === "h1") c.setHeading({ level: 1 });
  else if (k === "h2") c.setHeading({ level: 2 });
  else if (k === "quote") c.setParagraph().setBlockquote();
  else c.setParagraph();
  c.run();
}

const Btn = ({ on, active, title, children, testid, disabled }) => (
  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={on} disabled={disabled} title={title} aria-label={title}
    className={`w-8 h-8 flex items-center justify-center border text-neutral-700 disabled:opacity-30 ${active ? "bg-black text-white border-black" : "border-transparent hover:border-neutral-300 bg-white"}`}
    data-testid={testid}>
    {children}
  </button>
);

const Sep = () => <span className="w-px h-6 bg-neutral-200 mx-1" />;

export default function Toolbar({ editor }) {
  if (!editor) return null;
  const align = (a) => editor.chain().focus().setTextAlign(a).run();
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200 bg-[#FAFAF8] sticky top-0 z-10" data-testid="interior-toolbar">
      <Btn on={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)" testid="interior-undo"><Undo2 className="w-4 h-4" /></Btn>
      <Btn on={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></Btn>
      <Sep />
      <select value={kindOf(editor)} onChange={(e) => setKind(editor, e.target.value)}
        className="h-8 px-2 border border-neutral-300 bg-white text-xs" title="What this line is" data-testid="interior-kind">
        {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <Sep />
      <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)" testid="interior-bold"><Bold className="w-4 h-4" /></Btn>
      <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)" testid="interior-italic"><Italic className="w-4 h-4" /></Btn>
      <Btn on={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><Underline className="w-4 h-4" /></Btn>
      <Sep />
      <Btn on={() => align("left")} active={editor.isActive({ textAlign: "left" })} title="Align left"><AlignLeft className="w-4 h-4" /></Btn>
      <Btn on={() => align("center")} active={editor.isActive({ textAlign: "center" })} title="Centre"><AlignCenter className="w-4 h-4" /></Btn>
      <Btn on={() => align("right")} active={editor.isActive({ textAlign: "right" })} title="Align right"><AlignRight className="w-4 h-4" /></Btn>
      <Btn on={() => align("justify")} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify className="w-4 h-4" /></Btn>
      <Sep />
      <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List className="w-4 h-4" /></Btn>
      <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered className="w-4 h-4" /></Btn>
      <Btn on={() => setKind(editor, editor.isActive("blockquote") ? "p" : "quote")} active={editor.isActive("blockquote")} title="Quote"><Quote className="w-4 h-4" /></Btn>
      <Sep />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="h-8 px-2 flex items-center gap-1 text-xs border border-transparent hover:border-neutral-300 bg-white" title="Scene break: a small gap with an ornament" data-testid="interior-scene">
        <Asterisk className="w-4 h-4" /><span className="hidden sm:inline">Scene break</span>
      </button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setPageBreak().run()}
        className="h-8 px-2 flex items-center gap-1 text-xs border border-transparent hover:border-neutral-300 bg-white" title="Start a new page here (Ctrl+Enter)" data-testid="interior-pagebreak">
        <FileStack className="w-4 h-4" /><span className="hidden sm:inline">New page</span>
      </button>
    </div>
  );
}
