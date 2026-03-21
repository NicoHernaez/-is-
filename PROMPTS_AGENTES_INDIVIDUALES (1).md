# PROMPTS INDIVIDUALES — Empresa de Agentes -es+
## 8 prompts listos para copiar y pegar en chats separados del proyecto

---
---

## PROMPT 1 — AGENTE 1: SCRAPER MAESTRO
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como ingeniero de automatización especialista en web scraping y pipelines de datos para fintech.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más), una app de ahorro inteligente para mujeres argentinas que administran el hogar. La app cruza los medios de pago de la usuaria (tarjetas, billeteras) con descuentos bancarios vigentes para decirle exactamente cómo ahorrar sin cambiar su rutina.

El problema: los descuentos están fragmentados en las webs de cada banco. Necesito scrapers automáticos que visiten esas webs cada 6 horas, extraigan los descuentos, los normalicen a un formato estándar, y los guarden en mi base de datos.

**LEÉ ESTOS ARCHIVOS PRIMERO (en este orden):**
1. `CLAUDE.md` — Arquitectura del proyecto, stack (NestJS, Supabase, convenciones)
2. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 2 (Agente 1 completo con flujo, prompt de Haiku, tabla SQL)
3. `ARCHITECTURE.md` — Sección de schemas de BD (tabla `promotions`, `sources`)

**MI STACK DE SCRAPING:**
- **n8n Cloud** (ya pagado, ya sé usarlo) para orquestación y scheduling
- **Firecrawl** para scraping de páginas con JS dinámico
- **Claude API (Haiku)** para normalizar texto libre a JSON estructurado
- **Supabase** (PostgreSQL) como destino — instancia `pexhurygyzhhcdyvhlxs`, región `sa-east-1`

**QUÉ NECESITO QUE HAGAS:**

1. **Primer scraper: Banco Galicia Argentina**
   - URL: https://www.galicia.ar/personas/beneficios
   - Diseñame el flujo de n8n paso a paso (cada nodo, qué hace, qué conecta con qué)
   - El prompt exacto para Claude Haiku que normalice el HTML a JSON
   - Lógica de deduplicación (no insertar promos que ya existen)
   - Manejo de errores (qué pasa si la web cambió de estructura)

2. **Endpoint receptor en el backend NestJS**
   - `POST /api/v1/admin/scraping/ingest` — recibe el JSON normalizado desde n8n
   - Valida con class-validator
   - Inserta en `promotions` con `confidence_status = 'probable'`
   - Registra en `scraping_runs`
   - Protegido con API key (no JWT, porque n8n lo llama)

3. **SQL para la tabla `scraping_runs`** (ver Anexo AD sección 2)

4. **Template replicable** — El scraper de Galicia debe servir como template para duplicar rápidamente a Macro, Banco de La Pampa, Modo, y después a bancos de Chile y Uruguay.

**REGLAS:**
- Código production-ready, no prototipos
- Respetar convenciones de CLAUDE.md (NestJS, Supabase directo sin ORM, class-validator)
- El scraper NO puede ser `confirmed` automáticamente — siempre entra como `probable`
- Loguear todo: qué se scrapeó, cuántas promos nuevas, cuántas actualizadas, errores
- Dame las variables de entorno nuevas que necesite
- Dame al menos 3 tests

Empezá diseñando el flujo de n8n para Galicia y el endpoint receptor.

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- El orden de scrapers por ciudad prioriza el BANCO PROVINCIAL (Banco de La Pampa en GP, Bancor en Córdoba, etc.) antes que los nacionales. Leé la Adenda de Potenciación del Anexo AD para el mapa completo.
- ¿Frecuencias diferenciadas por tipo de promo? (diarias vs semanales vs flash)
- ¿Detección automática de cambio de estructura de web? (si encuentra 0 promos donde antes había 20 → alerta)
- ¿Multi-source verification? (scrapear también agregadores como Promodescuentos para cruzar)
- ¿Screenshot as proof? (guardar captura de la web al momento del scraping como respaldo)
- ¿Auto-healing? (cuando falla el scraper, Claude Sonnet analiza el nuevo HTML y propone fix)

