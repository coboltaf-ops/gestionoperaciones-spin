'use client'

import { useTipoInventarioSesion } from '../store/tipo-inventario-store'
import { useReferenceStore } from '@/features/referencias/store/reference-store'
import { useCompanyLogo } from '@/shared/hooks/use-company-logo'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'

export function TipoInventarioModal() {
  const tipoActivo = useTipoInventarioSesion(s => s.tipoActivo)
  const setTipoActivo = useTipoInventarioSesion(s => s.setTipoActivo)
  const refData = useReferenceStore(s => s.data)
  const companyLogo = useCompanyLogo()
  const empresaNombre = useEmpresaStore(s => s.empresas[0]?.nombre)

  if (tipoActivo !== null) return null

  const tiposActivos = refData.tipo_inventario.filter(t => t.situacion)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(96,165,250,0.4)' }}>
        <div className="text-center mb-6">
          {companyLogo && (
            <img
              src={companyLogo}
              alt={empresaNombre || 'Logo Empresa'}
              style={{ maxWidth: 180, maxHeight: 120, margin: '0 auto 12px', display: 'block', objectFit: 'contain' }}
            />
          )}
          {empresaNombre && <h1 className="text-base font-bold text-white mb-3">{empresaNombre}</h1>}
          <h2 className="text-xl font-bold text-white mb-1">Tipo de Inventario de Trabajo</h2>
          <p className="text-white/60 text-sm">¿Con qué tipo de inventario vas a trabajar en esta sesión?</p>
        </div>
        <div className="flex flex-col gap-3">
          {tiposActivos.map(t => (
            <button
              key={t.id}
              onClick={() => setTipoActivo(t.descripcion)}
              className="w-full px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(96,165,250,0.4)', border: '1px solid rgba(96,165,250,0.5)' }}
            >
              {t.descripcion}
            </button>
          ))}
        </div>
        <p className="text-white/40 text-xs text-center mt-5">Todas las operaciones de la sesión se acotarán a este tipo. Puedes cambiarlo desde la barra superior.</p>
      </div>
    </div>
  )
}
