import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api, fmtErr, API_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import BookMockup from "@/components/BookMockup";
import ErrorBoundary from "@/components/ErrorBoundary";
import BlurbDialog from "@/components/BlurbDialog";
import ManuscriptComposerDialog from "@/components/ManuscriptComposerDialog";
import IsbnBarcodePanel from "@/components/IsbnBarcodePanel";
import CoverTemplateDialog from "@/components/CoverTemplateDialog";
import AICoverDialog from "@/components/AICoverDialog";
import RepairBay from "@/components/RepairBay";
import BookReadyCelebration from "@/components/BookReadyCelebration";
import CertifiedModal from "@/components/CertifiedModal";
import StepGuide, { STEP_GLOW_CLASS } from "@/components/StepGuide";
import BookPassBar from "@/components/BookPassBar";
import { usePricing, isBookModel, money, specialNote } from "@/lib/pricing";
import { Logo } from "@/components/Logo";
import {
  Upload, Download, Wand2, Loader2, ArrowLeft, Eye, EyeOff, Check, AlertTriangle, XCircle,
  Sparkles, FileStack, Palette, PenTool, Ruler, Layers, Trash2, Info, ShieldCheck, ArrowRight,
  FilePlus, BookOpen, Image as ImageIcon, Paintbrush, FileCheck2, Droplet, Crop, Package,
} from "lucide-react";

const OVERLAYS = [
  { key: "bleed", label: "Bleed", color: "#007BFF", tooltip: "Show the bleed area (0.125\") — extend background art past the trim." },
  { key: "trim", label: "Trim", color: "#FF6A00", tooltip: "Show the final trim line where the book will be cut." },
  { key: "safe", label: "Safe", color: "#D4A857", tooltip: "Keep critical text and logos inside the safe zone to avoid cropping." },
  { key: "barcode", label: "Barcode", color: "#22C55E", tooltip: "Reserved zone for the ISBN barcode block on the back cover." },
];

const COVER_SLOTS = [
  { key: "full_wrap", label: "Full Cover Wrap", desc: "Back + Spine + Front in one PDF", icon: BookOpen },
  { key: "front_cover", label: "Front Cover", desc: "Standalone front artwork", icon: ImageIcon },
  { key: "spine", label: "Spine", desc: "Spine strip artwork", icon: Ruler },
  { key: "back_cover", label: "Back Cover", desc: "Blurb + barcode area", icon: FileStack },
];

// The owner's funnel (book model): the free scan is real, but only "found N issues" is shown.
// The details are the $1.99 audit; fixing them is the book. A clean file is simply told so.
function LockedResults({ summary, pricing, onUnlock, unlocking, hasInterior }) {
  if (!summary?.scanned) return <p className="text-xs text-neutral-500">Upload a file to scan it here.</p>;
  const auditPrice = pricing ? money(pricing.audit.price_cents) : "";
  const bookPrice = pricing?.book ? money(pricing.book.price_cents) : "";
  const n = summary.issues;
  return (
    <div data-testid="results-locked">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
        {(summary.checks_run || []).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-neutral-400"><Check className="w-3 h-3 text-emerald-500 shrink-0" /> {s} checked</div>
        ))}
      </div>
      {n > 0 ? (
        <div className="border border-[#D4AF37]/60 bg-[#D4AF37]/10 p-4" data-testid="results-issues-found">
          <div className="font-display font-bold text-white">SparkPrep found {n} issue{n === 1 ? "" : "s"} that may stop this file from being accepted.</div>
          <p className="text-sm text-neutral-300 mt-1">See exactly what needs attention and where it occurs — in under a minute.</p>
          <button onClick={() => onUnlock("standard")} disabled={!!unlocking} className="mt-3 w-full btn-gold py-3 font-mono-spec text-xs tracking-widest uppercase btn-industrial disabled:opacity-50" data-testid="unlock-results-btn">
            {unlocking === "standard" ? "Opening secure checkout…" : `See My Results${auditPrice ? ` — ${auditPrice}` : ""}${hasInterior ? " · page 1" : ""}`}
          </button>
          {specialNote(pricing, "audit") && (
            <p className="text-[11px] text-emerald-300 mt-1.5 text-center">{specialNote(pricing, "audit")}</p>
          )}
          {hasInterior && pricing?.advanced_audit && (
            <button onClick={() => onUnlock("advanced")} disabled={!!unlocking} className="mt-2 w-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 py-2.5 font-mono-spec text-[10px] tracking-widest uppercase btn-industrial disabled:opacity-50" data-testid="unlock-advanced-btn">
              {unlocking === "advanced" ? "Opening secure checkout…" : `Advanced Audit — every page — ${money(pricing.advanced_audit.price_cents)}`}
            </button>
          )}
          {auditPrice && bookPrice && (
            <p className="text-[11px] text-neutral-400 mt-2 text-center">Whatever you pay for the audit is credited toward your {bookPrice} book.</p>
          )}
        </div>
      ) : (
        <div className="border border-emerald-700/60 bg-emerald-950/30 p-4" data-testid="results-clean">
          <div className="font-display font-bold text-white flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> No compliance issues detected</div>
          <p className="text-sm text-neutral-300 mt-1">Your file passed SparkPrep's checks. Thank you for trying SparkPrep!</p>
        </div>
      )}
      {hasInterior && (
        <p className="text-[11px] text-neutral-500 mt-2" data-testid="page-one-note">
          For interiors, the scan and audit check page 1. Checking every page (up to 300) is included with a SparkPrep book.
        </p>
      )}
    </div>
  );
}

// After the $1.99 audit: the details are visible, and fixing them is the book.
function FixItCta({ issues, pricing, onFix, auditId, onUpgrade }) {
  const upgradeCents = onUpgrade && pricing?.advanced_audit ? pricing.advanced_audit.price_cents - pricing.audit.price_cents : 0;
  const auditPrice = pricing ? money(pricing.audit.price_cents) : "";
  return (
    <div className="border border-[#D4AF37]/60 bg-[#D4AF37]/10 p-4 mb-3" data-testid="fix-it-cta">
      <div className="font-display font-bold text-white">SparkPrep can fix {issues === 1 ? "this issue" : "these issues"} for you right now.</div>
      <p className="text-sm text-neutral-300 mt-1">No need to go anywhere else — Repair Bay fixes them and hands you print-ready files.{auditPrice ? ` Your ${auditPrice} audit is credited toward your book.` : ""}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={onFix} className="px-4 py-2 btn-gold font-mono-spec text-[10px] tracking-widest uppercase btn-industrial" data-testid="fix-it-cta-btn">Fix It With SparkPrep</button>
        {auditId && (
          <a href={`/audit/${auditId}/report`} className="px-4 py-2 border border-neutral-600 text-neutral-200 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase btn-industrial" data-testid="view-audit-report">
            View Your Full Audit Report
          </a>
        )}
        {upgradeCents > 0 && (
          <button onClick={onUpgrade} className="px-4 py-2 border border-neutral-600 text-neutral-200 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase btn-industrial" data-testid="upgrade-advanced-audit">
            Check Every Page — {money(upgradeCents)} more
          </button>
        )}
      </div>
    </div>
  );
}

// Only shown for Hardcover -- Dust Jacket binding, alongside the jacket above.
const CASE_SLOT = { key: "case_wrap", label: "Case Cover", desc: "Plain wrap under the jacket", icon: Package };

const statusIcon = (s) => s === "pass" ? <Check className="w-3.5 h-3.5" /> : s === "warning" ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />;
const statusPill = (s) => s === "pass" ? "pill-pass" : s === "warning" ? "pill-warn" : "pill-fail";

// Mirrors the backend's fix_action codes (file_processor.py run_compliance_checks)
// -- shows exactly what Auto-Fix will do about a specific issue, not just that
// something's wrong with it. Kept in plain language -- the print-industry term
// (DPI, CMYK, PDF/X-1a) is still shown on the check itself for anyone who wants
// it, but what the button does should read like a sentence, not a spec sheet.
const FIX_ACTION_LABELS = {
  upscale_300dpi: "Fix: sharpen the image so it prints clearly",
  convert_cmyk: "Fix: convert the colors for printing",
  flatten: "Fix: flatten so nothing prints wrong or missing",
  add_bleed: "Fix: extra edge added automatically so there's no white line after trimming",
  export_pdfx1a: "Fix: converted to the correct print file format automatically",
  scale_safe_margin: "Fix: nudge text/art back inside the safe margin automatically",
};

// The backend's compliance labels lead with the print-industry term (DPI,
// CMYK, PDF/X-1a) since that's what a distributor's own rejection email will
// say. Non-technical authors don't need to learn that vocabulary just to read
// a pass/fail list, so this leads with plain English and keeps the technical
// term in parentheses for anyone cross-checking against a distributor notice.
function plainCheckLabel(c) {
  const paren = c.label.match(/\([^)]*\)/)?.[0];
  switch (c.id) {
    case "pdf_dpi": return "Image Sharpness";
    case "dpi": return paren ? `Image Sharpness ${paren}` : "Image Sharpness";
    case "colorspace": return paren ? `Print Colors ${paren}` : "Print Colors";
    case "transparency": return "Layers & Effects";
    case "bleed": return paren ? `Edge Bleed ${paren}` : "Edge Bleed";
    case "pdfx1a": return "Print File Format";
    default: return c.label;
  }
}

// Still needs the user: not passing, and not something export fixes by itself (fixed_on_export -- e.g. ink over
// the limit on a black & white interior or a PDF cover: owner, "why can't we fix this for the users").
const isOpenIssue = (c) => c.status !== "pass" && !c.fixed_on_export;

