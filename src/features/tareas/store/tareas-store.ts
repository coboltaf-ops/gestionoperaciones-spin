import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Tarea } from '../types'

interface TareasState {
  tareas: Tarea[]
  addTarea: (t: Tarea) => void
  updateTarea: (id: string, t: Partial<Tarea>) => void
  deleteTarea: (id: string) => void
}

export const useTareasStore = create<TareasState>()(
  persist(
    (set) => ({
      tareas: [],
      addTarea: (t) => set((s) => ({ tareas: [...s.tareas, t] })),
      updateTarea: (id, t) => set((s) => ({
        tareas: s.tareas.map((r) => r.id === id ? { ...r, ...t } : r)
      })),
      deleteTarea: (id) => set((s) => ({
        tareas: s.tareas.filter((r) => r.id !== id)
      })),
    }),
    { name: 'tareas-storage' }
  )
)
