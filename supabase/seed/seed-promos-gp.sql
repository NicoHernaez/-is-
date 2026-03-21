-- ============================================
-- -es+ Seed: Promos reales para General Pico
-- Fuentes: Banco de La Pampa, Galicia, BNA,
-- MODO, Cuenta DNI — Marzo 2026
-- ============================================

-- Primero crear las sources
INSERT INTO sources (id, name, source_type, provider, url, is_active, reliability) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Banco de La Pampa - Web Oficial', 'scraping', 'Banco de La Pampa', 'https://pampapromos.bancodelapampa.com.ar', TRUE, 0.90),
  ('a0000001-0000-0000-0000-000000000002', 'Banco Galicia - Buscador Promos', 'scraping', 'Banco Galicia', 'https://www.galicia.ar/personas/buscador-de-promociones', TRUE, 0.85),
  ('a0000001-0000-0000-0000-000000000003', 'Banco Nación - Semana Nación', 'scraping', 'Banco Nación', 'https://semananacion.com.ar', TRUE, 0.90),
  ('a0000001-0000-0000-0000-000000000004', 'MODO - Promos', 'scraping', 'MODO', 'https://modo.com.ar/promociones', TRUE, 0.85),
  ('a0000001-0000-0000-0000-000000000005', 'Instagram comercios GP', 'community', 'Comercios locales', NULL, TRUE, 0.70)
ON CONFLICT DO NOTHING;

-- ═══ BANCO DE LA PAMPA (BLP) ═══════════════════════════════════

-- 1. BLP - Promo Alimentos 25%
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  '25% en alimentos con Banco de La Pampa',
  '25% de descuento en un pago con tarjetas de crédito Caldén de Paquetes Pampa en comercios de alimentos adheridos. Tope $25.000 por semana.',
  'percentage', 25, 25000,
  NULL, 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'confirmed', 0.95, NOW(), TRUE
);

-- 2. BLP - La Feria del Paisa 25%
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000005',
  '25% en La Feria del Paisa con Bco. Pampa',
  '25% de ahorro en un solo pago con tarjeta de crédito Banco de La Pampa. Tope $25.000 por semana. Ideal para compras grandes.',
  'percentage', 25, 25000,
  'La Feria del Paisa', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'confirmed', 0.90, NOW(), TRUE
);

-- 3. BLP - Plan Cuotas (financiación)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  'Plan Cuotas Banco de La Pampa: 3, 6 y 12 cuotas',
  'Financiá tus compras en cuotas con tarjetas Caldén. 3, 6 o 12 cuotas en comercios adheridos. TNA 50%.',
  'installments', 12, NULL,
  NULL, 'otros',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-06-30T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'confirmed', 0.95, NOW(), TRUE
);

-- ═══ BANCO GALICIA ═════════════════════════════════════════════

-- 4. Galicia - Vea/Disco 20% fines de semana
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000002',
  '20% en Vea y Disco con Galicia los fines de semana',
  '20% de descuento con tarjetas Galicia crédito y débito en supermercados Vea y Disco. Válido sábados y domingos.',
  'percentage', 20, NULL,
  'Vea / Disco', 'supermercado',
  ARRAY['galicia'], ARRAY['visa', 'mastercard', 'debit'], ARRAY[]::VARCHAR[],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['SAT', 'SUN'],
  'probable', 0.75, NOW(), TRUE
);

-- 5. Galicia - Carrefour 20% fines de semana
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000002',
  '20% en Carrefour con Galicia fines de semana',
  '20% de descuento con tarjetas Galicia en Carrefour los fines de semana.',
  'percentage', 20, NULL,
  'Carrefour', 'supermercado',
  ARRAY['galicia'], ARRAY['visa', 'mastercard', 'debit'], ARRAY[]::VARCHAR[],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['SAT', 'SUN'],
  'probable', 0.75, NOW(), TRUE
);

-- ═══ BANCO NACIÓN + MODO ══════════════════════════════════════

-- 6. BNA + MODO - 30% supermercados miércoles
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  '30% en supermercados con Banco Nación + MODO los miércoles',
  '30% de reintegro pagando con QR MODO o BNA+ con tarjeta crédito Visa/MC Banco Nación. Válido en Carrefour, Vea, Disco, Coto, Changomás, Día. Tope $12.000/semana.',
  'percentage', 30, 12000,
  'Supermercados adheridos', 'supermercado',
  ARRAY['nacion'], ARRAY['visa', 'mastercard'], ARRAY['modo'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['WED'],
  'confirmed', 0.95, NOW(), TRUE
);

