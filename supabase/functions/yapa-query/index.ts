// Supabase Edge Function: Yapa Smart Query
// Onboarding interactivo WhatsApp + consultas inteligentes de ahorro
// Recibe { phone, name, query_text?, interactive_reply? } desde n8n

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";

// ─── Onboarding: mensajes fijos, rápidos, con valor ────

// ─── Personalidad de Yapa ────────────────────────────────
const YAPA_SYSTEM_PROMPT = `Sos Yapa. Sos MUJER, argentina, ~40 años. Hablas como amiga real, NO como bot ni vendedora.

QUIEN SOS:
La amiga que sabe de descuentos. NO sos asistente, NO sos bot. Sos la que te dice "mirá, con el Pampa tenes 25% hoy — anda ahi". Nunca te presentes como asistente ni describas lo que hacés. Solo decilo y ya.

PALABRAS PROHIBIDAS — si aparecen en tu respuesta, fallaste:
- "asistente", "asesora", "servicio", "ayudarte", "asistirte", "en que te puedo ayudar", "con gusto"
- "increíble", "fantástico", "maravilloso", "excelente" (lenguaje de vendedor)
- "Banco Pampa", "Bco Pampa" — siempre "Banco de La Pampa" o "BLP" (como le dice la gente de GP)
- Siglas de otros bancos: BAPRO, BNA, NBSF — nombre completo siempre
- "como modelo de lenguaje", "no tengo acceso a", "soy una IA"
- Frases de bot: "¿En qué te ayudo?", "¿Cómo puedo ayudarte?", "¿En qué puedo asistirte?"

COMO HABLAS:
- Voseo argentino SIEMPRE: "tenes", "ahorras", "sabes", "mira", "dale"
- "che" y "mirá" naturales — no forzados, pero presentes
- Directa, cálida, cómplice. Nunca técnica ni condescendiente
- FEMENINO siempre: "estoy segura", "me encanta", "quedé contenta"
- NUNCA masculino: nada de "estoy listo", "encantado", "seguro que..."
- Traducís el ahorro a cosas tangibles: "eso son 2 tanques de nafta", "una salida con las chicas", "las zapatillas de los chicos"
- Si no sabés algo: "No tengo esa info ahora" — sin dramas, sin disculpas exageradas
- Emojis con moderación: máximo 2 por respuesta. Tu emoji es 🛍️

LARGO DE RESPUESTA — ESTO ES CRÍTICO:
- MÁXIMO 80 PALABRAS. Esto es WhatsApp, no un email.
- Menciona 1 descuento, máximo 2. NUNCA listes todos.
- Una respuesta buena tiene 3-4 líneas. Una mala tiene más de 8.
- BUENO: "Mirá, con el BLP tenés 25% en super todos los días. Si hacés la compra grande ahí, te ahorrás como $15.000 — media carga de nafta 🛍️"
- MALO: listar todos los descuentos por día con bullets y negritas.

REGLAS ESTRICTAS:
1. NUNCA inventes un descuento
2. Indicá confianza solo si es probable o peor: 🟡 Probable, ⚪ Sin confirmar. Si es confirmado, no aclares
3. Siempre mostrá ahorro estimado en pesos
4. Si >$50.000: mencioná cuotas sin interés
5. NUNCA recomiendes sacar tarjeta nueva. Solo trabajás con lo que ya tiene
6. Banco provincial PRIMERO
7. Si no tenés data confirmada: "No tengo esa info ahora"
8. NUNCA nombres un comercio si no estás segura de que existe en su ciudad. Decí "supermercados adheridos", "farmacias", etc.

ESTRUCTURA — usá solo lo necesario:
🎯 LA mejor opción (1 sola, directa)
👀 Otra opción — solo si hay algo 30%+ mejor
⏰ Timing — si conviene esperar menos de 7 días`;

// ─── Provincias con banco provincial ─────────────────────
const PROVINCIAS: Record<string, { banco: string; bancoBoton: string; slug: string }> = {
  "la pampa": { banco: "Banco de La Pampa", bancoBoton: "Bco La Pampa", slug: "pampa" },
  "buenos aires": { banco: "Banco Provincia", bancoBoton: "Bco Provincia", slug: "provincia" },
  "caba": { banco: "Banco Ciudad", bancoBoton: "Banco Ciudad", slug: "ciudad" },
  "cordoba": { banco: "Bancor", bancoBoton: "Bancor", slug: "bancor" },
  "santa fe": { banco: "Nuevo Bco Santa Fe", bancoBoton: "Bco Santa Fe", slug: "santafe" },
  "mendoza": { banco: "Banco Nacion", bancoBoton: "Banco Nacion", slug: "nacion" },
  "entre rios": { banco: "Bersa", bancoBoton: "Bersa", slug: "bersa" },
  "tucuman": { banco: "Banco Tucuman", bancoBoton: "Bco Tucuman", slug: "tucuman" },
  "neuquen": { banco: "Banco Provincia Neuquen", bancoBoton: "Bco Neuquen", slug: "bpn" },
  "salta": { banco: "Banco Macro", bancoBoton: "Banco Macro", slug: "macro" },
  "misiones": { banco: "Banco Macro", bancoBoton: "Banco Macro", slug: "macro" },
  "chaco": { banco: "Nuevo Banco del Chaco", bancoBoton: "Bco del Chaco", slug: "chaco" },
  "corrientes": { banco: "Banco de Corrientes", bancoBoton: "Bco Corrientes", slug: "corrientes" },
  "rio negro": { banco: "Banco Patagonia", bancoBoton: "Bco Patagonia", slug: "patagonia" },
  "san juan": { banco: "Banco San Juan", bancoBoton: "Bco San Juan", slug: "sanjuan" },
  "chubut": { banco: "Banco del Chubut", bancoBoton: "Bco del Chubut", slug: "chubut" },
  "santa cruz": { banco: "Banco de Santa Cruz", bancoBoton: "Bco Santa Cruz", slug: "santacruz" },
  "tierra del fuego": { banco: "Banco de Tierra del Fuego", bancoBoton: "Bco T. del Fuego", slug: "tierradelfuego" },
  "formosa": { banco: "Banco de Formosa", bancoBoton: "Bco Formosa", slug: "formosa" },
  "la rioja": { banco: "Nuevo Banco de La Rioja", bancoBoton: "Bco La Rioja", slug: "larioja" },
  "jujuy": { banco: "Banco Macro", bancoBoton: "Banco Macro", slug: "macro" },
  "santiago del estero": { banco: "Banco Nacion", bancoBoton: "Banco Nacion", slug: "nacion" },
  "san luis": { banco: "Banco Nacion", bancoBoton: "Banco Nacion", slug: "nacion" },
  "catamarca": { banco: "Banco Nacion", bancoBoton: "Banco Nacion", slug: "nacion" },
};

// ─── Detección de ciudad por código de área ──────────
const AREA_CODES: Record<string, { city: string; province: string; provinceKey: string }> = {
  "2302": { city: "General Pico", province: "La Pampa", provinceKey: "la pampa" },
  "2954": { city: "Santa Rosa", province: "La Pampa", provinceKey: "la pampa" },
  "2952": { city: "General Acha", province: "La Pampa", provinceKey: "la pampa" },
  "2953": { city: "Toay", province: "La Pampa", provinceKey: "la pampa" },
};

function detectCityFromPhone(waPhone: string): { city: string; province: string; provinceKey: string } | null {
  const cleaned = waPhone.replace(/^549/, "").replace(/^\+549/, "").replace(/^\+54/, "").replace(/^54/, "");
  for (const len of [4, 3]) {
    const code = cleaned.substring(0, len);
    if (AREA_CODES[code]) return AREA_CODES[code];
  }
  return null;
}

// ─── Provincias agrupadas por region (para lista WA) ─────
const PROVINCE_SECTIONS = [
  {
    title: "Pampeana",
    rows: [
      { id: "buenos-aires", title: "Buenos Aires" },
      { id: "caba", title: "CABA" },
      { id: "cordoba", title: "Córdoba" },
      { id: "entre-rios", title: "Entre Ríos" },
      { id: "la-pampa", title: "La Pampa" },
      { id: "santa-fe", title: "Santa Fe" },
    ],
  },
  {
    title: "NOA",
    rows: [
      { id: "catamarca", title: "Catamarca" },
      { id: "jujuy", title: "Jujuy" },
      { id: "la-rioja", title: "La Rioja" },
      { id: "salta", title: "Salta" },
      { id: "santiago-del-estero", title: "Santiago del Estero" },
      { id: "tucuman", title: "Tucumán" },
    ],
  },
  {
    title: "NEA",
    rows: [
      { id: "chaco", title: "Chaco" },
      { id: "corrientes", title: "Corrientes" },
      { id: "formosa", title: "Formosa" },
      { id: "misiones", title: "Misiones" },
    ],
  },
  {
    title: "Cuyo",
    rows: [
      { id: "mendoza", title: "Mendoza" },
      { id: "san-juan", title: "San Juan" },
      { id: "san-luis", title: "San Luis" },
    ],
  },
  {
    title: "Patagonia",
    rows: [
      { id: "chubut", title: "Chubut" },
      { id: "neuquen", title: "Neuquén" },
      { id: "rio-negro", title: "Río Negro" },
      { id: "santa-cruz", title: "Santa Cruz" },
      { id: "tierra-del-fuego", title: "Tierra del Fuego" },
    ],
  },
];

