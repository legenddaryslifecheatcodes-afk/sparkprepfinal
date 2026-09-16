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

function AssistantPanel({ onClose }) {
  const { user } = useAuth();
  const sessionId = getSessionId(user?.id);
  const agent = useAgent({ agent: "SparkPrepChat", name: sessionId, host: ASSISTANT_HOST });
  const { messages, sendMessage, status } = useAgentChat({ agent });
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[92vw] h-[500px] max-h-[70vh] bg-black border border-gold rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <span className="font-mono-spec text-xs tracking-widest uppercase text-gold">SparkPrep Assistant</span>
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
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap text-left ${
                m.role === "user" ? "bg-gold text-black" : "bg-neutral-900 text-neutral-100"
              }`}
            >
              {messageText(m) || (m.role === "assistant" && busy ? "…" : "")}
            </div>
          </div>
        ))}
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
      >
        {open ? "×" : "?"}
      </button>
    </>
  );
}
