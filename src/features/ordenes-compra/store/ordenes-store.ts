import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DetalleOrden = {
  id: string; codigo_producto: string; descripcion: string; cantidad: number
  costo_unitario: number; unidad_medida: string; subtotal: number; recibido: boolean
}

export type OrdenCompra = {
  id: string; nro_orden: number; consecutivo: string; fecha_emision: string; fecha_vencimiento: string
  tipo_inventario: string
  proveedor: string; fecha_llegada: string; tipo_moneda: string; comprador: string
  condicion_pago: string; fecha_aprobacion: string; observaciones: string
  detalles: DetalleOrden[]; pct_impuesto: number; bodega_llegada: string; centro_costo: string; situacion: string
}

interface OrdenesState {
  ordenes: OrdenCompra[]
  addOrden: (o: OrdenCompra) => void
  updateOrden: (id: string, o: Partial<OrdenCompra>) => void
  deleteOrden: (id: string) => void
  setOrdenes: (o: OrdenCompra[]) => void
}

export const useOrdenesStore = create<OrdenesState>()(
  persist(
    (set) => ({
      ordenes: [],
      addOrden: (o) => set((s) => ({ ordenes: [...s.ordenes, o] })),
      updateOrden: (id, o) => set((s) => ({ ordenes: s.ordenes.map((r) => r.id === id ? { ...r, ...o } : r) })),
      deleteOrden: (id) => set((s) => ({ ordenes: s.ordenes.filter((r) => r.id !== id) })),
      setOrdenes: (o) => set({ ordenes: o }),
    }),
    { name: 'ordenes-compra-storage', version: 2 }
  )
)
