#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Maps Spanish label → [namespace, key]
// Namespaces: 'fields' or 'headers' or 'table'
// Sorted longest-first for safety
const LABELS = [
  // Specific compound labels (headers namespace)
  ['Cantidad Real Usada', ['headers', 'cantidadRealUsada']],
  ['Recibido en Esta', ['headers', 'recibidoEnEsta']],
  ['Ciudad / País', ['headers', 'ciudadPais']],
  ['Nro. Transferencia', ['headers', 'nroTransferencia']],
  ['Nro. Recepción', ['headers', 'nroRecepcion']],
  ['Cant. a Recibir', ['headers', 'cantARecibir']],
  ['Cantidad Req.', ['headers', 'cantidadReq']],
  ['Cant. Pedida', ['headers', 'cantPedida']],
  ['Cant. Física', ['headers', 'cantFisica']],
  ['Stock Actual', ['headers', 'stockActual']],
  ['Saldo Actual', ['headers', 'saldoActual']],
  ['Saldo Valor', ['headers', 'saldoValor']],
  ['Unid. Medida', ['headers', 'unidMedida']],
  ['Costo Unit. *', ['headers', 'costoUnitRequired']],
  ['Costo Prom.', ['headers', 'costoProm']],
  ['Costo Unit.', ['headers', 'costoUnit']],
  ['Valor Total', ['headers', 'valorTotal']],
  ['Valor Dif.', ['headers', 'valorDif']],
  ['Valor Inv.', ['headers', 'valorInv']],
  ['Sub-Grupo', ['headers', 'subGrupoHyphen']],
  ['Nro. Carga', ['headers', 'nroCarga']],
  ['Nro. Móvil', ['headers', 'nroMovil']],
  ['Nro. Factura', ['headers', 'nroFactura']],
  ['Nro. Salida', ['headers', 'nroSalida']],
  ['Fecha Recibida', ['headers', 'fechaRecibida']],
  ['Fecha Asig.', ['headers', 'fechaAsig']],
  ['Fecha Real', ['headers', 'fechaReal']],
  ['CP del Mov.', ['headers', 'cpMov']],
  ['Ult. Costo', ['headers', 'ultCosto']],
  ['Cantidad *', ['headers', 'cantidadRequired']],
  ['Ingredientes', ['headers', 'ingredientes']],
  ['Identificador', ['headers', 'identificador']],
  ['Diferencia', ['headers', 'diferencia']],
  ['Productos', ['headers', 'productos']],
  ['Requerida', ['headers', 'requerida']],
  ['Documento', ['headers', 'documento']],
  ['Actividad', ['headers', 'actividad']],
  ['Contacto', ['headers', 'contacto']],
  ['Tipo Inv.', ['headers', 'tipoInv']],
  ['Recibido', ['headers', 'recibido']],
  ['Emisión', ['headers', 'emision']],
  ['Emision', ['headers', 'emisionNoAccent']],
  ['Entradas', ['headers', 'entradas']],
  ['Salidas', ['headers', 'salidas']],
  ['Descripcion', ['headers', 'descripcionNoAccent']],
  ['Exist.', ['headers', 'existShort']],
  ['Sistema', ['headers', 'sistema']],
  ['Conteo', ['headers', 'conteo']],
  ['Produce', ['headers', 'produce']],
  ['Fórmula', ['headers', 'formula']],
  ['Módulo', ['headers', 'modulo']],
  ['Motivo', ['headers', 'motivo']],
  ['Tipo Id', ['headers', 'tipoId']],
  ['Ítems', ['headers', 'itemsAccent']],
  ['Asigna', ['headers', 'asigna']],
  ['Cant.', ['headers', 'cantShort']],
  ['Und.', ['headers', 'unidShort']],
  ['Nro.', ['headers', 'nro']],
  ['Codigo', ['headers', 'codigoNoAccent']],
  ['Monto', ['headers', 'monto']],
  ['Vence', ['headers', 'vence']],
  ['Items', ['headers', 'items']],
  ['Saldo', ['headers', 'saldo']],
  ['Stock', ['headers', 'stock']],
  ['Valor', ['headers', 'valor']],
  ['Total', ['headers', 'total']],
  ['Hora', ['headers', 'hora']],
  ['Acciones', ['table', 'actions']],
]

const VAR_FOR_NS = { fields: 'tF', headers: 'tH', table: 'tTbl' }

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
  const used = { tF: false, tH: false, tTbl: false }

  for (const [label, [ns, key]] of LABELS) {
    const varName = VAR_FOR_NS[ns]
    // Pattern 1: 'label' inside array (array headers pattern)
    // e.g. {['Código', 'Descripción', ...]}
    const reArr = new RegExp(`'${escapeRe(label)}'`, 'g')
    if (reArr.test(src)) {
      src = src.replace(reArr, `${varName}('${key}')`)
      used[varName] = true
    }
    // Pattern 2: `>label<` (simple JSX text)
    const reJsx = new RegExp(`>${escapeRe(label)}<`, 'g')
    if (reJsx.test(src)) {
      src = src.replace(reJsx, `>{${varName}('${key}')}<`)
      used[varName] = true
    }
  }

  if (src !== original) {
    src = ensureImport(src)
    if (used.tF) src = ensureDecl(src, 'tF', 'fields')
    if (used.tH) src = ensureDecl(src, 'tH', 'headers')
    if (used.tTbl) src = ensureDecl(src, 'tTbl', 'table')
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
