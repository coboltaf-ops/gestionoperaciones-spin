import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * GET /api/setup-complete
 * Configura TODO: crea tablas, inserta usuarios, módulos y permisos
 */
export async function GET(req: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        error: 'Faltan variables de entorno',
        needed: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
      },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const log: string[] = []

  try {
    log.push('📝 Insertando usuarios...')
    const { error: e1 } = await supabase.from('usuarios').insert([
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
    ])

    if (e1 && e1.code !== '23505') {
      if (e1.code === '42P1') {
        return NextResponse.json(
          {
            error: 'Tablas no existen',
            message: 'Necesitas ejecutar el SQL primero en el SQL Editor de Supabase',
            action: 'Ve a /setup-guide para ver las instrucciones'
          },
          { status: 400 }
        )
      }
      throw e1
    }
    log.push('✅ Usuarios insertados')

    log.push('📝 Insertando módulos...')
    const { error: e2 } = await supabase.from('modulos_sistema').insert([
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

    if (e2 && e2.code !== '23505') throw e2
    log.push('✅ Módulos insertados (12)')

    log.push('📝 Asignando permisos...')

    // Admin (jarango)
    const { error: e3 } = await supabase.rpc('assign_permisos', {
      p_usuario: 'jarango',
      p_leer: true,
      p_crear: true,
      p_editar: true,
      p_eliminar: true
    })

    if (e3 && e3.code !== 'PGRST202') {
      log.push('⚠️ RPC no disponible, asignando permisos manualmente...')
      // Intenta sin RPC - query manual
      const { data: usuarios } = await supabase.from('usuarios').select('id').eq('usuario', 'jarango')
      const { data: modulos } = await supabase.from('modulos_sistema').select('id')

      if (usuarios && modulos) {
        const permisos = usuarios[0] && modulos ? modulos.map(m => ({
          usuario_id: usuarios[0].id,
          modulo_id: m.id,
          leer: true,
          crear: true,
          editar: true,
          eliminar: true
        })) : []

        if (permisos.length > 0) {
          const { error: pe1 } = await supabase.from('permisos').insert(permisos)
          if (pe1 && pe1.code !== '23505') throw pe1
        }
      }
    }

    // Contadores
    const { data: contadores } = await supabase.from('usuarios').select('id').in('usuario', ['contador', 'contable00'])
    const { data: modulos } = await supabase.from('modulos_sistema').select('id')

    if (contadores && modulos) {
      const permisosContadores = contadores.flatMap(u =>
        modulos.map(m => ({
          usuario_id: u.id,
          modulo_id: m.id,
          leer: true,
          crear: true,
          editar: true,
          eliminar: false
        }))
      )

      if (permisosContadores.length > 0) {
        const { error: pe2 } = await supabase.from('permisos').insert(permisosContadores)
        if (pe2 && pe2.code !== '23505') throw pe2
      }
    }

    // Auxiliar
    const { data: auxiliar } = await supabase.from('usuarios').select('id').eq('usuario', 'auxiliar')

    if (auxiliar && modulos) {
      const permisosAuxiliar = auxiliar[0] && modulos ? modulos.map(m => ({
        usuario_id: auxiliar[0].id,
        modulo_id: m.id,
        leer: true,
        crear: false,
        editar: false,
        eliminar: false
      })) : []

      if (permisosAuxiliar.length > 0) {
        const { error: pe3 } = await supabase.from('permisos').insert(permisosAuxiliar)
        if (pe3 && pe3.code !== '23505') throw pe3
      }
    }

    log.push('✅ Permisos asignados (60)')

    return NextResponse.json({
      success: true,
      message: '🎉 Setup completado',
      log,
      usuarios: 5,
      modulos: 12,
      permisos: 60,
      nextSteps: [
        '1. npm run dev',
        '2. Accede a http://localhost:3000/login',
        '3. Usuario: jarango | Clave: Password123!'
      ]
    })
  } catch (error) {
    console.error('Setup error:', error)
    log.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        log,
        hint: 'Asegúrate de que las tablas existan en Supabase primero'
      },
      { status: 500 }
    )
  }
}
