import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Faltan credenciales de Supabase' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const LOGO_SPIN = 'data:image/png;base64,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'

    const { data, error } = await supabase
      .from('datos_empresa')
      .update({ logo: LOGO_SPIN })
      .eq('id', 1)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Logo actualizado exitosamente',
      data
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
