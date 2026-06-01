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

        // PRIMERO: Leer TODO sin filtros para ver qué hay realmente
        const { data: allData, error: err } = await supabase
          .from('producto')
          .select('*')

        if (err) {
          console.error('❌ Error fetching producto:', err)
          setError(err.message)
          setProductos([])
          return
        }

        console.log('📦 DATOS CRUDOS - Todos los producto:')
        console.log(allData)

        if (!allData || allData.length === 0) {
          console.warn('⚠️ No hay producto en la tabla')
          setProductos([])
          return
        }

        // Mostrar primer producto completo
        console.log('🔍 PRIMER PRODUCTO COMPLETO:')
        console.log(JSON.stringify(allData[0], null, 2))

        // Mostrar TODOS los campos disponibles
        if (allData.length > 0) {
          console.log('🏷️ CAMPOS DISPONIBLES EN PRODUCTO:')
          console.log(Object.keys(allData[0]))

          // Mostrar valores de tipo_inventario
          console.log('📋 VALORES DE TIPO_INVENTARIO EN TODOS LOS PRODUCTOS:')
          allData.forEach((p: any, idx: number) => {
            console.log(`  [${idx}] ${p.codigo}: tipo_inventario="${p.tipo_inventario}"`)
          })
        }

        // Filtrar y formatear los productos del primer select
        const productoFormateados = (allData || [])
          .filter((p: any) => p.situacion === true)
          .map((p: any) => ({
            id: p.id,
            codigo: p.codigo,
            descripcion: p.descripcion,
            unidad_medida: p.unidad_medida || 'KG', // Por defecto KG si no existe
            tipo_inventario: p.tipo_inventario || '',
          }))

        console.log('✅ PRODUCTOS FORMATEADOS:', productoFormateados)

        // Filtrar por tipo
        const filtered = tipoInventario
          ? productoFormateados.filter((p) => {
              const match = p.tipo_inventario === tipoInventario
              console.log(`  Comparando: "${p.tipo_inventario}" === "${tipoInventario}" → ${match}`)
              return match
            })
          : productoFormateados

        console.log(`🎯 FILTRADOS POR "${tipoInventario}": ${filtered.length}`)

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
