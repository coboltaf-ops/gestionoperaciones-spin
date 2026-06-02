import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type SaldoBodega = {
  producto_id: string
  codigo: string
  descripcion: string
  unidad_medida: string
  existencia: number
  costo_promedio: number
  valor_existencia: number
}

export type TipoMovimientoBodega =
  | 'Carga Inicial de Saldos'
  | 'Recepción Factura'
  | 'Transferencia Entrada'
  | 'Transferencia Salida'
  | 'Entrada por Ajuste'
  | 'Salida por Ajuste'
  | 'Salida a Centro de Costo'

export type MovimientoBodega = {
  // Identificación
  id: string
  fecha: string
  tipo: TipoMovimientoBodega
  documento_origen: string              // RF-00001, TRF-00002, AJU-00003, SAL-00001

  // Producto
  producto_id: string
  producto_codigo: string
  producto_descripcion: string
  unidad_medida: string

  // Movimiento
  cantidad: number                      // positivo = entrada, negativo = salida
  costo_promedio: number                // CP del producto en la bodega DESPUES del movimiento
  valor: number                         // cantidad × costo_promedio

  // Auditoría: estado ANTES y DESPUES del movimiento
  existencia_anterior?: number
  existencia_despues?: number
  cp_anterior?: number

  // Contexto de la operación (opcionales segun tipo)
  proveedor?: string                    // Recepción Factura
  nro_factura?: string                  // Recepción Factura
  nro_orden_compra?: string             // Recepción Factura
  bodega_origen?: string                // Transferencia
  bodega_destino?: string               // Transferencia
  centro_costo?: string                 // Salida a Centro de Costo
  motivo_ajuste?: string                // Ajuste de Inventario
  persona_emite?: string                // Quien despacha o autoriza
  persona_recibe?: string               // Quien recibe

  // Notas
  observaciones?: string
}

export type Bodega = {
  id: string
  nombre: string
  correo: string
  telefono: string
  direccion: string
  ciudad: string
  pais: string
  tipo_inventario: string
  situacion: string
  saldos?: SaldoBodega[]
  movimientos?: MovimientoBodega[]
}

interface BodegasState {
  bodegas: Bodega[]
  addBodega: (b: Bodega) => void
  updateBodega: (id: string, b: Partial<Bodega>) => void
  deleteBodega: (id: string) => void
}

export const useBodegasStore = create<BodegasState>()(
  persist(
    (set) => ({
      bodegas: [],
      addBodega: (b) => set((s) => ({ bodegas: [...s.bodegas, b] })),
      updateBodega: (id, b) => set((s) => ({ bodegas: s.bodegas.map((r) => r.id === id ? { ...r, ...b } : r) })),
      deleteBodega: (id) => set((s) => ({ bodegas: s.bodegas.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'bodegas-storage' }
  )
)
