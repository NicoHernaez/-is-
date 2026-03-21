-- ============================================
-- -es+ Migration 00009: RPC get_yapa_context
-- Función que yapa-query Edge Function necesita
-- para armar el contexto completo de la usuaria
-- ============================================

CREATE OR REPLACE FUNCTION get_yapa_context(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user        RECORD;
  v_location    RECORD;
  v_memory      RECORD;
  v_payments    JSONB;
  v_user_banks  VARCHAR(50)[];
  v_user_cards  VARCHAR(20)[];
  v_user_wallets VARCHAR(50)[];
  v_promos      JSONB;
BEGIN
  -- 1. Datos de la usuaria
  SELECT
    display_name,
    subscription_tier
  INTO v_user
  FROM users
  WHERE id = p_user_id
    AND deleted_at IS NULL;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object('error', 'user_not_found');
  END IF;

  -- 2. Ubicación primaria
  SELECT
    city,
    province
  INTO v_location
  FROM user_locations
  WHERE user_id = p_user_id
    AND is_primary = TRUE
  LIMIT 1;

  -- Fallback: si no tiene primaria, tomar cualquiera
  IF v_location IS NULL THEN
    SELECT city, province
    INTO v_location
    FROM user_locations
    WHERE user_id = p_user_id
    LIMIT 1;
  END IF;

  -- 3. Memoria de Yapa
  SELECT
    total_savings_ars,
    preferred_categories,
    preferred_merchants,
    family_context,
    free_queries_used,
    free_queries_reset_at,
    notes
  INTO v_memory
  FROM yapa_memory
  WHERE user_id = p_user_id;

  -- 4. Medios de pago (como JSON array)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'type', upm.method_type,
      'bank', upm.bank_slug,
      'card_network', upm.card_network,
      'card_tier', upm.card_tier,
      'wallet', upm.wallet_slug,
      'fuel_program', upm.fuel_program_slug
    )
  ), '[]'::jsonb)
  INTO v_payments
  FROM user_payment_methods upm
  WHERE upm.user_id = p_user_id
    AND upm.is_active = TRUE;

  -- 5. Extraer arrays de bancos/tarjetas/billeteras del user para matching
  SELECT
    COALESCE(array_agg(DISTINCT bank_slug) FILTER (WHERE bank_slug IS NOT NULL), '{}'),
    COALESCE(array_agg(DISTINCT card_network) FILTER (WHERE card_network IS NOT NULL), '{}'),
    COALESCE(array_agg(DISTINCT wallet_slug) FILTER (WHERE wallet_slug IS NOT NULL), '{}')
  INTO v_user_banks, v_user_cards, v_user_wallets
  FROM user_payment_methods
  WHERE user_id = p_user_id
    AND is_active = TRUE;

  -- 6. Promos vigentes que matchean con sus medios de pago en su ciudad
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'title', p.title,
      'description', p.description,
      'discount_type', p.discount_type,
      'discount_value', p.discount_value,
      'max_discount', p.max_discount,
      'merchant_name', p.merchant_name,
      'merchant_category', p.merchant_category,
      'required_banks', p.required_banks,
      'required_cards', p.required_cards,
      'required_wallets', p.required_wallets,
      'valid_days', p.valid_days,
      'valid_until', p.valid_until,
      'confidence_status', p.confidence_status
    )
    ORDER BY
      CASE p.confidence_status
        WHEN 'confirmed' THEN 1
        WHEN 'probable'  THEN 2
        ELSE 3
      END,
      p.discount_value DESC NULLS LAST
  ), '[]'::jsonb)
  INTO v_promos
  FROM promotions p
  WHERE p.is_active = TRUE
    AND p.valid_from <= NOW()
    AND p.valid_until >= NOW()
    AND p.confidence_status IN ('confirmed', 'probable')
    -- Match medios de pago
    AND (
      p.any_payment_method = TRUE
      OR p.required_banks && v_user_banks
      OR p.required_cards && v_user_cards
      OR p.required_wallets && v_user_wallets
    )
    -- Match ubicación
    AND (
      p.applies_nationwide = TRUE
      OR v_location.city = ANY(p.applies_cities)
      OR v_location.province = ANY(p.applies_provinces)
    );

  -- 7. Armar y devolver el JSON completo
  RETURN jsonb_build_object(
    'user', jsonb_build_object(
      'name', COALESCE(v_user.display_name, 'Amiga'),
      'tier', COALESCE(v_user.subscription_tier, 'free')
    ),
    'location', jsonb_build_object(
      'city', COALESCE(v_location.city, 'desconocida'),
      'province', COALESCE(v_location.province, 'desconocida')
    ),
    'memory', jsonb_build_object(
      'total_savings', COALESCE(v_memory.total_savings_ars, 0),
      'preferred_categories', COALESCE(to_jsonb(v_memory.preferred_categories), '[]'::jsonb),
      'preferred_merchants', COALESCE(to_jsonb(v_memory.preferred_merchants), '[]'::jsonb),
      'family_context', v_memory.family_context,
      'free_queries_used', COALESCE(v_memory.free_queries_used, 0),
      'free_queries_reset_at', v_memory.free_queries_reset_at,
      'notes', v_memory.notes
    ),
    'payment_methods', v_payments,
    'matching_promos', v_promos
  );
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION get_yapa_context(UUID) IS
  'Devuelve el contexto completo de una usuaria para la Edge Function yapa-query: '
  'datos personales, ubicación, medios de pago, memoria de Yapa, y promos vigentes '
  'que matchean con sus medios de pago en su ciudad. Solo devuelve promos confirmed/probable.';
