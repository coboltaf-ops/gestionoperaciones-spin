#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Replacements: [from, to]. Order matters — longer/more specific first.
const REPLACEMENTS = [
  // Tab button multi-line formats with emoji:
  ['📋 Registros', `{tTab('registrosEmoji')}`],
  ['📊 Reportes', `{tTab('reportesEmoji')}`],
  ['📑 Reportes Específicos', `{tTab('especificosEmoji')}`],
  // Array labels (inside JSON-like arrays)
  [`label: '📋 Registros'`, `label: tTab('registrosEmoji')`],
  [`label: '📊 Reportes'`, `label: tTab('reportesEmoji')`],
  [`label: '📑 Reportes Específicos'`, `label: tTab('especificosEmoji')`],
  [`label: 'Registros'`, `label: tTab('registros')`],
  [`label: 'Reportes'`, `label: tTab('reportes')`],
  [`label: 'Reportes Específicos'`, `label: tTab('especificos')`],
  [`label: 'Kanban'`, `label: tTab('kanban')`],
  // Plain inline text (">Registros<" etc.)
  ['>Registros</button>', `>{tTab('registros')}</button>`],
  ['>Reportes</button>', `>{tTab('reportes')}</button>`],
  ['>Kanban</button>', `>{tTab('kanban')}</button>`],
  // <h2> "Reportes Específicos" title
  ['>Reportes Específicos</h2>', `>{tTab('especificos')}</h2>`],
  ['>Reportes Especificos</h2>', `>{tTab('especificos')}</h2>`],
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

function ensureImport(src) {
  if (src.includes(`from 'next-intl'`)) return src
  if (src.startsWith(`'use client'\n`)) {
    return src.replace(/^'use client'\n/, `'use client'\n\nimport { useTranslations } from 'next-intl'\n`)
  }
  return `import { useTranslations } from 'next-intl'\n${src}`
}

function ensureTTabDecl(src) {
  if (src.match(/const tTab = useTranslations\('tabs'\)/)) return src
  // Insert after existing t/tBtn declarations — look for last `const t*Foo = useTranslations(...)` line and add after
  const lastUseTranslations = [...src.matchAll(/^(\s*)const (t[A-Za-z]*) = useTranslations\('[^']+'\)/gm)].pop()
  if (lastUseTranslations) {
    const idx = lastUseTranslations.index + lastUseTranslations[0].length
    const indent = lastUseTranslations[1]
    return src.slice(0, idx) + `\n${indent}const tTab = useTranslations('tabs')` + src.slice(idx)
  }
  // Else insert after first `export default function XPage() {`
  const fnRegex = /((?:export default )?function [A-Z][A-Za-z0-9]+\([^)]*\)\s*\{)/
  if (fnRegex.test(src)) {
    return src.replace(fnRegex, `$1\n  const tTab = useTranslations('tabs')`)
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

  for (const [from, to] of REPLACEMENTS) {
    src = src.split(from).join(to)
  }

  if (src !== original) {
    src = ensureImport(src)
    src = ensureTTabDecl(src)
    writeFileSync(file, src, 'utf8')
    touched++
    console.log(`[OK] ${file.replace(root + '/', '')}`)
  }
}

console.log(`\nProcessed ${total} files, modified ${touched}.`)
