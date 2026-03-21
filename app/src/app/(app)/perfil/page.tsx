export default function PerfilPage() {
  return (
    <div className="px-6 pt-2">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.15)" }}>M</div>
        <div>
          <div className="text-[20px] font-bold" style={{ color: "var(--text)", fontFamily: "Georgia, serif" }}>María</div>
          <div className="text-[12px]" style={{ color: "var(--text-sec)" }}>General Pico, La Pampa</div>
          <div className="text-[11px] mt-0.5 font-semibold" style={{ color: "var(--conf-green)" }}>Plan Gratis · 6 meses</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Ahorro total", value: "$87.400", color: "var(--primary)" },
          { label: "Descuentos usados", value: "23", color: "var(--blush)" },
          { label: "Racha", value: "12 días", color: "var(--sage)" },
        ].map(s => (
          <div key={s.label} className="rounded-[16px] p-3.5 text-center border"
            style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
            <div className="text-[20px] font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] uppercase tracking-wider font-semibold mt-1" style={{ color: "var(--text-sec)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Medios de pago */}
      <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "var(--text-sec)" }}>Mis medios de pago</div>

      {[
        { name: "Banco de La Pampa", detail: "Débito", icon: "🏦" },
        { name: "Banco Galicia", detail: "Débito", icon: "🏦" },
        { name: "Mercado Pago", detail: "Billetera", icon: "📱" },
        { name: "Modo", detail: "Billetera", icon: "📱" },
      ].map(pm => (
        <div key={pm.name} className="flex items-center gap-3 p-3.5 mb-2 rounded-[16px] border"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <span className="text-[20px]">{pm.icon}</span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{pm.name}</div>
            <div className="text-[11px]" style={{ color: "var(--text-sec)" }}>{pm.detail}</div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A" }}>Activo</span>
        </div>
      ))}

      <button className="w-full mt-2 mb-6 py-3 rounded-[14px] text-[13px] font-semibold border"
        style={{ borderColor: "rgba(74,94,60,0.15)", color: "var(--primary)" }}>
        + Agregar medio de pago
      </button>

      {/* Opciones */}
      <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "var(--text-sec)" }}>Ajustes</div>
      {["Frecuencia de Yapa", "Notificaciones", "Mi obra social", "Mis seguros", "Compartir con amiga", "Cerrar sesión"].map(opt => (
        <div key={opt} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(74,94,60,0.06)" }}>
          <span className="text-[13px]" style={{ color: "var(--text)" }}>{opt}</span>
          <span style={{ color: "var(--cream)" }}>›</span>
        </div>
      ))}
    </div>
  );
}
