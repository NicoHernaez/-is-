import { createServerClient } from "@/lib/supabase";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  const sb = createServerClient();
  const { data: promos } = await sb
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Promos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>
            Gestión de descuentos y promociones
          </p>
        </div>
        <Link href="/promos/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}>
          + Nueva promo
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Título</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Comercio</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Descuento</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Bancos</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Confianza</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Vence</th>
            </tr>
          </thead>
          <tbody>
            {(!promos || promos.length === 0) ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--text-sec)" }}>
                  No hay promos cargadas todavía. Hacé click en "+ Nueva promo" para empezar.
                </td>
              </tr>
            ) : promos.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: "var(--bg-dark)" }}>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-sec)" }}>{p.merchant_name || "—"}</td>
                <td className="px-4 py-3">{p.discount_value ? `${p.discount_value}%` : "—"}</td>
                <td className="px-4 py-3 text-xs">{p.required_banks?.join(", ") || "Todos"}</td>
                <td className="px-4 py-3"><ConfidenceBadge status={p.confidence_status} /></td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-sec)" }}>
                  {p.valid_until ? new Date(p.valid_until).toLocaleDateString("es-AR") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
