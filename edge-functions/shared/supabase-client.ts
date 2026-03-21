// Cliente Supabase compartido para Edge Functions de -es+

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  _client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _client;
}

// Helper: respuesta CORS para OPTIONS
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Helper: respuesta JSON con CORS
export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

// Helper: llamar Claude API
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  model: "claude-sonnet-4-20250514" | "claude-haiku-4-5-20251001" = "claude-haiku-4-5-20251001",
  maxTokens = 500
): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || "";
}
