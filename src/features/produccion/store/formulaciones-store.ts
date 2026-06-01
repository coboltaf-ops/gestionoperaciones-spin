import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Formulacion } from '../types/formulacion'

interface FormulacionesState {
  formulaciones: Formulacion[]
  addFormulacion: (f: Formulacion) => void
  updateFormulacion: (id: string, f: Partial<Formulacion>) => void
  deleteFormulacion: (id: string) => void
  setFormulaciones: (formulaciones: Formulacion[]) => void
  getMaxNroFormula: () => number
}

export const useFormulacionesStore = create<FormulacionesState>()(
  persist(
    (set, get) => ({
      formulaciones: [],

      addFormulacion: (f) =>
        set((s) => ({
          formulaciones: [...s.formulaciones, f],
        })),

      updateFormulacion: (id, f) =>
        set((s) => ({
          formulaciones: s.formulaciones.map((r) =>
            r.id === id ? { ...r, ...f, updated_at: new Date().toISOString() } : r
          ),
        })),

      deleteFormulacion: (id) =>
        set((s) => ({
          formulaciones: s.formulaciones.filter((r) => r.id !== id),
        })),

      setFormulaciones: (formulaciones) => set({ formulaciones }),

      getMaxNroFormula: () => {
        const formulaciones = get().formulaciones
        return formulaciones.reduce((max, f) => Math.max(max, f.nro_formula || 0), 0)
      },
    }),
    { name: 'formulaciones-storage' }
  )
)
