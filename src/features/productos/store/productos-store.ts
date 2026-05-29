import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    (set) => ({
      productos: [],
      addProducto: (p) => set((s) => ({ productos: [...s.productos, p] })),
      addProductos: (ps) => set((s) => ({ productos: [...s.productos, ...ps] })),
      updateProducto: (id, p) => set((s) => ({ productos: s.productos.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deleteProducto: (id) => set((s) => ({ productos: s.productos.filter((r) => r.id !== id) })),
      deleteAllProductos: () => set({ productos: [] }),
      resetExistencias: () => set((s) => ({ productos: s.productos.map((r) => ({ ...r, existencia: 0 })) })),
      setExistencias: (cantidad) => set((s) => ({ productos: s.productos.map((r) => ({ ...r, existencia: cantidad })) })),
      resetUltCosto: () => set((s) => ({ productos: s.productos.map((r) => ({ ...r, ult_costo: 0 })) })),
    }),
    {
      name: 'productos-storage',
      merge: (persisted, current) => {
        const p = persisted as Partial<ProductosState>
        // Filtrar registros inválidos que no tengan campo 'codigo'
        const validPrefix = /^(PROD|MAP|PTER|PSEL|SERV)-\d+$/
        const productos = (p.productos ?? current.productos)
          .filter((r) => r && typeof r.codigo === 'string' && validPrefix.test(r.codigo))
          .map((r) => ({
            ...r,
            // Auto-llenar codigo_barra con el codigo del producto si está vacío
            codigo_barra: r.codigo_barra || r.codigo,
          }))
        return { ...current, ...p, productos }
      },
    }
  )
)