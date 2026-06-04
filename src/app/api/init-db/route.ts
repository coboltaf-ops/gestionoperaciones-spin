import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/init-db
 * Inserta datos en las tablas de autenticación
 * Las tablas deben existir previamente (ver supabase/migrations/init_auth_tables.sql)
 * Endpoint para inicializar la base de datos en producción
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Faltan credenciales (NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)',
        logs: []
      },
      { status: 500 }
    )
  }

  const logs: string[] = []

  try {
    logs.push('🔐 Inicializando cliente Supabase...')
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    logs.push('✅ Cliente Supabase creado')

    logs.push('📝 Insertando usuarios...')

    // Insertar usuarios
    const { error: usuariosError } = await supabase.from('usuarios').upsert([
      {
        usuario: 'admin',
        clave: '$2b$10$tWO0LFTHVcIDtiN5d1lsAeT0U1j7QN0uH8gX8KZ8.Q8s6xvVV6n6u',
        nombre: 'Administrador',
        apellido: 'Sistema',
        correo: 'admin@spin.com',
        rol: 'Admin',
        situacion: 'Activo'
      },
      {
        usuario: 'contador',
        clave: '$2b$10$VzYBq8mV7Q8E9cZ3t5j2I.u1pT9zX3vK6L9mO1Q8r8S7u2W5X9D2a',
        nombre: 'Contador',
        apellido: 'Principal',
        correo: 'contador@spin.com',
        rol: 'Contador',
        situacion: 'Activo'
      },
      {
        usuario: 'auxiliar',
        clave: '$2b$10$2zJ6k9L8m7N5O4P3Q1r0S.v2W3X4Y5Z6a7B8c9D0e1F2G3H4I5J6',
        nombre: 'Auxiliar',
        apellido: 'Contable',
        correo: 'auxiliar@spin.com',
        rol: 'Auxiliar',
        situacion: 'Activo'
      },
      {
        usuario: 'jarango',
        clave: '$2b$10$8nH9i0J1k2L3m4N5o6P7q.r8S9T0U1V2W3X4Y5Z6a7B8C9D0E1F2G',
        nombre: 'Juan Andres',
        apellido: 'Arango Velasquez',
        correo: 'jarango@empresa.com',
        rol: 'Admin',
        situacion: 'Activo'
      },
      {
        usuario: 'contable00',
        clave: '$2b$10$Q9r8S7t6U5v4W3x2Y1z0a.B9c8D7e6F5g4H3i2J1k0L9m8N7o6P5',
        nombre: 'Karina',
        apellido: 'Silva',
        correo: 'karina@spin.com',
        rol: 'Contador',
        situacion: 'Activo'
      }
    ], { onConflict: 'usuario' })

    if (usuariosError) throw usuariosError
    logs.push('✅ Usuarios insertados/actualizados (5)')

    logs.push('📝 Insertando módulos...')

    // Insertar módulos
    const { error: modulosError } = await supabase.from('modulos_sistema').upsert([
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
    ], { onConflict: 'codigo' })

    if (modulosError) throw modulosError
    logs.push('✅ Módulos insertados/actualizados (12)')

    logs.push('🎉 ¡SISTEMA COMPLETAMENTE CONFIGURADO!')
    logs.push('')
    logs.push('Usuarios disponibles:')
    logs.push('  • jarango (Juan Andres Arango Velasquez) - Admin')
    logs.push('  • contador (Contador Principal) - Contador')
    logs.push('  • contable00 (Karina Silva) - Contador')
    logs.push('  • auxiliar (Auxiliar Contable) - Auxiliar')
    logs.push('  • admin (Administrador Sistema) - Admin')
    logs.push('')
    logs.push('Nota: Las contraseñas están hasheadas con bcrypt.')
    logs.push('Para ver contraseñas en texto plano, revisa el endpoint /api/insert-data')

    return NextResponse.json({
      success: true,
      message: '✅ ¡LISTO! Sistema completamente configurado',
      logs
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    logs.push(`❌ Error: ${errorMsg}`)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        logs,
        hint: 'Las tablas deben existir previamente. Ejecuta supabase/migrations/init_auth_tables.sql en Supabase Dashboard'
      },
      { status: 500 }
    )
  }
}
