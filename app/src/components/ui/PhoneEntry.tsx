"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";

export default function PhoneEntry() {
  const { setPhone } = useUser();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    // Normalizar número
    const cleaned = input.replace(/[\s\-\+\(\)]/g, "");

    // Intentar cargar el usuario directo (si ya existe en DB)
    setPhone(cleaned);

    // TODO: Si el usuario no existe, enviar mensaje WA invitándolo a onboardear
    // Por ahora solo seteamos el phone y dejamos que el contexto cargue
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-8"
      style={{ background: "var(--bg)" }}>

      {/* Logo */}
      <div className="text-[48px] font-extrabold mb-2" style={{ color: "var(--primary)" }}>-es+</div>
      <div className="text-[14px] mb-1" style={{ color: "var(--text-sec)" }}>Ahorrá con lo que ya tenés</div>
      <div className="text-[12px] mb-10 italic" style={{ color: "var(--blush)" }}>Tu asistente de descuentos por WhatsApp</div>

      {!sent ? (
        <>
          {/* Input teléfono */}
          <div className="w-full max-w-[320px] mb-4">
            <label className="text-[11px] font-bold uppercase tracking-[1.5px] mb-2 block"
              style={{ color: "var(--text-sec)" }}>
              Tu número de WhatsApp
            </label>
            <div className="flex items-center gap-2 rounded-[16px] border px-4 py-3"
              style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.12)" }}>
              <span className="text-[14px]" style={{ color: "var(--text-sec)" }}>🇦🇷 +54</span>
              <input
                type="tel"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="9 2302 41-9234"
                className="flex-1 text-[16px] border-none outline-none bg-transparent"
                style={{ color: "var(--text)" }}
                autoFocus
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || sending}
            className="w-full max-w-[320px] py-3.5 rounded-[16px] text-[15px] font-bold text-white transition-all"
            style={{
              background: input.trim() ? "linear-gradient(135deg, #4A5E3C, #5D7A48)" : "var(--cream)",
              boxShadow: input.trim() ? "0 4px 16px rgba(74,94,60,0.2)" : "none",
            }}>
            {sending ? "Conectando..." : "Entrar"}
          </button>

          <div className="text-[11px] mt-6 text-center leading-relaxed max-w-[280px]"
            style={{ color: "var(--text-sec)" }}>
            Si todavía no usás -es+, te vamos a mandar un mensaje de Yapa por WhatsApp para empezar 🛍️
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-[20px] mb-3">📱</div>
          <div className="text-[15px] font-semibold mb-2" style={{ color: "var(--text)" }}>
            Conectando...
          </div>
          <div className="text-[13px]" style={{ color: "var(--text-sec)" }}>
            Cargando tus descuentos
          </div>
        </div>
      )}
    </div>
  );
}
