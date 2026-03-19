-- ============================================
-- -es+ Migration 00001: Core tables
-- Schema: public (no custom schemas)
-- WhatsApp-first architecture
-- ============================================

-- ── Users ────────────────────────────────────────────────────────
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id             UUID UNIQUE,  -- Supabase Auth user id
  phone               VARCHAR(20) UNIQUE,
  email               VARCHAR(255) UNIQUE,
  display_name        VARCHAR(100),
  avatar_url          VARCHAR(500),
  locale              VARCHAR(10) DEFAULT 'es-AR',
  timezone            VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
  subscription_tier   VARCHAR(20) DEFAULT 'free',  -- free | start | premium

  -- WhatsApp-first fields
  wa_phone            VARCHAR(20) UNIQUE,  -- WhatsApp number (puede diferir de phone)
  wa_opted_in         BOOLEAN DEFAULT FALSE,
  wa_frequency        VARCHAR(20) DEFAULT 'weekly',  -- biweekly | weekly | twice_weekly
  wa_preferred_hour   VARCHAR(10) DEFAULT 'morning',  -- morning | noon | evening
  wa_onboarding_step  INTEGER DEFAULT 0,
  wa_onboarding_done  BOOLEAN DEFAULT FALSE,
  wa_last_interaction TIMESTAMPTZ,
  wa_days_inactive    INTEGER DEFAULT 0,

  -- Referidos
  referral_code       VARCHAR(20) UNIQUE,
  referred_by         UUID REFERENCES users(id),

  -- Onboarding (app)
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step     INTEGER DEFAULT 0,

  last_active_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_wa_phone ON users(wa_phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tier ON users(subscription_tier);
CREATE INDEX idx_users_wa_inactive ON users(wa_days_inactive) WHERE wa_opted_in = TRUE;
CREATE INDEX idx_users_referral ON users(referral_code);

-- ── Ubicaciones ──────────────────────────────────────────────────
CREATE TABLE user_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  province    VARCHAR(100) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100),
  is_primary  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_uloc_user ON user_locations(user_id);
CREATE INDEX idx_uloc_city ON user_locations(city, province);

-- ── Medios de pago (rediseñado para flujo banco+tipo) ────────────
CREATE TABLE user_payment_methods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method_type       VARCHAR(20) NOT NULL,  -- bank_card | wallet | wallet_card | fuel_program
  -- Para bank_card:
  bank_slug         VARCHAR(50),  -- FK conceptual a banks.slug
  card_network      VARCHAR(20),  -- visa | mastercard | amex | debit
  card_tier         VARCHAR(20),  -- classic | gold | platinum | signature | black (nullable)
  -- Para wallet / wallet_card:
  wallet_slug       VARCHAR(50),  -- FK conceptual a wallets.slug
  wallet_card_network VARCHAR(20),  -- mastercard | visa (para tarjetas de billetera)
  -- Para fuel_program:
  fuel_program_slug VARCHAR(50),  -- serviclub | shell_box | axion_plus
  -- General:
  photo_url         VARCHAR(500),  -- foto de la tarjeta (opcional)
  is_active         BOOLEAN DEFAULT TRUE,
  display_order     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_upm_user ON user_payment_methods(user_id);
CREATE INDEX idx_upm_bank ON user_payment_methods(bank_slug) WHERE bank_slug IS NOT NULL;
CREATE INDEX idx_upm_wallet ON user_payment_methods(wallet_slug) WHERE wallet_slug IS NOT NULL;
CREATE INDEX idx_upm_type ON user_payment_methods(method_type);

-- ── Categorías de gasto ──────────────────────────────────────────
CREATE TABLE user_spending_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    VARCHAR(50) NOT NULL,
  priority    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usc_user ON user_spending_categories(user_id);

-- ── Obra social ──────────────────────────────────────────────────
CREATE TABLE user_health_insurance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_name   VARCHAR(100) NOT NULL,
  plan_name       VARCHAR(100),
  monthly_cost    DECIMAL(12, 2),
  family_members  INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seguros del usuario ──────────────────────────────────────────
CREATE TABLE user_insurance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insurance_type  VARCHAR(50) NOT NULL,  -- hogar | auto | vida | comercio
  provider_name   VARCHAR(100) NOT NULL,
  bank_origin     VARCHAR(50),  -- banco que vendió el seguro
  plan_name       VARCHAR(100),
  monthly_cost    DECIMAL(12, 2),
  benefits_known  BOOLEAN DEFAULT FALSE,  -- ¿sabe qué beneficios tiene?
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Preferencias de notificación ─────────────────────────────────
CREATE TABLE user_notification_prefs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  push_enabled    BOOLEAN DEFAULT TRUE,
  email_enabled   BOOLEAN DEFAULT FALSE,
  -- WhatsApp se maneja desde users.wa_* fields
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
