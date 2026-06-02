import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type RenglonCarga = {
  id: string
  codigo_producto: string
  descripcion: string
  unidad_medida: string
  cantidad: number
  costo_unitario: number
}

export type CargaInicial = {
  id: string
  nro_carga: string
  fecha: string
  bodega_id: string
  bodega_nombre: string
  observaciones: string
  renglones: RenglonCarga[]
  estado: string
}

interface CargaInicialState {
  cargas: CargaInicial[]
  addCarga: (c: CargaInicial) => void
  deleteCarga: (id: string) => void
}

export const useCargaInicialStore = create<CargaInicialState>()(
  persist(
    (set) => ({
      cargas: [],
      addCarga: (c) => set((s) => ({ cargas: [...s.cargas, c] })),
      deleteCarga: (id) => set((s) => ({ cargas: s.cargas.filter((c) => c.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'carga-inicial-storage' }
  )
)
