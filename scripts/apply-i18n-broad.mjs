#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// SAFE replacements: only match `>TEXT<` (JSX text children) and specific patterns.
// Sorted by length DESC to avoid shorter substrings matching first.

// Format: [spanishText, i18nCall, ns]
// ns is the namespace (to build useTranslations call)
const FIELD_TEXTS = [
  ['Reporte Específico de Inventario', 'reporteEspecificoInventario'],
  ['Órdenes Pendientes de Ejecución', 'ordenesPendientesEjecucion'],
  ['Subtotal antes de Impuesto', 'subtotalAntesImpuesto'],
  ['Descripción del Reporte', 'descripcionReporte'],
  ['Título del Reporte', 'tituloReporte'],
  ['Título del reporte', 'tituloReporte'],
  ['No se encontraron productos', 'noSeEncontraronProductos'],
  ['Inventario Valorizado', 'inventarioValorizado'],
  ['Persona que Recibe', 'personaRecibe'],
  ['Persona que Emite', 'personaEmite'],
  ['Datos del Proveedor', 'datosProveedor'],
  ['Producto Terminado', 'productoTerminado'],
  ['Fecha de Solicitud', 'fechaSolicitud'],
  ['Unidad de Medida', 'unidadMedida'],
  ['Condicion de Pago', 'condicionPago'],
  ['Condición de Pago', 'condicionPago'],
  ['Configurar Reporte', 'configurarReporte'],
  ['Fecha Vencimiento', 'fechaVencimiento'],
  ['Todas las bodegas', 'todasBodegas'],
  ['Total Productos', 'totalProductos'],
  ['Fecha Aprobación', 'fechaAprobacion'],
  ['Centro de Costo', 'centroCosto'],
  ['Orden de Pedido', 'ordenPedido'],
  ['Orden de Compra', 'ordenCompra'],
  ['Tipo de Ajuste', 'tipoAjuste'],
  ['Bodega Llegada', 'bodegaLlegada'],
  ['Unidad Medida', 'unidadMedida'],
  ['Nombre completo', 'nombreCompleto'],
  ['Bodega Salida', 'bodegaSalida'],
  ['Fecha Emisión', 'fechaEmision'],
  ['Solicitado por', 'solicitadoPor'],
  ['Elaborado por', 'elaboradoPor'],
  ['Recibido por', 'recibidoPor'],
  ['Revisado por', 'revisadoPor'],
  ['Vista Previa', 'vistaPrevia'],
  ['Aprobado por', 'aprobadoPor'],
  ['Ya Recibido', 'yaRecibido'],
  ['Valor Total', 'valorTotal'],
  ['Valor Final', 'valorFinal'],
  ['Usa Seriales', 'usaSeriales'],
  ['Valor Neto', 'valorNeto'],
  ['Fecha Desde', 'fechaDesde'],
  ['Fecha Hasta', 'fechaHasta'],
  ['Correlativo', 'correlativo'],
  ['Comprador', 'comprador'],
  ['Categoría', 'categoria'],
  ['Dirección', 'direccion'],
  ['Existencia', 'existencia'],
  ['Descripción', 'descripcion'],
  ['Referencia', 'referencia'],
  ['Responsable', 'responsable'],
  ['Sub Grupo', 'subGrupo'],
  ['Renglones', 'renglones'],
  ['Proveedor', 'proveedor'],
  ['Cantidad', 'cantidad'],
  ['Observaciones', 'observaciones'],
  ['Situación', 'situacion'],
  ['Pendiente', 'pendiente'],
  ['Subtotal', 'subtotal'],
  ['Producto', 'producto'],
  ['Tipo ID', 'tipoId'],
  ['Ejecuta', 'ejecuta'],
  ['Asunto', 'asunto'],
  ['Bodega', 'bodega'],
  ['Ciudad', 'ciudad'],
  ['Correo', 'correo'],
  ['Código', 'codigo'],
  ['Estado', 'estado'],
  ['Unidad', 'unidad'],
  ['Grupo', 'grupo'],
  ['Costo', 'costo'],
  ['Todas', 'todas'],
  ['Todos', 'todos'],
  ['Desde', 'desde'],
  ['Hasta', 'hasta'],
  ['Fecha', 'fecha'],
  ['País', 'pais'],
  ['Tipo', 'tipo'],
  ['Nombre', 'nombre'],
]

const EMPTY_TEXTS = [
  ['No hay registros con los filtros seleccionados', 'noRegistrosFiltros'],
  ['No hay salidas de almacén registradas', 'noSalidas'],
  ['No hay tomas físicas registradas', 'noTomasFisicas'],
  ['No hay órdenes pendientes de ejecutar', 'noOrdenesPendientes'],
  ['No hay proveedores registrados', 'noProveedores'],
  ['No hay movimientos registrados', 'noMovimientos'],
  ['No hay ajustes registrados', 'noAjustes'],
  ['No hay bodegas registradas', 'noBodegas'],
  ['No hay empresas registradas', 'noEmpresas'],
  ['No hay fórmulas registradas', 'noFormulas'],
  ['No hay órdenes de producción', 'noOrdenesProduccion'],
  ['No hay correos enviados aún', 'noCorreos'],
  ['No hay tareas registradas', 'noTareas'],
  ['No hay registros', 'noRegistros'],
  ['No hay productos', 'noProductos'],
]

