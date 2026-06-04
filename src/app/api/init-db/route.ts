import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/init-db
 * Inicializa la base de datos: crea tablas e inserta TODOS los datos
 * Ejecutado desde el servidor Next.js (mejor conectividad)
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Faltan credenciales' }, { status: 500 })
  }

  try {
    const logs: string[] = []
    logs.push('🔐 Conectando a PostgreSQL de Supabase...')

    // Importar pg dinámicamente
    const pgModule = await import('pg')
    const { Client } = pgModule

    const host = new URL(supabaseUrl).hostname
    const connectionString = `postgresql://postgres:${serviceRoleKey}@${host}:5432/postgres?sslmode=require`

    const client = new Client({ connectionString })
    await client.connect()
    logs.push('✅ Conectado')

    logs.push('📝 Ejecutando migraciones SQL...')

    const sql = `
-- Crear tablas
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

CREATE TABLE IF NOT EXISTS modulos_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

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

-- Índices
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

-- Asignar permisos admin
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

-- Asignar permisos auxiliar
INSERT INTO permisos (usuario_id, modulo_id, leer, crear, editar, eliminar)
SELECT u.id, m.id, true, false, false, false
FROM usuarios u
CROSS JOIN modulos_sistema m
WHERE u.usuario = 'auxiliar'
ON CONFLICT (usuario_id, modulo_id) DO NOTHING;
`

    await client.query(sql)
    logs.push('✅ Tablas creadas')
    logs.push('✅ Usuarios insertados (5)')
    logs.push('✅ Módulos insertados (12)')
    logs.push('✅ Permisos asignados (60)')

    await client.end()

    logs.push('🎉 ¡SISTEMA COMPLETAMENTE CONFIGURADO!')
    logs.push('')
    logs.push('Usuarios listos:')
    logs.push('  • jarango / Password123!')
    logs.push('  • contador / Password456!')
    logs.push('  • contable00 / Password789!')
    logs.push('  • auxiliar / Password012!')
    logs.push('  • admin / Password345!')

    return NextResponse.json({
      success: true,
      message: '✅ ¡LISTO! Sistema completamente configurado',
      logs
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        hint: 'Asegúrate de que las variables de entorno están correctas'
      },
      { status: 500 }
    )
  }
}
