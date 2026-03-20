import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function WalletsPage() {
  const sb = createServerClient();
  const { data: wallets } = await sb.from("wallets").select("*").order("sort_order");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Billeteras Virtuales</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>
            {wallets?.length || 0} billeteras cargadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {wallets?.map((w) => (
          <div key={w.id} className="rounded-2xl border p-5 flex items-start gap-4"
            style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "var(--bg)" }}>
              💳
            </div>
            <div className="flex-1">
              <div className="text-base font-bold" style={{ color: "var(--primary)" }}>{w.display_name}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-sec)" }}>
                Slug: <span className="font-mono">{w.slug}</span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {w.has_card ? (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>
                    Tarjeta {w.card_network} {w.card_type}
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "var(--bg)", color: "var(--text-sec)" }}>
                    Sin tarjeta propia
                  </span>
                )}
                <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: w.is_active ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.1)", color: w.is_active ? "#16A34A" : "#EF4444" }}>
                  {w.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
