"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import { filterPromosForUser } from "@/lib/promo-filter";
import DiscountCard from "@/components/ui/DiscountCard";

const DAYS_MAP: Record<string, string> = { MON: "Lu", TUE: "Ma", WED: "Mi", THU: "Ju", FRI: "Vi", SAT: "Sa", SUN: "Do" };
const CATEGORIES = [
  { key: "all", label: "Todos", icon: "🏷️" },
  { key: "supermercado", label: "Súper", icon: "🛒" },
  { key: "combustible", label: "Nafta", icon: "⛽" },
  { key: "farmacia", label: "Farmacia", icon: "💊" },
  { key: "gastronomia", label: "Resto", icon: "🍽️" },
  { key: "libreria", label: "Librería", icon: "📚" },
];

export default function DescuentosPage() {
  const { user } = useUser();
  const [promos, setPromos] = useState<any[]>([]);
  const [banks, setBanks] = useState<Record<string, string>>({});
  const [filterCat, setFilterCat] = useState("all");
  const [filterTab, setFilterTab] = useState<"mine" | "all">("mine");

  useEffect(() => {
    supabase.from("promotions").select("*").eq("is_active", true)
      .in("confidence_status", ["confirmed", "probable"])
      .order("discount_value", { ascending: false })
      .then(({ data }) => data && setPromos(data));
    supabase.from("banks").select("slug, display_name").then(({ data }) => {
      if (data) setBanks(Object.fromEntries(data.map(b => [b.slug, b.display_name])));
    });
  }, []);

  // Filtrar por medios de pago del usuario (tab "Mis medios") y por categoría
  const byPayment = filterTab === "mine" && user
    ? filterPromosForUser(promos, user.payment_methods)
    : promos;
  const filtered = filterCat === "all" ? byPayment : byPayment.filter(p => p.merchant_category === filterCat);

  return (
    <div className="px-6 pt-2">
      <h1 className="text-[24px] font-bold mb-1" style={{ fontFamily: "Georgia, serif", color: "var(--text)" }}>Descuentos</h1>
      <div className="text-[12px] mb-4" style={{ color: "var(--text-sec)" }}>General Pico · Marzo 2026</div>

      {/* Mis medios / Todos */}
      <div className="flex rounded-[14px] p-[3px] mb-4" style={{ background: "var(--bg-dark)" }}>
        <button onClick={() => setFilterTab("mine")}
          className="flex-1 text-center py-2.5 rounded-[12px] text-[12px] font-bold transition-all"
          style={{ background: filterTab === "mine" ? "var(--primary)" : "transparent", color: filterTab === "mine" ? "white" : "var(--text-sec)" }}>
          Mis medios
        </button>
        <button onClick={() => setFilterTab("all")}
          className="flex-1 text-center py-2.5 rounded-[12px] text-[12px] font-medium transition-all"
          style={{ color: filterTab === "all" ? "var(--primary)" : "var(--text-sec)", background: filterTab === "all" ? "var(--surface)" : "transparent" }}>
          Todos
        </button>
      </div>

      {/* Categorías */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setFilterCat(cat.key)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-[20px] text-[11px] font-medium border whitespace-nowrap transition-all"
            style={{
              background: filterCat === cat.key ? "rgba(196,150,122,0.12)" : "var(--surface)",
              color: filterCat === cat.key ? "var(--blush)" : "var(--text-sec)",
              borderColor: filterCat === cat.key ? "rgba(196,150,122,0.3)" : "rgba(74,94,60,0.08)",
            }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.map(p => (
        <DiscountCard
          key={p.id}
          title={p.title}
          subtitle={`${p.merchant_name || p.merchant_category || ""} · ${p.valid_days?.map((d: string) => DAYS_MAP[d] || d).join(", ") || "Todos los días"}`}
          discount={p.discount_value ? `${p.discount_value}%` : "—"}
          bank={p.required_banks?.map((s: string) => banks[s] || s).join(", ") || "Todos"}
          confidence={p.confidence_status}
          days={p.max_discount ? `Tope $${Number(p.max_discount).toLocaleString()}` : undefined}
        />
      ))}
    </div>
  );
}
