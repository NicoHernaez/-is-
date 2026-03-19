-- ============================================
-- -es+ Seed: 95+ ciudades del Anexo R v2
-- ============================================

INSERT INTO cities (name, province, population, tier, provincial_bank, expansion_wave, is_active) VALUES
-- La Pampa (PILOTO — ola 1)
('General Pico',    'La Pampa',     65000,  'piloto', 'pampa', 1, TRUE),
('Santa Rosa',      'La Pampa',     120000, 'tier2',  'pampa', 1, FALSE),
('General Acha',    'La Pampa',     30000,  'tier3',  'pampa', 1, FALSE),
('Toay',            'La Pampa',     30000,  'tier3',  'pampa', 1, FALSE),

-- Buenos Aires interior (ola 2-3)
('La Plata',        'Buenos Aires', 650000, 'tier1',  'bapro', 2, FALSE),
('Bahía Blanca',    'Buenos Aires', 301000, 'tier1',  'bapro', 2, FALSE),
('Mar del Plata',   'Buenos Aires', 620000, 'tier1',  'bapro', 3, FALSE),
('San Nicolás',     'Buenos Aires', 145000, 'tier2',  'bapro', 2, FALSE),
('Tandil',          'Buenos Aires', 130000, 'tier2',  'bapro', 2, FALSE),
('Olavarría',       'Buenos Aires', 115000, 'tier2',  'bapro', 3, FALSE),
('Zárate',          'Buenos Aires', 110000, 'tier2',  'bapro', 3, FALSE),
('Luján',           'Buenos Aires', 110000, 'tier2',  'bapro', 3, FALSE),
('Pergamino',       'Buenos Aires', 105000, 'tier2',  'bapro', 2, FALSE),
('Campana',         'Buenos Aires', 94000,  'tier2',  'bapro', 3, FALSE),
('Necochea',        'Buenos Aires', 92000,  'tier2',  'bapro', 3, FALSE),
('Junín',           'Buenos Aires', 90000,  'tier2',  'bapro', 2, FALSE),
('Chivilcoy',       'Buenos Aires', 65000,  'tier3',  'bapro', 3, FALSE),
('Azul',            'Buenos Aires', 65000,  'tier3',  'bapro', 3, FALSE),
('Tres Arroyos',    'Buenos Aires', 58000,  'tier3',  'bapro', 3, FALSE),
('9 de Julio',      'Buenos Aires', 47000,  'tier3',  'bapro', 4, FALSE),
('Trenque Lauquen', 'Buenos Aires', 43000,  'tier3',  'bapro', 4, FALSE),
('Chacabuco',       'Buenos Aires', 38000,  'tier3',  'bapro', 4, FALSE),
('Bolívar',         'Buenos Aires', 35000,  'tier3',  'bapro', 4, FALSE),
('Benito Juárez',   'Buenos Aires', 32000,  'tier3',  'bapro', 4, FALSE),

-- Córdoba (ola 2-3)
('Córdoba capital',   'Córdoba', 1500000, 'tier1',  'bancor', 5, FALSE),
('Río Cuarto',        'Córdoba', 170000,  'tier1',  'bancor', 2, FALSE),
('Villa María',       'Córdoba', 100000,  'tier2',  'bancor', 2, FALSE),
('San Francisco',     'Córdoba', 80000,   'tier2',  'bancor', 3, FALSE),
('Villa Carlos Paz',  'Córdoba', 75000,   'tier2',  'bancor', 3, FALSE),
('Alta Gracia',       'Córdoba', 52000,   'tier3',  'bancor', 4, FALSE),
('Río Tercero',       'Córdoba', 50000,   'tier3',  'bancor', 4, FALSE),
('Bell Ville',        'Córdoba', 35000,   'tier3',  'bancor', 4, FALSE),
('Jesús María',       'Córdoba', 35000,   'tier3',  'bancor', 4, FALSE),
('Marcos Juárez',     'Córdoba', 32000,   'tier3',  'bancor', 4, FALSE),

-- Santa Fe (ola 2-3)
('Santa Fe capital', 'Santa Fe', 400000, 'tier1',  'nbsf', 2, FALSE),
('Rosario',          'Santa Fe', 1300000,'tier1',  'nbsf', 5, FALSE),
('Rafaela',          'Santa Fe', 110000, 'tier2',  'nbsf', 2, FALSE),
('Venado Tuerto',    'Santa Fe', 80000,  'tier2',  'nbsf', 3, FALSE),
('Reconquista',      'Santa Fe', 75000,  'tier2',  'nbsf', 3, FALSE),
('San Lorenzo',      'Santa Fe', 50000,  'tier3',  'nbsf', 4, FALSE),
('Esperanza',        'Santa Fe', 45000,  'tier3',  'nbsf', 4, FALSE),
('Casilda',          'Santa Fe', 40000,  'tier3',  'nbsf', 4, FALSE),
('Sunchales',        'Santa Fe', 35000,  'tier3',  'nbsf', 4, FALSE),

