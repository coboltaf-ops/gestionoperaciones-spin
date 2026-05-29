import jsPDFModule from 'jspdf'
import fs from 'fs'
import path from 'path'

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
const W = doc.internal.pageSize.getWidth()
const H = doc.internal.pageSize.getHeight()
const M = 16
let y = 0
let pageNum = 0

const BLUE = [30, 58, 138]
const LIGHT_BLUE = [96, 165, 250]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const BG_LIGHT = [241, 245, 249]
const GREEN = [22, 163, 74]

function addPage() { doc.addPage(); pageNum++; y = M }
function checkPage(need = 20) { if (y + need > H - 20) addPage() }

function drawFooter(pNum) {
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('SISTECH — Instalacion CRM NORTON 3 Paises', W / 2, H - 8, { align: 'center' })
  doc.text(`Pag ${pNum}`, W - M, H - 8, { align: 'right' })
}

function sectionTitle(text) {
  checkPage(18)
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F')
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text(text, M + 5, y + 7)
  y += 14
}

function subTitle(text) {
  checkPage(12)
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...LIGHT_BLUE)
  doc.text(text, M, y)
  y += 6
}

function para(text) {
  checkPage(10)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  const lines = doc.splitTextToSize(text, W - M * 2)
  lines.forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.5 })
  y += 2
}

function bulletList(items) {
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  items.forEach(item => {
    checkPage(6)
    doc.text('\u2022', M + 2, y)
    const lines = doc.splitTextToSize(item, W - M * 2 - 8)
    lines.forEach((line, i) => { checkPage(5); doc.text(line, M + 7, y); if (i < lines.length - 1) y += 4.5 })
    y += 5
  })
  y += 1
}

function infoBox(text) {
  checkPage(14)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const h = lines.length * 5 + 8
  doc.setFillColor(239, 246, 255)
  doc.setDrawColor(191, 219, 254)
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'FD')
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...BLUE)
  let ty = y + 5
  lines.forEach(line => { doc.text(line, M + 6, ty); ty += 5 })
  y += h + 4
}

function greenBox(title, text) {
  checkPage(20)
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(5, 150, 105)
  doc.setLineWidth(0.5)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const h = lines.length * 5 + 14
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'FD')
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN)
  doc.text(title, M + 6, y + 6)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  let ty = y + 12
  lines.forEach(line => { doc.text(line, M + 6, ty); ty += 5 })
  y += h + 4
}

function detailTable(headers, rows, colWidths) {
  checkPage(10 + rows.length * 6)
  doc.setFontSize(8)

  // Header
  doc.setFillColor(...BLUE)
  let hh = 7
  doc.roundedRect(M, y, W - M * 2, hh, 1, 1, 'F')
  doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  let x = M + 3
  headers.forEach((h, i) => { doc.text(h, x, y + 5); x += colWidths[i] })
  y += hh

  // Rows
  doc.setFont('helvetica', 'normal')
  rows.forEach((row, ri) => {
    checkPage(7)
    if (ri % 2 === 0) { doc.setFillColor(...BG_LIGHT); doc.rect(M, y, W - M * 2, 6, 'F') }
    doc.setTextColor(...DARK)
    x = M + 3
    row.forEach((cell, ci) => {
      const txt = doc.splitTextToSize(String(cell), colWidths[ci] - 4)
      doc.text(txt[0] || '', x, y + 4)
      x += colWidths[ci]
    })
    y += 6
  })
  y += 4
}

function checklistItem(text) {
  checkPage(6)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  doc.text('[ ]', M + 2, y)
  doc.text(text, M + 12, y)
  y += 5.5
}

// ══════════════════════════════════════════════════════════════════
// PORTADA
// ══════════════════════════════════════════════════════════════════
doc.setFillColor(10, 22, 40)
doc.rect(0, 0, W, H, 'F')

// Gradient overlay
doc.setFillColor(...BLUE)
doc.rect(0, H * 0.6, W, H * 0.4, 'F')

// Logo oculto por ahora (solicitud del cliente)

