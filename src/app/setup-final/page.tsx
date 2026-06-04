'use client'

import { useEffect, useState } from 'react'

export default function SetupFinal() {
  const [status, setStatus] = useState('Iniciando setup automático...')
  const [logs, setLogs] = useState<string[]>(['🚀 Conectando a Supabase...'])
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    runCompleteSetup()
  }, [])

  async function runCompleteSetup() {
    try {
      // Llamar al endpoint que hace todo
      const response = await fetch('/api/setup-complete')
      const data = await response.json()

      if (data.success) {
        setLogs(prev => [...prev, ...data.log, '✅ ¡SISTEMA COMPLETAMENTE CONFIGURADO!'])
        setStatus('✅ ¡TODO LISTO!')
        setCompleted(true)
      } else {
        // Si falla el setup automático, mostrar instrucciones
        setLogs(prev => [...prev, '⚠️ Intentando método alternativo...'])

        // Intentar verificar si al menos las tablas existen
        const checkResponse = await fetch('/api/check-db')
        const checkData = await checkResponse.json()

        if (checkData.tablesExist) {
          setLogs(prev => [...prev, '✅ Tablas encontradas en Supabase'])
          setLogs(prev => [...prev, '📝 Insertando usuarios y módulos...'])

          const insertResponse = await fetch('/api/insert-data')
          const insertData = await insertResponse.json()

          if (insertData.success) {
            setLogs(prev => [...prev, ...insertData.log])
            setStatus('✅ ¡TODO LISTO!')
            setCompleted(true)
          } else {
            throw new Error('No se pudieron insertar los datos')
          }
        } else {
          setLogs(prev => [...prev, '❌ Las tablas NO existen aún'])
          setLogs(prev => [...prev, '📋 El SQL debe ejecutarse en Supabase primero'])
          setStatus('⚠️ Necesitas ejecutar el SQL en Supabase')
        }
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Desconocido'}`])
      setStatus('❌ Error en el setup')
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
        maxWidth: '600px',
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
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '30px'
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
            textAlign: 'center'
          }}>
            <p style={{ color: '#166534', fontWeight: 'bold', marginBottom: '15px' }}>
              ✅ Sistema completamente configurado
            </p>
            <p style={{ color: '#166534', fontSize: '14px', marginBottom: '20px' }}>
              Usuarios listos para usar:
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#166534', textAlign: 'left' }}>
              <div>• jarango / Password123! (Admin)</div>
              <div>• contador / Password456!</div>
              <div>• contable00 / Password789!</div>
              <div>• auxiliar / Password012!</div>
              <div>• admin / Password345!</div>
            </div>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                background: '#667eea',
                color: 'white',
                padding: '12px 30px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Ir a Login
            </a>
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
      </div>
    </div>
  )
}
