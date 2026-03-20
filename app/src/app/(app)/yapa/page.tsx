"use client";

import { useState, useRef, useEffect } from "react";
import { YAPA_FUNCTION_URL } from "@/lib/supabase";

// TODO: get from auth
const TEST_USER_ID = "bbd1033c-2776-4138-bc99-075beb18a2ae";

interface Message {
  from: "user" | "yapa";
  text: string;
}

export default function YapaPage() {
  const [messages, setMessages] = useState<Message[]>([
    { from: "yapa", text: "¡Hola! Soy Yapa 🛍️ ¿Qué necesitás comprar? Contame y te digo cómo ahorrar." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput("");
    setMessages(p => [...p, { from: "user", text: query }]);
    setLoading(true);

    try {
      const res = await fetch(YAPA_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: TEST_USER_ID, query_text: query }),
      });
      const data = await res.json();
      setMessages(p => [...p, { from: "yapa", text: data.reply || "Perdón, no pude procesar tu consulta." }]);
    } catch {
      setMessages(p => [...p, { from: "yapa", text: "Ups, hubo un error. Probá de nuevo." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <div className="px-6 py-4 rounded-b-[24px] flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[20px]"
          style={{ background: "var(--blush)", boxShadow: "0 2px 8px rgba(196,150,122,0.25)" }}>🛍️</div>
        <div>
          <div className="text-[18px] font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Yapa</div>
          <div className="text-[11px] text-white/55">Tu asistente de ahorro</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-[140px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex mb-4 ${msg.from === "user" ? "justify-end" : "gap-2.5"}`}>
            {msg.from === "yapa" && (
              <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
                style={{ background: "var(--blush)", boxShadow: "0 2px 8px rgba(196,150,122,0.15)" }}>🛍️</div>
            )}
            <div className="max-w-[80%] rounded-[18px] px-4 py-3 text-[14px] leading-relaxed"
              style={msg.from === "user"
                ? { background: "var(--primary)", color: "white", borderBottomRightRadius: 4 }
                : { background: "var(--surface)", color: "var(--text)", borderBottomLeftRadius: 4, border: "1px solid rgba(74,94,60,0.08)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }
              }>
              {msg.text.split("\n").map((line, j) => {
                const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<strong>$1</strong>");
                return <span key={j}><span dangerouslySetInnerHTML={{ __html: html }} />{j < msg.text.split("\n").length - 1 && <br />}</span>;
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 mb-4">
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
              style={{ background: "var(--blush)" }}>🛍️</div>
            <div className="rounded-[18px] px-4 py-3 flex gap-1 items-center"
              style={{ background: "var(--surface)", border: "1px solid rgba(74,94,60,0.08)" }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--text-sec)", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 px-5 py-3 border-t"
        style={{ background: "var(--bg)", borderColor: "rgba(74,94,60,0.06)", maxWidth: 430, margin: "0 auto", backdropFilter: "blur(12px)" }}>
        <div className="flex gap-2.5 items-center rounded-[26px] border pl-5 pr-1.5 py-1.5"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="¿Qué necesitás comprar?"
            className="flex-1 text-[14px] border-none outline-none bg-transparent"
            style={{ color: "var(--text)" }}
          />
          <button onClick={send} disabled={!input.trim() || loading}
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white text-[16px] transition-all"
            style={{ background: input.trim() ? "var(--blush)" : "var(--cream)", boxShadow: input.trim() ? "0 2px 10px rgba(196,150,122,0.25)" : "none" }}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
