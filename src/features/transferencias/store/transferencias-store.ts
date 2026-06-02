import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type RenglonTransferencia = {
  id: string; codigo_producto: string; descripcion: string; unidad_medida: string; cantidad: number
}

export type Transferencia = {
  id: string; nro_transferencia: number; consecutivo: string; fecha_emision: string
  tipo_inventario: string
  bodega_salida_id: string; bodega_salida_nombre: string
  bodega_entrada_id: string; bodega_entrada_nombre: string
  persona_emite: string; persona_recibe: string
  fecha_aprobacion: string; fecha_aprobacion_recepcion: string
  observaciones: string
  renglones: RenglonTransferencia[]; estado: string
}

interface TransferenciasState {
  transferencias: Transferencia[]
  addTransferencia: (t: Transferencia) => void
  updateTransferencia: (id: string, t: Partial<Transferencia>) => void
  deleteTransferencia: (id: string) => void
}

export const useTransferenciasStore = create<TransferenciasState>()(
  persist(
    (set) => ({
      transferencias: [],
      addTransferencia: (t) => set((s) => ({ transferencias: [...s.transferencias, t] })),
      updateTransferencia: (id, t) => set((s) => ({ transferencias: s.transferencias.map((r) => r.id === id ? { ...r, ...t } : r) })),
      deleteTransferencia: (id) => set((s) => ({ transferencias: s.transferencias.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'transferencias-storage' }
  )
)