function summarizeCompliance(compliance) {
  if (!compliance || compliance.length === 0) return { verdict: "empty" };
  const fails = compliance.filter((c) => c.status === "fail").length;
  const warnings = compliance.filter((c) => c.status === "warning" && !c.fixed_on_export).length;
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
  const [caseSpine, setCaseSpine] = useState(null);   // a dust-jacket book's case cover has its own size
  const [overlays, setOverlays] = useState({ bleed: true, trim: true, safe: true, barcode: false });
  const [blurbOpen, setBlurbOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [coverTemplateOpen, setCoverTemplateOpen] = useState(false);
  const [aiCoverOpen, setAiCoverOpen] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [interiorFixing, setInteriorFixing] = useState(false);
  const [caseFixing, setCaseFixing] = useState(false);
  const [, setCaseFixResult] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [checkingFinal, setCheckingFinal] = useState(false);
  const [finalReview, setFinalReview] = useState(null);
  const [coverFixResult, setCoverFixResult] = useState(null);
  const [interiorFixResult, setInteriorFixResult] = useState(null);
  // Live Auto-Fix screen (the four-agent verified pipeline); see components/RepairBay.jsx
  const [bay, setBay] = useState(null);
  // The one big "your whole book is print-ready" moment -- see BookReadyCelebration.jsx.
  // celebratedRef guards the gap between computing readiness and the PATCH that records
  // it landing, so a fast re-render can't fire this twice for the same milestone.
  const [showCelebration, setShowCelebration] = useState(false);
  const [exportResult, setExportResult] = useState(null);   // SparkPrep Certified (or what's still open), after export
  const celebratedRef = useRef(false);
  const pricing = usePricing();
  const bookModel = isBookModel(pricing);
  const [bookNudge, setBookNudge] = useState(0);
  const [bookStartedAt, setBookStartedAt] = useState(0);
  const bookBarRef = useRef(null);

  const loadSpine = useCallback(async (d) => {
    const body = {
      page_count: d.page_count, paper_type: d.paper_type,
      trim_size: d.trim_size, binding: d.binding, platform: d.platform,
      spine_width_override: d.spine_width_override,
    };
    const [{ data: spineRes }, caseRes] = await Promise.all([
      api.post("/specs/spine", body),
      d.binding === "hardcover_jacket" ? api.post("/specs/spine", { ...body, binding: "hardcover_case" }) : Promise.resolve(null),
    ]);
    setSpine(spineRes);
    setCaseSpine(caseRes?.data || null);
  }, []);

  const load = useCallback(async () => {
    try {
      const [{ data }, { data: sp }] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/specs"),
      ]);
      setProject(data);
      setSpecs(sp);
      await loadSpine(data);
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); nav("/dashboard"); }
  }, [id, nav, loadSpine]);

  useEffect(() => { load(); }, [load]);

  // ---- The owner's funnel (see LockedResults): $1.99 shows results, the book fixes them.
  const [searchParams, setSearchParams] = useSearchParams();
  const [unlocking, setUnlocking] = useState(false);
  const unlockResults = async (level = "standard") => {
    setUnlocking(level);
    try {
      const { data } = await api.post(`/projects/${id}/results-unlock/checkout`, { origin_url: window.location.origin, level });
      if (data.already_unlocked) { await load(); return; }
      window.location.href = data.checkout_url;
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail));
    } finally { setUnlocking(false); }
  };
  // Back from Stripe: confirm the payment ourselves (the webhook may still be on its way), then reload.
  useEffect(() => {
    const sessionId = searchParams.get("results_session");
    if (!sessionId || !project?.results_audit_id) return;
    (async () => {
      try {
        const { data } = await api.get(`/audit/${project.results_audit_id}/verify`, { params: { session_id: sessionId } });
        if (data.paid) { toast.success("Your results are unlocked."); await load(); }
      } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
      setSearchParams({}, { replace: true });
    })();
  }, [searchParams, project?.results_audit_id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Repairs are the product: without the book, point at the Start/Get-a-book bar instead.
  const needsBook = (what) => {
    if (project?.owns_product !== false) return false;
    toast(`${what} is part of the SparkPrep book — that's where SparkPrep fixes everything for you.`);
    setBookNudge((n) => n + 1);
    bookBarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  };

  // ---- The one big "your whole book is print-ready" moment. Placed before the
  // component's early "loading" return below (hooks can't follow a conditional
  // return), so readiness is computed inline here rather than reusing the
  // isCover/needsInterior/etc. variables declared after that guard.
  //
  // Deliberately a HIGHER bar than the export endpoint's own gate (which only
  // blocks on "fail", letting a "warning" like uncorrected RGB through) --
  // verified live that a fresh upload with zero repairs run already clears
  // that bar (RGB is only ever a warning), which would fire this celebration
  // before anything was actually fixed. Matches Repair Bay's own definition
  // of "resolved" instead (agent1_triage.actionable(): anything not "pass"
  // is real, unfinished work) -- "ready" here means nothing left to fix at
  // all, not merely "technically exportable."
  useEffect(() => {
    // A locked (free demo) project shows no issue details, so "no issues shown" means nothing here.
    if (!project || project.results_locked) return;
    const needsCoverNow = project.project_type !== "interior";
    const needsInteriorNow = project.project_type === "interior" || project.project_type === "combined";
    const coverUploaded = !needsCoverNow || !!(project.slots?.full_wrap?.stored_filename || project.slots?.front_cover?.stored_filename);
    const interiorUploaded = !needsInteriorNow || !!project.slots?.interior?.stored_filename;
    // Hardcover with Dust Jacket needs a third file (the plain case under
    // the jacket) before the book's actually done -- see CASE_SLOT.
    const needsCaseNow = needsCoverNow && project.binding === "hardcover_jacket";
    const caseUploaded = !needsCaseNow || !!project.slots?.case_wrap?.stored_filename;
    // The case has no Repair Bay (a plain wrap; export converts it to CMYK
    // itself), so only a real failure on it holds the celebration back --
    // otherwise an RGB case would block it forever with nothing to press.
    const hasUnresolvedIssue = Object.entries(project.slots || {}).some(([key, s]) =>
      (s.compliance || []).some(isOpenIssue));
    const ready = coverUploaded && interiorUploaded && caseUploaded && !hasUnresolvedIssue;
    if (ready && !project.book_ready_celebrated_at && !celebratedRef.current) {
      celebratedRef.current = true;
      setShowCelebration(true);
      api.patch(`/projects/${id}`, { book_ready_celebrated_at: new Date().toISOString() })
        .then(({ data }) => setProject(data))
        .catch(() => { celebratedRef.current = false; });
    }
  }, [project, id]);

  // An old Final Review result (e.g. a red one from before the fixes) must never stay on screen next to a pass:
  // whenever any file's checks change, the old review is cleared and the step guide asks for a fresh one.
  const complianceSig = JSON.stringify(Object.entries(project?.slots || {}).map(([k, sl]) =>
    [k, (sl.compliance || []).map((c) => `${c.id}:${c.status}`)]));
  // ...and the same for the cover/interior banners: they show the file's CURRENT checks, never an earlier run's.
  useEffect(() => { setFinalReview(null); setCoverFixResult(null); setInteriorFixResult(null); }, [complianceSig]);

  // ---- Update spec fields inline (top section is editable so users can iterate)
  const updateSpec = async (patch) => {
    try {
      const { data } = await api.patch(`/projects/${id}`, patch);
      setProject(data);   // the server re-checks uploaded covers against the new specs
      await loadSpine(data);
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
  };

  // ---- Publisher template upload. Its one job: tell us which distributor
  // this template is for. Trim, paper, page count etc. stay manual, typed in
  // by the customer -- this never auto-fills those, only suggests Distributor,
  // and only when a real, verified marker was found in the file (never a guess).
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
      const detected = data.detected_spec?.publisher;
      if (detected && detected !== "unknown" && specs.platforms?.[detected]) {
        const name = specs.platforms[detected].name;
        if (detected !== project.platform) {
          await updateSpec({ platform: detected });
          toast.success(`Detected ${name} — set as your distributor. Change it below if that's wrong.`);
        } else {
          toast.success(`Confirmed: this is a ${name} template.`);
        }
      } else {
        toast.success("Template read — couldn't tell which distributor it's for, so Distributor is unchanged.");
      }
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
      // The page count (and so the spine and every cover size) comes from the interior itself.
      if (data.page_count_set) {
        toast.info(`Page count set to ${data.page_count_set.to} from your interior (it said ${data.page_count_set.from}). Your cover size now matches it.`, { duration: 10000 });
      }
      // A free (locked) project's "found N issues" summary is computed by the server across all files,
      // so reload the project rather than leaving the panel on its pre-upload state.
      if (data.results_locked || data.page_count_set) await load();
      // A Word/text manuscript gets converted into a print-ready interior on
      // upload -- surface anything the converter couldn't carry over (no
      // chapter headings found, embedded images/tables dropped) so it isn't
      // silently lost in a response the user never sees.
      (data.file_metadata?.compose_warnings || []).forEach((w) => toast.warning(w, { duration: 10000 }));
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
    finally { setUploadingSlot(null); }
  };

  // "Retake Photo" fix option for a low-DPI failure: opens the device
  // camera directly (mobile browsers treat capture="environment" as "open
  // the camera", not a plain file picker) and uploads straight to the
  // same slot via the normal upload path -- a fresh photo is genuinely
  // higher resolution, not a reconstruction, so no separate processing
  // step is needed beyond the compliance recheck the upload already runs.
  const retakePhoto = (slot) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => uploadToSlot(slot, e.target.files?.[0]);
    input.click();
  };

  const [enhancingSlot, setEnhancingSlot] = useState(null);

  // While SparkPrep is fixing, upscaling, uploading or exporting, the browser's Back (a touchpad swipe, the mouse's
  // side button, Alt+Left) must not drop the customer on the Dashboard mid-repair. Owner, 2026-10-05: "it kicked me
  // out" -- pressing "Fix my case cover" was followed half a second later by the Dashboard loading, no crash, no
  // logout. A same-address history entry is added while busy: Back only removes it (the page stays put) and says why.
  // Closing or refreshing the tab asks first.
  const busyNow = !!bay || exporting || !!enhancingSlot || !!uploadingSlot;
  useEffect(() => {
    if (!busyNow) return undefined;
    const guard = () => window.history.pushState({ ...(window.history.state || {}), spGuard: true }, "", window.location.href);
    guard();
    const onPop = () => {
      guard();
      toast("SparkPrep is still working on your book — stay on this page until it finishes.", { duration: 6000 });
    };
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (window.history.state?.spGuard) window.history.back();   // drop the extra entry -- same page, nothing moves
    };
  }, [busyNow]);

  const aiEnhance = async (slot) => {
    if (needsBook("AI Upscale")) return;
    setEnhancingSlot(slot);
    try {
      const { data } = await api.post(`/projects/${id}/ai-enhance/${slot}`);
      setProject((p) => ({ ...p, slots: { ...(p.slots || {}), [slot]: { ...data.file_metadata, compliance: data.compliance } } }));
      toast.success("AI Upscale done — your cover is now sharpened for print.");
    } catch (e) {
      const msg = fmtErr(e.response?.data?.detail);
      if (e.response?.status === 402) { toast.error(msg + " — Redirecting to pricing"); setTimeout(() => nav("/pricing"), 1500); }
      else toast.error(msg);
    } finally { setEnhancingSlot(null); }
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
  const runAutofix = (slot, setBusy, setResult) => {
    if (needsBook("Repair Bay")) return;
    setBusy(true);
    setResult(null);
    setBay({ slot, setBusy, setResult });
  };

  // Same project/verdict update the classic Auto-Fix does, fed by the Repair Bay's
  // events instead of one blocking call (stage = "result" after the repair is
  // verified, "confirm" after the customer's Enter-to-rescan).
  const applyBayResult = (b) => (data) => {
    setProject((p) => {
      if (b.slot) {
        return { ...p, slots: { ...(p.slots || {}), [b.slot]: { ...data.file_metadata, compliance: data.compliance } } };
      }
      // A cover fix (slot null) must update the cover's slot too -- the results list reads the slot, so updating
      // only the top-level copy left the old issues on screen after a successful fix.
      const coverKey = p.slots?.full_wrap ? "full_wrap" : p.slots?.front_cover ? "front_cover" : null;
      return { ...p, file_metadata: data.file_metadata, compliance: data.compliance,
               ...(coverKey ? { slots: { ...(p.slots || {}), [coverKey]: { ...data.file_metadata, compliance: data.compliance } } } : {}) };
    });
    const summary = summarizeCompliance(data.compliance);
    const gsFailed = data.ghostscript_fix && !data.ghostscript_fix.succeeded;
    b.setResult({ ...summary, gsFailed, gsReason: data.ghostscript_fix?.reason });
  };

  const closeBay = (retry) => {
    const b = bay;
    setBay(null);
    if (!b) return;
    b.setBusy(false);
    load();   // the screen always ends a repair showing exactly what the server has
    if (retry) setTimeout(() => runAutofix(b.slot, b.setBusy, b.setResult), 60);
  };

  // Classic one-shot Auto-Fix: used only if the server doesn't have the verified pipeline yet.
  const runAutofixLegacy = async (slot, setBusy, setResult) => {
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
  // The case cover gets the same Repair Bay and AI Upscale as the jacket -- SparkPrep brings it to spec itself
  // rather than asking for a new file (owner, 2026-10-05).
  const autofixCase = () => runAutofix("case_wrap", setCaseFixing, setCaseFixResult);

  const runFinalReview = async () => {
    if (needsBook("Final Review")) return;
    setCheckingFinal(true);
    try {
      const { data } = await api.post(`/projects/${id}/final-review`);
      setFinalReview(data);
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail)); }
    finally { setCheckingFinal(false); }
  };

  // Saves the export (print files + the book's report) straight to the customer's Downloads folder. It used to
  // window.open() a new tab AFTER the export finished -- browsers only allow that within a few seconds of the
  // click, and the every-page certification check made export take longer, so the download was silently
  // blocked as a pop-up: no files, no report. A same-page download isn't a pop-up, so nothing blocks it.
  const downloadExport = async (d) => {
    const token = localStorage.getItem("sp_token");
    const res = await api.get(d.download_url.replace(/^\/api/, ""), { params: token ? { token } : undefined, responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(project?.name || "SparkPrep book").replace(/[\\/:*?"<>|]/g, "")} - SparkPrep.${d.export_name.split(".").pop()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  // One finished file under its plain name ("My Book - Interior.pdf"). A distributor's upload box can't see inside
  // a ZIP, so each file is its own download (owner, 2026-10-05: "I can't find the downloaded files").
  const downloadExportFile = async (f) => {
    const token = localStorage.getItem("sp_token");
    const res = await api.get(f.download_url.replace(/^\/api/, ""), { params: token ? { token } : undefined, responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // Export runs as a background job on the server (a long book's every-page check can outlast the ~100 s one
  // request may take); the page checks on it every few seconds and shows a clear "working on it" screen.
  const [exportSeconds, setExportSeconds] = useState(0);
  const runExportJob = async () => {
    const { data: started } = await api.post(`/projects/${id}/export-jobs`);
    for (;;) {
      await new Promise((r) => setTimeout(r, 2500));
      const { data: st } = await api.get(`/export-jobs/${started.job_id}`);
      setExportSeconds(st.seconds || 0);
      if (st.status === "done") return st.result;
      if (st.status === "error") {
        const err = new Error("export failed");
        err.response = { status: st.status_code, data: { detail: st.detail } };   // same shape the old handler read
        throw err;
      }
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    setExportSeconds(0);
    try {
      const data = await runExportJob();
      setProject((p) => ({ ...p, exports_used: data.book_exports_used }));
      if (data.files?.length) {
        // Each file gets its own button on the finished screen -- no ZIP to dig through.
        setExportResult({ ...data, downloaded: undefined });
        return;
      }
      setExportResult({ ...data, downloaded: null });
      try {
        await downloadExport(data);
        setExportResult((r) => (r ? { ...r, downloaded: true } : r));
      } catch {
        setExportResult((r) => (r ? { ...r, downloaded: false } : r));   // the modal's Download button still works
      }
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = fmtErr(detail);
      if (e.response?.status === 402 && detail?.code === "book_required") {
        // Book model: show the Start/Get-a-book bar instead of bouncing to pricing.
        toast.error(msg);
        setBookNudge((n) => n + 1);
        bookBarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (e.response?.status === 409 && detail?.code === "different_book") {
        // One book pass = one book. Keep the explanation (and the support email) on screen long enough to read.
        toast.error(msg, { duration: 20000 });
        return;
      }
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
    // Prefer full_wrap → front_cover → interior → legacy uploaded_file.
    // Interior was missing entirely -- the preview always fell straight
    // through to null for any interior-only project, showing "No file"
    // even with a real interior PDF sitting in that slot.
    // `v` = the stored file's name: every fix or new upload writes a new file, so the address changes and the
    // browser fetches the new picture. Without it the layout and the 3D proof kept showing the OLD file after a
    // fix -- not matching what the checks were saying.
    const q = (slot) => `?${token ? `token=${token}&` : ""}v=${encodeURIComponent(slots[slot]?.stored_filename || project?.uploaded_file || "")}`;
    if (slots.full_wrap) return `${API_URL}/projects/${id}/slot/full_wrap/preview${q("full_wrap")}`;
    if (slots.front_cover) return `${API_URL}/projects/${id}/slot/front_cover/preview${q("front_cover")}`;
    if (slots.interior) return `${API_URL}/projects/${id}/slot/interior/preview${q("interior")}`;
    if (project?.uploaded_file) return `${API_URL}/projects/${id}/preview${q("legacy")}`;
    return null;
  }, [project, id]);

  // Which slot previewUrl actually resolved to -- the 3D mockup needs this to
  // know whether the image is a full back+spine+front wrap (crop to just the
  // front panel) or already a standalone front-cover image (use as-is).
  const previewSlot = useMemo(() => {
    const slots = project?.slots || {};
    if (slots.full_wrap) return "full_wrap";
    if (slots.front_cover) return "front_cover";
    if (slots.interior) return "interior";
    if (project?.uploaded_file) return "full_wrap"; // legacy uploads were always the full cover
    return null;
  }, [project]);

  // The book mockup draws the cover as a CSS background -- fetching
  // through the shared `api` client (real Authorization header, not a
  // query-param token) and handing it a local blob: URL sidesteps any CORS/
  // crossOrigin edge case around loading an authenticated image into WebGL,
  // and blob: URLs never trigger tainted-canvas issues since they're never
  // actually cross-origin from the browser's point of view.
  const [book3dTextureUrl, setBook3dTextureUrl] = useState(null);
  const [book3dFailed, setBook3dFailed] = useState(false);
  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;
    setBook3dFailed(false);
    setBook3dTextureUrl(null);       // never keep showing the previous file's picture while the new one loads
    if (!previewUrl) return undefined;
    (async () => {
      try {
        const { data } = await api.get(previewUrl.replace(API_URL, ""), { responseType: "blob" });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(data);
        setBook3dTextureUrl(objectUrl);
      } catch {
        if (!cancelled) { setBook3dTextureUrl(null); setBook3dFailed(true); }
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewUrl]);

  // Raw back/spine/front panel geometry (in inches) for a full-wrap image,
  // from the same layout math the backend uses (accounts for hardcover
  // jacket flaps / case-laminate gutters, not just a plain trim+spine
  // split) -- BookMockup crops each face to its own panel so all three
  // faces sample their own real art instead of the front face stretching
  // the whole flattened wrap across itself, or the spine/back faces
  // staying on the flat placeholder tint despite real art being uploaded.
  const coverCrop = useMemo(() => {
    const full = spine?.full_cover;
    if (previewSlot !== "full_wrap" || !full?.total_width || !full?.panel_width) return null;
    return full;
  }, [spine, previewSlot]);

  if (!project || !specs) return <div className="p-10 font-mono-spec text-xs text-neutral-500">Loading editor…</div>;

  const isCover = project.project_type !== "interior";
  // Which cover-upload screen to show. Independent of Binding (paperback /
  // hardcover case / hardcover jacket, its own field) -- this only decides
  // whether the customer sees one combined-file drop zone or three separate
  // ones, never the cover's actual shape. Falls back to whatever's already
  // uploaded for a project created before this choice existed, so nobody's
  // existing work suddenly looks unset.
  const hasCoverPieces = !!(project.slots?.front_cover || project.slots?.spine || project.slots?.back_cover);
  const effectiveCoverMode = project.cover_upload_mode
    || (project.slots?.full_wrap ? "full" : hasCoverPieces ? "separate" : null);
  // Separate pieces are assembled for paperbacks only: a hardcover wrap also needs hinge/wrap (and flap)
  // areas that separate front/back pieces don't carry, so hardcovers always take one combined file.
  const piecesAllowed = (project.binding || "paperback") === "paperback";
  const coverMode = piecesAllowed ? effectiveCoverMode : "full";
  const inches = (n) => `${(Math.round(Number(n) * 1000 + 1e-6) / 1000).toFixed(3).replace(/\.?0+$/, "")}"`;
  const fc = spine?.full_cover;
  const coverSizes = fc?.total_width ? {
    full: `${inches(fc.total_width)} × ${inches(fc.total_height)}`,
    panel: `${inches(fc.panel_width + 2 * fc.bleed)} × ${inches(fc.panel_height + 2 * fc.bleed)}`,
    spine: `${inches(fc.spine_width)} × ${inches(fc.panel_height + 2 * fc.bleed)}`,
  } : null;
  const needsInterior = project.project_type === "interior" || project.project_type === "combined";
  const interiorPages = project.slots?.interior?.pdf_pages || null;
  // A hardcover whose distributor publishes no spine formula: the size can't be known until the user
  // enters the number from their template (the server won't check or export the cover without it).
  const spineRequired = ["hardcover_case", "hardcover_jacket"].includes(project.binding) && !project.spine_width_override && !!spine?.spine_is_estimate;
  const caseSize = caseSpine?.full_cover?.total_width ? `${inches(caseSpine.full_cover.total_width)} × ${inches(caseSpine.full_cover.total_height)}` : null;
  const trim = specs.trim_sizes[project.trim_size] || { w: 6, h: 9, label: project.trim_size };
  const plat = specs.platforms[project.platform] || {};
  const compliance = project.slots?.full_wrap?.compliance || project.compliance || [];
  const coverSlotName = project.slots?.front_cover && !project.slots?.full_wrap ? "front_cover" : "full_wrap";
  const interiorCompliance = project.slots?.interior?.compliance || [];
  const hasInteriorUpload = !!project.slots?.interior;
  const hasAnyUpload = Object.values(project.slots || {}).length > 0 || !!project.uploaded_file;
  const coverSummary = summarizeCompliance(isCover ? compliance : []);
  const interiorSummary = summarizeCompliance(needsInterior ? interiorCompliance : []);
  const coverClear = !isCover || coverSummary.verdict === "pass" || coverSummary.verdict === "warning";
  const interiorClear = !needsInterior || (hasInteriorUpload && (interiorSummary.verdict === "pass" || interiorSummary.verdict === "warning"));
  // Hardcover with Dust Jacket needs a third file (the plain case) before
  // it's actually export-ready -- see CASE_SLOT / the upload block above.
  const needsCase = isCover && project.binding === "hardcover_jacket";
  const hasCaseUpload = !!project.slots?.case_wrap;
  const caseSummary = summarizeCompliance(needsCase ? (project.slots?.case_wrap?.compliance || []) : []);
  const caseClear = !needsCase || (hasCaseUpload && (caseSummary.verdict === "pass" || caseSummary.verdict === "warning"));
  const readyForFinalReview = hasAnyUpload && coverClear && interiorClear && caseClear && (!needsInterior || hasInteriorUpload) && (!needsCase || hasCaseUpload);
  const unlockedIssues = Object.values(project.slots || {}).reduce((n, s) => n + (s.compliance || []).filter(isOpenIssue).length, 0);
  // Free plan is preview + compliance only -- TIERS.free.monthly_exports is 0 on the
  // backend, which is the actual enforcement; this just avoids sending a free user
  // into a doomed export click instead of straight to the upgrade page.
  const isFreeTier = (user?.tier || "free") === "free";

  // ---- Step guide (owner, 2026-09-30): first-time users see five steps, the current one glows, and ONE button
  // does the next thing. Every fix action lives in the guide -- nowhere else on the page.
  const titleSet = !!(project.name && project.name.trim() && project.name.trim().toLowerCase() !== "untitled book");
  const coverUploadedG = !isCover || !!(project.slots?.full_wrap || project.slots?.front_cover || project.uploaded_file);
  const filesUploaded = coverUploadedG && (!needsInterior || hasInteriorUpload) && (!needsCase || hasCaseUpload);
  const missingFiles = [!coverUploadedG && "your cover", needsInterior && !hasInteriorUpload && "your interior",
    needsCase && !hasCaseUpload && "your case cover"].filter(Boolean);
  const coverIssues = isCover ? compliance.filter(isOpenIssue) : [];
  const interiorIssues = needsInterior ? interiorCompliance.filter(isOpenIssue) : [];
  const caseIssues = needsCase ? (project.slots?.case_wrap?.compliance || []).filter(isOpenIssue) : [];
  const isDpi = (c) => c.fix_action === "upscale_300dpi";
  const coverFixable = coverIssues.filter((c) => c.auto_fix && !isDpi(c));
  const coverDpi = coverIssues.filter(isDpi);
  const coverManual = coverIssues.filter((c) => !c.auto_fix && !isDpi(c));
  const interiorFixable = interiorIssues.filter((c) => c.auto_fix);
  const interiorManual = interiorIssues.filter((c) => !c.auto_fix);
  const caseFixable = caseIssues.filter((c) => c.auto_fix && !isDpi(c));
  const caseDpi = caseIssues.filter(isDpi);
  const caseManual = caseIssues.filter((c) => !c.auto_fix && !isDpi(c));
  const allFixed = filesUploaded && !project.results_locked && !coverIssues.length && !interiorIssues.length && !caseIssues.length;
  // Export runs every check on every page of the final files, so exporting (e.g. from the celebration's
  // "Export Now") also completes the final check -- the guide never points back at step 4 afterwards.
  const finalDone = (!!finalReview && finalReview.status !== "red") || !!exportResult;
  const guideSteps = [
    { key: "details", label: "Book details", done: titleSet && !spineRequired },
    { key: "upload", label: "Upload", done: filesUploaded },
    { key: "fix", label: "Fix", done: allFixed },
    { key: "final", label: "Final check", done: finalDone },
    { key: "export", label: "Export & certify", done: !!exportResult },
  ];
  const currentStep = (guideSteps.find((st) => !st.done) || guideSteps[guideSteps.length - 1]).key;
  const glowIf = (key) => (currentStep === key ? STEP_GLOW_CLASS : "");
  const goTo = (testid, focus) => {
    const el = document.querySelector(`[data-testid="${testid}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (focus) setTimeout(() => el?.focus?.(), 350);
  };
  const FRIENDLY_ISSUE = { colorspace: "print colors", cover_safety_margin: "text too close to the edge", dpi: "sharpness",
    interior_page_size_mismatch: "page size", interior_safety_margin: "text too close to the page edge", total_ink_coverage: "ink coverage",
    transparency: "transparency", cover_spine_text_margin: "spine text doesn't fit the spine", cover_size: "cover size",
    cover_template_leftovers: "template parts left on the cover", cover_isbn_mismatch: "ISBN doesn't match the book",
    cover_jacket_fold: "text on a jacket fold" };
  const names = (list) => [...new Set(list.map((c) => FRIENDLY_ISSUE[c.id] || plainCheckLabel(c).split(" (")[0].toLowerCase()))].join(", ");
  // The fix button for each section, shown right where its problems are listed (owner's rule: the button that
  // fixes a problem sits next to the problem, not somewhere else on the screen).
  const needBookAction = project.owns_product === false ? { label: "Get a book to fix them", onClick: () => needsBook("Fixing") } : null;
  const fixCoverAction = { label: "Auto-Fix All Issues", onClick: autofix, busy: fixing, busyLabel: "Fixing…" };
  const upscaleCoverAction = { label: "AI Upscale my cover", onClick: () => aiEnhance(coverSlotName), busy: enhancingSlot === coverSlotName, busyLabel: "Upscaling…" };
  const newCoverAction = { label: "Upload a new cover", onClick: () => goTo("section-upload") };
  const fixInteriorAction = { label: "Auto-Fix All Issues", onClick: autofixInterior, busy: interiorFixing, busyLabel: "Fixing…" };
  const newInteriorAction = { label: "Upload a new interior", onClick: () => goTo("section-upload") };
  const coverAction = needBookAction && coverIssues.length ? needBookAction
    : coverFixable.length ? fixCoverAction : coverDpi.length ? upscaleCoverAction : coverManual.length ? newCoverAction : null;
  const interiorAction = needBookAction && interiorIssues.length ? needBookAction
    : interiorFixable.length ? fixInteriorAction : interiorManual.length ? newInteriorAction : null;
  // One card, its own fix: sharpen a soft cover, fix what SparkPrep can fix, or ask for a new file only when it can't.
  // Each card's button names its own fix, as in the original fix buttons (Sep 19): "Convert to CMYK", "Clamp Ink to 240%"...
  const named = (action, c) => ({ ...action, label: fixButtonLabel(c, "Apply Fix") });
  const coverCardAction = (c) => (!isOpenIssue(c) ? null : needBookAction || (isDpi(c) ? upscaleCoverAction : c.auto_fix ? named(fixCoverAction, c) : newCoverAction));
  const interiorCardAction = (c) => (!isOpenIssue(c) ? null : needBookAction || (c.auto_fix ? named(fixInteriorAction, c) : newInteriorAction));
  let guideNow;
  if (currentStep === "details") {
    guideNow = !titleSet
      ? { title: "Give your book its title", detail: "Type it at the top left — it goes on your files and your report. Then check the distributor, trim size, paper, binding and page count on the left.",
          action: { label: "Name my book", onClick: () => goTo("project-title-input", true) } }
      : { title: "Enter your spine width", detail: `Copy the spine width printed on your ${plat.name || "distributor"} cover template into the Spine Width box on the left.`,
          action: { label: "Go to Spine Width", onClick: () => goTo("spec-spine-override", true) } };
  } else if (currentStep === "upload") {
    guideNow = { title: "Upload your files", detail: `Still needed: ${missingFiles.join(", ")}. Your original files stay untouched on your computer.`,
      action: { label: "Go to upload", onClick: () => goTo("section-upload") } };
  } else if (currentStep === "fix") {
    if (project.results_locked) {
      guideNow = { title: project.results_summary?.issues ? `SparkPrep found ${project.results_summary.issues} issue${project.results_summary.issues === 1 ? "" : "s"}` : "Your scan is ready",
        detail: "Start your book (or get one) and SparkPrep fixes everything for you. Just want to see what was found? That's the $1.99 option just below.",
        action: { label: "Fix them with my book", onClick: () => { setBookNudge((n) => n + 1); bookBarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); } } };
    } else if (project.owns_product === false) {
      guideNow = { title: `${unlockedIssues} thing${unlockedIssues === 1 ? "" : "s"} to fix`, detail: "SparkPrep fixes these for you as part of your book — no other tools needed.",
        action: { label: "Get a book to fix them", onClick: () => needsBook("Fixing") } };
    } else if (coverFixable.length) {
      guideNow = { title: "Fix your cover", detail: `SparkPrep will fix: ${names(coverFixable)} — and check its own work before showing you.`,
        action: { label: "Fix my cover", onClick: autofix, busy: fixing, busyLabel: "Fixing…" } };
    } else if (coverDpi.length) {
      guideNow = { title: "Sharpen your cover", detail: "Your cover is under 300 DPI, so it could print soft. AI Upscale brings it to a true 300 DPI.",
        action: { label: "AI Upscale my cover", onClick: () => aiEnhance(coverSlotName), busy: enhancingSlot === coverSlotName, busyLabel: "Upscaling…" },
        secondary: { label: "Or upload a sharper image instead", onClick: () => retakePhoto(coverSlotName) } };
    } else if (interiorFixable.length) {
      guideNow = { title: "Fix your interior", detail: `SparkPrep will fix: ${names(interiorFixable)}.`,
        action: { label: "Fix my interior", onClick: autofixInterior, busy: interiorFixing, busyLabel: "Fixing…" } };
    } else if (caseFixable.length) {
      guideNow = { title: "Fix your case cover", detail: `SparkPrep will fix: ${names(caseFixable)} — and check its own work before showing you.`,
        action: { label: "Fix my case cover", onClick: autofixCase, busy: caseFixing, busyLabel: "Fixing…" } };
    } else if (caseDpi.length) {
      guideNow = { title: "Sharpen your case cover", detail: "Your case cover is under 300 DPI, so it could print soft. AI Upscale brings it to 300 DPI. (For the very sharpest print, a higher-resolution original is even better.)",
        action: { label: "AI Upscale my case cover", onClick: () => aiEnhance("case_wrap"), busy: enhancingSlot === "case_wrap", busyLabel: "Upscaling…" },
        secondary: { label: "Or upload a sharper case image instead", onClick: () => retakePhoto("case_wrap") } };
    } else if (coverManual.length || interiorManual.length || caseManual.length) {
      const which = coverManual.length ? "cover" : interiorManual.length ? "interior" : "case cover";
      const first = (coverManual[0] || interiorManual[0] || caseManual[0]);
      guideNow = { title: `Your ${which} needs a new file`, detail: `${plainCheckLabel(first)}: ${first.message} SparkPrep can't change this one by itself — fix it in your design file and upload it again.`,
        action: { label: `Upload a new ${which}`, onClick: () => goTo("section-upload") } };
    }
  } else if (currentStep === "final") {
    guideNow = finalReview?.status === "red"
      ? { title: "The final check found something", detail: finalReview.message, action: { label: "Run the final check again", onClick: runFinalReview, busy: checkingFinal, busyLabel: "Checking…" } }
      : { title: "Run the final check", detail: "SparkPrep re-checks your whole book together before export.", action: { label: "Run final check", onClick: runFinalReview, busy: checkingFinal, busyLabel: "Checking…" } };
  } else if (!exportResult) {
    guideNow = { title: "Export your print-ready files", detail: "SparkPrep checks every page of your final files and, when everything is clear, stamps them SparkPrep Certified.",
      action: { label: project.owns_product === false ? "Get a book to export" : "Export my book", onClick: project.owns_product === false ? () => needsBook("Export") : exportPdf, busy: exporting, busyLabel: "Checking every page…" } };
  } else {
    guideNow = { title: exportResult.certified ? "Your book is SparkPrep Certified" : "Exported — a few things are still open",
      detail: exportResult.certified ? "Your print files and your Certified report are in your download." : "Your Preflight Report in the download shows how to fix each one. Fix them and export again to earn SparkPrep Certified.",
      action: { label: "Export again", onClick: exportPdf, busy: exporting, busyLabel: "Checking every page…" } };
  }

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
              {isCover && (
                <InfoTip text={isFreeTier ? (bookModel ? "AI Blurb Writer is included with a book." : "AI Blurb Writer requires the Author plan or higher.") : "Generate 3 AI back-cover blurb variations with Claude Sonnet."}>
                  <button onClick={() => isFreeTier ? nav("/pricing") : setBlurbOpen(true)} className="px-3 py-2 border border-neutral-700 text-neutral-300 font-mono-spec text-[10px] tracking-widest uppercase hover:border-white hover:text-white flex items-center gap-1.5 btn-industrial" data-testid="blurb-btn">
                    <Sparkles className="w-3.5 h-3.5" /> AI Blurb{isFreeTier && " 🔒"}
                  </button>
                </InfoTip>
              )}
              {isCover && (
                <InfoTip text="Design your whole cover (front, spine and back) in the Cover Studio, already sized to this book. It comes back here when you send it.">
                  <button onClick={() => nav(`/cover-studio?book=${id}`)} className="px-3 py-2 border border-[#D4AF37] text-[#D4AF37] font-mono-spec text-[10px] tracking-widest uppercase hover:bg-[#D4AF37] hover:text-black flex items-center gap-1.5 btn-industrial" data-testid="cover-studio-btn">
                    <PenTool className="w-3.5 h-3.5" /> Cover Studio
                  </button>
                </InfoTip>
              )}
              {project.project_type !== "cover" && (
                <InfoTip text="Write or import your book's inside pages in the Interior Studio and watch the printed pages build. It comes back here when you send it.">
                  <button onClick={() => nav(`/interior-studio?book=${id}`)} className="px-3 py-2 border border-[#D4AF37] text-[#D4AF37] font-mono-spec text-[10px] tracking-widest uppercase hover:bg-[#D4AF37] hover:text-black flex items-center gap-1.5 btn-industrial" data-testid="interior-studio-btn">
                    <PenTool className="w-3.5 h-3.5" /> Interior Studio
                  </button>
                </InfoTip>
              )}
              {isCover && (
                <InfoTip text="Start from a typographic cover template — replaces the full cover wrap, fully editable after.">
                  <button onClick={() => setCoverTemplateOpen(true)} className="px-3 py-2 border border-neutral-700 text-neutral-300 font-mono-spec text-[10px] tracking-widest uppercase hover:border-white hover:text-white flex items-center gap-1.5 btn-industrial" data-testid="cover-template-btn">
                    <Palette className="w-3.5 h-3.5" /> Cover Templates
                  </button>
                </InfoTip>
              )}
              {isCover && (
                <InfoTip text={isFreeTier ? (bookModel ? "AI Cover Generation is included with a book." : "AI Cover Generation requires the Author plan or higher.") : "Generate cover art from a text description (Google Imagen)."}>
                  <button onClick={() => isFreeTier ? nav("/pricing") : setAiCoverOpen(true)} className="px-3 py-2 border border-neutral-700 text-neutral-300 font-mono-spec text-[10px] tracking-widest uppercase hover:border-white hover:text-white flex items-center gap-1.5 btn-industrial" data-testid="ai-cover-btn">
                    <ImageIcon className="w-3.5 h-3.5" /> AI Cover{isFreeTier && " 🔒"}
                  </button>
                </InfoTip>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="mb-4 empty:hidden" ref={bookBarRef}>
            <BookPassBar
              projectId={id} bookRequiredAt={bookNudge}
              onStarted={() => { setBookStartedAt(Date.now()); load(); }}
              creditAuditId={!project.results_locked && project.owns_product === false ? project.results_audit_id : undefined}
            />
          </div>
          {bookModel && project.project_type !== "combined" && (
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap border border-neutral-800 bg-[#111111] px-4 py-2.5" data-testid="add-other-half">
              <span className="text-xs text-neutral-400">
                Need the {project.project_type === "cover" ? "interior" : "cover"} too? It's part of this same book — no extra charge.
              </span>
              <button
                onClick={() => updateSpec({ project_type: "combined" })}
                className="px-3 py-1.5 border border-neutral-600 text-neutral-200 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase btn-industrial"
                data-testid="add-other-half-btn"
              >
                Add the {project.project_type === "cover" ? "interior" : "cover"}
              </button>
            </div>
          )}
          <div className="sticky top-[64px] z-30 bg-[#0A0A0A] pb-1" data-testid="step-guide-pin">
            <StepGuide steps={guideSteps} current={currentStep} now={guideNow}
              rescan={filesUploaded && !project.results_locked && project.owns_product !== false
                ? { onClick: runFinalReview, busy: checkingFinal } : null} />
          </div>
          {/* THREE-COLUMN WORKSPACE: Job Setup · Live Layout · 3D Proof */}
          <div className={`grid gap-4 ${isCover ? "lg:grid-cols-[340px_1fr_380px]" : "lg:grid-cols-[340px_1fr]"}`}>

            {/* ===== LEFT · JOB SETUP ===== */}
            <div className={`bg-[#111111] border border-neutral-800 flex flex-col ${glowIf("details")}`} data-testid="panel-job-setup">
              <div className="p-4 border-b border-neutral-800">
                <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Job Setup</span>
                <p className="text-sm text-neutral-400 mt-1">Set the distributor blueprint, then drop your files.</p>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto">
                <DarkSpecField label="Distributor" tooltip="Distributor whose print requirements the file must pass.">
                  <Select value={project.platform} onValueChange={(v) => updateSpec({ platform: v })}>
                    <SelectTrigger className="text-white" data-testid="spec-platform"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.platforms).map(([k, v]) => <SelectItem key={k} value={k}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Trim Size" tooltip="Final page dimensions after cutting. Sets required bleed + safe margins.">
                  <Select value={project.trim_size} onValueChange={(v) => updateSpec({ trim_size: v })}>
                    <SelectTrigger className="text-white" data-testid="spec-trim"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.trim_sizes).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Paper Type" tooltip="Paper stock affects spine width via pages-per-inch (PPI). White vs cream vs color.">
                  <Select value={project.paper_type} onValueChange={(v) => updateSpec({ paper_type: v })}>
                    <SelectTrigger className="text-white" data-testid="spec-paper"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.paper_types).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Binding" tooltip="Binding style — determines whether spine text is allowed and jacket flap dimensions.">
                  <Select value={project.binding} onValueChange={(v) => updateSpec({ binding: v })}>
                    <SelectTrigger className="text-white" data-testid="spec-binding"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(specs.binding_types).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                {spine?.binding_unsupported_on_platform && (
                  <div className="bg-amber-950/30 border border-amber-900 p-2.5 -mt-1" data-testid="binding-unsupported-warning">
                    <p className="text-[11px] text-amber-400 leading-relaxed">
                      {specs.platforms?.[project.platform]?.name || project.platform} doesn't actually offer{" "}
                      {specs.binding_types?.[project.binding]?.label || project.binding} as a submission type — their own cover tools don't have this option. Pick a binding they actually support, or switch distributors.
                    </p>
                  </div>
                )}
                <DarkSpecField label="Page Count" tooltip="Total interior page count — used to calculate spine width. Uploading your interior fills this in for you.">
                  <Input className="text-white" type="number" min={24} value={project.page_count} onChange={(e) => updateSpec({ page_count: parseInt(e.target.value) || 0 })} data-testid="spec-pages" />
                  {interiorPages ? (
                    interiorPages === project.page_count ? (
                      <p className="text-[11px] text-neutral-500 mt-1.5" data-testid="pages-from-interior">Matches your interior ({interiorPages} pages).</p>
                    ) : (
                      <p className="text-[11px] text-amber-400 mt-1.5 leading-relaxed" data-testid="pages-mismatch">
                        Your interior has {interiorPages} pages, but this says {project.page_count}. The spine and cover size follow this number — make sure it's the page count you enter at {plat.name || "your distributor"}.
                      </p>
                    )
                  ) : null}
                </DarkSpecField>
                {(project.binding === "hardcover_case" || project.binding === "hardcover_jacket") && (
                  <DarkSpecField
                    label={spineRequired ? "Spine Width — required" : "Spine Width"}
                    tooltip="For a hardcover, your distributor's cover template shows the exact spine width for your page count and paper. Copy it here and SparkPrep builds your cover around that exact figure."
                  >
                    <Input
                      className="text-white"
                      type="number"
                      step="0.001"
                      min={0}
                      placeholder={spine?.spine_width && !spine.spine_is_estimate ? `Calculated: ${spine.spine_display || spine.spine_width}"` : "e.g. 0.313"}
                      defaultValue={project.spine_width_override ?? ""}
                      onBlur={(e) => {
                        const raw = e.target.value.trim();
                        const next = raw === "" ? 0 : parseFloat(raw);
                        if (next !== (project.spine_width_override || 0)) updateSpec({ spine_width_override: next });
                      }}
                      data-testid="spec-spine-override"
                    />
                    {spineRequired ? (
                      <p className="text-[11px] text-red-400 mt-1.5 leading-relaxed" data-testid="spine-required">
                        Copy the spine width printed on your {plat.name || "distributor"} cover template (for example 0.313) into this box — {plat.name || "your distributor"} sets a hardcover's spine for your exact page count and paper on that template. Until then, SparkPrep can't size or check your cover.
                      </p>
                    ) : project.spine_width_override ? (
                      <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                        Using your number: {project.spine_width_override}". Clear the box to go back to the calculated width.
                      </p>
                    ) : spine?.spine_source === "ingramspark_templates" ? (
                      <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed" data-testid="spine-from-templates">
                        Calculated: <span className="text-white">{spine.spine_display}"</span> for {spine.page_count_used} pages — SparkPrep's
                        hardcover spine formula matches IngramSpark's own cover templates. Double-check it against the spine printed on
                        your IngramSpark template; if they ever differ, type the template's number here.
                      </p>
                    ) : (
                      <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                        Calculated from {plat.name || "this distributor"}'s published spine table ({spine?.spine_display ? `${spine.spine_display}"` : "…"}).
                        Leave blank to use it, or type the number from your cover template.
                      </p>
                    )}
                  </DarkSpecField>
                )}
                <DarkSpecField label="Project Type" tooltip="Cover only, interior only, or both.">
                  <Select value={project.project_type} onValueChange={(v) => updateSpec({ project_type: v })}>
                    <SelectTrigger className="text-white" data-testid="spec-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover only</SelectItem>
                      <SelectItem value="interior">Interior only</SelectItem>
                      <SelectItem value="combined">Cover + Interior</SelectItem>
                    </SelectContent>
                  </Select>
                </DarkSpecField>
                <DarkSpecField label="Series (optional)" tooltip="Books sharing a series name get checked for consistent trim/binding/paper together from the dashboard.">
                  <Input
                    className="text-white"
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
                <div className={`border-t border-neutral-800 pt-4 ${glowIf("upload")}`} data-testid="section-upload">
                  <p className="text-[11px] text-neutral-500 mb-3 flex items-start gap-1.5" data-testid="original-safe-note">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-px" />
                    Your original file stays untouched on your computer — SparkPrep works on its own copy.
                  </p>
                  {needsInterior && (
                    <div className={isCover ? "mb-4" : ""}>
                      <p className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-2">Upload your book</p>
                      <BigInteriorDrop
                        data={project.slots?.interior}
                        uploading={uploadingSlot === "interior"}
                        onUpload={(f) => uploadToSlot("interior", f)}
                        onDelete={() => deleteSlot("interior")}
                      />
                      <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                        Your whole manuscript, in the order it should print. Word (.docx) and plain text are converted into a print-ready
                        interior automatically; a PDF is used as-is. Don't have any file yet?{" "}
                        <button onClick={() => setComposerOpen(true)} className="text-[#D4AF37] hover:underline" data-testid="composer-btn">Paste your text into a ready-made layout</button>{" "}
                        instead — opens a dialog where you pick a novel/workbook/poetry layout, paste your manuscript text directly into a box, and it generates the print-ready PDF for you.
                      </p>
                    </div>
                  )}
                  {isCover && (
                    <>
                      <p className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-3">Upload cover files</p>
                      {!piecesAllowed && hasCoverPieces && (
                        <p className="text-xs text-amber-400 mb-3 leading-relaxed" data-testid="hardcover-needs-one-file">
                          Hardcover covers need one combined file — the hinge and wrap areas{project.binding === "hardcover_jacket" ? " and the jacket's flaps" : ""} aren't part of separate front and back pieces.
                        </p>
                      )}
                      {!coverMode ? (
                        <div className="grid grid-cols-2 gap-2" data-testid="cover-mode-choice">
                          <button
                            type="button"
                            onClick={() => updateSpec({ cover_upload_mode: "full" })}
                            className="border border-neutral-700 hover:border-[#D4AF37] p-4 text-left transition-colors"
                            data-testid="cover-mode-full"
                          >
                            <BookOpen className="w-5 h-5 text-[#D4AF37] mb-2" />
                            <div className="text-sm font-bold text-white">One combined file</div>
                            <div className="text-xs text-neutral-500 mt-1">Back, spine and front already laid out together in one file.</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSpec({ cover_upload_mode: "separate" })}
                            className="border border-neutral-700 hover:border-[#D4AF37] p-4 text-left transition-colors"
                            data-testid="cover-mode-separate"
                          >
                            <Layers className="w-5 h-5 text-[#D4AF37] mb-2" />
                            <div className="text-sm font-bold text-white">Front, spine &amp; back separately</div>
                            <div className="text-xs text-neutral-500 mt-1">Upload each piece on its own — SparkPrep lines them up for you.</div>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={coverMode === "full" ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2"}>
                            {COVER_SLOTS.filter((s) => coverMode === "full" ? s.key === "full_wrap" : s.key !== "full_wrap").map((s) => (
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
                          {spineRequired ? (
                            <p className="mt-2 text-xs text-red-400 leading-relaxed" data-testid="cover-size-needed">
                              Enter your Spine Width above first — your cover's exact size depends on it.
                            </p>
                          ) : coverSizes && (
                            <p className="mt-2 text-xs text-neutral-400 leading-relaxed" data-testid="cover-size-needed">
                              {coverMode === "full"
                                ? <>Your cover file must be exactly <span className="text-white">{coverSizes.full}</span> — back, spine and front together, with bleed.</>
                                : <>Front and back: <span className="text-white">{coverSizes.panel}</span> each, with bleed on every side. Spine: <span className="text-white">{coverSizes.spine}</span>. SparkPrep lines them up for you.</>}
                            </p>
                          )}
                          {piecesAllowed && (
                            <button
                              type="button"
                              onClick={() => updateSpec({ cover_upload_mode: coverMode === "full" ? "separate" : "full" })}
                              className="mt-2 text-[11px] text-neutral-500 hover:text-[#D4AF37] underline underline-offset-2"
                              data-testid="cover-mode-switch"
                            >
                              Switch to {coverMode === "full" ? "front / spine / back separately" : "one combined file"}
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {/* IngramSpark won't process a Hardcover with Dust Jacket book until
                      three files are uploaded: case, jacket, interior. It sends both a
                      Case Laminate and a Dust Jacket template for the book, and both
                      are needed. */}
                  {isCover && project.binding === "hardcover_jacket" && (
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <p className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-1">Case cover (goes under the jacket)</p>
                      <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
                        Dust jacket books also need a plain case file — this is what's printed on the hardcover boards themselves, hidden once the jacket's wrapped around it. It doesn't need to match your jacket art; a plain background color (or just the spine text) is completely normal.
                      </p>
                      {!spineRequired && caseSize && (
                        <p className="text-xs text-neutral-400 mb-3 leading-relaxed" data-testid="case-size-needed">
                          Your case file must be exactly <span className="text-white">{caseSize}</span> — both boards, spine and the wrap, with bleed.
                        </p>
                      )}
                      <SlotDrop
                        slot={CASE_SLOT}
                        data={project.slots?.case_wrap}
                        uploading={uploadingSlot === "case_wrap"}
                        onUpload={(f) => uploadToSlot("case_wrap", f)}
                        onDelete={() => deleteSlot("case_wrap")}
                      />
                      {(project.slots?.case_wrap?.compliance || []).filter(isOpenIssue).map((c) => (
                        <div
                          key={c.id}
                          className={`mt-2 flex items-start gap-2 text-xs leading-relaxed ${c.status === "fail" ? "text-red-400" : "text-amber-400"}`}
                          data-testid={`case-issue-${c.id}`}
                        >
                          {c.status === "fail" ? <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                          <span>
                            {c.id === "colorspace" ? "Your case file is RGB. It's converted to print-ready CMYK automatically when you export, nothing to do." : c.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isCover && (
                  <div className="border-t border-neutral-800 pt-4">
                    <IsbnBarcodePanel projectId={id} initialIsbn={project.isbn || ""} />
                    <label className="mt-3 flex items-start gap-2 cursor-pointer" data-testid="cover-has-barcode-toggle">
                      <Checkbox
                        checked={!!project.cover_has_barcode}
                        onCheckedChange={(v) => updateSpec({ cover_has_barcode: !!v })}
                        className="mt-0.5 border-neutral-500 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] data-[state=checked]:text-black"
                      />
                      <span className="text-[11px] text-neutral-400 leading-relaxed">
                        My cover art already has a barcode built in — don't add another one on export.
                      </span>
                    </label>
                  </div>
                )}

                <div className="border-t border-neutral-800 pt-4">
                  <PromoCodeRedeem projectId={id} onRedeemed={load} />
                </div>
              </div>

              <div className="p-4 border-t border-neutral-800 mt-auto">
                <div className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-600 text-center pt-1" data-testid="book-export-counter">
                  {bookModel
                    ? `Unlimited exports while your book is active${pricing?.book ? ` (${pricing.book.window_days} days)` : ""}`
                    : `${Math.max(0, 5 - (project.exports_used || 0))} of 5 exports remaining for this book`}
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
              {project.results_locked && (
                <div className={`p-4 border-t border-neutral-800 ${glowIf("fix")}`} data-testid="compliance-list">
                  <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37] block mb-2">Check Results</span>
                  <LockedResults summary={project.results_summary} pricing={pricing} onUnlock={unlockResults} unlocking={unlocking} hasInterior={needsInterior} />
                </div>
              )}
              {!project.results_locked && project.owns_product === false && unlockedIssues > 0 && (
                <div className="px-4 pt-4 border-t border-neutral-800">
                  <FixItCta
                    issues={unlockedIssues} pricing={pricing} onFix={() => needsBook("Repair Bay")} auditId={project.results_audit_id}
                    onUpgrade={project.results_can_upgrade ? () => unlockResults("advanced") : undefined}
                  />
                </div>
              )}

              {/* Check results -- Cover */}
              {!project.results_locked && isCover && (
                <div className={`p-4 border-t border-neutral-800 ${currentStep === "fix" && coverIssues.length ? STEP_GLOW_CLASS : ""}`} data-testid="compliance-list">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">{needsInterior ? "Cover Check Results" : "Check Results"}</span>
                  </div>
                  {compliance.length === 0 && <p className="text-xs text-neutral-500">Upload a file to see the results here.</p>}
                  {compliance.length > 0 && <ScanStatusBanner result={coverFixResult} summary={coverSummary} sectionLabel="Cover" action={coverAction} />}
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {compliance.map((c, i) => (
                      <ComplianceCard key={i} c={c} action={coverCardAction(c)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Check results -- Interior (interior-only or combined projects) */}
              {!project.results_locked && needsInterior && (
                <div className={`p-4 border-t border-neutral-800 ${currentStep === "fix" && !coverIssues.length && interiorIssues.length ? STEP_GLOW_CLASS : ""}`} data-testid="compliance-list-interior">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Interior Check Results</span>
                      <span className="font-mono-spec text-[8px] tracking-widest uppercase text-neutral-500 border border-neutral-700 px-1.5 py-0.5">First page checked</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">
                    {bookModel
                      ? <>Right now SparkPrep has checked the first page of your interior. When you export, it checks every page (up to 300) before your book can be SparkPrep Certified.</>
                      : <>This checks the first page of your interior. Every page (up to 300) is checked with a book.</>}
                  </p>
                  {!hasInteriorUpload && <p className="text-xs text-neutral-500">Upload your book above to see the results here.</p>}
                  {hasInteriorUpload && interiorCompliance.length > 0 && <ScanStatusBanner result={interiorFixResult} summary={interiorSummary} sectionLabel="Interior" action={interiorAction} />}
                  {hasInteriorUpload && (
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {interiorCompliance.map((c, i) => (
                        <ComplianceCard key={i} c={c} action={interiorCardAction(c)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Final Review -- appears once every required section is clean */}
              <div className={`p-4 border-t border-neutral-800 ${glowIf("final")}`} data-testid="final-review-section">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Final Review</span>
                </div>
                {!readyForFinalReview && (
                  <p className="text-xs text-neutral-500">
                    {!hasAnyUpload ? "Upload your files and pass the section(s) above first." : "Finish the section(s) above (no failing checks) to unlock the final review."}
                  </p>
                )}
                {readyForFinalReview && !finalReview && (
                  <InlineFixButton action={{ label: "Run final check", onClick: runFinalReview, busy: checkingFinal, busyLabel: "Checking…" }} testid="final-review-run" />
                )}
                {finalReview && (
                  <FinalReviewResult review={finalReview} />
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
                  <div className="w-full h-[440px] rounded-sm overflow-hidden border border-neutral-800" data-testid="book-3d-wrap">
                    <ErrorBoundary
                      fallback={
                        <div className="w-full h-full flex items-center justify-center text-center px-6 bg-[#0D0D0D]">
                          <p className="text-xs text-neutral-500">The book preview couldn't load this time — the rest of the editor is unaffected. Try refreshing.</p>
                        </div>
                      }
                    >
                      <BookMockup
                        imageUrl={previewSlot === "full_wrap" || previewSlot === "front_cover" ? book3dTextureUrl : null}
                        crop={coverCrop}
                        trim={spine?.trim || trim}
                        spineWidth={spine?.spine_width || 0.5}
                        hasCover={previewSlot === "full_wrap" || previewSlot === "front_cover"}
                        imageFailed={book3dFailed}
                        spineTextAllowed={spine?.spine_text_allowed}
                      />
                    </ErrorBoundary>
                  </div>
                  <p className="text-[11px] text-neutral-500 text-center mt-2">{plat.name} · {trim.label} · {specs.binding_types?.[project.binding]?.label || project.binding}</p>
                </div>

                {/* Manual adjustments for experts, folded away -- every fix lives in the step guide */}
                <details className="p-4 border-t border-neutral-800 group" data-testid="expert-settings">
                  <summary className="cursor-pointer font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 hover:text-neutral-300 list-none">
                    ▸ Expert settings <span className="normal-case tracking-normal text-neutral-600">— most people never need these</span>
                  </summary>
                  <div className="pt-2 space-y-4">
                    <div>
                      <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Color profile</Label>
                      <Select value={adj.color_profile} onValueChange={(v) => saveAdj({ color_profile: v })}>
                        <SelectTrigger className="mt-1.5 text-white" data-testid="adj-color-profile"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US Web Coated SWOP v2">US Web Coated SWOP v2 (default)</SelectItem>
                          <SelectItem value="GRACoL 2013">GRACoL 2013 (premium color)</SelectItem>
                          <SelectItem value="FOGRA39">FOGRA39 (European offset)</SelectItem>
                          <SelectItem value="Japan Color 2001 Coated">Japan Color 2001 Coated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>

        </div>

        <BlurbDialog open={blurbOpen} onOpenChange={setBlurbOpen} defaultTitle={project.name} />
        <ManuscriptComposerDialog open={composerOpen} onOpenChange={setComposerOpen} defaultProject={project} />
        <CoverTemplateDialog open={coverTemplateOpen} onOpenChange={setCoverTemplateOpen} projectId={id} onApplied={applySlotResult} />
        <AICoverDialog open={aiCoverOpen} onOpenChange={setAiCoverOpen} projectId={id} onGenerated={applySlotResult} />
        {bay && (
          <RepairBay
            projectId={id}
            slot={bay.slot}
            fileLabel={bay.slot === "interior" ? "interior" : bay.slot === "case_wrap" ? "case cover" : "cover"}
            onResult={applyBayResult(bay)}
            onClose={closeBay}
            onLegacyFallback={() => { const b = bay; setBay(null); runAutofixLegacy(b.slot, b.setBusy, b.setResult); }}
          />
        )}
        {exporting && (
          <div className="fixed inset-0 z-[94] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" data-testid="exporting-overlay" role="status" aria-live="polite">
            <div className="max-w-md text-center">
              <div className="mx-auto w-14 h-14 rounded-full border-4 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
              <div className="font-display font-black text-2xl text-white mt-6">Building your print files…</div>
              <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
                SparkPrep is checking every page of your final files for SparkPrep Certified. Long books can take a few
                minutes — keep this tab open. Your files will download by themselves when it's done.
              </p>
              <div className="font-mono-spec text-[11px] tracking-widest text-[#D4AF37] mt-4">{exportSeconds}s</div>
            </div>
          </div>
        )}
        {exportResult && !exportResult.closed && (
          <CertifiedModal result={exportResult} title={project.name || "Your book"} onDownload={() => downloadExport(exportResult)} onDownloadFile={downloadExportFile}
            onClose={() => setExportResult((r) => (r ? { ...r, closed: true } : r))} />
        )}
        {showCelebration && (
          <BookReadyCelebration
            title={project.name && project.name.toLowerCase() !== "untitled book" ? `"${project.name}"` : "Your book"}
            onExport={() => { setShowCelebration(false); if (bay) closeBay(); exportPdf(); }}
            onClose={() => { setShowCelebration(false); if (bay) closeBay(); }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// Action-verb label for a card's own fix button (restored from the original Sep 19 fix buttons). Several checks share
// one fix, so the finding id picks the words.
function fixButtonLabel(c, fallback) {
  if (c.id === "total_ink_coverage") {
    const limit = (c.label || "").match(/limit (\d+)%/)?.[1];
    return limit ? `Clamp Ink to ${limit}%` : "Clamp Ink Coverage";
  }
  if (c.id === "colorspace") return "Convert to CMYK";
  if (["interior_page_size_mismatch", "interior_safety_margin", "cover_safety_margin"].includes(c.id)) return "Nudge to Safe Margin";
  if (c.fix_action === "flatten") return "Flatten Layers";
  return fallback;
}

// The button that fixes a problem, right next to it.
function InlineFixButton({ action, testid, small }) {
  if (!action) return null;
  return (
    <button onClick={action.onClick} disabled={!!action.busy}
      className={`${small ? "mt-2 px-3 py-1.5 text-[10px]" : "mt-2 px-4 py-2 text-[10px]"} btn-gold font-mono-spec tracking-widest uppercase btn-industrial inline-flex items-center gap-1.5 disabled:opacity-60`}
      data-testid={testid}>
      {action.busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
      {action.busy ? (action.busyLabel || "Working…") : action.label}
    </button>
  );
}

function ComplianceCard({ c, action }) {
  if (c.fixed_on_export) {
    return (
      <div className="border border-emerald-900 bg-[#0D0D0D] p-3" data-testid={`compliance-${c.id}`} data-fixed-on-export="true">
        <div className="px-2 py-0.5 text-[9px] font-mono-spec tracking-widest uppercase inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-300 border border-emerald-800">
          <Wand2 className="w-3 h-3" /> Fixed automatically
        </div>
        <div className="font-display font-bold text-sm mt-1.5 tracking-tight text-white">{plainCheckLabel(c)}</div>
        <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
          SparkPrep fixes this by itself when it builds your print files — nothing for you to do. The export then
          measures every page to prove it.
        </div>
      </div>
    );
  }
  const fixLabel = c.status !== "pass" && c.auto_fix ? (FIX_ACTION_LABELS[c.fix_action] || "Fix available") : null;
  // Low-DPI specifically gets real fix options (a fresh camera photo, or an
  // AI enhance pass) instead of just a label -- Auto-Fix's CMYK conversion
  // never actually resampled pixel dimensions for this one, so leaving it
  // at a label with no action was misleading about what "auto_fix: true"
  // could actually do here.
  const isDpiIssue = c.status !== "pass" && c.fix_action === "upscale_300dpi";
  return (
    <div className="border border-neutral-800 bg-[#0D0D0D] p-3" data-testid={`compliance-${c.id}`}>
      <div className={`px-2 py-0.5 text-[9px] font-mono-spec tracking-widest uppercase inline-flex items-center gap-1 ${statusPill(c.status)}`}>
        {statusIcon(c.status)} {c.status}
      </div>
      <div className="font-display font-bold text-sm mt-1.5 tracking-tight text-white">{plainCheckLabel(c)}</div>
      <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{c.message}</div>
      {fixLabel && !isDpiIssue && (
        <div className="text-[10px] text-[#D4AF37] mt-1.5 flex items-center gap-1">
          <Wand2 className="w-3 h-3 shrink-0" /> {fixLabel}
        </div>
      )}
      {isDpiIssue && (
        <div className="text-[10px] text-[#D4AF37] mt-1.5 flex items-center gap-1">
          <Wand2 className="w-3 h-3 shrink-0" /> Fixed with AI Upscale
        </div>
      )}
      <InlineFixButton action={action} testid={`fix-inline-${c.id}`} small />
    </div>
  );
}

// Clear, persistent verdict after a scan/autofix run -- replacing a toast
// that disappears with a banner that stays until the next action, showing
// exactly what happened and what to do next (the gap that was blocking
// completing the flow: a scan ran but nothing told the user pass/fail/next).
function ScanStatusBanner({ result, summary, sectionLabel, action }) {
  const verdict = result || summary;
  if (!verdict || verdict.verdict === "empty") return null;
  const styles = {
    fail: "border-red-900 bg-red-950/30 text-red-300",
    warning: "border-amber-800 bg-amber-950/20 text-amber-300",
    pass: "border-emerald-800 bg-emerald-950/20 text-emerald-300",
  };
  const icon = { fail: <XCircle className="w-4 h-4" />, warning: <AlertTriangle className="w-4 h-4" />, pass: <Check className="w-4 h-4" /> }[verdict.verdict];
  const headline = {
    fail: `${sectionLabel} — ${verdict.fails} issue${verdict.fails === 1 ? "" : "s"} to fix`,
    warning: `${sectionLabel} — ${verdict.warnings} thing${verdict.warnings === 1 ? "" : "s"} to fix before print`,
    pass: `${sectionLabel} — all checks passed`,
  }[verdict.verdict];
  return (
    <div className={`border p-3 flex items-start gap-2.5 ${styles[verdict.verdict]}`} data-testid={`scan-status-${sectionLabel.toLowerCase()}`}>
      {icon}
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-sm">{headline}</div>
        {verdict.gsFailed && <div className="text-[11px] mt-0.5 opacity-90">{verdict.gsReason || "This one needs a manual fix."}</div>}
        {verdict.verdict !== "pass" && <InlineFixButton action={action} testid={`fix-section-${sectionLabel.toLowerCase()}`} />}
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

function FinalReviewResult({ review }) {
  const copy = {
    red: "Not ready to export yet.",
    yellow: "Exportable, but review the warnings first.",
    green: "All clear — ready to export.",
  }[review.status];

  // The stoplight verdict alone was leaving the user stuck with no idea what
  // was actually wrong or what to do about it -- the real explanation (title,
  // message, whether SparkPrep can auto-fix it) was already in review.sections
  // the whole time, just never rendered. Surface every non-passing check, and
  // be explicit when a check has no auto-fix (e.g. "your book is too thin for
  // spine text") so the user isn't stuck rescanning something that requires
  // editing the file itself before it can ever pass.
  const problemChecks = Object.entries(review.sections || {}).flatMap(([sectionName, s]) =>
    (s.compliance || [])
      .filter(isOpenIssue)
      .map((c) => ({ ...c, sectionName }))
  );
  const multiSection = Object.keys(review.sections || {}).length > 1;

  return (
    <div className="border border-neutral-800 bg-[#0D0D0D] p-4" data-testid="final-review-result">
      <div className="flex items-center gap-4">
        <StopLight status={review.status} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-black text-base text-white">{copy}</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">{review.message}</div>
        </div>
      </div>
      {problemChecks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2" data-testid="final-review-problems">
          {problemChecks.map((c, i) => (
            <div key={i}>
              {multiSection && (
                <div className="text-[9px] text-neutral-600 font-mono-spec tracking-widest uppercase mb-1">{c.sectionName}</div>
              )}
              <ComplianceCard c={c} />
              {!c.auto_fix && (
                <div className="text-[10px] text-neutral-500 mt-1 pl-1">
                  SparkPrep can't change this one by itself — fix it in your original design file and upload it again.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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

function PromoCodeRedeem({ projectId, onRedeemed }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const redeem = async () => {
    if (!code.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/redeem-promo`, { code: code.trim() });
      toast.success(data.unlocked || "Code redeemed");
      setCode("");
      await onRedeemed();
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Have a promo code?</Label>
      <div className="flex gap-2 mt-1.5">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && redeem()}
          placeholder="e.g. SPARK-XXXX-XXXX"
          className="font-mono uppercase text-white"
          data-testid="promo-code-input"
        />
        <button
          onClick={redeem}
          disabled={busy || !code.trim()}
          className="px-4 py-2 border border-neutral-700 text-neutral-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-[10px] font-mono-spec tracking-widest uppercase btn-industrial disabled:opacity-40 shrink-0"
          data-testid="promo-code-redeem"
        >
          {busy ? "Checking…" : "Redeem"}
        </button>
      </div>
    </div>
  );
}

function SlotDrop({ slot, data, uploading, onUpload, onDelete }) {
  const Icon = slot.icon;
  const filled = !!data;
  const [dragOver, setDragOver] = useState(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };
  return (
    <InfoTip text={slot.desc}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`block relative border border-dashed p-3 text-center cursor-pointer transition-colors ${filled ? "border-emerald-700 bg-emerald-950/30" : dragOver ? "border-[#D4AF37] bg-neutral-900" : uploading ? "border-[#FF6A00]" : "border-neutral-700 hover:border-[#D4AF37] hover:bg-neutral-900"}`}
        data-testid={`slot-${slot.key}`}
      >
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

// Large, plain-language dropzone for the interior manuscript -- unlike the small
// cover-piece tiles above, this is often the very first and only file a
// non-technical author needs to upload, so it gets its own full-width target
// and no jargon in the copy.
function BigInteriorDrop({ data, uploading, onUpload, onDelete }) {
  const filled = !!data;
  const [dragOver, setDragOver] = useState(false);
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`block relative border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${filled ? "border-emerald-700 bg-emerald-950/30" : dragOver ? "border-[#D4AF37] bg-neutral-900" : uploading ? "border-[#FF6A00]" : "border-neutral-700 hover:border-[#D4AF37] hover:bg-neutral-900"}`}
      data-testid="slot-interior"
    >
      <input type="file" accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.tif,.tiff,.webp" onChange={(e) => onUpload(e.target.files?.[0])} disabled={uploading} className="hidden" data-testid="slot-input-interior" />
      <FilePlus className={`w-6 h-6 mx-auto ${filled ? "text-emerald-500" : "text-neutral-500"}`} />
      {!filled && (
        <div className="mt-3 inline-block btn-gold px-5 py-2.5 font-mono-spec text-[10px] tracking-widest uppercase btn-industrial pointer-events-none">
          {uploading ? "Checking your file…" : "Choose Your Book File"}
        </div>
      )}
      <div className="font-display font-bold text-sm mt-2 text-neutral-200">
        {filled ? "Book uploaded" : uploading ? "Reading your file…" : "or drop it here — PDF, Word, or text"}
      </div>
      {filled && (
        <div className="font-mono-spec text-[9px] tracking-widest text-neutral-500 mt-1 uppercase leading-tight truncate">
          {data.original_filename}
        </div>
      )}
      {filled && data.dpi_x != null && (
        <div className="mt-2 font-mono-spec text-[9px] tracking-widest text-neutral-500 uppercase">{data.width_px}×{data.height_px}px · {data.dpi_x} DPI</div>
      )}
      {filled && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="absolute top-2 right-2 text-neutral-500 hover:text-red-500" data-testid="slot-delete-interior">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </label>
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
