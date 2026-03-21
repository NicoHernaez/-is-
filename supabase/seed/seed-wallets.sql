-- ============================================
-- -es+ Seed: Billeteras digitales
-- ============================================

INSERT INTO wallets (slug, display_name, has_card, card_network, card_type, sort_order) VALUES
('mercadopago', 'Mercado Pago',  TRUE,  'mastercard', 'prepaga',  1),
('modo',        'Modo',          FALSE, NULL,         NULL,        2),
('uala',        'Ualá',          TRUE,  'mastercard', 'prepaga',  3),
('naranjax',    'Naranja X',     TRUE,  'visa',       'prepaga',  4),
('personalpay', 'Personal Pay',  TRUE,  'visa',       'prepaga',  5),
('prex',        'Prex',          TRUE,  'mastercard', 'prepaga',  6),
('bimo',        'Bimo',          FALSE, NULL,         NULL,        7);
