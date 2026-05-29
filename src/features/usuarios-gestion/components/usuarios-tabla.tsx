'use client'

import { useState, useMemo } from 'react'
import {
  ROLES_LABELS, ESTADOS_CONFIG,
  type Rol, type Estado, type Usuario,
} from '../types'
import VoiceSearchButton from '@/shared/components/voice-search-button'

interface Props {
  usuarios: Usuario[]
  esAdmin: boolean
  onNew: () => void
  onEdit: (u: Usuario) => void
  onDelete: (u: Usuario) => void
  onView: (u: Usuario) => void
}

export function UsuariosTabla({ usuarios, esAdmin, onNew, onEdit, onDelete, onView }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return usuarios
    const q = search.toLowerCase()
    return usuarios.filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.apellido.toLowerCase().includes(q) ||
      u.usuario.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q)
    )
  }, [usuarios, search])

  const stats = useMemo(() => ({
    total: usuarios.length,
    activos: usuarios.filter(u => u.situacion === 'Activo').length,
    inactivos: usuarios.filter(u => u.situacion === 'Inactivo').length,
    bloqueados: usuarios.filter(u => u.situacion === 'Bloqueado').length,
  }), [usuarios])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: stats.total, color: '#60a5fa', icon: '👥' },
          { label: 'Activos', value: stats.activos, color: '#60a5fa', icon: '✅' },
          { label: 'Inactivos', value: stats.inactivos, color: '#f59e0b', icon: '⏸️' },
          { label: 'Bloqueados', value: stats.bloqueados, color: '#ef4444', icon: '🚫' },
        ].map(({ label, value, color, icon }) => (
          <div
            key={label}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <p className="text-xs text-white/50 uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 max-w-sm">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl px-4 py-2 text-white outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              placeholder="Buscar por nombre, usuario o correo..."
            />
            <VoiceSearchButton onResult={setSearch} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-white/40">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
            {esAdmin && (
              <button
                onClick={onNew}
                className="px-4 py-2 rounded-xl font-bold text-white text-xs"
                style={{ background: '#1e3a8a', border: '1px solid #1e3a8a' }}
              >
                + Nuevo Usuario
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left">
          <thead style={{ background: '#1e3a8a' }}>
            <tr>
              {['Usuario', 'Nombre Completo', 'Correo', 'Rol', 'Estado', 'Acciones'].map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-white"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const sitConf = ESTADOS_CONFIG[u.situacion as Estado]
              return (
                <tr key={u.id} className="hover:bg-white/5 transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-5 py-4 font-mono font-medium text-white text-sm">{u.usuario}</td>
                  <td className="px-5 py-4 text-white/80">{u.nombre} {u.apellido}</td>
                  <td className="px-5 py-4 text-white/60 text-sm">{u.correo}</td>
                  <td className="px-5 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(96,165,250,0.2)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.3)' }}
                    >
                      {ROLES_LABELS[u.rol as Rol] ?? u.rol}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={sitConf ? { background: sitConf.bg, color: sitConf.color, border: `1px solid ${sitConf.border}` } : {}}
                    >
                      {sitConf?.label ?? u.situacion}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(u)}
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(96,165,250,0.2)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.3)' }}
                      >
                        Ver
                      </button>
                      {esAdmin && (
                        <>
                          <button
                            onClick={() => onEdit(u)}
                            className="px-3 py-1 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onDelete(u)}
                            className="px-3 py-1 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
