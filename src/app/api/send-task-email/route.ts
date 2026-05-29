import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { LOGO_BASE64 } from '@/shared/lib/logo-base64'

type TaskEmailPayload = {
  to: string
  nombre_ejecuta: string
  consecutivo: string
  fecha_asignacion: string
  persona_asigna: string
  fecha_requerida_finalizar: string
  descripcion: string
}

function buildTaskEmailHTML(data: TaskEmailPayload) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
  <body style="font-family:Arial,sans-serif;font-size:14px;color:#333;margin:0;padding:20px;background:#f9fafb">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#3b82f6;padding:20px 24px;color:#fff;display:flex;align-items:center">
        <img src="cid:logo" alt="Logo" style="width:50px;height:50px;border-radius:8px;margin-right:16px" />
        <div>
          <h1 style="margin:0;font-size:18px">Nueva Tarea Asignada</h1>
          <p style="margin:4px 0 0;opacity:0.9;font-size:13px">CONSTRUCTORA BORINQUEN S.A.S. — Sistema de Gestión de Inventario</p>
        </div>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 20px;line-height:1.6">
          Estimado(a) <strong>${data.nombre_ejecuta}</strong>, se le ha asignado una nueva tarea. A continuación los detalles:
        </p>
        <table style="width:100%;font-size:14px;margin-bottom:20px;border-collapse:collapse" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 12px;color:#6b7280;width:200px;border-bottom:1px solid #f3f4f6;font-weight:600">Nro. Tarea</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:700;color:#3b82f6;font-size:16px">${data.consecutivo}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;border-bottom:1px solid #f3f4f6;font-weight:600">Fecha de Asignación</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${data.fecha_asignacion}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;border-bottom:1px solid #f3f4f6;font-weight:600">Persona que Asigna</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${data.persona_asigna}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6b7280;border-bottom:1px solid #f3f4f6;font-weight:600">Fecha Estimada Finalización</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:700;color:#dc2626">${data.fecha_requerida_finalizar}</td>
          </tr>
        </table>
        <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;margin-bottom:20px">
          <strong style="color:#0369a1;font-size:12px;text-transform:uppercase">Descripción de la Tarea</strong>
          <p style="margin:8px 0 0;line-height:1.6;white-space:pre-line">${data.descripcion}</p>
        </div>
        <p style="margin:0;font-size:13px;color:#6b7280">
          Por favor, inicie la ejecución de esta tarea a la brevedad posible.
        </p>
      </div>
      <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af">
        Enviado desde el Sistema de Gestión de Inventario — CONSTRUCTORA BORINQUEN S.A.S.
      </div>
    </div>
  </body></html>`
}

export async function POST(request: NextRequest) {
  try {
    const data: TaskEmailPayload = await request.json()

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

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    const html = buildTaskEmailHTML(data)

    // Convertir base64 del logo a buffer para adjuntar como CID
    const logoBuffer = Buffer.from(LOGO_BASE64.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    await transporter.sendMail({
      from: `"Sistema de Inventario" <${smtpUser}>`,
      to: data.to,
      subject: `Nueva Tarea Asignada: ${data.consecutivo}`,
      html,
      attachments: [
        {
          filename: 'logo.jpg',
          content: logoBuffer,
          cid: 'logo',
        },
      ],
    })

    return NextResponse.json({ success: true, message: `Email enviado a ${data.to}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
