import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TIER_COLORS: Record<string, { bg: string; color: string }> = {
  piloto: { bg: "#8B5CF6", color: "white" },
  tier1:  { bg: "var(--brand-green)", color: "var(--brand-gold)" },
  tier2:  { bg: "var(--brand-gold)", color: "white" },
  tier3:  { bg: "var(--sage)", color: "white" },
  ola5:   { bg: "#64748b", color: "white" },
};
const DEFAULT_TIER = { bg: "#9CA3AF", color: "white" };

export default async function CitiesPage() {
  const sb = createServerClient();
  const { data: cities } = await sb.from("cities").select("*").order("province").order("population", { ascending: false });

  // Agrupar por provincia
  const byProvince: Record<string, typeof cities> = {};
  cities?.forEach((c) => {
    if (!byProvince[c.province]) byProvince[c.province] = [];
    byProvince[c.province]!.push(c);
  });

  const totalActive = cities?.filter((c) => c.is_active).length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--primary)" }}>Ciudades</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-sec)" }}>
        {cities?.length || 0} ciudades mapeadas · {totalActive} activas · 23 provincias
      </p>

      {Object.entries(byProvince).map(([prov, provCities]) => (
        <div key={prov} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-bold" style={{ color: "var(--primary)" }}>{prov}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-dark)", color: "var(--text-sec)" }}>
              {provCities!.length} ciudades
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {provCities!.map((c) => {
              const tier = TIER_COLORS[c.tier || "tier3"] || DEFAULT_TIER;
              return (
                <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                  style={{ background: "var(--surface)", borderColor: c.is_active ? "var(--conf-green)" : "var(--bg-dark)" }}>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: tier.bg, color: tier.color }}>
                    {c.tier?.toUpperCase() || "—"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{c.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-sec)" }}>
                      {c.population?.toLocaleString("es-AR")} hab · Ola {c.expansion_wave}
                    </div>
                  </div>
                  {c.is_active && (
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
