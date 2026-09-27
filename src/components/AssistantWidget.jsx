import { useEffect, useRef, useState } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useAuth } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const ASSISTANT_HOST = process.env.REACT_APP_ASSISTANT_URL;

function getSessionId(userId) {
  if (userId) return `user-${userId}`;
  const key = "sp_assistant_session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function messageText(message) {
  return (message.parts || [])
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// The assistant's mascot -- the owner's own character art (a friendly robot in a
// SparkPrep cap and headphones), replacing an earlier abstract bolt-with-a-face icon
// that turned out to render with the face drawn in the exact same color as the bolt
// itself -- invisible at any size, confirmed live ("all I see is a black lightning
// bolt inside a gold circle, no face"). `mood` still drives motion for the same
// reason as before: without SOME movement, a slow model response reads as the
// widget having frozen rather than as it working on an answer.
function Bolt({ mood = "idle", size = 28 }) {
  return (
    <img
      src="/brand/sparkprep-mascot.png"
      alt="SparkPrep Assistant"
      width={size}
      height={size}
      className={`sp-bolt sp-bolt-${mood}`}
      style={{ objectFit: "contain" }}
    />
  );
}

// Three bouncing dots -- shown in place of a reply bubble while the assistant is composing
// one, so "no message yet" always reads as "still thinking", never as "stuck".
function TypingDots() {
  return (
    <span className="sp-typing" aria-label="SparkPrep Assistant is thinking">
      <span /><span /><span />
    </span>
  );
}

function AssistantPanel({ onClose }) {
  const { user } = useAuth();
  const sessionId = getSessionId(user?.id);
  const agent = useAgent({ agent: "SparkPrepChat", name: sessionId, host: ASSISTANT_HOST });
  const { messages, sendMessage, status } = useAgentChat({ agent });
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const bottomRef = useRef(null);
  const busy = status === "streaming" || status === "submitted";
  const waitingForFirstToken = busy && !messageText(messages[messages.length - 1] || {});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // A visible clock while waiting is the other half of "don't look frozen" -- past a few
  // seconds, a bare spinner starts to feel indistinguishable from a hang; a moving number
  // proves the page is alive and actually still working, not stalled.
  useEffect(() => {
    if (!waitingForFirstToken) { setElapsed(0); return undefined; }
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [waitingForFirstToken]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[92vw] h-[500px] max-h-[70vh] bg-black border border-gold rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <style>{BOLT_CSS}</style>
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <span className="flex items-center gap-2 font-mono-spec text-xs tracking-widest uppercase text-gold">
          <Bolt mood={busy ? "thinking" : "idle"} size={20} />
          SparkPrep Assistant
        </span>
        <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg leading-none" aria-label="Close">
          &times;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
        {messages.length === 0 && (
          <div className="text-neutral-500 text-xs leading-relaxed">
            Ask me anything about uploading, compliance checks, Auto-Fix, or your export — I know how SparkPrep works.
          </div>
        )}
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const text = messageText(m);
          return (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={`inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap text-left ${
                  m.role === "user" ? "bg-gold text-black" : "bg-neutral-900 text-neutral-100"
                }`}
              >
                {text || (m.role === "assistant" && isLast && busy ? <TypingDots /> : "")}
              </div>
            </div>
          );
        })}
        {/* covers the gap before the assistant's own (empty) message even exists yet */}
        {waitingForFirstToken && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="text-left">
            <div className="inline-block px-3 py-2 rounded-lg bg-neutral-900 text-neutral-100 flex items-center gap-2">
              <TypingDots />
              {elapsed >= 4 && <span className="text-neutral-500 text-[11px] font-mono-spec">still thinking… {elapsed}s</span>}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-neutral-800 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          disabled={busy}
          className="flex-1 bg-neutral-900 text-white text-sm rounded-md px-3 py-2 outline-none border border-neutral-800 focus:border-gold"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-gold px-3 py-2 text-xs font-mono-spec uppercase tracking-widest rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// First-visit-only speech bubble -- the mascot itself (a bolt with a face) already exists
// and is genuinely well-built (sway, blink, a distinct "thinking" state), but a small icon
// alone doesn't read as "click me to chat" on a page nobody's used before. This says so,
// once, in the mascot's own voice, then never shows again for that visitor.
const HINT_SEEN_KEY = "sp_assistant_hint_seen";

function LaunchHint({ onDismiss }) {
  return (
    <div
      className="fixed bottom-24 right-6 z-50 max-w-[220px] bg-black border border-gold rounded-xl shadow-2xl px-3.5 py-2.5 text-sm text-neutral-100 sp-hint-pop"
      role="status"
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white text-xs leading-none flex items-center justify-center"
      >
        &times;
      </button>
      👋 Stuck on anything? I'm the SparkPrep Assistant — just tap my picture.
      <div className="sp-hint-arrow" aria-hidden="true" />
    </div>
  );
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(HINT_SEEN_KEY)) return;
    const t = setTimeout(() => setShowHint(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try { localStorage.setItem(HINT_SEEN_KEY, "1"); } catch { /* private mode -- just won't persist, harmless */ }
  };

  if (!ASSISTANT_HOST) return null;

  return (
    <>
      <style>{BOLT_CSS}</style>
      {showHint && !open && <LaunchHint onDismiss={dismissHint} />}
      {open && (
        <ErrorBoundary
          fallback={
            <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[92vw] bg-black border border-gold rounded-xl shadow-2xl p-4 text-sm text-neutral-300">
              The assistant is temporarily unavailable. Try again in a bit, or email{" "}
              <a href="mailto:legenddaryslifecheatcodes@gmail.com" className="text-gold underline">
                support
              </a>
              .
            </div>
          }
        >
          <AssistantPanel onClose={() => setOpen(false)} />
        </ErrorBoundary>
      )}
      <button
        onClick={() => { setOpen((o) => !o); if (showHint) dismissHint(); }}
        className={`fixed bottom-6 right-6 z-50 btn-gold w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-xl ${showHint && !open ? "sp-launcher-nudge" : ""}`}
        aria-label="Open SparkPrep Assistant"
        data-testid="assistant-launcher"
      >
        {open ? "×" : <Bolt mood="idle" size={30} />}
      </button>
    </>
  );
}

const BOLT_CSS = `
/* idle: a friendly little sway, so the mascot reads as "alive" even doing nothing */
@keyframes sp-bolt-sway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
.sp-bolt-idle { animation: sp-bolt-sway 2.6s ease-in-out infinite; }

/* thinking: a visible pulse -- deliberately busier than idle so a slow answer never
   looks like a frozen page. */
@keyframes sp-bolt-pulse { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 0 rgba(212,175,55,0)) scale(1); } 50% { opacity: 0.85; filter: drop-shadow(0 0 5px rgba(212,175,55,0.8)); transform: scale(1.06); } }
.sp-bolt-thinking { animation: sp-bolt-pulse 0.9s ease-in-out infinite; }

.sp-typing { display: inline-flex; gap: 3px; align-items: center; height: 1em; }
.sp-typing span { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.6; animation: sp-typing-bounce 1.1s ease-in-out infinite; }
.sp-typing span:nth-child(2) { animation-delay: 0.15s; }
.sp-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes sp-typing-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-3px); opacity: 1; } }

/* First-visit launch hint: a small pop-in bubble plus a bigger, unmissable
   ring pulse on the button itself (distinct from the idle sway, which is
   deliberately subtle) -- the sway alone wasn't enough for a visitor who's
   never seen this control before to register it as clickable. */
@keyframes sp-hint-pop { 0% { opacity: 0; transform: translateY(6px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
.sp-hint-pop { animation: sp-hint-pop 0.35s ease-out both; }
.sp-hint-arrow { position: absolute; bottom: -6px; right: 22px; width: 12px; height: 12px; background: #0A0A0A; border-right: 1px solid #D4AF37; border-bottom: 1px solid #D4AF37; transform: rotate(45deg); }

@keyframes sp-launcher-nudge-ring { 0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.55); } 100% { box-shadow: 0 0 0 14px rgba(212,175,55,0); } }
.sp-launcher-nudge { animation: sp-launcher-nudge-ring 1.6s ease-out 3; }

@media (prefers-reduced-motion: reduce) {
  .sp-bolt-idle, .sp-bolt-thinking, .sp-bolt-idle .sp-bolt-eye, .sp-bolt-thinking .sp-bolt-eye, .sp-typing span,
  .sp-hint-pop, .sp-launcher-nudge { animation: none !important; }
}
`;
