-- ============================================
-- -es+ · EJECUTAR TODO EN SUPABASE SQL EDITOR
-- Orden: migraciones → seeds
--
-- IMPORTANTE: Este script asume schema public limpio.
-- Si hay tablas viejas con schemas (core., discounts., etc.)
-- primero ejecutar: DROP SCHEMA IF EXISTS core, discounts, community, gamification, subscriptions, ai, notifications, admin CASCADE;
-- ============================================

-- ═══ MIGRACIONES ═══

-- 00001: Core (users, locations, payment methods)
\i migrations/00001_core.sql

-- 00002: Catálogos (banks, wallets, cities)
\i migrations/00002_catalogs.sql

-- 00003: Descuentos (promotions, sources, error reports)
\i migrations/00003_discounts.sql

-- 00004: WhatsApp + Yapa (conversations, memory, cache)
\i migrations/00004_whatsapp.sql

-- 00005: Club de Amigas + Comunidad
\i migrations/00005_club_and_community.sql

-- 00006: Gamificación + Suscripciones
\i migrations/00006_gamification.sql

-- 00007: Panel Admin
\i migrations/00007_admin.sql

-- 00008: Anexo V — Beneficios Ocultos (Fase 3)
\i migrations/00008_anexo_v.sql

-- ═══ SEEDS ═══

-- Bancos argentinos (27 bancos)
\i seed/seed-banks.sql

-- Billeteras digitales (7)
\i seed/seed-wallets.sql

-- Ciudades (95+)
\i seed/seed-cities.sql

-- Planes + Combustible
\i seed/seed-plans.sql
