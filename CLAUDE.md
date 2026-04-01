# CLAUDE.md — Proyecto -es+ / -is+

## Qué es este proyecto

**-es+** ("menos es más") es una app de ahorro inteligente para Argentina. WhatsApp-first. Cruza el perfil financiero de la usuaria (tarjetas, billeteras, ubicación) con descuentos vigentes para decirle exactamente cómo gastar menos sin cambiar su rutina.

- **Nombre**: `-es+` (español) / `-is+` (internacional, "less is more")
- **Tagline**: "Ahorrá con lo que ya tenés"
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
│   ├── src/app/(dashboard)/  # 10 páginas: Dashboard, Promos, Banks, Wallets, Fidelidad, Cities, Negocios, Club, Users, Scraping
│   ├── src/lib/supabase.ts   # Client browser + server
│   ├── src/lib/colors.ts     # Paleta Sage & Blush
│   └── src/components/       # Sidebar, StatCard, ConfidenceBadge
│
├── edge-functions/           # 4 Supabase Edge Functions (AI Agents) — TODOS IMPLEMENTADOS
│   ├── yapa-query/           # 🛍️ Yapa — responde a la usuaria con promos personalizadas (Claude Sonnet)
│   ├── la-lupa/              # 🔍 La Lupa — QC: verify_batch, degrade_stale, process_error_reports, verify_single (Claude Haiku)
│   ├── el-estratega/         # 📊 El Estratega — daily_report (JSON + formato WA), check_alerts, guarda admin_trust_metrics
│   ├── el-rastreador/        # 🕵️ El Rastreador — normalize (HTML→JSON via Haiku), ingest (deduplica + inserta probable), expire
│   └── shared/               # types.ts, supabase-client.ts (client + CORS + callClaude helper)
│
├── n8n/workflows/            # Documentación de workflows n8n
│
├── app/                          # App usuario (PWA Next.js 15)
│   ├── src/app/(app)/            # 5 pantallas: Home, Descuentos, Yapa, Comunidad, Perfil
│   ├── src/components/ui/        # TabBar, DiscountCard
│   ├── src/lib/supabase.ts       # Client + Yapa function URL
│   └── public/manifest.json      # PWA manifest
│
├── yapa-demo/                    # Simulador WhatsApp (Vite + React)
├── backend/                      # LEGACY — NestJS (referencia)
└── docs/                         # Documentación estratégica
```

## Base de datos — 43 tablas en public schema

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

## Deploy y dominios

| Componente | URL | Plataforma |
|-----------|-----|------------|
| **App usuario (PWA)** | `esplus.casa` / `esplus-app.vercel.app` | Vercel (proyecto `esplus-app`, root: `app/`) |
| **Admin Panel** | `is-lac.vercel.app` | Vercel (proyecto `is`, root: `admin-panel/`) |

- **Dominio:** `esplus.casa` → DNS en Name.com → Vercel (A record 76.76.21.21)
- **WhatsApp Business:** usa `esplus.casa` como URL de negocio
- **Repo GitHub:** `NicoHernaez/-is-` → auto-deploy ambos proyectos en push a master

## Migraciones

### Ejecutadas en Supabase
- `00010_city_merchants.sql` — tabla catálogo comercios por ciudad (Google Places) + RPC `check_merchant_in_city()`

### Pendientes de ejecutar
- Ninguna — todas ejecutadas

## Edge Functions — Estado de deploy (26 Mar 2026)

### Yapa Query 🛍️ — DEPLOYADA ✅
URL: `https://pexhurygyzhhcdyvhlxs.supabase.co/functions/v1/yapa-query`
- Onboarding interactivo v2: detección ciudad por código de área, botones WA nativos
- Consultas inteligentes con Claude Sonnet (max 250 tokens, 80 palabras)
- Personalidad: mujer argentina ~40 años, voseo, femenino, máximo 2 emojis
- Frecuencia default: 1x/semana viernes noche (sin preguntar en onboarding)
- REGLA: nunca usar siglas/abreviaturas de bancos — nombre completo siempre

### El Rastreador 🕵️ — DEPLOYADO ✅
URL: `https://pexhurygyzhhcdyvhlxs.supabase.co/functions/v1/el-rastreador`
- `action: "scrape"` — scrapea fuente completa (fetch → Haiku normalize → ingest con dedup mejorada)
- `action: "normalize"` — HTML/markdown → Claude Haiku → JSON de promos
- `action: "discover"` — Google Places → catálogo city_merchants
- `action: "ingest"` — promos → deduplica por tipo+valor+categoría → inserta
- `action: "expire"` — desactiva promos vencidas

