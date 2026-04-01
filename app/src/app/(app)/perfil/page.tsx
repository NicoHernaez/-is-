"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { supabase } from "@/lib/supabase";
import { getUserPaymentSlugs } from "@/lib/promo-filter";

const BANK_NAMES: Record<string, string> = {
  pampa: "Banco de La Pampa", galicia: "Galicia", macro: "Macro", santander: "Santander",
  bbva: "BBVA", hsbc: "HSBC", nacion: "Banco Nación", icbc: "ICBC", hipotecario: "Hipotecario",
  supervielle: "Supervielle", comafi: "Comafi", brubank: "Brubank", sol: "Banco del Sol",
  provincia: "Banco Provincia", ciudad: "Banco Ciudad", bancor: "Bancor", santafe: "Nuevo Bco Santa Fe",
  bersa: "Bersa", tucuman: "Banco Tucumán", bpn: "Bco Provincia Neuquén",
  patagonia: "Patagonia",
};

const WALLET_NAMES: Record<string, string> = {
  mercadopago: "Mercado Pago", modo: "MODO", uala: "Ualá", naranjax: "Naranja X",
  personalpay: "Personal Pay", prex: "Prex", bimo: "Bimo",
};

const CARD_LABELS: Record<string, string> = {
  debit: "Débito", visa: "Visa", mastercard: "Mastercard", amex: "Amex", credit: "Crédito",
};

// Bancos disponibles para agregar (nacionales + digitales)
const AVAILABLE_BANKS = [
  { slug: "pampa", name: "Banco de La Pampa" },
  { slug: "galicia", name: "Galicia" },
  { slug: "santander", name: "Santander" },
  { slug: "nacion", name: "Banco Nación" },
  { slug: "macro", name: "Macro" },
  { slug: "bbva", name: "BBVA" },
  { slug: "hipotecario", name: "Hipotecario" },
  { slug: "supervielle", name: "Supervielle" },
  { slug: "patagonia", name: "Patagonia" },
  { slug: "icbc", name: "ICBC" },
  { slug: "hsbc", name: "HSBC" },
  { slug: "provincia", name: "Banco Provincia" },
  { slug: "ciudad", name: "Banco Ciudad" },
  { slug: "comafi", name: "Comafi" },
  { slug: "brubank", name: "Brubank" },
];

const AVAILABLE_WALLETS = [
  { slug: "mercadopago", name: "Mercado Pago" },
  { slug: "uala", name: "Ualá" },
  { slug: "naranjax", name: "Naranja X" },
  { slug: "personalpay", name: "Personal Pay" },
  { slug: "prex", name: "Prex" },
];

const CARD_TYPES = ["debit", "visa", "mastercard", "amex"];

