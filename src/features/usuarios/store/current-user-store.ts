import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type PermisoModulo, type ModuloId, permisosAdmin } from '@/features/usuarios-gestion/store/usuarios-store'

export type CurrentUser = {
  nombre: string
  apellido: string
  usuario: string
  rol: string
  correo: string
  permisos: PermisoModulo[]
}

interface CurrentUserState {
  user: CurrentUser
  setUser: (u: CurrentUser) => void
  logout: () => void
  // Helpers de permisos
  puedeLeer: (modulo: ModuloId) => boolean
  puedeEditar: (modulo: ModuloId) => boolean
  puedeEliminar: (modulo: ModuloId) => boolean
  esAdmin: () => boolean
}

const defaultUser: CurrentUser = {
  nombre: 'Juan Andres',
  apellido: 'Arango Velasquez',
  usuario: 'jarango',
  rol: 'Admin',
  correo: 'jarango@empresa.com',
  permisos: permisosAdmin(),
}

export const useCurrentUserStore = create<CurrentUserState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: { nombre: '', apellido: '', usuario: '', rol: '', correo: '', permisos: [] } }),
      puedeLeer: (modulo) => {
        const u = get().user
        if (u.rol.toLowerCase() === 'admin' || u.rol.toLowerCase() === 'administrador') return true
        return u.permisos.find(p => p.modulo === modulo)?.leer ?? false
      },
      puedeEditar: (modulo) => {
        const u = get().user
        if (u.rol.toLowerCase() === 'admin' || u.rol.toLowerCase() === 'administrador') return true
        return u.permisos.find(p => p.modulo === modulo)?.editar ?? false
      },
      puedeEliminar: (modulo) => {
        const u = get().user
        if (u.rol.toLowerCase() === 'admin' || u.rol.toLowerCase() === 'administrador') return true
        return u.permisos.find(p => p.modulo === modulo)?.eliminar ?? false
      },
      esAdmin: () => {
        const rol = get().user.rol.toLowerCase()
        return rol === 'admin' || rol === 'administrador'
      },
    }),
    {
      name: 'current-user-storage',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<CurrentUserState>
        return {
          ...current,
          ...p,
          user: {
            ...defaultUser,
            ...(p.user ?? {}),
            permisos: p.user?.permisos?.length ? p.user.permisos : permisosAdmin(),
          },
        }
      },
    }
  )
)
