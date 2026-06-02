import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CorreoEnviado = {
  id: string
  fecha: string
  hora: string
  destinatario: string
  proveedor: string
  asunto: string
  mensaje: string
  consecutivo: string
  total: string
  tipo_moneda: string
  estado: 'Enviado' | 'Abierto en cliente'
}

interface CorreosState {
  correos: CorreoEnviado[]
  addCorreo: (c: CorreoEnviado) => void
  deleteCorreo: (id: string) => void
  clearAll: () => void
}

export const useCorreosStore = create<CorreosState>()(
  persist(
    (set) => ({
      correos: [],
      addCorreo: (c) => set((s) => ({ correos: [c, ...s.correos] })),
      deleteCorreo: (id) => set((s) => ({ correos: s.correos.filter((c) => c.id !== id) })),
      clearAll: () => set({ correos: [] }),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'correos-enviados-storage' }
  )
)