-- Mendoza (ola 3)
('Mendoza capital', 'Mendoza', 900000, 'tier1', 'nacion', 5, FALSE),
('San Rafael',      'Mendoza', 120000, 'tier2', 'nacion', 3, FALSE),
('San Martín',      'Mendoza', 60000,  'tier3', 'nacion', 4, FALSE),
('Rivadavia',       'Mendoza', 55000,  'tier3', 'nacion', 4, FALSE),
('Tunuyán',         'Mendoza', 42000,  'tier3', 'nacion', 4, FALSE),
('Malargüe',        'Mendoza', 30000,  'tier3', 'nacion', 4, FALSE),

-- Entre Ríos (ola 2)
('Paraná',                'Entre Ríos', 250000, 'tier1', 'bersa', 2, FALSE),
('Concordia',             'Entre Ríos', 150000, 'tier2', 'bersa', 2, FALSE),
('Gualeguaychú',          'Entre Ríos', 83000,  'tier2', 'bersa', 3, FALSE),
('Concepción del Uruguay','Entre Ríos', 73000,  'tier2', 'bersa', 3, FALSE),
('Gualeguay',             'Entre Ríos', 40000,  'tier3', 'bersa', 4, FALSE),
('Villaguay',             'Entre Ríos', 38000,  'tier3', 'bersa', 4, FALSE),
('Chajarí',               'Entre Ríos', 35000,  'tier3', 'bersa', 4, FALSE),
('Victoria',              'Entre Ríos', 35000,  'tier3', 'bersa', 4, FALSE),

-- Tucumán (ola 3)
('San Miguel de Tucumán', 'Tucumán', 900000, 'tier1', 'tucuman', 5, FALSE),
('Yerba Buena',           'Tucumán', 75000,  'tier2', 'tucuman', 3, FALSE),
('Concepción',            'Tucumán', 60000,  'tier2', 'tucuman', 3, FALSE),
('Tafí Viejo',            'Tucumán', 50000,  'tier3', 'tucuman', 4, FALSE),
('Aguilares',             'Tucumán', 35000,  'tier3', 'tucuman', 4, FALSE),
('Monteros',              'Tucumán', 35000,  'tier3', 'tucuman', 4, FALSE),

-- Salta (ola 3)
('Salta capital',               'Salta', 500000, 'tier1', 'macro', 3, FALSE),
('San Ramón de la Nueva Orán',  'Salta', 85000,  'tier2', 'macro', 3, FALSE),
('Tartagal',                    'Salta', 70000,  'tier2', 'macro', 3, FALSE),
('General Güemes',              'Salta', 47000,  'tier3', 'macro', 4, FALSE),
('Cafayate',                    'Salta', 30000,  'tier3', 'macro', 4, FALSE),

-- Misiones (ola 3)
('Posadas',       'Misiones', 320000, 'tier1', 'macro', 3, FALSE),
('Oberá',         'Misiones', 75000,  'tier2', 'macro', 3, FALSE),
('Eldorado',      'Misiones', 70000,  'tier2', 'macro', 3, FALSE),
('Puerto Iguazú', 'Misiones', 42000,  'tier3', 'macro', 4, FALSE),
('Apóstoles',     'Misiones', 35000,  'tier3', 'macro', 4, FALSE),

-- Chaco (ola 3)
('Resistencia',                      'Chaco', 350000, 'tier1', 'nbch', 3, FALSE),
('Presidencia Roque Sáenz Peña',     'Chaco', 100000, 'tier2', 'nbch', 3, FALSE),
('Villa Ángela',                     'Chaco', 40000,  'tier3', 'nbch', 4, FALSE),
('Charata',                          'Chaco', 32000,  'tier3', 'nbch', 4, FALSE),

-- Corrientes (ola 3)
('Corrientes capital', 'Corrientes', 350000, 'tier1', 'corrientes', 3, FALSE),
('Goya',               'Corrientes', 90000,  'tier2', 'corrientes', 3, FALSE),
('Paso de los Libres', 'Corrientes', 42000,  'tier3', 'corrientes', 4, FALSE),
('Curuzú Cuatiá',      'Corrientes', 38000,  'tier3', 'corrientes', 4, FALSE),
('Mercedes',           'Corrientes', 35000,  'tier3', 'corrientes', 4, FALSE),