doc.setTextColor(255, 255, 255)
doc.setFontSize(28); doc.setFont('helvetica', 'bold')
doc.text('SISTECH', W / 2, 85, { align: 'center' })
doc.setFontSize(11); doc.setFont('helvetica', 'normal')
doc.setTextColor(147, 197, 253)
doc.text('Sistemas Inteligentes de Tecnologia', W / 2, 93, { align: 'center' })

doc.setDrawColor(59, 130, 246); doc.setLineWidth(1)
doc.line(W / 2 - 30, 100, W / 2 + 30, 100)

doc.setTextColor(255, 255, 255)
doc.setFontSize(18); doc.setFont('helvetica', 'bold')
doc.text('Manual de Instalacion', W / 2, 115, { align: 'center' })
doc.setFontSize(22)
doc.text('CRM NORTON', W / 2, 127, { align: 'center' })

// Paises
doc.setFontSize(14); doc.setFont('helvetica', 'normal')
doc.text('Colombia    |    Ecuador    |    Peru', W / 2, 145, { align: 'center' })

// Badge
doc.setFillColor(255, 255, 255, 0.15)
doc.roundedRect(W / 2 - 55, 160, 110, 22, 4, 4, 'F')
doc.setFontSize(9); doc.setTextColor(191, 219, 254)
doc.text('DOCUMENTO INTERNO', W / 2, 169, { align: 'center' })
doc.text('Plan de Implementacion — 3 Instancias', W / 2, 175, { align: 'center' })

doc.setFontSize(9); doc.setTextColor(147, 197, 253)
doc.text('13 de Abril de 2026', W / 2, 195, { align: 'center' })

// ══════════════════════════════════════════════════════════════════
// 1. RESUMEN EJECUTIVO
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('1. RESUMEN EJECUTIVO')
para('Implementacion de 3 instancias independientes del sistema CRM GTM para el cliente TAMOIN, una por cada pais de operacion (Colombia, Ecuador, Peru). Cada instancia es completamente autonoma con sus propios datos, usuarios, correo y personalizacion.')

infoBox('Por que 3 instancias separadas? Datos de empresa distintos (NIT, RUC), correo SMTP propio por pais, usuarios y permisos independientes, datos aislados entre paises, Dashboard muestra el nombre del pais correspondiente.')

// ══════════════════════════════════════════════════════════════════
// 2. ARQUITECTURA
// ══════════════════════════════════════════════════════════════════
sectionTitle('2. ARQUITECTURA DE LA SOLUCION')

detailTable(
  ['Componente', 'Colombia', 'Ecuador', 'Peru'],
  [
    ['Subdominio', 'crmtamoincol.sistech.com', 'crmtamoinecu.sistech.com', 'crmtamoinper.sistech.com'],
    ['Proyecto Vercel', 'crmtamoincol', 'crmtamoinecu', 'crmtamoinper'],
    ['Supabase', 'Free ($0)', 'Free ($0)', 'Pro ($25)'],
    ['Almacenamiento', '500 MB', '500 MB', '8 GB'],
    ['Dashboard', 'Grupo GTM Colombia', 'Grupo GTM Ecuador', 'Grupo GTM Peru'],
  ],
  [32, (W - M * 2 - 32) / 3, (W - M * 2 - 32) / 3, (W - M * 2 - 32) / 3]
)

// ══════════════════════════════════════════════════════════════════
// 3. COSTOS
// ══════════════════════════════════════════════════════════════════
sectionTitle('3. COSTOS REALES DE INFRAESTRUCTURA')

greenBox('COSTO TOTAL MENSUAL: $25 USD/mes', 'Vercel Pro (compartido, ya se paga): $0 extra | Supabase Colombia Free: $0 | Supabase Ecuador Free: $0 | Supabase Peru Pro: $25/mes | 3 Subdominios: $0 | SMTP Gmail x3: $0 | Dominio sistech.com: $0 (ya se paga)')

subTitle('Costos que se cobran al cliente')
detailTable(
  ['Concepto', 'Monto', 'Frecuencia'],
  [
    ['Implementacion (3 instancias)', '$1,500 USD ($500 x 3)', 'Unico'],
    ['Capacitacion (4 sesiones)', '$400 USD', 'Unico'],
    ['Mensualidad (3 instancias)', '$240 USD/mes ($80 x 3)', 'Mensual'],
  ],
  [60, 55, W - M * 2 - 115]
)

