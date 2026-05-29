#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Sorted longest-first
const FIELD_LABELS = [
  ['Fecha del Reporte (DD/MM/AAAA)', 'fechaReporteFormato'],
  ['Tipo de Identificación', 'tipoIdentificacionLong'],
  ['Email del Proveedor *', 'emailProveedorRequired'],
  ['Persona que Emite *', 'personaEmiteRequired'],
  ['Tipo de Ajuste *', 'tipoAjusteRequired'],
  ['Tipo de Moneda *', 'tipoMonedaRequired'],
  ['Representante Legal', 'representanteLegal'],
  ['Tipo de Movimiento', 'tipoMovimiento'],
  ['Seleccionar Producto', 'seleccionarProducto'],
  ['Servidor de Correo', 'servidorCorreo'],
  ['Fecha Emisión *', 'fechaEmisionRequired'],
  ['Mensaje (opcional)', 'mensajeOpcional'],
  ['Bodega Salida *', 'bodegaSalidaRequired'],
  ['Tipo de Moneda', 'tipoMoneda'],
  ['Tipo de Código', 'tipoCodigo'],
  ['Tipo Ajuste *', 'tipoAjusteShort'],
  ['Total Ítems', 'totalItems'],
  ['Ult. Proveedor', 'ultProveedor'],
  ['Proveedor *', 'proveedorRequired'],
  ['Nro. Ajuste', 'nroAjuste'],
  ['Nro. Orden', 'nroOrden'],
  ['Bodega *', 'bodegaRequired'],
  ['Fecha *', 'fechaRequired'],
  ['Tipo *', 'tipoRequired'],
]

const OPTION_TEXTS = [
  ['— Todos los productos —', 'todosProductos'],
  ['— Seleccionar materia prima —', 'seleccionarMateria'],
  ['— Seleccione bodega —', 'seleccioneBodega'],
  ['— Seleccionar OC —', 'seleccionarOC'],
  ['— Seleccionar —', 'seleccionarGuion'],
  ['-- Seleccione --', 'seleccione'],
  ['Seleccionar...', 'seleccionar'],
  ['— Todas —', 'todas'],
  ['— Todos —', 'todos'],
]

const PLACEHOLDER_TEXTS = [
  ['Buscar producto para agregar al detalle', 'buscarProductoAgregar'],
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
  const used = { tF: false, tOp: false, tPh: false }

  // Field labels (inside <label>text</label>)
  for (const [text, key] of FIELD_LABELS) {
    const re = new RegExp(`>${escapeRe(text)}<`, 'g')
    if (re.test(src)) {
      src = src.replace(re, `>{tF('${key}')}<`)
      used.tF = true
    }
  }
  // Option texts (inside <option value="">text</option>)
  for (const [text, key] of OPTION_TEXTS) {
    const re = new RegExp(`>${escapeRe(text)}<`, 'g')
    if (re.test(src)) {
      src = src.replace(re, `>{tOp('${key}')}<`)
      used.tOp = true
    }
  }
  // Placeholders
  for (const [text, key] of PLACEHOLDER_TEXTS) {
    const re = new RegExp(`placeholder="${escapeRe(text)}"`, 'g')
    if (re.test(src)) {
      src = src.replace(re, `placeholder={tPh('${key}')}`)
      used.tPh = true
    }
  }

  if (src !== original) {
    src = ensureImport(src)
    if (used.tF) src = ensureDecl(src, 'tF', 'fields')
    if (used.tOp) src = ensureDecl(src, 'tOp', 'options')
    if (used.tPh) src = ensureDecl(src, 'tPh', 'placeholders')
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
