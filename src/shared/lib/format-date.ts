const TIMEZONE = 'America/Bogota'

/**
 * Converts ISO date string (YYYY-MM-DD) to display format (DD/MM/AAAA).
 * Returns '—' for empty/invalid values.
 */
export function fDate(value?: string | null): string {
  if (!value) return '—'
  const [y, m, d] = value.split('-')
  if (!y || !m || !d) return value
  return `${d}/${m}/${y}`
}

/**
 * Obtiene la fecha actual en zona Colombia (YYYY-MM-DD)
 */
export function todayColombia(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE })
}

/**
 * Formatea fecha y hora en zona Colombia
 */
export function formatDateTimeCO(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('es-CO', { timeZone: TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/**
 * Fecha actual formateada para reportes (DD/MM/YYYY)
 */
export function todayDisplayCO(): string {
  return new Date().toLocaleDateString('es-CO', { timeZone: TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric' })
}
