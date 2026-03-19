-- ============================================
-- -es+ Seed: Bancos argentinos
-- ============================================

INSERT INTO banks (slug, display_name, short_name, bank_type, provinces, card_networks, has_modo, sort_order) VALUES
-- Provinciales
('pampa',       'Banco de La Pampa',              'BLP',    'provincial', ARRAY['La Pampa'],                                ARRAY['visa','mastercard'], TRUE,  1),
('bapro',       'Banco Provincia',                'BAPRO',  'provincial', ARRAY['Buenos Aires'],                            ARRAY['visa','mastercard'], TRUE,  2),
('bancor',      'Bancor',                         'Bancor', 'provincial', ARRAY['Córdoba'],                                 ARRAY['visa','mastercard'], TRUE,  3),
('nbsf',        'Nuevo Banco de Santa Fe',        'NBSF',  'provincial', ARRAY['Santa Fe'],                                ARRAY['visa','mastercard'], TRUE,  4),
('bersa',       'Bersa',                          'Bersa',  'provincial', ARRAY['Entre Ríos'],                              ARRAY['visa','mastercard'], TRUE,  5),
('tucuman',     'Banco Tucumán',                  'BT',     'provincial', ARRAY['Tucumán'],                                 ARRAY['visa','mastercard'], TRUE,  6),
('bpn',         'Banco Provincia del Neuquén',    'BPN',    'provincial', ARRAY['Neuquén'],                                 ARRAY['visa','mastercard'], TRUE,  7),
('corrientes',  'Banco de Corrientes',            'BC',     'provincial', ARRAY['Corrientes'],                              ARRAY['visa'],              FALSE, 8),
('chubut',      'Banco del Chubut',               'BCh',    'provincial', ARRAY['Chubut'],                                  ARRAY['visa','mastercard'], FALSE, 9),
('san_juan',    'Banco San Juan',                 'BSJ',    'provincial', ARRAY['San Juan'],                                ARRAY['visa','mastercard'], FALSE, 10),
('formosa',     'Banco de Formosa',               'BF',     'provincial', ARRAY['Formosa'],                                 ARRAY['visa'],              FALSE, 11),
('santa_cruz',  'Banco de Santa Cruz',            'BSC',    'provincial', ARRAY['Santa Cruz'],                              ARRAY['visa'],              FALSE, 12),
('tdf',         'Banco de Tierra del Fuego',      'BTF',    'provincial', ARRAY['Tierra del Fuego'],                        ARRAY['visa','mastercard'], FALSE, 13),
('nblr',        'Nuevo Banco de La Rioja',        'NBLR',   'provincial', ARRAY['La Rioja'],                                ARRAY['visa'],              FALSE, 14),
('nbch',        'Nuevo Banco del Chaco',          'NBCh',   'provincial', ARRAY['Chaco'],                                   ARRAY['visa','mastercard'], FALSE, 15),
('patagonia',   'Banco Patagonia',                'BPat',   'provincial', ARRAY['Río Negro'],                               ARRAY['visa','mastercard'], TRUE,  16),

-- Nacionales (los más comunes)
('galicia',     'Banco Galicia',                  'Galicia',    'national', NULL, ARRAY['visa','mastercard','amex'], TRUE,  20),
('bbva',        'BBVA',                           'BBVA',       'national', NULL, ARRAY['visa','mastercard'],        TRUE,  21),
('macro',       'Banco Macro',                    'Macro',      'national', NULL, ARRAY['visa','mastercard'],        TRUE,  22),
('santander',   'Santander',                      'Santander',  'national', NULL, ARRAY['visa','mastercard','amex'], TRUE,  23),
('nacion',      'Banco Nación',                   'Nación',     'national', NULL, ARRAY['visa','mastercard'],        TRUE,  24),
('hsbc',        'HSBC',                           'HSBC',       'national', NULL, ARRAY['visa','mastercard'],        TRUE,  30),
('credicoop',   'Banco Credicoop',                'Credicoop',  'national', NULL, ARRAY['visa','mastercard'],        TRUE,  31),
('icbc',        'ICBC',                           'ICBC',       'national', NULL, ARRAY['visa','mastercard'],        TRUE,  32),
('supervielle', 'Banco Supervielle',              'Supervielle','national', NULL, ARRAY['visa','mastercard'],        TRUE,  33),
('ciudad',      'Banco Ciudad',                   'Ciudad',     'national', NULL, ARRAY['visa','mastercard'],        TRUE,  34),

-- Digitales
('brubank',     'Brubank',                        'Brubank',    'digital',  NULL, ARRAY['visa','mastercard'],        FALSE, 40);
