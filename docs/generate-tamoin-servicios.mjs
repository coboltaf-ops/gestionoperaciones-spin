#!/usr/bin/env node
// Genera: docs/SERVICIOS_SISTEMAS_Y_MARKETING_GRUPO_TAMOIN_LATAM.pdf
import jsPDFModule from 'jspdf'
import fs from 'fs'

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
const W = doc.internal.pageSize.getWidth()
const H = doc.internal.pageSize.getHeight()
const M = 18
let y = 0
let pageNum = 0

const BLUE = [30, 58, 138]
const LIGHT_BLUE = [96, 165, 250]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const LIGHT_GRAY = [243, 244, 246]
const WHITE = [255, 255, 255]
const GREEN = [22, 163, 74]
const AMBER = [217, 119, 6]

function addPage() { doc.addPage(); pageNum++; y = M + 8 }
function checkPage(need = 20) { if (y + need > H - 20) addPage() }

function footer(totalPages) {
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    if (i === 1) continue // no footer on cover
    doc.setFontSize(8); doc.setTextColor(...GRAY)
    doc.setFont('helvetica', 'normal')
    doc.text('Servicios SISTECH - Sistemas y Marketing para Grupo TAMOIN LATAM', W / 2, H - 10, { align: 'center' })
    doc.text(`Pagina ${i - 1}`, W - M, H - 10, { align: 'right' })
  }
}

function sectionTitle(text) {
  checkPage(18)
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, 11, 2, 2, 'F')
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(text, M + 6, y + 7.5)
  y += 16
}

function subTitle(text) {
  checkPage(12)
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
  doc.text(text, M, y); y += 7
  doc.setDrawColor(...LIGHT_BLUE); doc.setLineWidth(0.4)
  doc.line(M, y - 2, M + 60, y - 2)
  y += 2
}

function h3(text) {
  checkPage(10)
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text(text, M, y); y += 5.5
}

function para(text) {
  checkPage(10)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  doc.splitTextToSize(text, W - M * 2).forEach(line => {
    checkPage(5); doc.text(line, M, y); y += 5
  })
  y += 2
}

function bulletList(items) {
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  items.forEach(item => {
    checkPage(7)
    doc.setTextColor(...BLUE)
    doc.text('*', M + 3, y)
    doc.setTextColor(...DARK)
    doc.splitTextToSize(item, W - M * 2 - 8).forEach((line, i) => {
      doc.text(line, M + 8, y); y += 5
    })
    y += 1
  })
  y += 2
}

function priceCard(title, price, frequency, bullets, highlightColor = BLUE) {
  const lines = bullets.reduce((acc, b) => acc + doc.splitTextToSize(b, W - M * 2 - 14).length, 0)
  const boxH = 32 + lines * 5 + 4
  checkPage(boxH + 5)
  // Box
  doc.setFillColor(...LIGHT_GRAY); doc.setDrawColor(...highlightColor); doc.setLineWidth(0.6)
  doc.roundedRect(M, y, W - M * 2, boxH, 3, 3, 'FD')
  // Left accent bar
  doc.setFillColor(...highlightColor)
  doc.rect(M, y, 3, boxH, 'F')
  // Title
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...highlightColor)
  doc.text(title, M + 8, y + 8)
  // Price
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.text(`US$ ${price}`, W - M - 6, y + 12, { align: 'right' })
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY)
  doc.text(frequency, W - M - 6, y + 18, { align: 'right' })
  // Bullets
  let by = y + 24
  doc.setFontSize(9); doc.setTextColor(...DARK)
  bullets.forEach(b => {
    doc.setTextColor(...GREEN); doc.text('OK', M + 8, by)
    doc.setTextColor(...DARK)
    doc.splitTextToSize(b, W - M * 2 - 22).forEach((line, i) => {
      doc.text(line, M + 18, by); by += 5
    })
    by += 1
  })
  y += boxH + 5
}

