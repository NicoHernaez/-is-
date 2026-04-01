-- RPC 1: Actualizar nombre
CREATE OR REPLACE FUNCTION update_display_name(p_phone TEXT, p_name TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET display_name = p_name, updated_at = NOW()
  WHERE wa_phone = p_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 2: Agregar medio de pago
CREATE OR REPLACE FUNCTION add_payment_method(
  p_phone TEXT,
  p_method_type TEXT,
  p_bank_slug TEXT DEFAULT NULL,
  p_card_network TEXT DEFAULT NULL,
  p_wallet_slug TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE wa_phone = p_phone;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;

  INSERT INTO user_payment_methods (user_id, method_type, bank_slug, card_network, wallet_slug, is_active)
  VALUES (v_user_id, p_method_type, p_bank_slug, p_card_network, p_wallet_slug, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 3: Quitar medio de pago
CREATE OR REPLACE FUNCTION remove_payment_method(
  p_phone TEXT,
  p_bank_slug TEXT DEFAULT NULL,
  p_wallet_slug TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE wa_phone = p_phone;
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;

  IF p_bank_slug IS NOT NULL THEN
    DELETE FROM user_payment_methods WHERE user_id = v_user_id AND bank_slug = p_bank_slug;
  END IF;
  IF p_wallet_slug IS NOT NULL THEN
    DELETE FROM user_payment_methods WHERE user_id = v_user_id AND wallet_slug = p_wallet_slug;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
