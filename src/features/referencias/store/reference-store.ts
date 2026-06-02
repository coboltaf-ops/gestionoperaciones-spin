import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BaseReference, ReferenceTableId } from '../types'

// Ordenar alfabéticamente por descripcion — se aplica en TODOS los puntos de entrada
function sortRecords<T extends BaseReference>(records: T[]): T[] {
  return [...records].sort((a, b) => a.descripcion.localeCompare(b.descripcion, 'es'))
}

interface ReferenceState {
  data: Record<ReferenceTableId, BaseReference[]>
  isLoading: boolean
  error: string | null
  activeTable: ReferenceTableId

  setActiveTable: (tableId: ReferenceTableId) => void
  fetchData: (tableId: ReferenceTableId) => Promise<void>
  addRecord: (tableId: ReferenceTableId, record: Omit<BaseReference, 'id'>) => Promise<void>
  updateRecord: (tableId: ReferenceTableId, id: string, record: Partial<BaseReference>) => Promise<void>
  deleteRecord: (tableId: ReferenceTableId, id: string) => Promise<void>
}

const initialData: Record<ReferenceTableId, BaseReference[]> = {
  categoria: [
    { id: '1', descripcion: 'Estructura', situacion: true },
    { id: '2', descripcion: 'Acabados', situacion: true },
    { id: '3', descripcion: 'Instalaciones Eléctricas', situacion: true },
    { id: '4', descripcion: 'Instalaciones Sanitarias', situacion: true },
    { id: '5', descripcion: 'Carpintería', situacion: true },
    { id: '6', descripcion: 'Herrería', situacion: true },
    { id: '7', descripcion: 'Impermeabilización', situacion: true },
    { id: '8', descripcion: 'Seguridad', situacion: true },
    { id: '9', descripcion: 'Equipos Tecnológicos', situacion: true },
  ],
  grupo: [
    { id: '1', descripcion: 'Concreto', situacion: true },
    { id: '2', descripcion: 'Acero', situacion: true },
    { id: '3', descripcion: 'Bloques y Ladrillos', situacion: true },
    { id: '4', descripcion: 'Pintura', situacion: true },
    { id: '5', descripcion: 'Cerámica y Porcelanato', situacion: true },
    { id: '6', descripcion: 'Cableado', situacion: true },
    { id: '7', descripcion: 'Iluminación', situacion: true },
    { id: '8', descripcion: 'Tuberías', situacion: true },
    { id: '9', descripcion: 'Grifería', situacion: true },
    { id: '10', descripcion: 'Madera', situacion: true },
    { id: '11', descripcion: 'Aluminio', situacion: true },
    { id: '12', descripcion: 'Membranas', situacion: true },
    { id: '13', descripcion: 'Computación', situacion: true },
  ],
  subgrupo: [
    { id: '1', descripcion: 'Cemento', situacion: true },
    { id: '2', descripcion: 'Arena', situacion: true },
    { id: '3', descripcion: 'Grava', situacion: true },
    { id: '4', descripcion: 'Varillas', situacion: true },
    { id: '5', descripcion: 'Mallas', situacion: true },
    { id: '6', descripcion: 'Bloques', situacion: true },
    { id: '7', descripcion: 'Ladrillos', situacion: true },
    { id: '8', descripcion: 'Interior', situacion: true },
    { id: '9', descripcion: 'Exterior', situacion: true },
    { id: '10', descripcion: 'Pisos', situacion: true },
    { id: '11', descripcion: 'Paredes', situacion: true },
    { id: '12', descripcion: 'Cables', situacion: true },
    { id: '13', descripcion: 'Breakers', situacion: true },
    { id: '14', descripcion: 'Lámparas', situacion: true },
    { id: '15', descripcion: 'PVC', situacion: true },
    { id: '16', descripcion: 'Cobre', situacion: true },
    { id: '17', descripcion: 'Llaves', situacion: true },
    { id: '18', descripcion: 'Puertas', situacion: true },
    { id: '19', descripcion: 'Ventanas', situacion: true },
    { id: '20', descripcion: 'Asfáltica', situacion: true },
    { id: '21', descripcion: 'Monitores', situacion: true },
    { id: '22', descripcion: 'Periféricos', situacion: true },
  ],
  unidad_medida: [
    { id: '1', descripcion: 'Unidad', situacion: true },
    { id: '2', descripcion: 'Saco', situacion: true },
    { id: '3', descripcion: 'Metro Cuadrado', situacion: true },
    { id: '4', descripcion: 'Metro Cúbico', situacion: true },
    { id: '5', descripcion: 'Metro Lineal', situacion: true },
    { id: '6', descripcion: 'Kilogramo', situacion: true },
    { id: '7', descripcion: 'Galón', situacion: true },
    { id: '8', descripcion: 'Rollo', situacion: true },
    { id: '9', descripcion: 'Cubeta', situacion: true },
  ],
  tipo_inventario: [{ id: '1', descripcion: 'Mercancía', situacion: true }, { id: '2', descripcion: 'Materia Prima', situacion: true }],
  tipo_moneda: [{ id: '1', descripcion: 'Dólar Americano', situacion: true }, { id: '2', descripcion: 'Bolívar', situacion: true }],
  actividad_proveedor: [],
  condiciones_pago: [{ id: '1', descripcion: 'Contado', situacion: true }, { id: '2', descripcion: '30 días', situacion: true }],
  situacion_producto: [
    { id: '1', descripcion: 'Activo', situacion: true },
    { id: '2', descripcion: 'Inactivo', situacion: true },
    { id: '3', descripcion: 'Descontinuado', situacion: true },
  ],
  situacion_orden_compra: [
    { id: '1', descripcion: 'Pendiente', situacion: true },
    { id: '2', descripcion: 'Aprobada', situacion: true },
    { id: '3', descripcion: 'Anulada', situacion: true },
    { id: '4', descripcion: 'Recibida', situacion: true },
  ],
  situacion_bodega: [
    { id: '1', descripcion: 'Activa', situacion: true },
    { id: '2', descripcion: 'Inactiva', situacion: true },
    { id: '3', descripcion: 'En Mantenimiento', situacion: true },
  ],
  situacion_proveedor: [
    { id: '1', descripcion: 'Activo', situacion: true },
    { id: '2', descripcion: 'Inactivo', situacion: true },
    { id: '3', descripcion: 'Bloqueado', situacion: true },
  ],
  tipo_identificacion: [
    { id: '1', descripcion: 'RIF', situacion: true },
    { id: '2', descripcion: 'Cédula', situacion: true },
    { id: '3', descripcion: 'Pasaporte', situacion: true },
  ],
  tipo_ajuste: [
    { id: '1', descripcion: 'Entrada por Sobrante', situacion: true, tipo: '+' as const },
    { id: '2', descripcion: 'Salida por Faltante', situacion: true, tipo: '-' as const },
    { id: '3', descripcion: 'Ajuste por Daño', situacion: true, tipo: '-' as const },
    { id: '4', descripcion: 'Ajuste por Reconteo', situacion: true, tipo: '+' as const },
  ],
  impuesto: [
    { id: '1', descripcion: '0%', situacion: true },
    { id: '2', descripcion: '7%', situacion: true },
    { id: '3', descripcion: '12%', situacion: true },
    { id: '4', descripcion: '16%', situacion: true },
    { id: '5', descripcion: '21%', situacion: true },
  ],
  referencia_proveedor: [
    { id: '1', descripcion: 'Banco Mercantil', detalle: '', situacion: true },
    { id: '2', descripcion: 'Banco Provincial', detalle: '', situacion: true },
    { id: '3', descripcion: 'Referencia Comercial', detalle: '', situacion: true },
    { id: '4', descripcion: 'Referencia Personal', detalle: '', situacion: true },
  ],
  ciudad: [
    { id: '1', descripcion: 'Caracas', situacion: true },
    { id: '2', descripcion: 'Maracaibo', situacion: true },
    { id: '3', descripcion: 'Valencia', situacion: true },
    { id: '4', descripcion: 'Barquisimeto', situacion: true },
    { id: '5', descripcion: 'Maracay', situacion: true },
    { id: '6', descripcion: 'San Cristóbal', situacion: true },
    { id: '7', descripcion: 'Puerto Ordaz', situacion: true },
    { id: '8', descripcion: 'Mérida', situacion: true },
  ],
  pais: [
    { id: '1', descripcion: 'Venezuela', situacion: true },
    { id: '2', descripcion: 'Colombia', situacion: true },
    { id: '3', descripcion: 'Estados Unidos', situacion: true },
    { id: '4', descripcion: 'Panamá', situacion: true },
  ],
  roles: [
    { id: '1', descripcion: 'Admin', situacion: true },
    { id: '2', descripcion: 'Ventas', situacion: true },
    { id: '3', descripcion: 'Almacen', situacion: true },
    { id: '4', descripcion: 'Compras', situacion: true },
  ],
  estado_recepcion_factura: [
    { id: '1', descripcion: 'Pendiente', situacion: true },
    { id: '2', descripcion: 'Recibida', situacion: true },
    { id: '3', descripcion: 'Rechazada', situacion: true },
    { id: '4', descripcion: 'En Revisión', situacion: true },
    { id: '5', descripcion: 'Aprobada', situacion: true },
  ],
  situacion_tarea: [
    { id: '1', descripcion: 'Pendiente', situacion: true },
    { id: '2', descripcion: 'En Proceso', situacion: true },
    { id: '3', descripcion: 'Completada', situacion: true },
    { id: '4', descripcion: 'Cancelada', situacion: true },
    { id: '5', descripcion: 'Vencida', situacion: true },
  ],
}