function priceTable(headers, rows) {
  const totalW = W - M * 2
  const colWidths = headers.map((_, i) => i === 0 ? totalW * 0.45 : (totalW * 0.55) / (headers.length - 1))
  checkPage(10 + rows.length * 8)
  // Header
  doc.setFillColor(...BLUE); doc.rect(M, y, totalW, 8, 'F')
  doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  let xPos = M
  headers.forEach((h, i) => {
    const align = i === 0 ? 'left' : 'right'
    const x = align === 'right' ? xPos + colWidths[i] - 3 : xPos + 3
    doc.text(h, x, y + 5.5, { align })
    xPos += colWidths[i]
  })
  y += 8
  // Rows
  doc.setFont('helvetica', 'normal')
  rows.forEach((row, ri) => {
    checkPage(9)
    if (ri % 2 === 0) { doc.setFillColor(...LIGHT_GRAY); doc.rect(M, y, totalW, 8, 'F') }
    xPos = M
    row.forEach((cell, ci) => {
      const align = ci === 0 ? 'left' : 'right'
      const x = align === 'right' ? xPos + colWidths[ci] - 3 : xPos + 3
      if (ci === 0) {
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
      } else {
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...BLUE)
      }
      doc.setFontSize(9.5)
      doc.text(String(cell), x, y + 5.5, { align })
      xPos += colWidths[ci]
    })
    y += 8
  })
  y += 5
}

function totalBox(label, total, subtext) {
  checkPage(22)
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, 16, 2, 2, 'F')
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(label, M + 6, y + 7)
  doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text(`US$ ${total}`, W - M - 6, y + 10, { align: 'right' })
  if (subtext) {
    doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text(subtext, W - M - 6, y + 14, { align: 'right' })
  }
  y += 20
}

function infoNote(text) {
  checkPage(15)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const boxH = lines.length * 5 + 6
  doc.setFillColor(239, 246, 255); doc.setDrawColor(...LIGHT_BLUE); doc.setLineWidth(0.5)
  doc.roundedRect(M, y, W - M * 2, boxH, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  let ly = y + 5
  lines.forEach(line => { doc.text(line, M + 6, ly); ly += 5 })
  y += boxH + 4
}

// =========================================================
// PORTADA
// =========================================================
pageNum = 1

// Fondo azul completo
doc.setFillColor(...BLUE); doc.rect(0, 0, W, H, 'F')

// Banda decorativa superior
doc.setFillColor(...LIGHT_BLUE); doc.rect(0, 40, W, 2.5, 'F')
doc.rect(0, 250, W, 2.5, 'F')

// Logo SISTECH (placeholder circulo con texto)
const cx = W / 2
const cy = 75
doc.setFillColor(...LIGHT_BLUE)
doc.setDrawColor(...WHITE); doc.setLineWidth(1.5)
doc.circle(cx, cy, 18, 'FD')
doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
doc.text('SISTECH', cx, cy + 2, { align: 'center' })

// Titulo principal
doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
doc.text('SERVICIOS DE SISTEMAS', W / 2, 120, { align: 'center' })
doc.text('Y MARKETING DIGITAL', W / 2, 132, { align: 'center' })

// Linea divisoria
doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.8)
doc.line(W / 2 - 50, 140, W / 2 + 50, 140)

// Subtitulo
doc.setFontSize(15); doc.setFont('helvetica', 'normal'); doc.setTextColor(147, 197, 253)
doc.text('Propuesta Comercial para', W / 2, 152, { align: 'center' })

doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
doc.text('GRUPO TAMOIN LATAM', W / 2, 165, { align: 'center' })

// Badge
doc.setFillColor(0, 0, 0)
doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.6)
doc.roundedRect(W / 2 - 60, 185, 120, 20, 4, 4, 'FD')
doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
doc.text('DOCUMENTO COMERCIAL CONFIDENCIAL', W / 2, 193, { align: 'center' })
doc.setFontSize(8); doc.setFont('helvetica', 'normal')
doc.text('Solo para uso directivo de Grupo Tamoin', W / 2, 199, { align: 'center' })

// Datos portada
doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(147, 197, 253)
const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
doc.text(`Fecha: ${fecha}`, W / 2, 230, { align: 'center' })
doc.text('Version 1.0', W / 2, 236, { align: 'center' })

// Footer portada
doc.setFontSize(9); doc.setTextColor(...WHITE)
doc.text('Elaborado por SISTECH - Sistemas Inteligentes de Tecnologia', W / 2, 275, { align: 'center' })

// =========================================================
// PAGINA 2: RESUMEN EJECUTIVO
// =========================================================
addPage()

sectionTitle('RESUMEN EJECUTIVO')

