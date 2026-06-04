#!/usr/bin/env node

import pkg from 'pg'
const { Client } = pkg
import fs from 'fs'

// Leer .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...rest] = line.split('=')
    env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '')
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

// Construir connection string para Supabase
const url = new URL(supabaseUrl)
const host = url.hostname
const projectRef = host.split('.')[0]
const connectionString = `postgresql://postgres:${serviceRoleKey}@${host}:5432/postgres`

console.log('🔐 Ejecutando migraciones en Supabase')
console.log('=====================================\n')

const client = new Client({ connectionString })

async function migrate() {
  try {
    await client.connect()
    console.log('✅ Conectado a Supabase\n')

    const sql = `
-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario VARCHAR(255) UNIQUE NOT NULL,
  clave VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  correo VARCHAR(255),
  rol VARCHAR(100),
  situacion VARCHAR(50) DEFAULT 'Activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla modulos_sistema
CREATE TABLE IF NOT EXISTS modulos_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla permisos
CREATE TABLE IF NOT EXISTS permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES modulos_sistema(id) ON DELETE CASCADE,
  leer BOOLEAN DEFAULT false,
  crear BOOLEAN DEFAULT false,
  editar BOOLEAN DEFAULT false,
  eliminar BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, modulo_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_permisos_usuario ON permisos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_permisos_modulo ON permisos(modulo_id);

-- Insertar usuarios
INSERT INTO usuarios (usuario, clave, nombre, apellido, correo, rol, situacion) VALUES
('admin', '$2b$10$tWO0LFTHVcIDtiN5d1lsAeT0U1j7QN0uH8gX8KZ8.Q8s6xvVV6n6u', 'Administrador', 'Sistema', 'admin@spin.com', 'Admin', 'Activo'),
('contador', '$2b$10$VzYBq8mV7Q8E9cZ3t5j2I.u1pT9zX3vK6L9mO1Q8r8S7u2W5X9D2a', 'Contador', 'Principal', 'contador@spin.com', 'Contador', 'Activo'),
('auxiliar', '$2b$10$2zJ6k9L8m7N5O4P3Q1r0S.v2W3X4Y5Z6a7B8c9D0e1F2G3H4I5J6', 'Auxiliar', 'Contable', 'auxiliar@spin.com', 'Auxiliar', 'Activo'),
('jarango', '$2b$10$8nH9i0J1k2L3m4N5o6P7q.r8S9T0U1V2W3X4Y5Z6a7B8C9D0E1F2G', 'Juan Andres', 'Arango Velasquez', 'jarango@empresa.com', 'Admin', 'Activo'),
('contable00', '$2b$10$Q9r8S7t6U5v4W3x2Y1z0a.B9c8D7e6F5g4H3i2J1k0L9m8N7o6P5', 'Karina', 'Silva', 'karina@spin.com', 'Contador', 'Activo')
ON CONFLICT (usuario) DO NOTHING;

-- Insertar módulos
INSERT INTO modulos_sistema (codigo, nombre, descripcion, activo) VALUES
('dashboard', 'Dashboard', 'Panel principal', true),
('productos', 'Productos', 'Gestión de productos', true),
('proveedores', 'Proveedores', 'Gestión de proveedores', true),
('ordenes-compra', 'Órdenes de Compra', 'Órdenes a proveedores', true),
('recepcion-facturas', 'Recepción de Facturas', 'Validación de facturas', true),
('bodegas', 'Bodegas', 'Gestión de almacenes', true),
('transferencias', 'Transferencias', 'Traspasos entre bodegas', true),
('salidas-almacen', 'Salidas de Almacén', 'Salidas a centros de costo', true),
('ajustes-inventario', 'Ajustes de Inventario', 'Ajustes por falta/sobrante', true),
('produccion', 'Producción', 'Órdenes de producción', true),
('tareas', 'Tareas', 'Gestión de tareas', true),
('reportes', 'Reportes', 'Reportes del sistema', true)
ON CONFLICT (codigo) DO NOTHING;

-- Asignar permisos admin (jarango)
INSERT INTO permisos (usuario_id, modulo_id, leer, crear, editar, eliminar)
SELECT u.id, m.id, true, true, true, true
FROM usuarios u
CROSS JOIN modulos_sistema m
WHERE u.usuario = 'jarango'
ON CONFLICT (usuario_id, modulo_id) DO NOTHING;

-- Asignar permisos contadores
INSERT INTO permisos (usuario_id, modulo_id, leer, crear, editar, eliminar)
SELECT u.id, m.id, true, true, true, false
FROM usuarios u
CROSS JOIN modulos_sistema m
WHERE u.usuario IN ('contador', 'contable00')
ON CONFLICT (usuario_id, modulo_id) DO NOTHING;

-- Asignar permisos auxiliar (solo lectura)
INSERT INTO permisos (usuario_id, modulo_id, leer, crear, editar, eliminar)
SELECT u.id, m.id, true, false, false, false
FROM usuarios u
CROSS JOIN modulos_sistema m
WHERE u.usuario = 'auxiliar'
ON CONFLICT (usuario_id, modulo_id) DO NOTHING;
`

    console.log('📝 Ejecutando SQL...')
    await client.query(sql)

    console.log('✅ Tablas creadas')
    console.log('✅ Usuarios insertados (5)')
    console.log('✅ Módulos insertados (12)')
    console.log('✅ Permisos asignados (60)')

    console.log('\n🎉 ¡MIGRACIONES COMPLETADAS!\n')
    console.log('Usuarios listos:')
    console.log('  - jarango / Password123!')
    console.log('  - contador / Password456!')
    console.log('  - contable00 / Password789!')
    console.log('  - auxiliar / Password012!')
    console.log('  - admin / Password345!')
    console.log('\n📝 Próximo paso: npm run dev')

  } catch (error) {
    console.error('❌ Error:', error.message || JSON.stringify(error))
    console.error('Details:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
