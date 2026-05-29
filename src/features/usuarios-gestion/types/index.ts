// ─── Roles ────────────────────────────────────────────────────────────────────

export const ROLES = ['Admin', 'Ventas', 'Almacen', 'Compras'] as const
export type Rol = typeof ROLES[number]

export const ROLES_LABELS: Record<Rol, string> = {
  Admin: 'Administrador',
  Ventas: 'Ventas',
  Almacen: 'Almacén',
  Compras: 'Compras',
}

// ─── Estados ──────────────────────────────────────────────────────────────────

export const ESTADOS = ['Activo', 'Inactivo', 'Bloqueado'] as const
export type Estado = typeof ESTADOS[number]

export const ESTADOS_CONFIG: Record<Estado, { label: string; color: string; bg: string; border: string }> = {
  Activo: { label: 'Activo', color: '#93c5fd', bg: 'rgba(96,165,250,0.2)', border: 'rgba(96,165,250,0.3)' },
  Inactivo: { label: 'Inactivo', color: '#fcd34d', bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.3)' },
  Bloqueado: { label: 'Bloqueado', color: '#fca5a5', bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.3)' },
}

// ─── Módulos ──────────────────────────────────────────────────────────────────

export const MODULOS = [
  // ── Principales ──
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'productos', label: 'Productos' },
  { id: 'kardex', label: 'Kardex de Productos' },
  { id: 'proveedores', label: 'Proveedores' },
  // ── Compras ──
  { id: 'ordenes-compra', label: 'Órdenes de Compra' },
  { id: 'recepcion-facturas', label: 'Recepción de Facturas' },
  { id: 'recepcion-remisiones', label: 'Recepción de Remisiones' },
  { id: 'pagos-proveedores', label: 'Pagos Proveedores y Servicios' },
  { id: 'control-bancario', label: 'Control Bancario' },
  // ── Almacén ──
  { id: 'bodegas', label: 'Bodegas' },
  { id: 'transferencias', label: 'Transferencias' },
  { id: 'salidas-almacen', label: 'Salidas de Almacén' },
  { id: 'ajustes-inventario', label: 'Ajustes de Inventario' },
  { id: 'toma-inventario-fisico', label: 'Toma de Inventario Físico' },
  { id: 'centros-costo', label: 'Centros de Costo' },
  // ── Producción ──
  { id: 'formulas', label: 'Fórmulas' },
  { id: 'ordenes-produccion', label: 'Órdenes de Producción' },
  { id: 'ejecucion-produccion', label: 'Ejecución de Producción' },
  { id: 'ajustes-materia-prima', label: 'Ajustes Materia Prima' },
  // ── Operaciones ──
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'personal-empresa', label: 'Personal Empresa' },
  { id: 'correos-enviados', label: 'Correos Enviados' },
  { id: 'asistente', label: 'Agente IA' },
  // ── Configuración ──
  { id: 'referencias', label: 'Tablas de Referencias' },
  { id: 'datos-empresa', label: 'Datos Empresa' },
  { id: 'usuarios', label: 'Gestión de Usuarios' },
  { id: 'modulos-sistema', label: 'Módulos Sistema' },
] as const

export type ModuloId = typeof MODULOS[number]['id']

// ─── Permisos ─────────────────────────────────────────────────────────────────

export interface PermisoModulo {
  modulo: ModuloId
  leer: boolean
  registrar: boolean
  editar: boolean
  eliminar: boolean
}

// ─── Usuario ──────────────────────────────────────────────────────────────────

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  usuario: string
  clave: string
  correo: string
  rol: string
  situacion: string
  permisos: PermisoModulo[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function permisosAdmin(): PermisoModulo[] {
  return MODULOS.map(m => ({ modulo: m.id, leer: true, registrar: true, editar: true, eliminar: true }))
}

export function permisosSoloLectura(): PermisoModulo[] {
  return MODULOS.map(m => ({ modulo: m.id, leer: true, registrar: false, editar: false, eliminar: false }))
}
