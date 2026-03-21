import { createServerClient } from "@/lib/supabase";
import StatCard from "@/components/ui/StatCard";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";

async function getStats() {
  const sb = createServerClient();

  const [
    { count: totalUsers },
    { count: totalPromos },
    { count: activePromos },
    { count: totalCities },
    { count: activeCities },
    { count: totalBanks },
    { count: clubPending },
    { data: promosByStatus },
  ] = await Promise.all([
    sb.from("users").select("*", { count: "exact", head: true }),
    sb.from("promotions").select("*", { count: "exact", head: true }),
    sb.from("promotions").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("cities").select("*", { count: "exact", head: true }),
    sb.from("cities").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("banks").select("*", { count: "exact", head: true }),
    sb.from("club_discounts").select("*", { count: "exact", head: true }).eq("operator_verified", false).eq("is_active", true),
    sb.from("promotions").select("confidence_status").eq("is_active", true),
  ]);

  const statusCounts = { confirmed: 0, probable: 0, community: 0, unconfirmed: 0 };
  promosByStatus?.forEach((p: { confidence_status: string }) => {
    const s = p.confidence_status as keyof typeof statusCounts;
    if (s in statusCounts) statusCounts[s]++;
  });

  return {
    totalUsers: totalUsers || 0,
    totalPromos: totalPromos || 0,
    activePromos: activePromos || 0,
    totalCities: totalCities || 0,
    activeCities: activeCities || 0,
    totalBanks: totalBanks || 0,
    clubPending: clubPending || 0,
    statusCounts,
  };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>
          General Pico, La Pampa — Ciudad piloto
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Usuarias" value={stats.totalUsers} sub="registradas" accent />
        <StatCard label="Promos activas" value={stats.activePromos} sub={`de ${stats.totalPromos} totales`} />
        <StatCard label="Ciudades" value={`${stats.activeCities}/${stats.totalCities}`} sub="activas / total" />
        <StatCard label="Club pendientes" value={stats.clubPending} sub="por verificar" />
      </div>

      {/* Confianza de promos */}
      <div className="rounded-2xl p-6 border mb-8" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-sec)" }}>
          Estado de confianza — Promos activas
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {(["confirmed", "probable", "community", "unconfirmed"] as const).map((status) => (
            <div key={status} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg)" }}>
              <ConfidenceBadge status={status} />
              <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                {stats.statusCounts[status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bancos cargados */}
      <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-sec)" }}>
          Catálogos cargados
        </h2>
        <div className="flex gap-8 text-sm" style={{ color: "var(--text)" }}>
          <span><strong>{stats.totalBanks}</strong> bancos</span>
          <span><strong>7</strong> billeteras</span>
          <span><strong>{stats.totalCities}</strong> ciudades</span>
          <span><strong>3</strong> programas combustible</span>
          <span><strong>2</strong> planes</span>
        </div>
      </div>
    </div>
  );
}
