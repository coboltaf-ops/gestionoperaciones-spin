#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Text → [ns, key]
// ns: subtitles | sections | tooltips | reportTitles
const MAP = [
  // Subtitles (<p> under h1 — matched inside JSX as >text<)
  ['Catálogo y control de inventario', ['subtitles', 'productos']],
  ['Directorio de proveedores y contactos', ['subtitles', 'proveedores']],
  ['Gestión de almacenes y control de inventario', ['subtitles', 'bodegas']],
  ['Gestión y seguimiento de compras', ['subtitles', 'ordenesCompra']],
  ['Gestion y seguimiento de ordenes de pedido a proveedores', ['subtitles', 'pedidos']],
  ['Movimiento de productos entre almacenes', ['subtitles', 'transferencias']],
  ['Despacho de productos desde bodega', ['subtitles', 'salidasAlmacen']],
  ['Registro de entradas y salidas por ajuste', ['subtitles', 'ajustesInventario']],
  ['Entradas y salidas manuales de materia prima', ['subtitles', 'ajustesMateriaPrima']],
  ['Registro de existencias iniciales al comenzar operaciones', ['subtitles', 'cargaInicialInventario']],
  ['Registro de mercancía recibida contra órdenes de compra', ['subtitles', 'recepcionFacturas']],
  ['Gestión de centros de costo organizacionales', ['subtitles', 'centrosCosto']],
  ['Gestión del personal de la empresa', ['subtitles', 'personalEmpresa']],
  ['Administración de accesos y permisos', ['subtitles', 'usuarios']],
  ['Gestión y seguimiento de tareas asignadas', ['subtitles', 'tareas']],
  ['Historial de correos enviados a proveedores', ['subtitles', 'correosEnviados']],
  ['Activa o desactiva módulos del sistema para los usuarios', ['subtitles', 'modulosSistema']],
  ['Registro y gestión de datos empresariales', ['subtitles', 'datosEmpresa']],
  ['Planificar y gestionar la producción', ['subtitles', 'produccion']],
  ['Recetas y composición de productos terminados', ['subtitles', 'formulas']],
  ['Selecciona un producto para ver su Kardex completo', ['subtitles', 'kardex']],
  ['Listado completo del inventario con valor total', ['subtitles', 'inventarioValorizado']],
  ['Montos agrupados por categoría con total general', ['subtitles', 'montosCategoria']],
  ['Seleccione el reporte que desea generar', ['subtitles', 'seleccioneReporte']],

  // Sections <h2>
  ['Nuevo Ajuste —', ['sections', 'nuevoAjuste']],
  ['Nuevo Movimiento —', ['sections', 'nuevoMovimiento']],
  ['Nueva Carga Inicial —', ['sections', 'nuevaCargaInicial']],
  ['Nueva Transferencia —', ['sections', 'nuevaTransferencia']],
  ['Detalle de Empresa', ['sections', 'detalleEmpresa']],
  ['Filtros del Reporte', ['sections', 'filtrosReporte']],
  ['Historial de Ejecuciones', ['sections', 'historialEjecuciones']],

  // Tooltips (title= attr)
  ['Detalle de Bodega', ['tooltips', 'detalleBodega']],
  ['Detalle de Centro de Costo', ['tooltips', 'detalleCentroCosto']],
  ['Este módulo no puede desactivarse', ['tooltips', 'moduloNoDesactivar']],
  ['Ver Kardex', ['tooltips', 'verKardex']],
]

// ReportPanel title props & useState initial values for report titles
const REPORT_TITLES = [
  ['Reporte de Ajustes de Inventario', 'ajustesInventario'],
  ['Reporte de Bodegas', 'bodegas'],
  ['Reporte de Centros de Costo', 'centrosCosto'],
  ['Reporte de Movimientos de Bodega', 'movimientosBodega'],
  ['Reporte de Salidas de Almacén', 'salidasAlmacen'],
  ['Reporte de Transferencias entre Bodegas', 'transferencias'],
  ['Reporte de Transferencias', 'transferencias'],
  ['Reporte de Correos Enviados', 'correosEnviados'],
  ['Reporte de Ordenes de Compra', 'ordenesCompra'],
  ['Reporte de Ordenes de Pedido', 'ordenesPedido'],
  ['Reporte de Productos', 'productos'],
  ['Reporte de Proveedores', 'proveedores'],
  ['Reporte de Recepción de Facturas', 'recepcionFacturas'],
  ['Reporte de Usuarios', 'usuarios'],
  ['Reporte de Inventarios por Categoría', 'inventariosCategoria'],
]

