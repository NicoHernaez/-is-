// Supabase Edge Function: El Estratega 📊
// Analytics senior — genera reporte diario de salud del sistema,
// detecta alertas críticas, calcula métricas operativas.
// Trigger: cron diario 8am ARG (n8n) o manual desde admin.

import { getSupabaseClient, corsHeaders, jsonResponse } from "../shared/supabase-client.ts";
import type { Alert, ConfidenceStatus, DailyReport } from "../shared/types.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const sb = getSupabaseClient();

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "daily_report";

    // ─── ACCIÓN 1: Reporte diario completo ───────────────────────
    if (action === "daily_report") {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      // ── Usuarios ──
      const { count: totalUsers } = await sb
        .from("users")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);

      const { count: activeUsers7d } = await sb
        .from("users")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("last_active_at", weekAgo);

      const { count: newToday } = await sb
        .from("users")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("created_at", todayStart);

      const { count: onboardingDone } = await sb
        .from("users")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("wa_onboarding_done", true);

      const onboardingRate = totalUsers && totalUsers > 0
        ? Math.round(((onboardingDone || 0) / totalUsers) * 100)
        : 0;

      // ── Promos ──
      const { count: totalActivePromos } = await sb
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .gte("valid_until", now.toISOString());

      const promosByStatus: Record<ConfidenceStatus, number> = {
        confirmed: 0, probable: 0, community: 0, unconfirmed: 0,
      };
      for (const status of ["confirmed", "probable", "community", "unconfirmed"] as ConfidenceStatus[]) {
        const { count } = await sb
          .from("promotions")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true)
          .eq("confidence_status", status)
          .gte("valid_until", now.toISOString());
        promosByStatus[status] = count || 0;
      }

      const { count: expiring48h } = await sb
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .gte("valid_until", now.toISOString())
        .lte("valid_until", in48h);

      // ── Scraping ──
      const { data: todayRuns } = await sb
        .from("scraping_runs")
        .select("status, promos_new")
        .gte("executed_at", todayStart);

      const runsToday = todayRuns?.length || 0;
      const successRuns = todayRuns?.filter(r => r.status === "success" || r.status === "partial").length || 0;
      const scrapingSuccessRate = runsToday > 0 ? Math.round((successRuns / runsToday) * 100) : 0;
      const promosNewToday = todayRuns?.reduce((acc, r) => acc + (r.promos_new || 0), 0) || 0;

      // ── Yapa ──
      const { count: yapaQueriesToday } = await sb
        .from("wa_conversations")
        .select("id", { count: "exact", head: true })
        .eq("direction", "inbound")
        .gte("created_at", todayStart);

      const { data: uniqueYapaUsers } = await sb
        .from("wa_conversations")
        .select("user_id")
        .eq("direction", "inbound")
        .gte("created_at", todayStart);
      const uniqueUsersToday = new Set(uniqueYapaUsers?.map(u => u.user_id)).size;

      // ── Comunidad ──
      const { count: pendingReview } = await sb
        .from("club_discounts")
        .select("id", { count: "exact", head: true })
        .eq("operator_verified", false)
        .eq("is_active", true);

      const { count: reportsPending } = await sb
        .from("error_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      // ── Alertas ──
      const alerts: Alert[] = [];
      const totalConfidencePromos = (promosByStatus.confirmed || 0) + (promosByStatus.probable || 0);
      const totalAllActive = totalActivePromos || 0;
      const confidenceRate = totalAllActive > 0
        ? Math.round((totalConfidencePromos / totalAllActive) * 100)
        : 100;

      if (confidenceRate < 95) {
        alerts.push({
          level: "red",
          message: `Confianza del sistema en ${confidenceRate}% (mínimo 95%). ${promosByStatus.unconfirmed} promos sin confirmar.`,
          timestamp: now.toISOString(),
        });
      }

      // Scrapers fallidos
      const failedRuns = todayRuns?.filter(r => r.status === "failed").length || 0;
      if (failedRuns >= 2) {
        alerts.push({
          level: "red",
          message: `${failedRuns} scrapers fallaron hoy. Revisá las fuentes.`,
          timestamp: now.toISOString(),
        });
      }

      // Reportes de error pendientes
      if ((reportsPending || 0) > 10) {
        alerts.push({
          level: "yellow",
          message: `${reportsPending} reportes de error pendientes. Las usuarias están reportando problemas.`,
          timestamp: now.toISOString(),
        });
      }

      // Promos por vencer
      if ((expiring48h || 0) > 5) {
        alerts.push({
          level: "yellow",
          message: `${expiring48h} promos vencen en 48h. ¿Se renovaron?`,
          timestamp: now.toISOString(),
        });
      }

      // Crecimiento positivo
      if ((newToday || 0) > 5) {
        alerts.push({
          level: "green",
          message: `${newToday} usuarias nuevas hoy. Buen día de crecimiento.`,
          timestamp: now.toISOString(),
        });
      }

      const report: DailyReport = {
        generated_at: now.toISOString(),
        users: {
          total: totalUsers || 0,
          active_7d: activeUsers7d || 0,
          new_today: newToday || 0,
          onboarding_completed_rate: onboardingRate,
        },
        promos: {
          total_active: totalActivePromos || 0,
          by_status: promosByStatus,
          expiring_48h: expiring48h || 0,
        },
        scraping: {
          runs_today: runsToday,
          success_rate: scrapingSuccessRate,
          promos_new_today: promosNewToday,
        },
        yapa: {
          queries_today: yapaQueriesToday || 0,
          unique_users_today: uniqueUsersToday,
        },
        community: {
          pending_review: pendingReview || 0,
          reports_pending: reportsPending || 0,
        },
        alerts,
      };

      // Guardar en admin_trust_metrics
      await sb.from("admin_trust_metrics").upsert({
        date: now.toISOString().split("T")[0],
        trust_rate: confidenceRate / 100,
        promos_confirmed: promosByStatus.confirmed,
        promos_probable: promosByStatus.probable,
        promos_community: promosByStatus.community,
        promos_unconfirmed: promosByStatus.unconfirmed,
        active_users_7d: activeUsers7d || 0,
        active_users_30d: 0, // TODO: calcular cuando haya más datos
        total_savings_ars: 0, // TODO: sumar de savings_log
      }, { onConflict: "date" });

      // Si pidió formato WhatsApp
      if (body.format === "whatsapp") {
        const wa = formatWhatsApp(report);
        return jsonResponse({ report, whatsapp_message: wa });
      }

      return jsonResponse(report);
    }

    // ─── ACCIÓN 2: Check de alertas (sin reporte completo) ───────
    if (action === "check_alerts") {
      const alerts: Alert[] = [];
      const now = new Date();

      // Confianza del sistema
      const { count: confirmedCount } = await sb
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .in("confidence_status", ["confirmed", "probable"])
        .gte("valid_until", now.toISOString());

      const { count: totalActive } = await sb
        .from("promotions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .gte("valid_until", now.toISOString());

      const rate = (totalActive || 0) > 0
        ? Math.round(((confirmedCount || 0) / (totalActive || 1)) * 100)
        : 100;

      if (rate < 95) {
        alerts.push({
          level: "red",
          message: `🔴 ALERTA: Confianza en ${rate}%. Verificá promos urgente.`,
          timestamp: now.toISOString(),
        });
      }

      return jsonResponse({ alerts, confidence_rate: rate });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);

  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});

