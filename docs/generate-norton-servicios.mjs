#!/usr/bin/env node
// Genera: docs/SERVICIOS_SISTEMAS_Y_MARKETING_GRUPO_NORTON_LATAM.pdf
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
    doc.text('Ing. Jose E. Palomares Tafur - Sistemas y Marketing para Grupo NORTON LATAM', W / 2, H - 10, { align: 'center' })
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
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  const padX = 8
  const padY = 6
  const lineH = 5
  const lines = doc.splitTextToSize(text, W - M * 2 - padX * 2)
  const boxH = padY + lines.length * lineH + padY - 1
  checkPage(boxH + 6)
  doc.setFillColor(239, 246, 255); doc.setDrawColor(...LIGHT_BLUE); doc.setLineWidth(0.5)
  doc.roundedRect(M, y, W - M * 2, boxH, 3, 3, 'FD')
  doc.setTextColor(...DARK)
  let ly = y + padY + 3
  lines.forEach(line => { doc.text(line, M + padX, ly); ly += lineH })
  y += boxH + 5
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

// Marca del profesional
const cx = W / 2
const cy = 75
doc.setFillColor(...LIGHT_BLUE)
doc.setDrawColor(...WHITE); doc.setLineWidth(1.5)
doc.circle(cx, cy, 18, 'FD')
doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
doc.text('ING.', cx, cy - 2, { align: 'center' })
doc.text('JEPT', cx, cy + 6, { align: 'center' })

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
doc.text('GRUPO NORTON LATAM', W / 2, 165, { align: 'center' })

// Badge
doc.setFillColor(0, 0, 0)
doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.6)
doc.roundedRect(W / 2 - 60, 185, 120, 20, 4, 4, 'FD')
doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
doc.text('DOCUMENTO COMERCIAL CONFIDENCIAL', W / 2, 193, { align: 'center' })
doc.setFontSize(8); doc.setFont('helvetica', 'normal')
doc.text('Para uso directivo Grupo Norton LATAM', W / 2, 199, { align: 'center' })

// Datos portada
const _now = new Date()
const _hh = String(_now.getHours()).padStart(2, '0')
const _mm = String(_now.getMinutes()).padStart(2, '0')
doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(147, 197, 253)
doc.text(`Fecha: 28 de Abril de 2026  -  Hora: ${_hh}:${_mm}`, W / 2, 222, { align: 'center' })
doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
doc.text('COTIZACION  COT-20260428-001', W / 2, 230, { align: 'center' })
doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(147, 197, 253)
doc.text('Version 1.0', W / 2, 238, { align: 'center' })

// Footer portada
doc.setFontSize(9); doc.setTextColor(...WHITE)
doc.text('Elaborado por Ingeniero Jose E. Palomares Tafur', W / 2, 270, { align: 'center' })
doc.setFontSize(8); doc.setTextColor(147, 197, 253)
doc.text('Ing. Jose E. Palomares Tafur - Consultoria en Sistemas y Marketing Digital', W / 2, 276, { align: 'center' })

// =========================================================
// PAGINA 2: RESUMEN EJECUTIVO
// =========================================================
addPage()

sectionTitle('RESUMEN EJECUTIVO')

para('El presente documento detalla los sistemas y servicios de marketing digital que se ofreceran para el Grupo NORTON LATAM. El modelo de adquisicion de licencia cubre hasta 5 sitios distintos utilizados por TAMOIN y/o NORTON.')

y += 3
infoNote('Los valores presentados estan expresados en Dolares de los Estados Unidos (US$) y no incluyen impuestos locales. La mensualidad incluye hosting, dominio, actualizaciones y soporte tecnico estandar.')

y += 1
infoNote('IMPORTANTE: Esta propuesta esta calculada para 5 paises del Grupo NORTON LATAM. Si se incorporan nuevos paises al alcance, los valores seran revisados y ajustados previa aprobacion conjunta entre Grupo NORTON y el Ing. Jose E. Palomares Tafur.')

