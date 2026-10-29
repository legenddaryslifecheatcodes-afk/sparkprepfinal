import { NodeViewWrapper } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { API_URL } from "@/lib/api";

const SIZES = [[25, "Small"], [50, "Half"], [75, "Large"], [100, "Full width"]];

// How a picture looks while writing: the picture at its printed width, a size picker, a caption box and a delete
// button. The printed pages on the right show exactly where it lands.
export default function BookImageView({ node, updateAttributes, deleteNode, selected }) {
  const { id, width, caption } = node.attrs;
  return (
    <NodeViewWrapper className={`book-image my-5 ${selected ? "is-selected" : ""}`} data-testid="interior-picture">
      <div className="mx-auto" style={{ width: `${width}%` }} data-drag-handle>
        <img src={`${API_URL}/interior/images/${id}`} alt={caption || "Picture"} className="w-full h-auto block border border-neutral-200" draggable={false} />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 font-sans" contentEditable={false}>
        {SIZES.map(([w, label]) => (
          <button key={w} type="button" onClick={() => updateAttributes({ width: w })}
            className={`px-2 py-1 text-[11px] border ${width === w ? "bg-black text-white border-black" : "bg-white border-neutral-300 hover:border-neutral-500"}`}
            data-testid={`interior-picture-size-${w}`}>{label}</button>
        ))}
        <button type="button" onClick={deleteNode} className="px-2 py-1 text-[11px] border border-neutral-300 bg-white hover:border-red-500 hover:text-red-600 flex items-center gap-1" title="Remove this picture" data-testid="interior-picture-delete">
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      </div>
      <input value={caption} onChange={(e) => updateAttributes({ caption: e.target.value })} placeholder="Caption (optional)"
        className="mt-1.5 block mx-auto w-full max-w-[420px] text-center text-sm italic border-0 border-b border-dashed border-neutral-300 focus:border-neutral-600 focus:outline-none bg-transparent font-sans"
        data-testid="interior-picture-caption" />
    </NodeViewWrapper>
  );
}
