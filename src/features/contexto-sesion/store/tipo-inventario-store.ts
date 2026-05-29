import { create } from 'zustand'

interface TipoInventarioSesionState {
  tipoActivo: string | null  // null = aún no eligió, '' = no soportado, otro = tipo activo
  setTipoActivo: (t: string | null) => void
}

export const useTipoInventarioSesion = create<TipoInventarioSesionState>()((set) => ({
  tipoActivo: null,
  setTipoActivo: (t) => set({ tipoActivo: t }),
}))
