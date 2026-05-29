'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useProveedoresStore } from '@/features/proveedores/store/proveedores-store'
import { useBodegasStore } from '@/features/bodegas/store/bodegas-store'
import { useReferenceStore } from '@/features/referencias/store/reference-store'
import { useCorreosStore } from '@/features/correos-enviados/store/correos-store'
import { useOrdenesStore } from '@/features/ordenes-compra/store/ordenes-store'
import { useCentrosCostoStore } from '@/features/centros-costo/store/centros-costo-store'
import { useTransferenciasStore } from '@/features/transferencias/store/transferencias-store'
import { useAjustesStore } from '@/features/ajustes-inventario/store/ajustes-store'
import { useRecepcionesStore } from '@/features/recepcion-facturas/store/recepciones-store'
import { useRemisionesStore } from '@/features/recepcion-remisiones/store/remisiones-store'
import { useUsuariosStore } from '@/features/usuarios-gestion/store/usuarios-store'
import { useCargaInicialStore } from '@/features/carga-inicial/store/carga-inicial-store'
import { useModulosSistemaStore } from '@/features/modulos-sistema/store/modulos-sistema-store'
import { usePersonalEmpresaStore } from '@/features/personal-empresa/store/personal-empresa-store'
import { useTareasStore } from '@/features/tareas/store/tareas-store'
import { usePedidosStore } from '@/features/pedidos/store/pedidos-store'
import { usePagosProveedoresStore } from '@/features/pagos-proveedores/store/pagos-proveedores-store'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { useControlBancarioStore } from '@/features/control-bancario/store/control-bancario-store'

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected'

type SyncConfig = {
  collection: string
  getData: () => unknown
  setData: (d: unknown) => void
  isObject?: boolean
  onConnected?: () => void
  onDisconnected?: () => void
}

async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options)
      return res
    } catch {
      if (i === maxRetries - 1) throw new Error('Server unreachable')
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Server unreachable')
}

