// ─── Utilidad de exportación de reportes ──────────────────────────────────────
// Soporta: PDF (jsPDF), Excel (xlsx), Impresión (window.print)

import { LOGO_BASE64 } from './logo-base64'

export type ReportColumn = {
  header: string
  key: string
  width?: number // solo para Excel (en caracteres)
}

export type ReportOptions = {
  title: string
  subtitle?: string
  columns: ReportColumn[]
  rows: Record<string, string | number>[]
  filename?: string
  logo?: string                 // Logo dinámico de la empresa (data URL o URL). Default: LOGO_BASE64
  empresaNombre?: string        // Nombre de la empresa para mostrar al lado del logo
  empresaTipoId?: string        // Tipo de identificación (NIT, RIF, RUT, etc.)
  empresaNroDoc?: string        // Número de documento
  empresaDireccion?: string     // Dirección de la empresa
  empresaCiudad?: string        // Ciudad de la empresa
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function exportToPDF(opts: ReportOptions) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  const colW = (pageW - margin * 2) / opts.columns.length
  const logoSrc = opts.logo || LOGO_BASE64

  // Encabezado
  const headerH = opts.empresaNombre ? 34 : 28
  doc.setFillColor(30, 27, 75)
  doc.rect(0, 0, pageW, headerH, 'F')
  // Logo dinámico de empresa
  try {
    const fmt = logoSrc.includes('data:image/png') ? 'PNG' : 'JPEG'
    doc.addImage(logoSrc, fmt, margin, 6, 14, 14)
  } catch { /* logo no disponible */ }
  const logoOffset = 32
  doc.setTextColor(255, 255, 255)
  if (opts.empresaNombre) {
    // Línea 1: Nombre de empresa
    doc.setFontSize(13); doc.setFont('helvetica', 'bold')
    doc.text(opts.empresaNombre, logoOffset, 10)
    // Línea 2: Identificación + dirección
    const idParts: string[] = []
    if (opts.empresaTipoId && opts.empresaNroDoc) idParts.push(`${opts.empresaTipoId}: ${opts.empresaNroDoc}`)
    if (opts.empresaDireccion) idParts.push(opts.empresaDireccion)
    if (opts.empresaCiudad) idParts.push(opts.empresaCiudad)
    if (idParts.length > 0) {
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 200, 230)
      doc.text(idParts.join(' · '), logoOffset, 16)
    }
    // Línea 3: Título del reporte
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12); doc.setFont('helvetica', 'bold')
    doc.text(opts.title, logoOffset, 23)
  } else {
    doc.setFontSize(16); doc.setFont('helvetica', 'bold')
    doc.text(opts.title, logoOffset, 13)
  }
  if (opts.subtitle) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 180, 210)
    doc.text(opts.subtitle, logoOffset, opts.empresaNombre ? 28 : 21)
  }

  // Fecha de emisión
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 210)
  doc.text(`Emitido: ${new Date().toLocaleString('es-VE')}`, pageW - margin, 8, { align: 'right' })

  // Cabecera de tabla
  let y = headerH + 7
  doc.setFillColor(60, 55, 120)
  doc.rect(margin, y, pageW - margin * 2, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  opts.columns.forEach((col, i) => {
    doc.text(col.header.toUpperCase(), margin + colW * i + 2, y + 5.5)
  })
  y += 8

  // Filas
  doc.setFont('helvetica', 'normal')
  const maxChars = Math.max(14, Math.floor(colW / 1.8))
  opts.rows.forEach((row, ri) => {
    // Calcular altura de fila (algunas celdas pueden necesitar 2 líneas)
    let rowLines = 1
    opts.columns.forEach((col) => {
      const val = String(row[col.key] ?? '')
      if (val.length > maxChars) rowLines = 2
    })
    const rowH = rowLines === 2 ? 11 : 7
    if (y + rowH > 185) {
      doc.addPage()
      y = 14
    }
    doc.setFillColor(ri % 2 === 0 ? 245 : 255, ri % 2 === 0 ? 245 : 255, ri % 2 === 0 ? 252 : 255)
    doc.rect(margin, y, pageW - margin * 2, rowH, 'F')
    doc.setTextColor(30, 30, 60)
    opts.columns.forEach((col, i) => {
      const val = String(row[col.key] ?? '')
      if (val.length > maxChars) {
        // Partir en dos líneas
        const line1 = val.slice(0, maxChars)
        const line2 = val.slice(maxChars, maxChars * 2)
        doc.text(line1, margin + colW * i + 2, y + 4)
        doc.text(line2.length > maxChars ? line2.slice(0, maxChars - 2) + '…' : line2, margin + colW * i + 2, y + 8)
      } else {
        doc.text(val, margin + colW * i + 2, y + (rowH === 7 ? 5 : 6))
      }
    })
    y += rowH
  })

  // Total filas
  y += 4
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 140)
  doc.text(`Total registros: ${opts.rows.length}`, margin, y)

  doc.save(`${opts.filename ?? 'reporte'}.pdf`)
}

