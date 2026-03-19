"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import Link from "next/link";

const CATEGORIES = ["todos", "supermercado", "farmacia", "combustible", "gastronomia", "ropa", "libreria", "entretenimiento", "servicios"];
const CONFIDENCE_FILTERS = ["todos", "confirmed", "probable", "community", "unconfirmed"];

export default function PromosPage() {
  const sb = createBrowserClient();
  const [promos, setPromos] = useState<any[]>([]);
  const [banks, setBanks] = useState<{ slug: string; short_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterBank, setFilterBank] = useState("todos");
  const [filterConf, setFilterConf] = useState("todos");
  const [filterCat, setFilterCat] = useState("todos");
  const [filterActive, setFilterActive] = useState("active"); // active | all | inactive

  useEffect(() => {
    sb.from("banks").select("slug, short_name").order("sort_order").then(({ data }) => data && setBanks(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = sb.from("promotions").select("*").order("created_at", { ascending: false }).limit(100);

    if (filterActive === "active") query = query.eq("is_active", true);
    else if (filterActive === "inactive") query = query.eq("is_active", false);

    if (filterConf !== "todos") query = query.eq("confidence_status", filterConf);
    if (filterCat !== "todos") query = query.eq("merchant_category", filterCat);

    query.then(({ data }) => {
      let filtered = data || [];
      if (filterBank !== "todos") {
        filtered = filtered.filter(p => p.required_banks?.includes(filterBank));
      }
      setPromos(filtered);
      setLoading(false);
    });
  }, [filterBank, filterConf, filterCat, filterActive]);

  const toggleActive = async (id: string, current: boolean) => {
    await sb.from("promotions").update({ is_active: !current }).eq("id", id);
    setPromos(p => p.map(x => x.id === id ? { ...x, is_active: !current } : x));
  };

  const setConfidence = async (id: string, status: string) => {
    const score = status === "confirmed" ? 0.90 : status === "probable" ? 0.70 : status === "community" ? 0.50 : 0.30;
    await sb.from("promotions").update({
      confidence_status: status,
      confidence_score: score,
      last_verified_at: status === "confirmed" ? new Date().toISOString() : undefined,
    }).eq("id", id);
    setPromos(p => p.map(x => x.id === id ? { ...x, confidence_status: status, confidence_score: score } : x));
  };

  const chipStyle = (active: boolean, color?: string) => ({
    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
    background: active ? (color || "var(--primary)") : "var(--bg)",
    color: active ? "white" : "var(--text-sec)",
    transition: "all 0.15s",
  });

  const DAYS_MAP: Record<string, string> = { MON: "Lu", TUE: "Ma", WED: "Mi", THU: "Ju", FRI: "Vi", SAT: "Sa", SUN: "Do" };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Promos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>
            {promos.length} promos {filterActive === "active" ? "activas" : filterActive === "inactive" ? "inactivas" : "totales"}
            {filterBank !== "todos" && ` · ${filterBank}`}
            {filterCat !== "todos" && ` · ${filterCat}`}
            {filterConf !== "todos" && ` · ${filterConf}`}
          </p>
        </div>
        <Link href="/promos/new"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}>
          + Nueva promo
        </Link>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border p-4 mb-4 space-y-3" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>

        {/* Fila 1: Banco */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-sec)" }}>Banco</div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setFilterBank("todos")} style={chipStyle(filterBank === "todos")}>Todos</button>
            {banks.map(b => (
              <button key={b.slug} onClick={() => setFilterBank(b.slug)} style={chipStyle(filterBank === b.slug)}>
                {b.short_name}
              </button>
            ))}
          </div>
        </div>

        {/* Fila 2: Confianza + Categoría + Estado */}
        <div className="flex gap-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-sec)" }}>Confianza</div>
            <div className="flex gap-1.5">
              <button onClick={() => setFilterConf("todos")} style={chipStyle(filterConf === "todos")}>Todos</button>
              <button onClick={() => setFilterConf("confirmed")} style={chipStyle(filterConf === "confirmed", "#16A34A")}>Confirmado</button>
              <button onClick={() => setFilterConf("probable")} style={chipStyle(filterConf === "probable", "#D97706")}>Probable</button>
              <button onClick={() => setFilterConf("community")} style={chipStyle(filterConf === "community", "#2563EB")}>Comunidad</button>
              <button onClick={() => setFilterConf("unconfirmed")} style={chipStyle(filterConf === "unconfirmed", "#9CA3AF")}>Sin confirmar</button>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-sec)" }}>Rubro</div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilterCat(c)} style={chipStyle(filterCat === c)}>
                  {c === "todos" ? "Todos" : c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-sec)" }}>Estado</div>
            <div className="flex gap-1.5">
              <button onClick={() => setFilterActive("active")} style={chipStyle(filterActive === "active")}>Activas</button>
              <button onClick={() => setFilterActive("all")} style={chipStyle(filterActive === "all")}>Todas</button>
              <button onClick={() => setFilterActive("inactive")} style={chipStyle(filterActive === "inactive")}>Inactivas</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de promos */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--text-sec)" }}>Cargando...</div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center" style={{ color: "var(--text-sec)" }}>
            <div className="text-2xl mb-2">🏷️</div>
            <div className="text-sm">No hay promos con estos filtros</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                <th className="text-left px-4 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Promo</th>
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Comercio</th>
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Dto</th>
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Bancos</th>
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Días</th>
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Confianza</th>
                <th className="text-center px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-t hover:bg-[var(--bg)]" style={{ borderColor: "var(--bg-dark)", opacity: p.is_active ? 1 : 0.5 }}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-xs">{p.title}</div>
                    {p.merchant_category && <div className="text-[10px] mt-0.5" style={{ color: "var(--text-sec)" }}>{p.merchant_category}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "var(--text-sec)" }}>{p.merchant_name || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-bold text-xs" style={{ color: "var(--primary)" }}>
                      {p.discount_value ? `${p.discount_value}%` : "—"}
                    </span>
                    {p.max_discount && <div className="text-[10px]" style={{ color: "var(--text-sec)" }}>tope ${p.max_discount.toLocaleString()}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-[10px]" style={{ color: "var(--text-sec)" }}>
                    {p.required_banks?.join(", ") || (p.any_payment_method ? "Todos" : "—")}
                    {p.required_wallets?.length > 0 && <div>{p.required_wallets.join(", ")}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-[10px]" style={{ color: "var(--text-sec)" }}>
                    {p.valid_days?.map((d: string) => DAYS_MAP[d] || d).join(", ") || "Todos"}
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={p.confidence_status}
                      onChange={(e) => setConfidence(p.id, e.target.value)}
                      className="text-[10px] font-semibold rounded-lg px-2 py-1 border-none cursor-pointer"
                      style={{
                        background: p.confidence_status === "confirmed" ? "rgba(22,163,74,0.1)" :
                          p.confidence_status === "probable" ? "rgba(217,119,6,0.1)" :
                          p.confidence_status === "community" ? "rgba(37,99,235,0.1)" : "rgba(156,163,175,0.1)",
                        color: p.confidence_status === "confirmed" ? "#16A34A" :
                          p.confidence_status === "probable" ? "#D97706" :
                          p.confidence_status === "community" ? "#2563EB" : "#9CA3AF",
                      }}>
                      <option value="confirmed">✅ Confirmado</option>
                      <option value="probable">🟡 Probable</option>
                      <option value="community">🔵 Comunidad</option>
                      <option value="unconfirmed">⚪ Sin confirmar</option>
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => toggleActive(p.id, p.is_active)}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                      style={{
                        background: p.is_active ? "rgba(239,68,68,0.1)" : "rgba(22,163,74,0.1)",
                        color: p.is_active ? "#EF4444" : "#16A34A",
                      }}>
                      {p.is_active ? "Desactivar" : "Activar"}
                    </button>
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
