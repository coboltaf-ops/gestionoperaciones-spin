'use client'

import { useState, useCallback } from 'react'
import {
  ESTADOS, ESTADOS_CONFIG,
  MODULOS, permisosAdmin, permisosSoloLectura,
  type Estado, type PermisoModulo, type Usuario,
} from '../types'
import { useReferenceStore } from '@/features/referencias/store/reference-store'

interface Props {
  usuario?: Usuario | null
  onSubmit: (usuario: Usuario) => void
  onClose: () => void
}

const inputSt: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff',
}
const selectSt: React.CSSProperties = {
  background: 'rgba(12,26,61,0.9)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff',
}
const checkboxSt: React.CSSProperties = {
  accentColor: '#60a5fa',
  width: 18,
  height: 18,
  cursor: 'pointer',
}

export function UsuarioForm({ usuario, onSubmit, onClose }: Props) {
  const isEdit = !!usuario?.id
  const rolesRef = useReferenceStore(s => s.data.roles).filter(r => r.situacion)
  const [form, setForm] = useState<Usuario>(
    usuario ?? {
      id: '',
      nombre: '',
      apellido: '',
      usuario: '',
      clave: '',
      correo: '',
      rol: rolesRef[0]?.descripcion ?? '',
      situacion: 'Activo',
      permisos: permisosSoloLectura(),
    }
  )
  const [showClave, setShowClave] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdminRol = form.rol === 'Admin'
  const displayPermisos: PermisoModulo[] = isAdminRol ? permisosAdmin() : form.permisos

  const handlePermisoChange = useCallback(
    (moduloId: string, campo: 'leer' | 'registrar' | 'editar' | 'eliminar', checked: boolean) => {
      setForm(prev => ({
        ...prev,
        permisos: prev.permisos.map(p =>
          p.modulo === moduloId ? { ...p, [campo]: checked } : p
        ),
      }))
    },
    []
  )

  const handleRolChange = useCallback((newRol: string) => {
    setForm(prev => ({
      ...prev,
      rol: newRol,
      permisos: newRol === 'Admin' ? permisosAdmin() : prev.permisos,
    }))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.nombre.trim() || !form.usuario.trim() || !form.rol) {
      setError('Nombre, usuario y rol son obligatorios')
      return
    }
    if (!isEdit && !form.clave) {
      setError('La clave es obligatoria para nuevos usuarios')
      return
    }

    const permisosToSave = isAdminRol ? permisosAdmin() : form.permisos
    onSubmit({ ...form, permisos: permisosToSave })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ background: '#1e3a8a' }}
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white text-lg font-bold">
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 outline-none text-sm"
                style={inputSt}
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Apellido <span className="text-red-400">*</span>
              </label>
              <input
                value={form.apellido}
                onChange={e => setForm({ ...form, apellido: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 outline-none text-sm"
                style={inputSt}
                placeholder="Perez"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Usuario <span className="text-red-400">*</span>
              </label>
              <input
                value={form.usuario}
                onChange={e => setForm({ ...form, usuario: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 outline-none text-sm"
                style={inputSt}
                placeholder="nombre.apellido"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                {isEdit ? 'Nueva Clave (vacío = mantener)' : 'Clave'} {!isEdit && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showClave ? 'text' : 'password'}
                  value={form.clave}
                  onChange={e => setForm({ ...form, clave: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 pr-14 outline-none text-sm"
                  style={inputSt}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowClave(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-xs"
                >
                  {showClave ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Correo <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 outline-none text-sm"
                style={inputSt}
                placeholder="correo@empresa.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Rol <span className="text-red-400">*</span>
              </label>
              <select
                value={form.rol}
                onChange={e => handleRolChange(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 outline-none text-sm"
                style={selectSt}
              >
                <option value="" disabled>Seleccionar...</option>
                {rolesRef.map(r => (
                  <option key={r.id} value={r.descripcion}>{r.descripcion}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Estado</label>
              <select
                value={form.situacion}
                onChange={e => setForm({ ...form, situacion: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 outline-none text-sm"
                style={selectSt}
              >
                {ESTADOS.map(e => (
                  <option key={e} value={e}>{ESTADOS_CONFIG[e].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Permisos por Módulo */}
          <div
            className="mt-4 rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h3 className="text-xs font-semibold text-white/80 mb-3 uppercase tracking-wider">
              Permisos por Módulo
            </h3>
            {isAdminRol && (
              <p className="text-xs text-blue-400 mb-3">
                El rol Admin tiene todos los permisos habilitados automáticamente.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Módulo</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 w-16">Leer</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 w-16">Registrar</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 w-16">Editar</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 w-16">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULOS.map((mod, idx) => {
                    const perm = displayPermisos.find(p => p.modulo === mod.id) ?? {
                      modulo: mod.id, leer: false, registrar: false, editar: false, eliminar: false,
                    }
                    return (
                      <tr key={mod.id} style={{ borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                        <td className="px-3 py-2 text-white/80 text-xs">{mod.label}</td>
                        {(['leer', 'registrar', 'editar', 'eliminar'] as const).map(campo => (
                          <td key={campo} className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={perm[campo]}
                              disabled={isAdminRol}
                              onChange={e => handlePermisoChange(mod.id, campo, e.target.checked)}
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

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-white/70 text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: '#1e3a8a', border: '1px solid #1e3a8a' }}
            >
              {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