═══════════════════════════════════════════════════════════════

---
---

## PROMPT 2 — AGENTE 2: VERIFICADOR DE CALIDAD
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como ingeniero de backend especialista en sistemas de scoring y verificación de datos para fintech.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más). Tengo scrapers (Agente 1, ya implementado) que cargan descuentos bancarios en mi BD. Pero los datos scrapeados no son 100% confiables — pueden tener errores, estar vencidos, o ser incoherentes. Necesito un agente verificador que corra automáticamente cada hora, verifique cada promo nueva, y le asigne un nivel de confianza.

**LEÉ ESTOS ARCHIVOS PRIMERO:**
1. `CLAUDE.md` — Stack y convenciones
2. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 3 (Agente 2 completo)
3. `anexo_k_validacion_externa.docx` — Sistema de scoring de confianza (las 4 reglas)
4. `ARCHITECTURE.md` — Schema de `promotions` (campos confidence_status, confidence_score)

**LO QUE YA EXISTE:**
- `scoring.service.ts` en el módulo discounts — tiene las 4 reglas del Anexo K implementadas pero sin el cron automático
- `error-reports.service.ts` — recibe reportes de error de usuarias
- La tabla `promotions` ya tiene los campos `confidence_status` (enum: confirmed, probable, community, unconfirmed) y `confidence_score` (decimal 0-1)

**QUÉ NECESITO QUE HAGAS:**

1. **Cron job de verificación horaria** — `@Cron('0 * * * *')`
   - Buscar promos con status `probable` que no se verificaron en las últimas 24h
   - Para cada una, calcular score basado en:
     a) Tipo de fuente (API oficial > scraper verificado > scraper > community)
     b) ¿Hay promos similares de otras fuentes que confirmen?
     c) ¿El comercio existe en Google Maps? (si se menciona uno específico)
     d) ¿Claude Haiku opina que es coherente? (fechas, porcentajes, categoría)
   - Asignar status según score final
   - Actualizar `last_verified_at`

2. **Sistema automático de degradación**
   - Promo con >72h sin re-verificar → degradar un nivel
   - 3+ reportes de error en 24h → automáticamente `unconfirmed`
   - Community NUNCA sube a `confirmed` sin aprobación manual (mía)

3. **Endpoint para aprobación manual**
   - `PATCH /api/v1/admin/promos/:id/verify` — yo apruebo con un click
   - Solo accesible con `@Admin()` guard

4. **Integración con Google Maps** (módulo nearby-places, Anexo W)
   - Cuando una promo menciona un comercio específico, verificar que existe via Google Maps Nearby Search
   - Esto suma puntos al score de confianza

**REGLAS:**
- El verificador NUNCA marca como `confirmed` sin intervención humana (mía) en la primera vez para cada fuente
- Después de que yo apruebe 10+ promos de la misma fuente sin correcciones, esa fuente puede pasar a auto-confirmed
- Respetar convenciones de CLAUDE.md
- Dame el código completo del cron, el servicio, y los tests

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- ¿Cuánta autonomía? Si 50 usuarias confirman que la promo funciona, ¿sigue necesitando mi click? ¿Cuál es el umbral de auto-confirm comunitario?
- ¿Feedback loop con Yapa? Cuando la usuaria dice "sí lo usé" o "no existía", eso retroalimenta el score automáticamente.
- ¿Confianza por fuente aprendida? Si Galicia trae promos correctas 50 veces seguidas, la confianza base de esa fuente sube sola.
- ¿Alerta de promo "demasiado buena"? 90% off en todo = probablemente error de parseo. Detectar outliers.
- ¿Verificación geográfica con Google Maps? Cruzar comercio mencionado con existencia real en la ciudad.
- ¿Decay curve temporal? Una promo verificada hace 1 hora vale más que una de hace 3 días.

═══════════════════════════════════════════════════════════════ — AGENTE 3: YAPA (Asistente de Usuarias)
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como especialista en diseño de agentes conversacionales con IA, con experiencia en personalización por mercado y optimización de costos de API.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más). Yapa es la asistente de ahorro de la app — habla con las usuarias por WhatsApp, Instagram DM y Facebook Messenger. Hoy Yapa ya funciona como Pregunta Inteligente en la app (módulo smart-query implementado). Lo que necesito es evolucionarla para funcionar en múltiples canales y múltiples países.

