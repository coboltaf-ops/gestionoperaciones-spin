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
const GREEN_ACCENT = [16, 185, 129]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const BG_LIGHT = [241, 245, 249]
const GREEN = [22, 163, 74]

function addPage() { doc.addPage(); pageNum++; y = M }
function checkPage(need = 20) { if (y + need > H - 20) addPage() }

function drawFooter(pNum) {
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('SISTECH - Instalacion Borinquen Gestion de Inventario', W / 2, H - 8, { align: 'center' })
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
  doc.setFillColor(...BLUE)
  const hh = 7
  doc.roundedRect(M, y, W - M * 2, hh, 1, 1, 'F')
  doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  let x = M + 3
  headers.forEach((h, i) => { doc.text(h, x, y + 5); x += colWidths[i] })
  y += hh
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

// ============== PORTADA ==============
doc.setFillColor(10, 22, 40)
doc.rect(0, 0, W, H, 'F')
doc.setFillColor(...GREEN_ACCENT)
doc.rect(0, H * 0.6, W, H * 0.4, 'F')

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
doc.text('Plan de Instalacion', W / 2, 115, { align: 'center' })
doc.setFontSize(22)
doc.text('GESTION DE INVENTARIO', W / 2, 127, { align: 'center' })

doc.setFontSize(14); doc.setFont('helvetica', 'normal')
doc.text('Cliente: BORINQUEN', W / 2, 145, { align: 'center' })

doc.setFillColor(255, 255, 255, 0.15)
doc.roundedRect(W / 2 - 55, 160, 110, 22, 4, 4, 'F')
doc.setFontSize(9); doc.setTextColor(191, 219, 254)
doc.text('DOCUMENTO INTERNO', W / 2, 169, { align: 'center' })
doc.text('Plan de Implementacion - 1 Instancia', W / 2, 175, { align: 'center' })

doc.setFontSize(9); doc.setTextColor(147, 197, 253)
const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
doc.text(fecha, W / 2, 195, { align: 'center' })

// ============== 1. RESUMEN EJECUTIVO ==============
addPage()
sectionTitle('1. RESUMEN EJECUTIVO')
para('Implementacion de una (1) instancia del Sistema de Gestion de Inventario para el cliente Borinquen. La instancia es autonoma con sus propios datos, usuarios, correo y personalizacion, accesible desde un subdominio dedicado bajo sistech.com.')

infoBox('Una sola instancia: subdominio inventarioborinquen.sistech.com, base de datos dedicada, usuarios y permisos independientes, personalizacion con datos de Borinquen, correo saliente con identidad del cliente.')

para('El sistema cubre la operacion integral de inventario de Borinquen: productos, proveedores, ordenes de compra, recepciones, bodegas, transferencias, salidas de almacen, ajustes, toma fisica, produccion con formulas e ingredientes, pedidos, tareas, personal, correos enviados y asistente con voz en espanol e ingles.')

// ============== 2. ARQUITECTURA ==============
sectionTitle('2. ARQUITECTURA DE LA SOLUCION')

detailTable(
  ['Componente', 'Configuracion Borinquen'],
  [
    ['Subdominio', 'inventarioborinquen.sistech.com'],
    ['Proyecto Vercel', 'inventarioborinquen'],
    ['Base de datos', 'Archivos JSON en repositorio'],
    ['Almacenamiento', 'Incluido en hosting'],
    ['Dashboard', 'Personalizado con logo y datos de Borinquen'],
    ['Modulos activos', '22 modulos (configurables por el Admin)'],
    ['Idiomas soportados', 'Espanol e Ingles'],
    ['Asistente con voz', 'Activo en espanol e ingles'],
  ],
  [50, W - M * 2 - 50]
)

subTitle('Caracteristicas principales del sistema')
bulletList([
  'Catalogo de productos con codigos de barras y QR',
  'Kardex cronologico de movimientos por producto',
  'Gestion de proveedores con contacto y clasificacion',
  'Ordenes de compra con envio por email y PDF con logo',
  'Recepcion de facturas con actualizacion de costo promedio',
  'Multi-bodega con transferencias y saldos independientes',
  'Ajustes de inventario con motivo y flujo de aprobacion',
  'Toma de inventario fisico con Excel (generar + cargar)',
  'Produccion con formulas, ordenes y ejecucion',
  'Centros de costo para imputacion de gastos',
  'Tareas con vista Kanban y auto-vencimiento',
  'Asistente con voz para consultas rapidas (ES/EN)',
])

// ============== 3. COSTOS ==============
sectionTitle('3. COSTOS DE LA IMPLEMENTACION')

greenBox('RESUMEN COMERCIAL BORINQUEN', 'Licencia unica (estructura): $3,800 USD | Implementacion: $250 USD | Mensualidad (hosting + dominio + soporte): $225 USD/mes | Total primer pago: $4,050 USD | Recurrente mensual: $225 USD/mes')

subTitle('Costos que se cobran a Borinquen')
detailTable(
  ['Concepto', 'Monto', 'Frecuencia'],
  [
    ['Licencia del sistema (estructura)', '$3,800 USD', 'Unico'],
    ['Implementacion y capacitacion', '$250 USD', 'Unico'],
    ['Mensualidad (hosting + soporte)', '$225 USD', 'Mensual'],
  ],
  [80, 50, W - M * 2 - 130]
)

subTitle('Forma de pago de la licencia')
bulletList([
  'Primer pago: 50% inicial de la licencia ($1,900 USD)',
  'Segundo pago: 50% al iniciar la primera instalacion ($1,900 USD)',
  'Implementacion: contra entrega al terminar la capacitacion',
  'Mensualidad: prepago mensual, primeros 5 dias de cada mes',
])

subTitle('Costos reales para SISTECH (infraestructura)')
detailTable(
  ['Componente', 'Costo SISTECH', 'Frecuencia'],
  [
    ['Vercel Pro (compartido)', '$0 extra', 'Ya pagado'],
    ['Subdominio sistech.com', '$0', 'Ya pagado'],
    ['SMTP Gmail', '$0', 'Gratis'],
    ['Dominio sistech.com', '$0', 'Ya pagado'],
    ['Costo neto Borinquen', '$0 USD/mes', 'Mensual'],
  ],
  [60, 55, W - M * 2 - 115]
)

subTitle('Margen de ganancia')
detailTable(
  ['Concepto', 'Cobras', 'Te cuesta', 'Margen'],
  [
    ['Licencia', '$3,800 USD', 'Ya desarrollado', '$3,800 USD'],
    ['Implementacion', '$250 USD', 'Tu tiempo', '$250 USD'],
    ['Mensualidad', '$225 USD/mes', '$0 USD/mes', '$225 USD/mes'],
  ],
  [38, 38, 38, W - M * 2 - 114]
)

greenBox('MARGEN ANUAL NETO', 'Primer ano: $4,050 (pago unico) + $2,700 (mensualidades x12) = $6,750 USD | Anos siguientes: $2,700 USD/ano (solo mensualidades)')

// ============== 4. PROCESO ==============
addPage()
sectionTitle('4. PROCESO DE IMPLEMENTACION')
para('Los siguientes pasos se ejecutan para la unica instancia de Borinquen. El agente (Claude) ejecuta todo el trabajo tecnico.')

subTitle('Paso 1 - Recopilar Datos del Cliente Borinquen')
bulletList([
  'Nombre oficial de la empresa (ej: Constructora Borinquen S.A.S.)',
  'NIT / RUC / Identificacion fiscal',
  'Direccion, Ciudad, Pais',
  'Telefono de contacto',
  'Correo de contacto',
  'Logo en formato PNG o JPG',
  'Representante legal',
])

subTitle('Paso 2 - Recopilar Usuarios Iniciales')
para('El cliente indica los usuarios que tendran acceso:')
bulletList([
  'Nombre completo',
  'Usuario de acceso (login)',
  'Correo electronico',
  'Clave inicial',
  'Rol: Admin / Almacen / Compras / Produccion / Consulta',
])
infoBox('El usuario Admin tiene acceso total. Para otros roles se configura la Matriz de Permisos por modulo (Leer / Registrar / Editar / Eliminar). Despues de la entrega, el Admin puede crear mas usuarios sin ayuda.')

subTitle('Paso 3 - Recopilar Datos SMTP')
para('Para que los correos salgan con la identidad de Borinquen:')
bulletList([
  'Opcion A - Gmail (gratis): crear cuenta Gmail dedicada + generar App Password',
  'Opcion B - Corporativo: servidor SMTP, puerto, usuario y contrasena',
  'Nombre remitente (From Name): ej. "Constructora Borinquen"',
  'Correo remitente (From Email): ej. sistema@borinquen.com',
])

subTitle('Paso 4 - Configuracion Inicial del Sistema')
para('Catalogos maestros a cargar antes del arranque:')
bulletList([
  'Catalogo de productos (importacion masiva desde Excel)',
  'Catalogo de proveedores',
  'Bodegas (ubicaciones fisicas de almacen)',
  'Centros de costo',
  'Personal de empresa',
  'Saldo inicial de inventario por bodega (carga inicial)',
])

subTitle('Paso 5 - Deploy e Implementacion (lo hace el agente)')
bulletList([
  'Clonar el proyecto base Gestion de Inventario',
  'Crear proyecto en Vercel con nombre inventarioborinquen',
  'Configurar subdominio inventarioborinquen.sistech.com',
  'Configurar variables de entorno (SMTP, claves)',
  'Personalizar: logo, nombre empresa, NIT, ciudad, pais',
  'Crear usuarios iniciales con roles y permisos',
  'Activar/desactivar modulos segun lo contratado',
  'Cargar catalogos maestros (productos, proveedores, bodegas)',
  'Registrar saldo inicial de inventario',
  'Prueba completa del sistema (OC, recepcion, transferencia, salida)',
  'Envio de correo de prueba para verificar identidad del remitente',
])

subTitle('Paso 6 - Entrega de Accesos')
bulletList([
  'URL del sistema: https://inventarioborinquen.sistech.com',
  'Usuarios y claves iniciales en documento confidencial',
  'Manual de Sistema de Gestion de Inventario en PDF',
  'Datos de contacto para soporte',
])

subTitle('Paso 7 - Capacitacion')
bulletList([
  'Sesion 1: Navegacion + Dashboard + Productos + Proveedores + Bodegas',
  'Sesion 2: Ordenes de Compra + Recepcion + Transferencias + Salidas',
  'Sesion 3: Ajustes + Toma Fisica + Produccion (formulas y ejecucion)',
  'Sesion 4: Tareas + Correos + Reportes + Asistente IA + Configuracion',
])

// ============== 5. CHECKLIST ==============
addPage()
sectionTitle('5. CHECKLIST - DATOS A SOLICITAR A BORINQUEN')
para('Usar esta lista para recopilar la informacion antes de iniciar la implementacion.')

subTitle('DATOS DE LA EMPRESA')
checklistItem('Nombre oficial de la empresa')
checklistItem('NIT / RUC')
checklistItem('Direccion, Ciudad, Pais')
checklistItem('Telefono de contacto')
checklistItem('Correo de contacto')
checklistItem('Logo (PNG/JPG)')
checklistItem('Representante legal')

y += 3
subTitle('DATOS SMTP (correo saliente)')
checklistItem('Tipo: Gmail / Corporativo')
checklistItem('Servidor SMTP')
checklistItem('Puerto')
checklistItem('Usuario SMTP')
checklistItem('Contrasena SMTP / App Password')
checklistItem('From Name (nombre remitente)')
checklistItem('From Email (correo remitente)')

y += 3
subTitle('USUARIOS INICIALES')
checklistItem('Lista de usuarios (nombre, usuario, correo, rol, clave)')
checklistItem('Asignacion de permisos por rol')
checklistItem('Modulos a activar')

y += 3
subTitle('CATALOGOS MAESTROS')
checklistItem('Archivo Excel con catalogo de productos')
checklistItem('Archivo Excel con proveedores')
checklistItem('Listado de bodegas (nombre, ciudad, responsable)')
checklistItem('Listado de centros de costo')
checklistItem('Listado de personal empresa')
checklistItem('Archivo Excel con saldo inicial por bodega')

// ============== 6. POST-ENTREGA ==============
addPage()
sectionTitle('6. POST-ENTREGA - AUTOGESTION DEL CLIENTE')
para('Despues de la entrega, el Admin de Borinquen puede autogestionar el sistema sin soporte tecnico:')

detailTable(
  ['Accion', 'Desde donde'],
  [
    ['Crear nuevos usuarios', 'Gestion de Usuarios'],
    ['Cambiar roles y permisos', 'Gestion de Usuarios (Matriz)'],
    ['Modificar datos de empresa', 'Datos Empresa'],
    ['Activar/desactivar modulos', 'Modulos del Sistema'],
    ['Registrar productos, proveedores, bodegas', 'Modulos correspondientes'],
    ['Emitir ordenes de compra y enviar email', 'Ordenes de Compra'],
    ['Recibir facturas y actualizar inventario', 'Recepcion de Facturas'],
    ['Transferir entre bodegas', 'Transferencias'],
    ['Registrar salidas a centros de costo', 'Salidas de Almacen'],
    ['Ajustes de inventario', 'Ajustes de Inventario'],
    ['Toma fisica (plantilla + carga)', 'Toma de Inventario Fisico'],
    ['Ejecutar ordenes de produccion', 'Produccion'],
    ['Generar reportes (PDF, Excel)', 'Todos los modulos'],
    ['Cambiar idioma (ES/EN)', 'Selector en la topbar'],
  ],
  [70, W - M * 2 - 70]
)

subTitle('Requiere soporte de SISTECH')
bulletList([
  'Cambio de dominio o subdominio',
  'Cambio de configuracion SMTP en variables de entorno',
  'Actualizaciones del sistema (nuevas funciones)',
  'Migracion o respaldo masivo de datos',
  'Desarrollo de modulos o reportes personalizados',
])

// ============== 7. RESUMEN FINAL ==============
sectionTitle('7. RESUMEN FINAL')

greenBox('BORINQUEN - GESTION DE INVENTARIO - RESUMEN FINANCIERO', 'Primer pago: $4,050 USD (50% licencia + implementacion) | Segundo pago: $1,900 USD (50% licencia al iniciar instalacion) | Mensualidad recurrente: $225 USD/mes | Total primer ano: $6,750 USD | Costo real SISTECH: $0/mes | Margen neto mensual: $225 USD/mes')

y += 2
detailTable(
  ['Concepto', 'Valor'],
  [
    ['Cliente', 'Borinquen'],
    ['Sistema', 'Gestion de Inventario'],
    ['URL', 'https://inventarioborinquen.sistech.com'],
    ['Proyecto Vercel', 'inventarioborinquen'],
    ['Dashboard', 'Personalizado con logo Borinquen'],
    ['Modulos', '22 (configurables)'],
    ['Idiomas', 'Espanol e Ingles'],
    ['Asistente voz', 'Activo'],
  ],
  [50, W - M * 2 - 50]
)

// ============== FOOTERS ==============
const totalPages = doc.getNumberOfPages()
for (let i = 2; i <= totalPages; i++) {
  doc.setPage(i)
  drawFooter(i - 1)
}

const output = doc.output('arraybuffer')
const outPath = path.join(process.cwd(), 'docs', 'INSTALACION_BORINQUEN_GESTION_INVENTARIO.pdf')
fs.writeFileSync(outPath, Buffer.from(output))
console.log(`PDF generado: ${outPath}`)
console.log(`Paginas: ${totalPages}`)