function useSyncCollection(config: SyncConfig) {
  const fetchDone = useRef(false)
  const prevJson = useRef('')
  const configRef = useRef(config)
  configRef.current = config

  // Initial sync + reconnect on visibility change
  useEffect(() => {
    const doSync = async () => {
      const c = configRef.current
      try {
        const r = await fetchWithRetry(`/api/data/${c.collection}`)
        const serverData = await r.json()
        // Para objetos compuestos (isObject), considerar "vacío" si todos los arrays internos están vacíos
        const serverIsEmpty = c.isObject
          ? !serverData || Object.keys(serverData).length === 0 ||
            Object.values(serverData as Record<string, unknown[]>).every(v => !Array.isArray(v) || v.length === 0)
          : !Array.isArray(serverData) || serverData.length === 0
        const local = c.getData()
        const localStr = JSON.stringify(local)
        const localIsEmpty = c.isObject
          ? Object.values(local as Record<string, unknown[]>).every(v => !Array.isArray(v) || v.length === 0)
          : !Array.isArray(local) || (local as unknown[]).length === 0

        if (!serverIsEmpty) {
          // Server tiene datos → bajar al cliente
          c.setData(serverData)
          prevJson.current = JSON.stringify(serverData)
        } else if (!localIsEmpty) {
          // Server vacío pero local tiene datos → subir al server (preserva datos locales)
          prevJson.current = localStr
          await fetchWithRetry(`/api/data/${c.collection}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: localStr,
          })
        } else {
          // Ambos vacíos
          prevJson.current = localStr
        }
        c.onConnected?.()
      } catch {
        prevJson.current = JSON.stringify(c.getData())
        c.onDisconnected?.()
      } finally {
        setTimeout(() => { fetchDone.current = true }, 500)
      }
    }

    doSync()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchDone.current = false
        doSync()
      }
    }

    const handleOnline = () => {
      fetchDone.current = false
      doSync()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('online', handleOnline)
    window.addEventListener('focus', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('focus', handleVisibility)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save to server when data changes
  const data = config.getData()
  const save = useCallback(() => {
    if (!fetchDone.current) return
    const json = JSON.stringify(data)
    if (json === prevJson.current) return
    prevJson.current = json
    fetch(`/api/data/${config.collection}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    }).catch(() => { /* will retry on reconnect */ })
  }, [data, config.collection])

  useEffect(() => { save() }, [save])
}

export function ServerSyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('reconnecting')
  const connectedCount = useRef(0)
  const totalCollections = 20

  const handleConnected = useCallback(() => {
    connectedCount.current++
    if (connectedCount.current >= totalCollections) setStatus('connected')
  }, [])

  const handleDisconnected = useCallback(() => {
    setStatus('disconnected')
  }, [])

  // Periodic health check — reconnect if server comes back
  useEffect(() => {
    if (status !== 'disconnected') return
    const interval = setInterval(async () => {
      try {
        const r = await fetch('/api/data/productos', { method: 'HEAD' })
        if (r.ok) {
          // Server is back — reload the page to resync everything
          window.location.reload()
        }
      } catch { /* still down */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [status])

  // Productos
  const productos = useProductosStore(s => s.productos)
  const setProductos = useCallback((d: unknown) => {
    useProductosStore.setState({ productos: d as typeof productos })
  }, [])

  // Proveedores
  const proveedores = useProveedoresStore(s => s.proveedores)
  const setProveedores = useCallback((d: unknown) => {
    useProveedoresStore.setState({ proveedores: d as typeof proveedores })
  }, [])

  // Bodegas
  const bodegas = useBodegasStore(s => s.bodegas)
  const setBodegas = useCallback((d: unknown) => {
    useBodegasStore.setState({ bodegas: d as typeof bodegas })
  }, [])

  // Referencias — ordenar alfabéticamente al recibir del servidor
  const refData = useReferenceStore(s => s.data)
  const setRefData = useCallback((d: unknown) => {
    const raw = d as Record<string, Array<{ descripcion: string }>>;
    const sorted = Object.fromEntries(
      Object.entries(raw).map(([key, records]) => [
        key,
        Array.isArray(records)
          ? [...records].sort((a, b) => a.descripcion.localeCompare(b.descripcion, 'es'))
          : records,
      ])
    )
    useReferenceStore.setState({ data: { ...useReferenceStore.getState().data, ...sorted } })
  }, [])

  // Correos
  const correos = useCorreosStore(s => s.correos)
  const setCorreos = useCallback((d: unknown) => {
    useCorreosStore.setState({ correos: d as typeof correos })
  }, [])

  // Órdenes de Compra
  const ordenes = useOrdenesStore(s => s.ordenes)
  const setOrdenes = useCallback((d: unknown) => {
    useOrdenesStore.setState({ ordenes: d as typeof ordenes })
  }, [])

  // Centros de Costo
  const centros = useCentrosCostoStore(s => s.centros)
  const setCentros = useCallback((d: unknown) => {
    useCentrosCostoStore.setState({ centros: d as typeof centros })
  }, [])

  // Transferencias
  const transferencias = useTransferenciasStore(s => s.transferencias)
  const setTransferencias = useCallback((d: unknown) => {
    useTransferenciasStore.setState({ transferencias: d as typeof transferencias })
  }, [])

  // Ajustes de Inventario
  const ajustes = useAjustesStore(s => s.ajustes)
  const setAjustes = useCallback((d: unknown) => {
    useAjustesStore.setState({ ajustes: d as typeof ajustes })
  }, [])

  // Recepción de Facturas
  const recepciones = useRecepcionesStore(s => s.recepciones)
  const setRecepciones = useCallback((d: unknown) => {
    useRecepcionesStore.setState({ recepciones: d as typeof recepciones })
  }, [])

  // Recepción de Remisiones
  const remisiones = useRemisionesStore(s => s.remisiones)
  const setRemisiones = useCallback((d: unknown) => {
    useRemisionesStore.setState({ remisiones: d as typeof remisiones })
  }, [])

  // Usuarios
  const usuarios = useUsuariosStore(s => s.usuarios)
  const setUsuarios = useCallback((d: unknown) => {
    useUsuariosStore.setState({ usuarios: d as typeof usuarios })
  }, [])

  // Carga Inicial Inventario
  const cargas = useCargaInicialStore(s => s.cargas)
  const setCargas = useCallback((d: unknown) => {
    useCargaInicialStore.setState({ cargas: d as typeof cargas })
  }, [])

  // Módulos Sistema
  const modulosSistema = useModulosSistemaStore(s => s.modulos)
  const setModulosSistema = useCallback((d: unknown) => {
    useModulosSistemaStore.setState({ modulos: d as typeof modulosSistema })
  }, [])

  // Personal Empresa
  const personalEmpresa = usePersonalEmpresaStore(s => s.personal)
  const setPersonalEmpresa = useCallback((d: unknown) => {
    usePersonalEmpresaStore.setState({ personal: d as typeof personalEmpresa })
  }, [])

  // Tareas
  const tareas = useTareasStore(s => s.tareas)
  const setTareas = useCallback((d: unknown) => {
    useTareasStore.setState({ tareas: d as typeof tareas })
  }, [])

  // Pedidos
  const pedidos = usePedidosStore(s => s.pedidos)
  const setPedidos = useCallback((d: unknown) => {
    usePedidosStore.setState({ pedidos: d as typeof pedidos })
  }, [])

  // Datos Empresa (logo, nombre, identificación, etc.)
  const empresas = useEmpresaStore(s => s.empresas)
  const setEmpresas = useCallback((d: unknown) => {
    useEmpresaStore.setState({ empresas: d as typeof empresas })
  }, [])

  // Control Bancario (objeto compuesto: bancos + chequeras + depositos + movimientos)
  const cbBancos = useControlBancarioStore(s => s.bancos)
  const cbChequeras = useControlBancarioStore(s => s.chequeras)
  const cbDepositos = useControlBancarioStore(s => s.depositos)
  const cbMovimientos = useControlBancarioStore(s => s.movimientos)
  const controlBancarioData = { bancos: cbBancos, chequeras: cbChequeras, depositos: cbDepositos, movimientos: cbMovimientos }
  const setControlBancario = useCallback((d: unknown) => {
    const data = d as { bancos?: typeof cbBancos; chequeras?: typeof cbChequeras; depositos?: typeof cbDepositos; movimientos?: typeof cbMovimientos }
    useControlBancarioStore.setState({
      bancos: data.bancos ?? [],
      chequeras: data.chequeras ?? [],
      depositos: data.depositos ?? [],
      movimientos: data.movimientos ?? [],
    })
  }, [])

  // Pagos Proveedores (objeto compuesto: facturas + pagos + anticipos + notas)
  const facturasPagos = usePagosProveedoresStore(s => s.facturas)
  const pagosProv = usePagosProveedoresStore(s => s.pagos)
  const anticiposProv = usePagosProveedoresStore(s => s.anticipos)
  const notasProv = usePagosProveedoresStore(s => s.notas)
  const pagosProveedoresData = { facturas: facturasPagos, pagos: pagosProv, anticipos: anticiposProv, notas: notasProv }
  const setPagosProveedores = useCallback((d: unknown) => {
    const data = d as { facturas?: typeof facturasPagos; pagos?: typeof pagosProv; anticipos?: typeof anticiposProv; notas?: typeof notasProv }
    usePagosProveedoresStore.setState({
      facturas: data.facturas ?? [],
      pagos: data.pagos ?? [],
      anticipos: data.anticipos ?? [],
      notas: data.notas ?? [],
    })
  }, [])

  const syncCallbacks = { onConnected: handleConnected, onDisconnected: handleDisconnected }

  useSyncCollection({ collection: 'productos', getData: () => productos, setData: setProductos, ...syncCallbacks })
  useSyncCollection({ collection: 'proveedores', getData: () => proveedores, setData: setProveedores, ...syncCallbacks })
  useSyncCollection({ collection: 'bodegas', getData: () => bodegas, setData: setBodegas, ...syncCallbacks })
  useSyncCollection({ collection: 'referencias', getData: () => refData, setData: setRefData, isObject: true, ...syncCallbacks })
  useSyncCollection({ collection: 'correos-enviados', getData: () => correos, setData: setCorreos, ...syncCallbacks })
  useSyncCollection({ collection: 'ordenes-compra', getData: () => ordenes, setData: setOrdenes, ...syncCallbacks })
  useSyncCollection({ collection: 'centros-costo', getData: () => centros, setData: setCentros, ...syncCallbacks })
  useSyncCollection({ collection: 'transferencias', getData: () => transferencias, setData: setTransferencias, ...syncCallbacks })
  useSyncCollection({ collection: 'ajustes-inventario', getData: () => ajustes, setData: setAjustes, ...syncCallbacks })
  useSyncCollection({ collection: 'recepcion-facturas', getData: () => recepciones, setData: setRecepciones, ...syncCallbacks })
  useSyncCollection({ collection: 'recepcion-remisiones', getData: () => remisiones, setData: setRemisiones, ...syncCallbacks })
  useSyncCollection({ collection: 'usuarios', getData: () => usuarios, setData: setUsuarios, ...syncCallbacks })
  useSyncCollection({ collection: 'carga-inicial', getData: () => cargas, setData: setCargas, ...syncCallbacks })
  useSyncCollection({ collection: 'modulos-sistema', getData: () => modulosSistema, setData: setModulosSistema, ...syncCallbacks })
  useSyncCollection({ collection: 'personal-empresa', getData: () => personalEmpresa, setData: setPersonalEmpresa, ...syncCallbacks })
  useSyncCollection({ collection: 'tareas', getData: () => tareas, setData: setTareas, ...syncCallbacks })
  useSyncCollection({ collection: 'pedidos', getData: () => pedidos, setData: setPedidos, ...syncCallbacks })
  useSyncCollection({ collection: 'pagos-proveedores', getData: () => pagosProveedoresData, setData: setPagosProveedores, isObject: true, ...syncCallbacks })
  useSyncCollection({ collection: 'datos-empresa', getData: () => empresas, setData: setEmpresas, ...syncCallbacks })
  useSyncCollection({ collection: 'control-bancario', getData: () => controlBancarioData, setData: setControlBancario, isObject: true, ...syncCallbacks })

  return (
    <>
      {status === 'disconnected' && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center py-2 text-sm font-medium animate-pulse">
          Servidor desconectado — Reconectando automaticamente...
        </div>
      )}
      {children}
    </>
  )
}
