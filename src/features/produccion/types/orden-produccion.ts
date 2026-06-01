/**
 * Orden de Producción - Especificación José
 * Campos: Consecutivo OP-001, Cliente, Fecha Registro, Cantidad Producir, etc
 * Situaciones: Solicitada, Ejecutada, Cancelada
 */

export type OrdenProduccionV2 = {
  id: string
  nro_orden: number
  consecutivo: string // OP-00001

  // Campos obligatorios
  fecha_registro: string // YYYY-MM-DD
  cliente_id: string
  cliente_nombre: string
  cantidad_a_producir: number // Kgs

  // Campos adicionales
  producto_id?: string
  producto_nombre?: string
  fecha_real_produccion?: string // YYYY-MM-DD
  preparada_por?: string // User ID
  cantidad_real_producida: number // Kgs
  observaciones?: string

  // Situación
  situacion: 'Solicitada' | 'Ejecutada' | 'Cancelada'

  // Auditoría
  created_at?: string
  updated_at?: string
  empresa_id: string
}

// Form data (subset of required fields)
export type OrdenProduccionFormData = Pick<
  OrdenProduccionV2,
  | 'fecha_registro'
  | 'cliente_id'
  | 'cliente_nombre'
  | 'cantidad_a_producir'
  | 'producto_id'
  | 'producto_nombre'
  | 'observaciones'
>

// Filters for list page
export type OrdenProduccionFilters = {
  cliente_id?: string
  producto_id?: string
  situacion?: OrdenProduccionV2['situacion']
  fecha_desde?: string
  fecha_hasta?: string
}
