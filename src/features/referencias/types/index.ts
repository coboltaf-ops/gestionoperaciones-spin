import { z } from 'zod'

// Base Schema para tablas de referencias (id, descripcion, situacion)
export const BaseReferenceSchema = z.object({
  id: z.string().uuid().optional(), // Opcional para creación
  descripcion: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
  situacion: z.boolean().default(true),
  tipo: z.enum(['+', '-']).optional(), // Usado solo en tipo_ajuste
  detalle: z.string().optional(), // Usado solo en referencia_proveedor
  created_at: z.string().datetime().optional()
})

// Tipos base deducidos
export type BaseReference = z.infer<typeof BaseReferenceSchema>

// Especificidades (si aplican)
export const CondicionPagoSchema = BaseReferenceSchema.extend({
  dias: z.number().int().min(0, 'Los días no pueden ser negativos').default(0)
})

export type CondicionPago = z.infer<typeof CondicionPagoSchema>

export const TipoMonedaSchema = BaseReferenceSchema.extend({
  simbolo: z.string().min(1, 'Se requiere símbolo')
})

export type TipoMoneda = z.infer<typeof TipoMonedaSchema>

export const referenceTablesList = [
  { id: 'categoria', label: 'Categorías' },
  { id: 'grupo', label: 'Grupos' },
  { id: 'subgrupo', label: 'Sub-Grupos' },
  { id: 'unidad_medida', label: 'Unidades de Medida' },
  { id: 'tipo_inventario', label: 'Tipos de Inventario' },
  { id: 'tipo_moneda', label: 'Tipos de Moneda' },
  { id: 'actividad_proveedor', label: 'Actividad Proveedor' },
  { id: 'condiciones_pago', label: 'Condiciones de Pago' },
  { id: 'situacion_producto', label: 'Situación Producto' },
  { id: 'situacion_orden_compra', label: 'Situación Orden Compra' },
  { id: 'situacion_bodega', label: 'Situación Bodega' },
  { id: 'situacion_proveedor', label: 'Situación Proveedor' },
  { id: 'tipo_identificacion', label: 'Tipo de Identificación' },
  { id: 'tipo_ajuste', label: 'Tipos de Ajuste' },
  { id: 'referencia_proveedor', label: 'Referencia Proveedor' },
  { id: 'impuesto', label: 'Impuestos (%)' },
  { id: 'ciudad', label: 'Ciudades' },
  { id: 'pais', label: 'Países' },
  { id: 'roles', label: 'Roles' },
  { id: 'estado_recepcion_factura', label: 'Estado Recepción Facturas' },
  { id: 'situacion_tarea', label: 'Situación Tarea' },
] as const

export type ReferenceTableId = typeof referenceTablesList[number]['id']
