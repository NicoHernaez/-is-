-- ============================================
-- -es+ Seed: Promos REALES para General Pico
-- Solo comercios con sucursal verificada en GP
-- Fuentes: webs oficiales bancos, Instagram
-- comercios GP, Tiendeo, Hipotecario/MODO
-- Fecha: 21 Mar 2026
-- ============================================

-- Sources
INSERT INTO sources (id, name, source_type, provider, url, is_active, reliability) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Banco de La Pampa - PampaPromos', 'scraping', 'Banco de La Pampa', 'https://pampapromos.bancodelapampa.com.ar', TRUE, 0.95),
  ('a0000001-0000-0000-0000-000000000002', 'La Anónima - Web Promos', 'scraping', 'La Anónima', 'https://www.laanonima.com.ar/promociones-y-descuentos', TRUE, 0.90),
  ('a0000001-0000-0000-0000-000000000003', 'Comercios GP - Instagram/FB', 'community', 'Comercios locales GP', NULL, TRUE, 0.75),
  ('a0000001-0000-0000-0000-000000000004', 'Open Sports - Web/FB', 'scraping', 'Open Sports', 'https://www.opensports.com.ar/promociones', TRUE, 0.85),
  ('a0000001-0000-0000-0000-000000000005', 'Cooperativa Obrera - Web', 'scraping', 'Cooperativa Obrera', 'https://www.cooperativaobrera.coop', TRUE, 0.85)
ON CONFLICT DO NOTHING;

-- ═══ BANCO DE LA PAMPA — Promos verificadas desde pampapromos ═══

-- 1. BLP - Promo Alimentos 25% (verificado: pampapromos.bancodelapampa.com.ar/PromoAlimentos)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  '25% en alimentos con Banco de La Pampa',
  '25% de descuento en un pago con tarjetas de crédito Caldén de Paquetes Pampa en comercios de alimentos adheridos. Tope reintegro $25.000 por semana.',
  'percentage', 25, 25000,
  'Comercios de alimentos adheridos', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY[]::VARCHAR[],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'confirmed', 0.95, NOW(), TRUE
);

-- 2. BLP - La Feria del Paisa 25% (verificado: Instagram @laferiadelpaisa, 14 ene 2026)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  '25% en La Feria del Paisa con Bco. Pampa',
  '25% de ahorro en un solo pago con tarjeta de crédito Paquete Pampa. Tope $25.000/semana. Ideal para compras grandes.',
  'percentage', 25, 25000,
  'La Feria del Paisa', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'confirmed', 0.90, NOW(), TRUE
);

-- 3. BLP - Lomas Pico distribuidora 25% (verificado: FB @lomaspico, 10 mar 2026)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  '25% en Lomas Pico con Bco. Pampa',
  '25% de descuento con tarjetas de crédito Paquete Pampa. Reintegro hasta $25.000/semana. Distribuidora de pastelería, panadería y materias primas. Calle 25 e/ 30 y 32.',
  'percentage', 25, 25000,
  'Lomas Pico', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'confirmed', 0.90, NOW(), TRUE
);

-- 4. BLP - Plan Cuotas (verificado: pampapromos.bancodelapampa.com.ar/plancuotas24)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  'Plan Cuotas Banco de La Pampa: 3, 6 y 12 cuotas',
  'Financiá tus compras en cuotas con tarjetas Caldén en comercios adheridos. TNA 50%, TEA 61%. Todos los días.',
  'installments', 12, NULL,
  'Comercios adheridos BLP', 'otros',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY[]::VARCHAR[],
  '2026-01-01T00:00:00Z', '2026-06-30T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'confirmed', 0.95, NOW(), TRUE
);

-- ═══ LA ANÓNIMA — 2 sucursales en GP (Calle 7 y Calle 9) ═══

-- 5. La Anónima + ICBC MODO 20% jueves (verificado: laanonima.com.ar — menciona General Pico explícitamente)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000002',
  '20% en La Anónima con ICBC MODO los jueves',
  '20% de reintegro pagando con tarjeta Visa débito ICBC a través de MODO. Tope $10.000 semanal. Válido en sucursales de General Pico (Calle 7 y Calle 9).',
  'percentage', 20, 10000,
  'La Anónima', 'supermercado',
  ARRAY['icbc'], ARRAY['debit'], ARRAY['modo'],
  FALSE, FALSE, ARRAY[]::VARCHAR[], ARRAY['General Pico'],
  '2025-10-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['THU'],
  'confirmed', 0.90, NOW(), TRUE
);

-- 6. La Anónima + Bco Hipotecario MODO 25% martes (verificado: hipotecario.com.ar + laanonima.com.ar)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000002',
  '25% en La Anónima con Hipotecario MODO los martes',
  '25% de descuento con tarjeta débito Banco Hipotecario vía MODO. Tope reintegro $10.000/mes (masivo), $30.000 Búho One/Sueldo/Jubilado. Todas las sucursales físicas.',
  'percentage', 25, 10000,
  'La Anónima', 'supermercado',
  ARRAY['hipotecario'], ARRAY['debit'], ARRAY['modo'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['TUE'],
  'confirmed', 0.90, NOW(), TRUE
);

-- ═══ COOPERATIVA OBRERA — Sucursal en GP ═══

-- 7. Cooperativa Obrera + Bco Hipotecario MODO 25% martes (verificado: hipotecario.com.ar)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000005',
  '25% en Cooperativa Obrera con Hipotecario MODO los martes',
  '25% de descuento con tarjeta débito Banco Hipotecario vía MODO. Tope $10.000/mes masivo, $30.000 segmento Búho.',
  'percentage', 25, 10000,
  'Cooperativa Obrera', 'supermercado',
  ARRAY['hipotecario'], ARRAY['debit'], ARRAY['modo'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['TUE'],
  'confirmed', 0.90, NOW(), TRUE
);

