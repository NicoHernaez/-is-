"use client";

import Link from "next/link";
import DiscountCard from "@/components/ui/DiscountCard";
import { useUser } from "@/lib/user-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Promo {
  id: string;
  title: string;
  discount_value: number | null;
  max_discount: number | null;
  merchant_name: string | null;
  merchant_category: string | null;
  required_banks: string[];
  required_wallets: string[];
  valid_days: string[];
  confidence_status: string;
}

export default function HomePage() {
  const { user } = useUser();
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    if (!user) return;
    async function loadPromos() {
      const { data } = await supabase
        .from("promotions")
        .select("id, title, discount_value, max_discount, merchant_name, merchant_category, required_banks, required_wallets, valid_days, confidence_status")
        .eq("is_active", true)
        .in("confidence_status", ["confirmed", "probable"])
        .order("discount_value", { ascending: false })
        .limit(5);
      if (data) setPromos(data);
    }
    loadPromos();
  }, [user]);

  if (!user) return null;

  const initial = user.display_name.charAt(0).toUpperCase();
  const bankCount = new Set(user.payment_methods.filter(p => p.method_type === "bank_card").map(p => p.bank_slug)).size;
  const walletCount = user.payment_methods.filter(p => p.method_type === "wallet").length;
  const topPromos = promos.slice(0, 3);

  const formatDays = (days: string[]) => {
    if (!days || days.length === 0) return "";
    const map: Record<string, string> = { MON: "Lu", TUE: "Ma", WED: "Mi", THU: "Ju", FRI: "Vi", SAT: "Sa", SUN: "Do" };
    if (days.length === 7) return "Todos los días";
    return days.map(d => map[d] || d).join(" ");
  };

  const formatBank = (banks: string[], wallets: string[]) => {
    if (banks?.length > 0) return banks[0].charAt(0).toUpperCase() + banks[0].slice(1);
    if (wallets?.length > 0) return wallets[0].charAt(0).toUpperCase() + wallets[0].slice(1);
    return "";
  };

  return (
    <div className="px-6 pt-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="text-[14px] font-medium" style={{ color: "var(--text)" }}>Hola <b>{user.display_name}</b> 🛍️</div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--text-sec)" }}>{user.city}{user.province ? `, ${user.province}` : ""}</div>
        </div>
        <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[17px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 12px rgba(74,94,60,0.15)" }}>
          {initial}
        </div>
      </div>

      {/* Ahorro card */}
      <div className="rounded-[24px] p-7 text-center border mb-5"
        style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }}>
        <div className="text-[10px] uppercase tracking-[2.5px] font-semibold mb-2" style={{ color: "var(--text-sec)" }}>Ahorraste este mes</div>
        <div className="text-[46px] font-extrabold leading-none" style={{ color: "var(--primary)" }}>
          ${user.savings_total > 0 ? user.savings_total.toLocaleString("es-AR") : "0"}
        </div>
        {user.savings_total === 0 && (
          <div className="text-[13px] italic mt-2.5" style={{ color: "var(--blush)" }}>Usá tus descuentos y empezá a sumar</div>
        )}
        <div className="flex justify-between items-center mt-4 px-4 py-2.5 rounded-[14px]" style={{ background: "rgba(74,94,60,0.05)" }}>
          <span className="text-[12px]" style={{ color: "var(--text)" }}>{bankCount} banco{bankCount !== 1 ? "s" : ""} · {walletCount} billetera{walletCount !== 1 ? "s" : ""}</span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-[10px]" style={{ color: "var(--primary)", background: "rgba(74,94,60,0.07)" }}>
            {user.plan_tier === "free" ? "Plan Gratis" : "Plan Start"}
          </span>
        </div>
      </div>

      {/* Descuentos */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: "var(--text-sec)" }}>Descuentos para vos</span>
        <Link href="/descuentos" className="text-[12px] font-semibold" style={{ color: "var(--blush)" }}>Ver todos →</Link>
      </div>

      {topPromos.length > 0 ? topPromos.map(p => (
        <DiscountCard
          key={p.id}
          title={p.title || `${p.discount_value}% en ${p.merchant_category || "descuento"}`}
          subtitle={`${p.merchant_name || p.merchant_category || ""} · ${formatDays(p.valid_days)}`}
          discount={p.discount_value ? `${p.discount_value}%` : ""}
          bank={formatBank(p.required_banks, p.required_wallets)}
          confidence={p.confidence_status as "confirmed" | "probable" | "community" | "unconfirmed"}
        />
      )) : (
        <div className="rounded-[18px] p-5 text-center border mb-4"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <div className="text-[13px]" style={{ color: "var(--text-sec)" }}>Cargando tus descuentos...</div>
        </div>
      )}

      {/* CTA Yapa */}
      <div className="rounded-[18px] p-4 mt-2 mb-4 border"
        style={{ background: "var(--surface)", borderColor: "rgba(196,150,122,0.12)", boxShadow: "0 2px 12px rgba(196,150,122,0.06)" }}>
        <div className="text-[11px] font-bold mb-1.5" style={{ color: "var(--blush)" }}>Preguntale a Yapa</div>
        <div className="text-[13px] leading-relaxed opacity-85" style={{ color: "var(--text)" }}>
          &quot;Necesito comprar guardapolvos&quot;, &quot;¿Dónde cargo nafta más barato?&quot; — Yapa te dice con qué tarjeta y dónde.
        </div>
      </div>
    </div>
  );
}
