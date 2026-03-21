import { createServerClient } from "@/lib/supabase";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const sb = createServerClient();
  const { data: discounts } = await sb
    .from("club_discounts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const pending = discounts?.filter((d) => !d.operator_verified && d.is_active) || [];
  const verified = discounts?.filter((d) => d.operator_verified) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--primary)" }}>Club de Amigas</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-sec)" }}>
        Promos subidas por usuarias via WhatsApp · {pending.length} pendientes de verificación
      </p>

      {pending.length === 0 && verified.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
          <div className="text-4xl mb-3">💚</div>
          <div className="text-sm font-semibold mb-1">Sin promos del club todavía</div>
          <div className="text-xs" style={{ color: "var(--text-sec)" }}>
            Cuando las usuarias suban promos por WhatsApp, aparecen acá para verificar.
          </div>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--conf-yellow)" }}>
                Pendientes de verificación ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((d) => (
                  <div key={d.id} className="rounded-xl border-l-4 p-4" style={{ background: "var(--surface)", borderColor: "var(--conf-yellow)" }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">{d.merchant_name}</div>
                        <div className="text-xs mt-1" style={{ color: "var(--text-sec)" }}>{d.description}</div>
                        <div className="text-xs mt-1" style={{ color: "var(--text-sec)" }}>
                          {d.city}, {d.province} · {d.payment_method || "Cualquier medio"}
                        </div>
                      </div>
                      <ConfidenceBadge status="community" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs">👍 {d.confirmations}</span>
                      <span className="text-xs">👎 {d.denials}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