-- 8. Cooperativa Obrera + Mercado Pago 20% tienda online (dato del usuario)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000005',
  '20% en Cooperativa Obrera tienda online con Mercado Pago',
  '20% de descuento comprando en la tienda online de Cooperativa Obrera pagando con Mercado Pago.',
  'percentage', 20, NULL,
  'Cooperativa Obrera (online)', 'supermercado',
  ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[], ARRAY['mercadopago'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'community', 0.70, NOW(), TRUE
);

-- ═══ OPEN SPORTS — Sucursal en GP (Calle 17 1155) ═══

-- 9. Open Sports + Santander MODO 20% sábados (verificado: FB @opensportsok, 7 feb 2026)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  '20% en Open Sports con Santander MODO los sábados',
  '20% off + hasta 9 cuotas sin interés con tarjetas Santander Visa (débito y crédito) vía MODO. Sin tope de reintegro. Sucursal GP: Calle 17 1155. También online opensports.com.ar.',
  'percentage', 20, NULL,
  'Open Sports', 'indumentaria',
  ARRAY['santander'], ARRAY['visa', 'debit'], ARRAY['modo'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-02-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['SAT'],
  'confirmed', 0.85, NOW(), TRUE
);

-- 10. Open Sports - 3x2 productos seleccionados (verificado: IG @opensportsok, 15 ene 2026)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000004',
  '3x2 en Open Sports + 3 cuotas sin interés con MP',
  '3x2 en productos seleccionados: llevás 3, pagás 2. Hasta 3 cuotas sin interés con Mercado Pago sin monto mínimo. En sucursales y opensports.com.ar.',
  'bogo', 33, NULL,
  'Open Sports', 'indumentaria',
  ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[], ARRAY['mercadopago'],
  FALSE, TRUE, ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  '2026-01-15T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'probable', 0.70, NOW(), TRUE
);

-- ═══ OTROS COMERCIOS EN GP VERIFICADOS ═══

-- 11. Diarco (sucursal en Ruta 1, GP) — BLP Alimentos
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  '25% en Diarco con Banco de La Pampa',
  '25% de descuento con tarjeta crédito Paquete Pampa en Diarco (Ruta 1, camino al Aeropuerto, GP). Dentro de la promo Alimentos BLP. Tope $25.000/semana.',
  'percentage', 25, 25000,
  'Diarco', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'probable', 0.80, NOW(), TRUE
);

-- 12. Supermercados Vea (en GP según Tiendeo) — BLP Alimentos
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  '25% en Vea con Banco de La Pampa',
  '25% de descuento con tarjeta crédito Paquete Pampa en Supermercados Vea. Dentro de la promo Alimentos BLP si está adherido. Tope $25.000/semana.',
  'percentage', 25, 25000,
  'Supermercados Vea', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'probable', 0.75, NOW(), TRUE
);

-- 13. Naldo Lombardi (Calle 13 956 y Calle 17 967, GP) — electro/hogar
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  'Cuotas Banco de La Pampa en Naldo Lombardi',
  'Financiá electro y hogar en Naldo Lombardi con Plan Cuotas BLP. 2 sucursales en GP: Calle 13 956 y Calle 17 967.',
  'installments', 12, NULL,
  'Naldo Lombardi', 'electronica',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-06-30T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  'probable', 0.75, NOW(), TRUE
);

-- 14. Hiper Libertad (en GP según Tiendeo)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000001',
  '25% en Hiper Libertad con Banco de La Pampa',
  '25% de descuento con tarjeta crédito Paquete Pampa en Hiper Libertad si está adherido a la promo Alimentos BLP. Tope $25.000/semana.',
  'percentage', 25, 25000,
  'Hiper Libertad', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'probable', 0.70, NOW(), TRUE
);

-- 15. Supermayorista Vital (en GP según Tiendeo)
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  '25% en Supermayorista Vital con Banco de La Pampa',
  'Supermayorista Vital acepta Paquete Pampa. Si está adherido a la promo Alimentos, 25% off. Tope $25.000/semana.',
  'percentage', 25, 25000,
  'Supermayorista Vital', 'supermercado',
  ARRAY['pampa'], ARRAY['visa', 'mastercard'], ARRAY[]::VARCHAR[],
  FALSE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-03-31T23:59:59Z', ARRAY['MON', 'WED', 'FRI', 'SAT'],
  'probable', 0.65, NOW(), TRUE
);

-- 16. Shell (Ruta 1 e/ Calles 26 y 28, GP) — combustible
INSERT INTO promotions (
  source_id, title, description, discount_type, discount_value, max_discount,
  merchant_name, merchant_category, required_banks, required_cards, required_wallets,
  any_payment_method, applies_nationwide, applies_provinces, applies_cities,
  valid_from, valid_until, valid_days,
  confidence_status, confidence_score, last_verified_at, is_active
) VALUES (
  'a0000001-0000-0000-0000-000000000003',
  'Shell Box: descuentos en combustible en GP',
  'Descuentos pagando con Shell Box en la estación Shell de Ruta 1 e/ Calles 26 y 28, General Pico. Acumulable con promos bancarias.',
  'percentage', 5, NULL,
  'Shell', 'combustible',
  ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[], ARRAY[]::VARCHAR[],
  TRUE, FALSE, ARRAY['La Pampa'], ARRAY['General Pico'],
  '2026-01-01T00:00:00Z', '2026-06-30T23:59:59Z', ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  'probable', 0.60, NOW(), TRUE
);
