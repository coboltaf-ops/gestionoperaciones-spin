import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RenglonAjuste = {
  id: string; codigo_producto: string; descripcion: string; unidad_medida: string; cantidad: number
}

export type AjusteInventario = {
  id: string; nro_ajuste: string; fecha_emision: string
  tipo_inventario: string
  bodega_id: string; bodega_nombre: string
  persona_autoriza: string; fecha_aprobacion: string
  tipo_ajuste_id: string; tipo_ajuste_nombre: string; tipo_ajuste_signo: '+' | '-' | ''
  renglones: RenglonAjuste[]; estado: string
}

interface AjustesState {
  ajustes: AjusteInventario[]
  addAjuste: (a: AjusteInventario) => void
  updateAjuste: (id: string, a: Partial<AjusteInventario>) => void
  deleteAjuste: (id: string) => void
}

export const useAjustesStore = create<AjustesState>()(
  persist(
    (set) => ({
      ajustes: [],
      addAjuste: (a) => set((s) => ({ ajustes: [...s.ajustes, a] })),
      updateAjuste: (id, a) => set((s) => ({ ajustes: s.ajustes.map((r) => r.id === id ? { ...r, ...a } : r) })),
      deleteAjuste: (id) => set((s) => ({ ajustes: s.ajustes.filter((r) => r.id !== id) })),
    }),
    {
      name: 'ajustes-inventario-storage',
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return persistedState || { ajustes: [] }
        }
        return persistedState
      },
      version: 0,
    }
  )
)