const VAR_FOR_NS = { subtitles: 'tSub', sections: 'tSec', tooltips: 'tTip', reportTitles: 'tRpt' }

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry.endsWith('.tsx')) acc.push(full)
  }
  return acc
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureImport(src) {
  if (src.includes(`from 'next-intl'`)) return src
  if (src.startsWith(`'use client'\n`)) {
    return src.replace(/^'use client'\n/, `'use client'\n\nimport { useTranslations } from 'next-intl'\n`)
  }
  return `import { useTranslations } from 'next-intl'\n${src}`
}

function ensureDecl(src, varName, ns) {
  const declRe = new RegExp(`const ${varName} = useTranslations\\('${ns}'\\)`)
  if (declRe.test(src)) return src
  const matches = [...src.matchAll(/^(\s*)const (t[A-Za-z]*) = useTranslations\('[^']+'\)/gm)]
  if (matches.length > 0) {
    const last = matches[matches.length - 1]
    const idx = last.index + last[0].length
    const indent = last[1]
    return src.slice(0, idx) + `\n${indent}const ${varName} = useTranslations('${ns}')` + src.slice(idx)
  }
  const fnRegex = /((?:export default )?function [A-Z][A-Za-z0-9]+\([^)]*\)\s*\{)/
  if (fnRegex.test(src)) {
    return src.replace(fnRegex, `$1\n  const ${varName} = useTranslations('${ns}')`)
  }
  return src
}

let total = 0
let touched = 0

const mainDir = resolve(root, 'src/app/(main)')
const files = walk(mainDir)

for (const file of files) {
  total++
  let src = readFileSync(file, 'utf8')
  const original = src
  const used = { tSub: false, tSec: false, tTip: false, tRpt: false }

  // Apply MAP entries
  for (const [text, [ns, key]] of MAP) {
    const varName = VAR_FOR_NS[ns]
    // Pattern: >text< (JSX children)
    const reJsx = new RegExp(`>${escapeRe(text)}<`, 'g')
    if (reJsx.test(src)) {
      src = src.replace(reJsx, `>{${varName}('${key}')}<`)
      used[varName] = true
    }
    // Pattern: title="text" (attribute)
    const reAttr = new RegExp(`title="${escapeRe(text)}"`, 'g')
    if (reAttr.test(src)) {
      src = src.replace(reAttr, `title={${varName}('${key}')}`)
      used[varName] = true
    }
  }

  // ReportPanel title="..."
  for (const [text, key] of REPORT_TITLES) {
    const re = new RegExp(`title="${escapeRe(text)}"`, 'g')
    if (re.test(src)) {
      src = src.replace(re, `title={tRpt('${key}')}`)
      used.tRpt = true
    }
    // Also handle useState('Reporte de X') pattern
    const reState = new RegExp(`useState\\('${escapeRe(text)}'\\)`, 'g')
    if (reState.test(src)) {
      src = src.replace(reState, `useState(tRpt('${key}'))`)
      used.tRpt = true
    }
    // Also handle >text< in <h2> JSX
    const reJsx = new RegExp(`>${escapeRe(text)}<`, 'g')
    if (reJsx.test(src)) {
      src = src.replace(reJsx, `>{tRpt('${key}')}<`)
      used.tRpt = true
    }
  }

  if (src !== original) {
    src = ensureImport(src)
    if (used.tSub) src = ensureDecl(src, 'tSub', 'subtitles')
    if (used.tSec) src = ensureDecl(src, 'tSec', 'sections')
    if (used.tTip) src = ensureDecl(src, 'tTip', 'tooltips')
    if (used.tRpt) src = ensureDecl(src, 'tRpt', 'reportTitles')
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
