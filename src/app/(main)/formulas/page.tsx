'use client'

import { useTranslations } from 'next-intl'

import { useState } from 'react'
import { useFormulasStore } from '@/features/produccion/store/formulas-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { type Formula, type Ingrediente } from '@/features/produccion/types'
import { usePermisos } from '@/shared/hooks/use-permisos'
import ViewRecordModal from '@/shared/components/view-record-modal'

const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }
const selSt: React.CSSProperties = { background: 'rgba(12,26,61,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

const nextConsecutivo = (nro: number) => `FORM-${String(nro).padStart(5, '0')}`

const emptyIngrediente = (): Ingrediente => ({ id: crypto.randomUUID(), producto_id: '', codigo: '', descripcion: '', cantidad: 0, unidad_medida: 'Unidad' })

export default function FormulasPage() {
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
  const permisos = usePermisos('formulas')
  const { formulas, addFormula, updateFormula, deleteFormula } = useFormulasStore()
  const productos = useProductosStore(s => s.productos)

  const materiasPrimas = productos.filter(p => p.situacion === 'Activo')
  const productosTerminados = productos.filter(p => p.situacion === 'Activo' && p.tipo_inventario === 'Producto Terminado')

  const maxNum = formulas.reduce((max, r) => Math.max(max, r.nro_formula || 0), 0)

  const initForm = (): Formula => ({
    id: '', nro_formula: maxNum + 1, consecutivo: nextConsecutivo(maxNum + 1),
    producto_terminado_id: '', producto_terminado_codigo: '', producto_terminado_nombre: '',
    nombre_formula: '', descripcion: '', cantidad_produce: 1, unidad_medida: 'Unidad',
    ingredientes: [emptyIngrediente()], situacion: 'Activa',
  })

  const [form, setForm] = useState<Formula>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [viewRecord, setViewRecord] = useState<Formula | null>(null)

  const filtered = formulas.filter(r =>
    `${r.consecutivo} ${r.nombre_formula} ${r.producto_terminado_nombre}`.toLowerCase().includes(search.toLowerCase())
  )

  const handlePTChange = (id: string) => {
    const p = productosTerminados.find(x => x.id === id)
    setForm({ ...form, producto_terminado_id: id, producto_terminado_codigo: p?.codigo || '', producto_terminado_nombre: p?.descripcion || '' })
  }

  const handleIngredienteChange = (idx: number, productoId: string) => {
    const p = materiasPrimas.find(x => x.id === productoId)
    const newIng = [...form.ingredientes]
    newIng[idx] = { ...newIng[idx], producto_id: productoId, codigo: p?.codigo || '', descripcion: p?.descripcion || '', unidad_medida: p?.unidad_medida || 'Unidad' }
    setForm({ ...form, ingredientes: newIng })
  }

  const handleIngCantidad = (idx: number, cantidad: number) => {
    const newIng = [...form.ingredientes]
    newIng[idx] = { ...newIng[idx], cantidad }
    setForm({ ...form, ingredientes: newIng })
  }

  const addIngrediente = () => setForm({ ...form, ingredientes: [...form.ingredientes, emptyIngrediente()] })
  const removeIngrediente = (idx: number) => {
    if (form.ingredientes.length <= 1) return
    setForm({ ...form, ingredientes: form.ingredientes.filter((_, i) => i !== idx) })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.producto_terminado_id) { setFormError('Seleccione el producto terminado.'); return }
    if (!form.nombre_formula.trim()) { setFormError('El nombre de la fórmula es obligatorio.'); return }
    if (form.ingredientes.every(i => !i.producto_id)) { setFormError('Agregue al menos un ingrediente.'); return }
    const ingredientesValidos = form.ingredientes.filter(i => i.producto_id && i.cantidad > 0)
    if (ingredientesValidos.length === 0) { setFormError('Los ingredientes deben tener producto y cantidad.'); return }

    const data = { ...form, ingredientes: ingredientesValidos }
    if (form.id) { updateFormula(form.id, data) }
    else { addFormula({ ...data, id: crypto.randomUUID() }) }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const handleDelete = (id: string) => { if (confirm(tCf('delFormula'))) deleteFormula(id) }
  const openEdit = (r: Formula) => { setForm({ ...r }); setIsFormOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('formulas')}</h1>
          <p className="text-white/50 text-sm mt-1">{tSub('formulas')}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(96,165,250,0.15)', color: '#fff' }}>{formulas.length} fórmulas</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        {permisos.registrar && (
          <button onClick={() => { setForm(initForm()); setFormError(''); setIsFormOpen(!isFormOpen) }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
            {isFormOpen ? 'Cerrar Formulario' : '+ Nueva Fórmula'}
          </button>
        )}
        <input type="text" placeholder={tPh('buscarFormula')} value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={inputSt} />
      </div>

      {/* Formulario */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-black/20 p-6 rounded-2xl border border-white/10 space-y-4">
          {formError && <div className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.6)' }}>{formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Nro. Fórmula</label>
              <input readOnly value={form.consecutivo} className="w-full px-3 py-2 rounded-lg text-sm text-white/50 outline-none cursor-not-allowed" style={{ ...inputSt, opacity: 0.6 }} />
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Nombre Fórmula *</label>
              <input required value={form.nombre_formula} onChange={e => setForm({ ...form, nombre_formula: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputSt} />
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Producto Terminado *</label>
              <select required value={form.producto_terminado_id} onChange={e => handlePTChange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={selSt}>
                <option value="">{tOp('seleccionarGuion')}</option>
                {productosTerminados.map(p => <option key={p.id} value={p.id}>{p.codigo} — {p.descripcion}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xl font-extrabold text-white mb-1">Cantidad que Produce</label>
              <input type="number" min={1} value={form.cantidad_produce} onChange={e => setForm({ ...form, cantidad_produce: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputSt} />
            </div>
          </div>

          <div>
            <label className="block text-xl font-extrabold text-white mb-1">Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none" style={inputSt} />
          </div>

          {/* Ingredientes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-lg font-extrabold text-blue-600 mb-1 uppercase">Ingredientes (Materia Prima)</label>
              <button type="button" onClick={addIngrediente} className="text-xs text-blue-300 hover:text-blue-100 font-bold">{tBtn('addIngredient')}</button>
            </div>
            <div className="space-y-2">
              {form.ingredientes.map((ing, idx) => (
                <div key={ing.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <select value={ing.producto_id} onChange={e => handleIngredienteChange(idx, e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={selSt}>
                      <option value="">{tOp('seleccionarMateria')}</option>
                      {materiasPrimas.map(p => <option key={p.id} value={p.id}>{p.codigo} — {p.descripcion}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={0} step="0.01" placeholder="Cantidad" value={ing.cantidad || ''} onChange={e => handleIngCantidad(idx, Number(e.target.value))} className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputSt} />
                  </div>
                  <div className="col-span-3">
                    <input readOnly value={ing.unidad_medida} className="w-full px-3 py-2 rounded-lg text-sm text-white/50 outline-none" style={{ ...inputSt, opacity: 0.6 }} />
                  </div>
                  <div className="col-span-1 text-center">
                    <button type="button" onClick={() => removeIngrediente(idx)} className="text-red-400 hover:text-red-200 text-sm font-bold">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xl font-extrabold text-white mb-1">Situación</label>
            <select value={form.situacion} onChange={e => setForm({ ...form, situacion: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={selSt}>
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
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
                <th className="px-4 py-4 font-semibold text-white/90">Nro.</th>
                <th className="px-4 py-4 font-semibold text-white/90">Nombre</th>
                <th className="px-4 py-4 font-semibold text-white/90">Producto Terminado</th>
                <th className="px-4 py-4 font-semibold text-white/90">Produce</th>
                <th className="px-4 py-4 font-semibold text-white/90">Ingredientes</th>
                <th className="px-4 py-4 font-semibold text-white/90">Situación</th>
                <th className="px-4 py-4 font-semibold text-white/90 text-right">{tTbl('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-white/30">{tE('noFormulas')}</td></tr>}
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{r.consecutivo}</td>
                  <td className="px-4 py-3">{r.nombre_formula}</td>
                  <td className="px-4 py-3">{r.producto_terminado_nombre}</td>
                  <td className="px-4 py-3">{r.cantidad_produce} {r.unidad_medida}</td>
                  <td className="px-4 py-3">{r.ingredientes.length} items</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={r.situacion === 'Activa' ? { background: 'rgba(34,197,94,0.95)', color: '#fff' } : { background: 'rgba(107,114,128,0.2)', color: '#d1d5db' }}>{r.situacion}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewRecord(r)} className="text-white/50 hover:text-white font-medium px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-xs">Ver</button>
                      {permisos.editar && <button onClick={() => openEdit(r)} className="text-blue-300 hover:text-blue-100 font-medium px-3 py-1 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg transition-all text-xs">{tBtn('edit')}</button>}
                      {permisos.eliminar && <button onClick={() => handleDelete(r.id)} className="text-red-300 hover:text-red-100 font-medium px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all text-xs">{tBtn('delete')}</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewRecord && (
        <ViewRecordModal
          title={`Fórmula: ${viewRecord.consecutivo}`}
          fields={[
            { label: tF('consecutivo'), value: viewRecord.consecutivo },
            { label: 'Nombre', value: viewRecord.nombre_formula },
            { label: 'Producto Terminado', value: `${viewRecord.producto_terminado_codigo} — ${viewRecord.producto_terminado_nombre}` },
            { label: 'Cantidad que Produce', value: `${viewRecord.cantidad_produce} ${viewRecord.unidad_medida}` },
            { label: 'Descripción', value: viewRecord.descripcion },
            { label: tH('ingredientes'), value: viewRecord.ingredientes.map(i => `${i.codigo} ${i.descripcion}: ${i.cantidad} ${i.unidad_medida}`).join('\n') },
            { label: 'Situación', value: viewRecord.situacion },
          ]}
          onClose={() => setViewRecord(null)}
        />
      )}
    </div>
  )
}
