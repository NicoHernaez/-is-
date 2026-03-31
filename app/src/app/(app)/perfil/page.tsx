"use client";

import { useUser } from "@/lib/user-context";

const BANK_NAMES: Record<string, string> = {
  pampa: "Banco de La Pampa", galicia: "Galicia", macro: "Macro", santander: "Santander",
  bbva: "BBVA", hsbc: "HSBC", nacion: "Banco Nación", icbc: "ICBC", hipotecario: "Hipotecario",
  supervielle: "Supervielle", comafi: "Comafi", brubank: "Brubank", sol: "Banco del Sol",
  provincia: "Banco Provincia", ciudad: "Banco Ciudad", bancor: "Bancor", santafe: "Nuevo Bco Santa Fe",
  bersa: "Bersa", tucuman: "Banco Tucumán", bpn: "Bco Provincia Neuquén",
};

const WALLET_NAMES: Record<string, string> = {
  mercadopago: "Mercado Pago", modo: "MODO", uala: "Ualá", naranjax: "Naranja X",
  personalpay: "Personal Pay", prex: "Prex", bimo: "Bimo",
};

const CARD_LABELS: Record<string, string> = {
  debit: "Débito", visa: "Visa", mastercard: "Mastercard", amex: "Amex", credit: "Crédito",
};

export default function PerfilPage() {
  const { user, logout } = useUser();
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

  return (
    <div className="px-6 pt-2">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #4A5E3C, #5D7A48)", boxShadow: "0 4px 16px rgba(74,94,60,0.15)" }}>{initial}</div>
        <div>
          <div className="text-[20px] font-bold" style={{ color: "var(--text)", fontFamily: "Georgia, serif" }}>{user.display_name}</div>
          <div className="text-[12px]" style={{ color: "var(--text-sec)" }}>{user.city}{user.province ? `, ${user.province}` : ""}</div>
          <div className="text-[11px] mt-0.5 font-semibold" style={{ color: "#16A34A" }}>
            {user.plan_tier === "free" ? "Plan Gratis · 6 meses" : "Plan Start"}
          </div>
        </div>
      </div>

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

      <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "var(--text-sec)" }}>Mis bancos</div>
      {Object.entries(bankGroups).map(([slug, cards]) => (
        <div key={slug} className="flex items-center gap-3 p-3.5 mb-2 rounded-[16px] border"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <span className="text-[20px]">🏦</span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{BANK_NAMES[slug] || slug}</div>
            <div className="text-[11px]" style={{ color: "var(--text-sec)" }}>{cards.map(c => CARD_LABELS[c] || c).join(" · ")}</div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A" }}>Activo</span>
        </div>
      ))}

      {wallets.length > 0 && (
        <>
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3 mt-4" style={{ color: "var(--text-sec)" }}>Mis billeteras</div>
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
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A" }}>Activo</span>
            </div>
          ))}
        </>
      )}

      {Object.keys(bankGroups).length === 0 && wallets.length === 0 && (
        <div className="rounded-[18px] p-5 text-center border mb-4"
          style={{ background: "var(--surface)", borderColor: "rgba(74,94,60,0.08)" }}>
          <div className="text-[13px]" style={{ color: "var(--text-sec)" }}>Completá tu onboarding por WhatsApp para ver tus medios de pago</div>
        </div>
      )}

      <div className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3 mt-6" style={{ color: "var(--text-sec)" }}>Ajustes</div>
      {["Frecuencia de Yapa", "Notificaciones", "Compartir con amiga"].map(opt => (
        <div key={opt} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(74,94,60,0.06)" }}>
          <span className="text-[13px]" style={{ color: "var(--text)" }}>{opt}</span>
          <span style={{ color: "var(--cream)" }}>›</span>
        </div>
      ))}
      <button onClick={logout} className="w-full mt-4 mb-6 py-3 rounded-[14px] text-[13px] font-semibold border"
        style={{ borderColor: "rgba(196,150,122,0.3)", color: "var(--blush)" }}>
        Cerrar sesión
      </button>
    </div>
  );
}