**LEÉ ESTOS ARCHIVOS PRIMERO:**
1. `CLAUDE.md` — Stack, módulo smart-query existente, reglas de Yapa
2. `YAPA_PROMPTS.md` — Personalidad completa de Yapa, templates, reglas de cache
3. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 4 (Agente 3 completo, router de modelos)
4. `ANEXO_X_MULTICHANNEL_MESSAGE_ROUTER.md` — Arquitectura multi-canal
5. `esplus_anexo_u_comportamiento_yapa_whatsapp.html` — Comportamiento en WhatsApp (frecuencias, retención, guiones)

**LO QUE YA EXISTE:**
- `smart-query.service.ts` — Orquestador: check límite free → cache → Claude → guardar
- `ai-client.service.ts` — Wrapper de `@anthropic-ai/sdk`
- `prompt-builder.service.ts` — System prompt de Yapa (669 líneas) con contexto de usuaria + descuentos
- `cache.service.ts` — Cache SHA256 con TTL por categoría

**QUÉ NECESITO QUE HAGAS:**

1. **Router de modelos inteligente**
   - Sonnet para consultas complejas/personalizadas ("¿dónde me conviene comprar guardapolvos?")
   - Haiku para resúmenes semanales (template con datos), tips del día, clasificación de intención, onboarding conversacional
   - Implementar `selectModel()` en smart-query.service.ts

2. **System prompts por país**
   - Crear la estructura de archivos: `prompts/yapa_ar.md`, `yapa_cl.md`, `yapa_uy.md`, etc.
   - Argentina: voseo, "che", pesos ARS, bancos argentinos
   - Chile: tú, chilenismos suaves, pesos CLP, bancos chilenos
   - Uruguay (Mimo): voseo casi igual a AR, pesos UYU, bancos uruguayos
   - Colombia (Ñapa): tú, colombianismos, pesos COP
   - EEUU inglés: casual American English, USD
   - EEUU español: tú neutro, USD
   - El prompt base es el que ya existe en YAPA_PROMPTS.md — las variantes solo cambian idioma, bancos, moneda, y expresiones locales

3. **Integración con el Message Router (Anexo X)**
   - Yapa recibe un `IncomingMessage` normalizado (canal + texto + senderId)
   - Detecta intención: ¿es consulta? ¿es onboarding? ¿es saludo? ¿es queja?
   - Responde en el formato adecuado al canal (WA soporta botones, IG soporta quick replies, etc.)
   - Usa el `ResponseFormatterService` para adaptar la respuesta al canal

4. **Lógica de frecuencia y silencio (Anexo U)**
   - Resumen semanal automático según frecuencia elegida (2x, 1x, quincenal)
   - Mensaje 24h post-onboarding
   - Lógica del silencio (7d → promo alto impacto, 14d → resumen, 30d → pregunta directa)
   - Regla inquebrantable: ninguna usuaria pasa más de 14 días sin recibir mensaje

**REGLAS:**
- Yapa NUNCA inventa descuentos
- Yapa NUNCA recomienda sacar tarjeta nueva
- Yapa siempre indica nivel de confianza del descuento
- Yapa siempre muestra ahorro estimado en moneda local
- Máximo 200 palabras por respuesta
- Respetar convenciones de CLAUDE.md

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- ¿Yapa tiene memoria entre conversaciones? Si preguntó por guardapolvos la semana pasada y hoy dice "¿y los zapatos?", ¿Yapa conecta que está equipando a los chicos?
- ¿Yapa puede ser proactiva? Mandar mensaje sin que le pregunten si detecta un descuento perfecto para esa usuaria.
- ¿Voz en WA? Yapa mandando un audio de 15s con el resumen semanal, como una amiga mandando voice note. Diferenciador enorme.
- ¿Personalización por comportamiento? Yapa aprende qué categorías usa más cada usuaria y prioriza esas en los resúmenes.
- ¿Modo "shopping companion"? La usuaria dice "estoy en Changomás" y Yapa le lista todos los descuentos activos ahí mismo + farmacias cerca.
- ¿Yapa recomienda el DÍA, no solo el descuento? "No compres hoy, mañana jueves tenés 25%."
- ¿Respuesta con mapa/ubicación nativa de WA?

