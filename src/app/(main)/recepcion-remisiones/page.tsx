'use client'

import { useState, useMemo } from 'react'
import { useRemisionesStore, nextRemisionConsecutivo, type Remision, type RenglonRemision } from '@/features/recepcion-remisiones/store/remisiones-store'
import { useOrdenesStore } from '@/features/ordenes-compra/store/ordenes-store'
import { usePedidosStore } from '@/features/pedidos/store/pedidos-store'
import { useBodegasStore } from '@/features/bodegas/store/bodegas-store'
import { useProveedoresStore } from '@/features/proveedores/store/proveedores-store'
import PersonalSelector from '@/shared/components/personal-selector'
import { useTipoInventarioSesion } from '@/features/contexto-sesion/store/tipo-inventario-store'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { todayColombia, fDate } from '@/shared/lib/format-date'

const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }
const selectSt: React.CSSProperties = { background: 'rgba(12,26,61,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

export default function RecepcionRemisionesPage() {
  const permisos = usePermisos('recepcion-remisiones')
  const tipoActivo = useTipoInventarioSesion(s => s.tipoActivo)
  const today = todayColombia()

  const { remisiones: todas, addRemision, updateRemision, deleteRemision } = useRemisionesStore()
  const ordenesCompra = useOrdenesStore(s => s.ordenes)
  const pedidos = usePedidosStore(s => s.pedidos)
  const todasBodegas = useBodegasStore(s => s.bodegas)
  const proveedores = useProveedoresStore(s => s.proveedores)
  const bodegasDisponibles = (tipoActivo ? todasBodegas.filter(b => b.tipo_inventario === tipoActivo) : todasBodegas)
    .filter(b => b.situacion === 'Activa')

  const remisiones = tipoActivo ? todas.filter(r => r.tipo_inventario === tipoActivo) : todas

  // ── Form state ──
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [tipoOrden, setTipoOrden] = useState<'OC' | 'OP'>('OC')
  const [ordenId, setOrdenId] = useState('')
  const [nroRemisionProv, setNroRemisionProv] = useState('')
  const [fechaEmision, setFechaEmision] = useState('')
  const [fechaRecibida, setFechaRecibida] = useState('')
  const [bodegaLlegada, setBodegaLlegada] = useState('')
  const [personaRecibe, setPersonaRecibe] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [renglones, setRenglones] = useState<RenglonRemision[]>([])
  const [error, setError] = useState('')
  const [renglonErrors, setRenglonErrors] = useState<Record<number, string>>({})
  const [ordenAviso, setOrdenAviso] = useState('')

  // ── Asociar Factura state ──
  const [asociarOpen, setAsociarOpen] = useState(false)
  const [asociarProveedor, setAsociarProveedor] = useState('')
  const [asociarSeleccionadas, setAsociarSeleccionadas] = useState<string[]>([])
  const [asociarNroFactura, setAsociarNroFactura] = useState('')
  const [asociarFechaFactura, setAsociarFechaFactura] = useState('')
  const [asociarError, setAsociarError] = useState('')

  // Snapshot del proveedor/comprador/bodega de la orden seleccionada
  const ordenSeleccionada = useMemo(() => {
    if (!ordenId) return null
    if (tipoOrden === 'OC') return ordenesCompra.find(o => o.id === ordenId) || null
    return pedidos.find(p => p.id === ordenId) || null
  }, [ordenId, tipoOrden, ordenesCompra, pedidos])

  // Lista de órdenes disponibles según tipo y tipo_inventario activo
  const ordenesDisponibles = useMemo(() => {
    if (tipoOrden === 'OC') {
      return ordenesCompra
        .filter(o => !tipoActivo || o.tipo_inventario === tipoActivo)
        .filter(o => o.situacion !== 'Anulada' && o.situacion !== 'Rechazada')
        .map(o => ({ id: o.id, consecutivo: o.consecutivo, proveedor: o.proveedor, fecha: o.fecha_emision }))
    }
    return pedidos
      .filter(p => p.situacion !== 'Anulado' && p.situacion !== 'Rechazado')
      .map(p => ({ id: p.id, consecutivo: p.consecutivo, proveedor: p.proveedor, fecha: p.fecha_emision }))
  }, [tipoOrden, ordenesCompra, pedidos, tipoActivo])

  // Cuanto se ha recibido previamente para un detalle de la misma orden (excluyendo la remision en edicion)
  const computeYaRecibido = (orden_id: string, detalle_id: string, excludeRemisionId?: string | null) => {
    return todas
      .filter(r => r.orden_id === orden_id && r.id !== excludeRemisionId && r.estado !== 'Anulada')
      .reduce((sum, r) => {
        const ren = r.renglones.find(x => x.detalle_id === detalle_id)
        return sum + (ren?.cantidad_a_recibir || 0)
      }, 0)
  }

  const cargarRenglonesDeOrden = (id: string) => {
    setRenglonErrors({})
    setOrdenAviso('')
    if (!id) { setRenglones([]); return }
    let nuevos: RenglonRemision[] = []
    if (tipoOrden === 'OC') {
      const o = ordenesCompra.find(x => x.id === id)
      if (!o) { setRenglones([]); return }
      nuevos = o.detalles.map(d => {
        const yaRecibido = computeYaRecibido(id, d.id, editId)
        const saldo = Math.max(0, d.cantidad - yaRecibido)
        return {
          detalle_id: d.id,
          codigo_producto: d.codigo_producto,
          descripcion: d.descripcion,
          unidad_medida: d.unidad_medida,
          cantidad_pedida: d.cantidad,
          costo_unitario: d.costo_unitario,
          ya_recibido: yaRecibido,
          cantidad_a_recibir: saldo,
          completo: saldo === 0,
        }
      })
    } else {
      const p = pedidos.find(x => x.id === id)
      if (!p) { setRenglones([]); return }
      nuevos = p.detalles.map(d => {
        const yaRecibido = computeYaRecibido(id, d.id, editId)
        const saldo = Math.max(0, d.cantidad - yaRecibido)
        return {
          detalle_id: d.id,
          codigo_producto: d.codigo_producto,
          descripcion: d.descripcion,
          unidad_medida: d.unidad_medida,
          cantidad_pedida: d.cantidad,
          costo_unitario: 0,
          ya_recibido: yaRecibido,
          cantidad_a_recibir: saldo,
          completo: saldo === 0,
        }
      })
    }
    setRenglones(nuevos)
    // Si todos los items ya estan recibidos completos, avisar
    const todosCompletos = nuevos.every(r => r.cantidad_pedida > 0 && r.ya_recibido >= r.cantidad_pedida)
    if (todosCompletos && nuevos.length > 0) {
      setOrdenAviso('⚠ Todos los items de esta orden ya fueron recibidos completos. No hay saldo pendiente por recibir.')
    }
  }

  const abrirNueva = () => {
    setEditId(null)
    setTipoOrden('OC')
    setOrdenId('')
    setNroRemisionProv('')
    setFechaEmision(today)
    setFechaRecibida(today)
    setBodegaLlegada('')
    setPersonaRecibe('')
    setObservaciones('')
    setRenglones([])
    setRenglonErrors({})
    setOrdenAviso('')
    setError('')
    setOpen(true)
  }

  const editar = (r: Remision) => {
    setEditId(r.id)
    setTipoOrden(r.tipo_orden)
    setOrdenId(r.orden_id)
    setNroRemisionProv(r.nro_remision_proveedor)
    setFechaEmision(r.fecha_emision)
    setFechaRecibida(r.fecha_recibida)
    setBodegaLlegada(r.bodega_llegada)
    setPersonaRecibe(r.persona_recibe)
    setObservaciones(r.observaciones)
    setRenglones(r.renglones)
    setRenglonErrors({})
    setOrdenAviso('')
    setError('')
    setOpen(true)
  }

  const eliminar = (r: Remision) => {
    if (!confirm(`¿Eliminar la remisión ${r.consecutivo}?`)) return
    deleteRemision(r.id)
  }

  // ── Handlers Asociar Factura ──
  const abrirAsociar = () => {
    setAsociarProveedor('')
    setAsociarSeleccionadas([])
    setAsociarNroFactura('')
    setAsociarFechaFactura(today)
    setAsociarError('')
    setAsociarOpen(true)
  }

  const remisionesDelProveedor = todas.filter(r =>
    asociarProveedor && r.proveedor === asociarProveedor && r.estado === 'Recibida'
  )

  const toggleSeleccion = (id: string) => {
    setAsociarSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const guardarAsociacion = () => {
    setAsociarError('')
    if (!asociarProveedor) { setAsociarError('Selecciona el proveedor.'); return }
    if (asociarSeleccionadas.length === 0) { setAsociarError('Selecciona al menos una remisión.'); return }
    if (!asociarNroFactura.trim()) { setAsociarError('Indica el N° de la factura.'); return }
    if (!asociarFechaFactura) { setAsociarError('Indica la fecha de la factura.'); return }
    asociarSeleccionadas.forEach(id => {
      updateRemision(id, {
        nro_factura: asociarNroFactura.trim(),
        fecha_factura: asociarFechaFactura,
        fecha_asociacion: today,
      })
    })
    setAsociarOpen(false)
  }

  const cambiarTipoOrden = (t: 'OC' | 'OP') => {
    setTipoOrden(t)
    setOrdenId('')
    setRenglones([])
    setRenglonErrors({})
    setOrdenAviso('')
  }

  const seleccionarOrden = (id: string) => {
    setOrdenId(id)
    cargarRenglonesDeOrden(id)
    // Pre-cargar la bodega de la orden si existe entre las disponibles
    const ord = tipoOrden === 'OC' ? ordenesCompra.find(x => x.id === id) : pedidos.find(x => x.id === id)
    if (ord && ord.bodega_llegada) {
      const existe = bodegasDisponibles.some(b => b.nombre === ord.bodega_llegada)
      if (existe) setBodegaLlegada(ord.bodega_llegada)
    }
  }

  const updateRenglon = (idx: number, patch: Partial<RenglonRemision>) => {
    setRenglones(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }

  const cambiarCantidadRecibir = (idx: number, valor: string) => {
    const r = renglones[idx]
    if (!r) return
    const saldo = Math.max(0, (r.cantidad_pedida || 0) - (r.ya_recibido || 0))
    // Si esta vacio, dejar en 0 sin error
    if (valor === '') {
      setRenglonErrors(prev => { const { [idx]: _omit, ...rest } = prev; return rest })
      updateRenglon(idx, { cantidad_a_recibir: 0, completo: false })
      return
    }
    const num = Number(valor)
    if (isNaN(num) || num < 0) {
      setRenglonErrors(prev => ({ ...prev, [idx]: 'Cantidad no admitida' }))
      updateRenglon(idx, { cantidad_a_recibir: 0, completo: false })
      return
    }
    if (num > saldo) {
      // Cantidad supera el saldo por recibir → bloquear
      setRenglonErrors(prev => ({ ...prev, [idx]: 'Cantidad no admitida' }))
      updateRenglon(idx, { cantidad_a_recibir: 0, completo: false })
      return
    }
    // Valor valido
    setRenglonErrors(prev => { const { [idx]: _omit, ...rest } = prev; return rest })
    updateRenglon(idx, { cantidad_a_recibir: num, completo: num >= saldo && saldo > 0 })
  }

  const guardar = () => {
    setError('')
    if (!tipoOrden) { setError('Selecciona el tipo de orden (OC u OP).'); return }
    if (!ordenId) { setError('Selecciona la orden referenciada.'); return }
    if (!ordenSeleccionada) { setError('La orden seleccionada no existe.'); return }
    if (!nroRemisionProv.trim()) { setError('Indica el N° de remisión del proveedor.'); return }
    if (!fechaEmision) { setError('Indica la fecha de emisión.'); return }
    if (!fechaRecibida) { setError('Indica la fecha en que se recibe.'); return }
    if (!bodegaLlegada) { setError('Selecciona la bodega de llegada.'); return }
    if (!personaRecibe.trim()) { setError('Indica la persona que recibe.'); return }
    if (renglones.length === 0) { setError('No hay renglones para registrar.'); return }
    if (Object.keys(renglonErrors).length > 0) { setError('Hay cantidades no admitidas. Corrígelas antes de guardar.'); return }
    const aRecibirTotal = renglones.reduce((s, r) => s + (r.cantidad_a_recibir || 0), 0)
    if (aRecibirTotal <= 0) { setError('Debe haber al menos un renglón con cantidad mayor a 0.'); return }

    const ord = ordenSeleccionada as { id: string; consecutivo: string; proveedor: string; bodega_llegada: string; comprador: string; tipo_inventario?: string }
    const baseTipoInv = ord.tipo_inventario || tipoActivo || ''

    if (editId) {
      updateRemision(editId, {
        tipo_orden: tipoOrden,
        orden_id: ordenId,
        orden_consecutivo: ord.consecutivo,
        nro_remision_proveedor: nroRemisionProv.trim(),
        fecha_emision: fechaEmision,
        fecha_recibida: fechaRecibida,
        proveedor: ord.proveedor,
        bodega_llegada: bodegaLlegada,
        comprador: ord.comprador,
        persona_recibe: personaRecibe.trim(),
        observaciones: observaciones.trim(),
        renglones,
      })
    } else {
      const nro = todas.reduce((m, r) => Math.max(m, r.nro_remision || 0), 0) + 1
      const nueva: Remision = {
        id: crypto.randomUUID(),
        nro_remision: nro,
        consecutivo: nextRemisionConsecutivo(todas),
        nro_remision_proveedor: nroRemisionProv.trim(),
        tipo_inventario: baseTipoInv,
        fecha_emision: fechaEmision,
        fecha_recibida: fechaRecibida,
        tipo_orden: tipoOrden,
        orden_id: ordenId,
        orden_consecutivo: ord.consecutivo,
        proveedor: ord.proveedor,
        bodega_llegada: bodegaLlegada,
        comprador: ord.comprador,
        persona_recibe: personaRecibe.trim(),
        fecha_aprobacion: '',
        renglones,
        observaciones: observaciones.trim(),
        estado: 'Recibida',
      }
      addRemision(nueva)
    }
    setOpen(false)
  }

  if (!permisos.leer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 text-lg">No tienes permisos para acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Recepción de Remisiones</h1>
          <p className="text-white/50 mt-1">Registro de mercancía recibida con remisión, contra Órdenes de Compra u Órdenes de Pedido</p>
        </div>
        {permisos.registrar && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={abrirNueva} className="px-5 py-2.5 rounded-xl font-medium text-white"
              style={{ background: 'rgba(22,163,74,1)', border: '1px solid rgba(21,128,61,1)' }}>
              + Ingreso de Remisión Proveedor
            </button>
            <button onClick={abrirAsociar} className="px-5 py-2.5 rounded-xl font-medium text-white"
              style={{ background: 'rgba(168,85,247,0.5)', border: '1px solid rgba(168,85,247,0.5)' }}>
              🔗 Asociar Factura a Remisión
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <table className="w-full text-base text-left">
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr>
              {['Consecutivo', 'N° Remisión Prov.', 'Fecha Emisión', 'Fecha Recibida', 'Tipo Orden', 'Orden Ref.', 'Proveedor', 'Bodega', 'Recibe', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="px-3 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {remisiones.length === 0 ? (
              <tr><td colSpan={11} className="px-6 py-12 text-center text-white/30">No hay remisiones registradas. Crea la primera con <strong>+ Nueva Remisión</strong>.</td></tr>
            ) : remisiones.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/[0.02]">
                <td className="px-3 py-3 font-mono font-bold text-emerald-300 whitespace-nowrap">{r.consecutivo}</td>
                <td className="px-3 py-3 font-mono text-white/80">{r.nro_remision_proveedor}</td>
                <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{fDate(r.fecha_emision)}</td>
                <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{fDate(r.fecha_recibida)}</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-1 rounded-md text-xs font-bold" style={r.tipo_orden === 'OC'
                    ? { background: 'rgba(96,165,250,0.95)', color: '#fff', border: '1px solid rgba(96,165,250,0.3)' }
                    : { background: 'rgba(168,85,247,0.2)', color: '#c4b5fd', border: '1px solid rgba(168,85,247,0.3)' }}>{r.tipo_orden === 'OC' ? 'O. Compra' : 'O. Pedido'}</span>
                </td>
                <td className="px-3 py-3 font-mono text-white">{r.orden_consecutivo}</td>
                <td className="px-3 py-3 text-white font-bold">{r.proveedor}</td>
                <td className="px-3 py-3 text-white font-bold">{r.bodega_llegada || '—'}</td>
                <td className="px-3 py-3 text-white font-bold">{r.persona_recibe}</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-1 rounded-md text-xs font-bold" style={{ background: 'rgba(34,197,94,0.95)', color: '#fff', border: '1px solid rgba(34,197,94,0.4)' }}>{r.estado}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {permisos.editar && <button onClick={() => editar(r)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(96,165,250,0.95)', color: '#fff', border: '1px solid rgba(96,165,250,0.3)' }}>Editar</button>}
                    {permisos.eliminar && <button onClick={() => eliminar(r)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.95)', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-5xl rounded-2xl p-6 max-h-[92vh] overflow-y-auto" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">📑 {editId ? 'Editar Remisión' : 'Nueva Remisión'}</h2>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Fila 1: Consecutivo · Fecha de Recepción · N° Remisión Prov */}
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">N° Recepción de Remisiones</label>
                <input value={editId ? (todas.find(r => r.id === editId)?.consecutivo || '') : nextRemisionConsecutivo(todas)} readOnly
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono font-bold text-emerald-300" style={{ ...inputSt, opacity: 0.85 }} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">Fecha de Recepción</label>
                <input type="date" value={fechaRecibida} readOnly
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={{ ...inputSt, opacity: 0.85 }} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">N° Remisión del Proveedor *</label>
                <input value={nroRemisionProv} onChange={e => setNroRemisionProv(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono" style={inputSt} placeholder="Ej. 12345" />
              </div>
              {/* Fila 2: Tipo Orden · Orden Compra/Pedido (col-span 2) */}
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">Tipo de Orden referenciada *</label>
                <select value={tipoOrden} onChange={e => cambiarTipoOrden(e.target.value as 'OC' | 'OP')}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="OC">Orden de Compra</option>
                  <option value="OP">Orden de Pedido</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">{tipoOrden === 'OC' ? 'Orden de Compra' : 'Orden de Pedido'} *</label>
                <select value={ordenId} onChange={e => seleccionarOrden(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">Seleccione…</option>
                  {ordenesDisponibles.map(o => (
                    <option key={o.id} value={o.id}>{o.consecutivo} · {o.proveedor} · {fDate(o.fecha)}</option>
                  ))}
                </select>
                {ordenesDisponibles.length === 0 && (
                  <p className="text-xs text-amber-300/80 mt-1">⚠ No hay {tipoOrden === 'OC' ? 'órdenes de compra' : 'órdenes de pedido'} disponibles.</p>
                )}
              </div>
              {/* Fila 3: Fecha Emisión · Persona recibe (col-span 2) */}
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">Fecha Emisión *</label>
                <input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">Persona que recibe *</label>
                <PersonalSelector value={personaRecibe} onChange={setPersonaRecibe} placeholder="Seleccione la persona que recibe…" />
              </div>
              {/* Fila 4: Bodega · Observaciones (col-span 2) */}
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">Bodega de Llegada *</label>
                <select value={bodegaLlegada} onChange={e => setBodegaLlegada(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">Seleccione la bodega…</option>
                  {bodegasDisponibles.map(b => (
                    <option key={b.id} value={b.nombre}>{b.nombre}</option>
                  ))}
                </select>
                {bodegasDisponibles.length === 0 && (
                  <p className="text-xs text-amber-300/80 mt-1">⚠ No hay bodegas activas. Crea una en <strong>Bodegas</strong>.</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">Observaciones</label>
                <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} placeholder="Notas adicionales..." />
              </div>
            </div>

            {/* Renglones */}
            <div className="mt-4">
              <p className="text-sm font-bold text-white mb-2">Items a recibir</p>
              {ordenAviso && (
                <p className="text-sm font-bold mb-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)', color: '#fff', border: '1px solid rgba(239,68,68,0.4)' }}>{ordenAviso}</p>
              )}
              <div className="rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <table className="w-full text-base">
                  <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <tr>
                      <th className="px-3 py-2 text-left text-white/70">Código</th>
                      <th className="px-3 py-2 text-left text-white/70">Descripción</th>
                      <th className="px-3 py-2 text-right text-white/70 whitespace-nowrap">Cant. Pedida</th>
                      <th className="px-3 py-2 text-right text-white/70 whitespace-nowrap">Ya Recibido</th>
                      <th className="px-3 py-2 text-right text-white/70 whitespace-nowrap">Saldo</th>
                      <th className="px-3 py-2 text-left text-white/70">Unidad</th>
                      <th className="px-3 py-2 text-right text-white/70 whitespace-nowrap">Cant. a Recibir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renglones.length === 0 && (
                      <tr><td colSpan={7} className="px-3 py-6 text-center text-white/40">Selecciona una orden para cargar los items.</td></tr>
                    )}
                    {renglones.map((r, idx) => {
                      const saldo = Math.max(0, (r.cantidad_pedida || 0) - (r.ya_recibido || 0))
                      const err = renglonErrors[idx]
                      return (
                        <tr key={idx} className="border-t border-white/5">
                          <td className="px-3 py-2 font-mono text-white font-bold">{r.codigo_producto}</td>
                          <td className="px-3 py-2 text-white">{r.descripcion}</td>
                          <td className="px-3 py-2 font-mono text-right text-white font-bold">{r.cantidad_pedida}</td>
                          <td className="px-3 py-2 font-mono text-right text-blue-300">{r.ya_recibido || 0}</td>
                          <td className="px-3 py-2 font-mono text-right" style={{ color: saldo === 0 ? '#fca5a5' : '#86efac' }}>{saldo}</td>
                          <td className="px-3 py-2 text-white font-bold">{r.unidad_medida}</td>
                          <td className="px-3 py-2">
                            <input type="number" step="0.01" min="0"
                              value={r.cantidad_a_recibir === 0 && !err ? '' : r.cantidad_a_recibir}
                              disabled={saldo === 0}
                              onChange={e => cambiarCantidadRecibir(idx, e.target.value)}
                              className="w-24 rounded-lg px-2 py-1 outline-none text-base text-white font-bold font-mono text-right"
                              style={{ ...inputSt, borderColor: err ? '#ef4444' : 'rgba(255,255,255,0.15)', opacity: saldo === 0 ? 0.4 : 1 }}
                              placeholder={saldo === 0 ? '—' : '0'} />
                            {err && <p className="text-xs text-red-400 font-bold mt-1">{err}</p>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mt-3">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setOpen(false)} className="px-5 py-2 rounded-xl text-white/70 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
              <button onClick={guardar} className="px-5 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'rgba(22,163,74,1)', border: '1px solid rgba(21,128,61,1)' }}>{editId ? 'Guardar Cambios' : 'Registrar Remisión'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASOCIAR FACTURA */}
      {asociarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-5xl rounded-2xl p-6 max-h-[92vh] overflow-y-auto" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">🔗 Asociar Factura a Remisión</h2>
              <button onClick={() => setAsociarOpen(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-3">
                <label className="block text-xl text-white font-extrabold mb-1">Proveedor *</label>
                <select value={asociarProveedor} onChange={e => { setAsociarProveedor(e.target.value); setAsociarSeleccionadas([]) }}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">Seleccione el proveedor…</option>
                  {proveedores.filter(p => p.situacion === 'Activo').map(p => (
                    <option key={p.id} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {asociarProveedor && (
              <>
                <p className="text-sm font-bold text-white mb-2">Remisiones de {asociarProveedor}</p>
                <div className="rounded-xl overflow-x-auto mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <table className="w-full text-base">
                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <tr>
                        <th className="px-3 py-2 text-left text-white/70 w-10"></th>
                        <th className="px-3 py-2 text-left text-white/70">Consecutivo</th>
                        <th className="px-3 py-2 text-left text-white/70">N° Rem. Prov.</th>
                        <th className="px-3 py-2 text-left text-white/70">Fecha Recibida</th>
                        <th className="px-3 py-2 text-left text-white/70">Tipo Orden</th>
                        <th className="px-3 py-2 text-left text-white/70">Orden</th>
                        <th className="px-3 py-2 text-left text-white/70">Bodega</th>
                        <th className="px-3 py-2 text-left text-white/70">Items</th>
                        <th className="px-3 py-2 text-left text-white/70">Factura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remisionesDelProveedor.length === 0 ? (
                        <tr><td colSpan={9} className="px-3 py-6 text-center text-white/40">No hay remisiones recibidas para este proveedor.</td></tr>
                      ) : remisionesDelProveedor.map(r => (
                        <tr key={r.id} className="border-t border-white/5">
                          <td className="px-3 py-2">
                            <input type="checkbox" checked={asociarSeleccionadas.includes(r.id)} onChange={() => toggleSeleccion(r.id)} />
                          </td>
                          <td className="px-3 py-2 font-mono font-bold text-emerald-300">{r.consecutivo}</td>
                          <td className="px-3 py-2 font-mono text-white font-bold">{r.nro_remision_proveedor}</td>
                          <td className="px-3 py-2 text-white font-bold">{fDate(r.fecha_recibida)}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded text-xs" style={r.tipo_orden === 'OC'
                              ? { background: 'rgba(96,165,250,0.95)', color: '#fff' }
                              : { background: 'rgba(168,85,247,0.2)', color: '#c4b5fd' }}>{r.tipo_orden === 'OC' ? 'O. Compra' : 'O. Pedido'}</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-white font-bold">{r.orden_consecutivo}</td>
                          <td className="px-3 py-2 text-white font-bold">{r.bodega_llegada}</td>
                          <td className="px-3 py-2 text-white font-bold">{r.renglones.length}</td>
                          <td className="px-3 py-2">
                            {r.nro_factura ? (
                              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: 'rgba(34,197,94,0.95)', color: '#fff' }}>{r.nro_factura}</span>
                            ) : (
                              <span className="text-white/40 text-xs">Sin asociar</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xl text-white font-extrabold mb-1">N° Factura *</label>
                    <input value={asociarNroFactura} onChange={e => setAsociarNroFactura(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono" style={inputSt} placeholder="Ej. FAC-001" />
                  </div>
                  <div>
                    <label className="block text-xl text-white font-extrabold mb-1">Fecha de la Factura *</label>
                    <input type="date" value={asociarFechaFactura} onChange={e => setAsociarFechaFactura(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} />
                  </div>
                  <div className="flex items-end">
                    <p className="text-xs text-white/50">{asociarSeleccionadas.length} remisión(es) seleccionada(s)</p>
                  </div>
                </div>
              </>
            )}

            {asociarError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mt-3">{asociarError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setAsociarOpen(false)} className="px-5 py-2 rounded-xl text-white/70 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancelar</button>
              <button onClick={guardarAsociacion} className="px-5 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'rgba(168,85,247,0.5)', border: '1px solid rgba(168,85,247,0.6)' }}>Asociar Factura</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
