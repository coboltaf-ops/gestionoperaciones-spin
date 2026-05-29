import { NextRequest, NextResponse } from 'next/server'
import { readCollection } from '@/lib/db'

type Usuario = {
  id: string
  usuario: string
  clave: string
  nombre: string
  apellido: string
  rol: string
  correo: string
  situacion: string
  permisos?: unknown[]
}

/**
 * POST /api/auth/login
 * Body: { usuario: string, clave: string }
 * Valida server-side. Nunca expone claves al cliente.
 * Devuelve los datos del usuario SIN la clave.
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

  const usuarios = await readCollection<Usuario>('usuarios', [])
  const found = usuarios.find(u => u.usuario.toLowerCase() === usuarioInput && u.clave === claveInput)

  if (!found) {
    return NextResponse.json({ ok: false, error: 'Credenciales inválidas' }, { status: 401 })
  }

  if (found.situacion !== 'Activo') {
    return NextResponse.json({ ok: false, error: `Usuario ${found.situacion.toLowerCase()}` }, { status: 403 })
  }

  // Devolver sin la clave
  const { clave: _claveOmit, ...userSafe } = found
  void _claveOmit
  return NextResponse.json({ ok: true, user: userSafe })
}