═══════════════════════════════════════════════════════════════ — AGENTE 4: COMMUNITY MONITOR
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como ingeniero de backend especialista en moderación de contenido con IA y sistemas de community management automatizado.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más). La app tiene una comunidad llamada "Club de Amigas" donde las usuarias reportan descuentos que encuentran y también reportan errores en descuentos existentes. Necesito un agente que monitoree todo esto automáticamente, clasifique, deduplique, detecte spam, y me deje todo listo para aprobar con un click.

**LEÉ ESTOS ARCHIVOS PRIMERO:**
1. `CLAUDE.md` — Stack y convenciones
2. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 5 (Agente 4 completo)
3. `anexo_k_validacion_externa.docx` — Reglas de scoring (especialmente la regla de 3 reportes)

**QUÉ NECESITO QUE HAGAS:**

1. **Monitor de promos comunitarias** — Cron cada 30 minutos
   - Leer promos nuevas con `source_type = 'community'` y `status = 'needs_review'`
   - Claude Haiku clasifica: ¿es spam? ¿categoría correcta? ¿ya existe en BD? ¿es coherente?
   - Si es duplicada de una existente: vincular y sumar como "confirmación comunitaria"
   - Si es nueva y coherente: dejar en `needs_review` para que yo apruebe
   - Si es spam o incoherente: marcar como `rejected` con motivo

2. **Monitor de reportes de error** — En tiempo real (event-driven)
   - Cuando llegan 3+ reportes de error en la misma promo en 24h → degradar automáticamente a `unconfirmed`
   - Notificar a AG6 (Analytics) para que me alerte

3. **Cola de revisión diaria**
   - Preparar un resumen para AG6: "3 promos nuevas de la comunidad para revisar"
   - Incluir: qué dice la promo, quién la reportó, score de coherencia de Haiku, si hay duplicados

4. **Endpoint de aprobación**
   - `PATCH /api/v1/admin/community/:id/approve` — apruebo y pasa a `community` confirmed
   - `PATCH /api/v1/admin/community/:id/reject` — rechazo con motivo

**REGLAS:**
- Community NUNCA sube a `confirmed` sin mi aprobación
- El spam se detecta por: misma usuaria reportando >5 promos/día, texto incoherente, URLs externas
- Respetar convenciones de CLAUDE.md
- Dame código completo, SQL si hace falta, y tests

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- ¿Las Exploradoras que reportan bien ganan algo? Definir gamificación del reporte comunitario.
- ¿Score del reportante? Usuarias que consistentemente reportan bien ganan credibilidad — sus futuros reportes pesan más.
- ¿Clustering geográfico? Si 5 usuarias de la misma zona reportan lo mismo, crear promo automáticamente.
- ¿Gratitud pública? Notificar a quien reportó cuando su promo se verifica: "Tu dato de Farmacity ya lo usan 23 personas."
- ¿Canal para "promos de pasillo"? Promos que no están en la web pero alguien vio en un cartel/mail.

═══════════════════════════════════════════════════════════════ — AGENTE 5: CONTENT GENERATOR
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como director creativo de redes sociales especializado en fintech consumer y contenido para mujeres latinoamericanas, con expertise técnico para automatizar la generación de contenido con IA.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más). Opero solo y necesito generar contenido para Instagram, TikTok, Facebook y WhatsApp de forma automatizada. Tengo un framework de 10 ejes de comunicación con calendario semanal y un banco de copies. Necesito un agente que cada lunes genere las 7 piezas de la semana, con copy, hashtags, formato, y descripción visual, listo para que yo revise y publique.

