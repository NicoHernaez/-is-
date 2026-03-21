import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ScrapingPage() {
  const sb = createServerClient();

  const [{ data: sources }, { data: runs }] = await Promise.all([
    sb.from("sources").select("*").order("created_at"),
    sb.from("scraping_runs").select("*, sources(name)").order("executed_at", { ascending: false }).limit(20),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--primary)" }}>Scraping</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-sec)" }}>
        Monitor de fuentes de datos · {sources?.length || 0} fuentes configuradas
      </p>

      {/* Fuentes */}
      <div className="rounded-2xl border overflow-hidden mb-8" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ background: "var(--bg)", color: "var(--text-sec)" }}>
          Fuentes de datos
        </div>
        {(!sources || sources.length === 0) ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-sec)" }}>
            No hay fuentes configuradas. Se agregan desde n8n cuando se configura un scraper.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--bg-dark)" }}>
            {sources.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`w-2 h-2 rounded-full ${s.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-sec)" }}>
                    {s.source_type} · {s.provider}
                    {s.last_success_at && ` · Último éxito: ${new Date(s.last_success_at).toLocaleString("es-AR")}`}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: s.reliability >= 0.8 ? "rgba(22,163,74,0.1)" : s.reliability >= 0.5 ? "rgba(217,119,6,0.1)" : "rgba(239,68,68,0.1)",
                    color: s.reliability >= 0.8 ? "var(--conf-green)" : s.reliability >= 0.5 ? "var(--conf-yellow)" : "#EF4444",
                  }}>
                  {Math.round(s.reliability * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Últimas ejecuciones */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <div className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ background: "var(--bg)", color: "var(--text-sec)" }}>
          Últimas ejecuciones
        </div>
        {(!runs || runs.length === 0) ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-sec)" }}>
            Sin ejecuciones todavía.
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--bg-dark)" }}>
                  <td className="px-4 py-2 text-xs">{(r.sources as { name: string })?.name}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-semibold ${r.status === "success" ? "text-green-600" : r.status === "failed" ? "text-red-500" : "text-yellow-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs" style={{ color: "var(--text-sec)" }}>
                    +{r.promos_new} nuevas · {r.promos_updated} actualizadas · {r.promos_expired} expiradas
                  </td>
                  <td className="px-4 py-2 text-xs" style={{ color: "var(--text-sec)" }}>
                    {new Date(r.executed_at).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
