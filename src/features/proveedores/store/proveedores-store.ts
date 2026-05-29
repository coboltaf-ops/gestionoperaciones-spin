import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Proveedor = {
  id: string
  nombre: string
  tipo_id: string
  nro_documento: string
  actividad: string
  correo: string
  telf_oficina: string
  movil_oficina: string
  persona_contacto: string
  referencias: string
  observacion_referencia: string
  direccion: string
  ciudad: string
  pais: string
  situacion: string
  // ── Régimen DIAN en Colombia ──
  tipo_persona?: 'Natural' | 'Jurídica' | ''
  regimen_iva?: 'Responsable IVA' | 'No Responsable IVA' | 'Régimen Simple' | ''
  autorretenedor_renta?: 'Sí' | 'No' | ''
  gran_contribuyente?: 'Sí' | 'No' | ''
  regimen_tributario?: 'Ordinario' | 'Simple' | ''
  agente_retenedor_iva?: 'Sí' | 'No' | ''
  actividad_ciiu?: string                 // Código CIIU (ej. "4663 - Comercio al por mayor...")
  pct_retencion_renta?: number            // % Retención en la fuente por renta
  pct_retencion_iva?: number              // % Retención de IVA (0, 15, 50, 100)
  pct_retencion_ica?: number              // Tarifa ICA en por mil (ej. 9.66)
  responsable_ica?: 'Sí' | 'No' | ''
  responsabilidades_rut?: string          // Códigos RUT separados por coma (O-13, O-15, O-47, etc.)
  resolucion_facturacion?: string         // Resolución DIAN para facturación electrónica
  correo_notificacion_dian?: string       // Correo certificado para notificaciones DIAN
}

interface ProveedoresState {
  proveedores: Proveedor[]
  addProveedor: (p: Proveedor) => void
  updateProveedor: (id: string, p: Partial<Proveedor>) => void
  deleteProveedor: (id: string) => void
}

export const useProveedoresStore = create<ProveedoresState>()(
  persist(
    (set) => ({
      proveedores: [
        { id: '1', nombre: 'Distribuidora Tech C.A.', tipo_id: 'RIF', nro_documento: 'J-12345678-9', actividad: 'Tecnología', correo: 'ventas@disttech.com', telf_oficina: '0212-5550001', movil_oficina: '0414-5551234', persona_contacto: 'Carlos Pérez', referencias: 'Banco Mercantil', observacion_referencia: '', direccion: 'Calle Real #10', ciudad: 'Caracas', pais: 'Venezuela', situacion: 'Activo' },
      ],
      addProveedor: (p) => set((s) => ({ proveedores: [...s.proveedores, p] })),
      updateProveedor: (id, p) => set((s) => ({ proveedores: s.proveedores.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deleteProveedor: (id) => set((s) => ({ proveedores: s.proveedores.filter((r) => r.id !== id) })),
    }),
    { name: 'proveedores-storage' }
  )
)
