import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type RenglonSalida = {
  id: string; codigo_producto: string; descripcion: string; unidad_medida: string; cantidad: number
}

export type SalidaAlmacen = {
  id: string; nro_salida: number; consecutivo: string; fecha_emision: string
  tipo_inventario: string
  bodega_salida_id: string; bodega_salida_nombre: string
  persona_emite: string; fecha_aprobacion: string
  centro_costo_id: string; centro_costo_nombre: string
  observaciones: string; renglones: RenglonSalida[]; situacion: string
}

interface SalidasState {
  salidas: SalidaAlmacen[]
  addSalida: (s: SalidaAlmacen) => void
  updateSalida: (id: string, s: Partial<SalidaAlmacen>) => void
  deleteSalida: (id: string) => void
}

export const useSalidasStore = create<SalidasState>()(
  persist(
    (set) => ({
      salidas: [],
      addSalida: (s) => set((st) => ({ salidas: [...st.salidas, s] })),
      updateSalida: (id, s) => set((st) => ({ salidas: st.salidas.map((r) => r.id === id ? { ...r, ...s } : r) })),
      deleteSalida: (id) => set((st) => ({ salidas: st.salidas.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'salidas-almacen-storage' }
  )
)