export default function PerfilPage() {
  const { user, logout, refreshProfile } = useUser();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const initial = user.display_name.charAt(0).toUpperCase();
  const bankCards = user.payment_methods.filter(p => p.method_type === "bank_card");
  const wallets = user.payment_methods.filter(p => p.method_type === "wallet");
  const walletCards = user.payment_methods.filter(p => p.method_type === "wallet_card");

  const bankGroups: Record<string, string[]> = {};
  for (const pm of bankCards) {
    const slug = pm.bank_slug || "otro";
    if (!bankGroups[slug]) bankGroups[slug] = [];
    if (pm.card_network) bankGroups[slug].push(pm.card_network);
  }

  // MODO inferido
  const { walletSlugs } = getUserPaymentSlugs(user.payment_methods);
  const hasModoInferred = walletSlugs.has("modo") && !wallets.some(w => w.wallet_slug === "modo");

  // Bancos/wallets que el usuario aún no tiene
  const existingBanks = new Set(Object.keys(bankGroups));
  const existingWallets = new Set(wallets.map(w => w.wallet_slug));
  const addableBanks = AVAILABLE_BANKS.filter(b => !existingBanks.has(b.slug));
  const addableWallets = AVAILABLE_WALLETS.filter(w => !existingWallets.has(w.slug));

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user!.display_name) { setEditingName(false); return; }
    setSavingName(true);
    await supabase.from("users").update({ display_name: trimmed }).eq("id", user!.id);
    setSavingName(false);
    setEditingName(false);
    refreshProfile();
  }

  async function addBank(slug: string) {
    setSaving(true);
    // Agregar con débito por defecto
    await supabase.from("user_payment_methods").insert({
      user_id: user!.id, method_type: "bank_card", bank_slug: slug, card_network: "debit", is_active: true,
    });
    setSaving(false);
    setShowAddBank(false);
    refreshProfile();
  }

  async function addWallet(slug: string) {
    setSaving(true);
    await supabase.from("user_payment_methods").insert({
      user_id: user!.id, method_type: "wallet", wallet_slug: slug, is_active: true,
    });
    setSaving(false);
    setShowAddWallet(false);
    refreshProfile();
  }

  async function removeBank(slug: string) {
    setSaving(true);
    await supabase.from("user_payment_methods")
      .delete().eq("user_id", user!.id).eq("bank_slug", slug);
    setSaving(false);
    refreshProfile();
  }

  async function removeWallet(slug: string) {
    setSaving(true);
    await supabase.from("user_payment_methods")
      .delete().eq("user_id", user!.id).eq("wallet_slug", slug);
    setSaving(false);
    refreshProfile();
  }

  return (
    <div className="px-6 pt-2 pb-4">
      {/* Header con nombre editable */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.15)" }}>{initial}</div>
        <div className="flex-1">
          {editingName ? (
            <div className="flex gap-2 items-center">
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveName()}
                placeholder="Tu nombre"
                autoFocus
                className="text-[18px] font-bold px-2 py-1 rounded-[10px] border outline-none flex-1"
                style={{ color: "var(--text)", borderColor: "rgba(196,150,122,0.3)", background: "var(--surface)" }}
              />
              <button onClick={saveName} disabled={savingName}
                className="text-[12px] font-bold px-3 py-1.5 rounded-[10px]"
                style={{ background: "var(--primary)", color: "white" }}>
                {savingName ? "..." : "OK"}
              </button>
              <button onClick={() => setEditingName(false)}
                className="text-[12px] px-2 py-1.5" style={{ color: "var(--text-sec)" }}>X</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-[20px] font-bold" style={{ color: "var(--text)", fontFamily: "Georgia, serif" }}>{user.display_name}</div>
              <button onClick={() => { setNameInput(user.display_name === "Amiga" ? "" : user.display_name); setEditingName(true); }}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-[8px]"
                style={{ color: "var(--blush)", background: "rgba(196,150,122,0.1)" }}>
                Editar
              </button>
            </div>
          )}
          <div className="text-[12px]" style={{ color: "var(--text-sec)" }}>{user.city}{user.province ? `, ${user.province}` : ""}</div>
          <div className="text-[11px] mt-0.5 font-semibold" style={{ color: "#16A34A" }}>
            {user.plan_tier === "free" ? "Plan Gratis" : "Plan Start"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-[16px] p-3.5 text-center border" style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <div className="text-[20px] font-extrabold" style={{ color: "var(--primary)" }}>${user.savings_total > 0 ? user.savings_total.toLocaleString("es-AR") : "0"}</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold mt-1" style={{ color: "var(--text-sec)" }}>Ahorro total</div>
        </div>
        <div className="rounded-[16px] p-3.5 text-center border" style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <div className="text-[20px] font-extrabold" style={{ color: "var(--blush)" }}>{Object.keys(bankGroups).length}</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold mt-1" style={{ color: "var(--text-sec)" }}>Bancos</div>
        </div>
        <div className="rounded-[16px] p-3.5 text-center border" style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <div className="text-[20px] font-extrabold" style={{ color: "var(--primary)" }}>{wallets.length}</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold mt-1" style={{ color: "var(--text-sec)" }}>Billeteras</div>
        </div>
      </div>

      {/* Mis bancos */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: "var(--text-sec)" }}>Mis bancos</div>
        <button onClick={() => setShowAddBank(!showAddBank)} className="text-[11px] font-semibold"
          style={{ color: "var(--blush)" }}>{showAddBank ? "Cancelar" : "+ Agregar"}</button>
      </div>

      {showAddBank && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-[14px] border" style={{ background: "rgba(196,150,122,0.04)", borderColor: "rgba(196,150,122,0.15)" }}>
          {addableBanks.map(b => (
            <button key={b.slug} onClick={() => addBank(b.slug)} disabled={saving}
              className="text-[11px] font-medium px-3 py-1.5 rounded-[10px] border"
              style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.12)", color: "var(--text)" }}>
              + {b.name}
            </button>
          ))}
        </div>
      )}

      {Object.entries(bankGroups).map(([slug, cards]) => (
        <div key={slug} className="flex items-center gap-3 p-3.5 mb-2 rounded-[16px] border"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <span className="text-[20px]">🏦</span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{BANK_NAMES[slug] || slug}</div>
            <div className="text-[11px]" style={{ color: "var(--text-sec)" }}>{cards.map(c => CARD_LABELS[c] || c).join(" · ")}</div>
          </div>
          <button onClick={() => removeBank(slug)} disabled={saving}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
            Quitar
          </button>
        </div>
      ))}

      {/* Mis billeteras */}
      <div className="flex justify-between items-center mb-3 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: "var(--text-sec)" }}>Mis billeteras</div>
        <button onClick={() => setShowAddWallet(!showAddWallet)} className="text-[11px] font-semibold"
          style={{ color: "var(--blush)" }}>{showAddWallet ? "Cancelar" : "+ Agregar"}</button>
      </div>

      {showAddWallet && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-[14px] border" style={{ background: "rgba(196,150,122,0.04)", borderColor: "rgba(196,150,122,0.15)" }}>
          {addableWallets.map(w => (
            <button key={w.slug} onClick={() => addWallet(w.slug)} disabled={saving}
              className="text-[11px] font-medium px-3 py-1.5 rounded-[10px] border"
              style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.12)", color: "var(--text)" }}>
              + {w.name}
            </button>
          ))}
        </div>
      )}

      {wallets.map((w, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 mb-2 rounded-[16px] border"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <span className="text-[20px]">📱</span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{WALLET_NAMES[w.wallet_slug || ""] || w.wallet_slug}</div>
            <div className="text-[11px]" style={{ color: "var(--text-sec)" }}>
              {walletCards.filter(wc => wc.wallet_slug === w.wallet_slug).map(wc => CARD_LABELS[wc.card_network || ""] || "Tarjeta").join(" · ") || "Billetera"}
            </div>
          </div>
          <button onClick={() => removeWallet(w.wallet_slug!)} disabled={saving}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
            Quitar
          </button>
        </div>
      ))}

      {/* MODO inferido */}
      {hasModoInferred && (
        <div className="p-3.5 mb-2 rounded-[16px] border"
          style={{ background: "rgba(108,60,225,0.04)", borderColor: "rgba(108,60,225,0.15)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[20px]">💜</span>
            <div className="flex-1">
              <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>MODO</div>
              <div className="text-[11px]" style={{ color: "var(--text-sec)" }}>
                Incluido con {Object.keys(bankGroups).map(s => BANK_NAMES[s] || s).join(" y ")}
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(108,60,225,0.08)", color: "#6C3CE1" }}>Auto</span>
          </div>
          <div className="text-[11px] mt-2 leading-relaxed" style={{ color: "var(--text-sec)" }}>
            Tus bancos están en MODO. Los descuentos con MODO ya aparecen en tus promos.
          </div>
        </div>
      )}

      {Object.keys(bankGroups).length === 0 && wallets.length === 0 && (
        <div className="rounded-[18px] p-5 text-center border mb-4"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <div className="text-[13px]" style={{ color: "var(--text-sec)" }}>Agregá tus bancos y billeteras para ver descuentos personalizados</div>
        </div>
      )}

      {/* Ajustes */}
      <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3 mt-6" style={{ color: "var(--text-sec)" }}>Ajustes</div>
      {["Frecuencia de Yapa", "Notificaciones"].map(opt => (
        <div key={opt} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(74,94,60,0.06)" }}>
          <span className="text-[13px]" style={{ color: "var(--text)" }}>{opt}</span>
          <span style={{ color: "var(--text-sec)" }}>›</span>
        </div>
      ))}
      <button onClick={logout} className="w-full mt-4 mb-6 py-3 rounded-[14px] text-[13px] font-semibold border"
        style={{ borderColor: "rgba(196,150,122,0.3)", color: "var(--blush)" }}>
        Cerrar sesión
      </button>
    </div>
  );
}
