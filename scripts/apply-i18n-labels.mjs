#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Map of Spanish label → fields namespace key
// Sorted by length DESC for safety
const LABELS = [
  ['Fecha Est. Llegada', 'fechaEstLlegada'],
  ['Fecha Vencimiento *', 'fechaVencimientoRequired'],
  ['Tipo Identificación', 'tipoIdentificacion'],
  ['Persona de Contacto', 'personaContacto'],
  ['Teléfono Oficina', 'telefonoOficina'],
  ['Tipo Inventario', 'tipoInventario'],
  ['Último Proveedor', 'ultimoProveedor'],
  ['Valor Inventario', 'valorInventario'],
  ['Fecha Aprobacion', 'fechaAprobacionNoAccent'],
  ['Nro. Documento', 'nroDocumento'],
  ['Último Costo', 'ultimoCosto'],
  ['Consecutivo', 'consecutivo'],
  ['Cond. Pago', 'condPago'],
  ['Situacion', 'situacionNoAccent'],
  ['Nombre *', 'nombreRequired'],
  ['Apellido', 'apellido'],
  ['Teléfono', 'telefono'],
  ['Rol', 'rol'],
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
  let usedF = false

  for (const [label, key] of LABELS) {
    // label: 'Spanish Text'
    const re = new RegExp(`label: '${escapeRe(label)}'`, 'g')
    if (re.test(src)) {
      src = src.replace(re, `label: tF('${key}')`)
      usedF = true
    }
  }

  if (src !== original) {
    src = ensureImport(src)
    if (usedF) src = ensureDecl(src, 'tF', 'fields')
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
