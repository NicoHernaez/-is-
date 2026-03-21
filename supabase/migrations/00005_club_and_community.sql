-- ============================================
-- -es+ Migration 00005: Club de Amigas + Comunidad
-- Promos compartidas por usuarias via WhatsApp
-- ============================================

-- ── Club de Amigas: promos subidas por usuarias ──────────────────
CREATE TABLE club_discounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by       UUID NOT NULL REFERENCES users(id),
  merchant_name     VARCHAR(200) NOT NULL,
  merchant_address  VARCHAR(300),
  merchant_category VARCHAR(50),
  description       VARCHAR(500) NOT NULL,
  discount_type     VARCHAR(20),  -- percentage | fixed | installments | bogo
  discount_value    VARCHAR(100),
  payment_method    VARCHAR(100),  -- "galicia visa" | "cualquiera" | "efectivo"
  photo_url         VARCHAR(500),  -- foto de la promo real
  city              VARCHAR(100) NOT NULL,
  province          VARCHAR(100) NOT NULL,
  valid_until       DATE,

  -- Confianza
  confidence_status VARCHAR(20) DEFAULT 'community',
  confidence_score  DECIMAL(3, 2) DEFAULT 0.50,
  confirmations     INTEGER DEFAULT 0,
  denials           INTEGER DEFAULT 0,
  operator_verified BOOLEAN DEFAULT FALSE,

  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_club_city ON club_discounts(city, province) WHERE is_active = TRUE;
CREATE INDEX idx_club_user ON club_discounts(reported_by);
CREATE INDEX idx_club_status ON club_discounts(confidence_status) WHERE is_active = TRUE;

-- ── Votos de confirmación/negación ───────────────────────────────
CREATE TABLE club_discount_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id     UUID NOT NULL REFERENCES club_discounts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  vote            VARCHAR(10) NOT NULL,  -- confirm | deny
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discount_id, user_id)
);

-- ── Perfil de exploradora (gamificación comunidad) ───────────────
CREATE TABLE explorer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  role            VARCHAR(20) DEFAULT 'reporter',  -- reporter | explorer | curator
  verified_reports INTEGER DEFAULT 0,
  current_month   INTEGER DEFAULT 0,
  zone            VARCHAR(100),
  premium_granted BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar FK de club_discount_id ahora que la tabla existe
ALTER TABLE yapa_discount_usage
  ADD CONSTRAINT fk_ydu_club FOREIGN KEY (club_discount_id) REFERENCES club_discounts(id);
