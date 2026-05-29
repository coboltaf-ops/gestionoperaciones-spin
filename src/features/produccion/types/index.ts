/** Ingrediente de una fórmula */
export type Ingrediente = {
  id: string
  producto_id: string
  codigo: string
  descripcion: string
  cantidad: number
  unidad_medida: string
}

/** Fórmula / Receta de producción (BOM) */
export type Formula = {
  id: string
  nro_formula: number
  consecutivo: string // FORM-00001
  producto_terminado_id: string
  producto_terminado_codigo: string
  producto_terminado_nombre: string
  nombre_formula: string
  descripcion: string
  cantidad_produce: number // cuántas unidades del PT produce esta fórmula
  unidad_medida: string
  ingredientes: Ingrediente[]
  situacion: string // Activa, Inactiva
}

/** Detalle de una orden de producción */
export type LineaOrdenProduccion = {
  id: string
  producto_id: string
  codigo: string
  descripcion: string
  cantidad_requerida: number
  cantidad_usada: number
  unidad_medida: string
  ajustado: boolean
}

/** Orden de Producción */
export type OrdenProduccion = {
  id: string
  nro_orden: number
  consecutivo: string // OPR-00001
  fecha_emision: string
  fecha_programada: string
  fecha_ejecucion: string
  formula_id: string
  formula_nombre: string
  producto_terminado_id: string
  producto_terminado_codigo: string
  producto_terminado_nombre: string
  cantidad_a_producir: number
  cantidad_producida: number
  unidad_medida: string
  lineas: LineaOrdenProduccion[]
  responsable: string
  observaciones: string
  situacion: string // Pendiente, En Proceso, Completada, Cancelada
}

/** Ajuste de Materia Prima */
export type AjusteMateriaPrima = {
  id: string
  nro_ajuste: number
  consecutivo: string // AMP-00001
  fecha: string
  producto_id: string
  producto_codigo: string
  producto_nombre: string
  tipo_ajuste: string // Entrada, Salida
  cantidad: number
  unidad_medida: string
  motivo: string
  referencia: string // OPR-00001 o libre
  responsable: string
  observaciones: string
}
