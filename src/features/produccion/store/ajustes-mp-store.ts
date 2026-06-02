import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type AjusteMateriaPrima } from '../types'

interface AjustesMPState {
  ajustes: AjusteMateriaPrima[]
  addAjuste: (a: AjusteMateriaPrima) => void
  updateAjuste: (id: string, a: Partial<AjusteMateriaPrima>) => void
  deleteAjuste: (id: string) => void
}

export const useAjustesMPStore = create<AjustesMPState>()(
  persist(
    (set) => ({
      ajustes: [],
      addAjuste: (a) => set((s) => ({ ajustes: [...s.ajustes, a] })),
      updateAjuste: (id, a) => set((s) => ({ ajustes: s.ajustes.map((r) => r.id === id ? { ...r, ...a } : r) })),
      deleteAjuste: (id) => set((s) => ({ ajustes: s.ajustes.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'ajustes-mp-storage' }
  )
)
