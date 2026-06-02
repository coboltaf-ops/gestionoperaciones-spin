'use client'

import { useState } from 'react'
import { useFormulacionesStore } from '@/features/produccion/store/formulaciones-store'
import { useProductos } from '@/features/produccion/hooks/useProductos'
import type { Formulacion, RenglonFormulacion } from '@/features/produccion/types/formulacion'

const nextConsecutivo = (nro: number) => `FORM-${String(nro).padStart(5, '0')}`

const sitStyle = (s: string): React.CSSProperties => {
  if (s === 'Activa') return { background: 'rgba(34,197,94,0.95)', color: '#fff' }
  if (s === 'Inactiva') return { background: 'rgba(107,114,128,0.95)', color: '#fff' }
  return {}
}

export default function FormulacionesPage() {
  const { formulaciones, addFormulacion, updateFormulacion, deleteFormulacion, getMaxNroFormula } =
    useFormulacionesStore()

  // Cargar TODOS los productos SIN FILTRO
  const { productos: todosProductos } = useProductos()

  // Separar por tipo
  const productosTerminados = todosProductos.filter((p) => p.tipo_inventario === 'Producto Terminado')
  const productosMateriaPrima = todosProductos.filter((p) => p.tipo_inventario === 'Materia Prima')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState<Partial<Formulacion>>({
    situacion: 'Activa',
    renglones: [],
  })

  const [newRenglon, setNewRenglon] = useState<Partial<RenglonFormulacion>>({})

  const filtered = formulaciones.filter((f) =>
    `${f.consecutivo} ${f.producto_terminado_nombre} ${f.situacion}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const handleSelectProductoTerminado = (productoId: string) => {
    const producto = productosTerminados.find((p) => p.id === productoId)
    if (producto) {
      setForm({
        ...form,
        producto_terminado_id: producto.id,
        producto_terminado_codigo: producto.codigo,
        producto_terminado_nombre: producto.descripcion,
        unidad_medida: producto.unidad_medida,
      })
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!form.producto_terminado_id) {
      setFormError('Producto Terminado requerido')
      return
    }
    if (!form.renglones || form.renglones.length === 0) {
      setFormError('Mínimo 1 renglon de Materia Prima')
      return
    }

    if (editingId) {
      updateFormulacion(editingId, form)
      setEditingId(null)
    } else {
      const maxNro = getMaxNroFormula()
      const newFormula: Formulacion = {
        id: crypto.randomUUID(),
        nro_formula: maxNro + 1,
        consecutivo: nextConsecutivo(maxNro + 1),
        empresa_id: 'default-empresa',
        renglones: (form.renglones || []).map((r, idx) => ({
          ...r,
          id: r.id || crypto.randomUUID(),
          numero_renglon: idx + 1,
        } as RenglonFormulacion)),
        ...(form as Omit<Formulacion, 'id' | 'consecutivo' | 'nro_formula' | 'empresa_id' | 'renglones'>),
      }
      addFormulacion(newFormula)
    }

    setIsFormOpen(false)
    setForm({ situacion: 'Activa', renglones: [] })
    setNewRenglon({})
  }

  const handleEdit = (formula: Formulacion) => {
    setForm(formula)
    setEditingId(formula.id)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta fórmula y todos sus renglones?')) {
      deleteFormulacion(id)
    }
  }

  const handleAddRenglon = () => {
    if (!newRenglon.producto_id || !newRenglon.producto_nombre || newRenglon.porcentaje_necesario === undefined) {
      setFormError('Completar todos los campos del renglón')
      return
    }

    const renglones = form.renglones || []
    const updatedRenglones = [
      ...renglones,
      {
        id: crypto.randomUUID(),
        formulacion_id: form.id || '',
        producto_id: newRenglon.producto_id || '',
        producto_codigo: newRenglon.producto_codigo || '',
        producto_nombre: newRenglon.producto_nombre || '',
        unidad_medida: newRenglon.unidad_medida || '',
        porcentaje_necesario: newRenglon.porcentaje_necesario || 0,
        numero_renglon: renglones.length + 1,
      } as RenglonFormulacion,
    ]

    setForm({ ...form, renglones: updatedRenglones })
    setNewRenglon({})
    setFormError('')
  }

  const handleSelectMateriaPrima = (productoId: string) => {
    const producto = productosMateriaPrima.find((p) => p.id === productoId)
    if (producto) {
      setNewRenglon({
        ...newRenglon,
        producto_id: producto.id,
        producto_codigo: producto.codigo,
        producto_nombre: producto.descripcion,
        unidad_medida: producto.unidad_medida,
      })
    }
  }

  const handleRemoveRenglon = (idx: number) => {
    const renglones = (form.renglones || []).filter((_, i) => i !== idx)
    setForm({ ...form, renglones })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Formulaciones (BOM)</h1>
          <p className="text-white/50 text-sm mt-1">Definir recetas de producción</p>
        </div>
        <button
          onClick={() => {
            setForm({ situacion: 'Activa', renglones: [] })
            setEditingId(null)
            setIsFormOpen(!isFormOpen)
          }}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}
        >
          {isFormOpen ? 'Cerrar' : '+ Nueva Fórmula'}
        </button>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Fórmula' : 'Nueva Fórmula'}</h2>
          {formError && <div className="mb-4 p-3 rounded-lg text-sm text-red-400 bg-red-500/10">{formError}</div>}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Producto - Solo Productos Terminados */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Seleccionar Producto Terminado *</label>
              <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
                📦 Productos Terminados disponibles: <strong>{productosTerminados.length}</strong>
              </div>
              <select
                value={form.producto_terminado_id || ''}
                onChange={(e) => handleSelectProductoTerminado(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="">-- Seleccionar Producto Terminado --</option>
                {productosTerminados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.descripcion}
                  </option>
                ))}
              </select>
              {productosTerminados.length === 0 && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  ❌ No hay productos terminados disponibles
                </div>
              )}
            </div>

            {/* Información Auto-Completada */}
            {form.producto_terminado_id && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <div>
                  <p className="text-xs text-white/50">Código</p>
                  <p className="text-white font-bold">{form.producto_terminado_codigo}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Descripción</p>
                  <p className="text-white font-bold">{form.producto_terminado_nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Unidad de Medida</p>
                  <p className="text-white font-bold">{form.unidad_medida}</p>
                </div>
              </div>
            )}

            {/* Situación */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Situación</label>
              <select
                value={form.situacion || 'Activa'}
                onChange={(e) => setForm({ ...form, situacion: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
              </select>
            </div>

            {/* Materia Prima */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Materia Prima Necesaria</h3>

              {(form.renglones || []).length > 0 && (
                <div className="mb-4 rounded-lg border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="divide-y divide-white/5">
                    {(form.renglones || []).map((renglon, idx) => (
                      <div key={renglon.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02]">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-sm font-bold text-white">{renglon.producto_codigo}</span>
                            <span className="text-white/60 text-sm">{renglon.producto_nombre}</span>
                            <span className="text-white/40 text-xs">{renglon.porcentaje_necesario}%</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRenglon(idx)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white hover:scale-105 transition"
                          style={{ background: 'rgba(239,68,68,0.5)' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-white/10 rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-sm text-white/50 mb-3">Agregar Materia Prima</p>
                {productosMateriaPrima.length === 0 ? (
                  <div className="w-full px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm mb-3">
                    ⚠️ No hay productos tipo "Materia Prima" disponibles
                  </div>
                ) : (
                  <>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <select
                    value={newRenglon.producto_id || ''}
                    onChange={(e) => handleSelectMateriaPrima(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm col-span-2"
                  >
                    <option value="">-- Seleccionar MP ({productosMateriaPrima.length}) --</option>
                    {productosMateriaPrima.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.descripcion}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Unidad"
                    value={newRenglon.unidad_medida || ''}
                    disabled
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Porcentaje %"
                    value={newRenglon.porcentaje_necesario || ''}
                    onChange={(e) => setNewRenglon({ ...newRenglon, porcentaje_necesario: parseFloat(e.target.value) })}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddRenglon}
                  className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white transition"
                  style={{ background: 'rgba(59,130,246,0.5)' }}
                >
                  + Agregar Renglon
                </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingId(null)
                }}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white font-bold"
                style={{ background: 'rgba(34,197,94,0.95)' }}
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="🔍 Buscar por consecutivo, producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
        />
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-white/30">No hay fórmulas</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((formula) => (
              <div key={formula.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-white">{formula.consecutivo}</span>
                    <span className="text-white/60">{formula.producto_terminado_nombre}</span>
                    <span className="text-white/40 text-sm">{formula.renglones.length} componentes</span>
                    <span className="px-2 py-1 rounded-full text-xs font-bold text-white" style={sitStyle(formula.situacion)}>
                      {formula.situacion}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(formula)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-white hover:scale-105 transition"
                    style={{ background: 'rgba(59,130,246,0.5)' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(formula.id)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-white hover:scale-105 transition"
                    style={{ background: 'rgba(239,68,68,0.5)' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
