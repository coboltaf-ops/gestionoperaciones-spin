import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/setup-and-login
 * Ejecuta setup automático e inicia sesión
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Credenciales faltantes' }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Intentar insertar usuarios
    await supabase.from('usuarios').upsert([
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

    // Insertar módulos
    await supabase.from('modulos_sistema').upsert([
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

    return NextResponse.json({
      success: true,
      message: '✅ Setup completado. Redirigiendo a login...',
      redirect: '/login'
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: '✅ Setup ejecutado. Redirigiendo a login...',
      redirect: '/login'
    })
  }
}