**LEÉ ESTOS ARCHIVOS PRIMERO:**
1. `CLAUDE.md` — Stack y convenciones
2. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 6 (Agente 5 completo con prompt, tabla SQL, flujo)
3. `ANEXO_AC_FRAMEWORK_MENSAJERIA_10_EJES.md` — Los 10 ejes, banco de copies, calendario semanal, reglas de tono
4. `esplus_campana_lanzamiento.docx` — Campaña de lanzamiento (piezas de video, guiones, calendario existente)

**QUÉ NECESITO QUE HAGAS:**

1. **Servicio `ContentGeneratorService`** en NestJS
   - Cron semanal: lunes a las 6am
   - Consulta los top 10 descuentos de la semana por impacto
   - Consulta qué ejes tocan esta semana (rotación de 5 semanas del Anexo AC)
   - Llama a Claude Sonnet con el prompt del Anexo AD sección 6
   - Guarda las 7 piezas en tabla `content_calendar` con status `draft`

2. **Tabla `content_calendar`** en Supabase (SQL completo del Anexo AD)

3. **Endpoint de gestión para mí**
   - `GET /api/v1/admin/content/week/:weekNumber` — ver las piezas de la semana
   - `PATCH /api/v1/admin/content/:id/approve` — aprobar pieza
   - `PATCH /api/v1/admin/content/:id/reject` — rechazar con feedback
   - `POST /api/v1/admin/content/regenerate/:id` — regenerar una pieza específica

4. **Adaptación por país**
   - El mismo sistema funciona para Argentina, Chile, Uruguay, etc.
   - Cambia: los descuentos consultados, la moneda, el tono (voseo vs tuteo), las cadenas locales
   - El eje de Inflación (9) se reemplaza por Rewards (10) en EEUU

**REGLAS:**
- Todas las piezas salen como `draft` — NUNCA publicar automáticamente
- Respetar las 10 reglas de tono del Anexo AC (voseo, máximo 2 emojis, no politizar, etc.)
- El ahorro siempre en moneda local con número concreto
- Siempre cerrar con "-es+. Ahorrá con lo que ya tenés. 🛍️"
- Dame código completo, SQL, y tests

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- ¿A/B testing de copies? Generar 2 versiones de cada pieza con ejes distintos, publicar ambas, medir cuál funciona mejor.
- ¿Contenido reactivo? Cuando aparece un descuento extraordinario (50% off), generar pieza urgente fuera del calendario.
- ¿UGC amplificado? Cuando una usuaria nos tagea en IG con su pantalla de ahorro, detectar el tag y generar repost con copy de marca.
- ¿Localización automática? Una pieza para Argentina se adapta automáticamente a Chile/Uruguay/Colombia (cambia moneda, bancos, tono).
- ¿Scheduling automático vía Meta API? O siempre manual para mantener control.
- ¿Generación de video con IA conectada al pipeline de AutoCrop-Vertical?

═══════════════════════════════════════════════════════════════ — AGENTE 6: ANALYTICS & ALERTAS
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como ingeniero de observabilidad y analytics, especialista en dashboards operativos para startups one-person que necesitan monitorear todo desde el celular.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más). Opero solo en hasta 7 países. Necesito un agente que cada mañana me mande por WhatsApp un resumen completo de cómo está la operación, y que me alerte inmediatamente si algo se rompe. No uso Datadog ni herramientas caras — todo corre en el backend como cron jobs que hacen queries a Supabase y me mandan mensajes.

**LEÉ ESTOS ARCHIVOS PRIMERO:**
1. `CLAUDE.md` — Stack y convenciones
2. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 7 (Agente 6 completo con formato del reporte, alertas, código)
3. `ANEXO_X_MULTICHANNEL_MESSAGE_ROUTER.md` — Para entender cómo mandar el mensaje WA a mi número
4. `ANEXO_AB_ESCALABILIDAD_INFRAESTRUCTURA.md` — Métricas de infraestructura a monitorear

**QUÉ NECESITO QUE HAGAS:**

1. **`AnalyticsAgentService`** en NestJS
   - Cron diario a las 8am Argentina: `@Cron('0 8 * * *', { timeZone: 'America/Argentina/Buenos_Aires' })`
   - Recopila métricas de TODAS las tablas relevantes
   - Formatea como mensaje de WhatsApp (texto plano con emojis, no HTML)
   - Me lo manda a mi número vía el WhatsAppAdapter del Message Router

