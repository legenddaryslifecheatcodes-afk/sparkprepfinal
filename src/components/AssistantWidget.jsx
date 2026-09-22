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

// The assistant's mascot: a lightning bolt with a face. `mood` drives its animation --
// "thinking" is the whole point of this component existing: without SOME motion, a slow
// model response reads as the widget having frozen rather than as it working on an answer.
function Bolt({ mood = "idle", size = 28 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`sp-bolt sp-bolt-${mood}`} aria-hidden="true">
      <path
        d="M27 2 L10 26 H21 L18 46 L39 20 H27 Z"
        fill="currentColor"
        className="sp-bolt-body"
      />
      <g className="sp-bolt-face">
        <circle className="sp-bolt-eye sp-bolt-eye-l" cx="21" cy="19" r="2.1" />
        <circle className="sp-bolt-eye sp-bolt-eye-r" cx="28.5" cy="16.5" r="2.1" />
        <path className="sp-bolt-mouth" d="M21.5 24 Q24.5 27 27.5 23.5" fill="none" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
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

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);

  if (!ASSISTANT_HOST) return null;

  return (
    <>
      <style>{BOLT_CSS}</style>
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
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 btn-gold w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-xl"
        aria-label="Open SparkPrep Assistant"
        data-testid="assistant-launcher"
      >
        {open ? "×" : <Bolt mood="idle" size={30} />}
      </button>
    </>
  );
}

const BOLT_CSS = `
.sp-bolt-body { color: #0A0A0A; }
.sp-bolt-face circle, .sp-bolt-face path { stroke: #0A0A0A; }
.sp-bolt-eye { fill: #0A0A0A; transform-origin: center; transform-box: fill-box; }
.sp-bolt-mouth { stroke: #0A0A0A; }

/* idle: a friendly little sway plus an occasional blink, so the mascot reads as "alive" even doing nothing */
@keyframes sp-bolt-sway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes sp-bolt-blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
.sp-bolt-idle { animation: sp-bolt-sway 2.6s ease-in-out infinite; }
.sp-bolt-idle .sp-bolt-eye { animation: sp-bolt-blink 4.2s ease-in-out infinite; }

/* thinking: eyes actively scan side to side and the whole mark pulses -- deliberately busier
   than idle so a slow answer never looks like a frozen page. */
@keyframes sp-bolt-scan { 0%, 100% { transform: translateX(-1.4px); } 50% { transform: translateX(1.4px); } }
@keyframes sp-bolt-pulse { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 0 rgba(212,175,55,0)); } 50% { opacity: 0.75; filter: drop-shadow(0 0 4px rgba(212,175,55,0.8)); } }
.sp-bolt-thinking { animation: sp-bolt-pulse 1s ease-in-out infinite; }
.sp-bolt-thinking .sp-bolt-eye { animation: sp-bolt-scan 0.9s ease-in-out infinite; }

.sp-typing { display: inline-flex; gap: 3px; align-items: center; height: 1em; }
.sp-typing span { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.6; animation: sp-typing-bounce 1.1s ease-in-out infinite; }
.sp-typing span:nth-child(2) { animation-delay: 0.15s; }
.sp-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes sp-typing-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-3px); opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .sp-bolt-idle, .sp-bolt-thinking, .sp-bolt-idle .sp-bolt-eye, .sp-bolt-thinking .sp-bolt-eye, .sp-typing span { animation: none !important; }
}
`;
