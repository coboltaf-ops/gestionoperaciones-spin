'use client'

import { useTipoInventarioSesion } from '../store/tipo-inventario-store'

export function TipoInventarioBadge() {
  const tipoActivo = useTipoInventarioSesion(s => s.tipoActivo)
  const setTipoActivo = useTipoInventarioSesion(s => s.setTipoActivo)

  if (!tipoActivo) return null

  return (
    <button
      onClick={() => setTipoActivo(null)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
      style={{ background: 'rgba(96,165,250,0.25)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.4)' }}
      title="Click para cambiar el tipo de inventario activo"
    >
      <span>📦 {tipoActivo}</span>
      <span className="text-white/60">▾</span>
    </button>
  )
}
