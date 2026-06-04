#!/usr/bin/env node

/**
 * Script para inicializar las tablas de autenticación en Supabase
 * Uso: node scripts/init-supabase-tables.js
 *
 * Requiere variables de entorno:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const pg = require('pg');
const fs = require('fs');
const path = require('path');

async function initSupabaseTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Faltan las variables de entorno necesarias');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗');
    process.exit(1);
  }

  try {
    console.log('🔐 Conectando a PostgreSQL de Supabase...');

    const url = new URL(supabaseUrl);
    const host = url.hostname;

    // Nota: serviceRoleKey es un JWT, no una contraseña PostgreSQL
    // Necesitamos usar las credenciales de PostgreSQL directas
    // Para esto, accedemos via la API de Supabase o configuramos el usuario postgres

    // Alternativa: usar el SDK de Supabase para ejecutar SQL
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('✅ Cliente Supabase creado');
    console.log('⚠️  Nota: Esta es una conexión a través de la API de Supabase');
    console.log('Para crear tablas, necesitas acceder al SQL Editor de Supabase Dashboard');
    console.log('');
    console.log('Pasos:');
    console.log('1. Ve a: ' + supabaseUrl + '/project/sql/new');
    console.log('2. Copia el contenido de supabase/migrations/init_auth_tables.sql');
    console.log('3. Pega en el SQL Editor y ejecuta');
    console.log('');
    console.log('O usa Supabase CLI:');
    console.log('  supabase db push');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

initSupabaseTables();
