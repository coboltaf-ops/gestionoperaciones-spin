'use client'

import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { LOGO_BASE64 } from '@/shared/lib/logo-base64'

/**
 * Devuelve el logo Spin
 */
export function useCompanyLogo(): string {
  return '/spin-logo.png'
}
