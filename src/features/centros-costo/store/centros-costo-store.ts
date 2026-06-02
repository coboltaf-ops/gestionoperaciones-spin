import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CentroCosto = {
  id: string; codigo: string; descripcion: string; situacion: string
}

interface CentrosCostoState {
  centros: CentroCosto[]
  addCentro: (c: CentroCosto) => void
  updateCentro: (id: string, c: Partial<CentroCosto>) => void
  deleteCentro: (id: string) => void
}

export const useCentrosCostoStore = create<CentrosCostoState>()(
  persist(
    (set) => ({
      centros: [],
      addCentro: (c) => set((s) => ({ centros: [...s.centros, c] })),
      updateCentro: (id, c) => set((s) => ({ centros: s.centros.map((r) => r.id === id ? { ...r, ...c } : r) })),
      deleteCentro: (id) => set((s) => ({ centros: s.centros.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'centros-costo-storage' }
  )
)
