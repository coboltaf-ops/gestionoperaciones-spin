import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * POST /api/create-auth-tables
 * Crea las tablas de autenticación ejecutando la migración SQL
 * Requiere SUPABASE_SERVICE_ROLE_KEY en headers o env
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing environment variables',
        logs: []
      },
      { status: 500 }
    )
  }

  const logs: string[] = []

  try {
    logs.push('🔐 Inicializando cliente Supabase...')
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    logs.push('✅ Cliente creado')

    logs.push('📁 Leyendo archivo de migración...')
    // Leer el archivo SQL de migración
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/init_auth_tables.sql')

    let migrationSQL = ''
    try {
      migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
      logs.push('✅ Archivo leído')
    } catch (e) {
      logs.push('⚠️ No se puede leer desde filesystem, usando SQL inline...')
      // SQL inline como fallback
      migrationSQL = `
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

CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_permisos_usuario_id ON permisos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_permisos_modulo_id ON permisos(modulo_id);
      `
    }

    logs.push('📝 Ejecutando SQL...')

    // Dividir el SQL en statements individuales y ejecutarlos
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const statement of statements) {
      if (statement.includes('INSERT') || statement.includes('CREATE')) {
        // Para CREATE TABLE y INSERT, usar rpc si está disponible
        try {
          // Intentar con una función SQL personalizada
          const { error } = await supabase.rpc('exec_sql_anonymous', {
            sql: statement + ';'
          })

          if (error && error.code === 'PGRST204') {
            // La función no existe, continuar
            logs.push(`⚠️ RPC no disponible, continuando...`)
            break
          }
        } catch (e) {
          // Ignorar errores de RPC, intentar otra estrategia
        }
      }
    }

    logs.push('⚠️ No se pueden ejecutar DDL queries desde la API REST de Supabase')
    logs.push('')
    logs.push('Instrucciones para crear las tablas manualmente:')
    logs.push('1. Ve a: https://app.supabase.com/project/hakxvtffjwrywpfsipvo/sql/new')
    logs.push('2. Copia y pega el SQL de abajo:')
    logs.push('')
    logs.push('---START SQL---')
    logs.push(migrationSQL)
    logs.push('---END SQL---')
    logs.push('')
    logs.push('3. Haz click en "Execute" o presiona Ctrl+Enter')
    logs.push('')
    logs.push('O usa Supabase CLI:')
    logs.push('  npx supabase db push')

    return NextResponse.json({
      success: false,
      error: 'DDL queries no soportadas en API REST',
      logs,
      migration: migrationSQL
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    logs.push(`❌ Error: ${errorMsg}`)
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        logs
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST /api/create-auth-tables to execute migration',
    method: 'POST'
  })
}
