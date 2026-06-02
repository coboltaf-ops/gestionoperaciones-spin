'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCurrentUserStore } from '@/features/usuarios/store/current-user-store'
import { ServerSyncProvider } from '@/shared/components/server-sync-provider'
import { useModulosSistemaStore } from '@/features/modulos-sistema/store/modulos-sistema-store'
import { MODULOS } from '@/features/usuarios-gestion/types'
import { LanguageSwitcher } from '@/shared/components/language-switcher'
import { useCompanyLogo } from '@/shared/hooks/use-company-logo'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useCurrentUserStore(s => s.user)
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const tApp = useTranslations('app')
  const [configOpen, setConfigOpen] = useState(true)
  const [produccionOpen, setProduccionOpen] = useState(true)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)
  const [fromContable, setFromContable] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const modulosEstado = useModulosSistemaStore(s => s.modulos)
  const initModulos = useModulosSistemaStore(s => s.initModulos)
  const companyLogo = useCompanyLogo()
  const empresaActiva = useEmpresaStore(s => s.empresas[0])

  // Detectar si viene del sistema contable (leer directo de window para evitar prerender issues)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    const ret = params.get('returnUrl')
    if (from === 'contable' && ret) {
      localStorage.setItem('gi-return-url', ret)
      localStorage.setItem('gi-from-contable', '1')
      setReturnUrl(ret)
      setFromContable(true)
    } else {
      const savedRet = localStorage.getItem('gi-return-url')
      const savedFrom = localStorage.getItem('gi-from-contable')
      if (savedRet && savedFrom === '1') {
        setReturnUrl(savedRet)
        setFromContable(true)
      }
    }
  }, [])

  const volverAContable = () => {
    if (returnUrl) {
      localStorage.removeItem('gi-return-url')
      localStorage.removeItem('gi-from-contable')
      window.location.href = returnUrl
    }
  }

  // Inicializar módulos al cargar el layout
  useEffect(() => {
    initModulos(MODULOS.map(m => m.id as string))
  }, [initModulos])

  // Cerrar sidebar cuando navegamos a módulos (no dashboard)
  useEffect(() => {
    if (pathname !== '/dashboard' && pathname !== '/') {
      setSidebarOpen(false)
    }
  }, [pathname])

  const isAdmin = ['admin', 'administrador'].includes(user.rol.toLowerCase())

  const isModuloActivo = (href: string) => {
    const id = href.replace('/', '')
    const estado = modulosEstado.find(m => m.id === id)
    return estado ? estado.activo : true
  }

  const allNavItems = [
    { name: t('dashboard'), href: '/dashboard', icon: '📊' },
    { name: 'Clientes', href: 'https://crmspin.vercel.app', icon: '👥', external: true },
    { name: t('productos'), href: '/productos', icon: '📦' },
    { name: t('kardex'), href: '/kardex', icon: '📒' },
    { name: t('proveedores'), href: '/proveedores', icon: '🏢' },
    { name: t('ordenesCompra'), href: '/ordenes-compra', icon: '🛒' },
    { name: t('pedidos'), href: '/pedidos', icon: '📄' },
    { name: t('recepcionFacturas'), href: '/recepcion-facturas', icon: '📋' },
    { name: t('recepcionRemisiones'), href: '/recepcion-remisiones', icon: '📑' },
    { name: 'Pagos Proveedores', href: '/pagos-proveedores', icon: '💳' },
    { name: 'Control Bancario', href: '/control-bancario', icon: '🏦' },
    { name: t('bodegas'), href: '/bodegas', icon: '🏭' },
    { name: t('transferencias'), href: '/transferencias', icon: '🔄' },
    { name: t('salidasAlmacen'), href: '/salidas-almacen', icon: '📤' },
    { name: t('ajustesInventario'), href: '/ajustes-inventario', icon: '⚖️' },
    { name: t('tomaInventarioFisico'), href: '/toma-inventario-fisico', icon: '📋' },
    { name: t('centrosCosto'), href: '/centros-costo', icon: '💰' },
    { name: t('correosEnviados'), href: '/correos-enviados', icon: '📧' },
    { name: t('tareas'), href: '/tareas', icon: '📝' },
    { name: t('personalEmpresa'), href: '/personal-empresa', icon: '👥' },
    { name: t('referencias'), href: '/referencias', icon: '⚙️' },
    { name: t('asistente'), href: '/asistente', icon: '🤖' },
  ]

  const produccionItems = [
    { name: 'Formulaciones', href: '/produccion/formulaciones', icon: '⚗️' },
    { name: 'Producto Terminado', href: '/produccion/producto-terminado', icon: '✅' },
    { name: 'Órdenes de Producción', href: '/produccion/ordenes-produccion', icon: '📋' },
    { name: 'Ejecución Órdenes de Producción', href: '/produccion/ejecucion-ordenes', icon: '⚙️' },
  ]

  const configItems = isAdmin ? [
    { name: t('datosEmpresa'), href: '/datos-empresa', icon: '🏛️' },
    { name: t('usuarios'), href: '/usuarios', icon: '👤' },
    { name: t('modulosSistema'), href: '/modulos-sistema', icon: '🗂️' },
  ].filter(item => isModuloActivo(item.href)) : []

  const navItems = allNavItems.filter(item => isModuloActivo(item.href))

  return (
    <ServerSyncProvider>
    <div className="flex min-h-screen">
      {/* Sidebar Glassmorphism */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-black/30 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ${!sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        {/* Logo de la empresa (top-left) */}
        <div className="px-6 py-5 shrink-0 flex flex-col items-center gap-2">
          <div className="rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', padding: 6, minHeight: 80 }}>
            <img src={companyLogo} alt="Logo Empresa" style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain' }} />
          </div>
          <p className="text-white font-semibold text-sm tracking-wide text-center">{empresaActiva?.nombre || tApp('brand')}</p>
        </div>

        {/* Nav scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const isExternal = 'external' in item && item.external === true
            const isActive = !isExternal && pathname.startsWith(item.href)
            const className = `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
              isActive
                ? 'text-white bg-white/15 border border-white/10 shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`
            const content = (
              <>
                <span className="text-base">{item.icon}</span>
                <span className="font-medium text-sm flex-1">{item.name}</span>
                {isExternal && <span className="text-xs opacity-50">↗</span>}
              </>
            )
            if (isExternal) {
              // Si es Clientes, agregar returnUrl para volver a gestionoperaciones-spin
              const isClientes = item.name === 'Clientes'
              const handleClientesClick = () => {
                if (isClientes && typeof window !== 'undefined') {
                  const currentUrl = window.location.href
                  const crmUrl = `https://crmspin.vercel.app/clientes?returnUrl=${encodeURIComponent(currentUrl)}&isExternal=1`
                  window.open(crmUrl, '_blank')
                }
              }

              return (
                <button
                  key={item.href}
                  onClick={isClientes ? handleClientesClick : () => window.open(item.href, '_blank')}
                  className={className}
                  type="button"
                >
                  {content}
                </button>
              )
            }
            return (
              <Link key={item.href} href={item.href} className={className}>
                {content}
              </Link>
            )
          })}

          {/* Producción (colapsable) */}
          <div className="mt-2">
            <button
              onClick={() => setProduccionOpen(!produccionOpen)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                produccionOpen || produccionItems.some(h => pathname.startsWith(h.href))
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">🏭</span>
              <span className="font-medium text-sm flex-1 text-left">Producción</span>
              <span className={`text-xs transition-transform duration-200 ${produccionOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {produccionOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                {produccionItems.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'text-white bg-white/15 border border-white/10'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="font-medium text-xs">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Configuración (colapsable, solo admin) */}
          {configItems.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setConfigOpen(!configOpen)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  configOpen || ['/datos-empresa', '/usuarios', '/modulos-sistema'].some(h => pathname.startsWith(h))
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">⚙️</span>
                <span className="font-medium text-sm flex-1 text-left">{t('configuracion')}</span>
                <span className={`text-xs transition-transform duration-200 ${configOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {configOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {configItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'text-white bg-white/15 border border-white/10'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-medium text-xs">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-0'} flex-1 flex flex-col min-h-screen transition-all duration-300`}>
        {/* Topbar — espacio reservado para gráficos resumen de operaciones */}
        <header className="px-8 py-3 shrink-0 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all text-white"
              title="Toggle menu"
            >
              <span className="text-xl">☰</span>
            </button>
            {fromContable && returnUrl && (
              <button
                onClick={volverAContable}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-2"
                style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.5)' }}
                title={tCommon('backToAccounting')}
              >
                <span>←</span> {tCommon('backToAccounting')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.nombre} {user.apellido}</p>
              <p className="text-xs text-white font-bold">{user.rol}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'rgba(96,165,250,0.3)', border: '1px solid rgba(96,165,250,0.4)' }}>
              {user.nombre.charAt(0)}{user.apellido.charAt(0)}
            </div>
            <button
              onClick={() => {
                if (pathname === '/dashboard') {
                  useCurrentUserStore.getState().logout()
                  // Si viene del Contable, redirigir a returnUrl en lugar de al login
                  if (fromContable && returnUrl) {
                    localStorage.removeItem('gi-return-url')
                    localStorage.removeItem('gi-from-contable')
                    window.location.href = returnUrl
                  } else {
                    router.push('/login')
                  }
                } else {
                  router.push('/dashboard')
                }
              }}
              className="ml-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'rgba(239, 68, 68, 1)', border: '1px solid rgba(239, 68, 68, 0.8)' }}
            >
              {tCommon('logout')}
            </button>
          </div>
        </header>
        {empresaActiva?.nombre && (
          <div className="px-4 md:px-6 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(90deg, rgba(30,58,138,0.4), rgba(96,165,250,0.15))', borderBottom: '1px solid rgba(96,165,250,0.3)' }}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0" style={{ padding: 4 }}>
              <img src={companyLogo} alt="Logo" style={{ maxHeight: 30, maxWidth: 30, objectFit: 'contain' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'rgba(147,197,253,0.9)' }}>Empresa</p>
              <p className="text-base font-black text-white truncate" title={empresaActiva.nombre}>{empresaActiva.nombre}</p>
            </div>
            {empresaActiva.nro_documento && (
              <div className="hidden md:block text-right">
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'rgba(147,197,253,0.9)' }}>{empresaActiva.tipo_identificacion || 'NIT'}</p>
                <p className="text-sm font-bold text-white font-mono">{empresaActiva.nro_documento}</p>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 px-4 py-6 md:px-6 overflow-x-hidden min-w-0">
          {children}
        </div>
      </main>
    </div>
    </ServerSyncProvider>
  )
}
