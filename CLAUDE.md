# CLAUDE.md — Proyecto -es+ / -is+

## Qué es este proyecto

**-es+** ("menos es más") es una app de ahorro inteligente para Argentina. WhatsApp-first. Cruza el perfil financiero de la usuaria (tarjetas, billeteras, ubicación) con descuentos vigentes para decirle exactamente cómo gastar menos sin cambiar su rutina.

- **Nombre**: `-es+` (español) / `-is+` (internacional, "less is more")
- **Tagline**: "Menos ruido, más ahorro"
- **Asistente AI**: **Yapa** 🛍️ — mujer argentina ~40 años, habla como amiga que sabe de descuentos
- **Público objetivo**: Mujeres de 28-55 años que administran el hogar en Argentina
- **Modelo**: 6 meses gratis → Freemium (Free: 3 consultas Yapa/mes + resumen semanal | Start: $2.000 ARS/mes ilimitado)
- **Ciudad piloto**: General Pico, La Pampa

## Principios fundamentales

1. **WhatsApp es el canal principal** — la app es complemento opcional, NUNCA se obliga a bajarla
2. **Solo mostrar lo que tiene** — descuentos filtrados por medios de pago reales de la usuaria, no atosigar
3. **Yapa es más que un bot** — entiende contexto, recuerda historial, aprende del uso, personaliza
4. **Promos reales** — scraping de webs de bancos/cadenas primero, manual como excepción
5. **Banco provincial siempre primero** — al onboardear, el primer descuento que ve es de su banco provincial
6. **95% confianza mínimo** — si un dato no es confiable, no se muestra

## Stack tecnológico (actualizado 19 Mar 2026)

| Componente | Tecnología |
|-----------|------------|
| **Canal principal** | WhatsApp Business API (360dialog o Twilio) |
| **Base de datos** | PostgreSQL via Supabase (`pexhurygyzhhcdyvhlxs`, sa-east-1) — 39 tablas public schema |
| **Orquestación** | n8n Cloud (`abuelomatias.app.n8n.cloud`) — WhatsApp flows, scraping, cron |
| **AI / Yapa** | Anthropic Claude API (Sonnet) via Supabase Edge Functions |
| **Panel Admin** | Next.js 15 + Tailwind v4 + Supabase (deploy: Vercel) |
| **Scraping** | Firecrawl + n8n |
| **App móvil (Fase 4)** | React Native + Expo |
| **Repo** | `NicoHernaez/-is-` (GitHub, privado) |
| **Deploy** | Vercel (proyecto: `is`) |

**NOTA: NestJS fue eliminado del MVP.** Se reemplazó por Supabase Edge Functions + n8n (mismo patrón que The Deeper Room).

## Estructura del proyecto

```
-es+project/
├── supabase/
│   ├── migrations/           # 8 migraciones SQL (00001-00008)
│   │   ├── 00001_core.sql           # users (WA-first), locations, payment_methods, insurance
│   │   ├── 00002_catalogs.sql       # banks (27), wallets (7), cities (122)
│   │   ├── 00003_discounts.sql      # promotions, sources, error_reports, scraping_runs
│   │   ├── 00004_whatsapp.sql       # wa_conversations, wa_scheduled, yapa_memory, ai_cache
│   │   ├── 00005_club_and_community.sql  # club_discounts, votes, explorer_profiles
│   │   ├── 00006_gamification.sql   # badges, streaks, levels, savings_log, plans, subscriptions
│   │   ├── 00007_admin.sql          # operators, audit_log, trust_metrics, notification_log
│   │   └── 00008_anexo_v.sql        # insurance_benefit_catalog, fuel_programs, card_network_benefits
│   └── seed/                 # Datos iniciales
│       ├── seed-banks.sql           # 27 bancos (16 provinciales + 10 nacionales + 1 digital)
│       ├── seed-wallets.sql         # 7 billeteras (MP, Modo, Ualá, Naranja X, Personal Pay, Prex, Bimo)
│       ├── seed-cities.sql          # 122 ciudades en 23 provincias (con tier y ola de expansión)
│       └── seed-plans.sql           # 2 planes + 3 programas combustible
│
├── admin-panel/              # Next.js 15 Panel Admin
│   ├── src/app/(dashboard)/  # 7 páginas: Dashboard, Promos, Banks, Cities, Club, Users, Scraping
│   ├── src/lib/supabase.ts   # Client browser + server
│   ├── src/lib/colors.ts     # Paleta Sage & Blush
│   └── src/components/       # Sidebar, StatCard, ConfidenceBadge
│
├── edge-functions/           # Supabase Edge Functions
│   ├── yapa-query/           # Consulta inteligente con Claude
│   └── shared/               # Prompts, types, supabase client
│
├── n8n/workflows/            # Documentación de workflows n8n
│
├── yapa-demo/                # Simulador WhatsApp (Vite + React)
│
├── backend/                  # LEGACY — NestJS (no se usa en MVP, referencia)
├── mobile/                   # FUTURO — React Native + Expo (Fase 4)
└── docs/                     # Documentación estratégica (anexos, wireframes)
```

