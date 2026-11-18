import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import Nav from "@/components/Nav";
import SeasonBanner from "@/components/SeasonBanner";
import SeasonCountdown from "@/components/SeasonCountdown";
import BrandWatermark from "@/components/BrandWatermark";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, ShieldAlert, Zap, FileSearch, FileCheck2, Lock, FileText } from "lucide-react";
import { usePricing, money, isBookModel } from "@/lib/pricing";

const PROVENANCE_LABEL = { extracted: "Extracted", calculated: "Calculated", geometry: "From geometry", unresolved: "Unresolved" };

export default function AuditLanding() {
  const pricing = usePricing();
  const auditPrice = pricing ? money(pricing.audit.price_cents) : "";
  // Holiday Free Audit (backend book_pass config): one free audit per account while it runs.
  const freeAudit = !!pricing?.free_audit?.active;
  const [specs, setSpecs] = useState(null);
  const [platform, setPlatform] = useState("kdp");
  const [trim, setTrim] = useState("6x9");
  const [fileType, setFileType] = useState("interior");
  const [binding, setBinding] = useState("paperback");
  const [pageCount, setPageCount] = useState(200);
  const [paperType, setPaperType] = useState("white_50lb");
  const [spineWidth, setSpineWidth] = useState("");
  const isHardcover = binding === "hardcover_case" || binding === "hardcover_jacket";
  const [uploading, setUploading] = useState(false);
  const [auditId, setAuditId] = useState(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [detectedSpec, setDetectedSpec] = useState(null);
  const nav = useNavigate();
  const uploadBoxRef = useRef(null);

  // Welcome pop-up: 3 quick steps the first time someone opens the audit page (remembered per browser).
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return localStorage.getItem("sp_audit_welcome_seen") !== "1"; } catch { return true; }
  });
  const closeWelcome = () => {
    setShowWelcome(false);
    try { localStorage.setItem("sp_audit_welcome_seen", "1"); } catch { /* private mode: just close */ }
  };

  // Big "Upload" button at the top: brings the upload box into view and opens the file picker.
  const goToUpload = () => {
    const box = uploadBoxRef.current;
    if (!box) return;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    box.querySelector("input[type=file]")?.click();
  };

  useEffect(() => { api.get("/specs").then(({ data }) => setSpecs(data)); }, []);

  // Both the optional template upload and the final cover/interior upload
  // need to reference the same audit record, so create it lazily on
  // whichever action happens first instead of requiring a separate step.
  const ensureAuditId = async () => {
    if (auditId) return auditId;
    const { data } = await api.post("/audit/start", {
      platform, trim_size: trim, file_type: fileType,
      ...(fileType === "cover" ? { binding, page_count: pageCount, paper_type: paperType } : {}),
      ...(fileType === "cover" && isHardcover && parseFloat(spineWidth) > 0 ? { spine_width: parseFloat(spineWidth) } : {}),
    });
    setAuditId(data.audit_id);
    return data.audit_id;
  };

  const onTemplateFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTemplate(true);
    try {
      const id = await ensureAuditId();
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post(`/audit/${id}/template-upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setDetectedSpec(data.detected_spec);
      toast.success("Template read — using your publisher's real specs instead of the preset");
    } catch (err) {
      toast.error(fmtErr(err.response?.data?.detail) || "Could not read that template");
    } finally { setUploadingTemplate(false); }
  };

  const onFile = (e) => uploadFile(e.target.files?.[0]);

  // "Try a practice file": runs the same check on a small PDF that breaks print rules on purpose.
  const trySample = async () => {
    try {
      const res = await fetch("/samples/sparkprep-practice-file.pdf");
      const blob = await res.blob();
      uploadBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      await uploadFile(new File([blob], "sparkprep-practice-file.pdf", { type: "application/pdf" }));
    } catch {
      toast.error("Could not load the practice file. Please try again.");
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const id = await ensureAuditId();
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/audit/${id}/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      nav(`/audit/${id}/preview`);
    } catch (err) {
      toast.error(fmtErr(err.response?.data?.detail) || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div className="marketing min-h-screen noise-overlay">
      {showWelcome && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={closeWelcome}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-welcome-title"
            className="relative w-full max-w-md bg-neutral-950 border border-neutral-700 p-6 md:p-8 text-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="audit-welcome"
          >
            <button type="button" onClick={closeWelcome} aria-label="Close" className="absolute top-3 right-4 text-neutral-500 hover:text-white text-2xl leading-none">×</button>
            <h2 id="audit-welcome-title" className="font-display font-black text-2xl md:text-3xl tracking-tight">Check your book in 3 easy steps</h2>
            <p className="mt-2 text-sm text-neutral-400">{freeAudit ? `Free through December 31${(pricing?.free_audit?.per_account || 1) > 1 ? `, ${pricing.free_audit.per_account} free audits each` : ""}. No sign-up, no card.` : "No sign-up needed."}</p>
            <ol className="mt-5 space-y-4 text-sm leading-relaxed">
              <li className="flex gap-3"><span className="font-display font-black text-xl text-white w-6 shrink-0">1</span><span><b>Pick your printer and book size.</b> For example Amazon KDP, 6 x 9. Not sure? Leave it as it is.</span></li>
              <li className="flex gap-3"><span className="font-display font-black text-xl text-white w-6 shrink-0">2</span><span><b>Upload your cover or your inside pages.</b> A PDF works best. A picture of your cover works too.</span></li>
              <li className="flex gap-3"><span className="font-display font-black text-xl text-white w-6 shrink-0">3</span><span><b>See what the printer would reject.</b> We show every problem and where it is{freeAudit ? ". Type your email to see the full list." : "."}</span></li>
            </ol>
            <p className="mt-5 flex items-start gap-2 text-xs text-neutral-400"><Lock className="w-4 h-4 shrink-0" /> Your file stays private. We never share or sell it.</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => { closeWelcome(); goToUpload(); }}
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-black font-display font-black text-lg px-6 py-3 hover:bg-neutral-200"
                data-testid="audit-welcome-upload"
                data-next-step="Click to start"
                data-next-step-label="Upload your book file"
              >
                <Upload className="w-5 h-5" /> Upload my file
              </button>
              <button
                type="button"
                onClick={() => { closeWelcome(); trySample(); }}
                className="w-full text-sm text-neutral-300 underline underline-offset-4 hover:text-white"
                data-testid="audit-welcome-sample"
              >
                Not ready? Try a practice file first
              </button>
              <button type="button" onClick={closeWelcome} className="text-xs text-neutral-500 hover:text-white" data-testid="audit-welcome-close">I'll look around first</button>
            </div>
          </div>
        </div>
      )}
      <SeasonBanner />
      <Nav dark />
      <section className="relative overflow-hidden">
        <BrandWatermark variant="dark" position="hero-left" scale={0.58} maxPx={720} opacity={0.24} />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7">
            <span className="font-mono-spec text-xs tracking-widest uppercase text-neutral-400 border border-neutral-700 px-3 py-1.5 inline-flex items-center gap-2" data-testid="audit-tag">
              <ShieldAlert className="w-3 h-3" /> {freeAudit ? "[ Free Book File Audit · Holiday Gift ]" : `[ ${auditPrice ? `${auditPrice} ` : ""}Book File Audit · No Sign-Up ]`}
            </span>
            <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter mt-6 leading-[0.92]" data-testid="audit-title">
              Know exactly<br />why you'll get<br /><span className="text-neutral-500">rejected.</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-400 max-w-xl leading-relaxed">
              IngramSpark, KDP and Barnes & Noble often reject a file with a short note like <span className="font-mono-spec text-sm text-white">"resolution insufficient"</span> and no details. Upload your cover or inside pages here. We'll find every problem, show you exactly where it is, and tell you which printer rule it breaks. {freeAudit ? "Free this holiday season. No sign-up." : <>{auditPrice ? `${auditPrice}. ` : ""}No account.</>}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-mono-spec tracking-widest text-neutral-500 uppercase">
              <span className="border border-neutral-700 px-2 py-1">✓ Every problem found</span>
              <span className="border border-neutral-700 px-2 py-1">✓ The printer rule shown</span>
              <span className="border border-neutral-700 px-2 py-1">✓ Exact location</span>
              <span className="border border-neutral-700 px-2 py-1">✓ What to change</span>
            </div>
            <div className="mt-6 flex items-start gap-3 max-w-xl text-sm text-neutral-300 bg-white/5 border border-neutral-800 px-4 py-3" data-testid="audit-how-it-works">
              <span className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 shrink-0 mt-0.5">How it works</span>
              {freeAudit ? (
                <span>Upload your file. SparkPrep scans it and tells you how many problems it found. Then type your email to see every problem, where it is, and which printer rule it breaks. No sign-up, no card. For inside pages, the free audit checks page 1.</span>
              ) : (
                <span>Upload your file first. It's free. SparkPrep scans it and tells you honestly whether it found problems. Then pay{auditPrice ? ` ${auditPrice}` : ""} to see exactly what failed, where, and which printer rule it breaks. For inside pages, the audit checks page 1.</span>
              )}
            </div>
            <div className="mt-8 max-w-xl" data-testid="audit-quick-start">
              <button
                type="button"
                onClick={goToUpload}
                disabled={uploading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-display font-black text-lg md:text-xl px-8 py-4 hover:bg-neutral-200 transition-colors"
                data-testid="audit-quick-upload"
              >
                <Upload className="w-5 h-5" /> {freeAudit ? "Upload your cover or PDF, free" : "Upload your cover or PDF"}
              </button>
              <p className="mt-3 flex items-start gap-2 text-sm text-neutral-400 leading-relaxed">
                <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Your file stays private. We only use it to check your book, and we never share or sell it. No sign-up needed. <a href="/privacy/" className="underline hover:text-white">How we keep files private</a></span>
              </p>
              <button
                type="button"
                onClick={trySample}
                disabled={uploading}
                className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-300 underline underline-offset-4 hover:text-white"
                data-testid="audit-try-sample"
              >
                <FileText className="w-4 h-4" /> Not ready to upload your own book? Try a practice file
              </button>
              <p className="mt-1 text-xs text-neutral-500">Our practice page breaks print rules on purpose, so you can watch the check find them. {(pricing?.free_audit?.per_account || 1) > 1 ? `You get ${pricing.free_audit.per_account} free audits, so you can try the practice file and still check your own book.` : ""}</p>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            <SeasonCountdown />
            <div className="marketing-surface p-6" data-testid="audit-form">
              <details className="group" data-testid="audit-template-step">
              <summary className="cursor-pointer list-none font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-4 hover:text-white">[ Optional · Have your printer's blank template? Click here ]</summary>
              <p className="text-xs text-neutral-500 mb-3">Did your printer give you a blank template PDF (the guide that shows the size, bleed and spine)? Upload it first and we'll read the exact sizes from it, so you don't have to pick them below.</p>
              <label className={`block border-2 border-dashed p-5 text-center cursor-pointer hover:bg-white/5 transition-colors ${uploadingTemplate ? "border-white" : "border-neutral-800"}`} data-testid="audit-template-drop">
                <input type="file" accept=".pdf" onChange={onTemplateFile} disabled={uploadingTemplate} className="hidden" data-testid="audit-template-input" />
                <FileCheck2 className="w-6 h-6 mx-auto text-neutral-500" />
                <div className="font-display font-bold text-sm mt-2 text-white">{uploadingTemplate ? "Reading template…" : "Choose publisher template PDF"}</div>
              </label>
              {detectedSpec && !detectedSpec.error && (
                <div className="mt-3 grid grid-cols-2 gap-2" data-testid="audit-detected-spec">
                  {[
                    ["Trim width", detectedSpec.trim_width],
                    ["Trim height", detectedSpec.trim_height],
                    ["Spine width", detectedSpec.spine_width],
                    ["Bleed", detectedSpec.bleed],
                  ].map(([label, dim]) => dim?.value != null && (
                    <div key={label} className="bg-white/5 border border-neutral-800 p-2">
                      <div className="font-mono-spec text-[8px] tracking-widest uppercase text-neutral-500">{label}</div>
                      <div className="font-display font-bold text-white">{dim.value}in</div>
                      <div className="font-mono-spec text-[8px] tracking-widest uppercase text-emerald-500">{PROVENANCE_LABEL[dim.provenance] || dim.provenance}</div>
                    </div>
                  ))}
                </div>
              )}
              </details>

              <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mt-6 mb-4">[ Step 1 · Pick your printer and book size ]</div>
              {auditId && <p className="text-xs text-neutral-500 mb-3">Locked once you start uploading. Start over to change the printer or book size.</p>}
              <div className="space-y-4">
                <div>
                  <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Distributor</Label>
                  <Select value={platform} onValueChange={setPlatform} disabled={!!auditId}>
                    <SelectTrigger className="mt-1 bg-transparent border-neutral-700 text-white" data-testid="audit-platform"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {specs && Object.entries(specs.platforms).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Trim size {detectedSpec?.trim_width?.value && <span className="text-emerald-500 normal-case">(overridden by your template above)</span>}</Label>
                  <Select value={trim} onValueChange={setTrim} disabled={!!auditId}>
                    <SelectTrigger className="mt-1 bg-transparent border-neutral-700 text-white" data-testid="audit-trim"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {specs && Object.entries(specs.trim_sizes).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">What are you uploading?</Label>
                  <Select value={fileType} onValueChange={setFileType} disabled={!!auditId}>
                    <SelectTrigger className="mt-1 bg-transparent border-neutral-700 text-white" data-testid="audit-file-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interior">Inside pages (interior)</SelectItem>
                      <SelectItem value="cover">Cover (front + spine + back)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                    For a cover, pick "Cover" so we check it against the full size: front, spine and back together.
                  </p>
                </div>
                {fileType === "cover" && (
                  <div className="grid grid-cols-2 gap-3" data-testid="audit-cover-fields">
                    <div>
                      <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Binding</Label>
                      <Select value={binding} onValueChange={setBinding} disabled={!!auditId}>
                        <SelectTrigger className="mt-1 bg-transparent border-neutral-700 text-white" data-testid="audit-binding"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {specs && Object.entries(specs.binding_types).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Paper type</Label>
                      <Select value={paperType} onValueChange={setPaperType} disabled={!!auditId}>
                        <SelectTrigger className="mt-1 bg-transparent border-neutral-700 text-white" data-testid="audit-paper-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {specs && Object.entries(specs.paper_types).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Interior page count</Label>
                      <input
                        type="number" min={1} value={pageCount} disabled={!!auditId}
                        onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                        className="mt-1 w-full bg-transparent border border-neutral-700 text-white px-3 py-2 text-sm"
                        data-testid="audit-page-count"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                        Used to work out your spine width for the size check.
                      </p>
                    </div>
                    {isHardcover && (
                      <div className="col-span-2">
                        <Label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Spine width (inches)</Label>
                        <input
                          type="number" step="0.001" min={0} value={spineWidth} disabled={!!auditId} placeholder="e.g. 0.313"
                          onChange={(e) => setSpineWidth(e.target.value)}
                          className="mt-1 w-full bg-transparent border border-neutral-700 text-white px-3 py-2 text-sm"
                          data-testid="audit-spine-width"
                        />
                        <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                          For a hardcover, copy the spine width printed on your distributor's cover template — it's set for your exact page count and paper.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mt-6 mb-3">[ Step 2 · Upload your {fileType === "cover" ? "cover" : "inside pages"} ]</div>
              <label ref={uploadBoxRef} className={`block border-2 border-dashed p-8 text-center cursor-pointer hover:bg-white/5 transition-colors ${uploading ? "border-white" : "border-neutral-700"}`} data-testid="audit-drop" data-next-step="Click to upload" data-next-step-label="Choose the file to check">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,.webp" onChange={onFile} disabled={uploading} className="hidden" data-testid="audit-file-input" />
                <Upload className="w-8 h-8 mx-auto text-neutral-500" />
                <div className="font-display font-bold text-lg mt-3 text-white">{uploading ? "Analyzing…" : "Choose file"}</div>
                <div className="font-mono-spec text-[10px] tracking-widest text-neutral-500 mt-1 uppercase">PDF · JPG · PNG · TIFF · WebP (up to 50 MB)</div>
              </label>
              <p className="mt-6 font-mono-spec text-[10px] tracking-widest text-neutral-500 uppercase leading-relaxed">
                {freeAudit ? (
                  <>{(pricing?.free_audit?.per_account || 1) > 1 ? `Your first ${pricing.free_audit.per_account} audits are free` : "Your first audit is free"}. No sign-up, no card. Just your email.</>
                ) : (
                  <>
                    The scan is free. See exactly what it found for <span className="text-white">{auditPrice}</span>. No subscription, no account.
                    {isBookModel(pricing) && <> The full amount is credited toward your book if you fix it with SparkPrep.</>}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-t border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-4">
          {[
            { icon: FileSearch, title: "Every problem, found", body: "We check picture sharpness, print colors, see-through effects, bleed, the print file format and spine width, and flag exactly which ones will get your book rejected." },
            { icon: ShieldAlert, title: "The exact printer rule it breaks", body: "Each problem shows the IngramSpark, KDP or Barnes & Noble rule behind it, so you know it's real, not a guess." },
            { icon: Zap, title: "SparkPrep can fix it for you", body: "The audit shows what's wrong and where. When you're ready, SparkPrep fixes it and gives you print-ready files. Your audit fee counts toward your book. No need to go anywhere else." },
          ].map((f, i) => (
            <div key={i} className="marketing-surface p-6" data-testid={`audit-feature-${i}`}>
              <f.icon className="w-5 h-5 text-white" />
              <h3 className="font-display font-bold text-xl mt-4 tracking-tight text-white">{f.title}</h3>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
