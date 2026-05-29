#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Button patterns to replace
// Each entry: { re: RegExp (must capture the JSX text context), key: translation key }
// We match two forms:
//   1. Inline:    >TEXT<
//   2. Multiline: (ws)TEXT(\n\s*</button>) — text alone on a line inside <button>
//
// Using RegExp for safety. Keys correspond to buttons namespace in messages/*.json.

const BUTTON_MAP = [
  // Specific "Guardar X" / action phrases FIRST (longer match wins)
  { literal: '+ Agregar Renglón', key: 'addLine' },
  { literal: '+ Agregar Renglon', key: 'addLine' },
  { literal: '+ Agregar Ingrediente', key: 'addIngredient' },
  { literal: '+ Nueva Orden de Pedido', key: 'newSalesOrder' },
  { literal: '+ Nueva Recepción', key: 'newReception' },
  { literal: '+ Nueva Transferencia', key: 'newTransfer' },
  { literal: '+ Nueva Bodega', key: 'newWarehouse' },
  { literal: '+ Nuevo Movimiento', key: 'newMovement' },
  { literal: '+ Nueva Carga', key: 'newLoad' },
  { literal: '+ Nueva Salida', key: 'newIssue' },
  { literal: '+ Nueva Orden', key: 'newOrder' },
  { literal: '+ Nuevo Centro', key: 'newCostCenter' },
  { literal: '+ Nuevo Proveedor', key: 'newSupplier' },
  { literal: '+ Nuevo Producto', key: 'newProduct' },
  { literal: '+ Nuevo Ajuste', key: 'newAdjustment' },
  { literal: '+ Registro', key: 'newRecord' },
  { literal: 'Guardar Orden de Pedido', key: 'saveSalesOrder' },
  { literal: 'Guardar Transferencia', key: 'saveTransfer' },
  { literal: 'Guardar Recepción', key: 'saveReception' },
  { literal: 'Guardar Ajuste', key: 'saveAdjustment' },
  { literal: 'Guardar Orden', key: 'saveOrder' },
  { literal: 'Registrar Movimiento', key: 'registerMovement' },
  { literal: 'Generar Reporte de Salidas', key: 'generateIssuesReport' },
  { literal: 'Confirmar Ejecución', key: 'confirmExecution' },
  { literal: 'Subir Logo', key: 'uploadLogo' },
  // Simple singletons
  { literal: 'Guardar', key: 'save' },
  { literal: 'Cancelar', key: 'cancel' },
  { literal: 'Eliminar', key: 'delete' },
  { literal: 'Editar', key: 'edit' },
  { literal: 'Cerrar', key: 'close' },
  { literal: 'Imprimir', key: 'print' },
  { literal: 'Enviar', key: 'send' },
  // "Ver" is too short for global inline replace; handled via multiline only
]

// Extra singleton that is risky: "Ver" — we only replace it when it's the entire line
const LINE_ONLY_BUTTONS = [
  { literal: 'Ver', key: 'view' },
]

// Files to process: all .tsx under src/app/(main) and src/features
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry.endsWith('.tsx')) acc.push(full)
  }
  return acc
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceInline(src, literal, key) {
  // Matches `>LITERAL<` exactly (no interpolation around)
  const re = new RegExp(`>${escapeRegExp(literal)}<`, 'g')
  return src.replace(re, `>{tBtn('${key}')}<`)
}

function replaceMultiline(src, literal, key) {
  // Matches lines with only this text surrounded by whitespace (inside JSX like <button>...\n  TEXT\n</button>)
  // Pattern: preceded by `>\n\s+` and followed by `\n\s*</`
  const re = new RegExp(`(>\\s*\\n\\s+)${escapeRegExp(literal)}(\\s*\\n\\s*</)`, 'g')
  return src.replace(re, `$1{tBtn('${key}')}$2`)
}

function ensureImport(src) {
  if (src.includes(`from 'next-intl'`)) return src
  // Add import after 'use client' or as first import
  if (src.startsWith(`'use client'\n`)) {
    return src.replace(/^'use client'\n/, `'use client'\n\nimport { useTranslations } from 'next-intl'\n`)
  }
  // Add at top if not a client file (unlikely for pages)
  return `import { useTranslations } from 'next-intl'\n${src}`
}

function ensureTBtnDecl(src) {
  if (src.match(/const tBtn = useTranslations\('buttons'\)/)) return src

  // Prefer insertion right after existing `const t = useTranslations('pages')`
  const afterPages = /const t = useTranslations\('pages'\)/
  if (afterPages.test(src)) {
    return src.replace(afterPages, `const t = useTranslations('pages')\n  const tBtn = useTranslations('buttons')`)
  }

  // Else insert after the first `export default function XPage(` (or `function XContent(`) '{'
  const fnRegex = /((?:export default )?function [A-Z][A-Za-z0-9]+\([^)]*\)\s*\{)/
  const m = src.match(fnRegex)
  if (m) {
    return src.replace(fnRegex, `$1\n  const tBtn = useTranslations('buttons')`)
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

  // Apply ALL replacements (order matters — longer literals first are already sorted above)
  for (const { literal, key } of BUTTON_MAP) {
    src = replaceInline(src, literal, key)
    src = replaceMultiline(src, literal, key)
  }
  // "Ver" only multiline (too short for inline safety)
  for (const { literal, key } of LINE_ONLY_BUTTONS) {
    src = replaceMultiline(src, literal, key)
  }

  if (src !== original) {
    // Ensure import & declaration exist
    src = ensureImport(src)
    src = ensureTBtnDecl(src)
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