2. **Métricas a recopilar** (cada una con su query a Supabase):
   - Usuarias: nuevas hoy (por país), activas 7d, tasa onboarding completado
   - Canales: activas por canal (WA, IG, FB, app)
   - Descuentos: activos por status, scraping del día (éxitos/fallos), reportes pendientes
   - Yapa: consultas hoy, cache hit rate, costo Claude estimado
   - Google Maps: calls hoy, cache hit rate
   - Costos: estimación del día (Claude + Maps + WA)
   - Pendientes: promos comunitarias para revisar, contenido draft, alertas activas
   - Waitlist: total por país, crecimiento diario
   - Hitos: cuánto falta para el siguiente milestone

3. **Sistema de alertas inmediatas**
   - Se llaman desde otros servicios (AG1 si scraper falla, AG4 si hay muchos reportes, etc.)
   - `sendAlert(level: 'red' | 'yellow' | 'green', message: string)`
   - Me manda WhatsApp inmediato con emoji de color + descripción
   - Las 6 alertas definidas en el Anexo AD sección 7

4. **Variable de entorno:** `NICO_PHONE_NUMBER` y `DAILY_COST_ALERT_THRESHOLD`

**REGLAS:**
- El reporte SIEMPRE llega a las 8am, aunque todo esté bien (quiero verlo igual)
- Las alertas rojas se mandan INMEDIATO sin esperar al reporte diario
- El formato es texto plano para WhatsApp — emojis sí, markdown no, links clickeables sí
- El reporte no debe superar 1 mensaje de WA (no mandar 5 mensajes seguidos)
- Respetar convenciones de CLAUDE.md
- Dame código completo y tests

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- ¿Reporte global o por país cuando tenga 5 países? ¿O uno resumido + opción de pedir detalle?
- ¿Predicción además de reporte? "A este ritmo llegás a 5.000 activas en 23 días."
- ¿Anomaly detection? Detectar spikes o caídas anormales y alertar.
- ¿Cost forecasting? Proyectar cuánto va a costar cada API el mes que viene según growth rate.
- ¿Reporte automático para inversores? Un botón que genera PDF con métricas, gráficos, y proyecciones.
- ¿Health score de cada agente? Monitorear que los otros 7 agentes estén funcionando bien.

═══════════════════════════════════════════════════════════════ — AGENTE 7: BOT DE ADQUISICIÓN (Instagram/Facebook)
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como growth hacker especialista en bots conversacionales de adquisición para Instagram y Facebook, con experiencia en ManyChat y Meta Business Platform.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más). Necesito un bot en Instagram DM (y después Facebook Messenger) que convierta viewers de Reels en usuarias registradas SIN que descarguen la app. La persona interactúa solo por DM, le dice sus tarjetas y billeteras, y recibe descuentos personalizados en 60 segundos. Después elige si quiere seguir por Instagram, por WhatsApp, o bajarse la app.

**LEÉ ESTOS ARCHIVOS PRIMERO:**
1. `CLAUDE.md` — Stack y convenciones
2. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 8 (Agente 7)
3. `ANEXO_Y_BOT_ADQUISICION_INSTAGRAM.md` — Flujo COMPLETO de 8 pasos con guiones, integración ManyChat, configuración de ads, métricas, adaptación por país
4. `ANEXO_X_MULTICHANNEL_MESSAGE_ROUTER.md` — Para la fase 2 cuando migre de ManyChat al backend propio

**QUÉ NECESITO QUE HAGAS:**

1. **Fase 1 — ManyChat** (implementar primero, es lo más rápido)
   - Diseñame el flujo completo paso a paso para construir en el builder visual de ManyChat
   - Cada nodo: qué tipo es (mensaje, input, condición, API call), qué dice, qué opciones tiene
   - La configuración de "Keyword Automation" para el trigger (alguien comenta "AHORRO")
   - La configuración del "External Request" al paso 5 (llama a mi backend para obtener descuentos)

