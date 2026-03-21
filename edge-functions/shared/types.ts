// Tipos compartidos entre Edge Functions de -es+

export interface YapaContext {
  user: {
    name: string;
    tier: string;
  };
  location: {
    city: string;
    province: string;
  };
  memory: {
    total_savings: number;
    preferred_categories: string[];
    preferred_merchants: string[];
    family_context: string | null;
    free_queries_used: number;
    free_queries_reset_at: string | null;
    notes: string | null;
  };
  payment_methods: PaymentMethod[];
  matching_promos: Promotion[];
}

export interface PaymentMethod {
  type: string; // bank_card | wallet | wallet_card | fuel_program
  bank: string | null;
  card_network: string | null;
  card_tier: string | null;
  wallet: string | null;
  fuel_program: string | null;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number | null;
  max_discount: number | null;
  merchant_name: string | null;
  merchant_category: string | null;
  required_banks: string[];
  required_cards: string[];
  required_wallets: string[];
  valid_days: string[];
  valid_from: string;
  valid_until: string;
  confidence_status: ConfidenceStatus;
  confidence_score: number;
  is_active: boolean;
}

export type ConfidenceStatus = "confirmed" | "probable" | "community" | "unconfirmed";

export interface ScrapedPromo {
  title: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  max_discount?: number;
  min_purchase?: number;
  merchant_name: string;
  merchant_category?: string;
  merchant_chain?: string;
  required_banks?: string[];
  required_cards?: string[];
  required_wallets?: string[];
  any_payment_method?: boolean;
  applies_nationwide?: boolean;
  applies_provinces?: string[];
  applies_cities?: string[];
  valid_from: string;
  valid_until: string;
  valid_days?: string[];
  source_url?: string;
}

export interface ScrapingIngestPayload {
  source_id: string;
  promos: ScrapedPromo[];
}

export interface VerificationResult {
  promo_id: string;
  old_status: ConfidenceStatus;
  new_status: ConfidenceStatus;
  new_score: number;
  reason: string;
}

export interface DailyReport {
  generated_at: string;
  users: {
    total: number;
    active_7d: number;
    new_today: number;
    onboarding_completed_rate: number;
  };
  promos: {
    total_active: number;
    by_status: Record<ConfidenceStatus, number>;
    expiring_48h: number;
  };
  scraping: {
    runs_today: number;
    success_rate: number;
    promos_new_today: number;
  };
  yapa: {
    queries_today: number;
    unique_users_today: number;
  };
  community: {
    pending_review: number;
    reports_pending: number;
  };
  alerts: Alert[];
}

export interface Alert {
  level: "red" | "yellow" | "green";
  message: string;
  timestamp: string;
}
