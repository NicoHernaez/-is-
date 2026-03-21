"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";

const CATEGORIES = ["supermercado", "farmacia", "combustible", "gastronomia", "ropa", "libreria", "entretenimiento", "servicios"];
const DAYS_MAP: Record<string, string> = { MON: "Lu", TUE: "Ma", WED: "Mi", THU: "Ju", FRI: "Vi", SAT: "Sa", SUN: "Do" };

export default function PromosPage() {
  const sb = createBrowserClient();
  const [promos, setPromos] = useState<any[]>([]);
  const [banks, setBanks] = useState<{ slug: string; display_name: string }[]>([]);
  const [wallets, setWallets] = useState<{ slug: string; display_name: string }[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<{ slug: string; program_name: string; category: string }[]>([]);
  const [cities, setCities] = useState<{ name: string; province: string }[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterBank, setFilterBank] = useState("todos");
  const [filterWallet, setFilterWallet] = useState("todos");
  const [filterConf, setFilterConf] = useState("todos");
  const [filterCat, setFilterCat] = useState("todos");
  const [filterActive, setFilterActive] = useState("active");
  const [filterProvince, setFilterProvince] = useState("todos");
  const [filterCity, setFilterCity] = useState("todos");

  useEffect(() => {
    sb.from("banks").select("slug, display_name").order("sort_order").then(({ data }) => data && setBanks(data));
    sb.from("wallets").select("slug, display_name").order("sort_order").then(({ data }) => data && setWallets(data));
    sb.from("loyalty_programs").select("slug, program_name, category").order("category").order("program_name").then(({ data }) => data && setLoyaltyPrograms(data));
    sb.from("cities").select("name, province").order("province").order("name").then(({ data }) => {
      if (data) {
        setCities(data);
        setProvinces([...new Set(data.map(c => c.province))].sort());
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = sb.from("promotions").select("*").order("created_at", { ascending: false }).limit(200);
    if (filterActive === "active") query = query.eq("is_active", true);
    else if (filterActive === "inactive") query = query.eq("is_active", false);
    if (filterConf !== "todos") query = query.eq("confidence_status", filterConf);
    if (filterCat !== "todos") query = query.eq("merchant_category", filterCat);

    query.then(({ data }) => {
      let filtered = data || [];
      if (filterBank !== "todos") filtered = filtered.filter(p => p.required_banks?.includes(filterBank));
      if (filterWallet !== "todos") filtered = filtered.filter(p => p.required_wallets?.includes(filterWallet));
      if (filterProvince !== "todos") filtered = filtered.filter(p => p.applies_nationwide || p.applies_provinces?.includes(filterProvince) || !p.applies_provinces);
      if (filterCity !== "todos") filtered = filtered.filter(p => p.applies_nationwide || p.applies_cities?.includes(filterCity) || !p.applies_cities);
      setPromos(filtered);
      setLoading(false);
    });
  }, [filterBank, filterWallet, filterConf, filterCat, filterActive, filterProvince, filterCity]);

  const toggleActive = async (id: string, current: boolean) => {
    await sb.from("promotions").update({ is_active: !current }).eq("id", id);
    setPromos(p => p.map(x => x.id === id ? { ...x, is_active: !current } : x));
  };

  const setConfidence = async (id: string, status: string) => {
    const score = status === "confirmed" ? 0.90 : status === "probable" ? 0.70 : status === "community" ? 0.50 : 0.30;
    await sb.from("promotions").update({
      confidence_status: status, confidence_score: score,
      last_verified_at: status === "confirmed" ? new Date().toISOString() : undefined,
    }).eq("id", id);
    setPromos(p => p.map(x => x.id === id ? { ...x, confidence_status: status } : x));
  };

  const selectStyle = "px-3 py-2 rounded-xl text-sm border bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
  const filteredCities = filterProvince !== "todos" ? cities.filter(c => c.province === filterProvince) : cities;

  const confColor = (s: string) =>
    s === "confirmed" ? { bg: "rgba(22,163,74,0.1)", color: "#16A34A" } :
    s === "probable" ? { bg: "rgba(217,119,6,0.1)", color: "#D97706" } :
    s === "community" ? { bg: "rgba(37,99,235,0.1)", color: "#2563EB" } :
    { bg: "rgba(156,163,175,0.1)", color: "#9CA3AF" };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Promos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>{promos.length} resultados</p>
        </div>
        <Link href="/promos/new" className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--primary)" }}>
          + Nueva promo
        </Link>
      </div>

      {/* Filtros como dropdowns */}
      <div className="rounded-2xl border p-4 mb-4" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>Provincia</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}
              value={filterProvince} onChange={e => { setFilterProvince(e.target.value); setFilterCity("todos"); }}>
              <option value="todos">Todas</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>Ciudad</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}
              value={filterCity} onChange={e => setFilterCity(e.target.value)}>
              <option value="todos">Todas</option>
              {filteredCities.map(c => <option key={c.name + c.province} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>Confianza</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}
              value={filterConf} onChange={e => setFilterConf(e.target.value)}>
              <option value="todos">Todas</option>
              <option value="confirmed">✅ Confirmado</option>
              <option value="probable">🟡 Probable</option>
              <option value="community">🔵 Comunidad</option>
              <option value="unconfirmed">⚪ Sin confirmar</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>Estado</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}
              value={filterActive} onChange={e => setFilterActive(e.target.value)}>
              <option value="active">Activas</option>
              <option value="all">Todas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>🏦 Banco</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}
              value={filterBank} onChange={e => setFilterBank(e.target.value)}>
              <option value="todos">Todos los bancos</option>
              {banks.map(b => <option key={b.slug} value={b.slug}>{b.display_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>📱 Billetera</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}
              value={filterWallet} onChange={e => setFilterWallet(e.target.value)}>
              <option value="todos">Todas las billeteras</option>
              {wallets.map(w => <option key={w.slug} value={w.slug}>{w.display_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>⭐ Fidelidad</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}>
              <option value="todos">Todos los programas</option>
              {loyaltyPrograms.map(lp => <option key={lp.slug} value={lp.slug}>{lp.program_name} ({lp.category})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>🏷️ Rubro</label>
            <select className={selectStyle} style={{ borderColor: "var(--bg-dark)", width: "100%" }}
              value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="todos">Todos los rubros</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
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
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Banco</th>
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Días</th>
                <th className="text-left px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>Confianza</th>
                <th className="text-center px-3 py-3 font-semibold text-[10px] uppercase tracking-wider" style={{ color: "var(--text-sec)" }}>On/Off</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const cc = confColor(p.confidence_status);
                return (
                  <tr key={p.id} className="border-t" style={{ borderColor: "var(--bg-dark)", opacity: p.is_active ? 1 : 0.4 }}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-xs leading-tight">{p.title}</div>
                      {p.merchant_category && <div className="text-[10px] mt-0.5" style={{ color: "var(--text-sec)" }}>{p.merchant_category}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: "var(--text-sec)" }}>{p.merchant_name || "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-xs" style={{ color: "var(--primary)" }}>
                        {p.discount_value ? `${p.discount_value}%` : "—"}
                      </span>
                      {p.max_discount && <div className="text-[10px]" style={{ color: "var(--text-sec)" }}>tope ${Number(p.max_discount).toLocaleString()}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-[10px]" style={{ color: "var(--text-sec)" }}>
                      {p.required_banks?.length > 0
                        ? p.required_banks.map((slug: string) => banks.find(b => b.slug === slug)?.display_name || slug).join(", ")
                        : p.any_payment_method ? "Todos" : "—"}
                      {p.required_wallets?.length > 0 && <div className="mt-0.5">{p.required_wallets.join(", ")}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-[10px]" style={{ color: "var(--text-sec)" }}>
                      {p.valid_days?.map((d: string) => DAYS_MAP[d] || d).join(", ") || "Todos"}
                    </td>
                    <td className="px-3 py-2.5">
                      <select value={p.confidence_status} onChange={(e) => setConfidence(p.id, e.target.value)}
                        className="text-[10px] font-semibold rounded-lg px-2 py-1 border-none cursor-pointer"
                        style={{ background: cc.bg, color: cc.color }}>
                        <option value="confirmed">✅ Confirmado</option>
                        <option value="probable">🟡 Probable</option>
                        <option value="community">🔵 Comunidad</option>
                        <option value="unconfirmed">⚪ Sin confirmar</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => toggleActive(p.id, p.is_active)}
                        className="w-10 h-5 rounded-full relative transition-all"
                        style={{ background: p.is_active ? "#16A34A" : "#D1D5DB" }}>
                        <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                          style={{ left: p.is_active ? 22 : 2 }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
