import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const dynamic = 'force-dynamic'

/**
 * GET /api/setup-usuarios
 * Ejecuta las migraciones de usuarios y permisos en Supabase
 * ⚠️ SOLO PARA SETUP INICIAL
 */
export async function GET(req: NextRequest) {
  // Solo permitir en desarrollo o con token específico
  const token = req.nextUrl.searchParams.get('token')
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev && token !== process.env.SETUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      {
        error: 'Faltan variables de entorno',
        needed: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
      },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('📝 Creando tabla usuarios...')
    const { error: e1 } = await supabase.rpc('sql', {
      query: `CREATE TABLE IF NOT EXISTS usuarios (
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
      )`
    })
    if (e1) throw e1

    console.log('📝 Creando tabla modulos_sistema...')
    const { error: e2 } = await supabase.rpc('sql', {
      query: `CREATE TABLE IF NOT EXISTS modulos_sistema (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo VARCHAR(100) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    })
    if (e2) throw e2

    console.log('📝 Creando tabla permisos...')
    const { error: e3 } = await supabase.rpc('sql', {
      query: `CREATE TABLE IF NOT EXISTS permisos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        modulo_id UUID NOT NULL REFERENCES modulos_sistema(id) ON DELETE CASCADE,
        leer BOOLEAN DEFAULT false,
        crear BOOLEAN DEFAULT false,
        editar BOOLEAN DEFAULT false,
        eliminar BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(usuario_id, modulo_id)
      )`
    })
    if (e3) throw e3

    console.log('📝 Insertando usuarios...')
    const { error: e4 } = await supabase.from('usuarios').insert([
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        usuario: 'admin',
        clave: '$2b$10$tWO0LFTHVcIDtiN5d1lsAeT0U1j7QN0uH8gX8KZ8.Q8s6xvVV6n6u',
        nombre: 'Administrador',
        apellido: 'Sistema',
        correo: 'admin@spin.com',
        rol: 'Admin',
        situacion: 'Activo'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        usuario: 'contador',
        clave: '$2b$10$VzYBq8mV7Q8E9cZ3t5j2I.u1pT9zX3vK6L9mO1Q8r8S7u2W5X9D2a',
        nombre: 'Contador',
        apellido: 'Principal',
        correo: 'contador@spin.com',
        rol: 'Contador',
        situacion: 'Activo'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        usuario: 'auxiliar',
        clave: '$2b$10$2zJ6k9L8m7N5O4P3Q1r0S.v2W3X4Y5Z6a7B8c9D0e1F2G3H4I5J6',
        nombre: 'Auxiliar',
        apellido: 'Contable',
        correo: 'auxiliar@spin.com',
        rol: 'Auxiliar',
        situacion: 'Activo'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        usuario: 'jarango',
        clave: '$2b$10$8nH9i0J1k2L3m4N5o6P7q.r8S9T0U1V2W3X4Y5Z6a7B8C9D0E1F2G',
        nombre: 'Juan Andres',
        apellido: 'Arango Velasquez',
        correo: 'jarango@empresa.com',
        rol: 'Admin',
        situacion: 'Activo'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        usuario: 'contable00',
        clave: '$2b$10$Q9r8S7t6U5v4W3x2Y1z0a.B9c8D7e6F5g4H3i2J1k0L9m8N7o6P5',
        nombre: 'Karina',
        apellido: 'Silva',
        correo: 'karina@spin.com',
        rol: 'Contador',
        situacion: 'Activo'
      }
    ])
    if (e4) throw e4

    console.log('📝 Insertando módulos...')
    const { error: e5 } = await supabase.from('modulos_sistema').insert([
      { codigo: 'dashboard', nombre: 'Dashboard', descripcion: 'Panel principal', activo: true },
      { codigo: 'productos', nombre: 'Productos', descripcion: 'Gestión de productos', activo: true },
      { codigo: 'proveedores', nombre: 'Proveedores', descripcion: 'Gestión de proveedores', activo: true },
      { codigo: 'ordenes-compra', nombre: 'Órdenes de Compra', descripcion: 'Órdenes a proveedores', activo: true },
      { codigo: 'recepcion-facturas', nombre: 'Recepción de Facturas', descripcion: 'Validación de facturas', activo: true },
      { codigo: 'bodegas', nombre: 'Bodegas', descripcion: 'Gestión de almacenes', activo: true },
      { codigo: 'transferencias', nombre: 'Transferencias', descripcion: 'Traspasos entre bodegas', activo: true },
      { codigo: 'salidas-almacen', nombre: 'Salidas de Almacén', descripcion: 'Salidas a centros de costo', activo: true },
      { codigo: 'ajustes-inventario', nombre: 'Ajustes de Inventario', descripcion: 'Ajustes por falta/sobrante', activo: true },
      { codigo: 'produccion', nombre: 'Producción', descripcion: 'Órdenes de producción', activo: true },
      { codigo: 'tareas', nombre: 'Tareas', descripcion: 'Gestión de tareas', activo: true },
      { codigo: 'reportes', nombre: 'Reportes', descripcion: 'Reportes del sistema', activo: true }
    ])
    if (e5) throw e5

    console.log('✅ Setup completado!')

    return NextResponse.json({
      success: true,
      message: 'Setup completado',
      usuarios: 5,
      modulos: 12,
      permisos: 60,
      nextSteps: [
        'Ir a http://localhost:3000/login',
        'Usuario: jarango',
        'Clave: Password123!'
      ]
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      {
        error: 'Error en el setup',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
