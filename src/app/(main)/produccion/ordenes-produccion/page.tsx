'use client'

import { useState } from 'react'
import { useOrdenesProduccionV2Store } from '@/features/produccion/store/ordenes-produccion-v2-store'
import type { OrdenProduccionV2, OrdenProduccionFormData } from '@/features/produccion/types/orden-produccion'

const nextConsecutivo = (nro: number) => `OP-${String(nro).padStart(5, '0')}`

const sitStyle = (s: string): React.CSSProperties => {
  if (s === 'Ejecutada') return { background: 'rgba(34,197,94,0.95)', color: '#fff' }
  if (s === 'Solicitada') return { background: 'rgba(59,130,246,0.95)', color: '#fff' }
  if (s === 'Cancelada') return { background: 'rgba(239,68,68,0.95)', color: '#fff' }
  return {}
}

export default function OrdenesProduccionPage() {
  const { ordenes, addOrden, updateOrden, deleteOrden, getMaxNroOrden } = useOrdenesProduccionV2Store()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState<Partial<OrdenProduccionV2>>({
    fecha_registro: new Date().toISOString().split('T')[0],
    situacion: 'Solicitada',
    cantidad_real_producida: 0,
  })

  const filtered = ordenes.filter((o) =>
    `${o.consecutivo} ${o.cliente_nombre} ${o.producto_nombre || ''} ${o.situacion}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validar campos obligatorios
    if (!form.fecha_registro) { setFormError('Fecha registro requerida'); return }
    if (!form.cliente_id) { setFormError('Cliente requerido'); return }
    if (!form.cliente_nombre) { setFormError('Nombre cliente requerido'); return }
    if (!form.cantidad_a_producir || form.cantidad_a_producir <= 0) {
      setFormError('Cantidad a producir debe ser > 0'); return
    }

    if (editingId) {
      updateOrden(editingId, form)
      setEditingId(null)
    } else {
      const maxNro = getMaxNroOrden()
      const newOrder: OrdenProduccionV2 = {
        id: crypto.randomUUID(),
        nro_orden: maxNro + 1,
        consecutivo: nextConsecutivo(maxNro + 1),
        empresa_id: 'default-empresa',
        ...(form as Omit<OrdenProduccionV2, 'id' | 'consecutivo' | 'nro_orden' | 'empresa_id'>),
      }
      addOrden(newOrder)
    }

    setIsFormOpen(false)
    setForm({ fecha_registro: new Date().toISOString().split('T')[0], situacion: 'Solicitada', cantidad_real_producida: 0 })
  }

  const handleEdit = (orden: OrdenProduccionV2) => {
    setForm(orden)
    setEditingId(orden.id)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta orden?')) {
      deleteOrden(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Órdenes de Producción</h1>
          <p className="text-white/50 text-sm mt-1">Gestión de órdenes de producción</p>
        </div>
        <button
          onClick={() => {
            setForm({ fecha_registro: new Date().toISOString().split('T')[0], situacion: 'Solicitada', cantidad_real_producida: 0 })
            setEditingId(null)
            setIsFormOpen(!isFormOpen)
          }}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}
        >
          {isFormOpen ? 'Cerrar' : '+ Nueva Orden'}
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Orden' : 'Nueva Orden'}</h2>
          {formError && <div className="mb-4 p-3 rounded-lg text-sm text-red-400 bg-red-500/10">{formError}</div>}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Fecha Registro *</label>
                <input
                  type="date"
                  value={form.fecha_registro || ''}
                  onChange={(e) => setForm({ ...form, fecha_registro: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Cliente *</label>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={form.cliente_nombre || ''}
                  onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value, cliente_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Cantidad a Producir (Kgs) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cantidad_a_producir || ''}
                  onChange={(e) => setForm({ ...form, cantidad_a_producir: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Producto</label>
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={form.producto_nombre || ''}
                  onChange={(e) => setForm({ ...form, producto_nombre: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Cantidad Real Producida (Kgs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cantidad_real_producida || 0}
                  onChange={(e) => setForm({ ...form, cantidad_real_producida: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Situación</label>
                <select
                  value={form.situacion || 'Solicitada'}
                  onChange={(e) => setForm({ ...form, situacion: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="Solicitada">Solicitada</option>
                  <option value="Ejecutada">Ejecutada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Observaciones</label>
              <textarea
                value={form.observaciones || ''}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setIsFormOpen(false); setEditingId(null) }}
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

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="🔍 Buscar por consecutivo, cliente, producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
        />
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-white/30">No hay órdenes</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((orden) => (
              <div key={orden.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-white">{orden.consecutivo}</span>
                    <span className="text-white/60">{orden.cliente_nombre}</span>
                    <span className="text-white/40 text-sm">×{orden.cantidad_a_producir}Kg</span>
                    <span className="px-2 py-1 rounded-full text-xs font-bold text-white" style={sitStyle(orden.situacion)}>
                      {orden.situacion}
                    </span>
                  </div>
                  {orden.observaciones && <p className="text-xs text-white/40 mt-2">{orden.observaciones}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(orden)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-white hover:scale-105 transition"
                    style={{ background: 'rgba(59,130,246,0.5)' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(orden.id)}
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
