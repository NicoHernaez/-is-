"use client";

import { useState, useEffect } from "react";
import { supabase, YAPA_FUNCTION_URL } from "@/lib/supabase";

// ─── Brand colors y datos ────────────────────────────────

const PROVINCES = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
];

// Bancos provinciales — solo se muestran en SU provincia
const PROVINCIAL_BANKS = [
  { slug: "pampa", name: "Banco de La Pampa", color: "#1B5E20", provinces: ["La Pampa"] },
  { slug: "provincia", name: "Banco Provincia", color: "#0D47A1", provinces: ["Buenos Aires"] },
  { slug: "ciudad", name: "Banco Ciudad", color: "#E65100", provinces: ["CABA"] },
  { slug: "bancor", name: "Bancor", color: "#1565C0", provinces: ["Córdoba"] },
  { slug: "santafe", name: "Nuevo Bco Santa Fe", color: "#B71C1C", provinces: ["Santa Fe"] },
  { slug: "bersa", name: "Bersa", color: "#004D40", provinces: ["Entre Ríos"] },
  { slug: "tucuman", name: "Banco Tucumán", color: "#1565C0", provinces: ["Tucumán"] },
  { slug: "bpn", name: "Bco Provincia Neuquén", color: "#0D47A1", provinces: ["Neuquén"] },
  { slug: "chaco", name: "Nuevo Bco del Chaco", color: "#2E7D32", provinces: ["Chaco"] },
  { slug: "corrientes", name: "Banco de Corrientes", color: "#00695C", provinces: ["Corrientes"] },
  { slug: "sanjuan", name: "Banco San Juan", color: "#1565C0", provinces: ["San Juan"] },
  { slug: "chubut", name: "Banco del Chubut", color: "#0277BD", provinces: ["Chubut"] },
  { slug: "santacruz", name: "Banco de Santa Cruz", color: "#004D40", provinces: ["Santa Cruz"] },
  { slug: "tierradelfuego", name: "Bco Tierra del Fuego", color: "#0D47A1", provinces: ["Tierra del Fuego"] },
  { slug: "formosa", name: "Banco de Formosa", color: "#1B5E20", provinces: ["Formosa"] },
  { slug: "larioja", name: "Nuevo Bco de La Rioja", color: "#B71C1C", provinces: ["La Rioja"] },
];

// Bancos nacionales principales — se muestran en TODAS las provincias
const NATIONAL_BANKS = [
  { slug: "nacion", name: "Banco Nación", color: "#1565C0" },
  { slug: "galicia", name: "Galicia", color: "#EF6C00" },
  { slug: "santander", name: "Santander", color: "#D32F2F" },
  { slug: "bbva", name: "BBVA", color: "#004481" },
  { slug: "macro", name: "Macro", color: "#1A237E" },
  { slug: "hipotecario", name: "Hipotecario", color: "#00695C" },
  { slug: "supervielle", name: "Supervielle", color: "#6A1B9A" },
  { slug: "patagonia", name: "Banco Patagonia", color: "#0277BD" },
  { slug: "icbc", name: "ICBC", color: "#C62828" },
  { slug: "hsbc", name: "HSBC", color: "#DB0011" },
];

// Bancos secundarios — se muestran en sección desplegable "Otros bancos"
const OTHER_BANKS = [
  { slug: "comafi", name: "Comafi", color: "#0277BD" },
  { slug: "brubank", name: "Brubank", color: "#7C4DFF" },
  { slug: "sol", name: "Banco del Sol", color: "#F9A825" },
];

// Combina provincial de la provincia + nacionales
function getBanksForProvince(prov: string) {
  const provincial = PROVINCIAL_BANKS.filter(b => b.provinces.includes(prov));
  const provincialSlugs = provincial.map(b => b.slug);
  const nationals = NATIONAL_BANKS.filter(b => !provincialSlugs.includes(b.slug));
  return [
    ...provincial.map(b => ({ ...b, isProvincial: true })),
    ...nationals.map(b => ({ ...b, provinces: [] as string[], isProvincial: false })),
  ];
}

// Todos los bancos (para buscar por slug en pantalla tarjetas)
function findBankBySlug(slug: string, prov: string) {
  const all = [
    ...PROVINCIAL_BANKS,
    ...NATIONAL_BANKS.map(b => ({ ...b, provinces: [] as string[] })),
    ...OTHER_BANKS.map(b => ({ ...b, provinces: [] as string[] })),
  ];
  return all.find(b => b.slug === slug) || { slug, name: slug, color: "#4A5E3C", provinces: [] };
}