-- 7. BNA + MODO - 10% Carrefour sábados
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  '10% en Carrefour con Banco Nación los sábados',
  '10% de reintegro en Carrefour sin tope y sin mínimo de compra los sábados con Banco Nación.',
  'percentage', 10, NULL,
  'Carrefour', 'supermercado',
  ARRAY['nacion'], ARRAY['visa', 'mastercard', 'debit'], ARRAY[]::VARCHAR[],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['SAT'],
  'confirmed', 0.90, NOW(), TRUE
);

-- 8. BNA + MODO - 20% Nini jueves
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  '20% en Mayorista Nini con Banco Nación los jueves',
  '20% de descuento los jueves en Mayorista Nini con Banco Nación. Tope de reintegro $20.000.',
  'percentage', 20, 20000,
  'Mayorista Nini', 'supermercado',
  ARRAY['nacion'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['THU'],
  'confirmed', 0.90, NOW(), TRUE
);

-- 9. BNA - 50% transporte contactless
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  '50% en transporte con Banco Nación Contactless',
  '50% de descuento en subte y colectivos con tarjeta crédito Visa/MC Banco Nación usando Contactless. Tope $8.000/mes.',
  'percentage', 50, 8000,
  'Transporte público', 'otros',
  ARRAY['nacion'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'confirmed', 0.90, NOW(), TRUE
);

-- ═══ BANCO PROVINCIA (Cuenta DNI) ═════════════════════════════

-- 10. Cuenta DNI - 20% comercios de barrio L-V
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  '20% en comercios de barrio con Cuenta DNI (L-V)',
  '20% de ahorro de lunes a viernes en almacenes, carnicerías, granjas y pescaderías pagando con QR Cuenta DNI. Tope $5.000/semana.',
  'percentage', 20, 5000,
  'Comercios de barrio', 'supermercado',
  ARRAY['bapro'], ARRAY['debit'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['Buenos Aires'], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI'],
  'probable', 0.70, NOW(), TRUE
);

-- 11. Cuenta DNI - 25% gastronomía fines de semana
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  '25% en gastronomía con Cuenta DNI fines de semana',
  '25% de descuento sábados y domingos en gastronomía con Cuenta DNI. Tope $8.000/semana.',
  'percentage', 25, 8000,
  'Gastronomía', 'gastronomia',
  ARRAY['bapro'], ARRAY['debit'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['Buenos Aires'], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['SAT', 'SUN'],
  'probable', 0.70, NOW(), TRUE
);

-- 12. Cuenta DNI - 25% YPF fines de semana
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  '25% en YPF con Cuenta DNI fines de semana',
  '25% de descuento en combustible YPF Full los fines de semana con Cuenta DNI. Tope $8.000/semana.',
  'percentage', 25, 8000,
  'YPF', 'combustible',
  ARRAY['bapro'], ARRAY['debit'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['Buenos Aires'], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['SAT', 'SUN'],
  'probable', 0.70, NOW(), TRUE
);

-- ═══ MACROS / NACIONALES VARIOS ═══════════════════════════════

-- 13. Macro - Changomás
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  '15% en Changomás con Banco Macro',
  '15% de descuento en Changomás con tarjetas Banco Macro. Válido durante marzo.',
  'percentage', 15, NULL,
  'Changomás', 'supermercado',
  ARRAY['macro'], ARRAY['visa', 'mastercard', 'debit'], ARRAY[]::VARCHAR[],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'probable', 0.65, NOW(), TRUE
);

-- 14. MODO - Farmacity
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  '15% en farmacias con MODO',
  '15% de descuento pagando con MODO en farmacias adheridas. Válido durante marzo.',
  'percentage', 15, NULL,
  'Farmacias adheridas', 'farmacia',
  ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[], ARRAY['modo'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'probable', 0.65, NOW(), TRUE
);

-- 15. BNA - Combustibles
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  'Descuento en combustible con Banco Nación',
  'Descuento en carga de combustible en YPF, Shell, Gulf y Axion con tarjetas Banco Nación durante marzo.',
  'percentage', 15, NULL,
  'YPF / Shell / Gulf / Axion', 'combustible',
  ARRAY['nacion'], ARRAY['visa', 'mastercard', 'debit'], ARRAY[]::VARCHAR[],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'probable', 0.75, NOW(), TRUE
);

-- 16. Mercado Pago - QR en comercios
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  'Descuentos pagando con QR Mercado Pago',
  'Descuentos variables en comercios adheridos pagando con QR de Mercado Pago. Beneficios rotativos según el comercio.',
  'percentage', 10, NULL,
  'Comercios adheridos', 'otros',
  ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[], ARRAY['mercadopago'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'probable', 0.60, NOW(), TRUE
);