y += 2
h3('Sistemas Incluidos en la Propuesta')
bulletList([
  'CRM COMERCIAL - Sistema integral para la gestion comercial que incluye: Dashboard con graficos, Datos de la Empresa, Manejo de Clientes, Manejo de Contactos dentro de cada Cliente, Manejo de Prospectos, Manejo de Oportunidades de Negocio, Seguimiento de Proyectos, Manejo de PQRS de soporte para clientes y Asignacion de Tareas.',
  'FORMULARIO PUBLICO DE PQRS DE CLIENTES - Formulario web accesible sin login que se conecta automaticamente con el Sistema CRM Comercial, permitiendo a los clientes radicar Peticiones, Quejas, Reclamos y Sugerencias directamente al sistema interno.',
])

y += 2
infoNote('Nota ilustrativa: tenemos prevista a futuro una estrategia de Landing Page de Promocion para la generacion de Prospectos y/u Oportunidades de Negocio. Tan pronto se requiera, enviaremos la oferta de este servicio.')

y += 2
h3('Capacidades Transversales del CRM Comercial')
bulletList([
  'Tablas de Referencias para codificaciones (paises, ciudades, tipos, situaciones)',
  'Gestion de Usuarios con roles y permisos por modulo',
  'Generacion de reportes en cada modulo y consultas personalizadas',
  'Dashboard ajustable que permite trabajar de forma online segun necesidades',
  'Soluciones parametrizables permitidas por el aplicativo',
])

// =========================================================
// MODELO A - POR PAIS
// =========================================================
addPage()

sectionTitle('SERVICIOS DE CRM COMERCIAL PARA 5 SITIOS DISTINTOS')

para('Este modelo permite a cada filial o sociedad del Grupo NORTON LATAM contratar los sistemas que requiera de manera independiente, asumiendo la licencia, implementacion y mensualidad de su pais. El alcance base de esta propuesta contempla 5 paises.')

subTitle('1. Sistema CRM COMERCIAL')
para('Sistema integral para la gestion comercial. Incluye Dashboard de graficos, Datos Empresa, Manejo de Clientes con sus Contactos, Prospectos, Oportunidades de Negocio, Seguimiento de Proyectos, Manejo de PQRS de soporte para clientes, Tablas de Referencias, Gestion de Usuarios con roles y permisos, reportes por modulo y consultas personalizadas. Disponible para cualquier pais LATAM.')

priceCard(
  'Licencia del Sistema CRM COMERCIAL',
  '1,850',
  'Pago unico — incluye instalacion en 5 empresas y capacitaciones',
  [
    'Es para instalar 5 empresas seleccionadas por el Cliente segun su prioridad',
    'Incluye la implementacion en los 5 sitios y las capacitaciones a usuarios',
    'Licencia completa del sistema',
    'Todos los modulos activados: Clientes, Contactos, Prospectos, Oportunidades, Proyectos, PQRS',
    'Dashboard con graficos y Datos Empresa',
    'Tablas de Referencias + Gestion de Usuarios con roles y permisos',
    'Generacion de reportes y consultas personalizadas por modulo',
    'Deploy en infraestructura del Ing. Jose E. Palomares Tafur',
  ]
)

priceCard(
  'Mensualidad de Uso - Hosting, Dominio y Soporte',
  '625',
  'Incluye 5 sistemas LATAM de CRM y 5 usuarios por sistema · Valor mensual',
  [
    '5 sistemas LATAM de CRM incluidos',
    'Hosting y dominio (sistech.com / subdominio)',
    'Soporte tecnico durante horario laboral',
    'Actualizaciones del sistema incluidas',
    'Backups automaticos y monitoreo',
    '5 usuarios por sistema incluidos',
  ],
  AMBER
)

// =========================================================
// PAGINA 4: FORMULARIO PUBLICO PQRS
// =========================================================
addPage()

