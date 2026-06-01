import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Producto = {
  id: string
  codigo: string
  descripcion: string
  unidad_medida: string
  tipo_inventario: string
}

export function useProductos(tipoInventario?: string) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const supabase = createClient()

        // 1. Leer de Supabase
        const { data: supabaseData } = await supabase.from('producto').select('*')
        const productosSupabase = (supabaseData || [])
          .filter((p: any) => p.situacion === true)
          .map((p: any) => ({
            id: p.id,
            codigo: p.codigo,
            descripcion: p.descripcion,
            unidad_medida: p.unidad_medida || 'KG',
            tipo_inventario: p.tipo_inventario || '',
          }))

        // 2. Leer de localStorage (productos-storage)
        const storedData = typeof window !== 'undefined' ? localStorage.getItem('productos-storage') : null
        const productosLocal: Producto[] = []

        if (storedData) {
          try {
            const parsed = JSON.parse(storedData)
            if (parsed.state?.productos && Array.isArray(parsed.state.productos)) {
              productosLocal.push(
                ...parsed.state.productos
                  .filter((p: any) => p && p.codigo && p.situacion === 'Activo')
                  .map((p: any) => ({
                    id: p.id,
                    codigo: p.codigo,
                    descripcion: p.descripcion,
                    unidad_medida: p.unidad_medida || 'Unidad',
                    tipo_inventario: p.tipo_inventario || '',
                  }))
              )
            }
          } catch (e) {
            console.warn('⚠️ Error parsing localStorage productos-storage')
          }
        }

        // 3. Combinar: Supabase + localStorage (sin duplicados por código)
        const codigosSeen = new Set<string>()
        const productosCombinados: Producto[] = []

        for (const p of [...productosSupabase, ...productosLocal]) {
          if (!codigosSeen.has(p.codigo)) {
            codigosSeen.add(p.codigo)
            productosCombinados.push(p)
          }
        }

        console.log(`📦 TOTAL PRODUCTOS: ${productosCombinados.length} (Supabase: ${productosSupabase.length}, localStorage: ${productosLocal.length})`)

        // 4. Filtrar por tipo si es necesario
        const filtered = tipoInventario
          ? productosCombinados.filter((p) => p.tipo_inventario === tipoInventario)
          : productosCombinados

        setProductos(filtered)
        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        console.error('❌ Error en useProductos:', errorMsg)
        setError(errorMsg)
        setProductos([])
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [tipoInventario])

  return { productos, loading, error }
}