-- Neuquén (ola 2)
('Neuquén capital',          'Neuquén', 260000, 'tier1', 'bpn', 2, FALSE),
('Centenario',               'Neuquén', 40000,  'tier3', 'bpn', 4, FALSE),
('Plottier',                 'Neuquén', 40000,  'tier3', 'bpn', 4, FALSE),
('Zapala',                   'Neuquén', 38000,  'tier3', 'bpn', 4, FALSE),
('Cutral Có',                'Neuquén', 35000,  'tier3', 'bpn', 4, FALSE),
('San Martín de los Andes',  'Neuquén', 35000,  'tier3', 'bpn', 4, FALSE),

-- Río Negro (ola 4)
('San Carlos de Bariloche', 'Río Negro', 130000, 'tier2', 'patagonia', 4, FALSE),
('General Roca',            'Río Negro', 90000,  'tier2', 'patagonia', 4, FALSE),
('Cipolletti',              'Río Negro', 85000,  'tier2', 'patagonia', 4, FALSE),
('Viedma',                  'Río Negro', 60000,  'tier3', 'patagonia', 4, FALSE),
('Allen',                   'Río Negro', 35000,  'tier3', 'patagonia', 4, FALSE),

-- San Juan (ola 3)
('Gran San Juan', 'San Juan', 470000, 'tier1', 'san_juan', 3, FALSE),
('Caucete',       'San Juan', 35000,  'tier3', 'san_juan', 4, FALSE),

-- Jujuy (ola 3)
('San Salvador de Jujuy',        'Jujuy', 310000, 'tier1', 'macro', 3, FALSE),
('San Pedro de Jujuy',           'Jujuy', 65000,  'tier2', 'macro', 3, FALSE),
('Palpalá',                      'Jujuy', 50000,  'tier3', 'macro', 4, FALSE),
('Libertador Gral. San Martín',  'Jujuy', 45000,  'tier3', 'macro', 4, FALSE),

-- Santiago del Estero (ola 3)
('Santiago del Estero capital', 'Santiago del Estero', 280000, 'tier1', 'nacion', 3, FALSE),
('La Banda',                    'Santiago del Estero', 110000, 'tier2', 'nacion', 3, FALSE),
('Termas de Río Hondo',         'Santiago del Estero', 35000,  'tier3', 'nacion', 4, FALSE),
('Añatuya',                     'Santiago del Estero', 30000,  'tier3', 'nacion', 4, FALSE),

-- San Luis (ola 2)
('San Luis capital', 'San Luis', 180000, 'tier1', 'nacion', 2, FALSE),
('Villa Mercedes',   'San Luis', 110000, 'tier2', 'nacion', 2, FALSE),
('Merlo',            'San Luis', 35000,  'tier3', 'nacion', 4, FALSE),

-- Chubut (ola 4)
('Comodoro Rivadavia', 'Chubut', 180000, 'tier1', 'chubut', 4, FALSE),
('Trelew',             'Chubut', 100000, 'tier2', 'chubut', 4, FALSE),
('Puerto Madryn',      'Chubut', 80000,  'tier2', 'chubut', 4, FALSE),
('Rawson',             'Chubut', 35000,  'tier3', 'chubut', 4, FALSE),
('Esquel',             'Chubut', 35000,  'tier3', 'chubut', 4, FALSE),

-- Catamarca (ola 4)
('San Fernando del Valle de Catamarca', 'Catamarca', 170000, 'tier1', 'nacion', 4, FALSE),

-- La Rioja (ola 4)
('La Rioja capital', 'La Rioja', 180000, 'tier1', 'nblr', 4, FALSE),
('Chilecito',        'La Rioja', 55000,  'tier3', 'nblr', 4, FALSE),

-- Formosa (ola 3)
('Formosa capital', 'Formosa', 270000, 'tier1', 'formosa', 3, FALSE),
('Clorinda',        'Formosa', 55000,  'tier3', 'formosa', 4, FALSE),
('Pirané',          'Formosa', 35000,  'tier3', 'formosa', 4, FALSE),

-- Santa Cruz (ola 4)
('Río Gallegos',  'Santa Cruz', 100000, 'tier2', 'santa_cruz', 4, FALSE),
('Caleta Olivia', 'Santa Cruz', 60000,  'tier3', 'santa_cruz', 4, FALSE),
('El Calafate',   'Santa Cruz', 32000,  'tier3', 'santa_cruz', 4, FALSE),

-- Tierra del Fuego (ola 4)
('Río Grande', 'Tierra del Fuego', 75000, 'tier2', 'tdf', 4, FALSE),
('Ushuaia',    'Tierra del Fuego', 55000, 'tier2', 'tdf', 4, FALSE);
