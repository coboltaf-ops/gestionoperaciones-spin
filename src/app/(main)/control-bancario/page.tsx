'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useControlBancarioStore, nextDepositoConsecutivo, nextMovimientoConsecutivo, type Banco, type Deposito, type MovimientoBancario } from '@/features/control-bancario/store/control-bancario-store'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { todayColombia, fDate } from '@/shared/lib/format-date'
import PersonalSelector from '@/shared/components/personal-selector'

export default function ControlBancarioPage() {
  const t = useTranslations('controlBancario')
  const permisos = usePermisos('control-bancario')
  const today = todayColombia()

  const { bancos, depositos, movimientos, addBanco, updateBanco, deleteBanco, addDeposito, updateDeposito, deleteDeposito, addMovimiento, updateMovimiento, deleteMovimiento } = useControlBancarioStore()

  const [tab, setTab] = useState<'bancos' | 'depositos' | 'movimientos'>('bancos')

  // ─── State Depósito ───────────────────────────────────────────────────────
  const [depOpen, setDepOpen] = useState(false)
  const [depEditId, setDepEditId] = useState<string | null>(null)
  const [depFecha, setDepFecha] = useState('')
  const [depBancoId, setDepBancoId] = useState('')
  const [depOrigen, setDepOrigen] = useState('')
  const [depMonto, setDepMonto] = useState('')
  const [depReferencia, setDepReferencia] = useState('')
  const [depDepositadoPor, setDepDepositadoPor] = useState('')
  const [depConcepto, setDepConcepto] = useState('')
  const [depObservaciones, setDepObservaciones] = useState('')
  const [depError, setDepError] = useState('')

  // ─── State Movimiento ─────────────────────────────────────────────────────
  const [movOpen, setMovOpen] = useState(false)
  const [movEditId, setMovEditId] = useState<string | null>(null)
  const [movFecha, setMovFecha] = useState('')
  const [movBancoId, setMovBancoId] = useState('')
  const [movTipo, setMovTipo] = useState<'Entrada' | 'Salida'>('Entrada')
  const [movOrigen, setMovOrigen] = useState('')
  const [movReferencia, setMovReferencia] = useState('')
  const [movCliente, setMovCliente] = useState('')
  const [movProveedor, setMovProveedor] = useState('')
  const [movConcepto, setMovConcepto] = useState('')
  const [movMonto, setMovMonto] = useState('')
  const [movError, setMovError] = useState('')

  // ─── State Banco ──────────────────────────────────────────────────────────
  const [bcoOpen, setBcoOpen] = useState(false)
  const [bcoEditId, setBcoEditId] = useState<string | null>(null)
  const [bcoNombre, setBcoNombre] = useState('')
  const [bcoTipoCuenta, setBcoTipoCuenta] = useState('')
  const [bcoNroCuenta, setBcoNroCuenta] = useState('')
  const [bcoFechaSaldo, setBcoFechaSaldo] = useState('')
  const [bcoSaldo, setBcoSaldo] = useState('')
  const [bcoEstado, setBcoEstado] = useState<'Activo' | 'Inactivo'>('Activo')
  const [bcoError, setBcoError] = useState('')

  const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }
  const selectSt: React.CSSProperties = { background: 'rgba(12,26,61,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

  const abrirNuevoBanco = () => {
    setBcoEditId(null)
    setBcoNombre('')
    setBcoTipoCuenta('')
    setBcoNroCuenta('')
    setBcoFechaSaldo(new Date().toISOString().slice(0, 10))
    setBcoSaldo('')
    setBcoEstado('Activo')
    setBcoError('')
    setBcoOpen(true)
  }

  const editarBanco = (b: Banco) => {
    setBcoEditId(b.id)
    setBcoNombre(b.nombre_banco)
    setBcoTipoCuenta(b.tipo_cuenta)
    setBcoNroCuenta(b.nro_cuenta)
    setBcoFechaSaldo(b.fecha_saldo || '')
    setBcoSaldo(b.saldo != null ? String(b.saldo) : '')
    setBcoEstado(b.estado)
    setBcoError('')
    setBcoOpen(true)
  }

  const eliminarBanco = (b: Banco) => {
    if (!confirm(t('confirmDeleteBanco', { nombre: b.nombre_banco, cuenta: b.nro_cuenta }))) return
    deleteBanco(b.id)
  }

  const guardarBanco = () => {
    setBcoError('')
    if (!bcoNombre.trim()) { setBcoError(t('errNombreBanco')); return }
    if (!bcoTipoCuenta) { setBcoError(t('errTipoCuenta')); return }
    if (!bcoNroCuenta.trim()) { setBcoError(t('errNroCuenta')); return }
    if (!bcoFechaSaldo) { setBcoError(t('errFechaSaldo')); return }
    const saldoNum = bcoSaldo === '' ? 0 : Number(bcoSaldo)
    if (isNaN(saldoNum)) { setBcoError(t('errSaldo')); return }

    if (bcoEditId) {
      updateBanco(bcoEditId, { nombre_banco: bcoNombre.trim(), tipo_cuenta: bcoTipoCuenta, nro_cuenta: bcoNroCuenta.trim(), fecha_saldo: bcoFechaSaldo, saldo: saldoNum, estado: bcoEstado })
    } else {
      const nuevo: Banco = {
        id: crypto.randomUUID(),
        nombre_banco: bcoNombre.trim(),
        tipo_cuenta: bcoTipoCuenta,
        nro_cuenta: bcoNroCuenta.trim(),
        fecha_saldo: bcoFechaSaldo,
        saldo: saldoNum,
        estado: bcoEstado,
      }
      addBanco(nuevo)
    }
    setBcoOpen(false)
  }

  // ─── Handlers Depósito ────────────────────────────────────────────────────
  const abrirNuevoDeposito = () => {
    setDepEditId(null)
    setDepFecha(today)
    setDepBancoId(bancos.length === 1 ? bancos[0].id : '')
    setDepOrigen('')
    setDepMonto('')
    setDepReferencia('')
    setDepDepositadoPor('')
    setDepConcepto('')
    setDepObservaciones('')
    setDepError('')
    setDepOpen(true)
  }

  const editarDeposito = (d: Deposito) => {
    setDepEditId(d.id)
    setDepFecha(d.fecha_registro)
    setDepBancoId(d.banco_id)
    setDepOrigen(d.origen)
    setDepMonto(String(d.monto))
    setDepReferencia(d.nro_referencia)
    setDepDepositadoPor(d.depositado_por)
    setDepConcepto(d.concepto)
    setDepObservaciones(d.observaciones)
    setDepError('')
    setDepOpen(true)
  }

  const anularDeposito = (d: Deposito) => {
    if (d.estado === 'Anulado') return
    if (!confirm(t('confirmAnularDeposito', { consecutivo: d.consecutivo, monto: d.monto.toLocaleString('es-CO', { minimumFractionDigits: 2 }) }))) return
    // Reversar el monto del saldo del banco
    const banco = bancos.find(b => b.id === d.banco_id)
    if (banco) {
      updateBanco(banco.id, { saldo: (banco.saldo || 0) - (d.monto || 0) })
    }
    updateDeposito(d.id, { estado: 'Anulado' })
    // Anular tambien el movimiento ligado
    const movLigado = movimientos.find(m => m.deposito_id === d.id)
    if (movLigado && movLigado.estado === 'Registrado') {
      updateMovimiento(movLigado.id, { estado: 'Anulado' })
    }
  }

  const eliminarDeposito = (d: Deposito) => {
    if (!confirm(t('confirmDeleteDeposito', { consecutivo: d.consecutivo }))) return
    // Si estaba Registrado, reversar del saldo del banco antes de eliminar
    if (d.estado === 'Registrado') {
      const banco = bancos.find(b => b.id === d.banco_id)
      if (banco) {
        updateBanco(banco.id, { saldo: (banco.saldo || 0) - (d.monto || 0) })
      }
    }
    // Eliminar tambien el movimiento ligado
    const movLigado = movimientos.find(m => m.deposito_id === d.id)
    if (movLigado) deleteMovimiento(movLigado.id)
    deleteDeposito(d.id)
  }

  const guardarDeposito = () => {
    setDepError('')
    if (!depFecha) { setDepError(t('errFechaDeposito')); return }
    if (!depBancoId) { setDepError(t('errBancoDestino')); return }
    if (!depOrigen) { setDepError(t('errOrigen')); return }
    const montoNum = Number(depMonto)
    if (depMonto === '' || isNaN(montoNum) || montoNum <= 0) { setDepError(t('errMonto')); return }
    if (!depReferencia.trim()) { setDepError(t('errReferencia')); return }
    if (!depDepositadoPor.trim()) { setDepError(t('errRegistradoPor')); return }

    const banco = bancos.find(b => b.id === depBancoId)
    if (!banco) { setDepError(t('errBancoNoExiste')); return }
    const bancoDescripcion = `${banco.nombre_banco} · ${banco.tipo_cuenta} · ${banco.nro_cuenta}`

    if (depEditId) {
      const original = depositos.find(d => d.id === depEditId)
      const wasRegistered = original?.estado === 'Registrado'
      const sameBanco = original?.banco_id === depBancoId

      if (wasRegistered && sameBanco) {
        // Mismo banco: aplicar el diferencial (nuevo - viejo)
        const diff = montoNum - (original?.monto || 0)
        updateBanco(depBancoId, { saldo: (banco.saldo || 0) + diff, fecha_saldo: depFecha })
      } else {
        if (wasRegistered && original) {
          // Reversar del banco original
          const bancoOriginal = bancos.find(b => b.id === original.banco_id)
          if (bancoOriginal) {
            updateBanco(bancoOriginal.id, { saldo: (bancoOriginal.saldo || 0) - (original.monto || 0) })
          }
        }
        // Aplicar al banco nuevo
        updateBanco(depBancoId, { saldo: (banco.saldo || 0) + montoNum, fecha_saldo: depFecha })
      }

      updateDeposito(depEditId, {
        fecha_registro: depFecha,
        banco_id: depBancoId,
        banco_descripcion: bancoDescripcion,
        origen: depOrigen,
        monto: montoNum,
        nro_referencia: depReferencia.trim(),
        depositado_por: depDepositadoPor.trim(),
        concepto: depConcepto.trim(),
        observaciones: depObservaciones.trim(),
      })
      // Sincronizar el movimiento ligado al deposito
      const movLigado = movimientos.find(m => m.deposito_id === depEditId)
      if (movLigado) {
        updateMovimiento(movLigado.id, {
          fecha: depFecha,
          banco_id: depBancoId,
          banco_descripcion: bancoDescripcion,
          referencia: depReferencia.trim(),
          concepto: depConcepto.trim(),
          monto: montoNum,
        })
      }
    } else {
      const nro = depositos.reduce((m, d) => Math.max(m, d.nro_correlativo || 0), 0) + 1
      const nuevoDepositoId = crypto.randomUUID()
      const nuevo: Deposito = {
        id: nuevoDepositoId,
        nro_correlativo: nro,
        consecutivo: nextDepositoConsecutivo(depositos),
        fecha_registro: depFecha,
        banco_id: depBancoId,
        banco_descripcion: bancoDescripcion,
        origen: depOrigen,
        monto: montoNum,
        nro_referencia: depReferencia.trim(),
        depositado_por: depDepositadoPor.trim(),
        concepto: depConcepto.trim(),
        observaciones: depObservaciones.trim(),
        estado: 'Registrado',
      }
      addDeposito(nuevo)
      // Sumar el monto al saldo del banco y actualizar la fecha del saldo
      updateBanco(depBancoId, {
        saldo: (banco.saldo || 0) + montoNum,
        fecha_saldo: depFecha,
      })
      // Crear automaticamente el movimiento bancario ligado al deposito
      const nroMov = movimientos.reduce((m, x) => Math.max(m, x.nro_correlativo || 0), 0) + 1
      addMovimiento({
        id: crypto.randomUUID(),
        nro_correlativo: nroMov,
        consecutivo: nextMovimientoConsecutivo(movimientos),
        fecha: depFecha,
        banco_id: depBancoId,
        banco_descripcion: bancoDescripcion,
        tipo: 'Entrada',
        origen: 'Depósito',
        referencia: depReferencia.trim(),
        cliente: '',
        proveedor: '',
        concepto: depConcepto.trim(),
        monto: montoNum,
        estado: 'Registrado',
        deposito_id: nuevoDepositoId,
      })
    }
    setDepOpen(false)
  }

  // ─── Handlers Movimiento ──────────────────────────────────────────────────
  const abrirNuevoMovimiento = () => {
    setMovEditId(null)
    setMovFecha(today)
    setMovBancoId(bancos.length === 1 ? bancos[0].id : '')
    setMovTipo('Entrada')
    setMovOrigen('')
    setMovReferencia('')
    setMovCliente('')
    setMovProveedor('')
    setMovConcepto('')
    setMovMonto('')
    setMovError('')
    setMovOpen(true)
  }

  const editarMovimiento = (m: MovimientoBancario) => {
    setMovEditId(m.id)
    setMovFecha(m.fecha || today)
    setMovBancoId(m.banco_id)
    setMovTipo(m.tipo)
    setMovOrigen(m.origen)
    setMovReferencia(m.referencia)
    setMovCliente(m.cliente)
    setMovProveedor(m.proveedor)
    setMovConcepto(m.concepto)
    setMovMonto(String(m.monto))
    setMovError('')
    setMovOpen(true)
  }

  const anularMovimiento = (m: MovimientoBancario) => {
    if (m.estado === 'Anulado') return
    if (!confirm(t('confirmAnularMovimiento', { consecutivo: m.consecutivo, monto: m.monto.toLocaleString('es-CO', { minimumFractionDigits: 2 }) }))) return
    // Reversar el efecto en el saldo del banco
    const banco = bancos.find(b => b.id === m.banco_id)
    if (banco) {
      const delta = m.tipo === 'Entrada' ? -m.monto : m.monto
      updateBanco(banco.id, { saldo: (banco.saldo || 0) + delta })
    }
    updateMovimiento(m.id, { estado: 'Anulado' })
  }

  const eliminarMovimiento = (m: MovimientoBancario) => {
    if (!confirm(t('confirmDeleteMovimiento', { consecutivo: m.consecutivo }))) return
    if (m.estado === 'Registrado') {
      const banco = bancos.find(b => b.id === m.banco_id)
      if (banco) {
        const delta = m.tipo === 'Entrada' ? -m.monto : m.monto
        updateBanco(banco.id, { saldo: (banco.saldo || 0) + delta })
      }
    }
    deleteMovimiento(m.id)
  }

  const guardarMovimiento = () => {
    setMovError('')
    if (!movFecha) { setMovError(t('errFechaMovimiento')); return }
    if (!movBancoId) { setMovError(t('errBanco')); return }
    if (!movTipo) { setMovError(t('errTipoMov')); return }
    if (!movOrigen) { setMovError(t('errOrigenMov')); return }
    if (!movReferencia.trim()) { setMovError(t('errReferenciaMov')); return }
    if (!movConcepto.trim()) { setMovError(t('errConceptoMov')); return }
    const montoNum = Number(movMonto)
    if (movMonto === '' || isNaN(montoNum) || montoNum <= 0) { setMovError(t('errMonto')); return }

    const banco = bancos.find(b => b.id === movBancoId)
    if (!banco) { setMovError(t('errBancoNoExiste')); return }
    const bancoDescripcion = `${banco.nombre_banco} · ${banco.tipo_cuenta} · ${banco.nro_cuenta}`
    const signo = movTipo === 'Entrada' ? 1 : -1

    if (movEditId) {
      const original = movimientos.find(m => m.id === movEditId)
      const wasRegistered = original?.estado === 'Registrado'
      const sameBanco = original?.banco_id === movBancoId

      if (wasRegistered && sameBanco) {
        const oldSigno = original?.tipo === 'Entrada' ? 1 : -1
        const diff = (montoNum * signo) - ((original?.monto || 0) * oldSigno)
        updateBanco(movBancoId, { saldo: (banco.saldo || 0) + diff, fecha_saldo: movFecha })
      } else {
        if (wasRegistered && original) {
          const bancoOriginal = bancos.find(b => b.id === original.banco_id)
          if (bancoOriginal) {
            const oldSigno = original.tipo === 'Entrada' ? 1 : -1
            updateBanco(bancoOriginal.id, { saldo: (bancoOriginal.saldo || 0) - ((original.monto || 0) * oldSigno) })
          }
        }
        updateBanco(movBancoId, { saldo: (banco.saldo || 0) + (montoNum * signo), fecha_saldo: movFecha })
      }

      updateMovimiento(movEditId, {
        fecha: movFecha,
        banco_id: movBancoId,
        banco_descripcion: bancoDescripcion,
        tipo: movTipo,
        origen: movOrigen,
        referencia: movReferencia.trim(),
        cliente: movCliente.trim(),
        proveedor: movProveedor.trim(),
        concepto: movConcepto.trim(),
        monto: montoNum,
      })
    } else {
      const nro = movimientos.reduce((m, x) => Math.max(m, x.nro_correlativo || 0), 0) + 1
      const nuevo: MovimientoBancario = {
        id: crypto.randomUUID(),
        nro_correlativo: nro,
        consecutivo: nextMovimientoConsecutivo(movimientos),
        fecha: movFecha,
        banco_id: movBancoId,
        banco_descripcion: bancoDescripcion,
        tipo: movTipo,
        origen: movOrigen,
        referencia: movReferencia.trim(),
        cliente: movCliente.trim(),
        proveedor: movProveedor.trim(),
        concepto: movConcepto.trim(),
        monto: montoNum,
        estado: 'Registrado',
      }
      addMovimiento(nuevo)
      updateBanco(movBancoId, { saldo: (banco.saldo || 0) + (montoNum * signo), fecha_saldo: movFecha })
    }
    setMovOpen(false)
  }

  if (!permisos.leer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 text-lg">{t('noPermisos')}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-white/50 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit flex-wrap" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {[
          { id: 'bancos' as const, label: `🏦 ${t('tabBancos')}`, count: bancos.length },
          { id: 'depositos' as const, label: `💰 ${t('tabDepositos')}`, count: depositos.length },
          { id: 'movimientos' as const, label: `🔄 ${t('tabMovimientos')}`, count: movimientos.length },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            style={tab === item.id
              ? { background: 'rgba(59,130,246,1)', color: '#fff', border: '1px solid rgba(37,99,235,1)' }
              : { color: 'rgba(255,255,255,0.5)', border: '1px solid transparent' }}
          >
            <span>{item.label}</span>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.1)' }}>{item.count}</span>
          </button>
        ))}
      </div>

      {/* TAB BANCOS */}
      {tab === 'bancos' && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-white/60 text-sm">{t('bancosCount', { count: bancos.length })}</p>
            {permisos.editar && (
              <button onClick={abrirNuevoBanco} className="px-5 py-2.5 rounded-xl font-medium text-white"
                style={{ background: 'rgba(59,130,246,1)', border: '1px solid rgba(37,99,235,1)' }}>
                {t('newBanco')}
              </button>
            )}
          </div>

          <div className="rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <table className="w-full text-base text-left">
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  {[t('colNombreBanco'), t('colTipoCuenta'), t('colNroCuenta'), t('colFechaSaldo'), t('colSaldo'), t('colEstado'), t('colAcciones')].map(h => (
                    <th key={h} className="px-3 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bancos.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-white/30">{t('noBancos')} <strong>{t('newBanco')}</strong>.</td></tr>
                ) : bancos.map(b => (
                  <tr key={b.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-white font-semibold">{b.nombre_banco}</td>
                    <td className="px-3 py-3 text-white font-bold">{b.tipo_cuenta}</td>
                    <td className="px-3 py-3 font-mono text-white">{b.nro_cuenta}</td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{fDate(b.fecha_saldo)}</td>
                    <td className="px-3 py-3 font-mono text-right text-emerald-300 whitespace-nowrap">{b.saldo != null ? b.saldo.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 rounded-md text-xs font-bold" style={
                        b.estado === 'Activo'
                          ? { background: 'rgba(34,197,94,0.95)', color: '#fff', border: '1px solid rgba(34,197,94,0.4)' }
                          : { background: 'rgba(239, 68, 68, 1)', color: '#fff', border: '1px solid rgba(239,68,68,0.4)' }
                      }>{b.estado === 'Activo' ? t('estadoActivo') : t('estadoInactivo')}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {permisos.editar && <button onClick={() => editarBanco(b)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(59, 130, 246, 1)', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.6)' }}>{t('btnEdit')}</button>}
                        {permisos.eliminar && <button onClick={() => eliminarBanco(b)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(239, 68, 68, 1)', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.6)' }}>{t('btnDelete')}</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'depositos' && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-white/60 text-sm">{t('depositosCount', { count: depositos.length })}</p>
            {permisos.editar && (
              <button onClick={abrirNuevoDeposito} className="px-5 py-2.5 rounded-xl font-medium text-white"
                style={{ background: 'rgba(22,163,74,1)', border: '1px solid rgba(21,128,61,1)' }}>
                {t('newDeposito')}
              </button>
            )}
          </div>

          <div className="rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <table className="w-full text-base text-left">
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  {[t('colConsecutivo'), t('colFecha'), t('colBanco'), t('colOrigen'), t('colMonto'), t('colReferencia'), t('colRegistradoPor'), t('colConcepto'), t('colEstado'), t('colAcciones')].map(h => (
                    <th key={h} className="px-3 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {depositos.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-12 text-center text-white/30">{t('noDepositos')} <strong>{t('newDeposito')}</strong>.</td></tr>
                ) : depositos.map(d => (
                  <tr key={d.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-mono font-bold text-emerald-300 whitespace-nowrap">{d.consecutivo}</td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{fDate(d.fecha_registro)}</td>
                    <td className="px-3 py-3 text-white">{d.banco_descripcion}</td>
                    <td className="px-3 py-3 text-white font-bold">{d.origen}</td>
                    <td className="px-3 py-3 font-mono text-right text-emerald-300 whitespace-nowrap">{d.monto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-3 font-mono text-white font-bold">{d.nro_referencia || '—'}</td>
                    <td className="px-3 py-3 text-white font-bold">{d.depositado_por}</td>
                    <td className="px-3 py-3 text-white font-bold max-w-xs truncate" title={d.concepto}>{d.concepto || '—'}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 rounded-md text-xs font-bold" style={
                        d.estado === 'Registrado'
                          ? { background: 'rgba(34,197,94,0.95)', color: '#fff', border: '1px solid rgba(34,197,94,0.4)' }
                          : { background: 'rgba(239, 68, 68, 1)', color: '#fff', border: '1px solid rgba(239,68,68,0.4)' }
                      }>{d.estado === 'Registrado' ? t('estadoRegistrado') : t('estadoAnulado')}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {permisos.editar && d.estado === 'Registrado' && <button onClick={() => editarDeposito(d)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(59, 130, 246, 1)', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.6)' }}>{t('btnEdit')}</button>}
                        {permisos.editar && d.estado === 'Registrado' && <button onClick={() => anularDeposito(d)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(251,191,36,0.95)', color: '#fff', border: '1px solid rgba(251,191,36,0.3)' }}>{t('btnAnnul')}</button>}
                        {permisos.eliminar && <button onClick={() => eliminarDeposito(d)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(239, 68, 68, 1)', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.6)' }}>{t('btnDelete')}</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'movimientos' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-sm">{t('movimientosCount', { count: movimientos.length })}</p>
            {permisos.registrar && (
              <button onClick={abrirNuevoMovimiento} className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'rgba(168,85,247,0.5)', border: '1px solid rgba(168,85,247,0.6)' }}>{t('newMovimiento')}</button>
            )}
          </div>
          <div className="rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <table className="w-full text-base">
              <thead style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <tr>
                  {[t('colConsecutivo'), t('colFecha'), t('colBanco'), t('colTipo'), t('colOrigen'), t('colReferencia'), t('colCliente'), t('colProveedor'), t('colConcepto'), t('colMonto'), t('colEstado'), t('colAcciones')].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-white/70 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 && (
                  <tr><td colSpan={12} className="px-3 py-8 text-center text-white/40">{t('noMovimientos')} <strong>{t('newMovimiento')}</strong>.</td></tr>
                )}
                {movimientos.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-mono text-purple-300 whitespace-nowrap">{m.consecutivo}</td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{fDate(m.fecha)}</td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{m.banco_descripcion}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-lg text-xs font-bold" style={m.tipo === 'Entrada' ? { background: 'rgba(34,197,94,0.95)', color: '#fff', border: '1px solid rgba(34,197,94,0.3)' } : { background: 'rgba(239, 68, 68, 1)', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.6)' }}>{m.tipo === 'Entrada' ? t('tipoEntradaShort') : t('tipoSalidaShort')}</span>
                    </td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{m.origen}</td>
                    <td className="px-3 py-3 font-mono text-white font-bold whitespace-nowrap">{m.referencia || '—'}</td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{m.cliente || '—'}</td>
                    <td className="px-3 py-3 text-white font-bold whitespace-nowrap">{m.proveedor || '—'}</td>
                    <td className="px-3 py-3 text-white font-bold">{m.concepto || '—'}</td>
                    <td className="px-3 py-3 font-mono text-right whitespace-nowrap" style={{ color: m.tipo === 'Entrada' ? '#6ee7b7' : '#fca5a5' }}>{(m.tipo === 'Entrada' ? '+' : '-')} {m.monto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-lg text-xs font-bold" style={m.estado === 'Registrado' ? { background: 'rgba(34,197,94,0.95)', color: '#fff', border: '1px solid rgba(34,197,94,0.3)' } : { background: 'rgba(107,114,128,0.2)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }}>{m.estado === 'Registrado' ? t('estadoRegistrado') : t('estadoAnulado')}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {permisos.editar && m.estado === 'Registrado' && <button onClick={() => editarMovimiento(m)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(59, 130, 246, 1)', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.6)' }}>{t('btnEdit')}</button>}
                        {permisos.editar && m.estado === 'Registrado' && <button onClick={() => anularMovimiento(m)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(245,158,11,0.2)', color: '#fff', border: '1px solid rgba(245,158,11,0.3)' }}>{t('btnAnnul')}</button>}
                        {permisos.eliminar && <button onClick={() => eliminarMovimiento(m)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(239, 68, 68, 1)', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.6)' }}>{t('btnDelete')}</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL NUEVO/EDITAR BANCO */}
      {bcoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-xl rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">🏦 {bcoEditId ? t('modalEditBanco') : t('modalNewBanco')}</h2>
              <button onClick={() => setBcoOpen(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">{t('fNombreBanco')} *</label>
                <input value={bcoNombre} onChange={e => setBcoNombre(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} placeholder={t('phNombreBanco')} autoFocus />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fTipoCuenta')} *</label>
                <select value={bcoTipoCuenta} onChange={e => setBcoTipoCuenta(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">{t('selSeleccione')}</option>
                  <option value="Ahorros">{t('tipoCuentaAhorros')}</option>
                  <option value="Corriente">{t('tipoCuentaCorriente')}</option>
                  <option value="Crédito">{t('tipoCuentaCredito')}</option>
                  <option value="Otra">{t('tipoCuentaOtra')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fNroCuenta')} *</label>
                <input value={bcoNroCuenta} onChange={e => setBcoNroCuenta(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono" style={inputSt} placeholder={t('phNroCuenta')} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fFechaSaldo')} *</label>
                <input type="date" value={bcoFechaSaldo} onChange={e => setBcoFechaSaldo(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fSaldo')}</label>
                <input type="number" step="0.01" value={bcoSaldo} onChange={e => setBcoSaldo(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono text-right" style={inputSt} placeholder="0.00" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">{t('fEstado')}</label>
                <select value={bcoEstado} onChange={e => setBcoEstado(e.target.value as 'Activo' | 'Inactivo')}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="Activo">{t('estadoActivo')}</option>
                  <option value="Inactivo">{t('estadoInactivo')}</option>
                </select>
              </div>
            </div>

            {bcoError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mt-3">{bcoError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setBcoOpen(false)} className="px-5 py-2 rounded-xl text-white/70 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{t('btnCancel')}</button>
              <button onClick={guardarBanco} className="px-5 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'rgba(59,130,246,1)', border: '1px solid rgba(37,99,235,1)' }}>{bcoEditId ? t('btnSaveChanges') : t('btnRegisterBanco')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO/EDITAR DEPÓSITO */}
      {depOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 max-h-[92vh] overflow-y-auto" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">💰 {depEditId ? t('modalEditDeposito') : t('modalNewDeposito')} {!depEditId && <span className="font-mono text-emerald-300 text-sm">— {nextDepositoConsecutivo(depositos)}</span>}</h2>
              <button onClick={() => setDepOpen(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fFechaDeposito')} *</label>
                <input type="date" value={depFecha} onChange={e => setDepFecha(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fOrigen')} *</label>
                <select value={depOrigen} onChange={e => setDepOrigen(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">{t('selSeleccione')}</option>
                  <option value="Efectivo">{t('origenEfectivo')}</option>
                  <option value="Transferencia">{t('origenTransferencia')}</option>
                  <option value="Cheque">{t('origenCheque')}</option>
                  <option value="Consignación">{t('origenConsignacion')}</option>
                  <option value="ACH">{t('origenACH')}</option>
                  <option value="Tarjeta">{t('origenTarjeta')}</option>
                  <option value="Otro">{t('origenOtro')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">{t('fBancoDestino')} *</label>
                <select value={depBancoId} onChange={e => setDepBancoId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">{t('selSeleccioneBanco')}</option>
                  {bancos.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.nombre_banco} · {b.tipo_cuenta} · {b.nro_cuenta}{b.estado === 'Inactivo' ? ` ${t('inactivoSuffix')}` : ''}
                    </option>
                  ))}
                </select>
                {bancos.length === 0 && (
                  <p className="text-xs text-amber-300/80 mt-1">{t('warningNoBancos')} <strong>{t('tabBancos')}</strong>.</p>
                )}
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fMonto')} *</label>
                <input type="number" step="0.01" value={depMonto} onChange={e => setDepMonto(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono text-right" style={inputSt} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fReferencia')} *</label>
                <input value={depReferencia} onChange={e => setDepReferencia(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono" style={inputSt} placeholder={t('phReferencia')} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fRegistradoPor')} *</label>
                <PersonalSelector
                  value={depDepositadoPor}
                  onChange={setDepDepositadoPor}
                  placeholder={t('phRegistradoPor')}
                />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fConcepto')}</label>
                <input value={depConcepto} onChange={e => setDepConcepto(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} placeholder={t('phConceptoDeposito')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">{t('fObservaciones')}</label>
                <textarea value={depObservaciones} onChange={e => setDepObservaciones(e.target.value)} rows={2}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} placeholder={t('phObservaciones')} />
              </div>
            </div>

            {depError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mt-3">{depError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setDepOpen(false)} className="px-5 py-2 rounded-xl text-white/70 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{t('btnCancel')}</button>
              <button onClick={guardarDeposito} className="px-5 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'rgba(22,163,74,1)', border: '1px solid rgba(21,128,61,1)' }}>{depEditId ? t('btnSaveChanges') : t('btnRegisterDeposito')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO/EDITAR MOVIMIENTO */}
      {movOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-3xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">🔄 {movEditId ? t('modalEditMovimiento') : t('modalNewMovimiento')} {!movEditId && <span className="text-white/40 font-normal text-sm">— {nextMovimientoConsecutivo(movimientos)}</span>}</h2>
              <button onClick={() => setMovOpen(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fFechaMovimiento')} *</label>
                <input type="date" value={movFecha} onChange={e => setMovFecha(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fTipo')} *</label>
                <select value={movTipo} onChange={e => setMovTipo(e.target.value as 'Entrada' | 'Salida')}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="Entrada">{t('tipoEntrada')}</option>
                  <option value="Salida">{t('tipoSalida')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">{t('fBanco')} *</label>
                <select value={movBancoId} onChange={e => setMovBancoId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">{t('selSeleccioneBanco')}</option>
                  {bancos.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.nombre_banco} · {b.tipo_cuenta} · {b.nro_cuenta}{b.estado === 'Inactivo' ? ` ${t('inactivoSuffix')}` : ''}
                    </option>
                  ))}
                </select>
                {bancos.length === 0 && (
                  <p className="text-xs text-amber-300/80 mt-1">{t('warningNoBancos')} <strong>{t('tabBancos')}</strong>.</p>
                )}
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fOrigen')} *</label>
                <select value={movOrigen} onChange={e => setMovOrigen(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={selectSt}>
                  <option value="">{t('selSeleccione')}</option>
                  <option value="Efectivo">{t('origenEfectivo')}</option>
                  <option value="Transferencia">{t('origenTransferencia')}</option>
                  <option value="Cheque">{t('origenCheque')}</option>
                  <option value="Consignación">{t('origenConsignacion')}</option>
                  <option value="ACH">{t('origenACH')}</option>
                  <option value="Tarjeta">{t('origenTarjeta')}</option>
                  <option value="Otro">{t('origenOtro')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fReferenciaCorta')} *</label>
                <input value={movReferencia} onChange={e => setMovReferencia(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono" style={inputSt} placeholder={t('phReferenciaMovimiento')} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fCliente')}</label>
                <input value={movCliente} onChange={e => setMovCliente(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} placeholder={t('phCliente')} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fProveedor')}</label>
                <input value={movProveedor} onChange={e => setMovProveedor(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} placeholder={t('phProveedor')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xl text-white font-extrabold mb-1">{t('fConcepto')} *</label>
                <input value={movConcepto} onChange={e => setMovConcepto(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold" style={inputSt} placeholder={t('phConceptoMovimiento')} />
              </div>
              <div>
                <label className="block text-xl text-white font-extrabold mb-1">{t('fMonto')} *</label>
                <input type="number" step="0.01" value={movMonto} onChange={e => setMovMonto(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 outline-none text-base text-white font-bold font-mono text-right" style={inputSt} placeholder="0.00" />
              </div>
            </div>

            {movError && <p className="mt-3 text-sm text-red-300">{movError}</p>}

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setMovOpen(false)} className="px-5 py-2 rounded-xl text-white/70 text-sm font-medium hover:bg-white/5">{t('btnCancel')}</button>
              <button onClick={guardarMovimiento} className="px-5 py-2 rounded-xl text-white text-sm font-bold" style={{ background: 'rgba(168,85,247,0.5)', border: '1px solid rgba(168,85,247,0.6)' }}>{movEditId ? t('btnSaveChanges') : t('btnRegisterMovimiento')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
