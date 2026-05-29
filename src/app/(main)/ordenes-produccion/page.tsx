'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useOrdenesProduccionStore } from '@/features/produccion/store/ordenes-produccion-store'
import { useFormulasStore } from '@/features/produccion/store/formulas-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { usePersonalEmpresaStore } from '@/features/personal-empresa/store/personal-empresa-store'
import { type OrdenProduccion, type LineaOrdenProduccion } from '@/features/produccion/types'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { fDate, todayColombia } from '@/shared/lib/format-date'
import ViewRecordModal from '@/shared/components/view-record-modal'

const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }
const selSt: React.CSSProperties = { background: 'rgba(12,26,61,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

const nextConsecutivo = (nro: number) => `OPR-${String(nro).padStart(5, '0')}`

const sitStyle = (s: string): React.CSSProperties => {
  if (s === 'Completada') return { background: 'rgba(34,197,94,0.95)', color: '#fff', border: '1px solid rgba(34,197,94,0.3)' }
  if (s === 'En Proceso') return { background: 'rgba(96,165,250,0.95)', color: '#fff', border: '1px solid rgba(96,165,250,0.3)' }
  if (s === 'Pendiente') return { background: 'rgba(245,158,11,0.2)', color: '#fff', border: '1px solid rgba(245,158,11,0.3)' }
  if (s === 'Cancelada') return { background: 'rgba(239,68,68,0.95)', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' }
  return { background: 'rgba(107,114,128,0.2)', color: '#d1d5db', border: '1px solid rgba(107,114,128,0.3)' }
}

export default function OrdenesProduccionPage() {
  const t = useTranslations('pages')
  const tBtn = useTranslations('buttons')
  const tF = useTranslations('fields')
  const tE = useTranslations('empty')
  const tPh = useTranslations('placeholders')
  const tCf = useTranslations('confirm')
  const tH = useTranslations('headers')
  const tTbl = useTranslations('table')
  const tSub = useTranslations('subtitles')
  const tOp = useTranslations('options')
  const permisos = usePermisos('ordenes-produccion')
  const { ordenes, addOrden, updateOrden, deleteOrden } = useOrdenesProduccionStore()
  const formulas = useFormulasStore(s => s.formulas).filter(f => f.situacion === 'Activa')
  const productos = useProductosStore(s => s.productos)
  const personalList = usePersonalEmpresaStore(s => s.personal).filter(p => p.situacion === 'Activo')

  const maxNum = ordenes.reduce((max, r) => Math.max(max, r.nro_orden || 0), 0)

  const initForm = (): OrdenProduccion => ({
    id: '', nro_orden: maxNum + 1, consecutivo: nextConsecutivo(maxNum + 1),
    fecha_emision: todayColombia(), fecha_programada: '', fecha_ejecucion: '',
    formula_id: '', formula_nombre: '',
    producto_terminado_id: '', producto_terminado_codigo: '', producto_terminado_nombre: '',
    cantidad_a_producir: 1, cantidad_producida: 0, unidad_medida: 'Unidad',
    lineas: [], responsable: '', observaciones: '', situacion: 'Pendiente',
  })

  const [form, setForm] = useState<OrdenProduccion>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [viewRecord, setViewRecord] = useState<OrdenProduccion | null>(null)

  const filtered = ordenes.filter(r =>
    `${r.consecutivo} ${r.producto_terminado_nombre} ${r.formula_nombre} ${r.situacion}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleFormulaChange = (formulaId: string) => {
    const f = formulas.find(x => x.id === formulaId)
    if (!f) return
    // Generar líneas de ingredientes multiplicadas por la cantidad a producir
    const factor = (form.cantidad_a_producir || 1) / (f.cantidad_produce || 1)
    const lineas: LineaOrdenProduccion[] = f.ingredientes.map(ing => ({
      id: crypto.randomUUID(),
      producto_id: ing.producto_id,
      codigo: ing.codigo,
      descripcion: ing.descripcion,
      cantidad_requerida: Math.round(ing.cantidad * factor * 100) / 100,
      cantidad_usada: 0,
      unidad_medida: ing.unidad_medida,
      ajustado: false,
    }))
    setForm({
      ...form,
      formula_id: formulaId, formula_nombre: f.nombre_formula,
      producto_terminado_id: f.producto_terminado_id,
      producto_terminado_codigo: f.producto_terminado_codigo,
      producto_terminado_nombre: f.producto_terminado_nombre,
      unidad_medida: f.unidad_medida,
      lineas,
    })
  }

  const handleCantidadChange = (cantidad: number) => {
    const f = formulas.find(x => x.id === form.formula_id)
    if (!f) { setForm({ ...form, cantidad_a_producir: cantidad }); return }
    const factor = cantidad / (f.cantidad_produce || 1)
    const lineas: LineaOrdenProduccion[] = f.ingredientes.map(ing => ({
      id: crypto.randomUUID(),
      producto_id: ing.producto_id, codigo: ing.codigo, descripcion: ing.descripcion,
      cantidad_requerida: Math.round(ing.cantidad * factor * 100) / 100,
      cantidad_usada: 0, unidad_medida: ing.unidad_medida, ajustado: false,
    }))
    setForm({ ...form, cantidad_a_producir: cantidad, lineas })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.formula_id) { setFormError('Seleccione una fórmula.'); return }
    if (form.cantidad_a_producir <= 0) { setFormError('La cantidad a producir debe ser mayor a 0.'); return }

    // Verificar stock de materia prima
    const sinStock: string[] = []
    form.lineas.forEach(l => {
      const prod = productos.find(p => p.id === l.producto_id)
      if (prod && prod.existencia < l.cantidad_requerida) {
        sinStock.push(`${l.descripcion}: necesita ${l.cantidad_requerida}, tiene ${prod.existencia}`)
      }
    })
    if (sinStock.length > 0) {
      setFormError(`Stock insuficiente:\n${sinStock.join('\n')}`)
      return
    }

    if (form.id) { updateOrden(form.id, form) }
    else { addOrden({ ...form, id: crypto.randomUUID() }) }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const handleDelete = (id: string) => { if (confirm(tCf('delOrdenProd'))) deleteOrden(id) }
  const openEdit = (r: OrdenProduccion) => { setForm({ ...r }); setIsFormOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('ordenesProduccion')}</h1>
          <p className="text-white/50 text-sm mt-1">{tSub('produccion')}</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fff' }}>{ordenes.filter(o => o.situacion === 'Pendiente').length} pendientes</span>
          <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(96,165,250,0.15)', color: '#fff' }}>{ordenes.length} total</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {permisos.registrar && (
          <button onClick={() => { setForm(initForm()); setFormError(''); setIsFormOpen(!isFormOpen) }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
            {isFormOpen ? 'Cerrar' : '+ Nueva Orden'}
          </button>
        )}
        <input type="text" placeholder={tPh('buscar')} value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={inputSt} />
      </div>

      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-black/20 p-6 rounded-2xl border border-white/10 space-y-4">
          {formError && <div className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-pre-line" style={{ background: 'rgba(239,68,68,0.15)', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' }}>{formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Nro. Orden</label>
              <input readOnly value={form.consecutivo} className="w-full px-3 py-2 rounded-lg text-sm text-white/50 outline-none cursor-not-allowed" style={{ ...inputSt, opacity: 0.6 }} />
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Fecha Emisión</label>
              <input type="date" value={form.fecha_emision} onChange={e => setForm({ ...form, fecha_emision: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputSt} />
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Fórmula *</label>
              <select required value={form.formula_id} onChange={e => handleFormulaChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={selSt}>
                <option value="">{tOp('seleccionarGuion')}</option>
                {formulas.map(f => <option key={f.id} value={f.id}>{f.consecutivo} — {f.nombre_formula}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Cantidad a Producir *</label>
              <input type="number" min={1} value={form.cantidad_a_producir} onChange={e => handleCantidadChange(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputSt} />
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Producto Terminado</label>
              <input readOnly value={form.producto_terminado_nombre || '(seleccione fórmula)'} className="w-full px-3 py-2 rounded-lg text-sm text-white/50 outline-none" style={{ ...inputSt, opacity: 0.6 }} />
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Fecha Programada</label>
              <input type="date" value={form.fecha_programada} onChange={e => setForm({ ...form, fecha_programada: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputSt} />
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Responsable</label>
              <select value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={selSt}>
                <option value="">{tOp('seleccionarGuion')}</option>
                {personalList.map(p => <option key={p.id} value={`${p.nombre} ${p.apellido}`}>{p.nombre} {p.apellido}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Situación</label>
              <select value={form.situacion} onChange={e => setForm({ ...form, situacion: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={selSt}>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Líneas de materia prima */}
          {form.lineas.length > 0 && (
            <div>
              <label className="block text-xl font-extrabold text-white mb-2 uppercase">Materia Prima Requerida</label>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-base text-white">
                  <thead className="bg-white/5 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Código</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-right">Cantidad Req.</th>
                      <th className="px-4 py-2 text-left">Unidad</th>
                      <th className="px-4 py-2 text-right">Stock Actual</th>
                      <th className="px-4 py-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.lineas.map(l => {
                      const prod = productos.find(p => p.id === l.producto_id)
                      const stock = prod?.existencia || 0
                      const ok = stock >= l.cantidad_requerida
                      return (
                        <tr key={l.id} className="border-t border-white/5">
                          <td className="px-4 py-2 font-mono text-xs">{l.codigo}</td>
                          <td className="px-4 py-2">{l.descripcion}</td>
                          <td className="px-4 py-2 text-right font-bold">{l.cantidad_requerida}</td>
                          <td className="px-4 py-2">{l.unidad_medida}</td>
                          <td className="px-4 py-2 text-right">{stock}</td>
                          <td className="px-4 py-2 text-center">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={ok ? { background: 'rgba(34,197,94,0.95)', color: '#fff' } : { background: 'rgba(239,68,68,0.95)', color: '#fff' }}>
                              {ok ? '✓ OK' : '✗ Falta'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xl font-extrabold text-white mb-1">Observaciones</label>
            <textarea rows={2} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none" style={inputSt} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>{form.id ? 'Actualizar' : 'Guardar'}</button>
            <button type="button" onClick={() => { setIsFormOpen(false); setForm(initForm()) }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all">{tBtn('cancel')}</button>
          </div>
        </form>
      )}

      {/* Tabla */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-4">Nro.</th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4">Fórmula</th>
                <th className="px-4 py-4">Producto</th>
                <th className="px-4 py-4">Cantidad</th>
                <th className="px-4 py-4">Responsable</th>
                <th className="px-4 py-4">Situación</th>
                <th className="px-4 py-4 text-right">{tTbl('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center text-white/30">{tE('noOrdenesProduccion')}</td></tr>}
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono font-bold text-white">{r.consecutivo}</td>
                  <td className="px-4 py-3">{fDate(r.fecha_emision)}</td>
                  <td className="px-4 py-3">{r.formula_nombre}</td>
                  <td className="px-4 py-3">{r.producto_terminado_nombre}</td>
                  <td className="px-4 py-3">{r.cantidad_a_producir}</td>
                  <td className="px-4 py-3">{r.responsable || '—'}</td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-bold" style={sitStyle(r.situacion)}>{r.situacion}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewRecord(r)} className="text-white/50 hover:text-white px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs">Ver</button>
                      {permisos.editar && <button onClick={() => openEdit(r)} className="text-blue-300 hover:text-blue-100 px-3 py-1 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg text-xs">{tBtn('edit')}</button>}
                      {permisos.eliminar && <button onClick={() => handleDelete(r.id)} className="text-red-300 hover:text-red-100 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs">{tBtn('delete')}</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewRecord && (
        <ViewRecordModal title={`Orden: ${viewRecord.consecutivo}`} fields={[
          { label: tF('consecutivo'), value: viewRecord.consecutivo },
          { label: 'Fecha Emisión', value: fDate(viewRecord.fecha_emision) },
          { label: tH('formula'), value: viewRecord.formula_nombre },
          { label: 'Producto Terminado', value: viewRecord.producto_terminado_nombre },
          { label: 'Cantidad a Producir', value: String(viewRecord.cantidad_a_producir) },
          { label: 'Cantidad Producida', value: String(viewRecord.cantidad_producida) },
          { label: 'Responsable', value: viewRecord.responsable },
          { label: 'Materia Prima', value: viewRecord.lineas.map(l => `${l.codigo} ${l.descripcion}: ${l.cantidad_requerida} ${l.unidad_medida} (usado: ${l.cantidad_usada})`).join('\n') },
          { label: 'Observaciones', value: viewRecord.observaciones },
          { label: 'Situación', value: viewRecord.situacion },
        ]} onClose={() => setViewRecord(null)} />
      )}
    </div>
  )
}