para('El presente documento detalla los sistemas y servicios de marketing digital desarrollados por SISTECH para el Grupo TAMOIN LATAM, incluyendo su marca comercial Norton. La oferta se estructura en dos modelos de contratacion:')

h3('Modelo A - Por Pais (cada filial contrata individualmente)')
para('Cada pais del grupo adquiere los sistemas que requiera y paga su propia implementacion y mensualidad. Ideal cuando las filiales administran presupuestos independientes.')

h3('Modelo B - Grupo LATAM (contratacion unica compartida)')
para('La Corporacion Grupo TAMOIN contrata los sistemas una sola vez y los comparte entre todas sus filiales. Se cancela una mensualidad consolidada que cubre soporte y asesoria a todos los usuarios del grupo.')

y += 3
infoNote('Los valores presentados estan expresados en Dolares de los Estados Unidos (US$) y no incluyen impuestos locales. La mensualidad incluye hosting, dominio, actualizaciones y soporte tecnico estandar.')

y += 1
infoNote('IMPORTANTE: Esta propuesta esta calculada para 8 paises del Grupo TAMOIN LATAM. Si se incorporan nuevos paises al alcance, los valores seran revisados y ajustados previa aprobacion conjunta entre Grupo TAMOIN y SISTECH.')

y += 2
h3('Sistemas Incluidos en la Propuesta')
bulletList([
  'CRM GTM - Gestion comercial de clientes, contactos, oportunidades, prospectos, tareas y tickets',
  'Gestion de Inventario - Control integral de productos, bodegas, ordenes de compra, transferencias y produccion',
  'Landing Corporativa - Sitio web de captacion para TAMOIN LATAM y Norton LATAM',
  'Pautas Digitales - Gestion de campanas en LinkedIn, Instagram y Facebook',
])

// =========================================================
// MODELO A - POR PAIS
// =========================================================
addPage()

sectionTitle('MODELO A - CONTRATACION POR PAIS')

para('Este modelo permite a cada filial o sociedad del grupo contratar los sistemas que requiera de manera independiente, asumiendo la implementacion y mensualidad de su pais.')

subTitle('1. Sistema CRM GTM (por pais)')
para('CRM corporativo para gestion de clientes, prospectos, oportunidades, contratos y atencion al cliente. Disponible para cualquier pais LATAM.')

priceCard(
  'Licencia del Sistema CRM GTM',
  '2,500',
  'Pago unico (estructura / licencia)',
  [
    'Licencia completa del sistema',
    'Todos los modulos activados',
    'Configuracion inicial base',
    'Deploy en infraestructura SISTECH',
  ]
)

priceCard(
  'Implementacion por Pais',
  '200',
  'Pago unico por pais',
  [
    'Personalizacion con logo y colores del cliente',
    'Carga de datos referenciales (paises, ciudades, tipos)',
    'Creacion de usuarios iniciales',
    'Capacitacion al equipo usuario (hasta 4 horas)',
  ],
  GREEN
)

priceCard(
  'Mensualidad de Uso - Hosting y Soporte',
  '150',
  'Mensual por pais - hasta 5 usuarios',
  [
    'Hosting y dominio (sistech.com / subdominio)',
    'Soporte tecnico durante horario laboral',
    'Actualizaciones del sistema incluidas',
    'Backups automaticos y monitoreo',
  ],
  AMBER
)

// =========================================================
// PAGINA 4: GESTION INVENTARIO + LANDING POR PAIS
// =========================================================
addPage()

subTitle('2. Sistema de Gestion de Inventario (por pais)')
para('Sistema de control integral de inventarios para paises del grupo que administren almacenes. Incluye productos, proveedores, ordenes de compra, bodegas, transferencias, produccion, toma fisica y asistente con voz.')

priceCard(
  'Licencia del Sistema de Gestion de Inventario',
  '3,800',
  'Pago unico (estructura / licencia)',
  [
    'Licencia completa del sistema',
    '22 modulos operativos activados',
    'Asistente con voz en espanol e ingles',
    'Kardex, produccion con formulas, toma fisica',
  ]
)

priceCard(
  'Implementacion por Pais',
  '250',
  'Pago unico por pais',
  [
    'Personalizacion con logo del cliente',
    'Carga de productos, proveedores y bodegas iniciales',
    'Capacitacion a almacenistas y compradores (hasta 4 horas)',
    'Configuracion de permisos por rol',
  ],
  GREEN
)

