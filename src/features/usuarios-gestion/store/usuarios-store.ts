import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  MODULOS, permisosAdmin, permisosSoloLectura,
  type ModuloId, type PermisoModulo, type Usuario,
} from '../types'

// Re-export para compatibilidad con código existente
export { MODULOS, permisosAdmin, permisosSoloLectura }
export type { ModuloId, PermisoModulo, Usuario }

interface UsuariosState {
  usuarios: Usuario[]
  loaded: boolean
  addUsuario: (u: Usuario) => void
  updateUsuario: (id: string, u: Partial<Usuario>) => void
  deleteUsuario: (id: string) => void
  setUsuarios: (usuarios: Usuario[]) => void
}

export const useUsuariosStore = create<UsuariosState>()(
  persist(
    (set) => ({
      usuarios: [
        {
          id: '1',
          nombre: 'Juan Andres',
          apellido: 'Arango Velasquez',
          usuario: 'jarango',
          clave: 'admin123',
          correo: 'jarango@empresa.com',
          rol: 'Admin',
          situacion: 'Activo',
          permisos: permisosAdmin(),
        },
      ],
      loaded: false,
      addUsuario: (u) => set((s) => ({ usuarios: [...s.usuarios, u] })),
      updateUsuario: (id, u) => set((s) => ({ usuarios: s.usuarios.map((r) => r.id === id ? { ...r, ...u } : r) })),
      deleteUsuario: (id) => set((s) => ({ usuarios: s.usuarios.filter((r) => r.id !== id) })),
      setUsuarios: (usuarios) => set({ usuarios, loaded: true }),
    }),
    {
      name: 'usuarios-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<UsuariosState>
        const usuarios = (p.usuarios ?? current.usuarios).map(u => ({
          ...u,
          permisos: u.permisos?.length ? u.permisos : permisosAdmin(),
        }))
        return { ...current, ...p, usuarios }
      },
    }
  )
)
