# -es+ / -is+ — Arquitectura Técnica Completa

## Especificación para Desarrollo — v1.0 · Febrero 2026

> **Documento de referencia para implementación.** Contiene toda la información necesaria para construir el MVP y escalar a producción. Cada decisión está fundamentada en los documentos de producto (Documento Maestro, Anexos K, L, M, N).

---

## 1. VISIÓN DEL PRODUCTO

### 1.1 Qué es -es+ / -is+

App de ahorro inteligente que centraliza descuentos bancarios, de billeteras digitales, obra social y seguros. Cruza el perfil financiero de la usuaria (tarjetas, billeteras, ubicación, categorías de gasto) con descuentos vigentes para decirle exactamente cómo gastar menos sin cambiar su rutina.

### 1.2 Naming & Internacionalización

| Variante | Idioma | Lectura |
|----------|--------|---------|
| `-es+` | Español (Argentina) | "menos es más" |
| `-is+` | Inglés / Internacional | "less is more" |

La app se construye **i18n-first** desde el día 1. El código interno usa keys de traducción, nunca strings hardcodeados. El locale por defecto es `es-AR`.

### 1.3 Asistente AI: Yapa

Yapa es la voz de la app. Tono: amiga que sabe de descuentos, nunca bot corporativo. Habla en segunda persona, con voseo argentino (locale es-AR) o tú/usted según locale.

### 1.4 Fases del Producto

| Fase | Período | Alcance |
|------|---------|---------|
| **MVP** | Mes 1-3 | Perfil + descuentos 3-5 bancos en General Pico + Pregunta Inteligente + resumen semanal. 500 usuarias piloto. |
| **Validación** | Mes 4-6 | Módulo financiero básico + obra social + Mis Descuentos Propios + WhatsApp. 3-5 ciudades. |
| **Crecimiento** | Mes 7-12 | Alcancía + Modo Viaje + Seguros + Gamificación completa. 50.000 usuarias. |
| **Escala** | Mes 13-24 | Open Banking + MP profunda + B2B datos + White-label. 500.000 usuarias. |

---

## 2. ARQUITECTURA GENERAL

### 2.1 Principio Rector

**Monolito modular para MVP → Microservicios para escala.**

No arrancar con microservicios. Monolito en NestJS con módulos bien separados internamente. Cuando un módulo necesite escalar independientemente (>50K usuarias), se extrae a microservicio.

### 2.2 Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTES                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Mobile   │  │ Web PWA  │  │ WhatsApp (Baileys/   │  │
│  │ (Expo)   │  │ (Next.js)│  │ WA Business API)     │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
└───────┼──────────────┼───────────────────┼──────────────┘
        │              │                   │
        ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                            │
│              (NestJS + Rate Limiting)                    │
│         JWT Auth · i18n Middleware · CORS                │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  MÓDULOS     │ │  MÓDULOS     │ │  MÓDULOS     │
│  CORE        │ │  NEGOCIO     │ │  INFRA       │
│              │ │              │ │              │
│ • Auth       │ │ • Discounts  │ │ • Scraping   │
│ • Users      │ │ • SmartQ     │ │ • Notif      │
│ • Profile    │ │ • Savings    │ │ • WhatsApp   │
│ • i18n       │ │ • Gamify     │ │ • Analytics  │
│ • Geo        │ │ • Community  │ │ • Admin      │
│              │ │ • Finance*   │ │ • Jobs       │
│              │ │ • Travel*    │ │ • Cache      │
│              │ │ • Insurance* │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │PostgreSQL│  │  Redis   │  │  Object Storage      │  │
│  │(Schemas) │  │ (Cache)  │  │  (S3/R2)             │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘

(* = Fase 2+, módulos preparados pero no activos en MVP)
```

### 2.3 Stack Tecnológico Definitivo

| Componente | Tecnología | Justificación |
|-----------|------------|---------------|
| **Mobile** | React Native + Expo (SDK 52+) | OTA updates, push nativo, single codebase iOS/Android |
| **Web** | Next.js 14+ (App Router, PWA) | SEO para landing, instalable, comparte lógica con mobile |
| **Backend** | NestJS 10+ (TypeScript) | Monolito modular, decorators, DI, guards, pipes |
| **DB Principal** | PostgreSQL 16 (schemas separados) | JSONB para datos flexibles, full-text search nativo |
| **Cache** | Redis 7+ | Cache de promos vigentes, sesiones, rate limiting, cola de jobs |
| **AI** | Anthropic Claude API (Sonnet) | Pregunta Inteligente, generación de tips, análisis |
| **WhatsApp MVP** | Baileys (open source) | $0 costo hasta 10K usuarias |
| **WhatsApp Escala** | WhatsApp Business API | Migración en fase 3 (>10K usuarias) |
| **Pagos** | Mercado Pago API | Suscripciones en ARS, ya integrado en ecosistema argentino |
| **Hosting MVP** | Railway / Render | Deploy en minutos, auto-scale, fracción del costo de AWS |
| **Hosting Escala** | AWS (ECS + RDS + ElastiCache) | Migrar cuando >50K usuarias |
| **Scraping** | Playwright + BullMQ (cron cada 6hs) | Headless browser para webs dinámicas de bancos |
| **Analytics** | Mixpanel (free tier) + PostHog | Retención, funnels, feature flags |
| **Object Storage** | Cloudflare R2 / AWS S3 | Imágenes de comunidad, reportes, badges |
| **Email** | Resend | Transaccional, bajo costo |
| **Monitoreo** | Sentry + Better Uptime | Errores, performance, alertas de downtime |

---

## 3. BASE DE DATOS — ESQUEMA COMPLETO

### 3.1 Esquemas PostgreSQL

```
database: esplus
├── schema: core          (auth, usuarios, perfiles)
├── schema: discounts     (descuentos, scoring, fuentes)
├── schema: community     (reportes, exploradoras, badges)
├── schema: finance       (gastos, ingresos — fase 2)
├── schema: gamification  (rachas, niveles, rankings)
├── schema: notifications (push, whatsapp, email)
├── schema: subscriptions (planes, pagos, facturación)
├── schema: ai            (cache de respuestas, prompts)
├── schema: scraping      (fuentes, ejecuciones, logs)
└── schema: admin         (operadores, dashboard, auditoría)
```

### 3.2 Tablas Core — Schema `core`

```sql
-- ============================================
-- SCHEMA: core
-- ============================================

CREATE SCHEMA IF NOT EXISTS core;

-- Tabla principal de usuarios
CREATE TABLE core.users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE,
  phone           VARCHAR(20) UNIQUE,         -- para WhatsApp
  phone_verified  BOOLEAN DEFAULT FALSE,
  auth_provider   VARCHAR(20) NOT NULL,       -- 'email', 'google', 'apple'
  auth_provider_id VARCHAR(255),
  password_hash   VARCHAR(255),               -- null si es social login
  display_name    VARCHAR(100),
  avatar_url      VARCHAR(500),
  locale          VARCHAR(10) DEFAULT 'es-AR', -- i18n: es-AR, es-UY, es-CL, en-US
  timezone        VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium', 'explorer'
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ                 -- soft delete
);

