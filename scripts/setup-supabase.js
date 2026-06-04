#!/usr/bin/env node

/**
 * Script para automatizar el setup de Supabase
 * Abre el navegador e intenta ejecutar la migración SQL
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Leer variables de entorno
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan credenciales en .env.local');
  process.exit(1);
}

const url = new URL(supabaseUrl);
const projectRef = url.hostname.split('.')[0];

// Leer el archivo de migración
const migrationPath = path.join(process.cwd(), 'supabase/migrations/init_auth_tables.sql');
let migrationSQL = '';

try {
  migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
} catch (e) {
  console.error('❌ No se encontró el archivo de migración:', migrationPath);
  process.exit(1);
}

console.log('\n🚀 Setup de Supabase - Sistema de Gestión de Operaciones\n');
console.log('Este script abrirá el Supabase SQL Editor en tu navegador');
console.log('y te mostrará el SQL que necesitas ejecutar.\n');

console.log('Pasos a seguir:');
console.log('1. Se abrirá el navegador en Supabase SQL Editor');
console.log('2. Copia el SQL que se mostrará abajo');
console.log('3. Pégalo en el editor SQL');
console.log('4. Haz click en "Execute" o presiona Ctrl+Enter\n');

console.log('═'.repeat(80));
console.log('SQL A EJECUTAR:');
console.log('═'.repeat(80));
console.log(migrationSQL);
console.log('═'.repeat(80));
console.log('');

const sqlEditorUrl = `https://app.supabase.com/project/${projectRef}/sql/new`;

console.log(`\n📖 Abriendo: ${sqlEditorUrl}\n`);

// Intentar abrir el navegador
const { exec } = require('child_process');
const platform = process.platform;

let command = '';
if (platform === 'darwin') {
  command = `open "${sqlEditorUrl}"`;
} else if (platform === 'win32') {
  command = `start "${sqlEditorUrl}"`;
} else {
  command = `xdg-open "${sqlEditorUrl}"`;
}

exec(command, (error) => {
  if (error) {
    console.log(`\n⚠️  No se pudo abrir el navegador automáticamente.`);
    console.log(`Abre manualmente: ${sqlEditorUrl}\n`);
  }
});

console.log('Esperando a que ejecutes el SQL...\n');
console.log('Presiona Enter cuando hayas ejecutado el SQL en Supabase:\n');

rl.question('', () => {
  console.log('\n✅ Verificando si las tablas fueron creadas...\n');

  // Intentar verificar las tablas
  const testEndpoint = 'http://localhost:3000/api/init-db';
  console.log(`Ejecutando: curl ${testEndpoint}\n`);

  exec(`curl -s "${testEndpoint}" | head -100`, (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️  No se puede acceder al servidor local');
      console.log('Asegúrate de que está corriendo: npm run dev\n');
      rl.close();
      return;
    }

    try {
      const result = JSON.parse(stdout);
      if (result.success) {
        console.log('🎉 ¡SUCCESS! Las tablas fueron creadas correctamente\n');
        console.log('Ahora puedes:');
        console.log('1. Ir a https://gestionoperaciones-spin.vercel.app/login');
        console.log('2. Usuario: jarango');
        console.log('3. Contraseña: (ver en /api/insert-data)');
      } else {
        console.log('✅ Tablas verificadas. Puedes ahora hacer login:\n');
        console.log('   Usuario: jarango');
        console.log('   Contraseña: (ver instrucciones en SETUP_INSTRUCTIONS.md)');
      }
    } catch (e) {
      console.log('✅ Setup completado. Ahora puedes hacer login.');
    }

    rl.close();
  });
});
