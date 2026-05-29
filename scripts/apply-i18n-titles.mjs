#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const MODULES = [
  { file: 'src/app/(main)/proveedores/page.tsx', fnName: 'ProveedoresPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Proveedores</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('proveedores')}</h1>`]] },
  { file: 'src/app/(main)/ordenes-compra/page.tsx', fnName: 'OrdenesCompraPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Órdenes de Compra</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('ordenesCompra')}</h1>`]] },
  { file: 'src/app/(main)/bodegas/page.tsx', fnName: 'BodegasPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Bodegas</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('bodegas')}</h1>`]] },
  { file: 'src/app/(main)/transferencias/page.tsx', fnName: 'TransferenciasPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Transferencias entre Bodegas</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('transferencias')}</h1>`]] },
  { file: 'src/app/(main)/centros-costo/page.tsx', fnName: 'CentrosCostoPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Centros de Costo</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('centrosCosto')}</h1>`]] },
  { file: 'src/app/(main)/correos-enviados/page.tsx', fnName: 'CorreosEnviadosPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Correos Enviados</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('correosEnviados')}</h1>`]] },
  { file: 'src/app/(main)/tareas/page.tsx', fnName: 'TareasPage', replacements: [[`<h1 className="text-2xl font-bold text-white">Tareas</h1>`, `<h1 className="text-2xl font-bold text-white">{t('tareas')}</h1>`]] },
  { file: 'src/app/(main)/personal-empresa/page.tsx', fnName: 'PersonalEmpresaPage', replacements: [[`<h1 className="text-2xl font-bold text-white">Personal Empresa</h1>`, `<h1 className="text-2xl font-bold text-white">{t('personalEmpresa')}</h1>`]] },
  { file: 'src/app/(main)/pedidos/page.tsx', fnName: 'PedidosPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Ordenes de Pedido</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('pedidos')}</h1>`]] },
  { file: 'src/app/(main)/asistente/page.tsx', fnName: 'AsistentePage', replacements: [[`            Asistente de Voz\n          </h1>`, `            {t('asistente')}\n          </h1>`]] },
  { file: 'src/app/(main)/datos-empresa/page.tsx', fnName: 'DatosEmpresaPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Datos Empresa</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('datosEmpresa')}</h1>`]] },
  { file: 'src/app/(main)/usuarios/page.tsx', fnName: 'UsuariosPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Usuarios</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('usuarios')}</h1>`]] },
  { file: 'src/app/(main)/modulos-sistema/page.tsx', fnName: 'ModulosSistemaPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Módulos del Sistema</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('modulosSistema')}</h1>`]] },
  { file: 'src/app/(main)/kardex/page.tsx', fnName: 'KardexPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Kardex de Productos</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('kardex')}</h1>`]] },
  { file: 'src/app/(main)/formulas/page.tsx', fnName: 'FormulasPage', replacements: [[`<h1 className="text-2xl font-bold text-white">Fórmulas de Producción</h1>`, `<h1 className="text-2xl font-bold text-white">{t('formulas')}</h1>`]] },
  { file: 'src/app/(main)/ordenes-produccion/page.tsx', fnName: 'OrdenesProduccionPage', replacements: [[`<h1 className="text-2xl font-bold text-white">Órdenes de Producción</h1>`, `<h1 className="text-2xl font-bold text-white">{t('ordenesProduccion')}</h1>`]] },
  { file: 'src/app/(main)/ejecucion-produccion/page.tsx', fnName: 'EjecucionProduccionPage', replacements: [[`<h1 className="text-2xl font-bold text-white">Ejecución de Producción</h1>`, `<h1 className="text-2xl font-bold text-white">{t('ejecucionProduccion')}</h1>`]] },
  { file: 'src/app/(main)/ajustes-materia-prima/page.tsx', fnName: 'AjustesMateriaPrimaPage', replacements: [[`<h1 className="text-2xl font-bold text-white">Ajustes de Materia Prima</h1>`, `<h1 className="text-2xl font-bold text-white">{t('ajustesMateriaPrima')}</h1>`]] },
  { file: 'src/app/(main)/ajustes-inventario/page.tsx', fnName: 'AjustesInventarioPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Ajustes de Inventario</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('ajustesInventario')}</h1>`], [`<h1 className="text-3xl font-bold text-white">Ajuste de Inventario</h1>`, `<h1 className="text-3xl font-bold text-white">{t('ajusteInventarioDetail')}</h1>`]] },
  { file: 'src/app/(main)/carga-inicial-inventario/page.tsx', fnName: 'CargaInicialInventarioPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Carga Inicial de Inventario</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('cargaInicialInventario')}</h1>`], [`<h1 className="text-3xl font-bold text-white">Carga Inicial de Inventario</h1>`, `<h1 className="text-3xl font-bold text-white">{t('cargaInicialInventario')}</h1>`]] },
  { file: 'src/app/(main)/recepcion-facturas/page.tsx', fnName: 'RecepcionFacturasPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Recepción de Facturas</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('recepcionFacturas')}</h1>`], [`<h1 className="text-3xl font-bold text-white">Recepción de Factura</h1>`, `<h1 className="text-3xl font-bold text-white">{t('recepcionFacturaDetail')}</h1>`]] },
  { file: 'src/app/(main)/salidas-almacen/page.tsx', fnName: 'SalidasAlmacenPage', replacements: [[`<h1 className="text-3xl font-bold text-white tracking-tight">Salidas de Almacén</h1>`, `<h1 className="text-3xl font-bold text-white tracking-tight">{t('salidasAlmacen')}</h1>`], [`<h1 className="text-3xl font-bold text-white">Salida de Almacén</h1>`, `<h1 className="text-3xl font-bold text-white">{t('salidaAlmacenDetail')}</h1>`]] },
  { file: 'src/app/(main)/toma-inventario-fisico/page.tsx', fnName: 'TomaInventarioFisicoPage', replacements: [[`📋 Toma de Inventario Físico</h1>`, `📋 {t('tomaInventarioFisico')}</h1>`], [`>Generar Plantilla de Conteo</h2>`, `>{t('tomaGenerarPlantilla')}</h2>`], [`>Cargar Excel con Conteos</h2>`, `>{t('tomaCargarExcel')}</h2>`], [`>Historial de Tomas Físicas</h2>`, `>{t('tomaHistorial')}</h2>`]] },
]

function apply(file, fnName, replacements) {
  const abs = resolve(root, file)
  let src = readFileSync(abs, 'utf8')
  const original = src

  // 1. Add import if not present
  if (!src.includes(`from 'next-intl'`)) {
    src = src.replace(/^'use client'\n/, `'use client'\n\nimport { useTranslations } from 'next-intl'\n`)
  } else if (!src.match(/useTranslations/)) {
    // import line exists but missing useTranslations — add to existing import
    src = src.replace(/from 'next-intl'/, (m) => m)
  }

  // 2. Add const t = useTranslations('pages') after fn signature
  const fnRegex = new RegExp(`export default function ${fnName}\\([^)]*\\)\\s*\\{`)
  if (!src.match(new RegExp(`const t = useTranslations\\('pages'\\)`))) {
    src = src.replace(fnRegex, (m) => `${m}\n  const t = useTranslations('pages')`)
  }

  // 3. Apply text replacements
  for (const [from, to] of replacements) {
    if (src.includes(from)) {
      src = src.replace(from, to)
    } else {
      console.warn(`[WARN] ${file}: replacement NOT FOUND → ${from.slice(0, 60)}...`)
    }
  }

  if (src !== original) {
    writeFileSync(abs, src, 'utf8')
    console.log(`[OK]  ${file}`)
  } else {
    console.log(`[skip] ${file} (no changes)`)
  }
}

for (const m of MODULES) {
  try {
    apply(m.file, m.fnName, m.replacements)
  } catch (e) {
    console.error(`[ERR] ${m.file}: ${e.message}`)
  }
}
