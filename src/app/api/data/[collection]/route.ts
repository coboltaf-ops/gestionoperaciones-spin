import { NextRequest, NextResponse } from 'next/server'
import { readCollection, writeCollection, readJson, writeJson } from '@/lib/db'

const ALLOWED = [
  'productos', 'proveedores', 'bodegas', 'centros-costo',
  'ordenes-compra', 'correos-enviados', 'usuarios', 'referencias',
  'recepcion-facturas', 'recepcion-remisiones', 'transferencias', 'ajustes-inventario', 'carga-inicial',
  'modulos-sistema', 'personal-empresa', 'tareas', 'pedidos',
  'pagos-proveedores', 'datos-empresa', 'control-bancario',
]

type RouteContext = { params: Promise<{ collection: string }> }
type UsuarioRecord = { id: string; usuario: string; clave?: string; [k: string]: unknown }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { collection } = await ctx.params
  if (!ALLOWED.includes(collection)) {
    return NextResponse.json({ error: 'Colección no permitida' }, { status: 400 })
  }
  if (collection === 'referencias' || collection === 'pagos-proveedores' || collection === 'control-bancario') {
    const data = await readJson(collection, {})
    return NextResponse.json(data)
  }
  const data = await readCollection(collection)
  if (collection === 'usuarios' && Array.isArray(data)) {
    const sanitized = (data as UsuarioRecord[]).map(u => {
      const { clave: _omit, ...rest } = u
      void _omit
      return rest
    })
    return NextResponse.json(sanitized)
  }
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { collection } = await ctx.params
  if (!ALLOWED.includes(collection)) {
    return NextResponse.json({ error: 'Colección no permitida' }, { status: 400 })
  }
  const text = await req.text()
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  try {
    if (collection === 'referencias' || collection === 'pagos-proveedores' || collection === 'control-bancario') {
      await writeJson(collection, body)
    } else if (collection === 'usuarios' && Array.isArray(body)) {
      const existing = await readCollection<UsuarioRecord>('usuarios', [])
      const existingById = new Map(existing.map(u => [u.id, u]))
      const merged = (body as UsuarioRecord[]).map(u => {
        const existingClave = existingById.get(u.id)?.clave
        const newClave = (u.clave || '').toString().trim()
        if (newClave) return { ...u, clave: newClave }
        return { ...u, clave: existingClave || '' }
      })
      await writeCollection(collection, merged)
    } else {
      await writeCollection(collection, body as unknown[])
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`PUT ${collection} error:`, msg)
    return NextResponse.json({ error: 'Error guardando datos', message: msg }, { status: 500 })
  }
}
