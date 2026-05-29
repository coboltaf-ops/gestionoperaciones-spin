import { useCurrentUserStore } from '@/features/usuarios/store/current-user-store'
import { type ModuloId } from '@/features/usuarios-gestion/types'

export function usePermisos(modulo: ModuloId) {
  const user = useCurrentUserStore(s => s.user)
  const rol = user.rol?.toLowerCase() || ''
  const isAdmin = rol === 'admin' || rol === 'administrador'

  const permiso = user.permisos?.find(p => p.modulo === modulo)

  return {
    leer: isAdmin || (permiso?.leer ?? false),
    registrar: isAdmin || (permiso?.registrar ?? false),
    editar: isAdmin || (permiso?.editar ?? false),
    eliminar: isAdmin || (permiso?.eliminar ?? false),
    esAdmin: isAdmin,
  }
}
