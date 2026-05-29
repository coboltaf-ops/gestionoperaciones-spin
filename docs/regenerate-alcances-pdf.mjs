import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = 'file://' + path.join(__dirname, 'ALCANCES_GESTION_INVENTARIO.html')
const pdfPath = path.join(__dirname, 'ALCANCES_GESTION_INVENTARIO.pdf')

console.log('Lanzando Chromium...')
const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()

console.log('Cargando HTML:', htmlPath)
await page.goto(htmlPath, { waitUntil: 'networkidle' })

console.log('Generando PDF:', pdfPath)
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
})

await browser.close()
console.log('PDF regenerado correctamente.')
