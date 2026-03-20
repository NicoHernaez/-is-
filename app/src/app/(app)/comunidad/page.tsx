export default function ComunidadPage() {
  return (
    <div className="px-6 pt-2">
      <h1 className="text-[24px] font-bold mb-1" style={{ fontFamily: "Georgia, serif", color: "var(--text)" }}>Club de Amigas</h1>
      <div className="text-[12px] mb-6" style={{ color: "var(--text-sec)" }}>Promos compartidas por la comunidad de General Pico</div>

      <div className="rounded-[20px] p-8 text-center border mb-4"
        style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
        <div className="text-[40px] mb-3">💚</div>
        <div className="text-[14px] font-bold mb-1" style={{ color: "var(--primary)" }}>Compartí un descuento</div>
        <div className="text-[12px] mb-4" style={{ color: "var(--text-sec)" }}>
          Encontraste una promo que no está en la app? Compartila y ayudá a otras amigas a ahorrar.
        </div>
        <button className="px-6 py-2.5 rounded-full text-[13px] font-bold text-white"
          style={{ background: "var(--primary)" }}>
          + Subir promo
        </button>
      </div>

      <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "var(--text-sec)" }}>Últimas del club</div>

      <div className="rounded-[16px] p-4 border-l-4 mb-3"
        style={{ background: "var(--surface)", borderColor: "var(--conf-blue)" }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>3x2 Panadería Don Luis</div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-sec)" }}>San Martín 450 · Lu a Vi</div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB" }}>Comunidad</span>
        </div>
        <div className="flex gap-3 mt-2 text-[10px]" style={{ color: "var(--text-sec)" }}>
          <span>👍 4 confirmaron</span>
          <span>·</span>
          <span>Hace 2 días</span>
        </div>
      </div>
    </div>
  );
}
