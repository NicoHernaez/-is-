-- ============================================
-- -es+ Migration 00007: Panel Admin
-- ============================================

CREATE TABLE admin_operators (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE,  -- Supabase Auth user id
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(20) DEFAULT 'editor',  -- superadmin | editor | viewer
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id   UUID REFERENCES admin_operators(id),
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     UUID,
  details       JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_operator ON admin_audit_log(operator_id, created_at DESC);
CREATE INDEX idx_audit_entity ON admin_audit_log(entity_type, entity_id);

CREATE TABLE admin_trust_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                DATE NOT NULL UNIQUE,
  total_promos_shown  INTEGER DEFAULT 0,
  total_promos_used   INTEGER DEFAULT 0,
  total_error_reports INTEGER DEFAULT 0,
  trust_rate          DECIMAL(5, 2),
  promos_confirmed    INTEGER DEFAULT 0,
  promos_probable     INTEGER DEFAULT 0,
  promos_community    INTEGER DEFAULT 0,
  promos_unconfirmed  INTEGER DEFAULT 0,
  active_users_7d     INTEGER DEFAULT 0,
  active_users_30d    INTEGER DEFAULT 0,
  total_savings_ars   DECIMAL(14, 2) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notification log (para auditoría) ────────────────────────────
CREATE TABLE notification_log (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel   VARCHAR(20) NOT NULL,  -- whatsapp | push | email
  msg_type  VARCHAR(50) NOT NULL,
  title     VARCHAR(300),
  body      TEXT,
  status    VARCHAR(20) DEFAULT 'sent',
  sent_at   TIMESTAMPTZ DEFAULT NOW(),
  read_at   TIMESTAMPTZ
);
CREATE INDEX idx_notif_user ON notification_log(user_id, sent_at DESC);
