-- ============================================
-- -es+ Migration 00002: Catálogos maestros
-- Bancos, billeteras, ciudades
-- ============================================

-- ── Bancos ───────────────────────────────────────────────────────
CREATE TABLE banks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(50) UNIQUE NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  short_name    VARCHAR(20) NOT NULL,  -- BLP, BAPRO, Bancor, etc.
  logo_url      VARCHAR(500),
  bank_type     VARCHAR(20) NOT NULL DEFAULT 'national',  -- national | provincial | digital
  provinces     VARCHAR(100)[],  -- provincias con presencia fuerte
  card_networks VARCHAR(20)[],  -- ['visa','mastercard','amex']
  has_modo      BOOLEAN DEFAULT FALSE,
  website_url   VARCHAR(500),
  promos_url    VARCHAR(500),
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Billeteras ───────────────────────────────────────────────────
CREATE TABLE wallets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(50) UNIQUE NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  logo_url      VARCHAR(500),
  has_card      BOOLEAN DEFAULT FALSE,  -- ¿tiene tarjeta física/virtual propia?
  card_network  VARCHAR(20),  -- visa | mastercard (si has_card=true)
  card_type     VARCHAR(20),  -- prepaga | credito (si has_card=true)
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ciudades (95+ del Anexo R) ───────────────────────────────────
CREATE TABLE cities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  province        VARCHAR(100) NOT NULL,
  population      INTEGER,
  tier            VARCHAR(10),  -- piloto | tier1 | tier2 | tier3
  provincial_bank VARCHAR(50),  -- slug del banco provincial
  expansion_wave  INTEGER,  -- 1-5
  is_active       BOOLEAN DEFAULT FALSE,
  launched_at     TIMESTAMPTZ,
  discount_count  INTEGER DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, province)
);
CREATE INDEX idx_cities_province ON cities(province);
CREATE INDEX idx_cities_active ON cities(is_active);
CREATE INDEX idx_cities_tier ON cities(tier);
