'use client'

import { useState } from 'react'
import {
  MODULOS, permisosAdmin, permisosSoloLectura,
  type PermisoModulo,
} from '../types'
import { type Usuario } from '../types'
import { useReferenceStore } from '@/features/referencias/store/reference-store'

interface Props {
  usuarios: Usuario[]
  onUpdateUsuario: (id: string, data: Partial<Usuario>) => void
}

const checkboxSt: React.CSSProperties = {
  accentColor: '#60a5fa',
  width: 18,
  height: 18,
  cursor: 'pointer',
}

export function PermisosMatriz({ usuarios, onUpdateUsuario }: Props) {
  const rolesRef = useReferenceStore(s => s.data.roles).filter(r => r.situacion)
  const [rolActivo, setRolActivo] = useState<string>(rolesRef[0]?.descripcion ?? 'Admin')

  const isAdmin = rolActivo === 'Admin'

  // Tomar permisos del primer usuario con este rol
  const usuarioDelRol = usuarios.find(u => u.rol === rolActivo)
  const permisosDelRol: PermisoModulo[] = isAdmin
    ? permisosAdmin()
    : (usuarioDelRol?.permisos ?? permisosSoloLectura())

  const handleToggle = (moduloId: string, campo: 'leer' | 'registrar' | 'editar' | 'eliminar') => {
    if (isAdmin) return
    const nuevosPermisos = permisosDelRol.map(p =>
      p.modulo === moduloId ? { ...p, [campo]: !p[campo] } : p
    )
    // Actualizar TODOS los usuarios con este rol
    usuarios.filter(u => u.rol === rolActivo).forEach(u => {
      onUpdateUsuario(u.id, { permisos: nuevosPermisos })
    })
  }

  return (
    <div className="space-y-4">
      {/* Selector de rol */}
      <div className="flex items-center gap-2 flex-wrap">
        {rolesRef.map(r => (
          <button
            key={r.id}
            onClick={() => setRolActivo(r.descripcion)}
            className="px-4 py-2 text-sm font-semibold rounded-xl transition-all"
            style={rolActivo === r.descripcion
              ? { background: '#1e3a8a', color: '#fff', border: '1px solid #1e3a8a' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            {r.descripcion}
          </button>
        ))}
      </div>

      {isAdmin && (
        <p className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-xl px-4 py-2">
          El rol Administrador tiene acceso total a todos los módulos. Los permisos no se pueden modificar.
        </p>
      )}

      {!usuarioDelRol && !isAdmin && (
        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2">
          No hay usuarios con el rol &quot;{rolActivo}&quot;. Crea un usuario con este rol para configurar sus permisos.
        </p>
      )}

      {/* Matriz */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <table className="w-full text-sm">
          <thead style={{ background: '#1e3a8a' }}>
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide w-48">Módulo</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white uppercase tracking-wide">Leer</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white uppercase tracking-wide">Registrar</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white uppercase tracking-wide">Editar</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-white uppercase tracking-wide">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {MODULOS.map((mod, idx) => {
              const perm = permisosDelRol.find(p => p.modulo === mod.id) ?? {
                modulo: mod.id, leer: false, registrar: false, editar: false, eliminar: false,
              }
              return (
                <tr key={mod.id} className="hover:bg-white/5 transition-colors" style={{ borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                  <td className="px-5 py-3 text-white/80 font-medium">{mod.label}</td>
                  {(['leer', 'registrar', 'editar', 'eliminar'] as const).map(campo => (
                    <td key={campo} className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={perm[campo]}
                        disabled={isAdmin || !usuarioDelRol}
                        onChange={() => handleToggle(mod.id, campo)}
                        style={checkboxSt}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
