import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type OrdenProduccion } from '../types'

interface OrdenesProduccionState {
  ordenes: OrdenProduccion[]
  addOrden: (o: OrdenProduccion) => void
  updateOrden: (id: string, o: Partial<OrdenProduccion>) => void
  deleteOrden: (id: string) => void
}

export const useOrdenesProduccionStore = create<OrdenesProduccionState>()(
  persist(
    (set) => ({
      ordenes: [],
      addOrden: (o) => set((s) => ({ ordenes: [...s.ordenes, o] })),
      updateOrden: (id, o) => set((s) => ({ ordenes: s.ordenes.map((r) => r.id === id ? { ...r, ...o } : r) })),
      deleteOrden: (id) => set((s) => ({ ordenes: s.ordenes.filter((r) => r.id !== id) })),
    }),
    { name: 'ordenes-produccion-storage' }
  )
)
