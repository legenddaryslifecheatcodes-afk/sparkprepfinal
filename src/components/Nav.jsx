import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Logo, SparkPrepLogo } from "@/components/Logo";
import { usePricing, money } from "@/lib/pricing";

// heroLogo: the page shows the big SparkPrep logo itself (homepage hero, 2026-11-21), so the centered
// nav logo is skipped there to avoid showing it twice.
export default function Nav({ dark = true, heroLogo = false }) {
  const { user, logout } = useAuth();
  const pricing = usePricing();
  const location = useLocation();
  // The big SparkPrep logo (140px) hangs below the sticky bar. While
  // scrolling it used to cover page content such as the audit report
  // (tester feedback, 2026-11-16). Now it shows big only at the very top of
  // the page; once scrolled it fades out and a small copy appears beside the
  // Legenddary mark inside the bar. On phones the bar is not sticky at all
  // (its links wrap to 2-3 rows, which covered a fifth of the screen).
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Clicking "$X Audit" while already ON the audit page is a same-route Link,
  // which React Router treats as a no-op -- it looks like a broken button to
  // someone expecting it to start payment. The audit's first step is an
  // upload (the report is about that file), so point there instead.
  const onAuditClick = (e) => {
    if (location.pathname === "/audit") {
      e.preventDefault();
      document.querySelector('[data-testid="audit-drop"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Start by uploading your cover or inside pages below. SparkPrep tells you honestly whether it found problems. You only pay to see exactly what and where.");
    }
  };
  const base = dark
    ? "border-b border-neutral-900 bg-[#0D0D0D]/90 backdrop-blur-xl"
    : "border-b border-neutral-200 bg-[#F7F7F5]/90 backdrop-blur-xl";
  const linkCls = dark ? "text-neutral-400 hover:text-white transition-colors" : "text-neutral-600 hover:text-neutral-900 transition-colors";
  return (
    <nav className={`relative md:sticky top-0 z-50 ${base}`} data-testid="top-nav">
      <div className="max-w-7xl mx-auto relative flex flex-wrap items-center justify-between gap-y-1 px-6 py-4 overflow-visible">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
          <Logo dark={dark} compact />
          {/* Once scrolled, the SparkPrep logo moves here, small, beside the
              Legenddary mark, so it stays visible without covering anything. */}
          <span className={`hidden md:block transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`} aria-hidden="true">
            <SparkPrepLogo height={40} />
          </span>
        </Link>
        {/* "What is A.P.P.S.?" sits on the left, beside the brand (2026-11-21): on the right it slid under the
            big centered SparkPrep logo at desktop widths. */}
        <a href="/automated-publishing-production-system/" className={`${linkCls} order-last md:order-none w-full md:w-auto text-center md:text-left md:mr-auto md:ml-6 text-sm`} data-testid="nav-apps">What is A.P.P.S.?</a>
        {/* SparkPrep's own main logo -- the brand being promoted, so it gets
            the dead-center spot at a larger size than the Legenddary mark.
            Matches the size of the SparkPrep logo in the landing page's
            bottom CTA (height 140). It's taller than the nav bar itself and
            deliberately overflows below it (transparent PNG, so this reads
            as the logo "breaking out" of a slim bar rather than forcing the
            whole sticky nav to be that tall all the time). Anchored to the
            bar's top edge rather than vertically centered, since the nav
            sticks to the very top of the viewport when scrolling --
            centering it would let the top half get clipped by the browser
            edge with nowhere to overflow into. Desktop only: at narrower
            widths this absolute-centered placement collides with the nav
            links (Specs/Pricing/Audit/Login), which don't collapse behind a
            hamburger menu -- see the mobile version below instead.
            -z-10 + pointer-events-none: this used to sit ABOVE the nav
            links (z-10), so its wide top portion visually covered and
            intercepted clicks on "$1.99 Audit" at normal desktop widths --
            a real click-target bug, not just a look. Sitting behind the
            links (which stay in normal flow, so they keep their own
            default stacking) means only the portion below the bar, where
            nothing else is, actually reads as "breaking out." */}
        {!heroLogo && <Link
          to="/"
          className={`hidden md:block absolute left-1/2 top-2 -translate-x-1/2 -z-10 pointer-events-none transition-opacity duration-300 ${scrolled ? "opacity-0" : "opacity-100"}`}
          data-testid="nav-sparkprep-logo"
          data-shrunk={scrolled ? "true" : "false"}
        >
          <SparkPrepLogo height={140} />
        </Link>}
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm">
          {user?.beta_active && (
            <Link to="/beta/feedback" className="font-mono-spec text-[10px] tracking-widest uppercase text-black bg-[#D4AF37] px-2.5 py-1.5 hover:brightness-110 btn-industrial" data-testid="nav-beta-badge">
              BETA · Sign Off
            </Link>
          )}
          {user?.is_admin && (
            <Link to="/admin/beta" className={`${linkCls} font-mono-spec text-[10px] tracking-widest uppercase border ${dark ? "border-neutral-700" : "border-neutral-300"} px-2 py-1`} data-testid="nav-admin">
              Admin
            </Link>
          )}
          <Link to="/audit" onClick={onAuditClick} className="font-mono-spec text-[10px] tracking-widest uppercase text-white bg-[#FF6A00] px-2.5 py-1.5 hover:brightness-110 btn-industrial" data-testid="nav-audit">
            {pricing?.free_audit?.active ? "Free Audit" : pricing ? `${money(pricing.audit.price_cents)} Audit` : "Audit"}
          </Link>
          <Link to="/cover-studio" className={linkCls} data-testid="nav-cover-studio">Cover Studio</Link>
          <Link to="/interior-studio" className={linkCls} data-testid="nav-interior-studio">Interior Studio</Link>
          {/* Free Tools replaces Specs + Pricing in the menu (Trey, 2026-11-22): the tools hub groups every free tool
              (calculators, DPI checker, spec library, templates, guides), so one bright link gets them seen.
              The Specs and Pricing pages stay where they are; they're linked from the tools hub, the hero and footers. */}
          <a href="/tools/" className="font-display font-black text-sm md:text-base tracking-wide text-black px-3.5 py-1.5 rounded-md shadow-[0_0_16px_rgba(229,193,88,0.55)] hover:brightness-110 btn-industrial" style={{ background: "linear-gradient(180deg, #F3DC8A, #D4AF37 60%, #B8933E)" }} data-testid="nav-free-tools">Free Tools</a>
          {user ? (
            <>
              <Link to="/dashboard" className={linkCls} data-testid="nav-dashboard">Dashboard</Link>
              <Link to="/studio" className="text-[#D4AF37] hover:text-[#F3DC8C] transition-colors" data-testid="nav-studio">Author Studio</Link>
              <Link to="/account" className={linkCls} data-testid="nav-account">Account</Link>
              <button onClick={logout} className={`${linkCls} font-mono-spec text-xs tracking-widest uppercase`} data-testid="nav-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkCls} data-testid="nav-login">Log In</Link>
              <Link to="/register" className="px-4 py-2 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial" data-testid="nav-signup">
                Start Free
              </Link>
            </>
          )}
        </div>
        {/* Mobile version of the SparkPrep logo above: the desktop one is
            absolutely centered and overlaps the nav links at narrower
            widths (this nav has no hamburger/collapsed-menu state), so
            below md this renders as an ordinary flex child instead --
            `w-full` forces the flex-wrap container to break here, giving it
            its own centered row under the links rather than sitting on top
            of them. Without this, SparkPrep's own logo was either invisible
            under 768px (the original bug) or overlapping nav text (the
            first attempt at fixing it). */}
        {!heroLogo && <Link to="/" className="md:hidden w-full flex justify-center pt-1" data-testid="nav-sparkprep-logo-mobile">
          <SparkPrepLogo height={64} />
        </Link>}
      </div>
    </nav>
  );
}
