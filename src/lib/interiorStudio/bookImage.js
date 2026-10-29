import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { api, API_URL } from "@/lib/api";
import BookImageView from "@/components/interiorStudio/BookImageView";

// A picture in the book. The picture itself lives on SparkPrep's server (uploaded once); the document keeps only
// its id, how wide it prints (a share of the text column) and an optional caption, so the manuscript stays small.
export const imageUrl = (id) => `${API_URL}/interior/images/${id}`;

export async function uploadBookImage(fileOrBlob, name = "picture") {
  const fd = new FormData();
  fd.append("file", fileOrBlob, fileOrBlob.name || name);
  const { data } = await api.post("/interior/images", fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 });
  return data;
}

export const BookImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      id: { default: null, parseHTML: (el) => el.getAttribute("data-image-id") },
      width: { default: 100, parseHTML: (el) => Number(el.getAttribute("data-width")) || 100 },
      caption: { default: "", parseHTML: (el) => el.getAttribute("data-caption") || "" },
    };
  },
  parseHTML() {
    return [{ tag: "img[data-image-id]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const { id, width, caption } = node.attrs;
    return ["img", mergeAttributes(HTMLAttributes, { src: id ? imageUrl(id) : "", "data-image-id": id, "data-width": width, "data-caption": caption, alt: caption })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(BookImageView);
  },
  addCommands() {
    return {
      insertBookImage: (attrs) => ({ chain }) => chain().insertContent({ type: this.name, attrs: { width: 100, caption: "", ...attrs } }).run(),
    };
  },
});