subTitle('Margen de ganancia')
detailTable(
  ['Concepto', 'Cobras', 'Te cuesta', 'Margen'],
  [
    ['Implementacion', '$1,500 USD', 'Tu tiempo', '$1,500 USD'],
    ['Capacitacion', '$400 USD', 'Tu tiempo', '$400 USD'],
    ['Mensualidad', '$240 USD/mes', '$25 USD/mes', '$215 USD/mes'],
  ],
  [38, 38, 38, W - M * 2 - 114]
)

// ══════════════════════════════════════════════════════════════════
// 4. PROCESO
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('4. PROCESO DE IMPLEMENTACION')
para('Los siguientes pasos se repiten para cada pais. El agente (Claude) ejecuta todo el trabajo tecnico.')

subTitle('Paso 1 — Recopilar Datos del Cliente')
para('Solicitar al cliente la siguiente informacion por cada pais:')
bulletList([
  'Nombre de la empresa (ej: Grupo GTM Colombia S.A.S.)',
  'NIT / RUC / Identificacion fiscal',
  'Direccion, Ciudad, Pais',
  'Telefono de contacto',
  'Correo de contacto',
  'Logo en formato PNG o JPG',
])

subTitle('Paso 2 — Recopilar Usuarios Iniciales')
para('Por cada pais, el cliente indica los usuarios que tendran acceso:')
bulletList([
  'Nombre completo',
  'Usuario de acceso (login)',
  'Correo electronico',
  'Clave inicial',
  'Rol: Admin / Comercial / Operaciones / Contabilidad',
])
infoBox('Los usuarios Admin tienen acceso total. Para otros roles se configura la Matriz de Permisos por modulo. Despues de la entrega, el Admin puede crear mas usuarios sin ayuda.')

subTitle('Paso 3 — Recopilar Datos SMTP')
para('Para que los correos salgan con la identidad de cada pais:')
bulletList([
  'Opcion A — Gmail (gratis): crear cuenta Gmail + generar App Password',
  'Opcion B — Corporativo: servidor SMTP, puerto, usuario y contrasena',
])

subTitle('Paso 4 — Deploy e Implementacion (lo hace el agente)')
bulletList([
  'Clonar el proyecto CRM GTM base',
  'Crear proyecto en Vercel (crmtamoincol / crmtamoinecu / crmtamoinper)',
  'Configurar subdominio en sistech.com',
  'Crear proyecto en Supabase',
  'Configurar variables de entorno (SMTP, API keys)',
  'Personalizar: logo, nombre empresa, NIT/RUC, ciudad, pais',
  'Crear usuarios iniciales con roles y permisos',
  'Activar/desactivar modulos segun lo contratado',
  'Prueba completa del sistema',
  'Envio de correo de prueba para verificar identidad',
])

subTitle('Paso 5 — Entrega de Accesos')
bulletList([
  'URL del sistema por pais',
  'Usuarios y claves iniciales',
  'Manual de usuario en PDF',
  'Datos de contacto para soporte',
])

subTitle('Paso 6 — Capacitacion (4 sesiones)')
bulletList([
  'Sesion 1: Navegacion general + Dashboard + Clientes + Contactos',
  'Sesion 2: Oportunidades + Cotizaciones + Productos',
  'Sesion 3: Proyectos + Tareas + Tickets + PQRS',
  'Sesion 4: Correos + Reportes + Configuracion + Gestion de Usuarios',
])

// ══════════════════════════════════════════════════════════════════
// 5. CHECKLIST
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('5. CHECKLIST — DATOS A SOLICITAR POR PAIS')
para('Usar esta lista para recopilar la informacion de cada pais antes de iniciar la implementacion.')

subTitle('COLOMBIA')
checklistItem('Nombre de la empresa')
checklistItem('NIT')
checklistItem('Direccion, Ciudad')
checklistItem('Telefono')
checklistItem('Correo de contacto')
checklistItem('Logo (PNG/JPG)')
checklistItem('Datos SMTP (Gmail o corporativo)')
checklistItem('Lista de usuarios (nombre, usuario, correo, rol, clave)')
checklistItem('Modulos a activar')