## Base de datos — 39 tablas en public schema

### Core (7 tablas)
- `users` — con campos WhatsApp-first (wa_phone, wa_frequency, wa_preferred_hour, wa_days_inactive, referral_code)
- `user_locations` — provincia + ciudad
- `user_payment_methods` — type: bank_card | wallet | wallet_card | fuel_program. Campos: bank_slug, card_network (visa/mc/amex/debit), card_tier, wallet_slug, photo_url
- `user_spending_categories`, `user_health_insurance`, `user_insurance`, `user_notification_prefs`

### Catálogos (3 tablas)
- `banks` — 27 bancos con slug, short_name, type (provincial/national/digital), provinces[], card_networks[], has_modo
- `wallets` — 7 billeteras con has_card, card_network, card_type
- `cities` — 122 ciudades con tier (piloto/t1/t2/t3), provincial_bank, expansion_wave (1-5)

### Descuentos (5 tablas)
- `promotions` — required_banks[], required_cards[], required_wallets[], confidence_status (confirmed/probable/community/unconfirmed), applies_cities[], valid_days[]
- `sources`, `error_reports`, `scraping_runs`, `user_custom_discounts`

### WhatsApp + Yapa (5 tablas)
- `wa_conversations` — historial completo de mensajes WA
- `wa_scheduled_messages` — cola de mensajes programados (resumen semanal, alertas, reengagement)
- `yapa_memory` — contexto por usuaria (ahorro total, categorías preferidas, family_context, free_queries_used, notas)
- `yapa_discount_usage` — "usé este descuento" con amount_saved y user_comment
- `ai_response_cache` — cache por query+ciudad+medios de pago

### Club de Amigas (3 tablas)
- `club_discounts` — promos subidas por usuarias via WA con foto, confirmations/denials
- `club_discount_votes`, `explorer_profiles`

### Gamificación + Suscripciones (6 tablas)
- `badge_definitions`, `user_badges`, `user_streaks`, `user_levels`, `savings_log`
- `plans` (2: Gratis + Start $2.000/mes), `user_subscriptions`

### Admin (4 tablas)
- `admin_operators` (superadmin/editor/viewer), `admin_audit_log`, `admin_trust_metrics`, `notification_log`

### Anexo V — Beneficios Ocultos (4 tablas, Fase 3)
- `insurance_benefit_catalog` — seguros bancarios con beneficios ocultos
- `user_insurance_benefit_usage` — tracking de uso
- `fuel_programs` — YPF Serviclub, Shell Box, Axion+
- `card_network_benefits` — extensión garantía, protección precios, seguro viaje por tier Visa/MC

## Reglas de negocio clave

### Scoring de confianza (Anexo K)
- `confirmed` (verde): verificado últimas 24h desde fuente oficial
- `probable` (amarillo): fuente confiable pero >24h sin verificar
- `community` (azul): reportado por usuarios, NUNCA sube a confirmed sin operador
- `unconfirmed` (gris): dato único o desactualizado
- 3+ error reports en 24h → auto-baja a `unconfirmed`

### Frecuencias WhatsApp (Anexo U)
- **2x semana** (martes y viernes) — compradora activa, más probable convertir
- **1x semana** (lunes) — planificadora, alta retención
- **Quincenal** (primer lunes) — piso mínimo del sistema
- **NO existe "solo cuando yo pregunte"** — es abandono disfrazado
- Horario personalizable: mañana (7-9), mediodía (12-13), noche (20-21)
- Max 14 días sin contacto (regla automática backend)

### Lógica del silencio (Anexo U)
- 7 días sin interacción: promo alto impacto (solo si hay)
- 14 días: resumen personal (SIEMPRE, haya o no promo)
- 30 días: pregunta directa sobre frecuencia
- Sin respuesta 72hs: baja a quincenal, NUNCA dar de baja