// ─── Excel ────────────────────────────────────────────────────────────────────

export async function exportToExcel(opts: ReportOptions) {
  const XLSX = await import('xlsx')

  const headers = opts.columns.map(c => c.header)
  const data = opts.rows.map(row => opts.columns.map(c => row[c.key] ?? ''))

  const ws = XLSX.utils.aoa_to_sheet([
    [opts.title],
    opts.subtitle ? [opts.subtitle] : [],
    [`Emitido: ${new Date().toLocaleString('es-VE')}`],
    [],
    headers,
    ...data,
    [],
    [`Total registros: ${opts.rows.length}`],
  ].filter(r => r.length > 0))

  // Anchos de columna
  ws['!cols'] = opts.columns.map(c => ({ wch: c.width ?? 20 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
  XLSX.writeFile(wb, `${opts.filename ?? 'reporte'}.xlsx`)
}

// ─── Impresión ────────────────────────────────────────────────────────────────

export function printReport(opts: ReportOptions) {
  const rows = opts.rows
    .map((row, ri) => `
      <tr style="background:${ri % 2 === 0 ? '#f5f5fc' : '#fff'}">
        ${opts.columns.map(c => `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#0c1a3d;max-width:180px;word-wrap:break-word;white-space:normal">${row[c.key] ?? ''}</td>`).join('')}
      </tr>`)
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${opts.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { background: #1e3a5f; color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { font-size: 18px; font-weight: bold; }
        .header p { font-size: 11px; color: #bfdbfe; margin-top: 4px; }
        .meta { font-size: 10px; color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #1e40af; }
        thead th { padding: 8px 10px; text-align: left; font-size: 10px; color: white; text-transform: uppercase; letter-spacing: .05em; }
        .footer { margin-top: 16px; font-size: 10px; color: #6b7280; }
        @media print {
          body { padding: 10px; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      <div class="header" style="display:flex;align-items:center;gap:16px;">
        <img src="${opts.logo || LOGO_BASE64}" style="width:42px;height:42px;border-radius:4px;object-fit:contain;background:#fff;" />
        <div>
          ${opts.empresaNombre ? `<div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:.04em;">${opts.empresaNombre}</div>` : ''}
          ${(opts.empresaTipoId && opts.empresaNroDoc) || opts.empresaDireccion || opts.empresaCiudad
            ? `<div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px;">${[
                (opts.empresaTipoId && opts.empresaNroDoc) ? `${opts.empresaTipoId}: ${opts.empresaNroDoc}` : '',
                opts.empresaDireccion || '',
                opts.empresaCiudad || '',
              ].filter(Boolean).join(' · ')}</div>`
            : ''}
          <h1 style="margin-top:${opts.empresaNombre ? '6px' : '0'}">${opts.title}</h1>
          ${opts.subtitle ? `<p>${opts.subtitle}</p>` : ''}
        </div>
      </div>
      <p class="meta">Emitido: ${new Date().toLocaleString('es-VE')}</p>
      <table>
        <thead>
          <tr>${opts.columns.map(c => `<th>${c.header}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">Total registros: ${opts.rows.length}</div>
    </body>
    </html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}
