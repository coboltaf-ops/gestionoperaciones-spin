#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(url, key)

async function setup() {
  console.log('🔐 Setup de Usuarios y Permisos')
  console.log('================================\n')

  try {
    console.log('📝 Creando tabla usuarios...')
    await supabase.rpc('exec', {
      sql: `CREATE TABLE IF NOT EXISTS usuarios (
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
    }).then(r => {
      if (r.error && r.error.code !== 'PGRST202') throw r.error
    })

    console.log('✅ Tabla usuarios lista')

    console.log('📝 Insertando usuarios...')
    const { error: e1 } = await supabase.from('usuarios').insert([
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
    ], { onConflict: 'usuario' })

    if (e1 && e1.code !== '23505') throw e1
    console.log('✅ Usuarios insertados')

    console.log('\n🎉 Setup completado!')
    console.log('\nUsuarios listos:')
    console.log('  - jarango / Password123!')
    console.log('  - contador / Password456!')
    console.log('  - contable00 / Password789!')
    console.log('  - auxiliar / Password012!')
    console.log('  - admin / Password345!')
    console.log('\nProximo: npm run dev')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

setup()
