import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrdenProduccionV2 } from '../types/orden-produccion'

interface OrdenesProduccionV2State {
  ordenes: OrdenProduccionV2[]
  addOrden: (o: OrdenProduccionV2) => void
  updateOrden: (id: string, o: Partial<OrdenProduccionV2>) => void
  deleteOrden: (id: string) => void
  setOrdenes: (ordenes: OrdenProduccionV2[]) => void
  getMaxNroOrden: () => number
}

export const useOrdenesProduccionV2Store = create<OrdenesProduccionV2State>()(
  persist(
    (set, get) => ({
      ordenes: [],

      addOrden: (o) =>
        set((s) => ({
          ordenes: [...s.ordenes, o],
        })),

      updateOrden: (id, o) =>
        set((s) => ({
          ordenes: s.ordenes.map((r) =>
            r.id === id ? { ...r, ...o, updated_at: new Date().toISOString() } : r
          ),
        })),

      deleteOrden: (id) =>
        set((s) => ({
          ordenes: s.ordenes.filter((r) => r.id !== id),
        })),

      setOrdenes: (ordenes) => set({ ordenes }),

      getMaxNroOrden: () => {
        const ordenes = get().ordenes
        return ordenes.reduce((max, o) => Math.max(max, o.nro_orden || 0), 0)
      },
    }),
    { name: 'ordenes-produccion-v2-storage' }
  )
)