y += 3
subTitle('ECUADOR')
checklistItem('Nombre de la empresa')
checklistItem('RUC')
checklistItem('Direccion, Ciudad')
checklistItem('Telefono')
checklistItem('Correo de contacto')
checklistItem('Logo (PNG/JPG)')
checklistItem('Datos SMTP (Gmail o corporativo)')
checklistItem('Lista de usuarios (nombre, usuario, correo, rol, clave)')
checklistItem('Modulos a activar')

y += 3
subTitle('PERU')
checklistItem('Nombre de la empresa')
checklistItem('RUC')
checklistItem('Direccion, Ciudad')
checklistItem('Telefono')
checklistItem('Correo de contacto')
checklistItem('Logo (PNG/JPG)')
checklistItem('Datos SMTP (Gmail o corporativo)')
checklistItem('Lista de usuarios (nombre, usuario, correo, rol, clave)')
checklistItem('Modulos a activar')

// ══════════════════════════════════════════════════════════════════
// 6. POST-ENTREGA
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('6. POST-ENTREGA — AUTOGESTION DEL CLIENTE')
para('Despues de la entrega, el Admin de cada pais puede autogestionar sin soporte tecnico:')

detailTable(
  ['Accion', 'Desde donde'],
  [
    ['Crear nuevos usuarios', 'Gestion de Usuarios'],
    ['Cambiar roles y permisos', 'Gestion de Usuarios → Matriz de Permisos'],
    ['Modificar datos de empresa', 'Datos Empresa'],
    ['Activar/desactivar modulos', 'Modulos del Sistema'],
    ['Gestionar clientes y contactos', 'Modulos del CRM'],
    ['Generar cotizaciones y enviar email', 'Cotizaciones'],
    ['Exportar reportes (PDF, Excel)', 'Todos los modulos'],
    ['Gestionar tickets y PQRS', 'Soporte / PQRS'],
  ],
  [65, W - M * 2 - 65]
)

subTitle('Requiere soporte de SISTECH')
bulletList([
  'Cambio de dominio o subdominio',
  'Cambio de plan Supabase (Free a Pro)',
  'Cambio de configuracion SMTP en variables de entorno',
  'Actualizaciones del sistema (nuevas funciones)',
  'Migracion de datos masiva',
])

// ══════════════════════════════════════════════════════════════════
// 7. RESUMEN FINAL
// ══════════════════════════════════════════════════════════════════
sectionTitle('7. RESUMEN FINAL')

greenBox('TAMOIN — 3 PAISES — RESUMEN FINANCIERO', 'Cobro unico (implementacion + capacitacion): $1,900 USD | Cobro mensual recurrente: $240 USD/mes | Costo real infraestructura: $25 USD/mes | Margen mensual neto: $215 USD/mes | Margen anual neto: $2,580 USD/ano')

y += 2
detailTable(
  ['Pais', 'URL', 'Dashboard', 'Supabase'],
  [
    ['Colombia', 'crmtamoincol.sistech.com', 'Grupo GTM Colombia', 'Free ($0)'],
    ['Ecuador', 'crmtamoinecu.sistech.com', 'Grupo GTM Ecuador', 'Free ($0)'],
    ['Peru', 'crmtamoinper.sistech.com', 'Grupo GTM Peru', 'Pro ($25)'],
  ],
  [25, 55, 48, W - M * 2 - 128]
)

// ══════════════════════════════════════════════════════════════════
// FOOTERS
// ══════════════════════════════════════════════════════════════════
const totalPages = doc.getNumberOfPages()
for (let i = 2; i <= totalPages; i++) {
  doc.setPage(i)
  drawFooter(i - 1)
}

// Guardar
const output = doc.output('arraybuffer')
const outPath = path.join(process.cwd(), 'docs', 'INSTALACION_TAMOIN_3_PAISES.pdf')
fs.writeFileSync(outPath, Buffer.from(output))
console.log(`PDF generado: ${outPath}`)
console.log(`Paginas: ${totalPages}`)
