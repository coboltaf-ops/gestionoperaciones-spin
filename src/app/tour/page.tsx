'use client'

import { useState } from 'react'
import { SISTEMAS } from './data'
import type { Modulo } from './data'

function ModuloCard({ mod, color, expanded, onClick }: { mod: Modulo; color: string; expanded: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: expanded ? `linear-gradient(135deg, ${color}18, ${color}08)` : 'rgba(255,255,255,0.03)',
        border: expanded ? `1px solid ${color}44` : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{mod.icon}</span>
        <h4 className="text-sm font-bold text-white flex-1">{mod.nombre}</h4>
        <span className="text-white/20 text-xs transition-transform duration-300" style={{ transform: expanded ? 'rotate(180deg)' : '' }}>&#9660;</span>
      </div>
      <p className="text-xs text-white/40 leading-relaxed">{mod.descripcion}</p>
      {expanded && (
        <ul className="mt-3 space-y-1.5">
          {mod.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span className="shrink-0 mt-0.5" style={{ color }}>&#10003;</span>
              <span className="text-white/60">{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function TourPage() {
  const [sistemaActivo, setSistemaActivo] = useState<string | null>(null)
  const [moduloExpandido, setModuloExpandido] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)

  const totalModulos = SISTEMAS.reduce((sum, s) => sum + s.modulos.length, 0)

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0c1a3d 40%, #111827 100%)' }}>
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(circle at 20% 30%, #3b82f6 0%, transparent 40%), radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 40%), radial-gradient(circle at 50% 50%, #10b981 0%, transparent 50%)' }} />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', border: '2px solid rgba(255,255,255,0.2)' }}>
              S
            </div>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#60a5fa' }}>SisTech</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Ecosistema de{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Software Empresarial
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-10">
            {SISTEMAS.length} sistemas completos, {totalModulos} modulos, disenados para que tu operacion funcione sin fricciones.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              { label: 'Sistemas', value: String(SISTEMAS.length), icon: '🧩' },
              { label: 'Modulos', value: String(totalModulos), icon: '📋' },
              { label: 'Exportaciones', value: 'PDF / Excel / Print', icon: '📄' },
              { label: 'Asistente IA', value: 'Con Voz', icon: '🤖' },
              { label: 'Permisos', value: 'Por Modulo', icon: '🔐' },
            ].map(s => (
              <div key={s.label} className="px-5 py-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-base font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/35 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Navegacion sticky */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl py-3 px-6" style={{ background: 'rgba(10,14,26,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSistemaActivo(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={!sistemaActivo
              ? { background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }
              : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }
            }
          >
            Todos ({SISTEMAS.length})
          </button>
          {SISTEMAS.map(s => (
            <button
              key={s.id}
              onClick={() => setSistemaActivo(sistemaActivo === s.id ? null : s.id)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={sistemaActivo === s.id
                ? { background: `${s.color}25`, color: s.color, border: `1px solid ${s.color}55` }
                : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {s.icon} {s.nombre}
            </button>
          ))}
        </div>
      </nav>

      {/* Sistemas */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {SISTEMAS
          .filter(s => !sistemaActivo || s.id === sistemaActivo)
          .map(sistema => (
          <section key={sistema.id}>
            <div className="rounded-2xl p-6 md:p-8 mb-6" style={{ background: `${sistema.color}08`, border: `1px solid ${sistema.color}22` }}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: sistema.gradient, boxShadow: `0 8px 24px ${sistema.color}30` }}>
                  {sistema.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-black text-white">{sistema.nombre}</h2>
                  <p className="text-sm font-medium mt-1" style={{ color: sistema.color }}>{sistema.subtitulo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: `${sistema.color}20`, color: sistema.color }}>
                    {sistema.modulos.length} modulos
                  </span>
                  <button
                    onClick={() => setExpandAll(!expandAll)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {expandAll ? 'Colapsar' : 'Expandir'} todo
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-4xl">{sistema.descripcion}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {sistema.highlights.map(h => (
                  <span key={h} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: `${sistema.color}15`, color: sistema.color, border: `1px solid ${sistema.color}25` }}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sistema.modulos.map(mod => {
                const key = `${sistema.id}-${mod.nombre}`
                const isExpanded = expandAll || moduloExpandido === key
                return (
                  <ModuloCard
                    key={key}
                    mod={mod}
                    color={sistema.color}
                    expanded={isExpanded}
                    onClick={() => setModuloExpandido(isExpanded ? null : key)}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Capacidades transversales */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">Capacidades Transversales</h2>
        <p className="text-center text-white/35 mb-8 text-sm">Presentes en todos los sistemas</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '📄', title: 'PDF Profesional', desc: 'Documentos con logo, membrete y firmas' },
            { icon: '📊', title: 'Reportes Excel', desc: 'Exportacion con filtros y totales' },
            { icon: '🖨️', title: 'Impresion', desc: 'Vista optimizada para impresora' },
            { icon: '🔐', title: 'Permisos', desc: 'Leer, Registrar, Editar, Eliminar por modulo' },
            { icon: '📧', title: 'Email Integrado', desc: 'Envio de documentos con rastreo' },
            { icon: '🎤', title: 'Busqueda por Voz', desc: 'Reconocimiento de voz en espanol' },
            { icon: '🤖', title: 'Agente IA', desc: 'Consultas inteligentes por voz y texto' },
            { icon: '🗂️', title: 'Modulos On/Off', desc: 'El admin activa solo lo que necesita' },
          ].map(cap => (
            <div key={cap.title} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl mb-2">{cap.icon}</div>
              <h4 className="text-xs font-bold text-white mb-1">{cap.title}</h4>
              <p className="text-xs text-white/35 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Códigos de Barras y QR */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #92400e, #f59e0b)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
                📊
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Codigos de Barras & QR</h2>
                <p className="text-sm font-medium" style={{ color: '#f59e0b' }}>Sistema de Calzado & Ropa — Etiquetas profesionales para cada variante</p>
              </div>
            </div>

            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-4xl">
              Cada producto en el sistema de Calzado & Ropa genera variantes por combinacion de color y talla.
              Cada variante tiene un SKU unico y puede imprimir etiquetas con codigo de barras CODE128,
              codigo QR, o ambos. Las etiquetas incluyen toda la informacion del producto y estan optimizadas
              para impresoras termicas y hojas de etiquetas.
            </p>

            {/* Dos etiquetas: Código de Barras y QR — réplica fiel del sistema */}
            <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: '#f59e0b' }}>Asi se ven las etiquetas generadas por el sistema</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

              {/* ── ETIQUETA 1: Código de Barras ──────────────────── */}
              <div>
                <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ccc', maxWidth: '320px', margin: '0 auto' }}>
                  {/* Header marca */}
                  <div className="text-center py-3" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                    <p className="text-white font-black text-base uppercase tracking-widest">Nike</p>
                  </div>
                  {/* Descripción */}
                  <p className="text-center text-sm font-semibold py-2" style={{ color: '#1e293b' }}>Tenis Air Max Classic</p>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 mx-3 rounded-md overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="px-2 py-1.5" style={{ borderBottom: '1px solid #f0f0f0', borderRight: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Modelo</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Air Max</p>
                    </div>
                    <div className="px-2 py-1.5" style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Tipo</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Hombre</p>
                    </div>
                    <div className="px-2 py-1.5" style={{ borderRight: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Color</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Blanco</p>
                    </div>
                    <div className="px-2 py-1.5">
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Talla</p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>38</p>
                    </div>
                  </div>
                  {/* Código de barras */}
                  <div className="flex justify-center pt-3 pb-1" style={{ borderTop: '1px dashed #d1d5db', marginTop: '8px' }}>
                    <svg viewBox="0 0 200 44" width="200" height="44" xmlns="http://www.w3.org/2000/svg">
                      {/* Simulación CODE128 para PRD-00001-BLA-38 */}
                      {[0,3,5,6,9,10,13,14,16,19,20,22,24,25,28,30,31,34,36,38,40,42,44,46,47,50,52,53,56,58,60,62,63,66,68,70,72,74,76,78,80,82,84,85,88,90,92,93,96,98,100,102,103,106,108,110,112,114,115,118,120,122,124,125,128,130,132,134,136,138,140,142,143,146,148,150,152,154,155,158,160,162,164,166,168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,198].map(x => (
                        <rect key={x} x={x} y="0" width={x % 7 === 0 ? 2 : 1.4} height="40" fill="#1a1a1a" />
                      ))}
                    </svg>
                  </div>
                  {/* SKU */}
                  <p className="text-center pb-1" style={{ fontFamily: 'Courier New, monospace', fontSize: '11px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '1.2px' }}>PRD-00001</p>
                  {/* Precio */}
                  <div className="mx-3 mb-3 py-1.5 text-center" style={{ borderTop: '2px solid #1e3a8a' }}>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a' }}>$ 189,900.00</p>
                  </div>
                </div>
                <p className="text-center text-xs text-white/50 mt-3 font-medium">Etiqueta con Codigo de Barras (CODE128)</p>
                <p className="text-center text-xs text-white/30 mt-0.5">Escaneable con cualquier lector de codigos</p>
              </div>

              {/* ── ETIQUETA 2: Código QR ─────────────────────────── */}
              <div>
                <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ccc', maxWidth: '320px', margin: '0 auto' }}>
                  {/* Header marca */}
                  <div className="text-center py-3" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                    <p className="text-white font-black text-base uppercase tracking-widest">Adidas</p>
                  </div>
                  {/* Descripción */}
                  <p className="text-center text-sm font-semibold py-2" style={{ color: '#1e293b' }}>Zapatilla Ultraboost</p>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 mx-3 rounded-md overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="px-2 py-1.5" style={{ borderBottom: '1px solid #f0f0f0', borderRight: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Modelo</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Ultraboost</p>
                    </div>
                    <div className="px-2 py-1.5" style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Tipo</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Mujer</p>
                    </div>
                    <div className="px-2 py-1.5" style={{ borderRight: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Color</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Negro</p>
                    </div>
                    <div className="px-2 py-1.5">
                      <p style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Talla</p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>36</p>
                    </div>
                  </div>
                  {/* Código QR */}
                  <div className="flex justify-center pt-3 pb-1" style={{ borderTop: '1px dashed #d1d5db', marginTop: '8px' }}>
                    <svg viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                      {/* Patrón QR simulado con los 3 marcadores de posición */}
                      {/* Marcador superior-izquierdo */}
                      <rect x="4" y="4" width="28" height="28" fill="#1a1a1a" /><rect x="8" y="8" width="20" height="20" fill="#fff" /><rect x="12" y="12" width="12" height="12" fill="#1a1a1a" />
                      {/* Marcador superior-derecho */}
                      <rect x="88" y="4" width="28" height="28" fill="#1a1a1a" /><rect x="92" y="8" width="20" height="20" fill="#fff" /><rect x="96" y="12" width="12" height="12" fill="#1a1a1a" />
                      {/* Marcador inferior-izquierdo */}
                      <rect x="4" y="88" width="28" height="28" fill="#1a1a1a" /><rect x="8" y="92" width="20" height="20" fill="#fff" /><rect x="12" y="96" width="12" height="12" fill="#1a1a1a" />
                      {/* Datos simulados */}
                      {[
                        [36,4],[40,4],[48,8],[52,4],[56,8],[60,4],[64,8],[68,12],[72,4],[76,8],[80,4],
                        [36,12],[44,16],[52,12],[60,16],[68,8],[76,12],[80,16],
                        [4,36],[8,40],[12,36],[16,44],[20,40],[24,36],[28,44],
                        [36,36],[40,40],[44,36],[48,44],[52,40],[56,36],[60,44],[64,40],[68,36],[72,40],[76,44],[80,36],
                        [88,40],[92,44],[96,40],[100,36],[104,44],[108,40],[112,36],
                        [36,48],[44,52],[52,48],[60,52],[68,48],[76,52],[80,48],
                        [4,52],[12,56],[20,52],[28,56],
                        [88,52],[96,56],[104,52],[112,56],
                        [36,60],[40,64],[48,60],[56,64],[64,60],[72,64],[80,60],
                        [4,64],[12,68],[20,64],[28,68],
                        [88,64],[96,68],[104,64],[112,68],
                        [36,72],[44,76],[52,72],[60,76],[68,72],[76,76],[80,72],
                        [4,76],[12,80],[20,76],[28,80],
                        [88,76],[96,80],[104,76],[112,80],
                        [36,84],[40,88],[48,84],[56,88],[64,84],[72,88],[80,84],
                        [88,88],[92,92],[96,88],[100,92],[104,88],[108,92],[112,88],
                        [36,96],[44,100],[52,96],[60,100],[68,96],[76,100],[80,96],
                        [36,108],[44,112],[52,108],[60,112],[68,108],[76,112],[80,108],
                        [88,100],[96,104],[104,100],[112,104],
                        [88,112],[100,108],[108,112],
                      ].map(([x, y], i) => (
                        <rect key={i} x={x} y={y} width="4" height="4" fill="#1a1a1a" />
                      ))}
                    </svg>
                  </div>
                  {/* SKU */}
                  <p className="text-center pb-1" style={{ fontFamily: 'Courier New, monospace', fontSize: '11px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '1.2px' }}>PRD-00002</p>
                  {/* Precio */}
                  <div className="mx-3 mb-3 py-1.5 text-center" style={{ borderTop: '2px solid #1e3a8a' }}>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a' }}>$ 245,000.00</p>
                  </div>
                </div>
                <p className="text-center text-xs text-white/50 mt-3 font-medium">Etiqueta con Codigo QR</p>
                <p className="text-center text-xs text-white/30 mt-0.5">Datos: SKU | Marca | Descripcion | Color | Talla</p>
              </div>
            </div>

            {/* Info técnica compacta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 className="text-sm font-bold text-white mb-2">Codigo de Barras — CODE128</h4>
                <ul className="space-y-1.5">
                  {['Formato CODE128: estandar universal para retail', 'Codifica el SKU completo de la variante', 'Ancho de barra: 1.6px — Altura: 40px', 'Compatible con cualquier lector de codigos', 'Sin texto debajo (el SKU se muestra aparte)'].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs"><span className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }}>&#10003;</span><span className="text-white/60">{f}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 className="text-sm font-bold text-white mb-2">Codigo QR — Datos Enriquecidos</h4>
                <ul className="space-y-1.5">
                  {['Codifica: SKU|Marca|Descripcion|Color|Talla', 'Ejemplo: PRD-00002|Adidas|Ultraboost|Negro|T36', 'Correccion de error nivel M (Medium)', 'Celda 4px con margen de 2 celdas', 'Escaneable con la camara de cualquier celular'].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs"><span className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }}>&#10003;</span><span className="text-white/60">{f}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Funcionalidades de impresión */}
            <h3 className="text-lg font-bold text-white mb-4">Funcionalidades de Impresion</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl mb-2">🏷️</div>
                <h4 className="text-sm font-bold text-white mb-1">Etiqueta Individual</h4>
                <p className="text-xs text-white/40">Un clic en cualquier variante genera e imprime su etiqueta con codigo de barras, QR o ambos.</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl mb-2">📋</div>
                <h4 className="text-sm font-bold text-white mb-1">Impresion Masiva</h4>
                <p className="text-xs text-white/40">Panel de emision con 5 filtros: Tipo, Categoria, Marca, Color, Talla. Genera grid de etiquetas para todas las variantes filtradas.</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl mb-2">🔄</div>
                <h4 className="text-sm font-bold text-white mb-1">3 Tipos de Codigo</h4>
                <p className="text-xs text-white/40">Selecciona entre solo Codigo de Barras, solo QR, o Ambos. Compatible con impresoras termicas y hojas de etiquetas.</p>
              </div>
            </div>

            {/* SKU Format */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <h4 className="text-sm font-bold text-white mb-2">Formato de SKU Automatico</h4>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg font-mono font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: '#f59e0b' }}>PRD-00001</span>
                <span className="text-white/30">+</span>
                <span className="px-3 py-1.5 rounded-lg font-mono font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: '#60a5fa' }}>BLA</span>
                <span className="text-white/30">+</span>
                <span className="px-3 py-1.5 rounded-lg font-mono font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: '#34d399' }}>38</span>
                <span className="text-white/30">=</span>
                <span className="px-4 py-1.5 rounded-lg font-mono font-bold text-sm" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>PRD-00001-BLA-38</span>
              </div>
              <p className="text-xs text-white/35 mt-2">Codigo del producto + Codigo de color (3 letras) + Talla = SKU unico por variante</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-2xl mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', border: '2px solid rgba(255,255,255,0.2)' }}>
            S
          </div>
          <p className="text-white font-bold text-lg mb-1">SisTech</p>
          <p className="text-white text-sm mb-6">Ecosistema de Software Empresarial</p>
          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p className="text-white text-sm leading-relaxed mb-3">
              Este ecosistema, es producto de los a&#241;os de experiencia en el <span className="font-bold text-blue-400">An&#225;lisis y Dise&#241;o de Sistemas de Informaci&#243;n</span>, experiencia en el &#225;rea de <span className="font-bold text-blue-400">Mercadeo, Ventas y Servicio al Cliente</span> y en varios procesos de la <span className="font-bold text-blue-400">Gesti&#243;n Administrativa y Operativa</span> de las Empresas.
            </p>
            <p className="text-white text-sm leading-relaxed mb-3">
              Todo lo que se aprecia fu&#233; elaborado en compa&#241;&#237;a de la <span className="font-bold text-blue-400">Inteligencia Artificial</span> y herramientas profesionales que garantizan la estabilidad y buenos resultados de los Aplicativos.
            </p>
            <p className="text-white font-bold text-base" style={{ color: '#60a5fa' }}>
              Esto es solo el inicio.
            </p>
          </div>
          <p className="text-white/60 text-xs">{SISTEMAS.length} sistemas &middot; {totalModulos} modulos &middot; Powered by SisTech</p>
        </div>
      </footer>
    </div>
  )
}
