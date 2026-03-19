import { createServerClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CAT_ICONS: Record<string, string> = {
  supermercado: "🛒", farmacia: "💊", gastronomia: "🍔", ropa: "👕",
  combustible: "⛽", gym: "💪", libreria: "📚", otro: "🏪",
};

export default async function NegociosPage() {
  const sb = createServerClient();
  const { data: businesses } = await sb
    .from("local_businesses")
    .select("*, local_business_promos(*)")
    .order("created_at", { ascending: false });

  const activePromos = businesses?.reduce((sum, b) =>
    sum + (b.local_business_promos?.filter((p: { is_active: boolean }) => p.is_active).length || 0), 0) || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Negocios Locales</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>
            Comercios de la zona que publican sus promos · {businesses?.length || 0} negocios · {activePromos} promos activas
          </p>
        </div>
        <Link href="/negocios/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}>
          + Agregar negocio
        </Link>
      </div>

      {(!businesses || businesses.length === 0) ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
          <div className="text-4xl mb-3">🏪</div>
          <div className="text-sm font-semibold mb-1">Sin negocios cargados todavía</div>
          <div className="text-xs mb-4" style={{ color: "var(--text-sec)" }}>
            Acá van los comercios locales de General Pico que tienen promos con tarjetas.
            <br />Simple Super, De León, Open Sport, farmacias, restaurants...
          </div>
          <Link href="/negocios/new"
            className="inline-block px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--primary)" }}>
            Cargar el primero
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {businesses.map((b) => (
            <div key={b.id} className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "var(--bg)" }}>
                  {CAT_ICONS[b.category] || "🏪"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>{b.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-sec)" }}>
                    {b.category} · {b.city}
                    {b.is_verified && <span className="ml-1 text-green-600">✓ verificado</span>}
                  </div>
                </div>
              </div>

              {b.address && <div className="text-xs mb-2" style={{ color: "var(--text-sec)" }}>📍 {b.address}</div>}

              <div className="flex gap-2 flex-wrap mb-3">
                {b.accepts_modo && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>Modo</span>}
                {b.accepts_mp && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>MP</span>}
                {b.accepted_cards?.map((c: string) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--bg)", color: "var(--text-sec)" }}>{c}</span>
                ))}
              </div>

              {b.local_business_promos?.length > 0 && (
                <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--bg-dark)" }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-sec)" }}>Promos activas</div>
                  {b.local_business_promos.filter((p: { is_active: boolean }) => p.is_active).map((p: { id: string; title: string; discount_value: string }) => (
                    <div key={p.id} className="text-xs py-1">{p.title} {p.discount_value && `(${p.discount_value})`}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
