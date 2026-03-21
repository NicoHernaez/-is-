-- ============================================
-- -es+ Seed: Planes de suscripción
-- ============================================

INSERT INTO plans (slug, name, price_ars, billing_period, features, smart_queries_limit) VALUES
('free', 'Gratis', 0, 'free', '{
  "discounts_general": true,
  "discounts_personalized": false,
  "smart_query": true,
  "smart_query_limit": 3,
  "weekly_summary": true,
  "whatsapp_alerts": false,
  "custom_discounts": false,
  "savings_history": false,
  "club_amigas": true,
  "gamification_full": false
}'::jsonb, 3),
('start_monthly', 'Start', 2000, 'monthly', '{
  "discounts_general": true,
  "discounts_personalized": true,
  "smart_query": true,
  "smart_query_limit": null,
  "weekly_summary": true,
  "whatsapp_alerts": true,
  "custom_discounts": true,
  "savings_history": true,
  "club_amigas": true,
  "gamification_full": true
}'::jsonb, NULL);

-- ============================================
-- Seed: Programas de combustible (Anexo V)
-- ============================================

INSERT INTO fuel_programs (slug, program_name, brand, points_per_liter, redemption_info, strong_provinces) VALUES
('serviclub',  'YPF Serviclub', 'ypf',   1.00, 'Canje por combustible, tienda, aceites. App YPF para ver puntos.', ARRAY['La Pampa','Buenos Aires','Córdoba','Santa Fe','Mendoza']),
('shell_box',  'Shell Box',     'shell',  NULL, 'App Shell Box con descuentos por pago digital. ShellPoints canjeables.', ARRAY['Buenos Aires','Córdoba','Santa Fe']),
('axion_plus', 'Axion+',        'axion',  NULL, 'Programa Axion+ de puntos. Promos con Galicia y BBVA.', ARRAY['Buenos Aires','Córdoba']);
