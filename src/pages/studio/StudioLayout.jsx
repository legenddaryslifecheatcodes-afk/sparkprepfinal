import { NavLink, Link } from "react-router-dom";
import { Crown, LibraryBig, LayoutTemplate, BookOpenText } from "lucide-react";
import Nav from "@/components/Nav";
import "./studio.css";

const TABS = [
  ["/studio", "My Books", LibraryBig, true],
  ["/studio/templates", "Templates", LayoutTemplate],
  ["/studio/library", "Members Library", BookOpenText],
];

// The shell every Author Studio page sits in: the site nav, then the Studio's own premium header and tabs.
export default function StudioLayout({ children, member = true }) {
  return (
    <div className="studio-root">
      <Nav dark />
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <Link to="/studio" className="inline-flex items-center gap-2 st-eyebrow" data-testid="studio-home-link">
          <Crown className="w-3.5 h-3.5" /> Members only
        </Link>
        <h1 className="st-serif text-[34px] sm:text-5xl font-semibold mt-3 leading-[1.05]">
          Legenddary SparkPrep <span className="st-gold-text">Author Studio</span>
        </h1>
        <p className="st-muted mt-3 max-w-2xl text-[15px]">
          Your books, drafts, goals and launch plans in one place, from the first word to the day it's published.
        </p>
        {member && (
          <nav className="mt-7 flex gap-2 st-scroll-x" aria-label="Author Studio">
            {TABS.map(([to, label, Icon, end]) => (
              <NavLink key={to} to={to} end={end}
                       className={({ isActive }) => `st-tab inline-flex items-center gap-2 ${isActive ? "st-tab-on" : ""}`}
                       data-testid={`studio-tab-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                <Icon className="w-4 h-4" /> {label}
              </NavLink>
            ))}
          </nav>
        )}
        <div className="st-rule mt-6" />
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">{children}</main>
    </div>
  );
}
