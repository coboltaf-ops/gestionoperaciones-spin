import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/check-db
 * Verifica si las tablas existen en Supabase
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ tablesExist: false, error: 'Credenciales faltantes' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Intentar leer de la tabla usuarios
    const { error } = await supabase.from('usuarios').select('count')

    if (error && error.code === 'PGRST116') {
      // Tabla no existe
      return NextResponse.json({ tablesExist: false })
    }

    // Si no hay error, la tabla existe
    return NextResponse.json({ tablesExist: true })
  } catch (error) {
    return NextResponse.json({ tablesExist: false, error: String(error) })
  }
}
