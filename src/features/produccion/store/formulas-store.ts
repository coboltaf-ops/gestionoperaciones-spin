import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type Formula } from '../types'

interface FormulasState {
  formulas: Formula[]
  addFormula: (f: Formula) => void
  updateFormula: (id: string, f: Partial<Formula>) => void
  deleteFormula: (id: string) => void
}

export const useFormulasStore = create<FormulasState>()(
  persist(
    (set) => ({
      formulas: [],
      addFormula: (f) => set((s) => ({ formulas: [...s.formulas, f] })),
      updateFormula: (id, f) => set((s) => ({ formulas: s.formulas.map((r) => r.id === id ? { ...r, ...f } : r) })),
      deleteFormula: (id) => set((s) => ({ formulas: s.formulas.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'formulas-storage' }
  )
)
