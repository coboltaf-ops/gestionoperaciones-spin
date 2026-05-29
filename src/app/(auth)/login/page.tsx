'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { useCurrentUserStore } from '@/features/usuarios/store/current-user-store'
import { LanguageSwitcher } from '@/shared/components/language-switcher'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useCurrentUserStore(s => s.setUser)
  const t = useTranslations('login')

  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ssoMode, setSsoMode] = useState(false)
  const [empresaLogo, setEmpresaLogo] = useState<string | null>(null)
  const [empresaNombre, setEmpresaNombre] = useState<string>('')

  // Cargar logo y nombre de empresa
  useEffect(() => {
    setEmpresaLogo('/spin-logo.png')
    setEmpresaNombre('Spin')
  }, [])

  // Función de login segura — valida server-side, nunca expone claves
  const doLogin = useCallback(async (usr: string, cl: string): Promise<{ ok: boolean; msg?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usr.trim(), clave: cl }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        return { ok: false, msg: data.error || t('errorCredenciales') }
      }
      const u = data.user
      setUser({
        nombre: u.nombre,
        apellido: u.apellido,
        usuario: u.usuario,
        rol: u.rol,
        correo: u.correo,
        permisos: u.permisos || [],
      })
      return { ok: true }
    } catch {
      return { ok: false, msg: t('errorConexion') }
    }
  }, [setUser, t])

  // SSO desde Sistema Contable + limpiar sesión anterior
  useEffect(() => {
    useCurrentUserStore.getState().logout()

    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    const ssoUsuario = params.get('usuario')
    const ssoClave = params.get('clave')
    const returnUrl = params.get('returnUrl')

    if (from === 'contable' && ssoUsuario && ssoClave) {
      // Guardar returnUrl para el botón "Volver" y logout
      if (returnUrl) {
        localStorage.setItem('gi-return-url', returnUrl)
        localStorage.setItem('gi-from-contable', '1')
      }
      setSsoMode(true)
      setUsuario(ssoUsuario)
      setClave(ssoClave)
      setLoading(true)

      // Auto-login
      doLogin(ssoUsuario, ssoClave).then(result => {
        if (result.ok) {
          router.push('/dashboard')
        } else {
          // No autorizado: volver al sistema contable
          setError(t('errorAccesoNoAutorizado'))
          setTimeout(() => {
            if (returnUrl) {
              window.location.href = returnUrl
            } else {
              setLoading(false)
              setSsoMode(false)
            }
          }, 2500)
        }
      })
    }
  }, [doLogin, router, t])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await doLogin(usuario, clave)
    if (result.ok) {
      router.push('/dashboard')
    } else {
      setError(result.msg || t('errorGenerico'))
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #030712 0%, #0c1a3d 35%, #030712 65%, #091428 100%)',
      }}
    >
      <div className="fixed top-20 left-20 w-96 h-96 rounded-full blur-[128px] opacity-30 pointer-events-none" style={{ background: '#60a5fa' }} />
      <div className="fixed top-40 right-32 w-80 h-80 rounded-full blur-[128px] opacity-20 pointer-events-none" style={{ background: '#3b82f6' }} />
      <div className="fixed bottom-20 left-1/2 w-72 h-72 rounded-full blur-[128px] opacity-25 pointer-events-none" style={{ background: '#38bdf8' }} />

      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl p-8 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
        />

        <div className="absolute top-3 right-3 z-10">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-6 flex flex-col items-center">
          {empresaLogo ? (
            <img
              src={empresaLogo}
              alt={empresaNombre || 'Logo Empresa'}
              style={{ maxWidth: 180, maxHeight: 120, margin: '0 auto 12px', display: 'block', objectFit: 'contain' }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', border: '2px solid rgba(255,255,255,0.2)' }}>
              <span className="text-white font-black text-base">INVEN</span>
            </div>
          )}
          {empresaNombre && <h1 className="text-base font-bold tracking-tight mb-1" style={{ color: '#fff' }}>{empresaNombre}</h1>}
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{ssoMode ? t('ssoValidating') : t('subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium text-center"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {ssoMode && !error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium text-center"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
              {t('authenticatingAs')} <b>{usuario}</b>...
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="on" style={{ display: ssoMode ? 'none' : 'block' }}>
          <div>
            <label htmlFor="login-usuario" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('usuario')}
            </label>
            <input
              id="login-usuario"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
              }}
              placeholder="jarango"
            />
          </div>

          <div>
            <label htmlFor="login-clave" className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('clave')}
            </label>
            <input
              id="login-clave"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 mt-2 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.7) 0%, rgba(56,189,248,0.7) 100%)',
              border: '1px solid rgba(96,165,250,0.5)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(96,165,250,0.3)',
            }}
          >
            {loading ? t('loading') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