priceCard(
  'Mensualidad de Uso - Hosting y Soporte',
  '225',
  'Mensual por pais',
  [
    'Hosting, dominio y respaldos incluidos',
    'Soporte tecnico en horario laboral',
    'Actualizaciones permanentes',
    'Disponible en espanol e ingles',
  ],
  AMBER
)

// =========================================================
// PAGINA 5: LANDING
// =========================================================
addPage()

subTitle('3. Landing Corporativa TAMOIN LATAM / NORTON LATAM')
para('Sitio web corporativo para promocionar los servicios de TAMOIN y su marca Norton en mercados LATAM. Disenada para captacion de prospectos y posicionamiento de marca.')

priceCard(
  'Estructura de la Landing',
  '500',
  'Pago unico (estructura base)',
  [
    'Diseno corporativo con identidad TAMOIN y Norton',
    'Secciones: servicios, catalogo, contacto, casos de exito',
    'Formulario de captacion de prospectos (integrable con CRM GTM)',
    'SEO basico y optimizacion para dispositivos moviles',
  ]
)

priceCard(
  'Implementacion por Pais',
  '140',
  'Pago unico por pais',
  [
    'Personalizacion con datos de la filial',
    'Configuracion de dominio / subdominio del pais',
    'Cargue de contenido inicial (servicios, contactos)',
    'Entrega en produccion',
  ],
  GREEN
)

priceCard(
  'Mensualidad de Uso',
  '95',
  'Mensual por pais',
  [
    'Hosting y dominio incluidos',
    'Mantenimiento y actualizaciones menores',
    'Monitoreo de disponibilidad 24/7',
    'Soporte tecnico y ajustes de contenido',
  ],
  AMBER
)

y += 2
subTitle('4. Pautas Digitales en Redes Sociales')
para('Gestion y ejecucion de campanas pagas en redes sociales para captacion y posicionamiento de TAMOIN / Norton LATAM.')

bulletList([
  'LinkedIn - ideal para segmento B2B y reclutamiento',
  'Instagram - posicionamiento visual y casos de exito',
  'Facebook - alcance masivo y retargeting',
])

infoNote('El valor de las pautas se define por campana segun la red social, el objetivo, la segmentacion, la geografia y el presupuesto asignado. Se entrega propuesta individual por cada pauta con metricas esperadas y reporte de resultados.')

// Tabla consolidada Modelo A
y += 2
subTitle('Resumen Consolidado - Modelo A')
priceTable(
  ['Concepto', 'Pago Unico', 'Mensual'],
  [
    ['CRM GTM (estructura)', 'US$ 2,500', '-'],
    ['CRM GTM implementacion/pais', 'US$ 200', '-'],
    ['CRM GTM mensualidad/pais (5 usuarios)', '-', 'US$ 150'],
    ['Gestion Inventario (estructura)', 'US$ 3,800', '-'],
    ['Gestion Inventario implementacion/pais', 'US$ 250', '-'],
    ['Gestion Inventario mensualidad/pais', '-', 'US$ 225'],
    ['Landing estructura', 'US$ 500', '-'],
    ['Landing implementacion/pais', 'US$ 140', '-'],
    ['Landing mensualidad/pais', '-', 'US$ 95'],
    ['Pautas digitales', 'A cotizar', 'A cotizar'],
  ]
)

// =========================================================
// MODELO B - GRUPO LATAM
// =========================================================
addPage()

sectionTitle('MODELO B - CONTRATACION GRUPO LATAM')

para('Este modelo consolida la contratacion de los sistemas a nivel Corporacion Grupo TAMOIN LATAM. Los sistemas se adquieren una sola vez y se comparten entre las 8 filiales del grupo. La asesoria y soporte se facturan de manera unica y se distribuyen entre los usuarios LATAM que usen los sistemas.')

infoNote('Alcance base: 8 paises del Grupo TAMOIN LATAM. La incorporacion de paises adicionales se revisara conjuntamente y requerira ajuste de precios previa aprobacion.')

y += 3
subTitle('Licencias de Sistemas (pago unico)')

priceTable(
  ['Sistema', 'Valor Pago Unico'],
  [
    ['CRM GTM - Grupo LATAM', 'US$ 2,500'],
    ['Gestion de Inventario - Grupo LATAM', 'US$ 3,800'],
    ['Landing Grupo TAMOIN LATAM / NORTON LATAM', 'US$ 500'],
  ]
)

