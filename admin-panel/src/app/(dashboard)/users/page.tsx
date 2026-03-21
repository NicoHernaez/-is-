import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const sb = createServerClient();
  const { data: users, count } = await sb
    .from("users")
    .select("*, user_locations(*)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--primary)" }}>Usuarias</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-sec)" }}>
        {count || 0} registradas
      </p>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Nombre</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>WhatsApp</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Ciudad</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Plan</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Frecuencia</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Registrada</th>
            </tr>
          </thead>
          <tbody>
            {(!users || users.length === 0) ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--text-sec)" }}>
                  No hay usuarias registradas todavía.
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: "var(--bg-dark)" }}>
                <td className="px-4 py-3 font-medium">{u.display_name || "—"}</td>
                <td className="px-4 py-3 text-xs font-mono">{u.wa_phone || u.phone || "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {u.user_locations?.[0] ? `${u.user_locations[0].city}, ${u.user_locations[0].province}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: u.subscription_tier === "free" ? "var(--bg-dark)" : "rgba(22,163,74,0.1)",
                      color: u.subscription_tier === "free" ? "var(--text-sec)" : "var(--conf-green)",
                    }}>
                    {u.subscription_tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-sec)" }}>{u.wa_frequency || "—"}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-sec)" }}>
                  {new Date(u.created_at).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
