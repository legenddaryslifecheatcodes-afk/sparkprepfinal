import { Link } from "react-router-dom";
import { useAiCredits, joinPrice } from "@/lib/aiCredits";

const NAMES = { cover: "cover editor", writing: "book editor" };

// One small box that tells people where they stand with AI credits, right next to the AI buttons.
// blocked: null | "login" (tried the AI signed out) | "credits" (ran out); message: the server's own words.
export default function AiCreditsNote({ pool, blocked, message, next }) {
  const data = useAiCredits();
  if (!data) return null;
  const offer = data.offer || {};
  const where = NAMES[pool];
  const nextQ = next ? `?next=${encodeURIComponent(next)}` : "";
  const monthly = offer.member_monthly || 500;

  if (!data.signed_in) {
    return (
      <div className={`text-xs p-2.5 ${blocked === "login" ? "pill-warn" : "border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-neutral-700"}`} data-testid={`ai-credits-signup-${pool}`}>
        {blocked === "login" ? "To use the AI helpers, you need a free account. " : ""}
        <strong>Sign up free</strong> and get {offer.free_welcome || 50} free AI credits for the {where}, plus {offer.free_monthly || 10} more
        every month. <Link to={`/register${nextQ}`} className="underline font-semibold">Sign up free</Link> or{" "}
        <Link to={`/login${nextQ}`} className="underline font-semibold">log in</Link>. Everything else here is free, no account needed.
      </div>
    );
  }
  if (data.unlimited) return null;

  const left = data.pools?.[pool]?.left ?? 0;
  if (blocked === "credits" || left <= 0) {
    return (
      <div className="text-xs p-2.5 pill-warn" data-testid={`ai-credits-out-${pool}`}>
        {message || (data.member
          ? `You've used this month's AI credits for the ${where}. They refill on the 1st.`
          : `You're out of free AI credits for the ${where}. Join the ${joinPrice(data)}/month membership to get ${monthly} credits every month for the book editor and ${monthly} for the cover editor.`)}
        {!data.member && (
          <> <Link to="/pricing" className="underline font-semibold">Join for {joinPrice(data)}/month</Link></>
        )}
      </div>
    );
  }
  return (
    <div className="text-[11px] text-neutral-600" data-testid={`ai-credits-left-${pool}`}>
      <strong>{left}</strong> AI credits left for the {where}{data.member ? " this month" : ""}.
      {!data.member && (
        <> Members get {monthly} a month for {joinPrice(data)}. <Link to="/pricing" className="underline">Join</Link></>
      )}
    </div>
  );
}
