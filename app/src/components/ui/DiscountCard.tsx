"use client";

const CONF: Record<string, { bg: string; color: string; label: string }> = {
  confirmed:   { bg: "rgba(22,163,74,0.08)",  color: "#16A34A", label: "Confirmado" },
  probable:    { bg: "rgba(217,119,6,0.08)",   color: "#D97706", label: "Probable" },
  community:   { bg: "rgba(37,99,235,0.08)",   color: "#2563EB", label: "Comunidad" },
  unconfirmed: { bg: "rgba(156,163,175,0.08)", color: "#9CA3AF", label: "Sin confirmar" },
};

interface Props {
  title: string;
  subtitle: string;
  discount: string;
  bank: string;
  confidence: string;
  days?: string;
}

export default function DiscountCard({ title, subtitle, discount, bank, confidence, days }: Props) {
  const c = CONF[confidence] || CONF.unconfirmed;
  return (
    <div className="rounded-[20px] p-4 mb-2.5 border transition-all active:scale-[0.98]"
      style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }}>
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex-1 pr-3">
          <div className="text-[13px] font-bold" style={{ color: "var(--text)" }}>{title}</div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-sec)" }}>{subtitle}</div>
        </div>
        <div className="rounded-[14px] px-3.5 py-2 text-[18px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)" }}>
          {discount}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: c.bg, color: c.color }}>
          {c.label}
        </span>
        <div className="text-right">
          {days && <div className="text-[10px]" style={{ color: "var(--text-sec)" }}>{days}</div>}
          <div className="text-[10px]" style={{ color: "var(--text-sec)" }}>{bank}</div>
        </div>
      </div>
    </div>
  );
}