CREATE INDEX idx_users_email ON core.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON core.users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_locale ON core.users(locale);
CREATE INDEX idx_users_subscription ON core.users(subscription_tier);

-- Ubicación del usuario
CREATE TABLE core.user_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  country     VARCHAR(3) NOT NULL DEFAULT 'ARG', -- ISO 3166-1 alpha-3
  province    VARCHAR(100) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(100),
  latitude    DECIMAL(10, 8),
  longitude   DECIMAL(11, 8),
  is_primary  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_locations_user ON core.user_locations(user_id);
CREATE INDEX idx_user_locations_city ON core.user_locations(city, province);
CREATE INDEX idx_user_locations_geo ON core.user_locations USING GIST (
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL;

-- Medios de pago del usuario (NO almacena números de tarjeta)
CREATE TABLE core.user_payment_methods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  type              VARCHAR(20) NOT NULL,     -- 'credit_card', 'debit_card', 'wallet'
  provider          VARCHAR(50) NOT NULL,     -- 'visa', 'mastercard', 'amex'
  bank              VARCHAR(100),             -- 'galicia', 'macro', 'santander'
  category          VARCHAR(50),              -- 'classic', 'gold', 'platinum', 'black'
  wallet_name       VARCHAR(50),              -- 'mercadopago', 'modo', 'uala', 'naranjax'
  monthly_cost      DECIMAL(12, 2) DEFAULT 0, -- costo de mantenimiento en ARS
  is_primary        BOOLEAN DEFAULT FALSE,
  display_order     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_pm_user ON core.user_payment_methods(user_id);
CREATE INDEX idx_user_pm_bank ON core.user_payment_methods(bank);
CREATE INDEX idx_user_pm_wallet ON core.user_payment_methods(wallet_name);

-- Categorías de gasto preferidas
CREATE TABLE core.user_spending_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  category    VARCHAR(50) NOT NULL,           -- 'supermarket', 'fuel', 'pharmacy', 'kids', 'clothing', etc.
  priority    INTEGER DEFAULT 0,              -- orden de prioridad
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_spending_user ON core.user_spending_categories(user_id);

-- Obra social / prepaga del usuario (Fase 2, estructura preparada)
CREATE TABLE core.user_health_insurance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  provider_name   VARCHAR(100) NOT NULL,      -- 'OSDE', 'Swiss Medical', 'Galeno'
  plan_name       VARCHAR(100),
  monthly_cost    DECIMAL(12, 2),
  family_members  INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seguros del usuario (Fase 3, estructura preparada)
CREATE TABLE core.user_insurance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,       -- 'auto', 'home', 'life', 'card_included'
  provider_name   VARCHAR(100) NOT NULL,
  plan_name       VARCHAR(100),
  monthly_cost    DECIMAL(12, 2),
  benefits_json   JSONB,                      -- beneficios incluidos en formato flexible
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Preferencias de notificación
CREATE TABLE core.user_notification_prefs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  push_enabled    BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  email_enabled   BOOLEAN DEFAULT FALSE,
  max_push_per_week INTEGER DEFAULT 3,
  weekly_summary_day VARCHAR(3) DEFAULT 'MON', -- día del resumen semanal
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end   TIME DEFAULT '08:00',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Tablas de Descuentos — Schema `discounts`

```sql
-- ============================================
-- SCHEMA: discounts
-- ============================================

CREATE SCHEMA IF NOT EXISTS discounts;

-- Fuentes de datos de descuentos
CREATE TABLE discounts.sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,      -- 'banco_galicia_web', 'modo_api', 'community'
  type            VARCHAR(20) NOT NULL,       -- 'scraping', 'api', 'community', 'manual'
  provider        VARCHAR(100) NOT NULL,      -- 'Banco Galicia', 'MODO', 'Comunidad'
  url             VARCHAR(500),               -- URL de scraping o endpoint de API
  scraping_config JSONB,                      -- selectores CSS, frecuencia, etc.
  is_active       BOOLEAN DEFAULT TRUE,
  reliability_score DECIMAL(3, 2) DEFAULT 0.5, -- 0.0 a 1.0
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Descuentos/Promociones
CREATE TABLE discounts.promotions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id         UUID REFERENCES discounts.sources(id),
  
  -- Identificación
  external_id       VARCHAR(255),             -- ID de la fuente original
  title             VARCHAR(500) NOT NULL,
  description       TEXT,
  
  -- Condiciones
  discount_type     VARCHAR(20) NOT NULL,     -- 'percentage', 'fixed', '2x1', '3x2', 'cashback'
  discount_value    DECIMAL(10, 2),           -- valor del descuento
  max_discount      DECIMAL(12, 2),           -- tope de reintegro/descuento
  min_purchase      DECIMAL(12, 2),           -- compra mínima
  installments      INTEGER,                  -- cuotas sin interés (null si no aplica)
  
  -- Medios de pago requeridos
  required_banks    VARCHAR(100)[],           -- ['galicia', 'macro']
  required_cards    VARCHAR(50)[],            -- ['visa', 'mastercard']
  required_card_categories VARCHAR(50)[],     -- ['gold', 'platinum']
  required_wallets  VARCHAR(50)[],            -- ['mercadopago', 'modo']
  any_payment_method BOOLEAN DEFAULT FALSE,   -- si aplica a cualquier medio
  
  -- Comercio/Lugar
  merchant_name     VARCHAR(200),
  merchant_category VARCHAR(50),              -- 'supermarket', 'fuel', 'pharmacy', etc.
  merchant_chain    VARCHAR(100),             -- 'carrefour', 'coto', 'ypf'
  
  -- Ubicación geográfica
  applies_nationwide BOOLEAN DEFAULT FALSE,
  applies_provinces  VARCHAR(100)[],
  applies_cities     VARCHAR(100)[],
  
  -- Vigencia
  valid_from        TIMESTAMPTZ NOT NULL,
  valid_until       TIMESTAMPTZ NOT NULL,
  valid_days        VARCHAR(3)[],             -- ['MON', 'TUE', 'WED'] - días de la semana
  valid_time_start  TIME,
  valid_time_end    TIME,
  
  -- Scoring de confianza (Anexo K)
  confidence_status VARCHAR(20) NOT NULL DEFAULT 'unconfirmed',
  -- 'confirmed' (verde), 'probable' (amarillo), 'community' (azul), 'unconfirmed' (gris)
  confidence_score  DECIMAL(3, 2) DEFAULT 0.5, -- 0.0 a 1.0
  last_verified_at  TIMESTAMPTZ,
  verified_by       VARCHAR(50),              -- 'scraper', 'operator', 'api', 'community'
  verification_evidence VARCHAR(500),         -- link a web del banco, captura, etc.
  error_report_count INTEGER DEFAULT 0,
  
  -- Métricas
  view_count        INTEGER DEFAULT 0,
  use_count         INTEGER DEFAULT 0,        -- veces que la usuaria reportó haberlo usado
  share_count       INTEGER DEFAULT 0,
  
  -- i18n: los textos se guardan en la tabla de traducciones
  -- title y description son en el idioma de la fuente (es-AR por defecto)
  
  -- Estado
  is_active         BOOLEAN DEFAULT TRUE,
  is_featured       BOOLEAN DEFAULT FALSE,
  
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de búsqueda de descuentos
CREATE INDEX idx_promos_active ON discounts.promotions(is_active, valid_until) 
  WHERE is_active = TRUE;
CREATE INDEX idx_promos_merchant_cat ON discounts.promotions(merchant_category);
CREATE INDEX idx_promos_confidence ON discounts.promotions(confidence_status);
CREATE INDEX idx_promos_banks ON discounts.promotions USING GIN(required_banks);
CREATE INDEX idx_promos_wallets ON discounts.promotions USING GIN(required_wallets);
CREATE INDEX idx_promos_cities ON discounts.promotions USING GIN(applies_cities);
CREATE INDEX idx_promos_days ON discounts.promotions USING GIN(valid_days);
CREATE INDEX idx_promos_valid_dates ON discounts.promotions(valid_from, valid_until);
CREATE INDEX idx_promos_merchant_chain ON discounts.promotions(merchant_chain);

-- Traducciones de descuentos (i18n)
CREATE TABLE discounts.promotion_translations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id    UUID NOT NULL REFERENCES discounts.promotions(id) ON DELETE CASCADE,
  locale          VARCHAR(10) NOT NULL,       -- 'es-AR', 'en-US', 'es-UY'
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  UNIQUE(promotion_id, locale)
);

-- Reportes de error de descuentos (Anexo K: "Reportar error")
CREATE TABLE discounts.error_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id    UUID NOT NULL REFERENCES discounts.promotions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES core.users(id),
  report_type     VARCHAR(50) NOT NULL,       -- 'expired', 'wrong_discount', 'wrong_merchant', 'not_accepted'
  description     TEXT,
  photo_url       VARCHAR(500),
  status          VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'dismissed'
  reviewed_by     UUID,                       -- operador que revisó
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_reports_promo ON discounts.error_reports(promotion_id, created_at);
CREATE INDEX idx_error_reports_status ON discounts.error_reports(status);

-- Historial de scraping
CREATE TABLE discounts.scraping_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID NOT NULL REFERENCES discounts.sources(id),
  status          VARCHAR(20) NOT NULL,       -- 'success', 'partial', 'failed'
  promotions_found INTEGER DEFAULT 0,
  promotions_new   INTEGER DEFAULT 0,
  promotions_updated INTEGER DEFAULT 0,
  promotions_expired INTEGER DEFAULT 0,
  error_message   TEXT,
  duration_ms     INTEGER,
  executed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraping_runs_source ON discounts.scraping_runs(source_id, executed_at DESC);

-- Descuentos propios de la usuaria (Mis Descuentos Propios)
CREATE TABLE discounts.user_custom_discounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  merchant_name   VARCHAR(200),
  discount_value  VARCHAR(100),               -- texto libre: "10%", "3x2", "$5.000 menos"
  valid_until     DATE,
  reminder_date   DATE,                       -- cuándo recordar renovación
  category        VARCHAR(50),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_custom_user ON discounts.user_custom_discounts(user_id);
```

### 3.4 Tablas de Comunidad — Schema `community`

```sql
-- ============================================
-- SCHEMA: community
-- ============================================

CREATE SCHEMA IF NOT EXISTS community;

-- Reportes de descuentos de la comunidad (efecto Waze)
CREATE TABLE community.discount_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id),
  merchant_name   VARCHAR(200) NOT NULL,
  merchant_address VARCHAR(300),
  merchant_category VARCHAR(50),
  discount_description VARCHAR(500) NOT NULL,
  payment_method  VARCHAR(100),               -- "Modo", "efectivo", "cualquiera"
  photo_url       VARCHAR(500),
  
  -- Validación
  confirmations   INTEGER DEFAULT 0,          -- cuántas usuarias lo confirmaron
  denials         INTEGER DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'reported', -- 'reported', 'confirmed', 'denied', 'expired'
  operator_verified BOOLEAN DEFAULT FALSE,
  
  -- Ubicación
  city            VARCHAR(100) NOT NULL,
  province        VARCHAR(100) NOT NULL,
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  
  valid_until     DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_reports_city ON community.discount_reports(city, status);
CREATE INDEX idx_community_reports_user ON community.discount_reports(user_id);

-- Confirmaciones/negaciones de reportes
CREATE TABLE community.report_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES community.discount_reports(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES core.users(id),
  vote            VARCHAR(10) NOT NULL,       -- 'confirm', 'deny'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- Programa Exploradoras -es+ (Anexo L)
CREATE TABLE community.explorer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE UNIQUE,
  role            VARCHAR(20) DEFAULT 'reporter', -- 'reporter', 'explorer', 'curator'
  verified_reports_count INTEGER DEFAULT 0,
  current_month_reports INTEGER DEFAULT 0,
  zone            VARCHAR(100),               -- zona asignada (para curadoras)
  is_premium_granted BOOLEAN DEFAULT FALSE,   -- premium gratis por explorar
  promoted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 Tablas de Gamificación — Schema `gamification`

```sql
-- ============================================
-- SCHEMA: gamification
-- ============================================

CREATE SCHEMA IF NOT EXISTS gamification;

-- Definición de badges
CREATE TABLE gamification.badge_definitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(50) UNIQUE NOT NULL,  -- 'first_save', 'super_saver_100k', 'truth_guardian'
  name_key        VARCHAR(100) NOT NULL,        -- i18n key: 'badges.first_save.name'
  description_key VARCHAR(100) NOT NULL,        -- i18n key: 'badges.first_save.description'
  icon_url        VARCHAR(500),
  category        VARCHAR(50),                  -- 'saving', 'community', 'streak', 'social'
  requirement_type VARCHAR(50) NOT NULL,         -- 'savings_amount', 'streak_days', 'reports_count', etc.
  requirement_value DECIMAL(12, 2),
  tier            VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'diamond'
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Badges obtenidos por usuarias
CREATE TABLE gamification.user_badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  badge_id        UUID NOT NULL REFERENCES gamification.badge_definitions(id),
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  shared          BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON gamification.user_badges(user_id);

-- Rachas de ahorro
CREATE TABLE gamification.user_streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE UNIQUE,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Niveles de usuario
CREATE TABLE gamification.user_levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE UNIQUE,
  level           INTEGER DEFAULT 1,          -- 1-5 (Principiante → Maestra)
  level_name      VARCHAR(50) DEFAULT 'principiante',
  points          INTEGER DEFAULT 0,
  total_savings   DECIMAL(14, 2) DEFAULT 0,   -- ahorro acumulado declarado
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Ahorro declarado por la usuaria (para contador y gamificación)
CREATE TABLE gamification.savings_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  promotion_id    UUID REFERENCES discounts.promotions(id),
  amount          DECIMAL(12, 2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'ARS',
  category        VARCHAR(50),
  description     VARCHAR(300),
  saved_at        DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_savings_log_user ON gamification.savings_log(user_id, saved_at DESC);
CREATE INDEX idx_savings_log_month ON gamification.savings_log(user_id, date_trunc('month', saved_at));
```

### 3.6 Tablas de Suscripción — Schema `subscriptions`

```sql
-- ============================================
-- SCHEMA: subscriptions
-- ============================================

CREATE SCHEMA IF NOT EXISTS subscriptions;

-- Planes de suscripción
CREATE TABLE subscriptions.plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(50) UNIQUE NOT NULL,  -- 'free', 'premium_monthly', 'premium_annual'
  name_key        VARCHAR(100) NOT NULL,        -- i18n key
  price_ars       DECIMAL(10, 2) NOT NULL,      -- precio en ARS
  billing_period  VARCHAR(20) NOT NULL,         -- 'monthly', 'annual', 'free'
  features_json   JSONB NOT NULL,               -- features incluidas
  smart_queries_limit INTEGER,                  -- null = ilimitado
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Suscripciones activas
CREATE TABLE subscriptions.user_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  plan_id           UUID NOT NULL REFERENCES subscriptions.plans(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'trial'
  mp_subscription_id VARCHAR(100),             -- ID de suscripción en Mercado Pago
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  cancellation_reason VARCHAR(200),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subs_user ON subscriptions.user_subscriptions(user_id);
CREATE INDEX idx_user_subs_status ON subscriptions.user_subscriptions(status);

-- Uso de Pregunta Inteligente (para control de límites freemium)
CREATE TABLE subscriptions.smart_query_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  query_text      TEXT NOT NULL,
  response_text   TEXT,
  tokens_used     INTEGER,
  cost_usd        DECIMAL(8, 6),
  cache_hit       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_smart_query_user_month ON subscriptions.smart_query_usage(
  user_id, date_trunc('month', created_at)
);
```

### 3.7 Tablas de AI — Schema `ai`

```sql
-- ============================================
-- SCHEMA: ai
-- ============================================

CREATE SCHEMA IF NOT EXISTS ai;

-- Cache de respuestas de IA (Anexo L: cache predictivo)
CREATE TABLE ai.response_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key       VARCHAR(500) NOT NULL,      -- hash de: locale + city + category + payment_methods + query_normalized
  query_normalized VARCHAR(500) NOT NULL,      -- versión normalizada de la pregunta
  response_text   TEXT NOT NULL,
  locale          VARCHAR(10) NOT NULL,
  city            VARCHAR(100),
  province        VARCHAR(100),
  relevant_promotions UUID[],                 -- IDs de promos referenciadas
  hit_count       INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_cache_key ON ai.response_cache(cache_key);
CREATE INDEX idx_ai_cache_expires ON ai.response_cache(expires_at);

-- Templates de prompts para Yapa
CREATE TABLE ai.prompt_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(100) UNIQUE NOT NULL, -- 'smart_query_level1', 'weekly_summary', 'savings_tip'
  template        TEXT NOT NULL,               -- template con {{variables}}
  locale          VARCHAR(10) NOT NULL DEFAULT 'es-AR',
  version         INTEGER DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.8 Tablas de Notificaciones — Schema `notifications`

```sql
-- ============================================
-- SCHEMA: notifications
-- ============================================

CREATE SCHEMA IF NOT EXISTS notifications;

CREATE TABLE notifications.notification_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  channel         VARCHAR(20) NOT NULL,       -- 'push', 'whatsapp', 'email', 'in_app'
  type            VARCHAR(50) NOT NULL,       -- 'weekly_summary', 'urgent_promo', 'streak_reminder', etc.
  title           VARCHAR(300),
  body            TEXT,
  data_json       JSONB,                      -- payload adicional
  status          VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  read_at         TIMESTAMPTZ
);

CREATE INDEX idx_notif_user ON notifications.notification_log(user_id, sent_at DESC);
CREATE INDEX idx_notif_type ON notifications.notification_log(type, sent_at DESC);
```

### 3.9 Tablas de Admin — Schema `admin`

```sql
-- ============================================
-- SCHEMA: admin
-- ============================================

CREATE SCHEMA IF NOT EXISTS admin;

-- Operadores del dashboard interno
CREATE TABLE admin.operators (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  role            VARCHAR(20) DEFAULT 'editor', -- 'editor', 'admin', 'superadmin'
  password_hash   VARCHAR(255) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Log de acciones del operador
CREATE TABLE admin.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id     UUID REFERENCES admin.operators(id),
  action          VARCHAR(100) NOT NULL,      -- 'verify_promo', 'dismiss_report', 'update_source'
  entity_type     VARCHAR(50),
  entity_id       UUID,
  details_json    JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas diarias de confianza (Anexo K: Tasa de confianza)
CREATE TABLE admin.trust_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date            DATE NOT NULL UNIQUE,
  total_promos_shown INTEGER DEFAULT 0,
  total_promos_used  INTEGER DEFAULT 0,
  total_error_reports INTEGER DEFAULT 0,
  trust_rate      DECIMAL(5, 2),              -- (usados correctamente / usados totales) * 100
  promos_confirmed INTEGER DEFAULT 0,
  promos_probable  INTEGER DEFAULT 0,
  promos_community INTEGER DEFAULT 0,
  promos_unconfirmed INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. SISTEMA DE INTERNACIONALIZACIÓN (i18n)

### 4.1 Estrategia

La app se construye **i18n-first**. Ningún texto visible al usuario se hardcodea. Todo pasa por el sistema de traducciones.

### 4.2 Estructura de archivos de traducción

```
src/
├── i18n/
│   ├── locales/
│   │   ├── es-AR.json    (Argentina — default)
│   │   ├── es-UY.json    (Uruguay — fase 4)
│   │   ├── es-CL.json    (Chile — fase 4)
│   │   ├── en-US.json    (English — fase 4)
│   │   └── pt-BR.json    (Brasil — futuro)
│   ├── i18n.config.ts
│   └── useTranslation.ts  (hook para React Native)
```

### 4.3 Formato de claves

```json
{
  "app": {
    "name": "-es+",
    "tagline": "Menos ruido, más ahorro"
  },
  "onboarding": {
    "step1_title": "¿Dónde vivís?",
    "step4_title": "¿Qué tarjetas tenés?",
    "step7_message": "¡Listo! Mañana con tu {{card}} tenés {{discount}}% en {{merchant}}."
  },
  "home": {
    "savings_counter": "${{amount}} ahorrados este mes",
    "weekly_tip": "En {{province}} esta semana lo mejor es {{categories}}"
  },
  "yapa": {
    "greeting": "¡Hola! Soy Yapa, tu asistente de ahorro. ¿En qué te puedo ayudar?",
    "smart_query_placeholder": "¿Qué necesitás comprar?"
  },
  "discounts": {
    "confidence": {
      "confirmed": "Confirmado {{time}}",
      "probable": "Probable, verificado {{time}}",
      "community": "Reportado por {{count}} usuarias",
      "unconfirmed": "Sin confirmar"
    },
    "report_error": "Reportar error",
    "last_day": "¡Último día!"
  },
  "subscription": {
    "price_monthly": "${{price}}/mes",
    "value_prop": "Menos que un café con medialunas",
    "upgrade_prompt": "Desbloqueá esto por ${{price}}/mes"
  },
  "gamification": {
    "streak": "¡{{days}} días seguidos! No pierdas tu racha.",
    "badge_earned": "¡Desbloqueaste {{badge}}!"
  },
  "errors": {
    "network": "Sin conexión. Intentá de nuevo.",
    "generic": "Algo salió mal. Intentá de nuevo."
  }
}
```

### 4.4 Reglas de i18n

1. **Locale se determina**: por el campo `locale` del usuario en DB, NO por el dispositivo.
2. **Fallback chain**: `es-AR` → `es` → `en-US`.
3. **Moneda**: siempre la local del usuario. ARS para Argentina, UYU para Uruguay, CLP para Chile.
4. **Formato de números**: `Intl.NumberFormat` con el locale del usuario.
5. **Fechas**: `date-fns` con locale adapter.
6. **Yapa habla en el idioma del usuario**: los prompts de AI incluyen instrucción de idioma.
7. **Descuentos se muestran en idioma original** salvo que exista traducción.

---

## 5. MÓDULOS DEL BACKEND (NestJS)

### 5.1 Estructura de carpetas

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/                    # Compartido
│   │   ├── decorators/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── premium.guard.ts
│   │   │   └── admin.guard.ts
│   │   ├── interceptors/
│   │   │   ├── i18n.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   └── utils/
│   │       ├── currency.util.ts
│   │       └── date.util.ts
│   │
│   ├── config/                    # Configuración
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── ai.config.ts
│   │   ├── mercadopago.config.ts
│   │   └── whatsapp.config.ts
│   │
│   ├── modules/
│   │   ├── auth/                  # Autenticación
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── google.strategy.ts
│   │   │   │   └── apple.strategy.ts
│   │   │   └── dto/
│   │   │
│   │   ├── users/                 # Usuarios y perfiles
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── profile.service.ts
│   │   │   ├── entities/
│   │   │   └── dto/
│   │   │
│   │   ├── discounts/             # Descuentos y scoring
│   │   │   ├── discounts.module.ts
│   │   │   ├── discounts.controller.ts
│   │   │   ├── discounts.service.ts
│   │   │   ├── scoring.service.ts        # Sistema de scoring de confianza
│   │   │   ├── matching.service.ts       # Cruza descuentos con perfil usuario
│   │   │   ├── error-reports.controller.ts
│   │   │   ├── error-reports.service.ts
│   │   │   ├── custom-discounts.controller.ts
│   │   │   ├── custom-discounts.service.ts
│   │   │   ├── entities/
│   │   │   └── dto/
│   │   │
│   │   ├── smart-query/           # Pregunta Inteligente (Yapa AI)
│   │   │   ├── smart-query.module.ts
│   │   │   ├── smart-query.controller.ts
│   │   │   ├── smart-query.service.ts
│   │   │   ├── ai-client.service.ts      # Wrapper de Claude API
│   │   │   ├── cache.service.ts          # Cache predictivo
│   │   │   ├── prompt-builder.service.ts # Construye prompts con contexto
│   │   │   └── dto/
│   │   │
│   │   ├── community/             # Comunidad y Exploradoras
│   │   │   ├── community.module.ts
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   ├── explorers.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── gamification/          # Rachas, badges, niveles
│   │   │   ├── gamification.module.ts
│   │   │   ├── gamification.controller.ts
│   │   │   ├── gamification.service.ts
│   │   │   ├── badges.service.ts
│   │   │   ├── streaks.service.ts
│   │   │   ├── levels.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── subscriptions/         # Suscripciones y pagos
│   │   │   ├── subscriptions.module.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   ├── mercadopago.service.ts
│   │   │   ├── webhooks.controller.ts    # MP webhooks
│   │   │   └── dto/
│   │   │
│   │   ├── notifications/         # Push, WhatsApp, Email
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── push.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── templates/
│   │   │       ├── weekly-summary.ts
│   │   │       └── urgent-alert.ts
│   │   │
│   │   ├── scraping/              # Motor de scraping
│   │   │   ├── scraping.module.ts
│   │   │   ├── scraping.service.ts
│   │   │   ├── scrapers/
│   │   │   │   ├── base.scraper.ts
│   │   │   │   ├── galicia.scraper.ts
│   │   │   │   ├── macro.scraper.ts
│   │   │   │   ├── pampa.scraper.ts
│   │   │   │   ├── modo.scraper.ts
│   │   │   │   └── mercadopago.scraper.ts
│   │   │   ├── scheduler.service.ts      # Cron jobs cada 6hs
│   │   │   └── dto/
│   │   │
│   │   ├── admin/                 # Dashboard interno del operador
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── verification.service.ts   # Checklist diario del operador
│   │   │   ├── trust-metrics.service.ts  # Tasa de confianza
│   │   │   └── dto/
│   │   │
│   │   ├── analytics/             # Métricas y KPIs (Anexo K)
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── kpi.service.ts
│   │   │   └── dto/
│   │   │
│   │   └── i18n/                  # Internacionalización
│   │       ├── i18n.module.ts
│   │       ├── i18n.service.ts
│   │       └── locales/
│   │
│   └── jobs/                      # Background jobs (BullMQ)
│       ├── scraping.job.ts
│       ├── weekly-summary.job.ts
│       ├── confidence-check.job.ts   # Verificar descuentos >48hs sin confirmar
│       ├── auto-expire.job.ts        # Expirar promos vencidas
│       └── ai-cache-warmup.job.ts    # Cache predictivo de IA
│
├── prisma/                        # (o TypeORM migrations)
│   ├── schema.prisma
│   └── migrations/
│
├── test/
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### 5.2 Background Jobs Críticos

| Job | Frecuencia | Descripción |
|-----|-----------|-------------|
| `scraping.job` | Cada 6 horas | Ejecuta scrapers de bancos y billeteras |
| `confidence-check.job` | Cada 1 hora | Descuentos "confirmados" con >48hs sin verificar → bajan a "probable" |
| `auto-expire.job` | Cada 1 hora | Descuentos pasados de `valid_until` → `is_active = false` |
| `auto-unconfirm.job` | Tiempo real (trigger) | 3+ reportes de error en 24hs → baja a "unconfirmed" |
| `weekly-summary.job` | Lunes 8:00 AM | Genera y envía resumen semanal por push/WhatsApp |
| `ai-cache-warmup.job` | Domingo noche | Pre-genera respuestas IA para consultas probables de la semana |
| `trust-metrics.job` | Diario 23:00 | Calcula y guarda tasa de confianza diaria |
| `streak-check.job` | Diario 00:05 | Actualiza rachas de ahorro |

---

## 6. API ENDPOINTS

### 6.1 Auth

```
POST   /api/v1/auth/register          # Registro email/password
POST   /api/v1/auth/login             # Login email/password
POST   /api/v1/auth/google            # Login con Google
POST   /api/v1/auth/apple             # Login con Apple
POST   /api/v1/auth/refresh           # Refresh token
POST   /api/v1/auth/forgot-password   # Recuperar contraseña
POST   /api/v1/auth/verify-phone      # Verificar teléfono (WhatsApp)
```

### 6.2 Users & Profile

```
GET    /api/v1/users/me               # Perfil del usuario
PATCH  /api/v1/users/me               # Actualizar perfil
DELETE /api/v1/users/me               # Eliminar cuenta

# Onboarding
PATCH  /api/v1/users/me/onboarding    # Guardar paso de onboarding
POST   /api/v1/users/me/onboarding/complete

# Ubicación
GET    /api/v1/users/me/locations
POST   /api/v1/users/me/locations
PATCH  /api/v1/users/me/locations/:id
DELETE /api/v1/users/me/locations/:id

# Medios de pago
GET    /api/v1/users/me/payment-methods
POST   /api/v1/users/me/payment-methods
PATCH  /api/v1/users/me/payment-methods/:id
DELETE /api/v1/users/me/payment-methods/:id

# Categorías de gasto
GET    /api/v1/users/me/spending-categories
PUT    /api/v1/users/me/spending-categories   # Reemplaza todas

# Preferencias de notificación
GET    /api/v1/users/me/notification-prefs
PATCH  /api/v1/users/me/notification-prefs
```

### 6.3 Descuentos

```
GET    /api/v1/discounts                      # Listado con filtros
GET    /api/v1/discounts/personalized         # Descuentos para MIS medios de pago [PREMIUM]
GET    /api/v1/discounts/today                # Descuentos de hoy en mi zona
GET    /api/v1/discounts/week                 # Próximos 7 días
GET    /api/v1/discounts/:id                  # Detalle de un descuento
POST   /api/v1/discounts/:id/report-error     # Reportar error
POST   /api/v1/discounts/:id/used             # Marcar como usado (suma ahorro)

# Filtros soportados via query params:
# ?city=general-pico&category=supermarket&bank=galicia&wallet=modo
# ?day=MON&confidence=confirmed&page=1&limit=20

# Mis Descuentos Propios
GET    /api/v1/discounts/custom               # Listar mis descuentos propios
POST   /api/v1/discounts/custom               # Crear descuento propio
PATCH  /api/v1/discounts/custom/:id
DELETE /api/v1/discounts/custom/:id
```

### 6.4 Pregunta Inteligente

```
POST   /api/v1/smart-query                    # Hacer una pregunta [2/mes FREE, ilimitado PREMIUM]
GET    /api/v1/smart-query/history             # Historial de preguntas
GET    /api/v1/smart-query/usage               # Uso del mes actual (para free tier)
```

### 6.5 Comunidad

```
GET    /api/v1/community/reports               # Reportes de mi zona
POST   /api/v1/community/reports               # Reportar descuento local
POST   /api/v1/community/reports/:id/vote      # Confirmar o negar un reporte
GET    /api/v1/community/explorers/me          # Mi perfil de Exploradora
GET    /api/v1/community/explorers/leaderboard # Ranking de zona
```

### 6.6 Gamificación

```
GET    /api/v1/gamification/me                 # Mi resumen (nivel, racha, puntos)
GET    /api/v1/gamification/badges             # Todos los badges disponibles
GET    /api/v1/gamification/badges/earned      # Mis badges obtenidos
GET    /api/v1/gamification/streak             # Mi racha actual
GET    /api/v1/gamification/savings            # Resumen de ahorro (mensual, total)
POST   /api/v1/gamification/savings            # Registrar ahorro manual
GET    /api/v1/gamification/rankings           # Ranking de mi zona [anonimizado]
```

### 6.7 Suscripciones

```
GET    /api/v1/subscriptions/plans             # Planes disponibles
GET    /api/v1/subscriptions/me                # Mi suscripción actual
POST   /api/v1/subscriptions/checkout          # Iniciar checkout con Mercado Pago
POST   /api/v1/subscriptions/cancel            # Cancelar suscripción
POST   /api/v1/webhooks/mercadopago            # Webhook de MP (público)
```

### 6.8 Notificaciones

```
GET    /api/v1/notifications                   # Mis notificaciones
PATCH  /api/v1/notifications/:id/read          # Marcar como leída
POST   /api/v1/notifications/register-push     # Registrar token de push
```

### 6.9 Home

```
GET    /api/v1/home                            # Datos del home (savings counter, top tips, weekly tip)
GET    /api/v1/home/weekly-summary             # Resumen semanal
```

### 6.10 Admin (protegido)

```
POST   /api/v1/admin/auth/login

GET    /api/v1/admin/dashboard                 # Métricas generales
GET    /api/v1/admin/dashboard/trust           # Tasa de confianza
GET    /api/v1/admin/dashboard/kpis            # KPIs del Anexo K

GET    /api/v1/admin/discounts                 # Gestión de descuentos
PATCH  /api/v1/admin/discounts/:id/verify      # Verificar descuento
PATCH  /api/v1/admin/discounts/:id/status      # Cambiar estado de confianza

GET    /api/v1/admin/error-reports             # Reportes de error pendientes
PATCH  /api/v1/admin/error-reports/:id         # Resolver reporte

GET    /api/v1/admin/scraping/status           # Estado de scrapers
POST   /api/v1/admin/scraping/:sourceId/run    # Ejecutar scraper manualmente

GET    /api/v1/admin/community/reports         # Reportes de comunidad pendientes
PATCH  /api/v1/admin/community/reports/:id     # Aprobar/rechazar reporte
```

---

## 7. FRONTEND MOBILE (Expo / React Native)

### 7.1 Estructura de carpetas

```
mobile/
├── app/                           # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/
│   │   ├── index.tsx              # Step controller
│   │   ├── location.tsx
│   │   ├── cards.tsx
│   │   ├── wallets.tsx
│   │   ├── categories.tsx
│   │   └── first-tip.tsx
│   ├── (tabs)/
│   │   ├── index.tsx              # Home
│   │   ├── discounts.tsx          # Descuentos
│   │   ├── yapa.tsx               # Pregunta Inteligente
│   │   ├── community.tsx          # Comunidad
│   │   └── profile.tsx            # Perfil
│   ├── discount/[id].tsx          # Detalle de descuento
│   ├── settings/
│   │   ├── payment-methods.tsx
│   │   ├── notifications.tsx
│   │   └── subscription.tsx
│   └── _layout.tsx
│
├── components/
│   ├── ui/                        # Design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ConfidenceBadge.tsx    # Verde/Amarillo/Azul/Gris
│   │   ├── SavingsCounter.tsx     # Animado
│   │   ├── DiscountCard.tsx
│   │   ├── TipStory.tsx           # Tarjeta tipo story
│   │   └── YapaFAB.tsx            # Botón flotante de Yapa
│   ├── forms/
│   ├── layouts/
│   └── modals/
│       ├── ReportErrorModal.tsx
│       ├── PaywallModal.tsx       # "Desbloqueá por $1.500/mes"
│       └── BadgeEarnedModal.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDiscounts.ts
│   ├── useSmartQuery.ts
│   ├── useSavings.ts
│   ├── useSubscription.ts
│   └── useTranslation.ts
│
├── services/
│   ├── api.ts                     # Axios/fetch wrapper
│   ├── auth.service.ts
│   ├── discounts.service.ts
│   ├── smart-query.service.ts
│   └── analytics.service.ts
│
├── store/                         # Zustand
│   ├── auth.store.ts
│   ├── user.store.ts
│   ├── discounts.store.ts
│   └── app.store.ts
│
├── i18n/
│   ├── locales/
│   │   ├── es-AR.json
│   │   └── en-US.json
│   └── index.ts
│
├── theme/
│   ├── colors.ts                  # Paleta -is+
│   ├── typography.ts              # Fonts del brand
│   ├── spacing.ts
│   └── index.ts
│
├── assets/
│   ├── fonts/
│   │   ├── Lora-Bold.ttf
│   │   ├── Lora-SemiBold.ttf
│   │   ├── Lora-Regular.ttf
│   │   ├── SourceSans3-Regular.ttf
│   │   └── SourceSans3-SemiBold.ttf
│   ├── images/
│   │   ├── bank-logos/
│   │   ├── wallet-logos/
│   │   └── badges/
│   └── animations/                # Lottie para confeti, contador, etc.
│
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

### 7.2 Design System — Paleta de Marca (Sage & Blush)

```typescript
// theme/colors.ts
export const colors = {
  // Brand principal — Paleta "Sage & Blush"
  primary: '#4A5E3C',        // Verde salvia oscuro — headers, CTAs, textos principales
  primaryLight: '#5D7A48',   // Verde salvia medio — gradientes, hovers
  blush: '#C4967A',          // Rosa empolvado — acentos, CTAs secundarios, highlights
  blushLight: '#D4AA92',     // Rosa claro — estados hover del blush
  sage: '#8A9A6F',           // Verde salvia claro — iconos, textos secundarios
  muted: '#B5B99A',          // Verde gris — bordes suaves, fondos terciarios
  cream: '#D8D2C2',          // Beige cálido — separadores, bordes suaves
  bg: '#F8F5F1',             // Crema suave — fondo principal de la app
  bgDark: '#F0EBE4',         // Crema oscuro — fondo alternativo, secciones

  // Variaciones para gradientes
  primaryGrad: 'linear-gradient(135deg, #4A5E3C, #5D7A48)',
  blushGlow: 'rgba(196,150,122,0.15)',       // Para box-shadow sutil
  blushGlowStrong: 'rgba(196,150,122,0.25)', // Para hover glow

  // Scoring de confianza (Anexo K)
  confidence: {
    confirmed: '#16A34A',    // Verde — confirmado (ligeramente más oscuro para mejor contraste)
    probable: '#D97706',     // Ámbar — probable
    community: '#2563EB',    // Azul — reportado por comunidad
    unconfirmed: '#9CA3AF',  // Gris — sin confirmar
  },

  // Semánticos
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',

  // Textos
  text: '#3A3A32',           // Texto principal — casi negro cálido
  textSecondary: '#9A8A7A',  // Texto secundario — gris cálido

  // Superficies
  surface: '#FFFFFF',        // Cards, inputs, modales
  border: 'rgba(74,94,60,0.08)',       // Bordes por defecto
  borderHover: 'rgba(196,150,122,0.3)', // Bordes en hover (glow blush)

  // Neutros
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: {
    50: '#FAFAF7',
    100: '#F3F1ED',
    200: '#E5E2DC',
    300: '#D1CEC7',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};
```

### 7.2.1 Uso de la paleta — Guía rápida

| Elemento | Color | Hex |
|----------|-------|-----|
| Headers, CTAs primarios, textos principales | Primary (Verde salvia) | #4A5E3C |
| Gradientes, hovers de primary | Primary Light | #5D7A48 |
| Acentos, CTAs secundarios, highlights, FABs | Blush (Rosa empolvado) | #C4967A |
| Categorías de gasto seleccionadas, badges | Blush | #C4967A |
| Textos secundarios, iconos | Sage (Verde claro) | #8A9A6F |
| Fondos terciarios, bordes suaves | Muted | #B5B99A |
| Separadores | Cream | #D8D2C2 |
| Fondo principal de la app | Background | #F8F5F1 |
| Cards, modales, inputs | Surface (White) | #FFFFFF |
| Glow en hover de cards | Blush Glow | rgba(196,150,122,0.15) |
| Logo: signo "-" | Cream (#D8D2C2) | |
| Logo: letras "es" | Primary (#4A5E3C) | |
| Logo: signo "+" | Blush (#C4967A) | |

```typescript
// theme/typography.ts
export const typography = {
  logo: {
    fontFamily: 'Lora-Bold',  // Serif orgánica, cálida — para el logo -es+
  },
  heading: {
    fontFamily: 'Lora-SemiBold', // Consistencia con el logo
  },
  body: {
    fontFamily: 'SourceSans3-Regular', // Sans-serif limpia, altamente legible
  },
  bodyBold: {
    fontFamily: 'SourceSans3-SemiBold',
  },
  // Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
};
```

---

## 8. SCORING DE CONFIANZA — Implementación (Anexo K)

### 8.1 Lógica del Score

```typescript
// scoring.service.ts
interface ConfidenceInput {
  sourceType: 'api' | 'scraping' | 'community' | 'manual';
  lastVerifiedAt: Date;
  evidenceType: 'bank_url' | 'screenshot' | 'official_text' | 'user_report' | 'none';
  errorReportsLast24h: number;
}

type ConfidenceStatus = 'confirmed' | 'probable' | 'community' | 'unconfirmed';

function calculateConfidence(input: ConfidenceInput): { status: ConfidenceStatus; score: number } {
  const hoursSinceVerification = diffInHours(new Date(), input.lastVerifiedAt);

  // Regla automática: 3+ reportes de error → sin confirmar
  if (input.errorReportsLast24h >= 3) {
    return { status: 'unconfirmed', score: 0.1 };
  }

  // Fuente API oficial → alta confianza
  if (input.sourceType === 'api') {
    if (hoursSinceVerification <= 24) return { status: 'confirmed', score: 0.95 };
    if (hoursSinceVerification <= 72) return { status: 'probable', score: 0.7 };
    return { status: 'unconfirmed', score: 0.3 };
  }

  // Fuente scraping
  if (input.sourceType === 'scraping') {
    if (hoursSinceVerification <= 24 && input.evidenceType !== 'none') {
      return { status: 'confirmed', score: 0.85 };
    }
    if (hoursSinceVerification <= 72) return { status: 'probable', score: 0.6 };
    return { status: 'unconfirmed', score: 0.2 };
  }

  // Fuente comunidad
  if (input.sourceType === 'community') {
    return { status: 'community', score: 0.5 };
  }

  return { status: 'unconfirmed', score: 0.1 };
}
```

### 8.2 Reglas Automáticas del Sistema (Anexo K)

1. 3+ reportes de error en 24hs → `confidence_status = 'unconfirmed'`
2. Ningún descuento "confirmed" puede tener >72hs sin verificación
3. Descuentos de comunidad NUNCA aparecen como "confirmed" sin validación del operador
4. Alertas urgentes de WhatsApp solo con descuentos "confirmed" verificados el mismo día

---

## 9. SEGURIDAD

### 9.1 Autenticación

- JWT con access token (15min) + refresh token (30 días)
- OAuth 2.0 para Google y Apple
- 2FA opcional vía OTP por WhatsApp/SMS
- Rate limiting: 100 req/min por usuario, 20 req/min para auth endpoints

### 9.2 Datos Sensibles

- **NO se almacenan** números de tarjeta, CBU, ni datos de cuenta
- Solo: tipo (crédito/débito), banco, red (Visa/MC), categoría (gold/platinum)
- Passwords: bcrypt con salt rounds = 12
- Datos en tránsito: TLS 1.3
- Datos en reposo: encriptación a nivel de disco (PostgreSQL)

### 9.3 Compliance

- Ley 25.326 de Protección de Datos Personales (Argentina)
- Consentimiento explícito para cada tipo de dato
- Derecho a borrado completo (GDPR-style)
- Datos anonimizados para B2B (fase 4)

---

## 10. CONFIGURACIÓN DE ENTORNO

### 10.1 Variables de Entorno (.env)

```env
# App
NODE_ENV=development
PORT=3000
APP_URL=https://api.esplus.app
FRONTEND_URL=https://app.esplus.app

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/esplus
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx

# AI
ANTHROPIC_API_KEY=sk-ant-xxx
AI_MODEL=claude-sonnet-4-20250514
AI_MAX_TOKENS=1024
AI_CACHE_TTL_HOURS=168       # 7 días

# WhatsApp (Baileys para MVP)
WHATSAPP_SESSION_PATH=./whatsapp-session

# Mercado Pago
MP_ACCESS_TOKEN=xxx
MP_PUBLIC_KEY=xxx
MP_WEBHOOK_SECRET=xxx

# Scraping
SCRAPING_PROXY_URL=xxx       # Rotating proxy
SCRAPING_INTERVAL_HOURS=6

# Monitoring
SENTRY_DSN=xxx
MIXPANEL_TOKEN=xxx

# Storage
S3_BUCKET=esplus-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
```

---

## 11. DEPLOYMENT

### 11.1 MVP (Railway/Render)

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://esplus:esplus@db:5432/esplus
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: esplus
      POSTGRES_USER: esplus
      POSTGRES_PASSWORD: esplus
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### 11.2 Escala (AWS)

Para >50K usuarias, migrar a:
- ECS Fargate (backend)
- RDS PostgreSQL (multi-AZ)
- ElastiCache Redis
- CloudFront + S3 (assets)
- Route 53 (DNS)

---

## 12. KPIs Y MÉTRICAS (Anexo K)

### 12.1 Dashboard del Operador — Checklist Diario

1. ☐ Revisar descuentos "confirmed" con >48hs sin verificar
2. ☐ Validar los 5 descuentos más vistos del día anterior
3. ☐ Revisar reportes de error de las últimas 24hs
4. ☐ Verificar promos "último día" antes de enviar alertas urgentes

### 12.2 Métricas Clave a Trackear

| Métrica | Semana 1 Meta | Semana 4 Meta |
|---------|--------------|---------------|
| Completar onboarding | 60-80% | — |
| Carga ≥1 tarjeta | 50-70% | — |
| Retorno semana 2 | — | 40-60% |
| Usa Pregunta Inteligente | — | 20-40% |
| Ahorro declarado promedio | — | $20K-50K/mes |
| NPS | — | >40 |
| Conversión free→premium | — | 5-15% |
| **Tasa de confianza** | **>95%** | **>95%** |

### 12.3 Regla de Decisión (Mes 2)

- Retención premium >70% + ahorro >$30K → **ESCALAR**
- Retención <50% y razón = "descuento no era cierto" → **RESOLVER DATOS**
- Retención baja y razón = "no lo usé" → **MEJORAR ENGAGEMENT**

---

## 13. FREEMIUM — Definición Exacta (Anexo K)

### Free (para siempre)
- Descuentos generales de la zona (sin filtro por medio de pago personal)
- 2 consultas de Pregunta Inteligente por mes
- Consejo semanal contextual en el home
- Perfil básico (ubicación y categorías de gasto)

### Premium ($1.500 ARS/mes · $15.000 ARS/año)
- Descuentos personalizados cruzados con tarjetas/billeteras
- Pregunta Inteligente ilimitada (3 niveles)
- Modo Compra Inteligente
- Historial de ahorro y contador acumulado
- Resumen semanal por WhatsApp
- Alertas de vencimiento
- Mis Descuentos Propios
- Obra social como medio de ahorro
- Gamificación completa

---

## 14. ROADMAP DE DATOS (Anexo N)

| Fase | Meses | Fuente de Datos | Acuerdos |
|------|-------|----------------|----------|
| MVP | 1-3 | Scraping 3-5 bancos + 2 billeteras + 2 cadenas. Operador humano diario. | Sin acuerdos. Scoring activo. Negociación MODO iniciada. |
| Validación | 4-6 | Scraping + primeras APIs. MODO vía API si hay respuesta. | Acuerdo MODO en proceso. |
| Crecimiento | 7-12 | APIs oficiales para grandes. Scraping como respaldo. | MODO firmado. ≥1 banco con feed. |
| Escala | 13-24 | 100% acuerdos formales. Open Banking. | Contratos B2B. Scraping eliminado. |

---

## APÉNDICE A: Comandos Rápidos para Desarrollo

```bash
# Setup inicial
cd backend && npm install
cp .env.example .env
docker-compose up -d db redis
npm run migration:run
npm run seed           # datos iniciales: planes, badges, promos de prueba
npm run dev

# Mobile
cd mobile && npm install
npx expo start

# Crear migración
npm run migration:generate -- -n AddNewTable

# Ejecutar scraper manualmente
npm run cli -- scrape --source=galicia

# Generar cache de IA
npm run cli -- ai:warmup --city="General Pico"
```

---

**Fin del documento de arquitectura — v1.0**

*-es+ / -is+ · Menos es Más / Less is More*
*Febrero 2026*
