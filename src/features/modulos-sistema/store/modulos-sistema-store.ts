'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ModuloEstado = {
  id: string
  activo: boolean
}

interface ModulosSistemaState {
  modulos: ModuloEstado[]
  toggleModulo: (id: string) => void
  initModulos: (ids: string[]) => void
}

export const useModulosSistemaStore = create<ModulosSistemaState>()(
  persist(
    (set, get) => ({
      modulos: [],
      toggleModulo: (id) => {
        const current = get().modulos
        if (current.length === 0) return
        set({ modulos: current.map(m => m.id === id ? { ...m, activo: !m.activo } : m) })
      },
      initModulos: (ids) => {
        const current = get().modulos
        const currentIds = new Set(current.map(m => m.id))
        const validIds = new Set(ids)
        const nuevos = ids.filter(id => !currentIds.has(id)).map(id => ({ id, activo: true }))
        const limpios = current.filter(m => validIds.has(m.id))
        if (nuevos.length > 0 || limpios.length !== current.length) {
          set({ modulos: [...limpios, ...nuevos] })
        }
      },
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'modulos-sistema-storage' }
  )
)
