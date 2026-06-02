import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Producto = {
  id: string
  codigo: string
  descripcion: string
  tipo_inventario: string
  categoria: string
  grupo: string
  sub_grupo: string
  ult_costo: number
  costo_promedio: number
  precio_unitario: number
  ult_proveedor: string
  codigo_barra: string
  maximo: number
  minimo: number
  unidad_medida: string
  existencia: number
  usa_seriales: boolean
  situacion: string
  imagen?: string
  // Trazabilidad
  fecha_ult_compra?: string
  fecha_ult_movimiento?: string
  nro_ult_documento?: string
  tipo_ult_movimiento?: string
}

interface ProductosState {
  productos: Producto[]
  addProducto: (p: Producto) => void
  addProductos: (ps: Producto[]) => void
  updateProducto: (id: string, p: Partial<Producto>) => void
  deleteProducto: (id: string) => void
  deleteAllProductos: () => void
  resetExistencias: () => void
  setExistencias: (cantidad: number) => void
  resetUltCosto: () => void
}

export const useProductosStore = create<ProductosState>()(
  persist(
    (set, get) => ({
      productos: [],
      addProducto: (p) => set((s) => {
        const updated = [...s.productos, p]
        console.log(`[addProducto] Total productos ahora: ${updated.length}`)
        return { productos: updated }
      }),
      addProductos: (ps) => set((s) => {
        const updated = [...s.productos, ...ps]
        console.log(`[addProductos] Added ${ps.length}, total ahora: ${updated.length}`)
        return { productos: updated }
      }),
      updateProducto: (id, p) => set((s) => ({ productos: s.productos.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deleteProducto: (id) => set((s) => {
        console.log('[deleteProducto] Deleting product with id:', id)
        const updated = s.productos.filter((r) => r.id !== id)
        console.log('[deleteProducto] Remaining products:', updated.length)
        return { productos: updated }
      }),
      deleteAllProductos: () => set({ productos: [] }),
      resetExistencias: () => set((s) => ({ productos: s.productos.map((r) => ({ ...r, existencia: 0 })) })),
      setExistencias: (cantidad) => set((s) => ({ productos: s.productos.map((r) => ({ ...r, existencia: cantidad })) })),
      resetUltCosto: () => set((s) => ({ productos: s.productos.map((r) => ({ ...r, ult_costo: 0 })) })),
    }),
    {
      name: 'productos-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Zustand] Error rehydrating productos:', error)
        } else {
          console.log(`[Zustand] ✅ Productos hidratados: ${state?.productos.length || 0}`)
        }
      },
    }
  )
)
