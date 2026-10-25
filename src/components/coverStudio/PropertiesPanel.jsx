import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import FontPicker from "@/components/coverStudio/FontPicker";
import { PPI, wordFor } from "@/lib/coverStudio/engine";
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Copy, Trash2, Lock, Unlock,
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, CaseUpper,
} from "lucide-react";

export function toHex(c, fallback = "#000000") {
  if (!c || typeof c !== "string") return fallback;
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  if (/^#[0-9a-f]{3}$/i.test(c)) return "#" + c.slice(1).split("").map((x) => x + x).join("");
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) return "#" + m.slice(1, 4).map((n) => (+n).toString(16).padStart(2, "0")).join("");
  return fallback;
}

const Lbl = ({ children }) => <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-1">{children}</div>;
const Row = ({ children }) => <div className="mb-4">{children}</div>;

function IconBtn({ on, onClick, title, children, testid }) {
  return (
    <button onClick={onClick} title={title} aria-label={title} data-testid={testid}
      className={`w-8 h-8 flex items-center justify-center border ${on ? "bg-black text-white border-black" : "bg-white border-neutral-300 hover:border-black"}`}>
      {children}
    </button>
  );
}

function Range({ label, value, min, max, step = 1, onChange, fmt = (v) => v, testid }) {
  return (
    <Row>
      <div className="flex justify-between"><Lbl>{label}</Lbl><span className="text-[11px] text-neutral-600">{fmt(value)}</span></div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} data-testid={testid} />
    </Row>
  );
}

function Color({ label, value, onChange, testid }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <input type="color" value={toHex(value)} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 border border-neutral-300 p-0 bg-white cursor-pointer" data-testid={testid} />
      <span className="text-neutral-600">{label}</span>
    </label>
  );
}

function BackgroundEditor({ obj, engine }) {
  const g = obj.fill && typeof obj.fill === "object" ? obj.fill : null;
  const a = g ? g.colorStops[0].color : obj.fill;
  const b = g ? g.colorStops[g.colorStops.length - 1].color : obj.fill;
  const dir = g ? (g.coords.x2 > 0 && g.coords.y2 > 0 ? "d" : g.coords.x2 > 0 ? "h" : "v") : "v";
  const [mode, setMode] = useState(g ? "grad" : "solid");
  const set = (na, nb, nd, m = mode) => engine.setBackground(m === "solid" ? na : { grad: [na, nb], dir: nd });
  return (
    <div data-testid="studio-bg-editor">
      <Lbl>Background</Lbl>
      <div className="flex gap-1 mb-3">
        {[["solid", "Solid"], ["grad", "Gradient"]].map(([k, l]) => (
          <button key={k} onClick={() => { setMode(k); set(toHex(a), toHex(b), dir, k); }} className={`px-2 py-1 text-[10px] font-mono-spec uppercase border ${mode === k ? "bg-black text-white border-black" : "bg-white border-neutral-300"}`}>{l}</button>
        ))}
      </div>
      <div className="flex gap-4 mb-3">
        <Color label={mode === "solid" ? "Colour" : "From"} value={a} onChange={(v) => set(v, toHex(b), dir)} testid="studio-bg-color-a" />
        {mode === "grad" && <Color label="To" value={b} onChange={(v) => set(toHex(a), v, dir)} testid="studio-bg-color-b" />}
      </div>
      {mode === "grad" && (
        <div className="flex gap-1">
          {[["v", "Top → bottom"], ["h", "Left → right"], ["d", "Diagonal"]].map(([k, l]) => (
            <button key={k} onClick={() => set(toHex(a), toHex(b), k)} className={`px-2 py-1 text-[10px] border ${dir === k ? "bg-black text-white border-black" : "bg-white border-neutral-300"}`}>{l}</button>
          ))}
        </div>
      )}
      <p className="text-[11px] text-neutral-500 mt-3">The background runs under the back, spine and front, out to the bleed edge.</p>
    </div>
  );
}

