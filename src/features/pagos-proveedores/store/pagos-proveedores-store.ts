import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Tipos ───────────────────────────────────────────────────────────────

export type FacturaProveedor = {
  id: string
  nro_correlativo: number
  consecutivo: string                  // FAC-PRO-00001
  fecha_registro: string               // automática (hoy)
  nro_factura: string
  fecha_emision: string
  fecha_vencimiento: string
  proveedor: string
  tipo_moneda: string
  bodega_llegada: string
  condicion_pago: string
  comprador: string
  orden_compra_consecutivo: string
  centro_costo: string
  autorizado: string
  monto_sin_impuesto: number
  retencion_fuente: number
  retencion_iva: number
  pct_iva: number
  monto_iva: number
  monto_total: number                  // total NETO a pagar = sin_impuesto + iva − retenciones
  concepto: string
  observaciones: string
  estado: 'Pendiente' | 'Pagada Parcial' | 'Pagada' | 'Anulada'
  saldo_pendiente: number              // monto_total - pagos aplicados
  anticipo?: number                    // anticipo previo a la factura (default 0)
  origen_recepcion_id?: string         // RF de origen si vino traída automáticamente
  origen_recepcion_consecutivo?: string
}

export type RenglonPago = {
  factura_id: string
  factura_consecutivo: string
  nro_factura: string
  concepto: string
  monto_sin_impuesto: number
  monto_iva: number
  retencion_fuente: number
  retencion_iva: number
  anticipo: number
  neto_a_pagar: number               // = monto_total - anticipo - retenciones
  monto_aplicado: number             // lo que se paga ahora (puede ser parcial)
}

export type AnticipoProveedor = {
  id: string
  nro_correlativo: number
  consecutivo: string                  // ANT-PRO-00001
  fecha_registro: string               // automática (hoy)
  proveedor: string
  monto: number                        // monto entregado al proveedor
  saldo_disponible: number             // monto - lo aplicado en pagos
  forma_pago: string
  banco: string
  nro_referencia: string
  persona_aprueba: string              // quién aprobó el anticipo
  concepto: string
  observaciones: string
  tipo_inventario: string
  estado: 'Disponible' | 'Aplicado Parcial' | 'Aplicado Total' | 'Anulado'
}

export type AnticipoAplicado = {
  anticipo_id: string
  anticipo_consecutivo: string
  monto_aplicado: number
}

export type PagoProveedor = {
  id: string
  nro_correlativo: number
  consecutivo: string                  // PAG-PRO-00001
  fecha_registro: string
  proveedor: string
  facturas_aplicadas: RenglonPago[]
  anticipos_aplicados?: AnticipoAplicado[]   // anticipos usados en este pago
  forma_pago: string
  banco: string
  nro_referencia: string
  monto_total: number                  // total efectivo (luego de descontar anticipos)
  monto_anticipos_aplicados?: number   // suma de los anticipos consumidos en este pago
  observaciones: string
  estado: 'Registrado' | 'Anulado'
}

export type NotaContable = {
  id: string
  nro_correlativo: number
  consecutivo: string                  // ND-PRO-00001 / NC-PRO-00001
  tipo: 'Debito' | 'Credito'
  fecha_registro: string
  proveedor: string
  factura_referencia_id: string
  factura_referencia_consecutivo: string
  motivo: string
  monto: number
  observaciones: string
  tipo_inventario: string
  estado: 'Aplicada' | 'Anulada'
}

// ─── Store ────────────────────────────────────────────────────────────────

interface PagosProveedoresState {
  facturas: FacturaProveedor[]
  pagos: PagoProveedor[]
  anticipos: AnticipoProveedor[]
  notas: NotaContable[]
  // Facturas
  addFactura: (f: FacturaProveedor) => void
  updateFactura: (id: string, f: Partial<FacturaProveedor>) => void
  deleteFactura: (id: string) => void
  deleteAllFacturas: () => void
  // Pagos
  addPago: (p: PagoProveedor) => void
  updatePago: (id: string, p: Partial<PagoProveedor>) => void
  deletePago: (id: string) => void
  // Anticipos
  addAnticipo: (a: AnticipoProveedor) => void
  updateAnticipo: (id: string, a: Partial<AnticipoProveedor>) => void
  deleteAnticipo: (id: string) => void
  // Notas
  addNota: (n: NotaContable) => void
  updateNota: (id: string, n: Partial<NotaContable>) => void
  deleteNota: (id: string) => void
}

export const usePagosProveedoresStore = create<PagosProveedoresState>()(
  persist(
    (set) => ({
      facturas: [],
      pagos: [],
      anticipos: [],
      notas: [],
      addFactura: (f) => set((s) => ({ facturas: [...s.facturas, f] })),
      updateFactura: (id, f) => set((s) => ({ facturas: s.facturas.map((r) => r.id === id ? { ...r, ...f } : r) })),
      deleteFactura: (id) => set((s) => ({ facturas: s.facturas.filter((r) => r.id !== id) })),
      deleteAllFacturas: () => set({ facturas: [] }),
      addPago: (p) => set((s) => ({ pagos: [...s.pagos, p] })),
      updatePago: (id, p) => set((s) => ({ pagos: s.pagos.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deletePago: (id) => set((s) => ({ pagos: s.pagos.filter((r) => r.id !== id) })),
      addAnticipo: (a) => set((s) => ({ anticipos: [...s.anticipos, a] })),
      updateAnticipo: (id, a) => set((s) => ({ anticipos: s.anticipos.map((r) => r.id === id ? { ...r, ...a } : r) })),
      deleteAnticipo: (id) => set((s) => ({ anticipos: s.anticipos.filter((r) => r.id !== id) })),
      addNota: (n) => set((s) => ({ notas: [...s.notas, n] })),
      updateNota: (id, n) => set((s) => ({ notas: s.notas.map((r) => r.id === id ? { ...r, ...n } : r) })),
      deleteNota: (id) => set((s) => ({ notas: s.notas.filter((r) => r.id !== id) })),
    }),
    { name: 'pagos-proveedores-storage' }
  )
)

// ─── Helpers ──────────────────────────────────────────────────────────────

export const nextFacturaConsecutivo = (facturas: FacturaProveedor[]): string => {
  const maxNum = facturas.reduce((max, f) => Math.max(max, f.nro_correlativo || 0), 0)
  return `FAC-PRO-${String(maxNum + 1).padStart(5, '0')}`
}

export const nextPagoConsecutivo = (pagos: PagoProveedor[]): string => {
  const maxNum = pagos.reduce((max, p) => Math.max(max, p.nro_correlativo || 0), 0)
  return `PAG-PRO-${String(maxNum + 1).padStart(5, '0')}`
}

export const nextAnticipoConsecutivo = (anticipos: AnticipoProveedor[]): string => {
  const maxNum = anticipos.reduce((max, a) => Math.max(max, a.nro_correlativo || 0), 0)
  return `ANT-PRO-${String(maxNum + 1).padStart(5, '0')}`
}

export const nextNotaConsecutivo = (notas: NotaContable[], tipo: 'Debito' | 'Credito'): string => {
  const prefix = tipo === 'Debito' ? 'ND-PRO' : 'NC-PRO'
  const filtered = notas.filter(n => n.tipo === tipo)
  const maxNum = filtered.reduce((max, n) => Math.max(max, n.nro_correlativo || 0), 0)
  return `${prefix}-${String(maxNum + 1).padStart(5, '0')}`
}
