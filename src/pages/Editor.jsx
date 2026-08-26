import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, fmtErr, API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Book3DPro from "@/components/Book3DPro";
import BlurbDialog from "@/components/BlurbDialog";
import ManuscriptComposerDialog from "@/components/ManuscriptComposerDialog";
import IsbnBarcodePanel from "@/components/IsbnBarcodePanel";
import AdvancedInteriorCheckCard from "@/components/AdvancedInteriorCheckCard";
import CoverTemplateDialog from "@/components/CoverTemplateDialog";
import AICoverDialog from "@/components/AICoverDialog";
import { Logo } from "@/components/Logo";
import {
  Upload, Download, Wand2, ArrowLeft, Eye, EyeOff, Check, AlertTriangle, XCircle,
  Sparkles, FileStack, Palette, Ruler, Layers, Trash2, Info, ShieldCheck, ArrowRight,
  FilePlus, BookOpen, Image as ImageIcon, Paintbrush, FileCheck2,
} from "lucide-react";

const OVERLAYS = [
  { key: "bleed", label: "Bleed", color: "#007BFF", tooltip: "Show the bleed area (0.125\") — extend background art past the trim." },
  { key: "trim", label: "Trim", color: "#FF6A00", tooltip: "Show the final trim line where the book will be cut." },
  { key: "safe", label: "Safe", color: "#D4A857", tooltip: "Keep critical text and logos inside the safe zone to avoid cropping." },
  { key: "barcode", label: "Barcode", color: "#22C55E", tooltip: "Reserved zone for the ISBN barcode block on the back cover." },
];

const SLOTS = [
  { key: "full_wrap", label: "Full Cover Wrap", desc: "Back + Spine + Front in one PDF", icon: BookOpen },
  { key: "front_cover", label: "Front Cover", desc: "Standalone front artwork", icon: ImageIcon },
  { key: "spine", label: "Spine", desc: "Spine strip artwork", icon: Ruler },
  { key: "back_cover", label: "Back Cover", desc: "Blurb + barcode area", icon: FileStack },
  { key: "interior", label: "Interior PDF", desc: "Manuscript pages", icon: FilePlus },
];

const statusIcon = (s) => s === "pass" ? <Check className="w-3.5 h-3.5" /> : s === "warning" ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />;
const statusPill = (s) => s === "pass" ? "pill-pass" : s === "warning" ? "pill-warn" : "pill-fail";

// Mirrors the backend's fix_action codes (file_processor.py run_compliance_checks)
// -- shows exactly what Auto-Fix will do about a specific issue, not just that
// something's wrong with it.
const FIX_ACTION_LABELS = {
  upscale_300dpi: "Fix: resample to 300 DPI",
  convert_cmyk: "Fix: convert to CMYK color space",
  flatten: "Fix: flatten transparency",
  add_bleed: "Fix: bleed added automatically on export",
  export_pdfx1a: "Fix: PDF/X-1a generated automatically on export",
};

function summarizeCompliance(compliance) {
  if (!compliance || compliance.length === 0) return { verdict: "empty" };
  const fails = compliance.filter((c) => c.status === "fail").length;
  const warnings = compliance.filter((c) => c.status === "warning").length;
  if (fails > 0) return { verdict: "fail", fails, warnings };
  if (warnings > 0) return { verdict: "warning", warnings };
  return { verdict: "pass" };
}