2. **Endpoint en el backend para ManyChat**
   - `POST /api/v1/messaging/bot-query` — @Public(), protegido con API key en header
   - Recibe: `{ city, province, banks[], cards[], wallets[] }`
   - Hace matching de descuentos con `matching.service.ts` existente
   - Retorna: top 5 descuentos formateados + ahorro estimado total
   - El formato de respuesta debe ser texto que ManyChat pueda mostrar directo

3. **Configuración de Instagram Ads**
   - Estructura de campañas (ad sets por edad, ciudad)
   - Configuración del objetivo "Messages"
   - Targeting para Argentina primero, después template para otros países
   - Presupuesto recomendado: $5-10 USD/día

4. **Adaptación por país**
   - Tabla de diferencias: qué bancos/billeteras mostrar en cada país
   - Cómo duplicar el flujo de ManyChat para un país nuevo en <1 hora

**REGLAS:**
- La persona NUNCA tiene que descargar nada para recibir valor
- El primer resultado personalizado tiene que llegar en <60 segundos desde que empezó el chat
- Siempre preguntar al final "¿Por dónde preferís que te avise? Instagram o WhatsApp?"
- El bot habla como Yapa — amigable, directo, con emojis moderados
- Dame todo: flujo ManyChat detallado, código del endpoint, config de ads, y tests

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- ¿El bot también funciona por WhatsApp? Si alguien manda "Hola" al número de Yapa, ¿arranca el mismo onboarding?
- ¿Re-engagement? Si la persona empezó el onboarding pero no lo terminó, ¿AG7 la retoma al día siguiente?
- ¿Referral dentro del bot? Al final: "Mandále este link a una amiga y las dos reciben premium gratis."
- ¿Mini-quiz viral antes del onboarding? "¿Cuánto creés que te perdés por mes?" → la respuesta sorprende → la persona quiere saber más.
- ¿Bot que aprende? Si muchas abandonan en el paso 3, AG7 detecta el drop-off y alerta.
- ¿Data del bot alimenta a AG8? Los bancos más elegidos en el onboarding = inteligencia de mercado gratis por país.

═══════════════════════════════════════════════════════════════ — AGENTE 8: MARKET INTELLIGENCE
### (Copiar todo lo que está entre las líneas ═══)

═══════════════════════════════════════════════════════════════

Actuás como director de inteligencia de mercados para una fintech en expansión internacional. Combinás análisis estratégico con implementación técnica — no solo analizás, construís los sistemas que analizan automáticamente.

**CONTEXTO DEL PROYECTO:**
Soy Nico, fundador de -es+ (menos es más). Opero solo y estoy expandiendo a 7 países (Argentina activo, Chile/Uruguay/Colombia/Brasil/México/EEUU en pipeline). Necesito un agente que investigue, analice y monitoree cada mercado automáticamente, me diga cuándo un país está listo para lanzar, qué falta, y cuál es el plan de acción. Este agente es mi director de inteligencia — el que me dice "Chile está al 62% de readiness y subiendo. En 3 semanas llega a 500 waitlist. ¿Activamos?"

**LEÉ ESTOS ARCHIVOS PRIMERO:**
1. `CLAUDE.md` — Stack y convenciones
2. `ANEXO_AD_EMPRESA_DE_AGENTES.md` — Sección 9 (Agente 8 COMPLETO con las 5 funciones, readiness score, código, tabla SQL)
3. `ANEXO_AA_ATLAS_MERCADOS_INTERNACIONALES.md` — La base de datos de mercados (bancos, billeteras, cadenas por país)
4. `ANEXO_Z_LANDING_MULTIPAIS_WAITLIST.md` — Tabla waitlist_subscribers, cómo se capturan leads por país
5. `ANEXO_AB_ESCALABILIDAD_INFRAESTRUCTURA.md` — Para entender limitaciones y costos por mercado

**QUÉ NECESITO QUE HAGAS:**

