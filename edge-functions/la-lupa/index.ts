// Supabase Edge Function: La Lupa 🔍
// Verificador de calidad (QC) — audita promos, evalúa coherencia,
// degrada promos viejas, procesa reportes de error.
// Triggers: cron cada hora (n8n) o manual desde admin.

import { getSupabaseClient, corsHeaders, jsonResponse, callClaude } from "../shared/supabase-client.ts";
import type { ConfidenceStatus, VerificationResult } from "../shared/types.ts";

const COHERENCE_PROMPT = `Sos un auditor de datos de descuentos bancarios argentinos.
Evaluás si un descuento es coherente y probablemente real.

Analizá estos aspectos:
1. ¿El porcentaje/valor es razonable? (>80% es sospechoso, >50% en supermercado es raro)
2. ¿Las fechas son coherentes? (valid_from < valid_until, no está vencido)
3. ¿El merchant_category coincide con el tipo de descuento?
4. ¿Los bancos/tarjetas mencionados son reales en Argentina?
5. ¿El tope de descuento (max_discount) es coherente con el porcentaje?

Respondé SOLO con un JSON:
{"coherent": true/false, "score": 0.0-1.0, "issues": ["lista de problemas si hay"]}

Si es coherente, score >= 0.7. Si tiene problemas menores, 0.5-0.7. Si es sospechoso, < 0.5.`;

