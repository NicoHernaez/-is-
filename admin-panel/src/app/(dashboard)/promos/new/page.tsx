"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const CATEGORIES = ["supermercado", "farmacia", "combustible", "gastronomia", "ropa", "libreria", "entretenimiento", "servicios", "otro"];
const DISCOUNT_TYPES = ["percentage", "fixed", "installments", "cashback", "bogo"];
const CONFIDENCE = ["confirmed", "probable", "community", "unconfirmed"];
const DAYS = [
  { value: "MON", label: "Lun" }, { value: "TUE", label: "Mar" }, { value: "WED", label: "Mié" },
  { value: "THU", label: "Jue" }, { value: "FRI", label: "Vie" }, { value: "SAT", label: "Sáb" }, { value: "SUN", label: "Dom" },
];

export default function NewPromoPage() {
  const router = useRouter();
  const sb = createBrowserClient();
  const [banks, setBanks] = useState<{ slug: string; display_name: string }[]>([]);
  const [wallets, setWallets] = useState<{ slug: string; display_name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", discount_type: "percentage", discount_value: "",
    max_discount: "", min_purchase: "", installments: "",
    required_banks: [] as string[], required_cards: [] as string[], required_wallets: [] as string[],
    any_payment_method: false,
    merchant_name: "", merchant_category: "supermercado", merchant_chain: "",
    applies_nationwide: false, applies_provinces: "", applies_cities: "",
    valid_from: new Date().toISOString().split("T")[0], valid_until: "",
    valid_days: [] as string[],
    confidence_status: "probable", photo_url: "",
  });

  useEffect(() => {
    sb.from("banks").select("slug, display_name").order("sort_order").then(({ data }) => data && setBanks(data));
    sb.from("wallets").select("slug, display_name").order("sort_order").then(({ data }) => data && setWallets(data));
  }, []);

  const set = (key: string, value: unknown) => setForm(p => ({ ...p, [key]: value }));
  const toggleArray = (key: string, val: string) => {
    const arr = form[key as keyof typeof form] as string[];
    set(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await sb.from("promotions").insert({
      title: form.title,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value ? Number(form.discount_value) : null,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      min_purchase: form.min_purchase ? Number(form.min_purchase) : null,
      installments: form.installments ? Number(form.installments) : null,
      required_banks: form.required_banks.length ? form.required_banks : null,
      required_cards: form.required_cards.length ? form.required_cards : null,
      required_wallets: form.required_wallets.length ? form.required_wallets : null,
      any_payment_method: form.any_payment_method,
      merchant_name: form.merchant_name || null,
      merchant_category: form.merchant_category || null,
      merchant_chain: form.merchant_chain || null,
      applies_nationwide: form.applies_nationwide,
      applies_provinces: form.applies_provinces ? form.applies_provinces.split(",").map(s => s.trim()) : null,
      applies_cities: form.applies_cities ? form.applies_cities.split(",").map(s => s.trim()) : null,
      valid_from: form.valid_from,
      valid_until: form.valid_until || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      valid_days: form.valid_days.length ? form.valid_days : null,
      confidence_status: form.confidence_status,
      confidence_score: form.confidence_status === "confirmed" ? 0.90 : form.confidence_status === "probable" ? 0.70 : 0.50,
      photo_url: form.photo_url || null,
      is_active: true,
    });
    setSaving(false);
    if (error) alert("Error: " + error.message);
    else router.push("/promos");
  };

  const inputStyle = "w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
  const labelStyle = "text-xs font-semibold uppercase tracking-wider mb-1 block";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--primary)" }}>Nueva Promo</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "var(--primary)" }}>Información básica</h2>

            <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Título *</label>
            <input className={inputStyle} style={{ borderColor: "var(--bg-dark)" }} placeholder="Ej: 25% en supermercados con Visa Galicia"
              value={form.title} onChange={e => set("title", e.target.value)} />

            <label className={labelStyle + " mt-3"} style={{ color: "var(--text-sec)" }}>Descripción</label>
            <textarea className={inputStyle} style={{ borderColor: "var(--bg-dark)" }} rows={2} placeholder="Detalle de la promo..."
              value={form.description} onChange={e => set("description", e.target.value)} />

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Tipo</label>
                <select className={inputStyle} style={{ borderColor: "var(--bg-dark)" }}
                  value={form.discount_type} onChange={e => set("discount_type", e.target.value)}>
                  {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Valor %/$</label>
                <input type="number" className={inputStyle} style={{ borderColor: "var(--bg-dark)" }} placeholder="25"
                  value={form.discount_value} onChange={e => set("discount_value", e.target.value)} />
              </div>
              <div>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Tope $</label>
                <input type="number" className={inputStyle} style={{ borderColor: "var(--bg-dark)" }} placeholder="15000"
                  value={form.max_discount} onChange={e => set("max_discount", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "var(--primary)" }}>Comercio</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Nombre</label>
                <input className={inputStyle} style={{ borderColor: "var(--bg-dark)" }} placeholder="Farmacity, YPF, etc."
                  value={form.merchant_name} onChange={e => set("merchant_name", e.target.value)} />
              </div>
              <div>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Categoría</label>
                <select className={inputStyle} style={{ borderColor: "var(--bg-dark)" }}
                  value={form.merchant_category} onChange={e => set("merchant_category", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "var(--primary)" }}>Vigencia y días</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Desde</label>
                <input type="date" className={inputStyle} style={{ borderColor: "var(--bg-dark)" }}
                  value={form.valid_from} onChange={e => set("valid_from", e.target.value)} />
              </div>
              <div>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Hasta</label>
                <input type="date" className={inputStyle} style={{ borderColor: "var(--bg-dark)" }}
                  value={form.valid_until} onChange={e => set("valid_until", e.target.value)} />
              </div>
            </div>
            <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Días válidos</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(d => (
                <button key={d.value} onClick={() => toggleArray("valid_days", d.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: form.valid_days.includes(d.value) ? "var(--primary)" : "var(--bg)",
                    color: form.valid_days.includes(d.value) ? "white" : "var(--text-sec)",
                  }}>{d.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "var(--primary)" }}>Medios de pago requeridos</h2>

            <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
              <input type="checkbox" checked={form.any_payment_method} onChange={e => set("any_payment_method", e.target.checked)} />
              Cualquier medio de pago
            </label>

            {!form.any_payment_method && (
              <>
                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Bancos</label>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {banks.map(b => (
                    <button key={b.slug} onClick={() => toggleArray("required_banks", b.slug)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                      style={{
                        background: form.required_banks.includes(b.slug) ? "var(--primary)" : "var(--bg)",
                        color: form.required_banks.includes(b.slug) ? "white" : "var(--text-sec)",
                      }}>{b.display_name}</button>
                  ))}
                </div>

                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Tarjetas</label>
                <div className="flex gap-2 mb-3">
                  {["debit", "visa", "mastercard", "amex"].map(c => (
                    <button key={c} onClick={() => toggleArray("required_cards", c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: form.required_cards.includes(c) ? "var(--blush)" : "var(--bg)",
                        color: form.required_cards.includes(c) ? "white" : "var(--text-sec)",
                      }}>{c === "debit" ? "Débito" : c === "amex" ? "Amex" : c.charAt(0).toUpperCase() + c.slice(1)}</button>
                  ))}
                </div>

                <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Billeteras</label>
                <div className="flex gap-1.5 flex-wrap">
                  {wallets.map(w => (
                    <button key={w.slug} onClick={() => toggleArray("required_wallets", w.slug)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                      style={{
                        background: form.required_wallets.includes(w.slug) ? "var(--primary)" : "var(--bg)",
                        color: form.required_wallets.includes(w.slug) ? "white" : "var(--text-sec)",
                      }}>{w.display_name}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--bg-dark)" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "var(--primary)" }}>Ubicación y confianza</h2>

            <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
              <input type="checkbox" checked={form.applies_nationwide} onChange={e => set("applies_nationwide", e.target.checked)} />
              Aplica a todo el país
            </label>

            {!form.applies_nationwide && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Provincias</label>
                  <input className={inputStyle} style={{ borderColor: "var(--bg-dark)" }} placeholder="La Pampa, Buenos Aires"
                    value={form.applies_provinces} onChange={e => set("applies_provinces", e.target.value)} />
                </div>
                <div>
                  <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Ciudades</label>
                  <input className={inputStyle} style={{ borderColor: "var(--bg-dark)" }} placeholder="General Pico, Santa Rosa"
                    value={form.applies_cities} onChange={e => set("applies_cities", e.target.value)} />
                </div>
              </div>
            )}

            <label className={labelStyle} style={{ color: "var(--text-sec)" }}>Nivel de confianza</label>
            <div className="flex gap-2">
              {CONFIDENCE.map(c => (
                <button key={c} onClick={() => set("confidence_status", c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: form.confidence_status === c
                      ? c === "confirmed" ? "#16A34A" : c === "probable" ? "#D97706" : c === "community" ? "#2563EB" : "#9CA3AF"
                      : "var(--bg)",
                    color: form.confidence_status === c ? "white" : "var(--text-sec)",
                  }}>{c}</button>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving || !form.title}
            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all"
            style={{ background: form.title ? "var(--primary)" : "var(--bg-dark)", opacity: form.title ? 1 : 0.5 }}>
            {saving ? "Guardando..." : "Guardar promo"}
          </button>
        </div>
      </div>
    </div>
  );
}