// Placeholders (attribute value)
const PLACEHOLDER_TEXTS = [
  ['Buscar por nombre, apellido, correo...', 'buscarNombreCorreo'],
  ['Buscar por nombre o documento...', 'buscarNombreDoc'],
  ['Buscar por código o descripción...', 'buscarCodigoDesc'],
  ['Buscar por codigo o descripcion...', 'buscarCodigoDesc'],
  ['Producto (código o nombre)...', 'buscarProducto'],
  ['Buscar proveedor...', 'buscarProveedor'],
  ['Buscar fórmula...', 'buscarFormula'],
  ['Buscar bodega...', 'buscarBodega'],
  ['Buscar...', 'buscar'],
]

// Confirm dialogs (in confirm('...'))
const CONFIRM_TEXTS = [
  ['¿Eliminar este ajuste? (No revierte el movimiento de inventario)', 'delAjusteInv'],
  ['¿Eliminar este registro de carga inicial?', 'delCargaInicial'],
  ['¿Colocar en 0 la existencia de TODOS los productos?', 'resetExistencias'],
  ['¿Colocar en 0 el Ult. Costo de TODOS los productos?', 'resetUltCosto'],
  ['¿Eliminar esta orden de producción?', 'delOrdenProd'],
  ['¿Eliminar esta salida de almacén?', 'delSalida'],
  ['¿Eliminar este centro de costo?', 'delCentroCosto'],
  ['¿Limpiar todo el historial de correos?', 'clearHistorialCorreos'],
  ['¿Eliminar esta transferencia?', 'delTransferencia'],
  ['¿Eliminar esta recepción?', 'delRecepcion'],
  ['¿Eliminar este proveedor?', 'delProveedor'],
  ['¿Eliminar esta fórmula?', 'delFormula'],
  ['¿Eliminar este producto?', 'delProducto'],
  ['¿Eliminar esta empresa?', 'delEmpresa'],
  ['¿Eliminar este registro?', 'delRegistro'],
  ['¿Eliminar este ajuste?', 'delAjuste'],
  ['¿Eliminar esta bodega?', 'delBodega'],
  ['¿Eliminar esta tarea?', 'delTarea'],
]

// Alert messages
const ALERT_TEXTS = [
  ['No hay productos con código de barra para los filtros seleccionados.', 'noProductosCodigoBarra'],
  ['No se puede eliminar un usuario con rol Admin.', 'noEliminarAdmin'],
  ['La imagen no debe superar 2 MB.', 'imagenMax2MB'],
]

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

function replaceJsxText(src, text, varName, key) {
  // Only match `>TEXT<` pattern (text is JSX children)
  const re = new RegExp(`>${escapeRe(text)}<`, 'g')
  let touched = false
  src = src.replace(re, () => { touched = true; return `>{${varName}('${key}')}<` })
  return { src, touched }
}

function replacePlaceholder(src, text, varName, key) {
  // Match `placeholder="TEXT"` exact attribute value
  const re = new RegExp(`placeholder="${escapeRe(text)}"`, 'g')
  let touched = false
  src = src.replace(re, () => { touched = true; return `placeholder={${varName}('${key}')}` })
  return { src, touched }
}

function replaceConfirmAlert(src, text, varName, key, fnName) {
  // Match `fnName('text'` (can be followed by )) — replace with fnName(varName('key')
  const re = new RegExp(`${fnName}\\('${escapeRe(text)}'`, 'g')
  let touched = false
  src = src.replace(re, () => { touched = true; return `${fnName}(${varName}('${key}')` })
  return { src, touched }
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
  // Insert after last existing useTranslations call (inside same component scope)
  const matches = [...src.matchAll(/^(\s*)const (t[A-Za-z]*) = useTranslations\('[^']+'\)/gm)]
  if (matches.length > 0) {
    const last = matches[matches.length - 1]
    const idx = last.index + last[0].length
    const indent = last[1]
    return src.slice(0, idx) + `\n${indent}const ${varName} = useTranslations('${ns}')` + src.slice(idx)
  }
  // Else add after first function signature
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
  const used = {
    tF: false,   // fields
    tE: false,   // empty
    tPh: false,  // placeholders
    tCf: false,  // confirm
    tAl: false,  // alerts
  }

  // Apply fields (longest first — list is already sorted)
  for (const [txt, key] of FIELD_TEXTS) {
    const r = replaceJsxText(src, txt, 'tF', key)
    src = r.src
    if (r.touched) used.tF = true
  }
  // Empty states
  for (const [txt, key] of EMPTY_TEXTS) {
    const r = replaceJsxText(src, txt, 'tE', key)
    src = r.src
    if (r.touched) used.tE = true
  }
  // Placeholders
  for (const [txt, key] of PLACEHOLDER_TEXTS) {
    const r = replacePlaceholder(src, txt, 'tPh', key)
    src = r.src
    if (r.touched) used.tPh = true
  }
  // Confirm
  for (const [txt, key] of CONFIRM_TEXTS) {
    const r = replaceConfirmAlert(src, txt, 'tCf', key, 'confirm')
    src = r.src
    if (r.touched) used.tCf = true
  }
  // Alert
  for (const [txt, key] of ALERT_TEXTS) {
    const r = replaceConfirmAlert(src, txt, 'tAl', key, 'alert')
    src = r.src
    if (r.touched) used.tAl = true
  }

  if (src !== original) {
    src = ensureImport(src)
    if (used.tF) src = ensureDecl(src, 'tF', 'fields')
    if (used.tE) src = ensureDecl(src, 'tE', 'empty')
    if (used.tPh) src = ensureDecl(src, 'tPh', 'placeholders')
    if (used.tCf) src = ensureDecl(src, 'tCf', 'confirm')
    if (used.tAl) src = ensureDecl(src, 'tAl', 'alerts')
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
