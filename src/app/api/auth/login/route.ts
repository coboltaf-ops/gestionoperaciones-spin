import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

type Usuario = {
  id: string
  usuario: string
  nombre: string
  apellido: string
  rol: string
  correo: string
  situacion: string
}

/**
 * POST /api/auth/login
 * Lee usuarios de Supabase (con permisos)
 * Valida con bcrypt, nunca expone claves
 */
export async function POST(req: NextRequest) {
  let body: { usuario?: string; clave?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 })
  }

  const usuarioInput = (body.usuario || '').trim().toLowerCase()
  const claveInput = body.clave || ''

  if (!usuarioInput || !claveInput) {
    return NextResponse.json({ ok: false, error: 'Usuario y clave requeridos' }, { status: 400 })
  }

  try {
    // Buscar usuario en Supabase
    const { data: usuarios, error: queryError } = await supabase
      .from('usuarios')
      .select('id, usuario, clave, nombre, apellido, rol, correo, situacion')
      .eq('usuario', usuarioInput)
      .limit(1)

    if (queryError) throw queryError
    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ ok: false, error: 'Credenciales inválidas' }, { status: 401 })
    }

    const found = usuarios[0] as any

    // Validar clave con bcrypt
    const claveValida = await bcrypt.compare(claveInput, found.clave)
    if (!claveValida) {
      return NextResponse.json({ ok: false, error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (found.situacion !== 'Activo') {
      return NextResponse.json({ ok: false, error: `Usuario ${found.situacion.toLowerCase()}` }, { status: 403 })
    }

    // Obtener permisos del usuario
    const { data: permisos } = await supabase
      .from('permisos')
      .select('modulo_id, leer, crear, editar, eliminar')
      .eq('usuario_id', found.id)

    // Devolver sin la clave
    const userSafe: Usuario & { permisos?: any } = {
      id: found.id,
      usuario: found.usuario,
      nombre: found.nombre,
      apellido: found.apellido,
      rol: found.rol,
      correo: found.correo,
      situacion: found.situacion,
      permisos: permisos || []
    }

    return NextResponse.json({ ok: true, user: userSafe })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ ok: false, error: 'Error en la autenticación' }, { status: 500 })
  }
}
