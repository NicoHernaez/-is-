-- ============================================
-- -es+ Migration 00006: Gamificación + Suscripciones
-- ============================================

-- ── Badges ───────────────────────────────────────────────────────
CREATE TABLE badge_definitions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(50) UNIQUE NOT NULL,
  name              VARCHAR(100) NOT NULL,
  description       VARCHAR(300) NOT NULL,
  icon_url          VARCHAR(500),
  category          VARCHAR(50),
  requirement_type  VARCHAR(50) NOT NULL,
  requirement_value DECIMAL(12, 2),
  tier              VARCHAR(20) DEFAULT 'bronze',
  is_active         BOOLEAN DEFAULT TRUE,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES badge_definitions(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  shared    BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

CREATE TABLE user_streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_activity    DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_levels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  level         INTEGER DEFAULT 1,
  level_name    VARCHAR(50) DEFAULT 'principiante',
  points        INTEGER DEFAULT 0,
  total_savings DECIMAL(14, 2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Savings log (historial de ahorro) ────────────────────────────
CREATE TABLE savings_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  promotion_id  UUID REFERENCES promotions(id),
  amount        DECIMAL(12, 2) NOT NULL,
  category      VARCHAR(50),
  description   VARCHAR(300),
  saved_at      DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_savings_user ON savings_log(user_id, saved_at DESC);

-- ── Planes de suscripción ────────────────────────────────────────
CREATE TABLE plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(50) UNIQUE NOT NULL,
  name              VARCHAR(100) NOT NULL,
  price_ars         DECIMAL(10, 2) NOT NULL,
  billing_period    VARCHAR(20) NOT NULL,
  features          JSONB NOT NULL,
  smart_queries_limit INTEGER,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id           UUID NOT NULL REFERENCES plans(id),
  status            VARCHAR(20) DEFAULT 'active',
  mp_subscription_id VARCHAR(100),
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  period_end        TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usub_user ON user_subscriptions(user_id);