y += 2
totalBox('TOTAL LICENCIAS (Pago Unico)', '6,800', 'Los tres sistemas - cobertura toda LATAM')

y += 5
subTitle('Servicio Mensual Consolidado')

para('En lugar de pagar mensualidades por pais, el Grupo TAMOIN paga una unica mensualidad de asesoria y soporte a todos los sistemas LATAM. Este valor debe repartirse internamente entre las filiales o usuarios que usen los sistemas.')

priceCard(
  'Asesoria y Soporte Mensual - Todos los Sistemas LATAM',
  '4,800',
  'Mensual unico para los 8 paises del grupo',
  [
    'Hosting y dominio para los tres sistemas',
    'Soporte tecnico prioritario para las 8 filiales',
    'Asesoria funcional y de procesos',
    'Actualizaciones y mejoras continuas',
    'Backups y monitoreo 24/7',
    'Gestion de incidencias centralizada',
  ]
)

y += 2
subTitle('Pautas Digitales')
para('El valor por pauta se maneja de forma independiente y se define segun la red social (LinkedIn, Instagram, Facebook), el objetivo de la campana y el presupuesto asignado. Se entrega cotizacion y propuesta individual por cada pauta.')

// =========================================================
// PAGINA 7: COMPARATIVA
// =========================================================
addPage()

sectionTitle('COMPARATIVA MODELO A vs MODELO B')

para('La siguiente tabla facilita la decision entre los dos modelos de contratacion. La eleccion depende del numero de paises que adoptan los sistemas y de la politica de contratacion del grupo.')

y += 2
priceTable(
  ['Concepto', 'Modelo A (Pais)', 'Modelo B (Grupo)'],
  [
    ['Licencia CRM GTM', 'US$ 2,500', 'US$ 2,500'],
    ['Licencia Gestion Inventario', 'US$ 3,800', 'US$ 3,800'],
    ['Licencia Landing', 'US$ 500', 'US$ 500'],
    ['Implementacion CRM (por pais)', 'US$ 200', 'Incluido'],
    ['Implementacion Inventario (por pais)', 'US$ 250', 'Incluido'],
    ['Implementacion Landing (por pais)', 'US$ 140', 'Incluido'],
    ['Mensualidad CRM/pais', 'US$ 150', 'N/A'],
    ['Mensualidad Inventario/pais', 'US$ 225', 'N/A'],
    ['Mensualidad Landing/pais', 'US$ 95', 'N/A'],
    ['Mensualidad Grupo LATAM consolidada (8 paises)', 'N/A', 'US$ 4,800'],
  ]
)

y += 3
h3('Ejemplo de calculo - 8 paises adoptan los 3 sistemas')
para('Considerando que los 8 paises del Grupo TAMOIN LATAM adoptan CRM, Gestion de Inventario y Landing:')

bulletList([
  'Modelo A: 6,800 (licencias) + 4,720 (implementaciones 8 paises: 200+250+140 x 8) + 3,760 USD/mes (150+225+95 x 8)',
  'Modelo B: 6,800 (licencias) + 0 (implementaciones incluidas) + 4,800 USD/mes (unico consolidado para los 8 paises)',
])

infoNote('Modelo B consolida el soporte y la asesoria en una sola factura para los 8 paises. Incluye todas las implementaciones sin costo adicional (ahorro de US$ 4,720 vs Modelo A). El pago mensual unico de US$ 4,800 facilita la distribucion interna entre filiales. Si se incorporan paises adicionales al alcance, los valores se ajustaran previa aprobacion conjunta.')

// =========================================================
// PAGINA 8: CONDICIONES Y FORMA DE PAGO
// =========================================================
addPage()

sectionTitle('CONDICIONES COMERCIALES')

subTitle('Forma de Pago')
bulletList([
  'Licencias: 50% inicial y 50% al iniciar la primera instalacion',
  'Implementaciones: contra entrega al terminar la capacitacion',
  'Mensualidades: prepago mensual, los primeros 5 dias de cada mes',
  'Pautas digitales: prepago al 100% del monto de la pauta antes de iniciar campana',
])

