// Turns a Word file (.docx) into editor content: headings, bold/italic/underline, lists, quotes, page breaks and
// pictures come across (each picture is uploaded to SparkPrep once, via `uploadImage`); Word's own page sizes, margins and fonts are dropped on purpose, because the book style and the
// printer's rules decide those. Runs in the browser, so the manuscript never leaves the author's computer until
// they choose to send it to a book.

const CHAPTER_LIKE = /^(chapter\b|prologue$|epilogue$|introduction$|preface$|foreword$|afterword$|part\s+\w+|acknowledg|about the author$)/i;
const SCENE_BREAK = /^\s*([*#~•]\s*){1,5}\s*$/;

export async function importWordFile(file, { uploadImage, onProgress } = {}) {
  const mod = await import("mammoth/mammoth.browser");
  const mammoth = mod.default || mod;
  const arrayBuffer = await file.arrayBuffer();
  let images = 0;
  let imagesFailed = 0;
  const result = await mammoth.convertToHtml({ arrayBuffer }, {
    styleMap: [
      "p[style-name='Title'] => p.sp-title:fresh",
      "p[style-name='Subtitle'] => p.sp-subtitle:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h2:fresh",
      "p[style-name='Quote'] => blockquote > p:fresh",
      "p[style-name='Intense Quote'] => blockquote > p:fresh",
      "br[type='page'] => hr.sp-page-break",
      "u => u",
    ],
    convertImage: mammoth.images.imgElement(async (image) => {
      images += 1;
      if (!uploadImage) { imagesFailed += 1; return { src: "" }; }
      try {
        onProgress?.(images);
        const buf = await image.read();
        const { id } = await uploadImage(new Blob([buf], { type: image.contentType || "image/png" }), `picture-${images}`);
        return { src: "", "data-image-id": id };
      } catch {
        imagesFailed += 1;
        return { src: "" };
      }
    }),
  });
  const doc = new DOMParser().parseFromString(result.value, "text/html");
  // Pictures sit inside Word's paragraphs; in the book each one is its own block, placed after its paragraph.
  // (A paragraph left holding nothing but its picture is removed below with the other empty paragraphs.)
  const lastAfter = new Map();
  doc.querySelectorAll("img").forEach((n) => {
    if (!n.getAttribute("data-image-id")) { n.remove(); return; }
    const block = n.closest("p, h1, h2, li, blockquote");
    if (!block) return;
    n.remove();
    (lastAfter.get(block) || block).after(n);
    lastAfter.set(block, n);
  });
  // Word's Title / Subtitle lines are the book's title page, not a chapter.
  const take = (sel) => {
    const n = doc.querySelector(sel);
    const t = (n?.textContent || "").trim();
    doc.querySelectorAll(sel).forEach((x) => x.remove());
    return t;
  };
  const title = take("p.sp-title");
  const subtitle = take("p.sp-subtitle");
  doc.querySelectorAll("hr.sp-page-break").forEach((n) => {
    const d = doc.createElement("div");
    d.setAttribute("data-page-break", "");
    n.replaceWith(d);
  });
  // Scene breaks typed as *** or # become real scene breaks.
  doc.querySelectorAll("p").forEach((p) => {
    if (SCENE_BREAK.test(p.textContent || "") && (p.textContent || "").trim()) p.replaceWith(doc.createElement("hr"));
  });
  // Authors who never used Word's heading styles: short "Chapter 3" / "Prologue" lines become chapter titles.
  let chapters = doc.querySelectorAll("h1").length;
  if (!chapters) {
    doc.querySelectorAll("p").forEach((p) => {
      const t = (p.textContent || "").trim();
      if (t.length > 0 && t.length <= 80 && CHAPTER_LIKE.test(t)) {
        const h = doc.createElement("h1");
        h.textContent = t;
        p.replaceWith(h);
        chapters += 1;
      }
    });
  }
  // Empty paragraphs Word uses for spacing aren't needed: the book style sets the spacing.
  doc.querySelectorAll("p").forEach((p) => { if (!(p.textContent || "").trim()) p.remove(); });
  const words = (doc.body.textContent || "").split(/\s+/).filter(Boolean).length;
  return { html: doc.body.innerHTML, title, subtitle, chapters, words, images, imagesFailed, messages: result.messages || [] };
}
