import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── Tipos (estructuras base — campos definitivos llegan después) ─────────────

export type Banco = {
  id: string
  nombre_banco: string                 // Bancolombia, Davivienda, etc.
  tipo_cuenta: string                  // Ahorros, Corriente, Crédito, etc.
  nro_cuenta: string                   // Número de cuenta bancaria
  fecha_saldo: string                  // Fecha del saldo informado (YYYY-MM-DD)
  saldo: number                        // Saldo actual de la cuenta
  estado: 'Activo' | 'Inactivo'
}

export type Chequera = {
  id: string
  nro_correlativo: number
  consecutivo: string                  // CHQ-00001
  banco_id: string
  banco_nombre: string
  tipo_inventario: string
  estado: 'Activa' | 'Agotada' | 'Anulada'
}

export type Deposito = {
  id: string
  nro_correlativo: number
  consecutivo: string                  // DEP-00001
  fecha_registro: string               // Fecha en que se hace el depósito
  banco_id: string                     // FK al Banco
  banco_descripcion: string            // "Bancolombia · Ahorros · 1234567890" (snapshot)
  origen: string                       // Efectivo, Transferencia, Cheque, Consignación, ACH, Otro
  monto: number                        // Monto depositado
  nro_referencia: string               // N° comprobante / consignación / cheque
  depositado_por: string               // Persona que realiza el depósito
  concepto: string                     // De qué proviene el ingreso (venta, devolución, ajuste, etc.)
  observaciones: string
  estado: 'Registrado' | 'Anulado'
}

export type MovimientoBancario = {
  id: string
  nro_correlativo: number
  consecutivo: string                  // MOV-00001
  fecha: string                        // Fecha del movimiento
  banco_id: string                     // FK al Banco
  banco_descripcion: string            // snapshot del banco
  tipo: 'Entrada' | 'Salida'           // Entrada suma; Salida resta del saldo
  origen: string                       // Efectivo, Transferencia, Cheque, Depósito, etc.
  referencia: string                   // N° de comprobante / referencia
  cliente: string                      // Cliente (si la entrada proviene de un cliente)
  proveedor: string                    // Proveedor (si la salida es a un proveedor)
  concepto: string                     // Descripcion del movimiento
  monto: number
  estado: 'Registrado' | 'Anulado'
  deposito_id?: string                 // Si fue generado automaticamente desde un deposito
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ControlBancarioState {
  bancos: Banco[]
  chequeras: Chequera[]
  depositos: Deposito[]
  movimientos: MovimientoBancario[]
  // Bancos
  addBanco: (b: Banco) => void
  updateBanco: (id: string, b: Partial<Banco>) => void
  deleteBanco: (id: string) => void
  // Chequeras
  addChequera: (c: Chequera) => void
  updateChequera: (id: string, c: Partial<Chequera>) => void
  deleteChequera: (id: string) => void
  // Depositos
  addDeposito: (d: Deposito) => void
  updateDeposito: (id: string, d: Partial<Deposito>) => void
  deleteDeposito: (id: string) => void
  // Movimientos
  addMovimiento: (m: MovimientoBancario) => void
  updateMovimiento: (id: string, m: Partial<MovimientoBancario>) => void
  deleteMovimiento: (id: string) => void
}

export const useControlBancarioStore = create<ControlBancarioState>()(
  persist(
    (set) => ({
      bancos: [],
      chequeras: [],
      depositos: [],
      movimientos: [],
      addBanco: (b) => set((s) => ({ bancos: [...s.bancos, b] })),
      updateBanco: (id, b) => set((s) => ({ bancos: s.bancos.map((r) => r.id === id ? { ...r, ...b } : r) })),
      deleteBanco: (id) => set((s) => ({ bancos: s.bancos.filter((r) => r.id !== id) })),
      addChequera: (c) => set((s) => ({ chequeras: [...s.chequeras, c] })),
      updateChequera: (id, c) => set((s) => ({ chequeras: s.chequeras.map((r) => r.id === id ? { ...r, ...c } : r) })),
      deleteChequera: (id) => set((s) => ({ chequeras: s.chequeras.filter((r) => r.id !== id) })),
      addDeposito: (d) => set((s) => ({ depositos: [...s.depositos, d] })),
      updateDeposito: (id, d) => set((s) => ({ depositos: s.depositos.map((r) => r.id === id ? { ...r, ...d } : r) })),
      deleteDeposito: (id) => set((s) => ({ depositos: s.depositos.filter((r) => r.id !== id) })),
      addMovimiento: (m) => set((s) => ({ movimientos: [...s.movimientos, m] })),
      updateMovimiento: (id, m) => set((s) => ({ movimientos: s.movimientos.map((r) => r.id === id ? { ...r, ...m } : r) })),
      deleteMovimiento: (id) => set((s) => ({ movimientos: s.movimientos.filter((r) => r.id !== id) })),
    }),
    { storage: createJSONStorage(() => localStorage),
      name: 'control-bancario-storage' }
  )
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const nextChequeraConsecutivo = (chequeras: Chequera[]): string => {
  const maxNum = chequeras.reduce((m, c) => Math.max(m, c.nro_correlativo || 0), 0)
  return `CHQ-${String(maxNum + 1).padStart(5, '0')}`
}

export const nextDepositoConsecutivo = (depositos: Deposito[]): string => {
  const maxNum = depositos.reduce((m, d) => Math.max(m, d.nro_correlativo || 0), 0)
  return `DEP-${String(maxNum + 1).padStart(5, '0')}`
}

export const nextMovimientoConsecutivo = (movimientos: MovimientoBancario[]): string => {
  const maxNum = movimientos.reduce((m, mv) => Math.max(m, mv.nro_correlativo || 0), 0)
  return `MOV-${String(maxNum + 1).padStart(5, '0')}`
}