// ─── Formatear reporte para WhatsApp ─────────────────────────────
function formatWhatsApp(r: DailyReport): string {
  const alertEmojis = r.alerts
    .map(a => a.level === "red" ? `🔴 ${a.message}` : a.level === "yellow" ? `🟡 ${a.message}` : `🟢 ${a.message}`)
    .join("\n");

  return `📊 *-es+ Reporte Diario*
${new Date(r.generated_at).toLocaleDateString("es-AR")}

👥 *Usuarias*
Total: ${r.users.total} | Activas 7d: ${r.users.active_7d}
Nuevas hoy: ${r.users.new_today}
Onboarding: ${r.users.onboarding_completed_rate}%

🏷️ *Promos*
Activas: ${r.promos.total_active}
✅ ${r.promos.by_status.confirmed} confirmed
🟡 ${r.promos.by_status.probable} probable
🔵 ${r.promos.by_status.community} community
⚪ ${r.promos.by_status.unconfirmed} unconfirmed
⏰ ${r.promos.expiring_48h} vencen en 48h

🤖 *Scraping*
Runs hoy: ${r.scraping.runs_today} (${r.scraping.success_rate}% éxito)
Promos nuevas: ${r.scraping.promos_new_today}

🛍️ *Yapa*
Consultas hoy: ${r.yapa.queries_today}
Usuarias únicas: ${r.yapa.unique_users_today}

💚 *Comunidad*
Pendientes revisión: ${r.community.pending_review}
Reportes error: ${r.community.reports_pending}
${alertEmojis ? `\n⚠️ *Alertas*\n${alertEmojis}` : "\n✅ Sin alertas"}

-es+ · Sistema operando`;
}