### La Lupa 🔍 — DEPLOYADA ✅
URL: `https://pexhurygyzhhcdyvhlxs.supabase.co/functions/v1/la-lupa`
- `action: "verify_batch"` — hasta 20 promos probable → score 4 factores
- `action: "degrade_stale"` — promos >72h sin verificar bajan nivel
- `action: "process_error_reports"` — 3+ reportes en 24h → auto-downgrade
- `action: "verify_single"` — admin confirma/rechaza manualmente

### El Estratega 📊 — DEPLOYADO ✅
URL: `https://pexhurygyzhhcdyvhlxs.supabase.co/functions/v1/el-estratega`
- `action: "daily_report"` — reporte completo (JSON o `format: "whatsapp"`)
- `action: "check_alerts"` — solo alertas críticas

## n8n Workflows -es+ (26 Mar 2026)

| Workflow | ID | Trigger | Estado |
|----------|----|---------|--------|
| Yapa WhatsApp v2 | `wYeJr88Zx8G8OpWT` | Webhook WA | ✅ Activo |
| Scraping Diario | `l3YIQjNT4Kd0uM9L` | Cron 6am UTC | ✅ Activo |
| Reporte Semanal | `nuNDGP8OKuDr6JKH` | Cron lunes 9am | ✅ Activo |

## Fuentes de scraping (tabla sources)

11 fuentes activas con `scraping_config` JSONB:
- **Priority 10:** Banco de La Pampa (firecrawl, bank_slug: pampa)
- **Priority 20:** MercadoPago (firecrawl, wallet_slug: mercadopago)
- **Priority 30:** Galicia, Macro, Santander (firecrawl)
- **Priority 35:** La Anónima (http), Diarco (firecrawl)
- **Priority 40:** Hipotecario/MODO, Ualá, Naranja X, MODO (firecrawl)

Todas configuradas con `target_cities: ["General Pico"]`, `target_province: "La Pampa"`

## Sistema de prioridad (RPC get_promos_prioritized)

Ordena promos dinámicamente según ciudad:
1. Banco provincial (10) — BLP para La Pampa
2. MercadoPago (20) — transversal
3. MODO (25)
4. Bancos nacionales (30)
5. Otras billeteras (35)
6. Cualquier medio de pago (40)

## Catálogo General Pico (city_merchants)

- **59 comercios** cargados en Supabase (cadenas + farmacias + combustible + locales)
- **198 comercios** descubiertos por Google Places (JSON en scripts/city-general-pico.json)
- **18 handles de Instagram** configurados (lacoopear, super.muybarato, simplemercadomayorista, etc.)
- **25 cadenas nacionales** confirmadas presentes en GP
- Campo `instagram_handle` agregado a la tabla

## Instagram — Prueba de concepto (24 Mar 2026)

- Login exitoso via Chrome DevTools MCP
- Explorado @lacoopear: highlight "Promo Bancos" tiene promos bancarias reales (Comafi 30% MODO, Banco del Sol 30%)
- **Descubrimiento clave:** `#ofertasgeneralpico` muestra ofertas locales con precios reales (catálogos, carnicerías, panaderías)
- Script `scripts/scrape-instagram.ts` creado (screenshots → Claude Vision → extract promos)
- **Pendiente:** automatizar búsqueda local por hashtag

## Promos en DB (24 Mar 2026)

- **36 promos activas** (14 confirmed, 19 probable, 3 unconfirmed)
- Fuentes: BLP manual + BLP scraper, Diarco scraper, Ualá scraper, seed manual
- Incluye promos de billeteras digitales (MercadoPago, PersonalPay, NaranjaX)

## Scripts locales (scripts/)

| Script | Función |
|--------|---------|
| `discover-city.ts` | Descubre comercios en cualquier ciudad (Google Places) |
| `discover-merchants.ts` | Versión inicial genérica |
| `discover-chains.ts` | Busca cadenas nacionales + búsquedas amplias |
| `test-filters.ts` | Compara filtro nombre vs curador IA |
| `scrape-instagram.ts` | Screenshots IG → Claude Vision → extrae promos |

## Env vars en Supabase Edge Functions

