#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// [spanishText, [namespace, key]] — sorted longest-first for safety
const MAP = [
  // Help text (subtitles + long help texts)
  ['Ejecutar órdenes, ajustar materia prima y registrar producción', ['help', 'ejecutarSubtitle']],
  ['Historial completo de movimientos por producto en todas las bodegas', ['help', 'kardexSubtitle']],
  ['El personal va a la bodega y cuenta cada producto', ['help', 'personalCuenta']],
  ['Seleccione una Orden de Compra para ver sus renglones', ['help', 'seleccioneOCRenglones']],
  ['Seleccione la bodega y descargue la plantilla', ['help', 'seleccioneBodegaTemplate']],
  ['Imprima o abra el Excel en el dispositivo', ['help', 'imprimaExcel']],
  ['Guarde el archivo y pase a la pestaña', ['help', 'guardeArchivo']],
  ['Escribe la cantidad contada en la columna', ['help', 'escribeCantidad']],
  // Empty states
  ['Sin productos para los filtros seleccionados', ['emptyState', 'sinProductosFiltros']],
  ['Sin registros para los filtros seleccionados', ['emptyState', 'sinRegistrosFiltros']],
  ['Las tomas procesadas aparecerán aquí', ['emptyState', 'tomasProcesadas']],
  ['Sin productos registrados', ['emptyState', 'sinProductosRegistrados']],
  // Field labels — from fields namespace
  ['Renglones de la Orden de Compra', ['fields', 'renglonesOrdenCompra']],
  ['Persona que Autoriza', ['fields', 'personaAutoriza']],
  ['Materia Prima Requerida', ['fields', 'materiaPrimaRequerida']],
  ['Fecha Aprobación Recepción', ['fields', 'fechaAprobacionRecepcion']],
  ['Fecha Aprobación de Ingreso', ['fields', 'fechaAprobacionIngreso']],
  ['Fecha Real Finalización', ['fields', 'fechaRealFinalizacion']],
  ['Transferencia entre Bodegas', ['fields', 'transferenciaBodegas']],
  ['Transferencia de Productos', ['fields', 'transferenciaProductos']],
  ['Cantidad que Produce', ['fields', 'cantidadQueProduce']],
  ['Incluir columna de identificación', ['fields', 'incluirColumnaId']],
  ['Carga Inicial de Saldos', ['fields', 'cargaInicialSaldos']],
  ['Fecha Aprobación OC', ['fields', 'fechaAprobacionOC']],
  ['Nro. Orden de Pedido', ['fields', 'nroOrdenPedido']],
  ['Ajuste de Inventario', ['fields', 'ajusteInventario']],
  ['Salida de Almacén', ['fields', 'salidaAlmacen']],
  ['Recepción Factura', ['fields', 'recepcionFacturaItem']],
  ['Nro de Recepción', ['fields', 'nroRecepcion']],
  ['Productos a cargar', ['fields', 'productosACargar']],
  ['Logo de la Empresa', ['fields', 'logoEmpresa']],
  ['Logo de la empresa', ['fields', 'logoEmpresa']],
  ['Todas las Bodegas', ['fields', 'todasLasBodegas']],
  ['Filtros Aplicados', ['fields', 'filtrosAplicados']],
  ['Detalle del Correo', ['fields', 'detalleCorreo']],
  ['Foto del Producto', ['fields', 'fotoProducto']],
  ['Código de Barra', ['fields', 'codigoBarra']],
  ['Correo Empresa', ['fields', 'correoEmpresa']],
  ['Bodega de Recepción', ['fields', 'bodegaRecepcion']],
  ['Fecha Programada', ['fields', 'fechaProgramada']],
  ['Sin Diferencia', ['fields', 'sinDiferencia']],
  ['Saldo Final', ['fields', 'saldoFinal']],
  ['Total Salidas', ['fields', 'totalSalidas']],
  ['Total Entradas', ['fields', 'totalEntradas']],
  ['Total General', ['fields', 'totalGeneral']],
  ['Total Carga', ['fields', 'totalCarga']],
  ['Bodega Entrada', ['fields', 'bodegaEntrada']],
  ['Almacenado por', ['fields', 'almacenadoPor']],
  ['Autorizado por', ['fields', 'autorizadoPor']],
  ['Despachado por', ['fields', 'despachadoPor']],
  ['Ejecutado por', ['fields', 'ejecutadoPor']],
  ['Preparado por', ['fields', 'preparadoPor']],
  ['Nro. Fórmula', ['fields', 'nroFormula']],
  ['Fecha Emision', ['fields', 'fechaEmisionNoAccent']],
  ['Nro. Tarea', ['fields', 'nroTarea']],
  ['Nro. Toma', ['fields', 'nroToma']],
  ['Emitido por', ['fields', 'emitidoPor']],
  ['Sobrantes', ['fields', 'sobrantes']],
  ['Faltantes', ['fields', 'faltantes']],
  ['Resultado', ['fields', 'resultado']],
  ['Filtros', ['fields', 'filtros']],
  ['Familia', ['fields', 'familia']],
  ['Mensaje', ['fields', 'mensaje']],
  ['Entrada', ['fields', 'entrada']],
  ['Salida', ['fields', 'salida']],
  ['Ajuste', ['fields', 'ajuste']],
  ['Direccion', ['fields', 'direccionNoAccent']],
  ['Apellido', ['fields', 'apellidoSingle']],
  ['Teléfono', ['fields', 'telefonoSingle']],
  ['Orden', ['fields', 'orden']],
  ['Pedida', ['fields', 'pedida']],
]

const VAR_FOR_NS = {
  fields: 'tF',
  help: 'tHelp',
  emptyState: 'tEs',
}

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
  const used = { tF: false, tHelp: false, tEs: false }

  for (const [text, [ns, key]] of MAP) {
    const varName = VAR_FOR_NS[ns]
    // >text< (JSX children)
    const reJsx = new RegExp(`>${escapeRe(text)}<`, 'g')
    if (reJsx.test(src)) {
      src = src.replace(reJsx, `>{${varName}('${key}')}<`)
      used[varName] = true
    }
  }

  if (src !== original) {
    src = ensureImport(src)
    if (used.tF) src = ensureDecl(src, 'tF', 'fields')
    if (used.tHelp) src = ensureDecl(src, 'tHelp', 'help')
    if (used.tEs) src = ensureDecl(src, 'tEs', 'emptyState')
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