subTitle('2. Formulario Publico de PQRS de Clientes')
para('Formulario web accesible sin login (pagina publica) que permite a los clientes de Norton radicar Peticiones, Quejas, Reclamos y Sugerencias (PQRS). Cada radicacion se conecta automaticamente con el Sistema CRM Comercial, generando un registro en el modulo PQRS del CRM para que el equipo interno de soporte haga seguimiento.')

priceCard(
  'Formulario Publico de PQRS (integrado al CRM Comercial)',
  'Incluido',
  'Sin costo adicional - parte del CRM Comercial',
  [
    'Pagina publica accesible sin login',
    'Campos: Cliente, Tipo (Peticion/Queja/Reclamo/Sugerencia), Prioridad, Detalle',
    'Genera numero de radicado automatico para seguimiento',
    'Se conecta en linea al modulo PQRS del CRM Comercial',
    'Correo automatico de confirmacion al cliente',
  ]
)

infoNote('El Formulario Publico de PQRS es una pagina web adicional al CRM Comercial que opera en linea. No requiere licencia ni mensualidad adicional: se entrega como parte integral del CRM Comercial contratado por el pais.')

// Tabla consolidada — pasar a página nueva
addPage()
subTitle('Resumen Consolidado')
priceTable(
  ['Concepto', 'Pago Unico', 'Mensual'],
  [
    ['CRM Comercial - Licencia 5 sitios LATAM', 'US$ 1,850', '-'],
    ['CRM Comercial - Implementacion + Capacitaciones', 'Incluido en Licencia CRM Comercial', '-'],
    ['CRM Comercial - Mensualidad para 5 paises (5 usuarios c/u)', '-', 'US$ 625 total · US$ 125 por pais'],
    ['Formulario PQRS Publico', 'Incluido en CRM Comercial', 'Incluido'],
  ]
)

// =========================================================
// EJEMPLO DE CALCULO 5 PAISES (MODELO A)
// =========================================================
addPage()

sectionTitle('EJEMPLO DE CALCULO - 5 SITIOS NORTON LATAM')

para('Considerando que los 5 sitios del Grupo NORTON LATAM adoptan el CRM Comercial (con Formulario Publico de PQRS integrado), bajo el modelo de Licencia para 5 Sitios:')

y += 2
priceTable(
  ['Concepto', 'Valor', 'Total'],
  [
    ['Licencia CRM Comercial (5 sitios LATAM)', 'US$ 1,850', 'US$ 1,850'],
    ['Implementacion + Capacitaciones (incluido en licencia)', 'Incluido', 'Incluido'],
    ['Formulario Publico de PQRS (incluido)', 'US$ 0', 'US$ 0'],
    ['Mensualidad CRM Comercial - Total 5 sitios', 'US$ 625 mes', 'US$ 625 mes'],
    ['Equivalente por pais', 'US$ 125 mes', '-'],
  ]
)

y += 3
totalBox('TOTAL PAGO UNICO (Licencia + Implementaciones)', '1,850', 'Licencia unica para 5 sitios LATAM con implementacion y capacitaciones incluidas')

y += 2
totalBox('TOTAL MENSUAL RECURRENTE (5 Sitios)', '625', 'CRM Comercial 5 sitios LATAM con 5 usuarios por sistema')

y += 4
infoNote('Los sitios se incorporan segun el cronograma definido por Grupo NORTON. La mensualidad inicia una vez completada la implementacion y capacitacion del primer sitio. El Formulario Publico de PQRS se entrega como parte del CRM Comercial, sin costo adicional.')

// =========================================================
// PAGINA: CONDICIONES Y FORMA DE PAGO
// =========================================================
addPage()

sectionTitle('CONDICIONES COMERCIALES')

subTitle('Forma de Pago')
bulletList([
  'Licencia CRM Comercial: 100% a la contratacion',
  'Mensualidades: prepago mensual, los primeros 5 dias de cada mes',
])