function InfoTip({ children, text }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild><span>{children}</span></TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [specs, setSpecs] = useState(null);
  const [spine, setSpine] = useState(null);
  const [overlays, setOverlays] = useState({ bleed: true, trim: true, safe: true, barcode: false });
  const [blurbOpen, setBlurbOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [coverTemplateOpen, setCoverTemplateOpen] = useState(false);
  const [aiCoverOpen, setAiCoverOpen] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [interiorFixing, setInteriorFixing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [checkingFinal, setCheckingFinal] = useState(false);
  const [finalReview, setFinalReview] = useState(null);
  const [coverFixResult, setCoverFixResult] = useState(null);
  const [interiorFixResult, setInteriorFixResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const [{ data }, { data: sp }] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/specs"),
      ]);
      setProject(data);
      setSpecs(sp);
      const { data: spineRes } = await api.post("/specs/spine", {
        page_count: data.page_count, paper_type: data.paper_type,
        trim_size: data.trim_size, binding: data.binding, platform: data.platform,
      });
      setSpine(spineRes);
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); nav("/dashboard"); }
  }, [id, nav]);

  useEffect(() => { load(); }, [load]);

  // ---- Update spec fields inline (top section is editable so users can iterate)
  const updateSpec = async (patch) => {
    try {
      const { data } = await api.patch(`/projects/${id}`, patch);
      setProject(data);
      const { data: spineRes } = await api.post("/specs/spine", {
        page_count: data.page_count, paper_type: data.paper_type,
        trim_size: data.trim_size, binding: data.binding, platform: data.platform,
      });
      setSpine(spineRes);
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
  };

  // ---- Publisher template upload (auto-detect spec from a real distributor template file)
  const uploadPublisherTemplate = async (file) => {
    if (!file) return;
    setUploadingTemplate(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post(`/projects/${id}/template-upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProject((p) => ({
        ...p,
        publisher_template: data.template_id,
        publisher_template_metadata: data.metadata,
        detected_trim: data.detected_trim,
      }));
      toast.success("Publisher template analyzed");
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
    finally { setUploadingTemplate(false); }
  };

  // ---- Slot upload
  const uploadToSlot = async (slot, file) => {
    if (!file) return;
    setUploadingSlot(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post(`/projects/${id}/slot-upload/${slot}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProject((p) => ({
        ...p,
        slots: { ...(p.slots || {}), [slot]: { ...data.file_metadata, compliance: data.compliance } },
        ...(slot === "full_wrap"
          ? { uploaded_file: data.file_metadata.stored_filename, file_metadata: data.file_metadata, compliance: data.compliance }
          : {}),
      }));
      toast.success(`${slot.replace("_", " ")} analyzed`);
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
    finally { setUploadingSlot(null); }
  };

  // Shared by CoverTemplateDialog + AICoverDialog -- both hand back the same
  // {slot, file_metadata, compliance} shape slot_upload does.
  const applySlotResult = (data) => {
    setProject((p) => ({
      ...p,
      slots: { ...(p.slots || {}), [data.slot]: { ...data.file_metadata, compliance: data.compliance } },
      ...(data.slot === "full_wrap"
        ? { uploaded_file: data.file_metadata.stored_filename, file_metadata: data.file_metadata, compliance: data.compliance }
        : {}),
    }));
  };

  const deleteSlot = async (slot) => {
    try {
      await api.delete(`/projects/${id}/slot/${slot}`);
      setProject((p) => {
        const s = { ...(p.slots || {}) };
        delete s[slot];
        return { ...p, slots: s };
      });
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
  };

  // Shared by the cover and interior Auto-Fix buttons: runs the fix, then
  // immediately re-checks the result (the backend does this in the same
  // call) so the UI can show a definite pass/fail/warning verdict and what
  // to do next -- not just a toast that disappears.
  const runAutofix = async (slot, setBusy, setResult) => {
    setBusy(true);
    setResult(null);
    try {
      const { data } = await api.post(`/projects/${id}/autofix`, null, slot ? { params: { slot } } : undefined);
      setProject((p) => {
        if (slot) {
          return { ...p, slots: { ...(p.slots || {}), [slot]: { ...data.file_metadata, compliance: data.compliance } } };
        }
        return { ...p, file_metadata: data.file_metadata, compliance: data.compliance };
      });
      const summary = summarizeCompliance(data.compliance);
      const gsFailed = data.ghostscript_fix && !data.ghostscript_fix.succeeded;
      setResult({ ...summary, gsFailed, gsReason: data.ghostscript_fix?.reason });
      if (gsFailed) toast.warning("Scan complete — one issue needs a manual fix.");
      else if (summary.verdict === "fail") toast.error(`Scan complete — ${summary.fails} issue${summary.fails === 1 ? "" : "s"} still need fixing.`);
      else if (summary.verdict === "warning") toast.success(`Scan complete — passed with ${summary.warnings} note${summary.warnings === 1 ? "" : "s"}.`);
      else toast.success("Scan complete — all checks passed.");
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
    finally { setBusy(false); }
  };

  const autofix = () => runAutofix(null, setFixing, setCoverFixResult);
  const autofixInterior = () => runAutofix("interior", setInteriorFixing, setInteriorFixResult);

  const runFinalReview = async () => {
    setCheckingFinal(true);
    try {
      const { data } = await api.post(`/projects/${id}/final-review`);
      setFinalReview(data);
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
    finally { setCheckingFinal(false); }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const { data } = await api.post(`/projects/${id}/export`);
      toast.success("PDF/X-1a ready");
      setProject((p) => ({ ...p, exports_used: data.book_exports_used }));
      const token = localStorage.getItem("sp_token");
      window.open(`${API_URL}${data.download_url.replace("/api", "")}${token ? `?token=${token}` : ""}`, "_blank");
    } catch (e) {
      const msg = fmtErr(e.response?.data?.detail);
      const isBookLimit = msg?.includes("export limit for this book");
      if (e.response?.status === 402 && !isBookLimit) { toast.error(msg + " — Redirecting to pricing"); setTimeout(() => nav("/pricing"), 1500); }
      else toast.error(msg);
    } finally { setExporting(false); }
  };

  // ---- Manual adjustments
  const [adj, setAdj] = useState({ spine_offset: 0, bleed_extra: 0, image_scale: 1, target_dpi: 300, color_profile: "US Web Coated SWOP v2" });
  useEffect(() => {
    if (project?.adjustments) setAdj((a) => ({ ...a, ...project.adjustments }));
  }, [project?.adjustments]);
  const saveAdj = async (patch) => {
    const next = { ...adj, ...patch };
    setAdj(next);
    try { await api.patch(`/projects/${id}/adjustments`, patch); } catch {}
  };

  const previewUrl = useMemo(() => {
    const token = localStorage.getItem("sp_token");
    const slots = project?.slots || {};
    // Prefer full_wrap → front_cover → legacy uploaded_file
    if (slots.full_wrap) return `${API_URL}/projects/${id}/slot/full_wrap/preview${token ? `?token=${token}` : ""}`;
    if (slots.front_cover) return `${API_URL}/projects/${id}/slot/front_cover/preview${token ? `?token=${token}` : ""}`;
    if (project?.uploaded_file) return `${API_URL}/projects/${id}/preview${token ? `?token=${token}` : ""}`;
    return null;
  }, [project, id]);

  if (!project || !specs) return <div className="p-10 font-mono-spec text-xs text-neutral-500">Loading editor…</div>;

  const isCover = project.project_type !== "interior";
  const needsInterior = project.project_type === "interior" || project.project_type === "combined";
  const trim = specs.trim_sizes[project.trim_size] || { w: 6, h: 9, label: project.trim_size };
  const plat = specs.platforms[project.platform] || {};
  const compliance = project.slots?.full_wrap?.compliance || project.compliance || [];
  const interiorCompliance = project.slots?.interior?.compliance || [];
  const hasInteriorUpload = !!project.slots?.interior;
  const hasAnyUpload = Object.values(project.slots || {}).length > 0 || !!project.uploaded_file;
  const coverSummary = summarizeCompliance(isCover ? compliance : []);
  const interiorSummary = summarizeCompliance(needsInterior ? interiorCompliance : []);
  const coverClear = !isCover || coverSummary.verdict === "pass" || coverSummary.verdict === "warning";
  const interiorClear = !needsInterior || (hasInteriorUpload && (interiorSummary.verdict === "pass" || interiorSummary.verdict === "warning"));
  const readyForFinalReview = hasAnyUpload && coverClear && interiorClear && (!needsInterior || hasInteriorUpload);
  // Free plan is preview + compliance only -- TIERS.free.monthly_exports is 0 on the
  // backend, which is the actual enforcement; this just avoids sending a free user
  // into a doomed export click instead of straight to the upgrade page.
  const isFreeTier = (user?.tier || "free") === "free";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Header */}
        <div className="border-b border-neutral-800 bg-[#0D0D0D] px-6 py-3 sticky top-0 z-40" data-testid="editor-topbar">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => nav("/dashboard")} className="text-neutral-500 hover:text-white" data-testid="back-btn"><ArrowLeft className="w-4 h-4" /></button>
              <Logo dark compact />
              <div className="w-px h-8 bg-neutral-800 mx-1" />
              <div>
                <input
                  defaultValue={project.name}
                  onBlur={(e) => {
                    const next = e.target.value.trim();
                    if (next && next !== project.name) updateSpec({ name: next });
                    else e.target.value = project.name;
                  }}
                  className="font-display font-bold text-sm tracking-tight bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-white outline-none w-48 text-white"
                  data-testid="project-title-input"
                  title="Book title — required before you can export"
                />
                <div className="font-mono-spec text-[10px] tracking-widest text-neutral-500 uppercase">{plat.name} · {trim.label} · {project.page_count}pp</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <InfoTip text="Compose a print-ready interior PDF from scratch with a fiction, workbook or poetry template.">
                <button onClick={() => setComposerOpen(true)} className="px-3 py-2 border border-neutral-700 text-neutral-300 font-mono-spec text-[10px] tracking-widest uppercase hover:border-white hover:text-white flex items-center gap-1.5 btn-industrial" data-testid="composer-btn">
                  <BookOpen className="w-3.5 h-3.5" /> Compose Interior
                </button>
              </InfoTip>
              <InfoTip text={isFreeTier ? "AI Blurb Writer requires the Author plan or higher." : "Generate 3 AI back-cover blurb variations with Claude Sonnet."}>
                <button onClick={() => isFreeTier ? nav("/pricing") : setBlurbOpen(true)} className="px-3 py-2 border border-neutral-700 text-neutral-300 font-mono-spec text-[10px] tracking-widest uppercase hover:border-white hover:text-white flex items-center gap-1.5 btn-industrial" data-testid="blurb-btn">
                  <Sparkles className="w-3.5 h-3.5" /> AI Blurb{isFreeTier && " 🔒"}
                </button>
              </InfoTip>
              {isCover && (
                <InfoTip text="Start from a typographic cover template — replaces the full cover wrap, fully editable after.">
                  <button onClick={() => setCoverTemplateOpen(true)} className="px-3 py-2 border border-neutral-700 text-neutral-300 font-mono-spec text-[10px] tracking-widest uppercase hover:border-white hover:text-white flex items-center gap-1.5 btn-industrial" data-testid="cover-template-btn">
                    <Palette className="w-3.5 h-3.5" /> Cover Templates
                  </button>
                </InfoTip>
              )}
              {isCover && (
                <InfoTip text={isFreeTier ? "AI Cover Generation requires the Author plan or higher." : "Generate cover art from a text description (Google Imagen)."}>
                  <button onClick={() => isFreeTier ? nav("/pricing") : setAiCoverOpen(true)} className="px-3 py-2 border border-neutral-700 text-neutral-300 font-mono-spec text-[10px] tracking-widest uppercase hover:border-white hover:text-white flex items-center gap-1.5 btn-industrial" data-testid="ai-cover-btn">
                    <ImageIcon className="w-3.5 h-3.5" /> AI Cover{isFreeTier && " 🔒"}
                  </button>
                </InfoTip>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {/* THREE-COLUMN WORKSPACE: Job Setup · Live Layout · 3D Proof */}
          <div className={`grid gap-4 ${isCover ? "lg:grid-cols-[340px_1fr_380px]" : "lg:grid-cols-[340px_1fr]"}`}>

            {/* ===== LEFT · JOB SETUP ===== */}
            <div className="bg-[#111111] border border-neutral-800 flex flex-col" data-testid="panel-job-setup">
              <div className="p-4 border-b border-neutral-800">
                <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Job Setup</span>
                <p className="text-sm text-neutral-400 mt-1">Set the distributor blueprint, then drop your files.</p>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto">
                <DarkSpecField label="Distributor" tooltip="Distributor whose print requirements the file must pass.">
                  <Select value={project.platform} onValueChange={(v) => updateSpec({ platform: v })}>
                    <SelectTrigger data-testid="spec-platform"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.platforms).map(([k, v]) => <SelectItem key={k} value={k}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Trim Size" tooltip="Final page dimensions after cutting. Sets required bleed + safe margins.">
                  <Select value={project.trim_size} onValueChange={(v) => updateSpec({ trim_size: v })}>
                    <SelectTrigger data-testid="spec-trim"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.trim_sizes).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Paper Type" tooltip="Paper stock affects spine width via pages-per-inch (PPI). White vs cream vs color.">
                  <Select value={project.paper_type} onValueChange={(v) => updateSpec({ paper_type: v })}>
                    <SelectTrigger data-testid="spec-paper"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.paper_types).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Binding" tooltip="Binding style — determines whether spine text is allowed and jacket flap dimensions.">
                  <Select value={project.binding} onValueChange={(v) => updateSpec({ binding: v })}>
                    <SelectTrigger data-testid="spec-binding"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.binding_types).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Page Count" tooltip="Total interior page count — used to calculate spine width.">
                  <Input type="number" min={24} value={project.page_count} onChange={(e) => updateSpec({ page_count: parseInt(e.target.value) || 0 })} data-testid="spec-pages" />
                </DarkSpecField>
                <DarkSpecField label="Project Type" tooltip="Cover only, interior only, or both.">
                  <Select value={project.project_type} onValueChange={(v) => updateSpec({ project_type: v })}>
                    <SelectTrigger data-testid="spec-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover only</SelectItem>
                      <SelectItem value="interior">Interior only</SelectItem>
                      <SelectItem value="combined">Cover + Interior</SelectItem>
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Series (optional)" tooltip="Books sharing a series name get checked for consistent trim/binding/paper together from the dashboard.">
                  <Input
                    defaultValue={project.series_name || ""}
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (next !== (project.series_name || "")) updateSpec({ series_name: next || null });
                    }}
                    placeholder="e.g. The Print Trilogy"
                    data-testid="spec-series"
                  />
                </DarkSpecField>

                {/* Publisher template upload — auto-detect trim from a real distributor file */}
                <div className="border-t border-neutral-800 pt-4" data-testid="template-upload-section">
                  <p className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Or upload the publisher&apos;s template</p>
                  <label className={`mt-2 block px-4 py-2.5 border border-dashed text-center font-mono-spec text-[10px] tracking-widest uppercase cursor-pointer btn-industrial ${uploadingTemplate ? "opacity-50 pointer-events-none border-neutral-700 text-neutral-500" : "border-neutral-700 text-neutral-400 hover:border-[#D4AF37] hover:text-[#D4AF37]"}`} data-testid="template-upload-label">
                    {uploadingTemplate ? "Analyzing…" : "Upload template file"}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff"
                      onChange={(e) => uploadPublisherTemplate(e.target.files?.[0])}
                      disabled={uploadingTemplate}
                      className="hidden"
                      data-testid="template-upload-input"
                    />
                  </label>
                  {project.detected_trim && (
                    <div className="mt-3 flex items-start gap-2 bg-emerald-950/30 border border-emerald-900 p-2.5" data-testid="detected-trim-readout">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-400 leading-relaxed">
                        Detected <span className="text-neutral-200">{project.detected_trim.raw_width_inches}&quot;×{project.detected_trim.raw_height_inches}&quot;</span> · trim ~<span className="text-neutral-200">{project.detected_trim.estimated_trim_width}&quot;×{project.detected_trim.estimated_trim_height}&quot;</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload slots */}
                <div className="border-t border-neutral-800 pt-4" data-testid="section-upload">
                  <p className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-3">Upload files</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SLOTS.map((s) => (
                      <SlotDrop
                        key={s.key}
                        slot={s}
                        data={project.slots?.[s.key]}
                        uploading={uploadingSlot === s.key}
                        onUpload={(f) => uploadToSlot(s.key, f)}
                        onDelete={() => deleteSlot(s.key)}
                      />
                    ))}
                  </div>
                </div>

                {isCover && (
                  <div className="border-t border-neutral-800 pt-4">
                    <IsbnBarcodePanel projectId={id} initialIsbn={project.isbn || ""} />
                  </div>
                )}
              </div>

              {/* Primary actions, pinned to the bottom of the Job Setup column */}
              <div className="p-4 border-t border-neutral-800 space-y-2 mt-auto">
                <button
                  onClick={autofix}
                  disabled={!hasAnyUpload || fixing}
                  className="w-full btn-gold py-3.5 font-mono-spec text-xs tracking-widest uppercase disabled:opacity-40 btn-industrial flex items-center justify-center gap-2"
                  data-testid="fix-all"
                >
                  <Wand2 className="w-4 h-4" /> {fixing ? "Running preflight…" : "Run Auto-Fix Preflight"}
                </button>
                <button
                  onClick={isFreeTier ? () => nav("/pricing") : exportPdf}
                  disabled={!hasAnyUpload || exporting}
                  className="w-full py-3 border border-neutral-700 text-neutral-200 font-mono-spec text-xs tracking-widest uppercase hover:border-white disabled:opacity-40 btn-industrial flex items-center justify-center gap-2"
                  data-testid="export-pdf"
                >
                  <Download className="w-4 h-4" /> {exporting ? "Exporting…" : isFreeTier ? "Export — Upgrade Required" : "Export PDF/X-1a"}
                </button>
                <div className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-600 text-center pt-1" data-testid="book-export-counter">
                  {Math.max(0, 5 - (project.exports_used || 0))} of 5 exports remaining for this book
                </div>
              </div>
            </div>

            {/* ===== CENTER · LIVE LAYOUT ===== */}
            <div className="bg-[#111111] border border-neutral-800 flex flex-col" data-testid="panel-live-layout">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Live Layout</span>
                  <p className="text-sm text-neutral-400 mt-1">{isCover ? "Back · Spine · Front" : "Interior page preview"}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {OVERLAYS.map((o) => (
                    <InfoTip key={o.key} text={o.tooltip}>
                      <button onClick={() => setOverlays((prev) => ({ ...prev, [o.key]: !prev[o.key] }))} className="px-2 py-1 border border-neutral-700 font-mono-spec text-[9px] tracking-widest uppercase flex items-center gap-1 hover:border-white text-neutral-300" data-testid={`overlay-${o.key}`}>
                        <span className="w-2 h-2 border" style={{ borderColor: o.color, background: overlays[o.key] ? o.color : "transparent" }} />
                        {o.label}
                        {overlays[o.key] ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5 text-neutral-500" />}
                      </button>
                    </InfoTip>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-[#1A1A1A] dot-grid flex items-center justify-center p-6 relative min-h-[420px]" data-testid="canvas-area">
                {!hasAnyUpload && (
                  <div className="text-center max-w-sm">
                    <Upload className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p className="font-display font-bold text-lg mt-3 text-neutral-300">Upload a file to see the live layout</p>
                    <p className="text-xs text-neutral-500 mt-2">Trim, bleed, safe zone and DPI warnings render instantly.</p>
                  </div>
                )}
                {hasAnyUpload && isCover && spine && (
                  <FullCoverPreview trim={trim} spine={spine} bleed={plat.bleed || 0.125} overlays={overlays} previewUrl={previewUrl} />
                )}
                {hasAnyUpload && !isCover && (
                  <InteriorPreview overlays={overlays} previewUrl={previewUrl} />
                )}
              </div>
              {/* Preflight report -- Cover */}
              {isCover && (
                <div className="p-4 border-t border-neutral-800" data-testid="compliance-list">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">{needsInterior ? "Cover Preflight Report" : "Preflight Report"}</span>
                    {hasAnyUpload && (
                      <button onClick={autofix} disabled={fixing} className="px-2.5 py-1 border border-neutral-700 text-neutral-300 hover:border-white text-[9px] font-mono-spec tracking-widest uppercase btn-industrial disabled:opacity-40" data-testid="rescan-cover">
                        {fixing ? "Scanning…" : "Rescan"}
                      </button>
                    )}
                  </div>
                  {compliance.length === 0 && <p className="text-xs text-neutral-500">Upload a file to see the compliance report.</p>}
                  {compliance.length > 0 && <ScanStatusBanner result={coverFixResult} summary={coverSummary} sectionLabel="Cover" nextHint={needsInterior ? "upload your interior file next" : "you're ready to run the Final Review"} />}
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {compliance.map((c, i) => (
                      <ComplianceCard key={i} c={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Preflight report -- Interior (interior-only or combined projects) */}
              {needsInterior && (
                <div className="p-4 border-t border-neutral-800" data-testid="compliance-list-interior">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Interior Preflight Report</span>
                    {hasInteriorUpload && (
                      <button onClick={autofixInterior} disabled={interiorFixing} className="px-2.5 py-1 border border-neutral-700 text-neutral-300 hover:border-white text-[9px] font-mono-spec tracking-widest uppercase btn-industrial disabled:opacity-40" data-testid="rescan-interior">
                        {interiorFixing ? "Scanning…" : "Rescan"}
                      </button>
                    )}
                  </div>
                  {!hasInteriorUpload && <p className="text-xs text-neutral-500">Upload your interior PDF above to see the compliance report.</p>}
                  {hasInteriorUpload && interiorCompliance.length > 0 && <ScanStatusBanner result={interiorFixResult} summary={interiorSummary} sectionLabel="Interior" nextHint="you're ready to run the Final Review" />}
                  {hasInteriorUpload && (
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {interiorCompliance.map((c, i) => (
                        <ComplianceCard key={i} c={c} />
                      ))}
                    </div>
                  )}
                  {hasInteriorUpload && interiorCompliance.length > 0 && !interiorFixResult && (
                    <button onClick={autofixInterior} disabled={interiorFixing} className="mt-3 w-full btn-gold py-2.5 font-mono-spec text-[10px] tracking-widest uppercase disabled:opacity-40 btn-industrial flex items-center justify-center gap-2" data-testid="fix-interior">
                      <Wand2 className="w-3.5 h-3.5" /> {interiorFixing ? "Running preflight…" : "Run Interior Auto-Fix Preflight"}
                    </button>
                  )}
                </div>
              )}

              {/* Final Review -- appears once every required section is clean */}
              <div className="p-4 border-t border-neutral-800" data-testid="final-review-section">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Final Review</span>
                </div>
                {!readyForFinalReview && (
                  <p className="text-xs text-neutral-500">
                    {!hasAnyUpload ? "Upload your files and pass the section(s) above first." : "Finish the section(s) above (no failing checks) to unlock the final review."}
                  </p>
                )}
                {readyForFinalReview && !finalReview && (
                  <button onClick={runFinalReview} disabled={checkingFinal} className="w-full btn-gold py-3 font-mono-spec text-xs tracking-widest uppercase disabled:opacity-40 btn-industrial flex items-center justify-center gap-2" data-testid="run-final-review">
                    <ShieldCheck className="w-4 h-4" /> {checkingFinal ? "Running final scan…" : "Run Final Scan"}
                  </button>
                )}
                {finalReview && (
                  <FinalReviewResult
                    review={finalReview}
                    onRecheck={runFinalReview}
                    checking={checkingFinal}
                    onExport={isFreeTier ? () => nav("/pricing") : exportPdf}
                    exporting={exporting}
                    isFreeTier={isFreeTier}
                  />
                )}
              </div>
            </div>

            {/* ===== RIGHT · 3D PROOF (cover projects only) ===== */}
            {isCover && (
              <div className="bg-[#111111] border border-neutral-800 flex flex-col" data-testid="panel-3d-proof">
                <div className="p-4 border-b border-neutral-800">
                  <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">3D Proof</span>
                  <p className="text-sm text-neutral-400 mt-1">Finished book mockup</p>
                </div>
                <div className="p-4">
                  {hasAnyUpload ? (
                    <div className="w-full h-[360px] bg-[#0D0D0D] rounded-sm overflow-hidden border border-neutral-800" data-testid="book-3d-wrap">
                      <Book3DPro frontImageUrl={previewUrl} trim={spine?.trim} spineWidth={spine?.spine_width || 0.5} binding={project.binding} />
                    </div>
                  ) : (
                    <div className="w-full h-[360px] bg-[#0D0D0D] border border-neutral-800 flex items-center justify-center">
                      <p className="text-xs text-neutral-600 text-center px-6">Upload a cover to see the 3D proof</p>
                    </div>
                  )}
                  <p className="text-[11px] text-neutral-500 text-center mt-2">{plat.name} · {trim.label} · {specs.binding_types?.[project.binding]?.label || project.binding}</p>
                </div>

                {/* Advanced fixes + manual adjustments, tucked under the 3D proof */}
                <div className="p-4 border-t border-neutral-800 space-y-3">
                  <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Advanced fixes</div>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniFixButton icon={Palette} label="CMYK" tooltip="Converts file to CMYK color space using US Web Coated SWOP v2 profile — required by IngramSpark & KDP." onClick={autofix} disabled={!hasAnyUpload} testid="fix-cmyk" />
                    <MiniFixButton icon={Ruler} label="300 DPI" tooltip="Resamples the image to 300 DPI at the current trim + bleed dimensions." onClick={autofix} disabled={!hasAnyUpload} testid="fix-dpi" />
                    <MiniFixButton icon={Layers} label="Bleed" tooltip={'Extends artwork into the 0.125" bleed zone so cutting variance doesn\'t leave white edges.'} onClick={autofix} disabled={!hasAnyUpload} testid="fix-bleed" />
                    <MiniFixButton icon={Paintbrush} label="Spine" tooltip="Recalculates spine width from page count × paper PPI and re-centers spine text inside safe zones." onClick={() => toast.success("Spine width recalculated: " + spine?.spine_width + "\"")} disabled={!isCover} testid="fix-spine" />
                  </div>
                  <div className="pt-2 space-y-4">
                    <SliderRow label="Spine offset" tooltip="Shift spine text left/right in fractions of an inch." unit="in" min={-0.25} max={0.25} step={0.005} value={adj.spine_offset} onChange={(v) => saveAdj({ spine_offset: v })} testid="adj-spine-offset" dark />
                    <SliderRow label="Extra bleed" tooltip={'Add extra bleed beyond the distributor default (some print shops prefer 0.25").'} unit="in" min={0} max={0.25} step={0.005} value={adj.bleed_extra} onChange={(v) => saveAdj({ bleed_extra: v })} testid="adj-bleed-extra" dark />
                    <SliderRow label="Image scale" tooltip="Scale the source image up or down inside the trim area." unit="×" min={0.5} max={1.5} step={0.01} value={adj.image_scale} onChange={(v) => saveAdj({ image_scale: v })} testid="adj-image-scale" dark />
                    <SliderRow label="Target DPI" tooltip="Resample DPI target — 300 is standard for print." unit="dpi" min={200} max={600} step={10} value={adj.target_dpi} onChange={(v) => saveAdj({ target_dpi: v })} testid="adj-target-dpi" dark />
                    <div>
                      <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Color profile</Label>
                      <Select value={adj.color_profile} onValueChange={(v) => saveAdj({ color_profile: v })}>
                        <SelectTrigger className="mt-1.5" data-testid="adj-color-profile"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US Web Coated SWOP v2">US Web Coated SWOP v2 (default)</SelectItem>
                          <SelectItem value="GRACoL 2013">GRACoL 2013 (premium color)</SelectItem>
                          <SelectItem value="FOGRA39">FOGRA39 (European offset)</SelectItem>
                          <SelectItem value="Japan Color 2001 Coated">Japan Color 2001 Coated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(project.project_type === "interior" || project.project_type === "combined") && (
            <div className="mt-4">
              <AdvancedInteriorCheckCard project={project} user={user} projectId={id} />
            </div>
          )}
        </div>

        <BlurbDialog open={blurbOpen} onOpenChange={setBlurbOpen} defaultTitle={project.name} />
        <ManuscriptComposerDialog open={composerOpen} onOpenChange={setComposerOpen} defaultProject={project} />
        <CoverTemplateDialog open={coverTemplateOpen} onOpenChange={setCoverTemplateOpen} projectId={id} onApplied={applySlotResult} />
        <AICoverDialog open={aiCoverOpen} onOpenChange={setAiCoverOpen} projectId={id} onGenerated={applySlotResult} />
      </div>
    </TooltipProvider>
  );
}

function ComplianceCard({ c }) {
  const fixLabel = c.status !== "pass" && c.auto_fix ? (FIX_ACTION_LABELS[c.fix_action] || "Fix available") : null;
  return (
    <div className="border border-neutral-800 bg-[#0D0D0D] p-3" data-testid={`compliance-${c.id}`}>
      <div className={`px-2 py-0.5 text-[9px] font-mono-spec tracking-widest uppercase inline-flex items-center gap-1 ${statusPill(c.status)}`}>
        {statusIcon(c.status)} {c.status}
      </div>
      <div className="font-display font-bold text-sm mt-1.5 tracking-tight text-white">{c.label}</div>
      <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{c.message}</div>
      {fixLabel && (
        <div className="text-[10px] text-[#D4AF37] mt-1.5 flex items-center gap-1">
          <Wand2 className="w-3 h-3 shrink-0" /> {fixLabel}
        </div>
      )}
    </div>
  );
}

// Clear, persistent verdict after a scan/autofix run -- replacing a toast
// that disappears with a banner that stays until the next action, showing
// exactly what happened and what to do next (the gap that was blocking
// completing the flow: a scan ran but nothing told the user pass/fail/next).
function ScanStatusBanner({ result, summary, sectionLabel, nextHint }) {
  const verdict = result || summary;
  if (!verdict || verdict.verdict === "empty") return null;
  const styles = {
    fail: "border-red-900 bg-red-950/30 text-red-300",
    warning: "border-amber-800 bg-amber-950/20 text-amber-300",
    pass: "border-emerald-800 bg-emerald-950/20 text-emerald-300",
  };
  const icon = { fail: <XCircle className="w-4 h-4" />, warning: <AlertTriangle className="w-4 h-4" />, pass: <Check className="w-4 h-4" /> }[verdict.verdict];
  const headline = {
    fail: `${sectionLabel} — ${verdict.fails} issue${verdict.fails === 1 ? "" : "s"} still need fixing`,
    warning: `${sectionLabel} passed with ${verdict.warnings} note${verdict.warnings === 1 ? "" : "s"}`,
    pass: `${sectionLabel} — all checks passed`,
  }[verdict.verdict];
  return (
    <div className={`border p-3 flex items-start gap-2.5 ${styles[verdict.verdict]}`} data-testid={`scan-status-${sectionLabel.toLowerCase()}`}>
      {icon}
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-sm">{headline}</div>
        {verdict.gsFailed && <div className="text-[11px] mt-0.5 opacity-90">{verdict.gsReason || "This one needs a manual fix."}</div>}
        {verdict.verdict === "fail" && <div className="text-[11px] mt-0.5 opacity-90">Run Auto-Fix again, or fix the issue(s) above manually, then rescan.</div>}
        {verdict.verdict !== "fail" && <div className="text-[11px] mt-0.5 opacity-90 flex items-center gap-1">Next: {nextHint} <ArrowRight className="w-3 h-3" /></div>}
      </div>
    </div>
  );
}

function StopLight({ status }) {
  const lights = ["red", "yellow", "green"];
  return (
    <div className="flex flex-col gap-1.5 items-center bg-black/40 p-2 border border-neutral-800 shrink-0">
      {lights.map((l) => (
        <div
          key={l}
          className="w-5 h-5 rounded-full"
          style={{
            background: status === l ? { red: "#EF4444", yellow: "#EAB308", green: "#22C55E" }[l] : "#262626",
            boxShadow: status === l ? `0 0 10px 2px ${{ red: "#EF4444", yellow: "#EAB308", green: "#22C55E" }[l]}` : "none",
          }}
          data-testid={`stoplight-${l}`}
        />
      ))}
    </div>
  );
}

function FinalReviewResult({ review, onRecheck, checking, onExport, exporting, isFreeTier }) {
  const copy = {
    red: "Not ready to export yet.",
    yellow: "Exportable, but review the warnings first.",
    green: "All clear — ready to export.",
  }[review.status];
  return (
    <div className="border border-neutral-800 bg-[#0D0D0D] p-4 flex items-center gap-4" data-testid="final-review-result">
      <StopLight status={review.status} />
      <div className="flex-1 min-w-0">
        <div className="font-display font-black text-base text-white">{copy}</div>
        <div className="text-[11px] text-neutral-400 mt-0.5">{review.message}</div>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={onRecheck} disabled={checking} className="px-3 py-1.5 border border-neutral-700 text-neutral-300 hover:border-white text-[9px] font-mono-spec tracking-widest uppercase btn-industrial disabled:opacity-40" data-testid="recheck-final">
            {checking ? "Rescanning…" : "Rescan"}
          </button>
          {review.status !== "red" && (
            <button onClick={onExport} disabled={exporting} className="px-4 py-1.5 btn-gold text-[9px] font-mono-spec tracking-widest uppercase btn-industrial disabled:opacity-40 flex items-center gap-1.5" data-testid="export-from-final-review">
              <Download className="w-3 h-3" /> {exporting ? "Exporting…" : isFreeTier ? "Export — Upgrade Required" : "Export Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DarkSpecField({ label, tooltip, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">{label}</Label>
        <InfoTip text={tooltip}><Info className="w-3 h-3 text-neutral-500" /></InfoTip>
      </div>
      {children}
    </div>
  );
}

function SlotDrop({ slot, data, uploading, onUpload, onDelete }) {
  const Icon = slot.icon;
  const filled = !!data;
  return (
    <InfoTip text={slot.desc}>
      <label className={`block relative border border-dashed p-3 text-center cursor-pointer transition-colors ${filled ? "border-emerald-700 bg-emerald-950/30" : uploading ? "border-[#FF6A00]" : "border-neutral-700 hover:border-[#D4AF37] hover:bg-neutral-900"}`} data-testid={`slot-${slot.key}`}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,.webp" onChange={(e) => onUpload(e.target.files?.[0])} disabled={uploading} className="hidden" data-testid={`slot-input-${slot.key}`} />
        <Icon className={`w-4 h-4 mx-auto ${filled ? "text-emerald-500" : "text-neutral-500"}`} />
        <div className="font-display font-bold text-xs mt-1.5 leading-tight text-neutral-200">{filled ? "Uploaded" : uploading ? "Analyzing…" : slot.label}</div>
        <div className="font-mono-spec text-[8px] tracking-widest text-neutral-500 mt-0.5 uppercase leading-tight truncate">{filled ? data.original_filename : slot.desc}</div>
        {filled && data.dpi_x != null && (
          <div className="mt-1.5 font-mono-spec text-[8px] tracking-widest text-neutral-500 uppercase">{data.width_px}×{data.height_px}px · {data.dpi_x} DPI</div>
        )}
        {filled && (
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="absolute top-1.5 right-1.5 text-neutral-500 hover:text-red-500" data-testid={`slot-delete-${slot.key}`}>
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </label>
    </InfoTip>
  );
}

function MiniFixButton({ icon: Icon, label, tooltip, onClick, disabled, testid }) {
  return (
    <InfoTip text={tooltip}>
      <button
        onClick={onClick}
        disabled={disabled}
        className="border border-neutral-700 text-neutral-300 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-40 p-2.5 flex flex-col items-center gap-1 font-mono-spec text-[9px] tracking-widest uppercase btn-industrial"
        data-testid={testid}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>
    </InfoTip>
  );
}

function SliderRow({ label, tooltip, unit, min, max, step, value, onChange, testid, dark }) {
  const labelCls = dark ? "text-neutral-500" : "text-neutral-500";
  const valueCls = dark ? "text-neutral-300" : "text-neutral-900";
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Label className={`font-mono-spec text-[10px] tracking-widest uppercase ${labelCls}`}>{label}</Label>
          <InfoTip text={tooltip}><Info className="w-3 h-3 text-neutral-500" /></InfoTip>
        </div>
        <div className={`font-mono-spec text-xs ${valueCls}`}>{typeof value === "number" ? value.toFixed(unit === "dpi" ? 0 : 3) : "—"} <span className="text-neutral-500">{unit}</span></div>
      </div>
      <input
        type="range" className="spark-range w-full"
        min={min} max={max} step={step} value={value ?? 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        data-testid={testid}
      />
    </div>
  );
}

// ---- Flat preview (unchanged geometry, colors updated to brand)
function FullCoverPreview({ trim, spine, bleed, overlays, previewUrl }) {
  const w = spine?.full_cover.total_width || 12;
  const h = spine?.full_cover.total_height || 9;
  const trimW = trim.w;
  const trimH = trim.h;
  const spineW = spine?.spine_width || 0.5;
  const aspect = w / h;
  return (
    <div className="relative bg-white shadow-lg" style={{ aspectRatio: aspect, width: "min(70vh, 900px)" }} data-testid="cover-preview">
      {previewUrl ? (
        <img src={previewUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 font-mono-spec text-xs tracking-widest uppercase">No file</div>
      )}
      {overlays.bleed && <div className="absolute inset-0 pointer-events-none overlay-bleed" />}
      {overlays.trim && <div className="absolute pointer-events-none overlay-trim" style={{ top: `${(bleed / h) * 100}%`, bottom: `${(bleed / h) * 100}%`, left: `${(bleed / w) * 100}%`, right: `${(bleed / w) * 100}%` }} />}
      {overlays.safe && <div className="absolute pointer-events-none overlay-safe" style={{ top: `${((bleed + 0.375) / h) * 100}%`, bottom: `${((bleed + 0.375) / h) * 100}%`, left: `${((bleed + 0.375) / w) * 100}%`, right: `${((bleed + 0.375) / w) * 100}%` }} />}
      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${((bleed + trimW) / w) * 100}%`, borderLeft: "1px dashed rgba(0,0,0,0.4)" }} />
      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${((bleed + trimW + spineW) / w) * 100}%`, borderLeft: "1px dashed rgba(0,0,0,0.4)" }} />
      {overlays.barcode && (
        <div className="absolute pointer-events-none border-2 border-emerald-500 bg-emerald-100/30" style={{ left: `${((bleed + 0.375) / w) * 100}%`, bottom: `${((bleed + 0.375) / h) * 100}%`, width: `${(2 / w) * 100}%`, height: `${(1.2 / h) * 100}%` }} />
      )}
      <div className="absolute -top-6 left-0 right-0 flex font-mono-spec text-[9px] tracking-widest text-neutral-500 uppercase">
        <div style={{ width: `${((bleed + trimW) / w) * 100}%` }} className="text-center">← Back</div>
        <div style={{ width: `${(spineW / w) * 100}%` }} className="text-center">Spine</div>
        <div className="flex-1 text-center">Front →</div>
      </div>
    </div>
  );
}

function InteriorPreview({ overlays, previewUrl }) {
  return (
    <div className="relative bg-white shadow-lg" style={{ aspectRatio: "6/9", width: "min(50vh, 420px)" }} data-testid="interior-preview">
      {previewUrl ? <img src={previewUrl} alt="interior" className="absolute inset-0 w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-neutral-400 font-mono-spec text-xs uppercase">No file</div>}
      {overlays.bleed && <div className="absolute inset-0 overlay-bleed pointer-events-none" />}
      {overlays.trim && <div className="absolute pointer-events-none overlay-trim" style={{ inset: "1.4%" }} />}
      {overlays.safe && <div className="absolute pointer-events-none overlay-safe" style={{ inset: "4.2%" }} />}
    </div>
  );
}
