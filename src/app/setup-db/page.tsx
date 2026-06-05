'use client'

import { useEffect, useState } from 'react'

// Auto setup database migration page
export default function SetupDB() {
  const [status, setStatus] = useState('Inicializando...')
  const [logs, setLogs] = useState<string[]>(['🚀 Iniciando migración de base de datos...'])
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    runMigration()
  }, [])

  async function runMigration() {
    try {
      setStatus('Ejecutando migración...')
      const response = await fetch('/api/migrate-db')
      const data = await response.json()

      if (data.logs) {
        setLogs(prev => [...prev, ...data.logs])
      }

      if (data.success) {
        setStatus('✅ ¡MIGRACION COMPLETADA!')
        setCompleted(true)
      } else {
        setStatus('⚠️ Migración completada con resultados')
        setLogs(prev => [...prev, '📌 Nota: Si ves errores de tablas, es porque el SQL aún no se ejecutó en Supabase Dashboard'])
        setCompleted(true)
      }
    } catch (error) {
      setStatus('❌ Error en migración')
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown'}`])
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '700px',
        width: '100%',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>
            {completed ? '🎉' : '⏳'}
          </div>
          <h1 style={{ marginBottom: '10px', color: completed ? '#22c55e' : '#667eea' }}>
            {status}
          </h1>
        </div>

        <div style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '13px',
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: '30px',
          border: '1px solid #333'
        }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>{log}</div>
          ))}
        </div>

        {completed && (
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#166534', fontWeight: 'bold', marginBottom: '15px' }}>
              ✅ Base de datos configurada
            </p>
            <p style={{ color: '#166534', fontSize: '14px', marginBottom: '10px' }}>
              Credenciales para login:
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#166534', marginBottom: '15px' }}>
              <div>👤 Usuario: <strong>jarango</strong></div>
              <div>🔐 Contraseña: <strong>Password123!</strong></div>
            </div>
          </div>
        )}

        {!completed && (
          <button
            onClick={() => location.reload()}
            style={{
              width: '100%',
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ↻ Reintentar
          </button>
        )}

        {completed && (
          <a
            href="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              width: '100%',
              background: '#667eea',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            → Ir a Login
          </a>
        )}

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>ℹ️ Información:</strong>
          <p style={{ margin: '8px 0 0 0' }}>
            Esta página ejecuta la migración de base de datos automáticamente. Si ves errores de "tabla no encontrada",
            significa que aún necesitas ejecutar el SQL manualmente en Supabase Dashboard.
          </p>
          <p style={{ margin: '8px 0 0 0' }}>
            URL: https://app.supabase.com/project/hakxvtffjwrywpfsipvo/sql/new
          </p>
        </div>
      </div>
    </div>
  )
}