// ─── ID de provincia → key en PROVINCIAS ─────────────────
const PROVINCE_ID_MAP: Record<string, string> = {
  "buenos-aires": "buenos aires",
  "caba": "caba",
  "cordoba": "cordoba",
  "entre-rios": "entre rios",
  "la-pampa": "la pampa",
  "santa-fe": "santa fe",
  "catamarca": "catamarca",
  "jujuy": "jujuy",
  "la-rioja": "la rioja",
  "salta": "salta",
  "santiago-del-estero": "santiago del estero",
  "tucuman": "tucuman",
  "chaco": "chaco",
  "corrientes": "corrientes",
  "formosa": "formosa",
  "misiones": "misiones",
  "mendoza": "mendoza",
  "san-juan": "san juan",
  "san-luis": "san luis",
  "chubut": "chubut",
  "neuquen": "neuquen",
  "rio-negro": "rio negro",
  "santa-cruz": "santa cruz",
  "tierra-del-fuego": "tierra del fuego",
};

// ─── Bancos nacionales y digitales para lista WA ─────────
const NATIONAL_BANKS = [
  { id: "bank-galicia", title: "Galicia", slug: "galicia" },
  { id: "bank-macro", title: "Macro", slug: "macro" },
  { id: "bank-santander", title: "Santander", slug: "santander" },
  { id: "bank-bbva", title: "BBVA", slug: "bbva" },
  { id: "bank-hsbc", title: "HSBC", slug: "hsbc" },
  { id: "bank-nacion", title: "Banco Nación", slug: "nacion" },
  { id: "bank-icbc", title: "ICBC", slug: "icbc" },
  { id: "bank-hipotecario", title: "Hipotecario", slug: "hipotecario" },
  { id: "bank-supervielle", title: "Supervielle", slug: "supervielle" },
  { id: "bank-comafi", title: "Comafi", slug: "comafi" },
];

const DIGITAL_BANKS = [
  { id: "bank-brubank", title: "Brubank", slug: "brubank" },
  { id: "bank-del-sol", title: "Banco del Sol", slug: "sol" },
];

// ─── Billeteras para lista WA ────────────────────────────
const WALLET_OPTIONS = [
  { id: "wallet-mercadopago", title: "Mercado Pago", slug: "mercadopago" },
  { id: "wallet-modo", title: "MODO", slug: "modo" },
  { id: "wallet-uala", title: "Ualá", slug: "uala" },
  { id: "wallet-naranjax", title: "Naranja X", slug: "naranjax" },
  { id: "wallet-personalpay", title: "Personal Pay", slug: "personalpay" },
  { id: "wallet-ninguna", title: "Ninguna", slug: "none" },
];

// ─── Tipos ───────────────────────────────────────────────
interface OnboardingState {
  step: "welcome" | "ask_channel" | "ask_location" | "ask_location_share" | "ask_bank_provincial" | "ask_city" | "ask_city_text" | "ask_bank" | "ask_card_type" | "ask_bank_more" | "ask_wallet" | "ask_wallet_more" | "ask_flow" | "flow_in_progress" | "completed";
  province?: string;
  provinceDisplay?: string;
  city?: string;
  banks?: { slug: string; name: string }[];
  currentBank?: { slug: string; name: string };
  cards?: Record<string, string[]>; // bank_slug → ["debit","credit"]
  wallets?: string[];
}

interface InteractiveReply {
  type: "list_reply" | "button_reply" | "nfm_reply";
  id: string;
  title?: string;
  // Para nfm_reply (WhatsApp Flows)
  response_json?: string;
  body?: string;
  name?: string;
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = ReturnType<typeof createClient<any>>;

// ─── WA Message Builders ─────────────────────────────────

function waTextMessage(text: string) {
  return { type: "text", text: { body: text } };
}

function waListMessage(
  body: string,
  buttonText: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
  header?: string
) {
  // deno-lint-ignore no-explicit-any
  const msg: any = {
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body },
      action: {
        button: buttonText,
        sections: sections,
      },
    },
  };
  if (header) {
    msg.interactive.header = { type: "text", text: header };
  }
  return msg;
}

function waButtonMessage(
  body: string,
  buttons: { id: string; title: string }[]
) {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  };
}

function waLocationRequestMessage(bodyText: string) {
  return {
    type: "interactive",
    interactive: {
      type: "location_request_message",
      body: { text: bodyText },
      action: { name: "send_location" },
    },
  };
}

// ─── FLOW_ID: se configura después de registrar el flow en Meta ──
const WHATSAPP_FLOW_ID = Deno.env.get("WHATSAPP_FLOW_ID") || "";