export default function PropertiesPanel({ obj, engine, onEdit, tick }) {
  const [fontsOpen, setFontsOpen] = useState(false);
  if (!obj || !engine) return null;
  const up = (p) => { engine.update(p).then(onEdit); onEdit(); };
  if (obj.sp_role === "bg") return <BackgroundEditor obj={obj} engine={engine} key={tick} />;

  const isText = obj.type === "textbox";
  const isImage = obj.type === "image";
  const locked = !!obj.lockMovementX;
  const pt = isText ? Math.round((obj.fontSize / PPI) * 72 * (obj.scaleY || 1)) : 0;
  const f = obj.sp_filters || {};
  const dpi = isImage ? engine.imageDpi(obj) : null;
  const word = isText ? wordFor(obj.sp_role) : null;

  return (
    <div data-testid="studio-properties">
      {isText && (
        <>
          <Row>
            <Lbl>Text {word && <span className="normal-case tracking-normal text-neutral-400">· also updates your {word === "title" ? "title on the spine" : word}</span>}</Lbl>
            <Textarea rows={3} value={obj.text} onChange={(e) => { obj.set("text", obj.sp_upper ? e.target.value.toUpperCase() : e.target.value); engine.canvas.fire("text:changed", { target: obj }); engine.canvas.requestRenderAll(); engine.commitSoon(); onEdit(); }} data-testid="studio-text-content" />
          </Row>
          <Row>
            <Lbl>Font</Lbl>
            <button onClick={() => setFontsOpen(!fontsOpen)} className="w-full text-left px-2.5 py-2 border border-neutral-300 hover:border-black text-[16px] bg-white" style={{ fontFamily: `"${obj.fontFamily}"` }} data-testid="studio-font-current">
              {obj.fontFamily}
            </button>
            {fontsOpen && <div className="mt-2"><FontPicker value={obj.fontFamily} onPick={(fam) => up({ fontFamily: fam })} /></div>}
          </Row>
          <Range label="Size" value={pt} min={6} max={220} onChange={(v) => up({ fontSize: (v / 72) * PPI / (obj.scaleY || 1) })} fmt={(v) => `${v} pt`} testid="studio-font-size" />
          <Row>
            <div className="flex flex-wrap gap-1">
              <IconBtn title="Bold" on={obj.fontWeight === "bold"} onClick={() => up({ fontWeight: obj.fontWeight === "bold" ? "normal" : "bold" })} testid="studio-bold"><Bold className="w-4 h-4" /></IconBtn>
              <IconBtn title="Italic" on={obj.fontStyle === "italic"} onClick={() => up({ fontStyle: obj.fontStyle === "italic" ? "normal" : "italic" })}><Italic className="w-4 h-4" /></IconBtn>
              <IconBtn title="Underline" on={obj.underline} onClick={() => up({ underline: !obj.underline })}><Underline className="w-4 h-4" /></IconBtn>
              <IconBtn title="All capitals" on={obj.sp_upper} onClick={() => { const next = !obj.sp_upper; up({ sp_upper: next, text: next ? obj.text.toUpperCase() : obj.text }); }}><CaseUpper className="w-4 h-4" /></IconBtn>
              <span className="w-2" />
              {[["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]].map(([k, I]) => (
                <IconBtn key={k} title={`Align ${k}`} on={obj.textAlign === k} onClick={() => up({ textAlign: k })}><I className="w-4 h-4" /></IconBtn>
              ))}
            </div>
          </Row>
          <Row><Color label="Text colour" value={obj.fill} onChange={(v) => up({ fill: v })} testid="studio-text-color" /></Row>
          <Range label="Letter spacing" value={obj.charSpacing || 0} min={-100} max={800} step={10} onChange={(v) => up({ charSpacing: v })} />
          <Range label="Line spacing" value={Math.round((obj.lineHeight || 1) * 100) / 100} min={0.7} max={2.5} step={0.05} onChange={(v) => up({ lineHeight: v })} />
          <Row>
            <Lbl>Outline</Lbl>
            <div className="flex items-center gap-3">
              <Color label="Colour" value={obj.stroke || "#000000"} onChange={(v) => up({ stroke: v, strokeWidth: obj.strokeWidth || 1, paintFirst: "stroke" })} />
              <div className="flex-1"><Slider value={[obj.stroke ? obj.strokeWidth || 0 : 0]} min={0} max={12} step={0.5} onValueChange={([v]) => up({ stroke: v ? obj.stroke || "#000000" : null, strokeWidth: v, paintFirst: "stroke" })} /></div>
            </div>
          </Row>
          <Row>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!obj.shadow} onChange={(e) => up({ shadowOn: e.target.checked })} /> Drop shadow</label>
          </Row>
        </>
      )}

      {!isText && !isImage && (
        <>
          <Row>
            <div className="flex gap-4">
              {typeof obj.fill === "string" && <Color label="Fill" value={obj.fill === "transparent" ? "#ffffff" : obj.fill} onChange={(v) => up({ fill: v })} testid="studio-shape-fill" />}
              <Color label="Edge" value={obj.stroke || "#000000"} onChange={(v) => up({ stroke: v, strokeWidth: obj.strokeWidth || 2, strokeUniform: true })} />
            </div>
          </Row>
          <Range label="Edge thickness" value={obj.stroke ? obj.strokeWidth || 0 : 0} min={0} max={20} step={0.5} onChange={(v) => up({ strokeWidth: v, stroke: v ? obj.stroke || "#000000" : null, strokeUniform: true })} />
          {obj.type === "rect" && <Range label="Rounded corners" value={Math.round(obj.rx || 0)} min={0} max={Math.round(Math.min(obj.width, obj.height) / 2)} onChange={(v) => up({ rx: v, ry: v })} />}
          {obj.type === "rect" && typeof obj.fill === "string" && obj.fill !== "transparent" && (
            <Row><button onClick={() => up({ fill: "transparent" })} className="text-[11px] underline text-neutral-600">Make it see-through (edge only)</button></Row>
          )}
        </>
      )}

      {isImage && (
        <>
          {dpi && (
            <Row>
              <div className={`text-xs px-2 py-1.5 ${dpi >= 300 ? "pill-pass" : dpi >= 200 ? "pill-warn" : "pill-fail"}`} data-testid="studio-image-dpi">
                Prints at about {dpi} DPI {dpi >= 300 ? "· sharp" : obj.sp_ai ? "· AI artwork is enlarged to print size, so it's a little soft up close" : "· printers want 300, so make it smaller or use a bigger picture"}
              </div>
            </Row>
          )}
          <Range label="Brightness" value={f.brightness || 0} min={-0.5} max={0.5} step={0.02} onChange={(v) => up({ filters: { ...f, brightness: v } })} fmt={(v) => Math.round(v * 100)} />
          <Range label="Contrast" value={f.contrast || 0} min={-0.5} max={0.5} step={0.02} onChange={(v) => up({ filters: { ...f, contrast: v } })} fmt={(v) => Math.round(v * 100)} />
          <Range label="Colour strength" value={f.saturation || 0} min={-1} max={1} step={0.05} onChange={(v) => up({ filters: { ...f, saturation: v } })} fmt={(v) => Math.round(v * 100)} />
          <Range label="Blur" value={f.blur || 0} min={0} max={0.5} step={0.01} onChange={(v) => up({ filters: { ...f, blur: v } })} fmt={(v) => Math.round(v * 100)} />
          <Row><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!f.grayscale} onChange={(e) => up({ filters: { ...f, grayscale: e.target.checked } })} /> Black and white</label></Row>
        </>
      )}

      <Range label="See-through" value={Math.round((1 - (obj.opacity ?? 1)) * 100)} min={0} max={95} onChange={(v) => up({ opacity: 1 - v / 100 })} fmt={(v) => `${v}%`} />

      <Lbl>Arrange</Lbl>
      <div className="flex flex-wrap gap-1">
        <IconBtn title="Bring to front" onClick={() => { engine.layer("top"); onEdit(); }}><ChevronsUp className="w-4 h-4" /></IconBtn>
        <IconBtn title="Bring forward" onClick={() => { engine.layer("up"); onEdit(); }}><ChevronUp className="w-4 h-4" /></IconBtn>
        <IconBtn title="Send backward" onClick={() => { engine.layer("down"); onEdit(); }}><ChevronDown className="w-4 h-4" /></IconBtn>
        <IconBtn title="Send to back" onClick={() => { engine.layer("bottom"); onEdit(); }}><ChevronsDown className="w-4 h-4" /></IconBtn>
        <span className="w-2" />
        <IconBtn title="Center left-to-right on its panel" onClick={() => { engine.centerOnPanel("h"); onEdit(); }}><AlignHorizontalJustifyCenter className="w-4 h-4" /></IconBtn>
        <IconBtn title="Center top-to-bottom on its panel" onClick={() => { engine.centerOnPanel("v"); onEdit(); }}><AlignVerticalJustifyCenter className="w-4 h-4" /></IconBtn>
        <span className="w-2" />
        <IconBtn title="Duplicate" onClick={() => engine.duplicate().then(onEdit)} testid="studio-duplicate"><Copy className="w-4 h-4" /></IconBtn>
        <IconBtn title={locked ? "Unlock" : "Lock in place"} on={locked} onClick={() => { engine.toggleLock(); onEdit(); }}>{locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</IconBtn>
        <IconBtn title="Delete" onClick={() => { engine.remove(); onEdit(); }} testid="studio-delete"><Trash2 className="w-4 h-4" /></IconBtn>
      </div>
    </div>
  );
}
