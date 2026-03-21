-- ============================================
-- -es+ Migration 00003: Descuentos y promos
-- ============================================

-- ── Fuentes de datos ─────────────────────────────────────────────
CREATE TABLE sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  source_type     VARCHAR(20) NOT NULL,  -- api | scraping | manual | community
  provider        VARCHAR(100) NOT NULL,
  url             VARCHAR(500),
  scraping_config JSONB,
  is_active       BOOLEAN DEFAULT TRUE,
  reliability     DECIMAL(3, 2) DEFAULT 0.5,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Promociones ──────────────────────────────────────────────────
CREATE TABLE promotions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           UUID REFERENCES sources(id),
  external_id         VARCHAR(255),
  title               VARCHAR(500) NOT NULL,
  description         TEXT,

  -- Tipo de descuento
  discount_type       VARCHAR(20) NOT NULL,  -- percentage | fixed | installments | bogo | cashback
  discount_value      DECIMAL(10, 2),
  max_discount        DECIMAL(12, 2),
  min_purchase        DECIMAL(12, 2),
  installments        INTEGER,

  -- Medios de pago requeridos (arrays para matching)
  required_banks      VARCHAR(50)[],
  required_cards      VARCHAR(20)[],  -- visa | mastercard | amex | debit
  required_wallets    VARCHAR(50)[],
  any_payment_method  BOOLEAN DEFAULT FALSE,

  -- Comercio
  merchant_name       VARCHAR(200),
  merchant_category   VARCHAR(50),
  merchant_chain      VARCHAR(100),

  -- Ubicación
  applies_nationwide  BOOLEAN DEFAULT FALSE,
  applies_provinces   VARCHAR(100)[],
  applies_cities      VARCHAR(100)[],

  -- Vigencia
  valid_from          TIMESTAMPTZ NOT NULL,
  valid_until         TIMESTAMPTZ NOT NULL,
  valid_days          VARCHAR(3)[],  -- MON, TUE, WED, THU, FRI, SAT, SUN
  valid_time_start    TIME,
  valid_time_end      TIME,

  -- Confianza (Anexo K)
  confidence_status   VARCHAR(20) NOT NULL DEFAULT 'unconfirmed',
  confidence_score    DECIMAL(3, 2) DEFAULT 0.5,
  last_verified_at    TIMESTAMPTZ,
  verified_by         VARCHAR(50),
  error_report_count  INTEGER DEFAULT 0,

  -- Métricas
  view_count          INTEGER DEFAULT 0,
  use_count           INTEGER DEFAULT 0,
  share_count         INTEGER DEFAULT 0,

  -- Estado
  is_active           BOOLEAN DEFAULT TRUE,
  is_featured         BOOLEAN DEFAULT FALSE,
  photo_url           VARCHAR(500),  -- foto de la promo (admin o scraping)

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_promo_active ON promotions(is_active, valid_until) WHERE is_active = TRUE;
CREATE INDEX idx_promo_confidence ON promotions(confidence_status);
CREATE INDEX idx_promo_banks ON promotions USING GIN(required_banks);
CREATE INDEX idx_promo_cards ON promotions USING GIN(required_cards);
CREATE INDEX idx_promo_wallets ON promotions USING GIN(required_wallets);
CREATE INDEX idx_promo_cities ON promotions USING GIN(applies_cities);
CREATE INDEX idx_promo_days ON promotions USING GIN(valid_days);
CREATE INDEX idx_promo_dates ON promotions(valid_from, valid_until);
CREATE INDEX idx_promo_merchant ON promotions(merchant_chain);
CREATE INDEX idx_promo_category ON promotions(merchant_category);

-- ── Error reports ────────────────────────────────────────────────
CREATE TABLE error_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id    UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  report_type     VARCHAR(50) NOT NULL,  -- wrong_discount | expired | wrong_conditions | not_found
  description     TEXT,
  photo_url       VARCHAR(500),
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | reviewed | resolved
  reviewed_by     UUID,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_err_promo ON error_reports(promotion_id, created_at);
CREATE INDEX idx_err_status ON error_reports(status);

-- ── Scraping runs ────────────────────────────────────────────────
CREATE TABLE scraping_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID NOT NULL REFERENCES sources(id),
  status          VARCHAR(20) NOT NULL,  -- running | success | failed | partial
  promos_found    INTEGER DEFAULT 0,
  promos_new      INTEGER DEFAULT 0,
  promos_updated  INTEGER DEFAULT 0,
  promos_expired  INTEGER DEFAULT 0,
  error_message   TEXT,
  duration_ms     INTEGER,
  executed_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_scrape_source ON scraping_runs(source_id, executed_at DESC);

-- ── Descuentos propios de la usuaria ─────────────────────────────
CREATE TABLE user_custom_discounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  merchant_name   VARCHAR(200),
  discount_value  VARCHAR(100),
  valid_until     DATE,
  reminder_date   DATE,
  category        VARCHAR(50),
  photo_url       VARCHAR(500),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ucd_user ON user_custom_discounts(user_id);
