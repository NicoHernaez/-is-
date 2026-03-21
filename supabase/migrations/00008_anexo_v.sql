-- ============================================
-- -es+ Migration 00008: Anexo V — Beneficios Ocultos
-- Seguros, combustible, beneficios de red
-- Schema preparado para Fase 3
-- ============================================

-- ── Catálogo de beneficios de seguros bancarios ──────────────────
CREATE TABLE insurance_benefit_catalog (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_slug           VARCHAR(50) NOT NULL,
  insurance_type      VARCHAR(50) NOT NULL,  -- hogar | auto | vida | bolso | compras | viaje
  insurance_provider  VARCHAR(100),  -- San Cristóbal, Zurich, etc.
  benefit_name        VARCHAR(200) NOT NULL,
  benefit_description TEXT,
  max_uses_per_year   INTEGER,
  estimated_value_ars DECIMAL(12, 2),
  requires_card_tier  VARCHAR(20)[],  -- gold, platinum, etc.
  requires_card_network VARCHAR(20)[],
  verification_status VARCHAR(20) DEFAULT 'unverified',
  verified_at         TIMESTAMPTZ,
  source_url          VARCHAR(500),
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ibc_bank ON insurance_benefit_catalog(bank_slug);
CREATE INDEX idx_ibc_type ON insurance_benefit_catalog(insurance_type);

-- ── Tracking de beneficios de seguros usados ─────────────────────
CREATE TABLE user_insurance_benefit_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  benefit_id      UUID NOT NULL REFERENCES insurance_benefit_catalog(id),
  used_at         DATE NOT NULL,
  value_saved     DECIMAL(12, 2),
  notes           VARCHAR(300),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_uibu_user ON user_insurance_benefit_usage(user_id);

-- ── Programas de combustible ─────────────────────────────────────
CREATE TABLE fuel_programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(50) UNIQUE NOT NULL,  -- serviclub | shell_box | axion_plus
  program_name    VARCHAR(100) NOT NULL,
  brand           VARCHAR(50) NOT NULL,  -- ypf | shell | axion
  points_per_liter DECIMAL(4, 2),
  redemption_info TEXT,
  active_promos   JSONB,
  strong_provinces VARCHAR(100)[],
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Beneficios de red Visa/Mastercard/Amex por tier ──────────────
CREATE TABLE card_network_benefits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_network        VARCHAR(20) NOT NULL,  -- visa | mastercard | amex
  card_tier           VARCHAR(20) NOT NULL,  -- classic | gold | platinum | signature | black
  benefit_name        VARCHAR(200) NOT NULL,
  benefit_description TEXT,
  benefit_category    VARCHAR(50),  -- garantia_extendida | proteccion_precios | seguro_viaje | asistencia_medica
  estimated_annual_value DECIMAL(12, 2),
  how_to_use          TEXT,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cnb_network ON card_network_benefits(card_network, card_tier);
