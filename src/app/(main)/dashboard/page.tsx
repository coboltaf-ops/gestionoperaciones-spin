'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useProveedoresStore } from '@/features/proveedores/store/proveedores-store'
import { useOrdenesStore } from '@/features/ordenes-compra/store/ordenes-store'
import { usePedidosStore } from '@/features/pedidos/store/pedidos-store'
import { useRecepcionesStore } from '@/features/recepcion-facturas/store/recepciones-store'
import { useBodegasStore } from '@/features/bodegas/store/bodegas-store'
import { useTransferenciasStore } from '@/features/transferencias/store/transferencias-store'
import { useAjustesStore } from '@/features/ajustes-inventario/store/ajustes-store'
import { useTareasStore } from '@/features/tareas/store/tareas-store'
import { useTipoInventarioSesion } from '@/features/contexto-sesion/store/tipo-inventario-store'
import { fmtMoney } from '@/shared/lib/format-number'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const tipoActivo = useTipoInventarioSesion(s => s.tipoActivo)
  const todosProductos = useProductosStore(s => s.productos)
  const proveedores = useProveedoresStore(s => s.proveedores)
  const todasOrdenes = useOrdenesStore(s => s.ordenes)
  const pedidos = usePedidosStore(s => s.pedidos)
  const todasRecepciones = useRecepcionesStore(s => s.recepciones)
  const todasBodegas = useBodegasStore(s => s.bodegas)
  const todasTransferencias = useTransferenciasStore(s => s.transferencias)
  const todosAjustes = useAjustesStore(s => s.ajustes)
  const tareas = useTareasStore(s => s.tareas)

  // Filtrar todo por el Tipo de Inventario activo de la sesión
  const productos = tipoActivo ? todosProductos.filter(p => p.tipo_inventario === tipoActivo) : todosProductos
  const ordenes = tipoActivo ? todasOrdenes.filter(o => o.tipo_inventario === tipoActivo) : todasOrdenes
  const recepciones = tipoActivo ? todasRecepciones.filter(r => (r as unknown as { tipo_inventario?: string }).tipo_inventario === tipoActivo) : todasRecepciones
  const bodegas = tipoActivo ? todasBodegas.filter(b => b.tipo_inventario === tipoActivo) : todasBodegas
  const transferencias = tipoActivo ? todasTransferencias.filter(t => (t as unknown as { tipo_inventario?: string }).tipo_inventario === tipoActivo) : todasTransferencias
  const ajustes = tipoActivo ? todosAjustes.filter(a => (a as unknown as { tipo_inventario?: string }).tipo_inventario === tipoActivo) : todosAjustes

  // KPIs
  const productosActivos = productos.filter(p => p.situacion === 'Activo')
  const proveedoresActivos = proveedores.filter(p => p.situacion === 'Activo')
  const bodegasActivas = bodegas.filter(b => b.situacion === 'Activa')

  const ordenesPendientes = ordenes.filter(o => o.situacion === 'Pendiente')
  const totalInventario = productosActivos.reduce((sum, p) => sum + (p.existencia || 0), 0)
  const valorInventario = productosActivos.reduce((sum, p) => sum + ((p.existencia || 0) * (p.ult_costo || 0)), 0)

  const totalOrdenes = ordenes.reduce((sum, o) => {
    const subtotal = o.detalles.reduce((s, d) => s + (d.cantidad * d.costo_unitario), 0)
    const imp = subtotal * (o.pct_impuesto || 0) / 100
    return sum + subtotal + imp
  }, 0)

  // Productos bajo mínimo
  const productosBajoMinimo = productosActivos.filter(p => p.minimo && (p.existencia || 0) < p.minimo)

  // Tareas por situación (cantidad)
  const estadosTarea: Record<string, number> = {}
  tareas.forEach(t => {
    const s = t.situacion || 'Sin estado'
    estadosTarea[s] = (estadosTarea[s] || 0) + 1
  })

  // Órdenes por estado (cantidad + monto)
  const estadosOrden: Record<string, { count: number; monto: number }> = {}
  ordenes.forEach(o => {
    const subtotal = o.detalles.reduce((s: number, d: { cantidad: number; costo_unitario: number }) => s + d.cantidad * d.costo_unitario, 0)
    const imp = subtotal * (o.pct_impuesto || 0) / 100
    const total = subtotal + imp
    if (!estadosOrden[o.situacion]) estadosOrden[o.situacion] = { count: 0, monto: 0 }
    estadosOrden[o.situacion].count += 1
    estadosOrden[o.situacion].monto += total
  })

  const cards = [
    { label: t('productosActivos'), value: productosActivos.length, icon: '📦', color: '#3b82f6' },
    { label: t('proveedoresActivos'), value: proveedoresActivos.length, icon: '🏢', color: '#8b5cf6' },
    { label: t('ordenesCompra'), value: ordenes.length, icon: '🛒', color: '#f59e0b' },
    { label: t('pedidos'), value: pedidos.length, icon: '📄', color: '#a78bfa' },
    { label: t('recepciones'), value: recepciones.length, icon: '📋', color: '#10b981' },
    { label: t('bodegasActivas'), value: bodegasActivas.length, icon: '🏭', color: '#ec4899' },
    { label: t('transferencias'), value: transferencias.length, icon: '🔄', color: '#06b6d4' },
    { label: t('ajustesInventario'), value: ajustes.length, icon: '⚖️', color: '#f97316' },
    { label: t('ordenesPendientes'), value: ordenesPendientes.length, icon: '⏳', color: '#ef4444' },
  ]

  const bigCards = [
    { label: t('unidadesInventario'), value: fmtMoney(totalInventario), icon: '📊', color: '#3b82f6' },
    { label: t('valorInventario'), value: `${t('pesos')} ${fmtMoney(valorInventario)}`, icon: '💰', color: '#10b981' },
    { label: t('totalOrdenes'), value: `${t('pesos')} ${fmtMoney(totalOrdenes)}`, icon: '🧾', color: '#f59e0b' },
    { label: t('productosBajoMinimo'), value: productosBajoMinimo.length, icon: '⚠️', color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        {tipoActivo && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(96,165,250,0.15)', color: '#fff', border: '1px solid rgba(96,165,250,0.4)' }}>
            <span>📦 Vista filtrada:</span>
            <span className="text-white">{tipoActivo}</span>
          </div>
        )}
      </div>

      {/* Big KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {bigCards.map(c => (
          <div key={c.label} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            </div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Small KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xl">{c.icon}</span>
            <p className="text-xl font-bold text-white mt-2">{c.value}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Productos Bajo Mínimo */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-lg font-semibold text-white mb-4">{t('productosBajoMinimoTitle')}</h2>
          {productosBajoMinimo.length === 0 ? (
            <p className="text-green-400/60 text-sm">{t('todosSobreMinimo')}</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {productosBajoMinimo.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div>
                    <span className="font-mono text-xs text-white/50">{p.codigo}</span>
                    <span className="text-white/80 text-sm ml-2">{p.descripcion}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-red-400 font-bold">{p.existencia || 0}</span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/50">{p.minimo} {t('minimoShort')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agente de Voz */}
      <Link href="/asistente" className="block rounded-2xl p-6 transition-all hover:scale-[1.01] group" style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.4), rgba(59,130,246,0.2))', border: '1px solid rgba(96,165,250,0.3)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: 'rgba(96,165,250,0.95)', border: '1px solid rgba(96,165,250,0.3)' }}>
            🤖
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{t('agenteTitle')}</h2>
            <p className="text-sm text-white/50">{t('agenteDescripcion')}</p>
          </div>
          <div className="text-white/30 group-hover:text-white/60 text-2xl transition-colors">→</div>
        </div>
      </Link>

      {/* Gráfico de barras verticales - Órdenes por Estado */}
      {Object.keys(estadosOrden).length > 0 && (
        <Link href="/ordenes-compra" className="block rounded-2xl p-6 transition-all hover:scale-[1.005] hover:bg-white/[0.07] cursor-pointer group" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">{t('graficoOrdenesTitle')}</h2>
            <span className="text-white/30 group-hover:text-white/70 text-sm transition-colors">{tCommon('goToModule')} →</span>
          </div>
          <p className="text-xs text-white/40 mb-6">{t('graficoOrdenesDescripcion')} · {tCommon('clickForDetail')}</p>

          {(() => {
            // Colores específicos por estado de orden (sincronizados con statusStyle de Ordenes de Compra)
            const ESTADO_COLORES: Record<string, { base: string; dark: string; glow: string }> = {
              'Pendiente':              { base: '#fbbf24', dark: '#d97706', glow: 'rgba(251,191,36,0.5)' },   // Amarillo
              'Pendiente Aprobacion':   { base: '#fbbf24', dark: '#d97706', glow: 'rgba(251,191,36,0.5)' },   // Amarillo
              'Aprobada':               { base: '#60a5fa', dark: '#1e40af', glow: 'rgba(96,165,250,0.5)' },   // Azul claro
              'Pendiente por Recibir':  { base: '#60a5fa', dark: '#1e40af', glow: 'rgba(96,165,250,0.5)' },   // Azul claro
              'Recibida Parcial':       { base: '#ffffff', dark: '#cbd5e1', glow: 'rgba(255,255,255,0.5)' },  // Blanco
              'Recibida':               { base: '#22c55e', dark: '#15803d', glow: 'rgba(34,197,94,0.5)' },    // Verde
              'Recibida Completa':      { base: '#22c55e', dark: '#15803d', glow: 'rgba(34,197,94,0.5)' },    // Verde
              'Anulada':                { base: '#dc2626', dark: '#7f1d1d', glow: 'rgba(220,38,38,0.6)' },    // Rojo
              'Rechazada':              { base: '#dc2626', dark: '#7f1d1d', glow: 'rgba(220,38,38,0.6)' },    // Rojo
            }
            const getColor = (estado: string) =>
              ESTADO_COLORES[estado] || { base: '#94a3b8', dark: '#475569', glow: 'rgba(148,163,184,0.4)' }

            const entries = Object.entries(estadosOrden)
            const maxMonto = Math.max(...entries.map(([, v]) => v.monto), 1)

            return (
              <>
                {/* Leyenda */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-xs">
                  {entries.map(([estado]) => {
                    const c = getColor(estado)
                    return (
                      <div key={estado} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ background: c.base, boxShadow: `0 0 6px ${c.glow}` }} />
                        <span className="text-white/70">{estado}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Gráfico */}
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}>
                  {entries.map(([estado, { count, monto }]) => {
                    const c = getColor(estado)
                    const heightMonto = (monto / maxMonto) * 100

                    return (
                      <div key={estado} className="flex flex-col items-center">
                        {/* Barra Monto unica */}
                        <div className="flex items-end justify-center h-64 w-full">
                          <div className="flex flex-col items-center justify-end h-full" style={{ width: '38%' }}>
                            <span className="text-base font-black mb-2 whitespace-nowrap" style={{ color: c.base }}>
                              ${fmtMoney(monto)} <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>({count})</span>
                            </span>
                            <div
                              className="w-full rounded-t-lg transition-all duration-500"
                              style={{
                                height: `${heightMonto}%`,
                                background: `linear-gradient(180deg, ${c.base}, ${c.dark})`,
                                minHeight: monto > 0 ? '4px' : '0',
                                boxShadow: `0 0 14px ${c.glow}`,
                              }}
                            />
                          </div>
                        </div>
                        {/* Eje X */}
                        <div className="w-full mt-3 pt-2" style={{ borderTop: `2px solid ${c.base}66` }}>
                          <p className="text-sm font-bold text-center" style={{ color: c.base }}>{estado}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}
        </Link>
      )}

      {/* Gráfico Pie - Tareas por Situación */}
      {Object.keys(estadosTarea).length > 0 && (
        <Link href="/tareas" className="block rounded-2xl p-6 transition-all hover:scale-[1.005] hover:bg-white/[0.07] cursor-pointer group" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">{t('graficoTareasTitle')}</h2>
            <span className="text-white/30 group-hover:text-white/70 text-sm transition-colors">{tCommon('goToModule')} →</span>
          </div>
          <p className="text-xs text-white/40 mb-6">{t('graficoTareasDescripcion')} · {tCommon('clickForDetail')}</p>

          {(() => {
            const COLORS: Record<string, string> = {
              'Pendiente': '#f59e0b',
              'En Proceso': '#3b82f6',
              'Completada': '#10b981',
              'Vencida': '#ef4444',
              'Cancelada': '#6b7280',
              'Sin estado': '#94a3b8',
            }
            const entries = Object.entries(estadosTarea)
            const total = entries.reduce((sum, [, c]) => sum + c, 0)

            // Calcular ángulos del pie
            const radius = 95
            const cx = 110
            const cy = 110
            let acumulado = 0

            const segmentos = entries.map(([estado, count]) => {
              const porcentaje = count / total
              const startAngle = acumulado * 2 * Math.PI - Math.PI / 2
              acumulado += porcentaje
              const endAngle = acumulado * 2 * Math.PI - Math.PI / 2

              const x1 = cx + radius * Math.cos(startAngle)
              const y1 = cy + radius * Math.sin(startAngle)
              const x2 = cx + radius * Math.cos(endAngle)
              const y2 = cy + radius * Math.sin(endAngle)
              const largeArc = porcentaje > 0.5 ? 1 : 0

              // Pie chart (sólido, sin agujero interior)
              const path = porcentaje >= 1
                ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
                : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

              // Calcular posición del label del porcentaje (en medio del segmento)
              const midAngle = (startAngle + endAngle) / 2
              const labelRadius = radius * 0.6
              const labelX = cx + labelRadius * Math.cos(midAngle)
              const labelY = cy + labelRadius * Math.sin(midAngle)

              return {
                estado,
                count,
                porcentaje,
                color: COLORS[estado] || '#94a3b8',
                path,
                labelX,
                labelY,
              }
            })

            return (
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Pie SVG */}
                <div className="flex items-center justify-center">
                  <svg width="220" height="220" viewBox="0 0 220 220">
                    {segmentos.map((seg, i) => (
                      <path
                        key={i}
                        d={seg.path}
                        fill={seg.color}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="2"
                        style={{ filter: `drop-shadow(0 0 8px ${seg.color}66)` }}
                      />
                    ))}
                    {/* Etiquetas de porcentaje sobre cada segmento */}
                    {segmentos.map((seg, i) => seg.porcentaje >= 0.05 && (
                      <text
                        key={`label-${i}`}
                        x={seg.labelX}
                        y={seg.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize="14"
                        fontWeight="bold"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                      >
                        {(seg.porcentaje * 100).toFixed(0)}%
                      </text>
                    ))}
                  </svg>
                </div>

                {/* Leyenda con detalle */}
                <div className="flex-1 space-y-3 w-full">
                  {segmentos.map((seg) => (
                    <div key={seg.estado} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded shrink-0" style={{ background: seg.color, boxShadow: `0 0 8px ${seg.color}66` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{seg.estado}</span>
                          <span className="text-xs font-bold text-white/80">
                            {seg.count} ({(seg.porcentaje * 100).toFixed(1)}%)
                          </span>
                        </div>
                        {/* Barra de progreso */}
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${seg.porcentaje * 100}%`, background: seg.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </Link>
      )}

      {/* Gráfico de barras - Valor de Inventario por Bodega */}
      {(() => {
        const bodegasConSaldo = bodegas.filter(b => (b.saldos || []).length > 0)
        if (bodegasConSaldo.length === 0) return null

        const dataBodegas = bodegasConSaldo.map(b => {
          const saldos = b.saldos || []
          const valor = saldos.reduce((sum, s) => sum + (s.valor_existencia || 0), 0)
          const items = saldos.reduce((sum, s) => sum + (s.existencia || 0), 0)
          return { id: b.id, nombre: b.nombre, valor, items, totalSaldos: saldos.length }
        }).sort((a, b) => b.valor - a.valor)

        const maxValor = Math.max(...dataBodegas.map(d => d.valor), 1)
        const totalGeneral = dataBodegas.reduce((sum, d) => sum + d.valor, 0)

        const COLORES = ['#dc2626', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6']

        return (
          <Link href="/bodegas" className="block rounded-2xl p-6 transition-all hover:scale-[1.005] hover:bg-white/[0.07] cursor-pointer group" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">{t('valorPorBodegaTitle')}</h2>
              <span className="text-white/30 group-hover:text-white/70 text-sm transition-colors">{tCommon('goToModule')} →</span>
            </div>
            <p className="text-xs text-white/40 mb-2">{t('valorPorBodegaDescripcion')} · {tCommon('clickForDetail')}</p>
            <p className="text-xl font-black mb-6 text-white">{t('totalGeneral')}: ${fmtMoney(totalGeneral)}</p>

            {/* Barras */}
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${dataBodegas.length}, minmax(0, 1fr))` }}>
              {dataBodegas.map((d, i) => {
                const color = COLORES[i % COLORES.length]
                const height = (d.valor / maxValor) * 100
                return (
                  <div key={d.id} className="flex flex-col items-center">
                    <div className="flex items-end justify-center h-64 w-full">
                      <div className="flex flex-col items-center justify-end h-full" style={{ width: '30%' }}>
                        <span className="text-xl font-black mb-2 whitespace-nowrap" style={{ color: '#ffffff' }}>
                          ${fmtMoney(d.valor)}
                        </span>
                        <div
                          className="w-full rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${height}%`,
                            background: `linear-gradient(180deg, ${color}, ${color}99)`,
                            minHeight: d.valor > 0 ? '4px' : '0',
                            boxShadow: `0 0 14px ${color}66`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-full mt-3 pt-2" style={{ borderTop: `2px solid ${color}66` }}>
                      <p className="text-base font-black text-center" style={{ color: '#ffffff' }}>{d.nombre}</p>
                      <p className="text-xs text-white/60 text-center mt-1 font-semibold">{d.totalSaldos} {t('productos')} · {d.items.toLocaleString('es-CO')} {t('unidades')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Link>
        )
      })()}
    </div>
  )
}