### Conversión (Anexo U)
- 3ra consulta Yapa (límite free): mostrar ahorro acumulado PRIMERO → precio después
- Si dice no: sin drama, sigue resumen gratis
- Reintento a 7 días con nuevo ahorro acumulado

### 7 capas de beneficio (Anexo V)
1. Descuento bancario (25% Galicia en Farmacity)
2. Tarjeta fidelidad (puntos Farmacity Más)
3. Obra social (40% OSDE en medicamentos)
4. Seguro bancario (2 plomeros gratis Santander)
5. Descuento negociado propio (15% gym pago anual)
6. Beneficio red Visa/MC (extensión garantía)
7. Programa combustible (YPF Serviclub + descuento banco)

## Features futuras (no MVP)

- **Foto de tickets**: usuario saca foto al ticket → Yapa analiza cuánto pudo ahorrar → historial de gastos promedio por lugar → tips personalizados
- **Negocios locales**: sección donde comercios pequeños publican promos con tarjetas específicas
- **Conexión cuentas bancarias**: leer promos automáticamente desde apps bancarias (cuentas reales del fundador)
- **Compartir descuento usado**: WA → memoria → Club de Amigas
- **Alcancía inteligente**: metas de ahorro con el dinero "ahorrado"

## Paleta de colores — Sage & Blush

| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `#4A5E3C` | Textos principales, badges, avatar |
| Primary Light | `#5D7A48` | Gradientes |
| Blush | `#C4967A` | Acento, FAB Yapa, links |
| Background | `#F8F5F1` | Fondo principal |
| Surface | `#FFFFFF` | Cards, inputs |
| Text | `#3A3A32` | Texto principal |
| Text Secondary | `#9A8A7A` | Subtítulos |
| Brand Green | `#1F3D2B` | Sidebar admin, headers WA sim |
| Brand Gold | `#C6A75E` | Logo, accents doc |

## Plan de fases

### FASE 1 — MVP General Pico (Sem 1-3) ← EN CURSO
1. Seed 20+ promos reales GP (scraping webs bancos/cadenas)
2. Admin CRUD: promos + bancos + ciudades (editable)
3. n8n: Webhook WhatsApp + onboarding 7 pasos
4. Edge Function: Yapa query (Claude + contexto + promos)
5. n8n: Resumen semanal según frecuencia
6. Negocios locales (comercios suben promos)

### FASE 2 — Retención + Club (Sem 4-6)
7. Mensaje 24hs post-onboarding
8. Lógica silencio 3 niveles
9. Club de Amigas (subir promo via WA)
10. Marcar descuento usado → yapa_memory
11. Agregar/cambiar medios de pago via WA
12. Dashboard métricas
13. Foto de tickets → análisis ahorro

### FASE 3 — Conversión + La Pampa (Sem 7-9)
14. Guión conversión
15. MercadoPago integración
16. Activar Santa Rosa + Toay + Gral Acha
17. Scraping Firecrawl + n8n
18. Beneficios ocultos seguros (Anexo V)

### FASE 4 — App + Ola 2 (Sem 10-14)
19. App React Native/Expo
20. Ola 2: Bahía Blanca, Neuquén, Río Cuarto, Paraná
21. Combustible (Serviclub, Shell Box)
22. Conexión cuentas bancarias reales

## Documentación de referencia

### Los 4 anexos clave (HTML)
- `esplus_anexos_kbis_lbis.html` — WhatsApp canal principal + 5 agentes de datos
- `esplus_anexos_ciudades_expansion_financiero_v2.html` — 95+ ciudades + olas + financiero
- `esplus_anexo_u_comportamiento_yapa_whatsapp.html` — frecuencias + silencio + conversión
- `esplus_anexo_v_beneficios_ocultos_comercios.html` — 7 capas + seguros + Diarco

### Otros
- `ARCHITECTURE.md` — Arquitectura técnica completa (1.642 líneas, referencia legacy)
- `YAPA_PROMPTS.md` — Personalidad Yapa, templates, cache, seed promos GP
- `esplus_biblia_prompts_v3 (1).html` — Visual identity Yapa (28 assets Midjourney)
- `wireframes.html` — Wireframes interactivos Sage & Blush
- `es_plus_documento_maestro.docx` — Documento maestro del producto

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pexhurygyzhhcdyvhlxs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (secreto)

# AI (Yapa)
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-20250514

# WhatsApp Business API (pendiente)
WA_PHONE_NUMBER_ID=
WA_ACCESS_TOKEN=
WA_VERIFY_TOKEN=
```
