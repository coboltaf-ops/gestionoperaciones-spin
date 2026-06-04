import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
  categoria: [],
  grupo: [],
  subgrupo: [],
  unidad_medida: [],
  tipo_inventario: [],
  tipo_moneda: [],
  actividad_proveedor: [],
  condiciones_pago: [],
  situacion_producto: [],
  situacion_orden_compra: [],
  situacion_bodega: [],
  situacion_proveedor: [],
  tipo_identificacion: [],
  tipo_ajuste: [],
  impuesto: [],
  referencia_proveedor: [],
  ciudad: [],
  pais: [],
  roles: [],
  estado_recepcion_factura: [],
  situacion_tarea: [],
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
        set((state) => {
          const updated = { ...state.data, [tableId]: sortRecords([...state.data[tableId], newRecord]) }
          console.log(`[addRecord] ${tableId} ahora tiene ${updated[tableId].length} registros`)
          return { data: updated }
        })
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
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<ReferenceState>;
        const currentState = (current as ReferenceState | undefined) ?? { data: initialData };
        const persistedData = p.data ?? currentState.data ?? initialData;

        // Ordenar TODAS las tablas al rehidratar
        const sortedData = Object.fromEntries(
          Object.entries(persistedData ?? {}).map(([key, records]) => [
            key,
            sortRecords((records as BaseReference[]) || (currentState.data?.[key as ReferenceTableId] as BaseReference[]) || [])
          ])
        ) as Record<ReferenceTableId, BaseReference[]>;

        return {
          ...currentState,
          ...p,
          data: sortedData,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Zustand] Error rehydrating referencias:', error)
        } else {
          const catCount = state?.data.categoria?.length || 0
          console.log(`[Zustand] ✅ Referencias hidratadas (${catCount} categorías)`)
        }
      },
    }
  )
)
