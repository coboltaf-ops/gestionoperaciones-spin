import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DetallePedido = {
  id: string; codigo_producto: string; descripcion: string; cantidad: number
  unidad_medida: string
}

export type Pedido = {
  id: string; nro_pedido: number; consecutivo: string; fecha_emision: string; fecha_vencimiento: string
  proveedor: string; fecha_llegada: string; tipo_moneda: string; comprador: string
  condicion_pago: string; fecha_aprobacion: string; observaciones: string
  detalles: DetallePedido[]; bodega_llegada: string; centro_costo: string; situacion: string
}

interface PedidosState {
  pedidos: Pedido[]
  addPedido: (p: Pedido) => void
  updatePedido: (id: string, p: Partial<Pedido>) => void
  deletePedido: (id: string) => void
  setPedidos: (p: Pedido[]) => void
}

export const usePedidosStore = create<PedidosState>()(
  persist(
    (set) => ({
      pedidos: [],
      addPedido: (p) => set((s) => ({ pedidos: [...s.pedidos, p] })),
      updatePedido: (id, p) => set((s) => ({ pedidos: s.pedidos.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deletePedido: (id) => set((s) => ({ pedidos: s.pedidos.filter((r) => r.id !== id) })),
      setPedidos: (p) => set({ pedidos: p }),
    }),
    { name: 'pedidos-storage', version: 1 }
  )
)
