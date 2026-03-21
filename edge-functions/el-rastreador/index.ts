// Supabase Edge Function: El Rastreador 🕵️
// Recibe promos scrapeadas desde n8n (Firecrawl + Haiku),
// las normaliza, deduplica, y guarda en promotions como 'probable'.
// También puede recibir un pedido de normalización de HTML crudo.

import { getSupabaseClient, corsHeaders, jsonResponse, callClaude } from "../shared/supabase-client.ts";
import type { ScrapedPromo, ScrapingIngestPayload } from "../shared/types.ts";

const NORMALIZATION_PROMPT = `Sos un parser de datos de descuentos bancarios argentinos.
Tu trabajo es extraer descuentos de HTML/texto crudo y devolver JSON estructurado.

REGLAS:
1. Solo extraé descuentos que estén claramente mencionados
2. Si no podés determinar un campo, poné null
3. Fechas en formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
4. discount_type: percentage | fixed | installments | bogo | cashback
5. merchant_category: supermercado | farmacia | combustible | indumentaria | electronica | gastronomia | hogar | salud | entretenimiento | viajes | otros
6. valid_days como array de: MON, TUE, WED, THU, FRI, SAT, SUN
7. bank slugs en minúscula sin acentos: galicia, macro, pampa, nacion, santander, bbva, etc.
8. card networks: visa, mastercard, amex, debit
9. wallet slugs: mercadopago, modo, uala, naranjax, personalpay, prex, bimo

Devolvé SOLO un JSON array, sin explicaciones. Ejemplo:
[{"title":"25% en Farmacity","discount_type":"percentage","discount_value":25,"merchant_name":"Farmacity","merchant_category":"farmacia","required_banks":["galicia"],"required_cards":["visa","mastercard"],"valid_from":"2026-03-01T00:00:00Z","valid_until":"2026-03-31T23:59:59Z","valid_days":["MON","TUE","WED","THU","FRI"]}]`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const sb = getSupabaseClient();

  try {
    const body = await req.json();
    const action = body.action || "ingest";

    // ─── ACCIÓN 1: Normalizar HTML crudo con Haiku ───────────────
    if (action === "normalize") {
      const { raw_html, source_url } = body;
      if (!raw_html) return jsonResponse({ error: "raw_html required" }, 400);

      const normalized = await callClaude(
        NORMALIZATION_PROMPT,
        `URL fuente: ${source_url || "desconocida"}\n\nHTML/Texto:\n${raw_html.substring(0, 15000)}`,
        "claude-haiku-4-5-20251001",
        2000
      );

      let promos: ScrapedPromo[] = [];
      try {
        promos = JSON.parse(normalized);
      } catch {
        return jsonResponse({ error: "Failed to parse AI response", raw: normalized }, 500);
      }

      return jsonResponse({ promos, count: promos.length });
    }

    // ─── ACCIÓN 2: Ingestar promos normalizadas ──────────────────
    if (action === "ingest") {
      const { source_id, promos } = body as ScrapingIngestPayload;
      if (!source_id || !promos?.length) {
        return jsonResponse({ error: "source_id and promos[] required" }, 400);
      }

      let inserted = 0;
      let updated = 0;
      let duplicates = 0;
      const errors: string[] = [];

      for (const promo of promos) {
        try {
          // Deduplicación: mismo merchant + mismo tipo + mismo valor + misma fecha fin
          const { data: existing } = await sb
            .from("promotions")
            .select("id, confidence_status")
            .eq("merchant_name", promo.merchant_name || "")
            .eq("discount_type", promo.discount_type)
            .eq("discount_value", promo.discount_value)
            .gte("valid_until", new Date().toISOString())
            .limit(1);

          if (existing && existing.length > 0) {
            // Promo ya existe — actualizar last_verified_at
            await sb
              .from("promotions")
              .update({ last_verified_at: new Date().toISOString(), updated_at: new Date().toISOString() })
              .eq("id", existing[0].id);
            duplicates++;
            continue;
          }

          // Insertar nueva promo como 'probable'
          const { error: insertErr } = await sb.from("promotions").insert({
            source_id,
            title: promo.title,
            description: promo.description || null,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            max_discount: promo.max_discount || null,
            min_purchase: promo.min_purchase || null,
            merchant_name: promo.merchant_name,
            merchant_category: promo.merchant_category || null,
            merchant_chain: promo.merchant_chain || null,
            required_banks: promo.required_banks || [],
            required_cards: promo.required_cards || [],
            required_wallets: promo.required_wallets || [],
            any_payment_method: promo.any_payment_method || false,
            applies_nationwide: promo.applies_nationwide || false,
            applies_provinces: promo.applies_provinces || [],
            applies_cities: promo.applies_cities || [],
            valid_from: promo.valid_from,
            valid_until: promo.valid_until,
            valid_days: promo.valid_days || [],
            confidence_status: "probable",
            confidence_score: 0.6,
            last_verified_at: new Date().toISOString(),
            is_active: true,
          });

          if (insertErr) {
            errors.push(`${promo.title}: ${insertErr.message}`);
          } else {
            inserted++;
          }
        } catch (err) {
          errors.push(`${promo.title}: ${String(err)}`);
        }
      }

      // Registrar scraping run
      await sb.from("scraping_runs").insert({
        source_id,
        status: errors.length > 0 ? "partial" : "success",
        promos_found: promos.length,
        promos_new: inserted,
        promos_updated: duplicates,
        promos_expired: 0,
        error_message: errors.length > 0 ? errors.join("; ") : null,
        executed_at: new Date().toISOString(),
      });

      // Actualizar source last_success_at
      await sb
        .from("sources")
        .update({ last_success_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", source_id);

      return jsonResponse({
        status: errors.length > 0 ? "partial" : "success",
        promos_received: promos.length,
        inserted,
        duplicates,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // ─── ACCIÓN 3: Expirar promos vencidas ───────────────────────
    if (action === "expire") {
      const { data, error } = await sb
        .from("promotions")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .lt("valid_until", new Date().toISOString())
        .eq("is_active", true)
        .select("id");

      return jsonResponse({
        expired: data?.length || 0,
        error: error?.message,
      });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);

  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