// Pesos por tipo de fuente
const SOURCE_WEIGHTS: Record<string, number> = {
  api: 0.95,
  scraping: 0.70,
  manual: 0.80,
  community: 0.50,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const sb = getSupabaseClient();

  try {
    const body = await req.json();
    const action = body.action || "verify_batch";

    // ─── ACCIÓN 1: Verificar lote de promos pendientes ───────────
    if (action === "verify_batch") {
      const results: VerificationResult[] = [];

      // Buscar promos 'probable' no verificadas en 24h
      const { data: pendingPromos } = await sb
        .from("promotions")
        .select("id, title, description, discount_type, discount_value, max_discount, merchant_name, merchant_category, required_banks, required_cards, required_wallets, valid_from, valid_until, valid_days, confidence_status, confidence_score, source_id, last_verified_at, error_report_count")
        .eq("is_active", true)
        .eq("confidence_status", "probable")
        .or("last_verified_at.is.null,last_verified_at.lt." + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true })
        .limit(20);

      if (!pendingPromos?.length) {
        return jsonResponse({ message: "No promos to verify", verified: 0 });
      }

      for (const promo of pendingPromos) {
        // Factor 1: peso de la fuente
        let sourceWeight = 0.6;
        if (promo.source_id) {
          const { data: source } = await sb
            .from("sources")
            .select("source_type, reliability")
            .eq("id", promo.source_id)
            .limit(1);
          if (source?.[0]) {
            sourceWeight = SOURCE_WEIGHTS[source[0].source_type] || 0.5;
            // Ajustar por reliability histórica de la fuente
            sourceWeight = sourceWeight * 0.7 + (source[0].reliability || 0.5) * 0.3;
          }
        }

        // Factor 2: cross-source confirmation
        const { count: crossCount } = await sb
          .from("promotions")
          .select("id", { count: "exact", head: true })
          .eq("merchant_name", promo.merchant_name || "")
          .eq("discount_type", promo.discount_type)
          .eq("is_active", true)
          .neq("id", promo.id);
        const crossBonus = crossCount && crossCount > 0 ? 0.1 : 0;

        // Factor 3: coherencia con Claude Haiku
        let coherenceScore = 0.7;
        let issues: string[] = [];
        try {
          const promoJson = JSON.stringify({
            title: promo.title,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            max_discount: promo.max_discount,
            merchant_name: promo.merchant_name,
            merchant_category: promo.merchant_category,
            required_banks: promo.required_banks,
            valid_from: promo.valid_from,
            valid_until: promo.valid_until,
          });

          const aiResult = await callClaude(COHERENCE_PROMPT, promoJson, "claude-haiku-4-5-20251001", 300);
          const parsed = JSON.parse(aiResult);
          coherenceScore = parsed.score || 0.7;
          issues = parsed.issues || [];
        } catch {
          // Si Haiku falla, usar score neutro
          coherenceScore = 0.65;
        }

        // Factor 4: penalización por error reports
        const errorPenalty = Math.min((promo.error_report_count || 0) * 0.1, 0.3);

        // Score final (promedio ponderado)
        const finalScore = Math.max(0, Math.min(1,
          sourceWeight * 0.4 +
          coherenceScore * 0.4 +
          crossBonus +
          0.1 - // bonus base
          errorPenalty
        ));

        // Determinar nuevo status
        let newStatus: ConfidenceStatus = promo.confidence_status as ConfidenceStatus;
        if (finalScore >= 0.85) {
          // Alto — pero solo 'probable', nunca auto-confirm
          newStatus = "probable";
        } else if (finalScore >= 0.5) {
          newStatus = "probable";
        } else {
          newStatus = "unconfirmed";
        }

        // 3+ error reports en 24h → auto-downgrade
        if ((promo.error_report_count || 0) >= 3) {
          newStatus = "unconfirmed";
        }

        // Actualizar promo
        await sb
          .from("promotions")
          .update({
            confidence_score: finalScore,
            confidence_status: newStatus,
            last_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", promo.id);

        results.push({
          promo_id: promo.id,
          old_status: promo.confidence_status as ConfidenceStatus,
          new_status: newStatus,
          new_score: Math.round(finalScore * 100) / 100,
          reason: issues.length > 0 ? issues.join(", ") : "OK",
        });
      }

      return jsonResponse({ verified: results.length, results });
    }

    // ─── ACCIÓN 2: Degradar promos viejas sin verificar ──────────
    if (action === "degrade_stale") {
      const cutoff72h = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
      const results: { degraded_probable: number; degraded_confirmed: number } = {
        degraded_probable: 0,
        degraded_confirmed: 0,
      };

      // Promos 'confirmed' sin verificar >72h → 'probable'
      const { data: staleConfirmed } = await sb
        .from("promotions")
        .update({
          confidence_status: "probable",
          confidence_score: 0.6,
          updated_at: new Date().toISOString(),
        })
        .eq("is_active", true)
        .eq("confidence_status", "confirmed")
        .lt("last_verified_at", cutoff72h)
        .select("id");
      results.degraded_confirmed = staleConfirmed?.length || 0;

      // Promos 'probable' sin verificar >72h → 'unconfirmed'
      const { data: staleProbable } = await sb
        .from("promotions")
        .update({
          confidence_status: "unconfirmed",
          confidence_score: 0.3,
          updated_at: new Date().toISOString(),
        })
        .eq("is_active", true)
        .eq("confidence_status", "probable")
        .lt("last_verified_at", cutoff72h)
        .select("id");
      results.degraded_probable = staleProbable?.length || 0;

      return jsonResponse(results);
    }

    // ─── ACCIÓN 3: Procesar reportes de error ────────────────────
    if (action === "process_error_reports") {
      // Buscar promos con 3+ reportes pendientes en últimas 24h
      const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: hotReports } = await sb
        .from("error_reports")
        .select("promotion_id")
        .eq("status", "pending")
        .gte("created_at", cutoff24h);

      if (!hotReports?.length) {
        return jsonResponse({ processed: 0, degraded: 0 });
      }

      // Contar reportes por promo
      const reportCounts: Record<string, number> = {};
      for (const r of hotReports) {
        reportCounts[r.promotion_id] = (reportCounts[r.promotion_id] || 0) + 1;
      }

      let degraded = 0;
      for (const [promoId, count] of Object.entries(reportCounts)) {
        if (count >= 3) {
          await sb
            .from("promotions")
            .update({
              confidence_status: "unconfirmed",
              confidence_score: 0.2,
              error_report_count: count,
              updated_at: new Date().toISOString(),
            })
            .eq("id", promoId);
          degraded++;
        }
      }

      return jsonResponse({
        processed: hotReports.length,
        promos_with_reports: Object.keys(reportCounts).length,
        degraded,
      });
    }

    // ─── ACCIÓN 4: Verificar promo individual (manual admin) ─────
    if (action === "verify_single") {
      const { promo_id, new_status, verified_by } = body;
      if (!promo_id || !new_status) {
        return jsonResponse({ error: "promo_id and new_status required" }, 400);
      }

      const scoreMap: Record<string, number> = {
        confirmed: 1.0,
        probable: 0.7,
        community: 0.5,
        unconfirmed: 0.2,
      };

      await sb
        .from("promotions")
        .update({
          confidence_status: new_status,
          confidence_score: scoreMap[new_status] || 0.5,
          last_verified_at: new Date().toISOString(),
          verified_by: verified_by || "admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", promo_id);

      return jsonResponse({ promo_id, new_status, verified: true });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);

  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