export const useReferenceStore = create<ReferenceState>()(
  persist(
    (set) => ({
      data: initialData,
      isLoading: false,
      error: null,
      activeTable: 'categoria' as ReferenceTableId,

      setActiveTable: (tableId) => set({ activeTable: tableId }),

      fetchData: async (_tableId) => {
        set({ isLoading: true })
        setTimeout(() => set({ isLoading: false }), 500)
      },

      addRecord: async (tableId, record) => {
        const state = useReferenceStore.getState()
        const exists = state.data[tableId].some(
          (r) => r.descripcion.trim().toLowerCase() === record.descripcion.trim().toLowerCase()
        )
        if (exists) {
          throw new Error(`Ya existe un registro con la descripción "${record.descripcion}" en esta tabla.`)
        }
        const newRecord = { ...record, id: crypto.randomUUID() } as BaseReference
        set((state) => ({
          data: { ...state.data, [tableId]: sortRecords([...state.data[tableId], newRecord]) }
        }))
      },

      updateRecord: async (tableId, id, record) => {
        if (record.descripcion != null) {
          const desc = record.descripcion
          const state = useReferenceStore.getState()
          const exists = state.data[tableId].some(
            (r) => r.id !== id && r.descripcion.trim().toLowerCase() === desc.trim().toLowerCase()
          )
          if (exists) {
            throw new Error(`Ya existe un registro con la descripción "${record.descripcion}" en esta tabla.`)
          }
        }
        set((state) => ({
          data: {
            ...state.data,
            [tableId]: sortRecords(state.data[tableId].map((r) => r.id === id ? { ...r, ...record } : r))
          }
        }))
      },

      deleteRecord: async (tableId, id) => {
        set((state) => ({
          data: {
            ...state.data,
            [tableId]: state.data[tableId].filter((r) => r.id !== id)
          }
        }))
      },
    }),
    {
      name: 'referencias-storage',
      merge: (persisted, current) => {
        const p = persisted as Partial<ReferenceState>
        const persistedData = p.data ?? current.data

        // Ordenar TODAS las tablas al rehidratar
        const sortedData = Object.fromEntries(
          Object.entries(persistedData).map(([key, records]) => [
            key,
            sortRecords((records as BaseReference[]) || current.data[key as ReferenceTableId] || [])
          ])
        ) as Record<ReferenceTableId, BaseReference[]>

        return {
          ...current,
          ...p,
          data: sortedData,
        }
      },
    }
  )
)
