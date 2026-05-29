#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Maps 'Spanish' → tF('key') for inline array elements and <th>text</th>
// Longer strings FIRST
const REPLACEMENTS = [
  ['Unidad de Medida', ['fields', 'unidadMedida']],
  ['Centro de Costo', ['fields', 'centroCosto']],
  ['Orden de Compra', ['fields', 'ordenCompra']],
  ['Fecha Emisión', ['fields', 'fechaEmision']],
  ['Tipo de Ajuste', ['fields', 'tipoAjuste']],
  ['Bodega Entrada', ['fields', 'bodegaEntrada']],
  ['Bodega Salida', ['fields', 'bodegaSalida']],
  ['Persona Autoriza', ['fields', 'personaAutorizaShort']],
  ['Destinatario', ['fields', 'destinatario']],
  ['Persona Emite', ['fields', 'personaEmiteShort']],
  ['Nro. Ajuste', ['fields', 'nroAjuste']],
  ['Ya Recibido', ['fields', 'yaRecibido']],
  ['Descripción', ['fields', 'descripcion']],
  ['Consecutivo', ['fields', 'consecutivo']],
  ['Observaciones', ['fields', 'observaciones']],
  ['Referencia', ['fields', 'referencia']],
  ['Categoría', ['fields', 'categoria']],
  ['Situación', ['fields', 'situacion']],
  ['Proveedor', ['fields', 'proveedor']],
  ['Existencia', ['fields', 'existencia']],
  ['Comprador', ['fields', 'comprador']],
  ['Renglones', ['fields', 'renglones']],
  ['Pendiente', ['fields', 'pendiente']],
  ['Subtotal', ['fields', 'subtotal']],
  ['Cantidad', ['fields', 'cantidad']],
  ['Teléfono', ['fields', 'telefonoSingle']],
  ['Sub Grupo', ['fields', 'subGrupo']],
  ['Nombre', ['fields', 'nombre']],
  ['Correo', ['fields', 'correo']],
  ['Código', ['fields', 'codigo']],
  ['Asunto', ['fields', 'asunto']],
  ['Unidad', ['fields', 'unidad']],
  ['Bodega', ['fields', 'bodega']],
  ['Grupo', ['fields', 'grupo']],
  ['Fecha', ['fields', 'fecha']],
  ['Costo', ['fields', 'costo']],
  ['Orden', ['fields', 'orden']],
  ['Estado', ['fields', 'estado']],
  ['Ciudad', ['fields', 'ciudad']],
  ['País', ['fields', 'pais']],
  ['Tipo', ['fields', 'tipo']],
]

const VAR_FOR_NS = { fields: 'tF' }

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

// Heuristic: detect if a `'text'` occurrence is inside an array-header pattern
// Check for `[` or `,` immediately before (ignoring whitespace) within the line,
// AND `.map(h =>` within 200 chars following.
function isInsideHeaderArray(src, matchIdx, text) {
  // Check backwards: up to 300 chars, looking for `[` or `,` (with whitespace)
  const before = src.slice(Math.max(0, matchIdx - 300), matchIdx)
  const lastBracket = Math.max(before.lastIndexOf('['), before.lastIndexOf(','))
  if (lastBracket < 0) return false
  const between = before.slice(lastBracket + 1)
  // Only allow whitespace + 'text' between opening bracket/comma and this match
  // Actually just be loose: if `.map(h =>` appears within 500 chars after match end
  const matchEndIdx = matchIdx + text.length + 2 // '...'
  const after = src.slice(matchEndIdx, Math.min(src.length, matchEndIdx + 500))
  return after.includes('.map(h =>')
}

for (const file of files) {
  total++
  let src = readFileSync(file, 'utf8')
  const original = src
  const used = { tF: false }

  for (const [text, [ns, key]] of REPLACEMENTS) {
    const varName = VAR_FOR_NS[ns]
    // Replace `'text'` only if inside a header array pattern
    // Safer: replace `, 'text',`, `['text',`, `, 'text']`, `['text']`
    const patterns = [
      [`['${text}',`, `[${varName}('${key}'),`],
      [`, '${text}',`, `, ${varName}('${key}'),`],
      [`, '${text}']`, `, ${varName}('${key}')]`],
      [`['${text}']`, `[${varName}('${key}')]`],
    ]
    for (const [from, to] of patterns) {
      if (src.includes(from)) {
        src = src.split(from).join(to)
        used.tF = true
      }
    }
    // Plain `>text<` in th/td
    const reJsx = new RegExp(`<th([^>]*)>${escapeRe(text)}</th>`, 'g')
    if (reJsx.test(src)) {
      src = src.replace(reJsx, (_, attrs) => `<th${attrs}>{${varName}('${key}')}</th>`)
      used.tF = true
    }
  }

  if (src !== original) {
    src = ensureImport(src)
    if (used.tF) src = ensureDecl(src, 'tF', 'fields')
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
