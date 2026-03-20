// Supabase Edge Function: Yapa Smart Query
// Recibe pregunta de la usuaria + contexto → Claude → respuesta personalizada

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const YAPA_SYSTEM_PROMPT = `Sos Yapa 🛍️, la asistente de ahorro de -es+. Sos una amiga argentina de ~40 años que sabe TODO de descuentos.

PERSONALIDAD:
- Hablás en voseo argentino: "tenés", "ahorrás", "mirá", "fijate"
- Cálida, directa, cómplice. Como una amiga que te avisa del descuento
- Usás emojis con moderación (2-3 máximo por mensaje)
- Mensajes CORTOS — máximo 150 palabras. Esto es WhatsApp, no un email

REGLAS INQUEBRANTABLES:
1. NUNCA inventés un descuento. Solo mencioná los que están en el contexto
2. NUNCA recomendés sacar una tarjeta nueva
3. SIEMPRE mostrá el ahorro estimado en pesos argentinos
4. SIEMPRE indicá el nivel de confianza si es "probable" (no si es "confirmed")
5. Banco provincial PRIMERO en las recomendaciones

ESTRUCTURA DE RESPUESTA (3 niveles, usá los que apliquen):
1. "Con lo que tenés" — descuentos directos con sus tarjetas/billeteras
2. "Tip de red" — si puede combinar con otra promo que ya tiene
3. "Timing" — cuándo le conviene hacer la compra (qué día)

Si no hay promos relevantes para su pregunta, decile honestamente y sugerí alternativas.
Si es una pregunta que no tiene que ver con ahorro/descuentos, respondé amablemente y redirigí.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const { user_id, query_text } = await req.json();
    if (!user_id || !query_text) {
      return Response.json({ error: "user_id and query_text required" }, { status: 400 });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Obtener contexto completo
    const { data: ctxData, error: ctxErr } = await sb.rpc("get_yapa_context", { p_user_id: user_id });
    if (ctxErr) return Response.json({ error: ctxErr.message }, { status: 500 });

    const ctx = ctxData;

    // 2. Check límite free (3 consultas/mes)
    const { data: memory } = await sb.from("yapa_memory").select("free_queries_used, free_queries_reset_at").eq("user_id", user_id).single();

    let queriesUsed = memory?.free_queries_used || 0;
    const resetAt = memory?.free_queries_reset_at ? new Date(memory.free_queries_reset_at) : null;
    const now = new Date();

    // Reset mensual
    if (!resetAt || resetAt.getMonth() !== now.getMonth()) {
      queriesUsed = 0;
      await sb.from("yapa_memory").update({ free_queries_used: 0, free_queries_reset_at: now.toISOString() }).eq("user_id", user_id);
    }

    // Si es free y superó el límite
    if (ctx.user.tier === "free" && queriesUsed >= 3) {
      const totalSavings = ctx.memory.total_savings || 0;
      const conversionMsg = `¡Me encanta la pregunta! Este mes ya te ayudé con ${queriesUsed} consultas y ahorraste *$${totalSavings.toLocaleString()}* 🎉\n\nPara seguir respondiendo consultas necesito activar tu plan completo. Son *$2.000 por mes* — menos de lo que ahorraste.\n\nMientras tanto, te sigo mandando el resumen semanal gratis 💚`;

      return Response.json({ reply: conversionMsg, limited: true, queries_used: queriesUsed });
    }

    // 3. Armar prompt con contexto
    const userContext = `
CONTEXTO DE LA USUARIA:
- Nombre: ${ctx.user.name}
- Ciudad: ${ctx.location.city}, ${ctx.location.province}
- Medios de pago: ${JSON.stringify(ctx.payment_methods)}
- Ahorro acumulado: $${ctx.memory.total_savings}
- Consultas este mes: ${queriesUsed + 1}/3 (plan free)
${ctx.memory.family_context ? `- Contexto familiar: ${ctx.memory.family_context}` : ""}
${ctx.memory.notes ? `- Notas: ${ctx.memory.notes}` : ""}

PROMOS VIGENTES PARA ELLA (${ctx.matching_promos?.length || 0} promos):
${JSON.stringify(ctx.matching_promos, null, 2)}

PREGUNTA DE LA USUARIA:
"${query_text}"`;

    // 4. Llamar a Claude
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: YAPA_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContext }],
      }),
    });

    const claudeData = await claudeResponse.json();
    const reply = claudeData.content?.[0]?.text || "Perdón, no pude procesar tu consulta. Intentá de nuevo 😊";

    // 5. Actualizar memoria
    await sb.from("yapa_memory").update({
      free_queries_used: queriesUsed + 1,
      last_query_text: query_text,
      last_query_at: now.toISOString(),
    }).eq("user_id", user_id);

    // 6. Log conversations
    await sb.from("wa_conversations").insert([
      { user_id, direction: "inbound", message_type: "text", message_text: query_text },
      { user_id, direction: "outbound", message_type: "text", message_text: reply },
    ]);

    return Response.json({
      reply,
      limited: false,
      queries_used: queriesUsed + 1,
      promos_matched: ctx.matching_promos?.length || 0,
    });

  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
