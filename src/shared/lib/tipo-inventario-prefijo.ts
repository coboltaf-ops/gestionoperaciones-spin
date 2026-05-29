// Helpers compartidos para mapear Tipo de Inventario ↔ Prefijo de código de producto

export const prefixForTipo = (tipo: string): string => {
  const t = (tipo || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (t.includes('materia prima')) return 'MAP'
  if (t.includes('producto terminado')) return 'PTER'
  if (t.includes('semi elaborado')) return 'PSEL'
  if (t.includes('servicio')) return 'SERV'
  return 'PROD' // Materiales y Suministros, Mercancía, etc.
}

export const codigoMatchesTipo = (codigo: string, tipo: string): boolean => {
  if (!tipo) return true
  const prefix = prefixForTipo(tipo)
  return codigo.startsWith(`${prefix}-`)
}
