import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RenglonRemision = {
  detalle_id: string
  codigo_producto: string
  descripcion: string
  unidad_medida: string
  cantidad_pedida: number
  costo_unitario: number
  ya_recibido: number
  cantidad_a_recibir: number
  completo: boolean
}

export type Remision = {
  id: string
  nro_remision: number
  consecutivo: string                 // REM-00001
  nro_remision_proveedor: string      // N° de la remisión física del proveedor
  tipo_inventario: string
  fecha_emision: string
  fecha_recibida: string
  tipo_orden: 'OC' | 'OP'             // Orden Compra u Orden Pedido
  orden_id: string                    // FK a la orden referenciada
  orden_consecutivo: string           // snapshot del consecutivo
  proveedor: string
  bodega_llegada: string
  comprador: string
  persona_recibe: string
  fecha_aprobacion: string
  renglones: RenglonRemision[]
  observaciones: string
  estado: string
  nro_factura?: string                // Factura asociada (cuando se vincula a una factura del proveedor)
  fecha_factura?: string              // Fecha de la factura asociada
  fecha_asociacion?: string           // Fecha en que se hizo la asociacion
}

interface RemisionesState {
  remisiones: Remision[]
  addRemision: (r: Remision) => void
  updateRemision: (id: string, r: Partial<Remision>) => void
  deleteRemision: (id: string) => void
  setRemisiones: (r: Remision[]) => void
}

export const useRemisionesStore = create<RemisionesState>()(
  persist(
    (set) => ({
      remisiones: [],
      addRemision: (r) => set((s) => ({ remisiones: [...s.remisiones, r] })),
      updateRemision: (id, r) => set((s) => ({ remisiones: s.remisiones.map((x) => x.id === id ? { ...x, ...r } : x) })),
      deleteRemision: (id) => set((s) => ({ remisiones: s.remisiones.filter((x) => x.id !== id) })),
      setRemisiones: (r) => set({ remisiones: r }),
    }),
    { name: 'recepcion-remisiones-storage' }
  )
)

export const nextRemisionConsecutivo = (remisiones: Remision[]): string => {
  const maxNum = remisiones.reduce((m, r) => Math.max(m, r.nro_remision || 0), 0)
  return `REM-${String(maxNum + 1).padStart(5, '0')}`
}
