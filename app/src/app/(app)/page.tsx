import Link from "next/link";
import DiscountCard from "@/components/ui/DiscountCard";

export default function HomePage() {
  return (
    <div className="px-6 pt-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="text-[14px] font-medium" style={{ color: "var(--text)" }}>Hola <b>María</b> 🛍️</div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-sec)" }}>General Pico, La Pampa</div>
        </div>
        <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[17px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 12px rgba(74,94,60,0.15)" }}>
          M
        </div>
      </div>

      {/* Ahorro card */}
      <div className="rounded-[24px] p-7 text-center border mb-5"
        style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }}>
        <div className="text-[10px] uppercase tracking-[2.5px] font-semibold mb-2" style={{ color: "var(--text-sec)" }}>Ahorraste este mes</div>
        <div className="text-[46px] font-extrabold leading-none" style={{ color: "var(--primary)" }}>$87.400</div>
        <div className="text-[13px] italic mt-2.5" style={{ color: "var(--blush)" }}>Una escapada de finde con los chicos</div>
        <div className="flex justify-between items-center mt-4 px-4 py-2.5 rounded-[14px]" style={{ background: "rgba(74,94,60,0.05)" }}>
          <span className="text-[12px]" style={{ color: "var(--text)" }}>Racha: 12 dias</span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-[10px]" style={{ color: "var(--primary)", background: "rgba(74,94,60,0.07)" }}>Experta</span>
        </div>
      </div>

      {/* Tips del día */}
      <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "var(--text-sec)" }}>Hoy para vos</div>

      <div className="rounded-[18px] p-4 mb-2 flex items-center gap-3.5"
        style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.12)" }}>
        <span className="text-[24px]">⛽</span>
        <span className="text-[12px] font-semibold text-white leading-snug">Sabado: 25% nafta Bco. Pampa</span>
      </div>

      <div className="rounded-[18px] p-4 mb-2 flex items-center gap-3.5 border"
        style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }}>
        <span className="text-[24px]">💊</span>
        <span className="text-[12px] font-semibold leading-snug" style={{ color: "var(--text)" }}>Martes: 25% farmacia Bco. Pampa</span>
      </div>

      <div className="rounded-[18px] p-4 mb-5 flex items-center gap-3.5 border"
        style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }}>
        <span className="text-[24px]">🛒</span>
        <span className="text-[12px] font-semibold leading-snug" style={{ color: "var(--text)" }}>Viernes: 25% super Bco. Pampa</span>
      </div>

      {/* Descuentos preview */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: "var(--text-sec)" }}>Descuentos</span>
        <Link href="/descuentos" className="text-[12px] font-semibold" style={{ color: "var(--blush)" }}>Ver todos →</Link>
      </div>

      <DiscountCard title="25% en Alimentos" subtitle="Supermercados · Lu Mi Vi Sa" discount="25%" bank="Bco. Pampa" confidence="confirmed" />
      <DiscountCard title="25% en Farmacity" subtitle="MODO + Galicia · Jueves" discount="25%" bank="MODO" confidence="probable" />

      {/* Dato semanal */}
      <div className="rounded-[18px] p-4 mt-2 mb-4 border"
        style={{ background: "var(--surface)", borderColor: "rgba(196,150,122,0.12)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }}>
        <div className="text-[11px] font-bold mb-1.5" style={{ color: "var(--blush)" }}>Dato de la semana</div>
        <div className="text-[13px] leading-relaxed opacity-85" style={{ color: "var(--text)" }}>
          Con tus 2 tarjetas, esta semana podes ahorrar hasta $30.000 entre nafta, farmacia y super.
        </div>
      </div>
    </div>
  );
}
