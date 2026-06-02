import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type PersonalEmpresa } from '../types'

interface PersonalEmpresaState {
  personal: PersonalEmpresa[]
  addPersonal: (p: PersonalEmpresa) => void
  updatePersonal: (id: string, p: Partial<PersonalEmpresa>) => void
  deletePersonal: (id: string) => void
}

export const usePersonalEmpresaStore = create<PersonalEmpresaState>()(
  persist(
    (set) => ({
      personal: [],
      addPersonal: (p) => set((s) => ({ personal: [...s.personal, p] })),
      updatePersonal: (id, p) => set((s) => ({
        personal: s.personal.map((r) => r.id === id ? { ...r, ...p } : r)
      })),
      deletePersonal: (id) => set((s) => ({
        personal: s.personal.filter((r) => r.id !== id)
      })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'personal-empresa-storage' }
  )
)
