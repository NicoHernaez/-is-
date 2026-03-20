"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";

const CAT_ICONS: Record<string, string> = {
  combustible: "⛽", supermercado: "🛒", farmacia: "💊", gastronomia: "🍔",
  ropa: "👕", gym: "💪", entretenimiento: "🎬", viajes: "✈️", otro: "🏪",
};

const TYPE_LABELS: Record<string, string> = {
  points: "Puntos", membership: "Membresía", discount_card: "Tarjeta socio", app: "App",
};

export default function FidelidadPage() {
  const sb = createBrowserClient();
  const [programs, setPrograms] = useState<any[]>([]);
  const [filterCat, setFilterCat] = useState("todos");

  useEffect(() => {
    sb.from("loyalty_programs").select("*").order("category").order("program_name").then(({ data }) => data && setPrograms(data));
  }, []);

  const categories = [...new Set(programs.map(p => p.category))].sort();
  const filtered = filterCat === "todos" ? programs : programs.filter(p => p.category === filterCat);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Tarjetas de Fidelidad</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>
            {programs.length} programas cargados · Socios, puntos, membresías
          </p>
        </div>
      </div>

      {/* Filtro por categoría */}
      <div className="rounded-2xl border p-4 mb-4" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--text-sec)" }}>Categoría</label>
        <select className="px-3 py-2 rounded-xl text-sm border bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          style={{ borderColor: "var(--bg-dark)" }}
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="todos">Todas las categorías ({programs.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>{CAT_ICONS[c] || "🏪"} {c} ({programs.filter(p => p.category === c).length})</option>
          ))}
        </select>
      </div>

      {/* Grilla de programas */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: "var(--bg)" }}>
                {CAT_ICONS[p.category] || "🏪"}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "var(--primary)" }}>{p.program_name}</div>
                <div className="text-xs" style={{ color: "var(--text-sec)" }}>{p.brand}</div>
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--bg)", color: "var(--text-sec)" }}>
                {p.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(196,150,122,0.1)", color: "var(--blush)" }}>
                {TYPE_LABELS[p.program_type] || p.program_type}
              </span>
            </div>

            {p.points_system && (
              <div className="text-xs mb-2" style={{ color: "var(--primary)" }}>
                <span className="font-semibold">Sistema:</span> {p.points_system}
              </div>
            )}

            <div className="text-xs" style={{ color: "var(--text-sec)" }}>{p.main_benefit}</div>

            {p.provinces && (
              <div className="flex gap-1 flex-wrap mt-3">
                {p.provinces.map((prov: string) => (
                  <span key={prov} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg)", color: "var(--text-sec)" }}>{prov}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