subTitle('Moneda y Facturacion')
bulletList([
  'Todos los valores estan expresados en Dolares de los Estados Unidos (US$)',
  'Todos los sistemas seran instalados en la WEB; por lo tanto no deben llevar IVA',
  'En los pagos de servicios WEB aplicar la retencion fijada para ese tipo de servicios',
  'Antes de iniciar una empresa en el sistema se factura el mes por anticipado. Asi sera a medida que se vayan incorporando todas, hasta cumplir el monto mensual total que se debera repartir entre los 5 sitios distintos',
  'Impuestos locales no incluidos, se facturan adicionalmente segun normativa de cada pais',
])

subTitle('Vigencia de la Propuesta')
bulletList([
  'Los valores tienen una vigencia de 15 dias desde la fecha de emision de este documento',
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

para('Para avanzar con la implementacion de los sistemas propuestos al Grupo NORTON LATAM, los pasos sugeridos son:')

y += 2
;[
  ['1', 'Aprobacion de la propuesta comercial por parte de la Direccion de Grupo NORTON LATAM'],
  ['2', 'Firma de acuerdo marco (MSA) bajo el Modelo A de contratacion'],
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

subTitle('Datos del Consultor')
bulletList([
  'Consultor: Ing. Jose E. Palomares Tafur',
  'C.C. 19.249.563',
  'Especialidad: Consultoria en Sistemas y Marketing Digital',
  'Correo: coboltaf@gmail.com',
  'Portafolio: consultorpalomares.vercel.app',
  'Banco: Bancolombia · Cuenta de Ahorros N° 3627 915 7961',
])

y += 3
infoNote('Este documento es una propuesta comercial preliminar. Los valores y alcances finales se ratificaran en el contrato marco (MSA) a firmar entre el Ing. Jose E. Palomares Tafur y Grupo NORTON LATAM.')

y += 4
checkPage(60)
subTitle('Consideraciones sobre el Modelo de CRM Propuesto')
para('El sistema actual de CRM disenado corresponde a la informacion recibida inicial de lo que se requiere. Es evidente que, al participar varios paises, debemos adecuar un modelo de CRM capaz de optimizar los procesos del area comercial. Por ello es muy importante iniciar con un pais donde podamos definir el modelo que mas serviria para todos los paises donde NORTON hace presencia.')
para('Recuerden que los sistemas deben adecuarse a los Clientes, no los Clientes adecuarse al Sistema.')
para('Si se requiere que el primer piloto se desarrolle en conjunto con un especialista de ustedes con conocimientos del proceso de Ofertas y Seguimiento a Oportunidades, estoy dispuesto, si asi lo consideran, a estar con ese equipo fisicamente donde se requiera, por un tiempo maximo de 4 dias segun mi experiencia.')
para('El modelo de CRM podra ser utilizado tanto por TAMOIN como por NORTON. Solo debemos tener en cuenta que los servicios y modelos de negocios tienen particularidades diferentes que habra que conocer bien para la adecuacion del CRM, de manera que sirva tambien para las operaciones LATAM.')
para('Cualquier informacion y aclaracion adicional estoy dispuesto a atenderla cuando ustedes asi lo requieran.')

y += 5
// Firma area
checkPage(35)
doc.setDrawColor(...DARK); doc.setLineWidth(0.4)
doc.line(M, y + 15, M + 70, y + 15)
doc.line(W - M - 70, y + 15, W - M, y + 15)
doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
doc.text('Aprobado por Grupo NORTON LATAM', M, y + 20)
doc.text('Por Ing. Jose E. Palomares Tafur', W - M, y + 20, { align: 'right' })
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
const outputPath = 'docs/SERVICIOS_SISTEMAS_Y_MARKETING_GRUPO_NORTON_LATAM.pdf'
fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')))
console.log(`PDF generado: ${outputPath}`)
console.log(`Paginas: ${doc.getNumberOfPages()}`)