const CARD_TYPES = [
  { id: "debit", name: "Débito", color: "#2E7D32", bg: "#E8F5E9", icon: "💳" },
  { id: "visa", name: "Visa", color: "#1A237E", bg: "#E8EAF6", icon: "💙" },
  { id: "mastercard", name: "Mastercard", color: "#E65100", bg: "#FBE9E7", icon: "🧡" },
  { id: "amex", name: "Amex", color: "#0D47A1", bg: "#E3F2FD", icon: "💎" },
];

const WALLETS = [
  { slug: "mercadopago", name: "Mercado Pago", color: "#009EE3", bg: "#E1F5FE", icon: "💙", hasCard: true },
  { slug: "modo", name: "MODO", color: "#6C3CE1", bg: "#EDE7F6", icon: "💜", hasCard: false },
  { slug: "uala", name: "Ualá", color: "#8E24AA", bg: "#F3E5F5", icon: "💜", hasCard: true },
  { slug: "naranjax", name: "Naranja X", color: "#E65100", bg: "#FFF3E0", icon: "🧡", hasCard: true },
  { slug: "personalpay", name: "Personal Pay", color: "#0277BD", bg: "#E1F5FE", icon: "💙", hasCard: false },
  { slug: "prex", name: "Prex", color: "#00838F", bg: "#E0F7FA", icon: "🩵", hasCard: true },
];

const WALLET_CARD_TYPES = [
  { id: "debit", name: "Débito / Prepaga", color: "#2E7D32", bg: "#E8F5E9" },
  { id: "credit", name: "Crédito", color: "#1565C0", bg: "#E3F2FD" },
];

interface OnboardingFlowProps {
  phone: string;
  onComplete: () => void;
}

type Step = "province" | "city" | "banks" | "cards" | "wallets" | "wallet_cards" | "saving";

