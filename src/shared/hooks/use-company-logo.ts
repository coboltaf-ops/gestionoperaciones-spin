'use client'

import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { LOGO_BASE64 } from '@/shared/lib/logo-base64'

/**
 * Devuelve el logo de la empresa configurada en Datos Empresa.
 * Si no hay logo cargado, devuelve el LOGO de Spin (/spin-logo.png).
 */
export function useCompanyLogo(): string {
  const empresa = useEmpresaStore(s => s.empresas[0])
  return empresa?.logo || '/spin-logo.png'
}
