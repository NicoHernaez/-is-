-- ============================================
-- -es+ Migration 00004: WhatsApp + Yapa
-- Canal principal de la app
-- ============================================

-- ── Conversaciones WhatsApp ──────────────────────────────────────
CREATE TABLE wa_conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction         VARCHAR(10) NOT NULL,  -- inbound | outbound
  message_type      VARCHAR(20) NOT NULL,  -- text | button | list | template | image | audio
  message_text      TEXT,
  template_name     VARCHAR(100),
  wa_message_id     VARCHAR(100),  -- ID de WhatsApp para tracking
  metadata          JSONB,  -- botones elegidos, context, etc.
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wac_user ON wa_conversations(user_id, created_at DESC);
CREATE INDEX idx_wac_created ON wa_conversations(created_at DESC);

-- ── Mensajes programados ─────────────────────────────────────────
CREATE TABLE wa_scheduled_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type    VARCHAR(50) NOT NULL,
  -- weekly_summary | urgent_alert | reengagement_7d | reengagement_14d |
  -- reengagement_30d | post_onboarding_24h | conversion_pitch
  scheduled_for   TIMESTAMPTZ NOT NULL,
  template_name   VARCHAR(100),
  template_params JSONB,
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | sent | failed | cancelled
  sent_at         TIMESTAMPTZ,
  wa_message_id   VARCHAR(100),
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_was_pending ON wa_scheduled_messages(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_was_user ON wa_scheduled_messages(user_id, created_at DESC);

-- ── Yapa: memoria por usuaria ────────────────────────────────────
-- Contexto profundo que Yapa recuerda entre conversaciones
CREATE TABLE yapa_memory (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Ahorro acumulado
  total_savings_ars       DECIMAL(14, 2) DEFAULT 0,
  discounts_used_count    INTEGER DEFAULT 0,

  -- Última consulta
  last_query_text         TEXT,
  last_query_at           TIMESTAMPTZ,

  -- Perfil aprendido (se llena con el uso)
  preferred_categories    VARCHAR(50)[],  -- supermercado, farmacia, nafta, ropa...
  preferred_merchants     VARCHAR(100)[],  -- Changomás, Farmacity, YPF...
  family_context          TEXT,  -- "tiene 3 hijos en edad escolar", "vive sola"

  -- Conversión
  free_queries_used       INTEGER DEFAULT 0,
  free_queries_reset_at   TIMESTAMPTZ,
  conversion_offered      BOOLEAN DEFAULT FALSE,
  conversion_offered_at   TIMESTAMPTZ,
  conversion_declined_count INTEGER DEFAULT 0,

  -- Notas libres para Yapa
  notes                   TEXT,

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ym_user ON yapa_memory(user_id);

-- ── Yapa: registro de descuentos usados ──────────────────────────
-- "Usé el descuento de Galicia en Farmacity" → va acá
CREATE TABLE yapa_discount_usage (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  promotion_id      UUID REFERENCES promotions(id),
  custom_discount_id UUID REFERENCES user_custom_discounts(id),
  club_discount_id  UUID,  -- FK a club_discounts (se crea en 00005)
  amount_saved      DECIMAL(12, 2),
  merchant_name     VARCHAR(200),
  category          VARCHAR(50),
  source            VARCHAR(20) DEFAULT 'whatsapp',  -- whatsapp | app | auto
  user_comment      TEXT,  -- "me funcionó perfecto", "el cajero no lo conocía"
  shared_to_club    BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ydu_user ON yapa_discount_usage(user_id, created_at DESC);
CREATE INDEX idx_ydu_promo ON yapa_discount_usage(promotion_id);

-- ── AI response cache ────────────────────────────────────────────
CREATE TABLE ai_response_cache (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key         VARCHAR(500) NOT NULL,
  query_normalized  VARCHAR(500) NOT NULL,
  response_text     TEXT NOT NULL,
  city              VARCHAR(100),
  province          VARCHAR(100),
  payment_context   JSONB,  -- bancos + billeteras del user al momento del cache
  hit_count         INTEGER DEFAULT 0,
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_aic_key ON ai_response_cache(cache_key);
CREATE INDEX idx_aic_expires ON ai_response_cache(expires_at);