export default function OnboardingFlow({ phone, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("province");
  const [province, setProvince] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [bankCards, setBankCards] = useState<Record<string, string[]>>({});
  const [currentBankIdx, setCurrentBankIdx] = useState(0);
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [walletCards, setWalletCards] = useState<Record<string, string[]>>({});
  const [currentWalletIdx, setCurrentWalletIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showOtherBanks, setShowOtherBanks] = useState(false);

  // Cargar ciudades cuando se elige provincia
  useEffect(() => {
    if (!province) return;
    async function loadCities() {
      const { data } = await supabase
        .from("cities")
        .select("name")
        .eq("province", province)
        .order("population", { ascending: false })
        .limit(30);
      setCities(data?.map(c => c.name) || []);
    }
    loadCities();
  }, [province]);

  // Bancos filtrados por provincia (provincial primero + nacionales)
  const sortedBanks = getBanksForProvince(province);

  const toggleBank = (slug: string) => {
    setSelectedBanks(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 4 ? [...prev, slug] : prev
    );
  };

  const toggleCard = (bankSlug: string, cardId: string) => {
    setBankCards(prev => {
      const current = prev[bankSlug] || [];
      const next = current.includes(cardId) ? current.filter(c => c !== cardId) : [...current, cardId];
      return { ...prev, [bankSlug]: next };
    });
  };

  const toggleWallet = (slug: string) => {
    setSelectedWallets(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const toggleWalletCard = (walletSlug: string, cardId: string) => {
    setWalletCards(prev => {
      const current = prev[walletSlug] || [];
      const next = current.includes(cardId) ? current.filter(c => c !== cardId) : [...current, cardId];
      return { ...prev, [walletSlug]: next };
    });
  };

  // Guardar todo en Supabase via RPC (bypassa RLS)
  const saveOnboarding = async () => {
    setSaving(true);
    setStep("saving");

    // Armar arrays para la RPC
    const banksPayload = selectedBanks.map(slug => ({
      slug,
      cards: bankCards[slug] || ["debit"],
    }));

    const walletsPayload = selectedWallets.map(slug => ({
      slug,
      cards: walletCards[slug] || [],
    }));

    const { data: userId, error } = await supabase.rpc("complete_app_onboarding", {
      p_phone: phone,
      p_province: province,
      p_city: city,
      p_banks: banksPayload,
      p_wallets: walletsPayload,
    });

    if (error) {
      console.error("Onboarding error:", error);
      setSaving(false);
      setStep("wallets");
      return;
    }

    // Enviar WA de bienvenida (no crítico, en background)
    fetch(YAPA_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name: "Amiga", query_text: "hola" }),
    }).catch(() => {});

    // Guardar phone en localStorage y refrescar perfil → dashboard
    try { localStorage.setItem("esplus_phone", phone); } catch {}
    onComplete();
  };

  // ─── Paso actual según cards por banco ─────────────────
  const handleCardsNext = () => {
    if (currentBankIdx < selectedBanks.length - 1) {
      setCurrentBankIdx(prev => prev + 1);
    } else {
      setStep("wallets");
    }
  };

  const handleWalletCardsNext = () => {
    const walletsWithCards = selectedWallets.filter(s => WALLETS.find(w => w.slug === s)?.hasCard);
    if (currentWalletIdx < walletsWithCards.length - 1) {
      setCurrentWalletIdx(prev => prev + 1);
    } else {
      saveOnboarding();
    }
  };

  const stepNumber = { province: 1, city: 2, banks: 3, cards: 4, wallets: 5, wallet_cards: 6, saving: 6 }[step];
  const totalSteps = 6;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[24px] font-extrabold" style={{ color: "var(--primary)" }}>-es+</div>
          <div className="text-[12px] font-semibold" style={{ color: "var(--text-sec)" }}>
            {stepNumber} / {totalSteps}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] rounded-full" style={{ background: "rgba(74,94,60,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ background: "var(--primary)", width: `${(stepNumber / totalSteps) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* ── STEP 1: PROVINCIA ────────────────────── */}
        {step === "province" && (
          <>
            <h2 className="text-[20px] font-bold mb-1" style={{ color: "var(--text)" }}>¿De qué provincia sos?</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-sec)" }}>Para mostrarte descuentos de tu zona</p>
            <div className="grid grid-cols-2 gap-2">
              {PROVINCES.map(p => (
                <button key={p} onClick={() => { setProvince(p); setCity(""); setStep("city"); }}
                  className="py-3 px-4 rounded-[14px] text-[13px] font-semibold text-left border transition-all active:scale-[0.97]"
                  style={{
                    background: province === p ? "var(--primary)" : "var(--surface)",
                    color: province === p ? "white" : "var(--text)",
                    borderColor: province === p ? "var(--primary)" : "rgba(74,94,60,0.08)",
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2: CIUDAD ──────────────────────── */}
        {step === "city" && (
          <>
            <button onClick={() => setStep("province")} className="text-[12px] font-semibold mb-3" style={{ color: "var(--blush)" }}>← Cambiar provincia</button>
            <h2 className="text-[20px] font-bold mb-1" style={{ color: "var(--text)" }}>¿De qué ciudad?</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-sec)" }}>{province}</p>
            {cities.length > 0 ? (
              <div className="flex flex-col gap-2">
                {cities.map(c => (
                  <button key={c} onClick={() => { setCity(c); setStep("banks"); }}
                    className="py-3 px-4 rounded-[14px] text-[14px] font-semibold text-left border transition-all active:scale-[0.97]"
                    style={{ background: "var(--surface)", color: "var(--text)", borderColor: "rgba(74,94,60,0.08)" }}>
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[13px]" style={{ color: "var(--text-sec)" }}>Cargando ciudades...</div>
            )}
          </>
        )}

        {/* ── STEP 3: BANCOS ──────────────────────── */}
        {step === "banks" && (
          <>
            <button onClick={() => setStep("city")} className="text-[12px] font-semibold mb-3" style={{ color: "var(--blush)" }}>← Cambiar ciudad</button>
            <h2 className="text-[20px] font-bold mb-1" style={{ color: "var(--text)" }}>¿Qué bancos tenés?</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-sec)" }}>Elegí todos los que uses (hasta 4)</p>
            <div className="flex flex-col gap-2.5">
              {sortedBanks.map(bank => {
                const selected = selectedBanks.includes(bank.slug);
                const isProv = "isProvincial" in bank && bank.isProvincial;
                return (
                  <button key={bank.slug} onClick={() => toggleBank(bank.slug)}
                    className="flex items-center gap-3 p-4 rounded-[16px] border transition-all active:scale-[0.98]"
                    style={{
                      background: selected ? bank.color + "12" : "var(--surface)",
                      borderColor: selected ? bank.color : "rgba(74,94,60,0.08)",
                      borderWidth: selected ? 2 : 1,
                    }}>
                    <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center text-[14px] font-bold text-white"
                      style={{ background: bank.color }}>
                      {bank.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{bank.name}</div>
                      {isProv && <div className="text-[10px] font-bold" style={{ color: bank.color }}>📍 Tu banco provincial</div>}
                    </div>
                    <div className="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: selected ? bank.color : "rgba(74,94,60,0.2)", background: selected ? bank.color : "transparent" }}>
                      {selected && <span className="text-white text-[12px]">✓</span>}
                    </div>
                  </button>
                );
              })}

              {/* Otros bancos (desplegable) */}
              <button onClick={() => setShowOtherBanks(!showOtherBanks)}
                className="flex items-center justify-center gap-2 py-3 rounded-[14px] text-[13px] font-semibold"
                style={{ color: "var(--text-sec)", background: "rgba(74,94,60,0.04)" }}>
                {showOtherBanks ? "Ocultar otros bancos ▲" : "Otros bancos ▼"}
              </button>
              {showOtherBanks && OTHER_BANKS.map(bank => {
                const selected = selectedBanks.includes(bank.slug);
                return (
                  <button key={bank.slug} onClick={() => toggleBank(bank.slug)}
                    className="flex items-center gap-3 p-4 rounded-[16px] border transition-all active:scale-[0.98]"
                    style={{
                      background: selected ? bank.color + "12" : "var(--surface)",
                      borderColor: selected ? bank.color : "rgba(74,94,60,0.08)",
                      borderWidth: selected ? 2 : 1,
                    }}>
                    <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center text-[14px] font-bold text-white"
                      style={{ background: bank.color }}>
                      {bank.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{bank.name}</div>
                    </div>
                    <div className="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: selected ? bank.color : "rgba(74,94,60,0.2)", background: selected ? bank.color : "transparent" }}>
                      {selected && <span className="text-white text-[12px]">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedBanks.length > 0 && (
              <button onClick={() => { setCurrentBankIdx(0); setStep("cards"); }}
                className="w-full mt-5 py-3.5 rounded-[16px] text-[15px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.2)" }}>
                Siguiente ({selectedBanks.length} banco{selectedBanks.length > 1 ? "s" : ""})
              </button>
            )}
          </>
        )}

        {/* ── STEP 4: TARJETAS POR BANCO ──────────── */}
        {step === "cards" && (
          <>
            <button onClick={() => setStep("banks")} className="text-[12px] font-semibold mb-3" style={{ color: "var(--blush)" }}>← Cambiar bancos</button>
            {(() => {
              const bankSlug = selectedBanks[currentBankIdx];
              const bank = findBankBySlug(bankSlug, province);
              const selected = bankCards[bankSlug] || [];
              return (
                <>
                  {/* Banner del banco con su color */}
                  <div className="rounded-[16px] p-4 mb-4 flex items-center gap-3"
                    style={{ background: bank.color, boxShadow: `0 4px 16px ${bank.color}30` }}>
                    <div className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center text-[20px] font-bold text-white"
                      style={{ background: "rgba(255,255,255,0.2)" }}>
                      {bank.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[18px] font-bold text-white">{bank.name}</div>
                      <div className="text-[11px] text-white/60">
                        Banco {currentBankIdx + 1} de {selectedBanks.length}
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--text)" }}>
                    Marcá las tarjetas que tenés
                  </p>
                  <div className="flex flex-col gap-3">
                    {CARD_TYPES.map(card => {
                      const isSelected = selected.includes(card.id);
                      return (
                        <button key={card.id} onClick={() => toggleCard(bankSlug, card.id)}
                          className="flex items-center gap-3 p-4 rounded-[16px] border transition-all active:scale-[0.98]"
                          style={{
                            background: isSelected ? card.bg : "var(--surface)",
                            borderColor: isSelected ? card.color : "rgba(74,94,60,0.08)",
                            borderWidth: isSelected ? 2 : 1,
                          }}>
                          <div className="w-[44px] h-[28px] rounded-[6px] flex items-center justify-center text-[16px]"
                            style={{ background: card.color + "18" }}>
                            {card.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-[15px] font-semibold" style={{ color: card.color }}>{card.name}</div>
                          </div>
                          <div className="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: isSelected ? card.color : "rgba(74,94,60,0.2)", background: isSelected ? card.color : "transparent" }}>
                            {isSelected && <span className="text-white text-[12px]">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selected.length > 0 && (
                    <button onClick={handleCardsNext}
                      className="w-full mt-5 py-3.5 rounded-[16px] text-[15px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.2)" }}>
                      {currentBankIdx < selectedBanks.length - 1 ? `Siguiente banco →` : "Siguiente"}
                    </button>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* ── STEP 5: BILLETERAS ──────────────────── */}
        {step === "wallets" && (
          <>
            <button onClick={() => { setCurrentBankIdx(selectedBanks.length - 1); setStep("cards"); }}
              className="text-[12px] font-semibold mb-3" style={{ color: "var(--blush)" }}>← Volver a tarjetas</button>
            <h2 className="text-[20px] font-bold mb-1" style={{ color: "var(--text)" }}>¿Usás billeteras digitales?</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-sec)" }}>Elegí todas las que uses</p>
            <div className="flex flex-col gap-2.5">
              {WALLETS.map(wallet => {
                const selected = selectedWallets.includes(wallet.slug);
                return (
                  <button key={wallet.slug} onClick={() => toggleWallet(wallet.slug)}
                    className="flex items-center gap-3 p-4 rounded-[16px] border transition-all active:scale-[0.98]"
                    style={{
                      background: selected ? wallet.bg : "var(--surface)",
                      borderColor: selected ? wallet.color : "rgba(74,94,60,0.08)",
                      borderWidth: selected ? 2 : 1,
                    }}>
                    <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center text-[18px]"
                      style={{ background: wallet.color + "18" }}>
                      {wallet.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{wallet.name}</div>
                      {wallet.hasCard && <div className="text-[10px]" style={{ color: wallet.color }}>Tiene tarjeta propia</div>}
                    </div>
                    <div className="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: selected ? wallet.color : "rgba(74,94,60,0.2)", background: selected ? wallet.color : "transparent" }}>
                      {selected && <span className="text-white text-[12px]">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => {
              const walletsWithCards = selectedWallets.filter(s => WALLETS.find(w => w.slug === s)?.hasCard);
              if (walletsWithCards.length > 0) {
                setCurrentWalletIdx(0);
                setStep("wallet_cards");
              } else {
                saveOnboarding();
              }
            }}
              className="w-full mt-5 py-3.5 rounded-[16px] text-[15px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.2)" }}>
              {selectedWallets.length > 0 ? "Siguiente" : "No uso billeteras — Continuar"}
            </button>
          </>
        )}

        {/* ── STEP 6: TARJETAS DE BILLETERAS ──────── */}
        {step === "wallet_cards" && (
          <>
            <button onClick={() => setStep("wallets")} className="text-[12px] font-semibold mb-3" style={{ color: "var(--blush)" }}>← Volver a billeteras</button>
            {(() => {
              const walletsWithCards = selectedWallets.filter(s => WALLETS.find(w => w.slug === s)?.hasCard);
              const walletSlug = walletsWithCards[currentWalletIdx];
              const wallet = WALLETS.find(w => w.slug === walletSlug)!;
              const selected = walletCards[walletSlug] || [];
              return (
                <>
                  <h2 className="text-[20px] font-bold mb-1" style={{ color: "var(--text)" }}>
                    Tarjeta de {wallet.name}
                  </h2>
                  <p className="text-[13px] mb-5" style={{ color: "var(--text-sec)" }}>
                    ¿Tenés la tarjeta de {wallet.name}?
                  </p>
                  <div className="flex flex-col gap-3">
                    {WALLET_CARD_TYPES.map(card => {
                      const isSelected = selected.includes(card.id);
                      return (
                        <button key={card.id} onClick={() => toggleWalletCard(walletSlug, card.id)}
                          className="flex items-center gap-3 p-4 rounded-[16px] border transition-all active:scale-[0.98]"
                          style={{
                            background: isSelected ? card.bg : "var(--surface)",
                            borderColor: isSelected ? card.color : "rgba(74,94,60,0.08)",
                            borderWidth: isSelected ? 2 : 1,
                          }}>
                          <div className="flex-1 text-left">
                            <div className="text-[15px] font-semibold" style={{ color: card.color }}>{card.name}</div>
                          </div>
                          <div className="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: isSelected ? card.color : "rgba(74,94,60,0.2)", background: isSelected ? card.color : "transparent" }}>
                            {isSelected && <span className="text-white text-[12px]">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={handleWalletCardsNext}
                    className="w-full mt-5 py-3.5 rounded-[16px] text-[15px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.2)" }}>
                    {currentWalletIdx < walletsWithCards.length - 1 ? "Siguiente billetera →" : "Listo"}
                  </button>
                  <button onClick={handleWalletCardsNext}
                    className="w-full mt-2 py-3 rounded-[14px] text-[13px] font-semibold"
                    style={{ color: "var(--text-sec)" }}>
                    No tengo tarjeta de {wallet.name}
                  </button>
                </>
              );
            })()}
          </>
        )}

        {/* ── GUARDANDO ───────────────────────────── */}
        {step === "saving" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-[32px] mb-4">🛍️</div>
            <div className="text-[18px] font-bold mb-2" style={{ color: "var(--text)" }}>Preparando tus descuentos</div>
            <div className="text-[13px]" style={{ color: "var(--text-sec)" }}>Un momento...</div>
          </div>
        )}
      </div>
    </div>
  );
}
