import { PaymentMethod } from "./user-context";

// Bancos que operan a través de MODO — si el usuario tiene alguno,
// las promos MODO le aplican automáticamente.
const MODO_BANKS = [
  "galicia", "santander", "nacion", "macro", "bbva", "hipotecario",
  "supervielle", "patagonia", "icbc", "hsbc", "ciudad", "provincia",
  "bancor", "santafe", "bersa", "tucuman", "bpn", "chaco",
  "corrientes", "sanjuan", "chubut", "santacruz", "tierradelfuego",
  "pampa", "comafi",
];

/**
 * Dado el array de medios de pago del usuario, devuelve los slugs
 * de bancos y wallets que tiene (incluyendo MODO inferido).
 */
export function getUserPaymentSlugs(methods: PaymentMethod[]) {
  const bankSlugs = new Set<string>();
  const walletSlugs = new Set<string>();

  for (const m of methods) {
    if (m.bank_slug) bankSlugs.add(m.bank_slug);
    if (m.wallet_slug) walletSlugs.add(m.wallet_slug);
  }

  // Inferir MODO: si tiene algún banco compatible, MODO le aplica
  if (!walletSlugs.has("modo")) {
    for (const slug of bankSlugs) {
      if (MODO_BANKS.includes(slug)) {
        walletSlugs.add("modo");
        break;
      }
    }
  }

  return { bankSlugs, walletSlugs };
}

/**
 * Filtra promos que aplican al usuario según sus medios de pago.
 * Una promo aplica si:
 * - No requiere bancos ni wallets (aplica a todos), O
 * - Al menos un banco requerido está en los del usuario, O
 * - Al menos una wallet requerida está en las del usuario
 */
export function filterPromosForUser<T extends {
  required_banks: string[] | null;
  required_wallets: string[] | null;
}>(promos: T[], methods: PaymentMethod[]): T[] {
  const { bankSlugs, walletSlugs } = getUserPaymentSlugs(methods);

  return promos.filter(p => {
    const reqBanks = p.required_banks ?? [];
    const reqWallets = p.required_wallets ?? [];

    // Sin requisitos → aplica a todos
    if (reqBanks.length === 0 && reqWallets.length === 0) return true;

    // Matchea si al menos un banco o wallet coincide
    if (reqBanks.some(b => bankSlugs.has(b))) return true;
    if (reqWallets.some(w => walletSlugs.has(w))) return true;

    return false;
  });
}
