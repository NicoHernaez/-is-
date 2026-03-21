import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BanksPage() {
  const sb = createServerClient();

  const [{ data: banks }, { data: wallets }] = await Promise.all([
    sb.from("banks").select("*").order("sort_order"),
    sb.from("wallets").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--primary)" }}>Bancos y Billeteras</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-sec)" }}>
        Catálogo maestro de medios de pago
      </p>

      {/* Bancos */}
      <div className="rounded-2xl border overflow-hidden mb-8" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ background: "var(--bg)", color: "var(--text-sec)" }}>
          Bancos ({banks?.length || 0})
        </div>
        <div className="grid grid-cols-2 gap-0">
          {banks?.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-3 border-b border-r" style={{ borderColor: "var(--bg-dark)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{ background: b.bank_type === "provincial" ? "var(--primary)" : b.bank_type === "digital" ? "var(--blush)" : "var(--sage)" }}>
                {b.short_name.slice(0, 3)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{b.display_name}</div>
                <div className="text-xs" style={{ color: "var(--text-sec)" }}>
                  {b.bank_type === "provincial" ? `Provincial — ${b.provinces?.[0] || ""}` :
                   b.bank_type === "digital" ? "Digital" : "Nacional"}
                  {b.card_networks && ` · ${b.card_networks.join(", ")}`}
                  {b.has_modo && " · Modo"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billeteras */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ background: "var(--bg)", color: "var(--text-sec)" }}>
          Billeteras ({wallets?.length || 0})
        </div>
        <div className="grid grid-cols-2 gap-0">
          {wallets?.map((w) => (
            <div key={w.id} className="flex items-center gap-3 px-4 py-3 border-b border-r" style={{ borderColor: "var(--bg-dark)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "var(--bg)" }}>
                💳
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{w.display_name}</div>
                <div className="text-xs" style={{ color: "var(--text-sec)" }}>
                  {w.has_card ? `Tarjeta ${w.card_network} ${w.card_type}` : "Sin tarjeta propia"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