subTitle('Moneda y Facturacion')
bulletList([
  'Todos los valores estan expresados en Dolares de los Estados Unidos (US$)',
  'La facturacion se realiza desde Colombia con retencion en la fuente aplicable',
  'Impuestos locales no incluidos, se facturan adicionalmente segun normativa de cada pais',
])

subTitle('Vigencia de la Propuesta')
bulletList([
  'Los valores tienen una vigencia de 60 dias desde la fecha de emision de este documento',
  'Las mensualidades son ajustables anualmente segun IPC LATAM',
  'Los contratos son anuales con renovacion automatica salvo notificacion con 30 dias de anticipacion',
])

subTitle('Servicios Incluidos en la Mensualidad')
bulletList([
  'Hosting en plataforma Vercel Pro (99.99% uptime)',
  'Dominio corporativo o subdominio sistech.com',
  'Actualizaciones automaticas del sistema',
  'Backups diarios con retencion de 30 dias',
  'Monitoreo 24/7 de disponibilidad',
  'Soporte tecnico por correo en horario laboral (Lun-Vie 8am-6pm COT)',
])

subTitle('Servicios NO Incluidos')
bulletList([
  'Desarrollo de modulos nuevos o personalizaciones especificas (se cotizan aparte)',
  'Migracion de datos desde sistemas anteriores (se cotiza por alcance)',
  'Capacitacion adicional mas alla de la inicial incluida',
  'Integraciones con sistemas de terceros no contemplados en el alcance',
])

// =========================================================
// PAGINA 9: CONTACTO Y CIERRE
// =========================================================
addPage()

sectionTitle('SIGUIENTES PASOS')

para('Para avanzar con la implementacion de los sistemas propuestos al Grupo TAMOIN LATAM, los pasos sugeridos son:')

y += 2
;[
  ['1', 'Aprobacion de la propuesta comercial por parte de la Direccion de Grupo TAMOIN'],
  ['2', 'Firma de acuerdo marco (MSA) y seleccion del modelo (A o B)'],
  ['3', 'Definicion de paises y cronograma de despliegue'],
  ['4', 'Facturacion del primer hito: 50% inicial de la licencia'],
  ['5', 'Despliegue del sistema - Pais 1 (piloto)'],
  ['6', 'Capacitacion del equipo y puesta en produccion'],
  ['7', 'Replicacion a los paises restantes segun cronograma'],
].forEach(([n, t]) => {
  checkPage(12)
  doc.setFillColor(...BLUE); doc.circle(M + 4, y + 1.5, 3.5, 'F')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(n, M + 4, y + 3, { align: 'center' })
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  doc.text(t, M + 12, y + 3)
  y += 9
})

y += 5
sectionTitle('CONTACTO')

subTitle('Datos de SISTECH')
bulletList([
  'Empresa: SISTECH - Sistemas Inteligentes de Tecnologia',
  'Representante: Jose Enrique Palomares Tafur',
  'Correo: coboltaf@gmail.com',
  'Dominio corporativo: sistech.com',
  'Portafolio: consultorpalomares.vercel.app',
])

y += 3
infoNote('Este documento es una propuesta comercial preliminar. Los valores y alcances finales se ratificaran en el contrato marco (MSA) a firmar entre SISTECH y Grupo TAMOIN LATAM.')

y += 5
// Firma area
checkPage(35)
doc.setDrawColor(...DARK); doc.setLineWidth(0.4)
doc.line(M, y + 15, M + 70, y + 15)
doc.line(W - M - 70, y + 15, W - M, y + 15)
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
doc.text('Aprobado por Grupo TAMOIN', M, y + 20)
doc.text('Por SISTECH', W - M, y + 20, { align: 'right' })
doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY)
doc.text('Nombre, cargo y firma', M, y + 25)
doc.text('Jose Enrique Palomares Tafur', W - M, y + 25, { align: 'right' })

// Cierre
y += 35
checkPage(10)
doc.setFontSize(9); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY)
doc.text('- FIN DEL DOCUMENTO -', W / 2, y, { align: 'center' })

// Footers
footer(doc.getNumberOfPages())

// Guardar
const outputPath = 'docs/SERVICIOS_SISTEMAS_Y_MARKETING_GRUPO_TAMOIN_LATAM.pdf'
fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')))
console.log(`PDF generado: ${outputPath}`)
console.log(`Paginas: ${doc.getNumberOfPages()}`)