- `ANTHROPIC_API_KEY` ✅
- `FIRECRAWL_API_KEY` ✅ (fc-b86c7008...)
- `GOOGLE_MAPS_API_KEY` ✅ (AIzaSyAe...)

## Completado (26 Mar 2026)

- [x] Migración 00009 ejecutada (get_yapa_context RPC)
- [x] Deploy La Lupa + El Estratega como Edge Functions
- [x] Workflow n8n "Scraping Diario" (cron 6am → scrape cada source)
- [x] Workflow n8n "Reporte Semanal" (lunes 9am → El Estratega + La Lupa)
- [x] Onboarding v2: detección código de área, 3 pasos, sin frecuencia/horario
- [x] Personalidad Yapa: mujer argentina, femenino, 80 palabras max, 250 tokens
- [x] Promos nacionales Galicia/Santander/MODO/Nación cargadas
- [x] Duplicados BLP limpiados
- [x] Dedup mejorada en El Rastreador (por tipo+valor+categoría)
- [x] Correcciones: días español, tope siempre, equivalentes variados, sin siglas bancos
- [x] n8n WA workflow actualizado: pasa interactive_reply + usa wa_message de yapa-query
- [x] Unique index en user_locations + fix upsert → delete+insert
- [x] Carrefour desactivada (no existe en GP)

## Completado (31 Mar 2026)

### WhatsApp Flows (onboarding 100% taps)
- [x] Flow JSON v7.3 creado y subido a Meta (ID: `965577505925900`)
- [x] Edge Function `onboarding-flow` deployada con encriptación RSA/AES-GCM
- [x] Health check pasado (FLOW: LIMITED)
- [x] Clave pública registrada en flow + teléfono
- [x] App Meta conectada (`1408298957267561`)
- [x] n8n actualizado con soporte `nfm_reply`
- [x] 6 pantallas: PROVINCE → CITY → BANKS → CARDS → WALLETS → WALLET_CARDS
- [ ] **BLOQUEADO**: publicar flow requiere Meta Business Verification (en revisión)

### Dominio y verificación Meta
- [x] Dominio `esplus.casa` verificado en Meta (TXT DNS + meta tag)
- [x] Meta tag `facebook-domain-verification` en layout.tsx
- [x] Business verification iniciada para "Menos es MAS" (en revisión por Meta)

### PWA funcional con auth por teléfono
- [x] PhoneEntry: pantalla entrada con +54 9 fijo
- [x] UserProvider: contexto con datos reales de Supabase (phone → user → locations → payment_methods → yapa_memory)
- [x] Onboarding in-app: provincia → ciudad → bancos (colores reales) → tarjetas (Débito/Visa/MC/Amex) → billeteras → tarjetas billetera
- [x] RPC `complete_app_onboarding()` — SECURITY DEFINER, bypassa RLS
- [x] RLS policies de lectura para anon (users, locations, payments, memory, promos, cities)
- [x] Home page con datos reales del usuario
- [x] Perfil page con bancos/billeteras reales del usuario
- [x] Yapa chat usa phone real (no TEST_USER_ID)
- [x] Bancos provinciales solo en su provincia, nacionales en todas
- [x] Comafi/Brubank/Banco del Sol en sección desplegable "Otros bancos"
- [x] Banner del banco con su color en pantalla de tarjetas
- [x] **FIX**: post-onboarding navega al dashboard (refreshProfile en contexto, sin page reload)

### Env vars nuevas en Supabase
- `WHATSAPP_FLOW_ID` — vacío (desactivado hasta business verification)
- `FLOW_PRIVATE_KEY_B64` — clave RSA base64 para encriptación de Flows

## Pendientes técnicos (31 Mar 2026)

- [x] **FIX**: navegación post-onboarding PWA (refreshProfile en contexto, sin page reload)
- [ ] Activar WhatsApp Flow cuando Meta apruebe business verification (setear `WHATSAPP_FLOW_ID=965577505925900`)
- [ ] Scraper Instagram por hashtag local (#ofertasgeneralpico)
- [ ] Arreglar parse JSON MercadoPago (Haiku devuelve JSON malformado)
- [ ] Cargar 198 comercios completos en Supabase (hoy hay 59)
- [ ] Probar scrape con Galicia, Macro, Santander, Naranja X
- [ ] Pedir nombre del usuario en onboarding (hoy queda "Amiga")
- [ ] Comunidad page conectada a club_discounts table

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
