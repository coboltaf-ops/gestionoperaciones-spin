import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import jsPDF from 'jspdf'
import { LOGO_BASE64 } from '@/shared/lib/logo-base64'

type DetalleOrden = {
  codigo_producto: string
  descripcion: string
  cantidad: number
  costo_unitario: number
  unidad_medida: string
  subtotal: number
}

type OrderEmailPayload = {
  to: string
  proveedorNombre: string
  consecutivo: string
  fecha_emision: string
  fecha_vencimiento: string
  comprador: string
  tipo_moneda: string
  condicion_pago: string
  observaciones: string
  pct_impuesto: number
  detalles: DetalleOrden[]
  asunto: string
  mensaje: string
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ── Generar PDF con jsPDF ──────────────────────────────────────────── */
function generateOrderPDF(data: OrderEmailPayload): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const subtotal = data.detalles.reduce((s, d) => s + d.subtotal, 0)
  const impuesto = subtotal * (data.pct_impuesto / 100)
  const total = subtotal + impuesto
  let y = 15

  // Header
  doc.setFillColor(96, 165, 250)
  doc.rect(0, 0, w, 28, 'F')
  // Logo
  try { doc.addImage(LOGO_BASE64, 'JPEG', 14, 8, 11, 11) } catch { /* */ }
  const logoOff = 28
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CONSTRUCTORA BORINQUEN S.A.S.', logoOff, y)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Gestión de Inventario', logoOff, y + 7)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`ORDEN DE COMPRA`, w - 14, y, { align: 'right' })
  doc.setFontSize(13)
  doc.text(data.consecutivo, w - 14, y + 7, { align: 'right' })

  y = 38

  // Info grid
  doc.setFillColor(239, 246, 255)
  doc.roundedRect(10, y, w - 20, 30, 2, 2, 'F')
  doc.setDrawColor(219, 234, 254)
  doc.roundedRect(10, y, w - 20, 30, 2, 2, 'S')

  doc.setFontSize(7)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')

  const fields = [
    [
      { label: 'NRO. ORDEN', value: data.consecutivo },
      { label: 'FECHA EMISIÓN', value: data.fecha_emision },
      { label: 'PROVEEDOR', value: data.proveedorNombre },
      { label: 'FECHA VENCIMIENTO', value: data.fecha_vencimiento },
    ],
    [
      { label: 'COMPRADOR', value: data.comprador || '—' },
      { label: 'MONEDA', value: data.tipo_moneda },
      { label: 'CONDICIÓN DE PAGO', value: data.condicion_pago || '—' },
      { label: '', value: '' },
    ],
  ]

  fields.forEach((row, ri) => {
    row.forEach((f, ci) => {
      const fx = 14 + ci * 45
      const fy = y + 6 + ri * 14
      doc.setFontSize(7)
      doc.setTextColor(107, 114, 128)
      doc.text(f.label, fx, fy)
      doc.setFontSize(10)
      doc.setTextColor(17, 17, 17)
      doc.setFont('helvetica', 'bold')
      doc.text(f.value, fx, fy + 5)
      doc.setFont('helvetica', 'normal')
    })
  })

  y = 74

  // Table header
  const cols = [
    { label: 'Código', x: 14, w: 25, align: 'left' as const },
    { label: 'Descripción', x: 39, w: 60, align: 'left' as const },
    { label: 'Cant.', x: 99, w: 18, align: 'center' as const },
    { label: 'Unidad', x: 117, w: 22, align: 'center' as const },
    { label: 'Costo Unit.', x: 139, w: 28, align: 'right' as const },
    { label: 'Subtotal', x: 167, w: 28, align: 'right' as const },
  ]

  doc.setFillColor(96, 165, 250)
  doc.rect(10, y, w - 20, 8, 'F')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  cols.forEach(c => {
    const tx = c.align === 'right' ? c.x + c.w : c.align === 'center' ? c.x + c.w / 2 : c.x
    doc.text(c.label.toUpperCase(), tx, y + 5.5, { align: c.align })
  })
  y += 8

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  data.detalles.forEach((d, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251)
      doc.rect(10, y, w - 20, 7, 'F')
    }
    doc.setTextColor(17, 17, 17)
    const vals = [
      d.codigo_producto,
      d.descripcion,
      String(d.cantidad),
      d.unidad_medida,
      fmt(d.costo_unitario),
      fmt(d.subtotal),
    ]
    cols.forEach((c, ci) => {
      const tx = c.align === 'right' ? c.x + c.w : c.align === 'center' ? c.x + c.w / 2 : c.x
      const text = vals[ci]
      doc.text(text, tx, y + 5, { align: c.align })
    })
    doc.setDrawColor(229, 231, 235)
    doc.line(10, y + 7, w - 10, y + 7)
    y += 7
  })

  y += 6

  // Totals
  const totalsX = w - 80
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text('Subtotal antes de Impuesto', totalsX, y)
  doc.setTextColor(17, 17, 17)
  doc.text(fmt(subtotal), w - 14, y, { align: 'right' })
  y += 6
  doc.setTextColor(107, 114, 128)
  doc.text(`Impuesto (${data.pct_impuesto}%)`, totalsX, y)
  doc.setTextColor(17, 17, 17)
  doc.text(fmt(impuesto), w - 14, y, { align: 'right' })
  y += 3
  doc.setDrawColor(96, 165, 250)
  doc.setLineWidth(0.5)
  doc.line(totalsX, y, w - 14, y)
  y += 5
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(96, 165, 250)
  doc.text('TOTAL FACTURA', totalsX, y)
  doc.text(fmt(total), w - 14, y, { align: 'right' })

  // Observaciones
  if (data.observaciones) {
    y += 12
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(10, y, w - 20, 16, 2, 2, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.roundedRect(10, y, w - 20, 16, 2, 2, 'S')
    doc.setFontSize(7)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    doc.text('OBSERVACIONES', 14, y + 5)
    doc.setFontSize(9)
    doc.setTextColor(17, 17, 17)
    doc.text(data.observaciones, 14, y + 11)
  }

  // Firmas
  y += 30
  if (y > 260) y = 260
  const signW = 50
  const gap = (w - 20 - signW * 3) / 2
  const labels = ['Elaborado por', 'Aprobado por', 'Recibido por']
  labels.forEach((l, i) => {
    const sx = 10 + i * (signW + gap) + signW / 2
    doc.setDrawColor(107, 114, 128)
    doc.line(sx - 22, y, sx + 22, y)
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(l, sx, y + 4, { align: 'center' })
  })

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(156, 163, 175)
  doc.text('Documento generado por Sistema de Gestión de Inventario', w / 2, 285, { align: 'center' })

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

/* ── Email HTML (cuerpo del correo) ─────────────────────────────────── */
function buildEmailHTML(data: OrderEmailPayload) {
  const subtotal = data.detalles.reduce((s, d) => s + d.subtotal, 0)
  const impuesto = subtotal * (data.pct_impuesto / 100)
  const total = subtotal + impuesto

  const rows = data.detalles.map((d, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}">
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px">${d.codigo_producto}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${d.descripcion}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${d.cantidad}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${fmt(d.subtotal)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
  <body style="font-family:Arial,sans-serif;font-size:14px;color:#333;margin:0;padding:20px;background:#f9fafb">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#60a5fa;padding:20px 24px;color:#fff">
        <h1 style="margin:0;font-size:18px">Orden de Compra ${data.consecutivo}</h1>
        <p style="margin:4px 0 0;opacity:0.9;font-size:13px">Sistema de Gestión de Inventario</p>
      </div>
      <div style="padding:24px">
        ${data.mensaje ? `<p style="margin:0 0 20px;line-height:1.6;white-space:pre-line">${data.mensaje}</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">` : ''}
        <table style="width:100%;font-size:13px;margin-bottom:16px" cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0;color:#6b7280;width:140px">Proveedor:</td><td style="padding:4px 0;font-weight:600">${data.proveedorNombre}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Fecha Emisión:</td><td style="padding:4px 0">${data.fecha_emision}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Fecha Vencimiento:</td><td style="padding:4px 0">${data.fecha_vencimiento}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Comprador:</td><td style="padding:4px 0">${data.comprador}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280">Condición de Pago:</td><td style="padding:4px 0">${data.condicion_pago || '—'}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px">
          <thead><tr style="background:#60a5fa">
            <th style="padding:8px 10px;color:#fff;text-align:left">Código</th>
            <th style="padding:8px 10px;color:#fff;text-align:left">Descripción</th>
            <th style="padding:8px 10px;color:#fff;text-align:center">Cant.</th>
            <th style="padding:8px 10px;color:#fff;text-align:right">Subtotal</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <table style="width:100%;font-size:13px" cellpadding="0" cellspacing="0">
          <tr><td></td><td style="width:200px;padding:3px 0;text-align:right;color:#6b7280">Subtotal: ${fmt(subtotal)}</td></tr>
          <tr><td></td><td style="padding:3px 0;text-align:right;color:#6b7280">Impuesto (${data.pct_impuesto}%): ${fmt(impuesto)}</td></tr>
          <tr><td></td><td style="padding:6px 0 0;text-align:right;font-size:16px;font-weight:700;color:#60a5fa;border-top:2px solid #60a5fa">Total: ${fmt(total)}</td></tr>
        </table>
        ${data.observaciones ? `<div style="margin-top:16px;padding:12px;background:#fafafa;border:1px solid #e5e7eb;border-radius:6px;font-size:12px"><strong style="color:#6b7280">Observaciones:</strong><br>${data.observaciones}</div>` : ''}
      </div>
      <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af">
        Enviado desde el Sistema de Gestión de Inventario · PDF adjunto
      </div>
    </div>
  </body></html>`
}

/* ── API Route ──────────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const data: OrderEmailPayload = await request.json()

    if (!data.to || !data.consecutivo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = parseInt(process.env.SMTP_PORT || '465')

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'Configura SMTP_USER y SMTP_PASS en .env.local para enviar correos' },
        { status: 500 }
      )
    }

    // Generar PDF
    const pdfBuffer = generateOrderPDF(data)

    // Generar HTML del correo
    const html = buildEmailHTML(data)

    // Configurar transporte SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    // Enviar correo con PDF adjunto
    await transporter.sendMail({
      from: `"Sistema de Inventario" <${smtpUser}>`,
      to: data.to,
      subject: data.asunto || `Orden de Compra ${data.consecutivo}`,
      html,
      attachments: [
        {
          filename: `${data.consecutivo}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })

    return NextResponse.json({ success: true, message: `Email enviado a ${data.to} con PDF adjunto` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