1. **`MarketIntelligenceService`** en NestJS con las 5 funciones:

   a) **Scout de bancos** — Cron semanal
      - Para cada banco en el Atlas con status "pendiente": visitar URL, verificar si es scrapeable, puntuar de 1-10, actualizar Atlas
      - Usar Firecrawl para verificar si la web carga y qué estructura tiene
      - Guardar resultado en tabla `market_intelligence`

   b) **Monitor de waitlist** — Cron diario
      - Contar suscriptores por país, calcular growth rate semanal
      - Detectar spikes (>20% crecimiento en un día = algo pasó)
      - Si un país supera 500 → trigger alerta a AG6

   c) **Readiness Score** — Cálculo bajo demanda y semanal
      - 8 factores ponderados (scrapers 25%, waitlist 15%, waitlist growth 10%, discount data 20%, yapa localized 10%, bot configured 5%, landing live 5%, atlas complete 10%)
      - Resultado: 0-100% con semáforo (rojo <40%, amarillo 40-70%, verde 70-90%, lanzar >90%)
      - Almacenar históricamente para ver tendencia

   d) **Competitive watch** — Cron quincenal
      - Buscar en web: "[país] app descuentos tarjetas", "[country] credit card rewards app"
      - Claude Sonnet analiza resultados y detecta competidores nuevos o cambios relevantes
      - Reportar a AG6 si hay novedad

   e) **Regulación y riesgo** — Cron mensual
      - Buscar noticias: "regulación fintech [país]", "protección datos [país]"
      - Claude analiza si hay algo que nos afecte
      - Reportar solo si hay acción requerida

2. **Reporte semanal de inteligencia** — Se manda por WhatsApp vía AG6
   - Readiness bars ASCII por país
   - Novedades de la semana
   - Acciones recomendadas
   - Próximo país recomendado para lanzar

3. **Tabla `market_intelligence`** en Supabase (SQL del Anexo AD sección 9)

4. **Tabla `country_config`** en Supabase para trackear la configuración de cada país:
   ```
   country_code, has_scrapers, scrapers_ready, scrapers_total, 
   has_localized_prompt, has_bot_flow, has_landing, 
   atlas_completeness, readiness_score, last_calculated_at
   ```

5. **Endpoints admin**
   - `GET /api/v1/admin/intelligence/dashboard` — readiness de todos los países
   - `GET /api/v1/admin/intelligence/country/:code` — detalle de un país
   - `POST /api/v1/admin/intelligence/scan/:code` — forzar escaneo de un país ahora

**REGLAS:**
- Este agente NUNCA lanza un país automáticamente — solo recomienda y yo decido
- El readiness score debe ser honesto — si falta algo crítico (scrapers), el score no puede ser >40% aunque el resto esté perfecto
- El competitive watch NO debe buscar en sitios que requieran login
- Respetar convenciones de CLAUDE.md
- Dame código completo, SQL de todas las tablas nuevas, y tests
- Este es el agente más complejo — tomáte el tiempo que necesites para hacerlo bien

**ANTES DE CODEAR, DISCUTÍ CONMIGO ESTOS PUNTOS:**
- ¿Readiness por país o por ciudad? En Argentina es por ciudad (por los bancos provinciales). ¿En otros países también? Leé la Adenda de Potenciación del Anexo AD para el mapa de bancos provinciales.
- ¿AG8 puede recomendar partnerships? Si detecta que un banco tiene programa de innovación abierta, ¿me avisa?
- ¿Data del bot de IG (AG7) como input? Los bancos más elegidos en onboarding = inteligencia de mercado gratis.
- ¿Scraping preventivo? Antes de decidir entrar a un país, AG8 ya probó si los bancos son scrapeables.
- ¿Timing de mercado? Detectar eventos (Black Friday, vuelta al cole) que creen ventana de oportunidad.
- ¿Benchmark cross-country? Comparar CAC, revenue/user, penetración entre países para decidir dónde invertir.
- ¿Regulatory early warning? Monitorear sitios de reguladores financieros, no solo noticias.
- ¿Network mapping en LinkedIn? Mapear personas clave en bancos target (sin contactar, solo listar).
- ¿Detección de demanda espontánea? Si llegan DMs de un país donde no estamos, ¿AG8 lo detecta?

═══════════════════════════════════════════════════════════════
