import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RenglonRecepcion = {
  detalle_id: string; codigo_producto: string; descripcion: string; unidad_medida: string
  cantidad_pedida: number; costo_unitario: number; ya_recibido: number
  cantidad_a_recibir: number; completo: boolean
}

export type Recepcion = {
  id: string; nro_recepcion: number; consecutivo: string; nro_factura: string
  tipo_inventario: string
  fecha_emision: string; fecha_recibida: string; orden_compra_id: string
  orden_compra_consecutivo: string; proveedor: string; bodega_llegada: string
  comprador: string; persona_recibe: string
  fecha_aprobacion: string; renglones: RenglonRecepcion[]; observaciones: string; estado: string
  pasada_a_pagos?: boolean
  pasada_a_pagos_fecha?: string
  pasada_a_pagos_factura_id?: string
}

interface RecepcionesState {
  recepciones: Recepcion[]
  addRecepcion: (r: Recepcion) => void
  updateRecepcion: (id: string, r: Partial<Recepcion>) => void
  deleteRecepcion: (id: string) => void
}

export const useRecepcionesStore = create<RecepcionesState>()(
  persist(
    (set) => ({
      recepciones: [],
      addRecepcion: (r) => set((s) => ({ recepciones: [...s.recepciones, r] })),
      updateRecepcion: (id, r) => set((s) => ({ recepciones: s.recepciones.map((x) => x.id === id ? { ...x, ...r } : x) })),
      deleteRecepcion: (id) => set((s) => ({ recepciones: s.recepciones.filter((x) => x.id !== id) })),
    }),
    { name: 'recepcion-facturas-storage' }
  )
)
