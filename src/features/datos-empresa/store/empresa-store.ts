import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DatosEmpresa = {
  id: string
  nombre: string
  tipo_identificacion: string
  nro_documento: string
  correo: string
  telefono_oficina: string
  direccion: string
  ciudad: string
  pais: string
  representante_legal: string
  servidor_correo: string
  logo?: string // base64 data URL
}

interface EmpresaState {
  empresas: DatosEmpresa[]
  addEmpresa: (e: DatosEmpresa) => void
  updateEmpresa: (id: string, e: Partial<DatosEmpresa>) => void
  deleteEmpresa: (id: string) => void
}

export const useEmpresaStore = create<EmpresaState>()(
  persist(
    (set) => ({
      empresas: [],
      addEmpresa: (e) => set((s) => ({ empresas: [...s.empresas, e] })),
      updateEmpresa: (id, e) => set((s) => ({ empresas: s.empresas.map((r) => r.id === id ? { ...r, ...e } : r) })),
      deleteEmpresa: (id) => set((s) => ({ empresas: s.empresas.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'datos-empresa-storage' }
  )
)
