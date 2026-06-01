/**
 * Formulación (BOM - Bill of Materials)
 * Define qué Materia Prima se necesita para fabricar 1 unidad de Producto Terminado
 */

export type RenglonFormulacion = {
  id: string
  formulacion_id: string
  producto_id: string
  producto_codigo: string
  producto_nombre: string
  unidad_medida: string
  cantidad_necesaria: number // cantidad de este producto para 1 unidad del PT
  numero_renglon: number
  created_at?: string
  updated_at?: string
}

export type Formulacion = {
  id: string
  nro_formula: number
  consecutivo: string // FORM-00001

  // Producto Terminado
  producto_terminado_id: string
  producto_terminado_codigo: string
  producto_terminado_nombre: string
  unidad_medida: string

  // Metadatos
  nombre_formula?: string
  descripcion?: string

  // Renglones (Materia Prima que se necesita)
  renglones: RenglonFormulacion[]

  // Estado
  situacion: 'Activa' | 'Inactiva'

  // Auditoría
  created_at?: string
  updated_at?: string
  empresa_id: string
}

// Form data para crear/editar
export type FormulacionFormData = Pick<
  Formulacion,
  | 'producto_terminado_id'
  | 'producto_terminado_codigo'
  | 'producto_terminado_nombre'
  | 'unidad_medida'
  | 'nombre_formula'
  | 'descripcion'
  | 'renglones'
>

// Filters para lista
export type FormulacionFilters = {
  producto_terminado_id?: string
  situacion?: Formulacion['situacion']
  search?: string
}
