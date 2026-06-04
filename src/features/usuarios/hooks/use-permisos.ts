'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth-store'

export interface Permiso {
  modulo_id: string
  leer: boolean
  crear: boolean
  editar: boolean
  eliminar: boolean
}

export type AccionPermiso = 'leer' | 'crear' | 'editar' | 'eliminar'

/**
 * Hook para verificar permisos del usuario actual
 * Lee los permisos obtenidos en el login desde Supabase
 */
export function usePermisos() {
  const user = useAuthStore(state => state.user)
  const [permisos, setPermisos] = useState<Map<string, Permiso>>(new Map())

  useEffect(() => {
    if (!user?.permisos || user.permisos.length === 0) {
      setPermisos(new Map())
      return
    }

    const permisosMap = new Map<string, Permiso>()
    for (const p of user.permisos) {
      permisosMap.set(p.modulo_id, p)
    }
    setPermisos(permisosMap)
  }, [user?.permisos])

  const tiene = (modulo: string, accion: AccionPermiso): boolean => {
    const permiso = permisos.get(modulo)
    if (!permiso) return false
    return permiso[accion] === true
  }

  const puedeVer = (modulo: string): boolean => tiene(modulo, 'leer')
  const puedeCrear = (modulo: string): boolean => tiene(modulo, 'crear')
  const puedeEditar = (modulo: string): boolean => tiene(modulo, 'editar')
  const puedeEliminar = (modulo: string): boolean => tiene(modulo, 'eliminar')

  return {
    permisos,
    tiene,
    puedeVer,
    puedeCrear,
    puedeEditar,
    puedeEliminar
  }
}
