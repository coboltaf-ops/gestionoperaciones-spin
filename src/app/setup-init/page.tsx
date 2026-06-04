'use client'

import { useEffect, useState } from 'react'

export default function SetupInit() {
  const [step, setStep] = useState<'loading' | 'sql-needed' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    runSetup()
  }, [])

  async function runSetup() {
    try {
      setLogs(prev => [...prev, '🔄 Iniciando setup...'])

      const res = await fetch('/api/setup-complete')
      const data = await res.json()

      if (res.ok && data.success) {
        setLogs(prev => [...prev, ...data.log, '✅ Setup completado!'])
        setStep('success')
        setMessage('¡Sistema listo!')
      } else if (res.status === 400 && data.error === 'Tablas no existen') {
        setStep('sql-needed')
        setMessage('Necesitamos ejecutar el SQL primero en Supabase')
        setLogs(prev => [...prev, '⚠️ Las tablas no existen en Supabase'])
      } else {
        setStep('error')
        setMessage(data.error || 'Error en el setup')
        setLogs(prev => [...prev, ...(data.log || []), `❌ Error: ${data.error}`])
      }
    } catch (error) {
      setStep('error')
      setMessage('No se pudo conectar al servidor')
      setLogs(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : String(error)}`])
    }
  }

  function executeSql() {
    window.open('https://supabase.com/dashboard/project/hakxvtffjwrywpfsipvo/sql/new', '_blank')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        width: '100%',
        padding: '40px',
        textAlign: 'center'
      }}>
        {step === 'loading' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
            <h1 style={{ marginBottom: '20px' }}>Configurando sistema...</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>Iniciando usuarios y permisos</p>
          </>
        )}

        {step === 'sql-needed' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ marginBottom: '20px' }}>Necesitamos ejecutar el SQL primero</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Haz click en el botón para ejecutar el SQL en Supabase
            </p>
            <button
              onClick={executeSql}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              🚀 Abrir SQL Editor
            </button>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
              Luego vuelve aquí y recarga la página (F5)
            </p>
            <button
              onClick={() => location.reload()}
              style={{
                background: '#e0e7ff',
                color: '#667eea',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ↻ Recargar página
            </button>
          </>
        )}

        {step === 'success' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ marginBottom: '10px', color: '#22c55e' }}>¡Sistema listo!</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Todos los usuarios y permisos han sido configurados
            </p>
            <div style={{
              background: '#f8f9ff',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>Usuarios listos:</p>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>
                <div>jarango / Password123! <strong style={{ color: '#667eea' }}>(Admin)</strong></div>
                <div>contador / Password456!</div>
                <div>contable00 / Password789!</div>
                <div>auxiliar / Password012!</div>
                <div>admin / Password345!</div>
              </div>
            </div>
            <a
              href="/"
              style={{
                background: '#667eea',
                color: 'white',
                padding: '12px 30px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Ir al Dashboard
            </a>
          </>
        )}

        {step === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h1 style={{ marginBottom: '20px' }}>Error en la configuración</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
            <button
              onClick={() => location.reload()}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ↻ Intentar de nuevo
            </button>
          </>
        )}

        {logs.length > 0 && (
          <div style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '15px',
            borderRadius: '6px',
            marginTop: '30px',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