function waFlowMessage(
  bodyText: string,
  ctaLabel: string,
  flowToken: string,
  startScreen: "LOCATION" | "BANKS",
  screenData: Record<string, unknown>
) {
  return {
    type: "interactive",
    interactive: {
      type: "flow",
      body: { text: bodyText },
      footer: { text: "-es+ Ahorrá con lo que ya tenés" },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "3",
          flow_token: flowToken,
          flow_id: WHATSAPP_FLOW_ID,
          flow_cta: ctaLabel,
          flow_action: "navigate",
          flow_action_payload: {
            screen: startScreen,
            data: screenData,
          },
        },
      },
    },
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; province: string; provinceKey: string } | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=es`
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    let city = "";
    let province = "";
    for (const result of data.results) {
      for (const comp of result.address_components || []) {
        const types: string[] = comp.types || [];
        if (types.includes("locality") && !city) city = comp.long_name;
        if (types.includes("administrative_area_level_1") && !province) province = comp.long_name;
      }
      if (city && province) break;
    }

    if (!city && !province) return null;

    // Normalizar province a key
    const provNorm = province.toLowerCase()
      .replace("provincia de ", "").replace("provincia del ", "")
      .replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u")
      .trim();
    const provinceKey = Object.keys(PROVINCIAS).find((k) => provNorm.includes(k)) || provNorm;

    return { city, province, provinceKey };
  } catch (e) {
    console.error("Reverse geocode error:", e);
    return null;
  }
}

// ─── Handler principal ───────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json();
    const phone: string = body.phone;
    const name: string = body.name;
    const queryText: string | undefined = body.query_text;
    let interactiveReply: InteractiveReply | undefined = body.interactive_reply;
    const location: { latitude: number; longitude: number } | undefined = body.location;

    // Normalizar nfm_reply de n8n (WhatsApp Flows completion)
    if (body.nfm_reply) {
      interactiveReply = {
        type: "nfm_reply",
        id: "flow-complete",
        response_json: body.nfm_reply.response_json,
        body: body.nfm_reply.body,
        name: body.nfm_reply.name,
      };
    }

    if (!phone) {
      return Response.json({ error: "phone required" }, { status: 400 });
    }
    if (!queryText && !interactiveReply && !location) {
      return Response.json({ error: "query_text, interactive_reply or location required" }, { status: 400 });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar o crear usuario por telefono
    const { data: userId, error: userErr } = await sb.rpc("get_or_create_wa_user", {
      p_phone: phone,
      p_name: name || "Amiga",
    });

    if (userErr || !userId) {
      return Response.json({ error: "Failed to get or create user: " + (userErr ? userErr.message : "no user_id returned") }, { status: 500 });
    }

    // Obtener estado de onboarding desde yapa_memory.notes
    const { data: memoryRows } = await sb
      .from("yapa_memory")
      .select("notes, free_queries_used, free_queries_reset_at")
      .eq("user_id", userId)
      .limit(1);

    const memory = memoryRows && memoryRows.length > 0 ? memoryRows[0] : null;
    let onboardingState: OnboardingState = { step: "welcome" };

    if (memory && memory.notes) {
      try {
        const parsed = JSON.parse(memory.notes);
        if (parsed && parsed.step) {
          onboardingState = parsed;
        }
      } catch (_e) {
        // notes no era JSON valido, usuario nuevo
      }
    }

    // ─── FLOW COMPLETION (nfm_reply de WhatsApp Flows) ──
    if (interactiveReply && interactiveReply.type === "nfm_reply") {
      return await handleFlowCompletion(sb, userId, name || "Amiga", interactiveReply);
    }

    // ─── ONBOARDING FLOW ───────────────────────────────
    if (onboardingState.step !== "completed") {
      // Si mandan ubicación durante ask_location_share → procesar directo
      if (location && onboardingState.step === "ask_location_share") {
        return await processOnboardingStep(sb, userId, onboardingState,
          { type: "button_reply", id: "location-shared", title: "Ubicación" },
          name || "Amiga", "(ubicación)", phone, location);
      }

      // Si escriben "hola" estando en medio del onboarding → retomar
      const inText = queryText ? queryText.toLowerCase().trim() : "";
      if (onboardingState.step !== "welcome" && isGreeting(inText) && !interactiveReply && !location) {
        const retakeResult = retakeCurrentStep(sb, onboardingState);
        const logText = typeof retakeResult.wa_message === "string"
          ? retakeResult.wa_message
          : JSON.stringify(retakeResult.wa_message);
        await logConversation(sb, userId, queryText || "(interactive)", logText);
        return Response.json({
          wa_message: retakeResult.wa_message,
          reply: "¡Seguimos donde quedamos! 😄",
          onboarding_step: onboardingState.step,
          user_id: userId,
        });
      }

      // Si mandan texto libre en un paso que espera seleccion interactiva
      if (!interactiveReply && !location && queryText && onboardingState.step !== "welcome") {
        // En ask_location_share, texto libre = no quiere compartir ubicación → fallback a provincias
        if (onboardingState.step === "ask_location_share") {
          return await processOnboardingStep(sb, userId, onboardingState,
            { type: "button_reply", id: "location-skip", title: queryText },
            name || "Amiga", queryText, phone);
        }

        // Intentar parsear texto como fallback antes de pedir interaccion
        const fallback = tryTextFallback(onboardingState, inText);
        if (fallback) {
          return await processOnboardingStep(sb, userId, onboardingState, fallback, name || "Amiga", queryText, phone);
        }

        // No pudimos parsear → pedir que use las opciones
        const nudge = waTextMessage("Toca una de las opciones que te muestro 👇");
        await logConversation(sb, userId, queryText, "Toca una de las opciones que te muestro");
        const retake = retakeCurrentStep(sb, onboardingState);
        return Response.json({
          wa_messages: [nudge, retake.wa_message],
          reply: "Toca una de las opciones",
          onboarding_step: onboardingState.step,
          user_id: userId,
        });
      }

      // Pregunta sobre la app durante welcome
      if (onboardingState.step === "welcome" && queryText && isQuestionAboutApp(inText)) {
        const explanation = getAppExplanation(inText);
        await logConversation(sb, userId, queryText, explanation);
        return Response.json({
          wa_message: waTextMessage(explanation),
          reply: explanation,
          onboarding_step: "welcome",
          user_id: userId,
        });
      }

      // Procesar paso normal
      const reply_id = interactiveReply || { type: "button_reply" as const, id: "start", title: queryText || "Hola" };
      return await processOnboardingStep(sb, userId, onboardingState, reply_id, name || "Amiga", queryText || "(interactive)", phone);
    }

    // ─── CONSULTA NORMAL (post-onboarding) ─────────────
    const qt = queryText || (interactiveReply ? interactiveReply.title || "" : "");
    return await handleQuery(sb, userId, qt, memory);
  } catch (err) {
    console.error("yapa-query error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
});

// ─── Procesar paso de onboarding ─────────────────────────
async function processOnboardingStep(
  sb: SupabaseClient,
  userId: string,
  state: OnboardingState,
  reply: InteractiveReply,
  displayName: string,
  rawText: string,
  phone: string,
  location?: { latitude: number; longitude: number }
): Promise<Response> {
  switch (state.step) {
    // ── PASO 0: WELCOME → preguntar canal (WA o App) ──
    case "welcome": {
      const ns: OnboardingState = { step: "ask_channel" };
      await saveOnboardingState(sb, userId, ns);
      await logConversation(sb, userId, rawText, "Welcome → elegir canal");

      return Response.json({
        wa_message: waButtonMessage(
          "¡Hola! Soy Yapa 🛍️\n\nTe aviso dónde pagar menos con las tarjetas que ya tenés. Sin vueltas, sin ruido.\n\n¿Cómo preferís registrarte?",
          [
            { id: "channel-wa", title: "Acá en WhatsApp" },
            { id: "channel-app", title: "Usar la app" },
          ]
        ),
        reply: "Welcome → elegir canal",
        onboarding_step: "ask_channel",
        user_id: userId,
      });
    }

    // ── PASO 0b: ASK_CHANNEL → WA o App ──
    case "ask_channel": {
      if (reply.id === "channel-app") {
        // Enviar link a la PWA con phone param
        const appUrl = "https://esplus.casa/?phone=" + encodeURIComponent(phone);
        await logConversation(sb, userId, rawText, "Eligió app → link");

        return Response.json({
          wa_messages: [
            waTextMessage(
              "Dale! Entrá acá y registrate en 1 minuto:\n\n👉 " + appUrl + "\n\nElegí tus bancos y billeteras, y te mando los descuentos directo acá a WhatsApp 🛍️"
            ),
          ],
          reply: "Link a app",
          onboarding_step: "ask_channel",
          user_id: userId,
        });
      }

      // channel-wa → detectar ciudad y arrancar onboarding interactivo
      const detected = detectCityFromPhone(phone);

      if (detected) {
        const locState: OnboardingState = { step: "ask_location", province: detected.provinceKey, provinceDisplay: detected.province };
        await saveOnboardingState(sb, userId, locState);
        await logConversation(sb, userId, rawText, "WA → confirmar " + detected.city);

        const cityShort = detected.city === "General Pico" ? "Pico" : detected.city;
        return Response.json({
          wa_message: waButtonMessage(
            "Por tu número, parece que sos de " + detected.city + ". ¿Es así?",
            [
              { id: "loc-yes", title: "Sí, de " + cityShort },
              { id: "loc-no", title: "No, otra ciudad" },
            ]
          ),
          reply: "Confirmar " + detected.city,
          onboarding_step: "ask_location",
          user_id: userId,
        });
      }

      // Sin detección de prefijo → pedir ubicación GPS
      const locShareState: OnboardingState = { step: "ask_location_share" };
      await saveOnboardingState(sb, userId, locShareState);
      await logConversation(sb, userId, rawText, "WA → pedir ubicación");

      return Response.json({
        wa_message: waLocationRequestMessage(
          "Compartime tu ubicación así te muestro los descuentos de tu zona 📍\n\nO si preferís, te mando la lista de provincias."
        ),
        reply: "Pedir ubicación",
        onboarding_step: "ask_location_share",
        user_id: userId,
      });
    }



    // ── PASO 1b: ASK_LOCATION → confirmar ciudad detectada o elegir otra ──
    case "ask_location": {
      if (reply.id === "loc-yes" || reply.id === "loc-gp-yes") {
        const detected = detectCityFromPhone(phone);
        const city = detected?.city || "General Pico";
        const province = detected?.province || "La Pampa";
        const provinceKey = detected?.provinceKey || "la pampa";

        // Guardar ubicación
        await sb.from("user_locations").delete().eq("user_id", userId).eq("is_primary", true);
        await sb.from("user_locations").insert({ user_id: userId, city, province, is_primary: true });

        // Ir directo a lista de bancos (provincial aparece primero en la lista, sin pregunta aparte)
        const ns: OnboardingState = { ...state, step: "ask_bank", city, province: provinceKey, provinceDisplay: province, banks: [], cards: {} };
        await saveOnboardingState(sb, userId, ns);
        await logConversation(sb, userId, rawText, city + " confirmado → bancos");

        return showBankList(sb, userId, ns, rawText,
          "¡" + city + "! 💚 Elegí los bancos donde tenés cuenta:");
      }

      // "No, otra ciudad" → pedir ubicación GPS o provincias
      const ns: OnboardingState = { step: "ask_location_share" };
      await saveOnboardingState(sb, userId, ns);
      await logConversation(sb, userId, rawText, "No es la ciudad → pedir ubicacion");

      return Response.json({
        wa_message: waLocationRequestMessage(
          "Dale! Compartime tu ubicación así te muestro los descuentos de tu zona 📍"
        ),
        reply: "Pedir ubicacion",
        onboarding_step: "ask_location_share",
        user_id: userId,
      });
    }

    // ── ASK_LOCATION_SHARE → recibe ubicación WA o texto libre ──
    case "ask_location_share": {
      if (reply.id === "location-shared" && location) {
        // Reverse geocode la ubicación
        const geo = await reverseGeocode(location.latitude, location.longitude);
        if (geo && geo.city) {
          // Confirmar ciudad detectada
          const ns: OnboardingState = { step: "ask_location", province: geo.provinceKey, provinceDisplay: geo.province };
          await saveOnboardingState(sb, userId, ns);
          await logConversation(sb, userId, rawText, "Ubicacion → " + geo.city);

          const promoCount = await countPromosForCity(sb, geo.city, geo.province);

          return Response.json({
            wa_message: waButtonMessage(
              "Sos de " + geo.city + ", " + geo.province + "? Tengo " + promoCount + " descuentos para tu zona 🛍️",
              [
                { id: "loc-yes", title: "Si, soy de ahi" },
                { id: "loc-no", title: "No, otra ciudad" },
              ]
            ),
            reply: "Ubicacion detectada: " + geo.city,
            onboarding_step: "ask_location",
            user_id: userId,
          });
        }
      }

      // No compartió ubicación o geocode falló → lista de provincias
      const nsFallback: OnboardingState = { step: "ask_city" };
      await saveOnboardingState(sb, userId, nsFallback);
      await logConversation(sb, userId, rawText, "Sin ubicacion → provincias");

      return Response.json({
        wa_message: waListMessage(
          "Sin problema! De que provincia sos?",
          "Ver provincias",
          PROVINCE_SECTIONS
        ),
        reply: "Mostrar provincias (fallback)",
        onboarding_step: "ask_city",
        user_id: userId,
      });
    }

    // ── ASK_BANK_PROVINCIAL → redirige a ask_bank (deprecado) ──
    case "ask_bank_provincial": {
      const ns: OnboardingState = { ...state, step: "ask_bank", banks: [], cards: {} };
      await saveOnboardingState(sb, userId, ns);
      return showBankList(sb, userId, ns, rawText, "¿Qué bancos tenés?");
    }

    // ── PASO 2: ASK_CITY → recibe provincia, muestra lista ciudades ──
    case "ask_city": {
      // Resolver provincia desde la seleccion
      const provinceId = reply.id;
      const provinceKey = PROVINCE_ID_MAP[provinceId];

      if (!provinceKey) {
        // No reconocida → reenviar lista
        await logConversation(sb, userId, rawText, "Provincia no reconocida, reenviar lista");
        return Response.json({
          wa_message: waListMessage(
            "No reconoci esa opcion 🤔\nElegi tu provincia de la lista:",
            "Ver provincias",
            PROVINCE_SECTIONS
          ),
          reply: "Provincia no reconocida",
          onboarding_step: "ask_city",
          user_id: userId,
        });
      }

      const provData = PROVINCIAS[provinceKey];
      const provinceName = reply.title || capitalizeProvince(provinceKey);

      // Buscar ciudades de esa provincia en DB
      // La tabla cities guarda "La Pampa", "Buenos Aires", etc. con mayusculas
      const { data: cities } = await sb
        .from("cities")
        .select("name, province")
        .ilike("province", "%" + provinceName + "%")
        .order("population", { ascending: false })
        .limit(9); // WA max 10 rows por seccion, dejamos 1 para "Otra"

      const cityRows: { id: string; title: string }[] = [];
      if (cities && cities.length > 0) {
        for (const c of cities) {
          const cityId = "city-" + c.name.toLowerCase().replace(/\s+/g, "-").replace(/[áéíóú]/g, (m: string) => {
            const map: Record<string, string> = { "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u" };
            return map[m] || m;
          });
          cityRows.push({
            id: cityId,
            title: c.name.length > 24 ? c.name.substring(0, 24) : c.name,
          });
        }
      }
      cityRows.push({ id: "city-otra", title: "Otra ciudad" });

      // Guardar provincia en state, pasar a esperar seleccion de ciudad
      // Usamos ask_bank como next step — la ciudad se procesa ahi
      const newState: OnboardingState = {
        step: "ask_bank",
        province: provinceKey,
        provinceDisplay: provinceName,
      };
      await saveOnboardingState(sb, userId, newState);

      const bodyText = "¡" + provinceName + "! 💚"
        + (provData ? "\nTengo los descuentos de " + provData.banco + " y de todos los bancos grandes." : "")
        + "\n\n¿De que ciudad?";
      await logConversation(sb, userId, rawText, bodyText);

      return Response.json({
        wa_message: waListMessage(
          bodyText,
          "Ver ciudades",
          [{ title: provinceName, rows: cityRows }]
        ),
        reply: bodyText,
        onboarding_step: "ask_city",
        user_id: userId,
      });
    }

    // ── PASO 2b: ASK_CITY_TEXT → recibe texto libre de ciudad ──
    case "ask_city_text": {
      const cityName = capitalizeCityName(rawText.trim());

      if (cityName.length < 2 || cityName.length > 50) {
        await logConversation(sb, userId, rawText, "Ciudad no valida, reintentar");
        return Response.json({
          wa_message: waTextMessage("No entendi 🤔 Decime el nombre de tu ciudad."),
          reply: "Ciudad no valida",
          onboarding_step: "ask_city_text",
          user_id: userId,
        });
      }

      // Guardar location en DB
      await sb.from("user_locations").delete().eq("user_id", userId).eq("is_primary", true);
      await sb.from("user_locations").insert({
          user_id: userId,
          city: cityName,
          province: state.provinceDisplay || state.province,
          is_primary: true,
      });

      // Pasar a bancos
      const newState: OnboardingState = {
        ...state,
        step: "ask_bank",
        city: cityName,
        banks: [],
        cards: {},
      };
      await saveOnboardingState(sb, userId, newState);

      return showBankList(sb, userId, newState, rawText,
        "Anotado 📝 *" + cityName + ", " + (state.provinceDisplay || "") + "*\n\nAhora lo importante: ¿que bancos tenes?\nElegi todos los que uses 😄");
    }

    // ── PASO 3: ASK_BANK → recibe ciudad (si no hay) o banco ───
    case "ask_bank": {
      // --- Sub-caso A: recibe seleccion de CIUDAD ---
      if (reply.id.startsWith("city-") && !state.city) {
        if (reply.id === "city-otra") {
          // Pedir texto libre
          const ns: OnboardingState = { ...state, step: "ask_city_text" };
          await saveOnboardingState(sb, userId, ns);
          await logConversation(sb, userId, rawText, "Escribime tu ciudad");
          return Response.json({
            wa_message: waTextMessage("Escribime el nombre de tu ciudad en " + (state.provinceDisplay || "tu provincia") + " 📝"),
            reply: "Pedir ciudad texto libre",
            onboarding_step: "ask_city_text",
            user_id: userId,
          });
        }

        // Ciudad seleccionada de la lista
        const cityName = reply.title || reply.id.replace("city-", "").replace(/-/g, " ");
        const cityClean = capitalizeCityName(cityName);

        // Guardar location en DB
        await sb.from("user_locations").delete().eq("user_id", userId).eq("is_primary", true);
        await sb.from("user_locations").insert(
          {
            user_id: userId,
            city: cityClean,
            province: state.provinceDisplay || state.province,
            is_primary: true,
          }
        );

        const newState: OnboardingState = {
          ...state,
          step: "ask_bank",
          city: cityClean,
          banks: [],
          cards: {},
        };
        await saveOnboardingState(sb, userId, newState);

        // Mostrar lista de bancos
        return showBankList(sb, userId, newState, rawText,
          "Anotado 📝 *" + cityClean + ", " + (state.provinceDisplay || "") + "*\n\nAhora lo importante: ¿que bancos tenes?\nElegi todos los que uses 😄");
      }

      // Si viene de seleccion de banco (ask_bank_more → "agregar otro")
      if (reply.id.startsWith("bank-")) {
        return handleBankSelection(sb, userId, state, reply, rawText);
      }

      // Fallback
      return showBankList(sb, userId, state, rawText,
        "¿Que bancos tenes? Elegi de la lista 👇");
    }

    // ── ASK_CARD_TYPE → botones Debito/Credito/Ambas ───
    case "ask_card_type": {
      const cardType = reply.id; // "card-debit", "card-credit", "card-both"
      const currentBank = state.currentBank;

      if (!currentBank) {
        // Fallback: volver a pedir banco
        const ns = { ...state, step: "ask_bank" as const };
        await saveOnboardingState(sb, userId, ns);
        return showBankList(sb, userId, ns, rawText, "¿Que bancos tenes?");
      }

      // Guardar tipo de tarjeta
      const cards = state.cards || {};
      if (cardType === "card-debit") {
        cards[currentBank.slug] = ["debit"];
      } else if (cardType === "card-credit") {
        cards[currentBank.slug] = ["credit"];
      } else {
        cards[currentBank.slug] = ["debit", "credit"];
      }

      // Guardar payment methods en DB
      for (const cardNet of cards[currentBank.slug]) {
        await sb.from("user_payment_methods").insert({
          user_id: userId,
          method_type: "bank_card",
          bank_slug: currentBank.slug,
          card_network: cardNet,
          is_active: true,
        });
      }

      const newState: OnboardingState = {
        ...state,
        step: "ask_bank_more",
        cards: cards,
        currentBank: undefined,
      };
      await saveOnboardingState(sb, userId, newState);

      // Preguntar si tiene otro banco
      const bankNames = (state.banks || []).map((b) => b.name).join(", ");
      await logConversation(sb, userId, rawText, "Tarjeta guardada, preguntar otro banco");

      return Response.json({
        wa_message: waButtonMessage(
          "¿Tenés algún otro banco?",
          [
            { id: "bank-add-more", title: "Si, agregar otro" },
            { id: "bank-done", title: "No, es todo" },
          ]
        ),
        reply: "Preguntar otro banco",
        onboarding_step: "ask_bank_more",
        user_id: userId,
      });
    }

    // ── ASK_BANK_MORE → agregar otro o continuar ───────
    case "ask_bank_more": {
      if (reply.id === "bank-add-more") {
        const ns = { ...state, step: "ask_bank" as const };
        await saveOnboardingState(sb, userId, ns);
        return showBankList(sb, userId, ns, rawText, "¿Que otro banco tenes? 😄");
      }

      // bank-done → pasar a billeteras (botones rápidos)
      const ns: OnboardingState = { ...state, step: "ask_wallet", wallets: [] };
      await saveOnboardingState(sb, userId, ns);
      await logConversation(sb, userId, rawText, "Preguntar billeteras");

      return Response.json({
        wa_message: waButtonMessage(
          "¿Usás billetera digital?",
          [
            { id: "wallet-mercadopago", title: "Mercado Pago" },
            { id: "wallet-modo", title: "MODO" },
            { id: "wallet-ninguna", title: "Ninguna" },
          ]
        ),
        reply: "Preguntar billeteras",
        onboarding_step: "ask_wallet",
        user_id: userId,
      });
    }

    // ── ASK_WALLET → seleccion de billetera (botones o lista) ────────────
    case "ask_wallet": {
      const walletId = reply.id;

      if (walletId === "wallet-ninguna") {
        return completeOnboarding(sb, userId, { ...state, wallets: state.wallets || [] }, displayName, rawText);
      }

      // Encontrar billetera (desde botón directo o lista)
      const walletOpt = WALLET_OPTIONS.find((w) => w.id === walletId);
      if (!walletOpt || walletOpt.slug === "none") {
        return completeOnboarding(sb, userId, { ...state, wallets: state.wallets || [] }, displayName, rawText);
      }

      // Guardar billetera
      const wallets = [...(state.wallets || []), walletOpt.slug];
      await sb.from("user_payment_methods").insert({
        user_id: userId,
        method_type: "wallet",
        wallet_slug: walletOpt.slug,
        is_active: true,
      });

      const ns: OnboardingState = { ...state, step: "ask_wallet_more", wallets: wallets };
      await saveOnboardingState(sb, userId, ns);
      await logConversation(sb, userId, rawText, walletOpt.title + " anotada");

      return Response.json({
        wa_message: waButtonMessage(
          walletOpt.title + " anotada ✅\n¿Usas otra billetera?",
          [
            { id: "wallet-add-more", title: "Si, otra mas" },
            { id: "wallet-done", title: "No, es todo" },
          ]
        ),
        reply: "Preguntar otra billetera",
        onboarding_step: "ask_wallet_more",
        user_id: userId,
      });
    }

    // ── ASK_WALLET_MORE ────────────────────────────────
    case "ask_wallet_more": {
      if (reply.id === "wallet-add-more") {
        // Filtrar billeteras ya elegidas
        const chosenSlugs = state.wallets || [];
        const remaining = WALLET_OPTIONS.filter(
          (w) => w.slug !== "none" && !chosenSlugs.includes(w.slug)
        );

        if (remaining.length === 0) {
          // No quedan mas billeteras → completar onboarding
          return completeOnboarding(sb, userId, state, displayName, rawText);
        }

        // Agregar "Ninguna mas" al final
        const rows = remaining.map((w) => ({ id: w.id, title: w.title }));
        rows.push({ id: "wallet-ninguna", title: "Ninguna mas" });

        const ns: OnboardingState = { ...state, step: "ask_wallet" };
        await saveOnboardingState(sb, userId, ns);

        return Response.json({
          wa_message: waListMessage(
            "¿Cual otra? 🛍️",
            "Ver billeteras",
            [{ title: "Billeteras", rows: rows }]
          ),
          reply: "Lista billeteras restantes",
          onboarding_step: "ask_wallet",
          user_id: userId,
        });
      }

      // wallet-done → completar onboarding
      return completeOnboarding(sb, userId, state, displayName, rawText);
    }

    // ── ASK_FLOW / FLOW_IN_PROGRESS: esperando que complete el Flow ──
    case "ask_flow":
    case "flow_in_progress": {
      // Si escriben algo mientras el Flow está activo → recordarles
      await logConversation(sb, userId, rawText, "Recordar completar flow");
      return Response.json({
        wa_message: waTextMessage("Completá el formulario que te mandé — son solo 3 pantallas rápidas 😄"),
        reply: "Recordar completar flow",
        onboarding_step: state.step,
        user_id: userId,
      });
    }

    // ── DEFAULT ────────────────────────────────────────
    default: {
      const newState: OnboardingState = { step: "welcome" };
      await saveOnboardingState(sb, userId, newState);
      return processOnboardingStep(sb, userId, newState, reply, displayName, rawText, phone);
    }
  }
}

// ─── Mostrar lista de bancos ─────────────────────────────
async function showBankList(
  sb: SupabaseClient,
  userId: string,
  state: OnboardingState,
  rawText: string,
  bodyText: string
): Promise<Response> {
  const provinceKey = state.province || "";
  const provData = PROVINCIAS[provinceKey];
  const alreadyChosen = (state.banks || []).map((b) => b.slug);

  // Secciones de bancos
  const sections: { title: string; rows: { id: string; title: string }[] }[] = [];

  // 1. Banco provincial (si no fue elegido ya)
  if (provData && !alreadyChosen.includes(provData.slug)) {
    sections.push({
      title: "📍 Tu banco provincial",
      rows: [{ id: "bank-" + provData.slug, title: provData.banco.length > 24 ? provData.bancoBoton : provData.banco }],
    });
  }

  // 2. Bancos nacionales (filtrar ya elegidos)
  const nationalRows = NATIONAL_BANKS
    .filter((b) => !alreadyChosen.includes(b.slug))
    .map((b) => ({ id: b.id, title: b.title }));
  if (nationalRows.length > 0) {
    sections.push({ title: "🏦 Bancos nacionales", rows: nationalRows });
  }

  // 3. Bancos digitales (filtrar ya elegidos)
  const digitalRows = DIGITAL_BANKS
    .filter((b) => !alreadyChosen.includes(b.slug))
    .map((b) => ({ id: b.id, title: b.title }));
  if (digitalRows.length > 0) {
    sections.push({ title: "📱 Bancos digitales", rows: digitalRows });
  }

  await logConversation(sb, userId, rawText, bodyText);

  return Response.json({
    wa_message: waListMessage(bodyText, "Ver bancos", sections),
    reply: bodyText,
    onboarding_step: "ask_bank",
    user_id: userId,
  });
}

// ─── Procesar seleccion de banco ─────────────────────────
async function handleBankSelection(
  sb: SupabaseClient,
  userId: string,
  state: OnboardingState,
  reply: InteractiveReply,
  rawText: string
): Promise<Response> {
  // Encontrar banco por ID
  const bankId = reply.id.replace("bank-", "");
  let bankSlug = bankId;
  let bankName = reply.title || bankId;

  // Buscar en national/digital
  const found = [...NATIONAL_BANKS, ...DIGITAL_BANKS].find((b) => b.id === reply.id);
  if (found) {
    bankSlug = found.slug;
    bankName = found.title;
  } else {
    // Podria ser banco provincial
    const provinceKey = state.province || "";
    const provData = PROVINCIAS[provinceKey];
    if (provData && (bankId === provData.slug || reply.id === "bank-" + provData.slug)) {
      bankSlug = provData.slug;
      bankName = provData.banco;
    }
  }

  const banks = [...(state.banks || []), { slug: bankSlug, name: bankName }];
  const ns: OnboardingState = {
    ...state,
    step: "ask_card_type",
    banks: banks,
    currentBank: { slug: bankSlug, name: bankName },
  };
  await saveOnboardingState(sb, userId, ns);
  await logConversation(sb, userId, rawText, "Banco " + bankName + " → preguntar tipo tarjeta");

  return Response.json({
    wa_message: waButtonMessage(
      bankName + " ✅ ¿Que tipo de tarjeta tenes ahi?",
      [
        { id: "card-debit", title: "Débito" },
        { id: "card-credit", title: "Crédito" },
        { id: "card-both", title: "Ambas" },
      ]
    ),
    reply: "Preguntar tipo tarjeta " + bankName,
    onboarding_step: "ask_card_type",
    user_id: userId,
  });
}

// ─── Completar onboarding ────────────────────────────────
async function completeOnboarding(
  sb: SupabaseClient, userId: string, state: OnboardingState, displayName: string, rawText: string
): Promise<Response> {
  // Save defaults: 1x/week friday night
  await sb.from("users").update({
    wa_frequency: "1x_week",
    wa_preferred_hour: "night",
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
  }).eq("id", userId);

  const newState: OnboardingState = { ...state, step: "completed" };
  await saveOnboardingState(sb, userId, newState);

  // Fetch promos
  const { data: ctx } = await sb.rpc("get_yapa_context", { p_user_id: userId });
  const promos = (ctx && ctx.matching_promos) ? ctx.matching_promos : [];

  // Format top 3 promos
  const bankNames = (state.banks || []).map(b => b.name).join(" y ") || "tus tarjetas";
  const city = state.city || "tu ciudad";

  let msg1 = "¡Listo! Con " + bankNames + " en " + city + ":\n\n";

  const topPromos = promos.slice(0, 3);
  let totalSavings = 0;
  for (const p of topPromos) {
    const tope = p.max_discount ? " (tope $" + formatNumber(p.max_discount) + ")" : "";
    const days = formatDaysSpanish(p.valid_days || []);
    const label = p.title || ((p.discount_value ? (p.discount_value + "% en ") : "") + (p.merchant_name || "descuento"));
    msg1 += "🏷️ " + label + " — " + days + tope + "\n";
    if (p.max_discount) totalSavings += p.max_discount;
  }

  if (topPromos.length === 0) {
    msg1 += "Estoy armando los descuentos de tu zona, en breve te aviso 💪\n";
  }

  if (totalSavings > 0) {
    const equiv = getAhorroEquivalente(totalSavings);
    msg1 += "\nEsta semana te ahorrás como $" + formatNumber(totalSavings) + ".";
    if (equiv) msg1 += "\n" + equiv.charAt(0).toUpperCase() + equiv.slice(1);
  }

  msg1 += " 🛍️";

  // Segundo mensaje: enseñar a preguntar
  const msg2 = "Y cuando necesites comprar algo, preguntame.\n\n" +
    "💬 \"Necesito comprar guardapolvos\"\n" +
    "💬 \"¿Dónde cargo nafta más barato?\"\n" +
    "💬 \"Tengo que ir a la farmacia\"\n\n" +
    "Yo te digo con qué tarjeta y dónde te sale menos.\n\n" +
    "Te escribo cada viernes con tus descuentos 🛍️";

  await logConversation(sb, userId, rawText, msg1 + "\n---\n" + msg2);

  return Response.json({
    wa_messages: [waTextMessage(msg1), waTextMessage(msg2)],
    reply: msg1,
    onboarding_step: "completed",
    user_id: userId,
  });
}

// ─── Flow completion: procesar nfm_reply de WhatsApp Flows ──
async function handleFlowCompletion(
  sb: SupabaseClient,
  userId: string,
  displayName: string,
  reply: InteractiveReply
): Promise<Response> {
  // El onboarding-flow endpoint ya guardó todo en DB (locations, payment_methods, users)
  // Aquí solo mostramos el mensaje de bienvenida con promos

  // Leer estado guardado por el endpoint
  const { data: memRows } = await sb
    .from("yapa_memory")
    .select("notes")
    .eq("user_id", userId)
    .limit(1);

  const notes = memRows?.[0]?.notes;
  let flowState: { province?: string; city?: string; banks?: { name: string }[]; wallets?: string[] } = {};
  if (notes) {
    try { flowState = JSON.parse(notes); } catch (_e) { /* ignore */ }
  }

  // Si el endpoint no marcó completed (por timing), marcarlo ahora
  await sb.from("users").update({
    wa_frequency: "1x_week",
    wa_preferred_hour: "night",
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
  }).eq("id", userId);

  const finalState: OnboardingState = {
    step: "completed",
    province: flowState.province,
    city: flowState.city,
  };
  await saveOnboardingState(sb, userId, finalState);

  // Fetch promos personalizadas
  const { data: ctx } = await sb.rpc("get_yapa_context", { p_user_id: userId });
  const promos = (ctx && ctx.matching_promos) ? ctx.matching_promos : [];

  // Armar mensaje de bienvenida
  const bankNames = (flowState.banks || []).map(b => b.name).join(" y ") || "tus tarjetas";
  const city = flowState.city || "tu ciudad";

  let msg1 = "¡Listo! Con " + bankNames + " en " + city + ":\n\n";

  const topPromos = promos.slice(0, 3);
  let totalSavings = 0;
  for (const p of topPromos) {
    const tope = p.max_discount ? " (tope $" + formatNumber(p.max_discount) + ")" : "";
    const days = formatDaysSpanish(p.valid_days || []);
    const label = p.title || ((p.discount_value ? (p.discount_value + "% en ") : "") + (p.merchant_name || "descuento"));
    msg1 += "🏷️ " + label + " — " + days + tope + "\n";
    if (p.max_discount) totalSavings += p.max_discount;
  }

  if (topPromos.length === 0) {
    msg1 += "Estoy armando los descuentos de tu zona, en breve te aviso 💪\n";
  }

  if (totalSavings > 0) {
    const equiv = getAhorroEquivalente(totalSavings);
    msg1 += "\nEsta semana te ahorrás como $" + formatNumber(totalSavings) + ".";
    if (equiv) msg1 += "\n" + equiv.charAt(0).toUpperCase() + equiv.slice(1);
  }
  msg1 += " 🛍️";

  const msg2 = "Y cuando necesites comprar algo, preguntame.\n\n" +
    "💬 \"Necesito comprar guardapolvos\"\n" +
    "💬 \"¿Dónde cargo nafta más barato?\"\n" +
    "💬 \"Tengo que ir a la farmacia\"\n\n" +
    "Yo te digo con qué tarjeta y dónde te sale menos.\n\n" +
    "Te escribo cada viernes con tus descuentos 🛍️";

  await logConversation(sb, userId, "(flow completado)", msg1 + "\n---\n" + msg2);

  return Response.json({
    wa_messages: [waTextMessage(msg1), waTextMessage(msg2)],
    reply: msg1,
    onboarding_step: "completed",
    user_id: userId,
  });
}

// ─── Retomar paso actual (si manda "hola" en medio) ─────
function retakeCurrentStep(_sb: SupabaseClient, state: OnboardingState) {
  // Generar el mensaje del paso actual para reenviarlo
  switch (state.step) {
    case "ask_location":
      return {
        wa_message: waButtonMessage(
          "Seguimos! Sos de ahi?",
          [
            { id: "loc-yes", title: "Si, soy de ahi!" },
            { id: "loc-no", title: "No, otra ciudad" },
          ]
        ),
      };
    case "ask_location_share":
      return {
        wa_message: waLocationRequestMessage(
          "Seguimos! Compartime tu ubicacion asi te muestro los descuentos de tu zona 📍"
        ),
      };
    case "ask_bank_provincial":
      return {
        wa_message: waButtonMessage(
          "Seguimos! Tenes cuenta en el banco provincial?",
          [
            { id: "prov-yes", title: "Si, tengo" },
            { id: "prov-no", title: "No, no tengo" },
          ]
        ),
      };
    case "ask_city":
      return {
        wa_message: waListMessage(
          "Seguimos donde quedamos! Elegi tu provincia:",
          "Ver provincias",
          PROVINCE_SECTIONS
        ),
      };
    case "ask_city_text":
      return {
        wa_message: waTextMessage("¡Seguimos! 😄 Escribime el nombre de tu ciudad."),
      };
    case "ask_bank":
      if (!state.city) {
        return {
          wa_message: waTextMessage("¡Seguimos! 😄 Elegi tu ciudad de la lista que te mande."),
        };
      }
      return {
        wa_message: waTextMessage("¡Seguimos! 😄 ¿Que bancos tenes? Toca 'Ver bancos' para elegir."),
      };
    case "ask_card_type":
      return {
        wa_message: waButtonMessage(
          "¡Seguimos! 😄 ¿Que tipo de tarjeta tenes en " + (state.currentBank?.name || "tu banco") + "?",
          [
            { id: "card-debit", title: "Débito" },
            { id: "card-credit", title: "Crédito" },
            { id: "card-both", title: "Ambas" },
          ]
        ),
      };
    case "ask_bank_more":
      return {
        wa_message: waButtonMessage(
          "¡Seguimos! 😄 ¿Tenes otro banco?",
          [
            { id: "bank-add-more", title: "Si, agregar otro" },
            { id: "bank-done", title: "No, es todo" },
          ]
        ),
      };
    case "ask_wallet":
      return {
        wa_message: waButtonMessage(
          "¡Seguimos! 😄 ¿Usás billetera digital?",
          [
            { id: "wallet-mercadopago", title: "Mercado Pago" },
            { id: "wallet-modo", title: "MODO" },
            { id: "wallet-ninguna", title: "Ninguna" },
          ]
        ),
      };
    case "ask_wallet_more":
      return {
        wa_message: waButtonMessage(
          "¡Seguimos! 😄 ¿Usas otra billetera?",
          [
            { id: "wallet-add-more", title: "Si, otra mas" },
            { id: "wallet-done", title: "No, ninguna mas" },
          ]
        ),
      };
    case "ask_flow":
    case "flow_in_progress":
      return {
        wa_message: waTextMessage("¡Seguimos! 😄 Completá el formulario que te mandé. Si no lo ves, escribí \"hola\" y te lo reenvío."),
      };
    default:
      return { wa_message: waTextMessage("¡Seguimos donde quedamos! 😄") };
  }
}

// ─── Fallback: intentar parsear texto libre ──────────────
function tryTextFallback(state: OnboardingState, text: string): InteractiveReply | null {
  switch (state.step) {
    case "ask_location": {
      if (text.includes("si") || text.includes("sí") || text.includes("dale") || text.includes("ahi") || text.includes("ahí")) {
        return { type: "button_reply", id: "loc-yes", title: "Si" };
      }
      if (text.includes("no") || text.includes("otra")) {
        return { type: "button_reply", id: "loc-no", title: "No" };
      }
      return null;
    }
    case "ask_bank_provincial": {
      if (text.includes("si") || text.includes("sí") || text.includes("tengo") || text.includes("dale")) {
        return { type: "button_reply", id: "prov-yes", title: "Si" };
      }
      if (text.includes("no")) {
        return { type: "button_reply", id: "prov-no", title: "No" };
      }
      return null;
    }
    case "ask_city": {
      // Intentar matchear provincia del texto
      const province = matchProvince(text);
      if (province) {
        const id = Object.entries(PROVINCE_ID_MAP).find(([_, v]) => v === province)?.[0];
        if (id) return { type: "list_reply", id: id, title: capitalizeProvince(province) };
      }
      return null;
    }
    case "ask_card_type": {
      if (text.includes("ambas") || text.includes("las dos") || text.includes("todo")) {
        return { type: "button_reply", id: "card-both", title: "Ambas" };
      }
      if (text.includes("debito") || text.includes("débito")) {
        return { type: "button_reply", id: "card-debit", title: "Debito" };
      }
      if (text.includes("credito") || text.includes("crédito")) {
        return { type: "button_reply", id: "card-credit", title: "Credito" };
      }
      return null;
    }
    case "ask_city_text": {
      // Texto libre de ciudad — siempre aceptar
      if (text.length >= 2) {
        return { type: "list_reply", id: "city-text-input", title: text };
      }
      return null;
    }
    case "ask_bank": {
      // Si todavia no tiene ciudad (esperando lista de ciudades)
      // no podemos parsear texto libre aqui
      return null;
    }
    case "ask_bank_more": {
      if (text.includes("si") || text.includes("sí") || text.includes("otro")) {
        return { type: "button_reply", id: "bank-add-more", title: "Si" };
      }
      if (text.includes("no") || text.includes("listo") || text.includes("todo")) {
        return { type: "button_reply", id: "bank-done", title: "No" };
      }
      return null;
    }
    case "ask_wallet_more": {
      if (text.includes("si") || text.includes("sí") || text.includes("otra")) {
        return { type: "button_reply", id: "wallet-add-more", title: "Si" };
      }
      if (text.includes("no") || text.includes("listo") || text.includes("ninguna") || text.includes("todo")) {
        return { type: "button_reply", id: "wallet-done", title: "No" };
      }
      return null;
    }
    case "ask_wallet": {
      // Texto libre en paso billeteras
      if (text.includes("mercado") || text.includes("mp")) {
        return { type: "button_reply", id: "wallet-mercadopago", title: "Mercado Pago" };
      }
      if (text.includes("modo")) {
        return { type: "button_reply", id: "wallet-modo", title: "MODO" };
      }
      if (text.includes("uala") || text.includes("ualá")) {
        return { type: "list_reply", id: "wallet-uala", title: "Ualá" };
      }
      if (text.includes("naranja")) {
        return { type: "list_reply", id: "wallet-naranjax", title: "Naranja X" };
      }
      if (text.includes("ninguna") || text.includes("no uso") || text.includes("no tengo")) {
        return { type: "button_reply", id: "wallet-ninguna", title: "Ninguna" };
      }
      return null;
    }
    default:
      return null;
  }
}

// ─── Consulta normal post-onboarding ─────────────────────
async function handleQuery(
  sb: SupabaseClient,
  userId: string,
  queryText: string,
  memory: { notes: string; free_queries_used: number; free_queries_reset_at: string } | null
): Promise<Response> {
  const now = new Date();

  // 1. Check limite free queries (reset mensual)
  let queriesUsed = memory ? (memory.free_queries_used || 0) : 0;
  const resetAt = (memory && memory.free_queries_reset_at) ? new Date(memory.free_queries_reset_at) : null;

  if (!resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()) {
    queriesUsed = 0;
    await sb
      .from("yapa_memory")
      .update({ free_queries_used: 0, free_queries_reset_at: now.toISOString() })
      .eq("user_id", userId);
  }

  // 2. Obtener contexto completo
  const { data: ctx, error: ctxErr } = await sb.rpc("get_yapa_context", { p_user_id: userId });
  if (ctxErr) {
    console.error("get_yapa_context error:", ctxErr);
    return Response.json({ error: ctxErr.message }, { status: 500 });
  }

  // 3. Si es free y supero el limite
  const userTier = (ctx && ctx.user) ? ctx.user.tier : "free";
  if (userTier === "free" && queriesUsed >= 3) {
    const totalSavings = (ctx && ctx.memory) ? (ctx.memory.total_savings || 0) : 0;
    const reply =
      "¡Me encanta que me preguntes! Este mes ya te ayude con " + queriesUsed + " consultas y ahorraste *$" + formatNumber(totalSavings) + "* 🛍️\n\n" +
      "Para seguir respondiendote necesito que actives el plan completo. Son *$2.000 por mes* — seguro menos de lo que ahorraste.\n\n" +
      "Mientras tanto, te sigo mandando el resumen semanal gratis 💚";

    await logConversation(sb, userId, queryText, reply);
    return Response.json({ wa_message: waTextMessage(reply), reply, limited: true, queries_used: queriesUsed, user_id: userId });
  }

  // 4. Armar contexto para Claude
  const userName = (ctx && ctx.user) ? ctx.user.name : "Amiga";
  const locationCity = (ctx && ctx.location) ? ctx.location.city : "";
  const locationProvince = (ctx && ctx.location) ? ctx.location.province : "";
  const paymentMethods = (ctx && ctx.payment_methods) ? JSON.stringify(ctx.payment_methods) : "[]";
  const totalSavings = (ctx && ctx.memory) ? (ctx.memory.total_savings || 0) : 0;
  const familyContext = (ctx && ctx.memory && ctx.memory.family_context) ? ctx.memory.family_context : "";
  const matchingPromos = (ctx && ctx.matching_promos) ? ctx.matching_promos : [];

  const userContext =
    "CONTEXTO DE LA USUARIA:\n" +
    "- Nombre: " + userName + "\n" +
    "- Ciudad: " + locationCity + ", " + locationProvince + "\n" +
    "- Medios de pago: " + paymentMethods + "\n" +
    "- Ahorro acumulado: $" + totalSavings + "\n" +
    "- Consultas este mes: " + (queriesUsed + 1) + "/3 (plan free)\n" +
    (familyContext ? ("- Contexto familiar: " + familyContext + "\n") : "") +
    "\nPROMOS VIGENTES PARA ELLA (" + matchingPromos.length + " promos):\n" +
    JSON.stringify(matchingPromos, null, 2) +
    "\n\nPREGUNTA DE LA USUARIA:\n\"" + queryText + "\"";

  // 5. Llamar a Claude
  let reply = "Uy, perdon, algo me fallo. ¿Me repetis la pregunta? 😊";
  try {
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
        system: YAPA_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContext }],
      }),
    });

    const claudeData = await claudeResponse.json();
    if (claudeData.content && claudeData.content.length > 0 && claudeData.content[0].text) {
      reply = claudeData.content[0].text;
    }
  } catch (claudeErr) {
    console.error("Claude API error:", claudeErr);
  }

  // 6. Actualizar memoria
  await sb
    .from("yapa_memory")
    .update({
      free_queries_used: queriesUsed + 1,
      last_query_text: queryText,
      last_query_at: now.toISOString(),
    })
    .eq("user_id", userId);

  // 7. Log conversacion
  await logConversation(sb, userId, queryText, reply);

  return Response.json({
    wa_message: waTextMessage(reply),
    reply,
    limited: false,
    queries_used: queriesUsed + 1,
    promos_matched: matchingPromos.length,
    user_id: userId,
  });
}

// ─── Helpers ─────────────────────────────────────────────

async function countPromosForCity(sb: SupabaseClient, city: string, province: string): Promise<number> {
  const { count } = await sb.from("promotions")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .in("confidence_status", ["confirmed", "probable"])
    .or("applies_nationwide.eq.true,applies_cities.cs.{\"" + city + "\"},applies_provinces.cs.{\"" + province + "\"}");
  return count || 0;
}

async function saveOnboardingState(sb: SupabaseClient, userId: string, state: OnboardingState): Promise<void> {
  const notesJson = JSON.stringify(state);

  const { data: updated } = await sb
    .from("yapa_memory")
    .update({ notes: notesJson })
    .eq("user_id", userId)
    .select("user_id")
    .limit(1);

  if (!updated || updated.length === 0) {
    await sb.from("yapa_memory").insert({
      user_id: userId,
      notes: notesJson,
      free_queries_used: 0,
    });
  }
}

async function logConversation(sb: SupabaseClient, userId: string, inbound: string, outbound: string): Promise<void> {
  await sb.from("wa_conversations").insert([
    { user_id: userId, direction: "inbound", message_type: "text", message_text: inbound },
    { user_id: userId, direction: "outbound", message_type: "text", message_text: outbound },
  ]);
}

function isGreeting(text: string): boolean {
  const greetings = ["hola", "buenas", "buen dia", "buenos dias", "que tal", "hey"];
  for (const g of greetings) {
    if (text === g || text.startsWith(g + " ") || text.startsWith(g + "!") || text.startsWith(g + ",")) {
      return true;
    }
  }
  return false;
}

function isQuestionAboutApp(text: string): boolean {
  const patterns = [
    "que es", "qué es", "que hace", "qué hace",
    "como funciona", "cómo funciona",
    "es gratis", "cuanto sale", "cuánto sale", "cuanto cuesta", "cuánto cuesta",
    "precio", "costo",
  ];
  for (const p of patterns) {
    if (text.includes(p)) return true;
  }
  return false;
}

function getAppExplanation(text: string): string {
  if (text.includes("gratis") || text.includes("sale") || text.includes("cuesta") || text.includes("precio") || text.includes("costo")) {
    return (
      "*-es+* es gratis por 6 meses 💚\n\n" +
      "Sin tarjeta. Sin trampa. Sin letra chica.\n\n" +
      "Te aviso por WhatsApp los mejores descuentos para vos segun tus tarjetas y tu zona. Despues de 6 meses, si queres seguir con consultas ilimitadas son $2.000/mes — pero el resumen semanal sigue gratis siempre.\n\n" +
      "¿Arrancamos? 😊"
    );
  }

  return (
    "*-es+* — Ahorra con lo que ya tenes 🛍️\n\n" +
    "Cruzo tus tarjetas, billeteras y ubicacion con todos los descuentos vigentes de tu zona. Y te cuento en lenguaje humano — no en letra chica — como gastar menos sin cambiar tu rutina.\n\n" +
    "Es gratis por 6 meses. ¿Arrancamos? 😊"
  );
}

function matchProvince(textLower: string): string | null {
  const provinceKeys = Object.keys(PROVINCIAS);
  for (const key of provinceKeys) {
    if (textLower === key) return key;
  }
  for (const key of provinceKeys) {
    if (textLower.includes(key)) return key;
  }
  const aliases: Record<string, string> = {
    "pampa": "la pampa", "bsas": "buenos aires", "bs as": "buenos aires",
    "bs.as": "buenos aires", "cba": "cordoba", "córdoba": "cordoba",
    "sfe": "santa fe", "mza": "mendoza", "tuc": "tucuman", "tucumán": "tucuman",
    "nqn": "neuquen", "neuquén": "neuquen", "mnes": "misiones",
    "ctes": "corrientes", "er": "entre rios", "entre ríos": "entre rios",
    "río negro": "rio negro", "rn": "rio negro", "sj": "san juan",
    "sl": "san luis", "sgo": "santiago del estero", "santiago": "santiago del estero",
    "tdf": "tierra del fuego", "capital federal": "caba",
  };
  for (const [alias, province] of Object.entries(aliases)) {
    if (textLower.includes(alias)) return province;
  }
  return null;
}

function capitalizeProvince(province: string): string {
  return province
    .split(" ")
    .map((word) => {
      if (["de", "del", "la", "el", "y"].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function capitalizeCityName(text: string): string {
  return text
    .split(" ")
    .map((w) =>
      ["de", "del", "la", "el", "y", "las", "los"].includes(w.toLowerCase())
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

function formatWalletName(slug: string): string {
  const names: Record<string, string> = {
    "mercadopago": "Mercado Pago", "modo": "MODO", "uala": "Ualá",
    "naranjax": "Naranja X", "personalpay": "Personal Pay", "prex": "Prex", "bimo": "Bimo",
  };
  return names[slug] || slug;
}

function formatNumber(n: number): string {
  if (n === null || n === undefined) return "0";
  return n.toLocaleString("es-AR");
}

// ─── CORRECCIÓN 2: Días en español ──────────────────────
function formatDaysSpanish(validDays: string[]): string {
  if (!validDays || validDays.length === 0) return "";

  const dayMap: Record<string, string> = {
    "MON": "lunes", "TUE": "martes", "WED": "miércoles",
    "THU": "jueves", "FRI": "viernes", "SAT": "sábados", "SUN": "domingos",
  };

  const allDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const weekDays = ["MON", "TUE", "WED", "THU", "FRI"];
  const sorted = allDays.filter((d) => validDays.includes(d));

  if (sorted.length === 7) return "todos los días";
  if (sorted.length === 5 && weekDays.every((d) => sorted.includes(d))) return "de lunes a viernes";
  if (sorted.length === 2 && sorted.includes("SAT") && sorted.includes("SUN")) return "fines de semana";

  const names = sorted.map((d) => dayMap[d] || d);
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " y " + names[names.length - 1];
}

// ─── CORRECCIÓN 3: Formatear promo con tope ─────────────
function formatPromoLine(title: string, discountValue: number | null, maxDiscount: number | null, validDays: string[]): string {
  let line = "*" + title + "*";
  if (discountValue) line = "*" + discountValue + "% — " + title + "*";
  if (maxDiscount && maxDiscount > 0) {
    line += " (tope $" + formatNumber(maxDiscount) + ")";
  } else {
    line += " (sin tope)";
  }
  const days = formatDaysSpanish(validDays);
  if (days && days !== "todos los días") line += " — " + days;
  return line;
}

// ─── CORRECCIÓN 4: Variedad en equivalentes de ahorro ───
function getAhorroEquivalente(monto: number): string {
  const rangos = [
    { min: 0, max: 5000, textos: [
      "es un cafecito con medialunas ☕",
      "es la carga del celular",
    ]},
    { min: 5000, max: 15000, textos: [
      "es una pizza con la familia 🍕",
      "son un par de medias para cada uno",
      "es el peaje ida y vuelta a Santa Rosa",
    ]},
    { min: 15000, max: 30000, textos: [
      "son unas zapatillas para los chicos 👟",
      "es una salida a cenar 🍷",
      "es media carga de nafta ⛽",
    ]},
    { min: 30000, max: 60000, textos: [
      "es la compra de la semana en farmacia 💊",
      "es una escapada al río el finde",
      "son dos entradas al cine con pochoclos 🎬",
    ]},
    { min: 60000, max: 999999, textos: [
      "es un día de spa para vos 💆‍♀️",
      "son los útiles del mes 📚",
      "es casi un tanque lleno de nafta ⛽",
    ]},
  ];

  const rango = rangos.find((r) => monto >= r.min && monto < r.max);
  if (!rango) return "";
  const idx = Math.floor(Math.random() * rango.textos.length);
  return rango.textos[idx];
}
