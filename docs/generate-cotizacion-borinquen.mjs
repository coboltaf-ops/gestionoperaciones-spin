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
const SOFT_BLUE = [191, 219, 254]
const GOLD = [202, 138, 4]
const GREEN = [22, 163, 74]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const BG_LIGHT = [241, 245, 249]

const COT_NUMERO = 'COT-20260430-001'
const FECHA = '30 de abril de 2026'
const CLIENTE = 'CONSTRUCTORA BORINQUEN S.A.S.'
const CONSULTOR = 'Ing. Jose E. Palomares'

function addPage() { doc.addPage(); pageNum++; y = M + 6; drawHeader() }

function drawHeader() {
  doc.setFillColor(...BLUE)
  doc.rect(0, 0, W, 8, 'F')
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text(`COTIZACION ${COT_NUMERO}`, M, 5.5)
  doc.text(CLIENTE, W - M, 5.5, { align: 'right' })
}

function drawFooter(pNum) {
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('Ing. Jose E. Palomares  -  Apoyado IA de SaaS Factory International', M, H - 8)
  doc.text(`Pag. ${pNum}`, W - M, H - 8, { align: 'right' })
}

function checkPage(need = 20) { if (y + need > H - 18) addPage() }

function sectionTitle(text) {
  checkPage(18)
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F')
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text(text, M + 5, y + 7)
  y += 14
}

function subTitle(text) {
  checkPage(10)
  doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
  doc.text(text, M, y)
  doc.setDrawColor(...LIGHT_BLUE); doc.setLineWidth(0.4)
  doc.line(M, y + 1.5, M + 50, y + 1.5)
  y += 6
}

function para(text) {
  checkPage(8)
  doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  const lines = doc.splitTextToSize(text, W - M * 2)
  lines.forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.8 })
  y += 2
}

function bulletList(items) {
  doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  items.forEach(item => {
    checkPage(7)
    doc.setTextColor(...LIGHT_BLUE)
    doc.text('■', M + 2, y)
    doc.setTextColor(...DARK)
    const lines = doc.splitTextToSize(item, W - M * 2 - 8)
    lines.forEach((line, i) => { checkPage(5); doc.text(line, M + 7, y); if (i < lines.length - 1) y += 4.8 })
    y += 5.2
  })
  y += 1
}

function moduleCard(num, title, desc) {
  checkPage(22)
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(...SOFT_BLUE)
  const lines = doc.splitTextToSize(desc, W - M * 2 - 18)
  const h = 9 + lines.length * 4.5 + 3
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'FD')
  doc.setFillColor(...BLUE)
  doc.roundedRect(M + 3, y + 3, 11, 11, 2, 2, 'F')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text(String(num).padStart(2, '0'), M + 8.5, y + 10, { align: 'center' })
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
  doc.text(title, M + 17, y + 8.5)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  let ty = y + 14
  lines.forEach(line => { doc.text(line, M + 17, ty); ty += 4.5 })
  y += h + 3
}

function infoBox(text, color = 'blue') {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 16)
  const h = lines.length * 5.2 + 11
  if (color === 'blue') { doc.setFillColor(239, 246, 255); doc.setDrawColor(...SOFT_BLUE) }
  if (color === 'gold') { doc.setFillColor(254, 252, 232); doc.setDrawColor(234, 179, 8) }
  if (color === 'green') { doc.setFillColor(240, 253, 244); doc.setDrawColor(...GREEN) }
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  if (color === 'blue') doc.setTextColor(...BLUE)
  if (color === 'gold') doc.setTextColor(...GOLD)
  if (color === 'green') doc.setTextColor(...GREEN)
  let ty = y + 6.5
  lines.forEach(line => { doc.text(line, M + 8, ty); ty += 5.2 })
  y += h + 5
}

function quoteBox(text) {
  checkPage(28)
  const lines = doc.splitTextToSize(text, W - M * 2 - 26)
  const h = lines.length * 5.4 + 14
  doc.setFillColor(254, 249, 195) // amarillo suave
  doc.setDrawColor(146, 64, 14)   // cafe / marron claro
  doc.setLineWidth(0.7)
  doc.roundedRect(M, y, W - M * 2, h, 3, 3, 'FD')
  // Barra lateral cafe
  doc.setFillColor(180, 83, 9)
  doc.rect(M, y, 3, h, 'F')
  // Comilla decorativa
  doc.setFontSize(36); doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 83, 9)
  doc.text('"', M + 8, y + 14)
  // Texto
  doc.setFontSize(10); doc.setFont('helvetica', 'italic'); doc.setTextColor(120, 53, 15)
  let ty = y + 8.5
  lines.forEach(line => { doc.text(line, M + 18, ty); ty += 5.4 })
  y += h + 6
}

function priceTable(rows) {
  checkPage(20 + rows.length * 14)
  const headerH = 9
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, headerH, 1.5, 1.5, 'F')
  doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text('CONCEPTO', M + 4, y + 6)
  doc.text('VALOR (COP)', W - M - 4, y + 6, { align: 'right' })
  y += headerH + 1
  doc.setTextColor(...DARK)
  rows.forEach((r, i) => {
    const descLines = doc.splitTextToSize(r.detalle, W - M * 2 - 60)
    const rowH = Math.max(13, 8 + descLines.length * 4.2)
    if (i % 2 === 0) { doc.setFillColor(...BG_LIGHT); doc.rect(M, y, W - M * 2, rowH, 'F') }
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
    doc.text(r.titulo, M + 4, y + 5.5)
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
    let ty = y + 10
    descLines.forEach(line => { doc.text(line, M + 4, ty); ty += 4.2 })
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
    doc.text(r.valor, W - M - 4, y + 8, { align: 'right' })
    if (r.unidad) {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY)
      doc.text(r.unidad, W - M - 4, y + 12.5, { align: 'right' })
    }
    y += rowH
  })
  y += 4
}

function indexRow(num, title, page) {
  checkPage(7)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  doc.text(`${num}.`, M + 2, y)
  doc.text(title, M + 10, y)
  const dots = '.'.repeat(80)
  doc.setTextColor(...GRAY)
  doc.text(dots, M + 12 + doc.getTextWidth(title) + 2, y, { maxWidth: W - M * 2 - 30 - doc.getTextWidth(title) })
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
  doc.text(String(page), W - M - 2, y, { align: 'right' })
  y += 6.5
}

function signatureBlock() {
  checkPage(60)
  y += 10
  const colW = (W - M * 2 - 16) / 2
  const x1 = M
  const x2 = M + colW + 16
  doc.setDrawColor(...DARK); doc.setLineWidth(0.4)
  doc.line(x1, y + 18, x1 + colW, y + 18)
  doc.line(x2, y + 18, x2 + colW, y + 18)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
  doc.text('GERENCIA', x1 + colW / 2, y + 24, { align: 'center' })
  doc.text('CONSULTOR', x2 + colW / 2, y + 24, { align: 'center' })
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  doc.text(CLIENTE, x1 + colW / 2, y + 30, { align: 'center' })
  doc.text(CONSULTOR, x2 + colW / 2, y + 30, { align: 'center' })
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('Constructora Borinquen S.A.S.', x1 + colW / 2, y + 35, { align: 'center' })
  doc.text('Consultor de Sistemas y Marketing', x2 + colW / 2, y + 35, { align: 'center' })
  y += 42
}

// ============== PORTADA ==============
doc.setFillColor(10, 22, 40)
doc.rect(0, 0, W, H, 'F')
doc.setFillColor(...BLUE)
doc.rect(0, H * 0.62, W, H * 0.38, 'F')
doc.setFillColor(...GOLD)
doc.rect(0, H * 0.62, W, 1.2, 'F')

doc.setTextColor(...SOFT_BLUE)
doc.setFontSize(8); doc.setFont('helvetica', 'italic')
doc.text('Desarrollos elaborados por plataformas IA de', W / 2, 23, { align: 'center' })
doc.setTextColor(...GOLD)
doc.setFontSize(11); doc.setFont('helvetica', 'bold')
doc.text('SaaS FACTORY INTERNATIONAL', W / 2, 30, { align: 'center' })
doc.setFontSize(8); doc.setFont('helvetica', 'normal')
doc.setTextColor(...SOFT_BLUE)
doc.text('Professional Factory Software', W / 2, 36, { align: 'center' })

doc.setDrawColor(...GOLD); doc.setLineWidth(0.6)
doc.line(W / 2 - 25, 40, W / 2 + 25, 40)

doc.setTextColor(255, 255, 255)
doc.setFontSize(13); doc.setFont('helvetica', 'normal')
doc.text('COTIZACION', W / 2, 70, { align: 'center' })

doc.setFontSize(20); doc.setFont('helvetica', 'bold')
doc.text('Sistemas Operativos', W / 2, 88, { align: 'center' })
doc.text('y Administrativos de Gestion', W / 2, 99, { align: 'center' })

doc.setFontSize(11); doc.setFont('helvetica', 'normal')
doc.setTextColor(...SOFT_BLUE)
doc.text('Para', W / 2, 112, { align: 'center' })

doc.setFontSize(16); doc.setFont('helvetica', 'bold')
doc.setTextColor(...GOLD)
doc.text('CONSTRUCTORA BORINQUEN S.A.S.', W / 2, 122, { align: 'center' })

// Caja con datos de la cotizacion
doc.setFillColor(255, 255, 255)
doc.setDrawColor(...GOLD)
doc.setLineWidth(0.5)
doc.roundedRect(W / 2 - 65, 145, 130, 36, 3, 3, 'FD')
doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
doc.text('NUMERO DE COTIZACION', W / 2, 153, { align: 'center' })
doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GOLD)
doc.text(COT_NUMERO, W / 2, 162, { align: 'center' })
doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
doc.text(`Fecha de emision: ${FECHA}`, W / 2, 170, { align: 'center' })
doc.text('Validez: 8 dias calendario', W / 2, 175, { align: 'center' })

// Bloque inferior
doc.setTextColor(255, 255, 255)
doc.setFontSize(9); doc.setFont('helvetica', 'normal')
doc.text('ELABORADA POR', W / 2, 215, { align: 'center' })
doc.setFontSize(15); doc.setFont('helvetica', 'bold')
doc.setTextColor(...GOLD)
doc.text(CONSULTOR, W / 2, 226, { align: 'center' })
doc.setFontSize(10); doc.setFont('helvetica', 'normal')
doc.setTextColor(255, 255, 255)
doc.text('Consultor de Sistemas y Marketing', W / 2, 234, { align: 'center' })

doc.setFontSize(8); doc.setTextColor(...SOFT_BLUE)
doc.text('Documento confidencial - uso exclusivo del destinatario', W / 2, H - 14, { align: 'center' })

// ============== INDICE ==============
addPage()
sectionTitle('INDICE DE CONTENIDO')
y += 4
indexRow('1', 'Introduccion y Alcance del Sistema', 3)
indexRow('2', 'Resumen de Modulos del Sistema', 4)
indexRow('3', 'Generacion de PDF, Reportes y Graficos', 7)
indexRow('4', 'Inversion - Detalle de Costos', 8)
indexRow('5', 'Forma de Pago', 9)
indexRow('6', 'Cobertura de la Licencia', 9)
indexRow('7', 'Exclusiones', 10)
indexRow('8', 'Notas Importantes', 11)
indexRow('9', 'Validez de la Oferta y Firmas', 12)

y += 8
infoBox('La presente cotizacion ha sido elaborada de manera personalizada para CONSTRUCTORA BORINQUEN S.A.S. con base en el alcance funcional definido y los modulos disponibles en la plataforma.', 'gold')

// ============== 1. INTRODUCCION ==============
addPage()
sectionTitle('1. INTRODUCCION Y ALCANCE DEL SISTEMA')

para('CONSTRUCTORA BORINQUEN S.A.S. requiere una plataforma centralizada que integre las operaciones administrativas, de inventario, compras, almacen y control financiero en una sola herramienta moderna, accesible desde cualquier dispositivo y con respaldo permanente de la informacion.')

para(`La solucion propuesta es el Sistema de Gestion de Operaciones desarrollado por el ${CONSULTOR} utilizando las plataformas profesionales de SaaS Factory International, una plataforma multi-modulo construida sobre tecnologia de ultima generacion (Next.js 16, React 19, Supabase y arquitectura Cloud), que permite a la empresa operar todas sus areas criticas desde un unico punto de control.`)

subTitle('Beneficios principales')
bulletList([
  'Centralizacion total de la operacion: inventarios, compras, almacenes, proveedores, pagos, tareas y personal en una sola plataforma.',
  'Trazabilidad completa de cada movimiento: kardex automatico, historial de transacciones y reportes auditables.',
  'Acceso seguro multi-usuario con roles y permisos personalizados por modulo.',
  'Disponibilidad 24/7 desde web y dispositivos moviles, con backup diario automatizado.',
  'Asistente conversacional con voz que permite consultar el estado del inventario y operaciones en lenguaje natural.',
  'Integracion con sistemas contables externos vinculados via SaaS Factory.',
])

subTitle('Alcance funcional')
para('El sistema cubre el ciclo operativo completo de una constructora: desde la planificacion de compras y la recepcion de materiales, hasta el control de bodegas, transferencias entre almacenes, ajustes de inventario, pagos a proveedores y control bancario. Adicionalmente provee herramientas administrativas para gestion de personal, tareas, centros de costo y reportes ejecutivos.')

infoBox('La plataforma se entrega completamente configurada, lista para operar con los datos maestros de Constructora Borinquen S.A.S., y capacita al equipo en su uso productivo.', 'blue')

// ============== 2. MODULOS DEL SISTEMA ==============
addPage()
sectionTitle('2. RESUMEN DE MODULOS DEL SISTEMA')

para('A continuacion se describen los modulos que integra el sistema entregado. Cada modulo es funcional desde el primer dia, con interfaces unificadas, busqueda inteligente, exportacion a Excel y PDF, y trazabilidad completa.')

moduleCard(1, 'Dashboard Ejecutivo', 'Panel de control con KPIs en tiempo real: productos activos, valor del inventario, ordenes de compra, recepciones, transferencias y productos bajo minimo. Incluye graficos interactivos de ordenes por estado, distribucion de tareas y valor por bodega.')

moduleCard(2, 'Productos', 'Maestro de productos con codigo, descripcion, unidad de medida, categoria, costo, existencia, minimo y maximo. Permite cargas masivas via Excel, control por tipo de inventario y filtros avanzados.')

moduleCard(3, 'Kardex de Productos', 'Historial cronologico de cada movimiento por producto (entradas, salidas, transferencias, ajustes) con saldos automaticos, costo promedio y valorizacion en tiempo real.')

moduleCard(4, 'Proveedores', 'Maestro de proveedores con datos legales, condiciones comerciales, contactos y situacion. Base para ordenes de compra y pagos.')

moduleCard(5, 'Ordenes de Compra', 'Generacion, aprobacion y seguimiento de ordenes de compra con detalles de productos, impuestos, condiciones de pago y estados (Pendiente, Aprobada, Recibida Parcial, Recibida, Anulada).')

moduleCard(6, 'Orden de Pedido', 'Documento operativo para solicitar materiales a proveedores con bodega de llegada, centro de costo, comprador y aprobacion. Complementa el flujo de compras.')

moduleCard(7, 'Recepcion de Facturas', 'Registro de la entrada fisica de mercancia contra la orden de compra: actualiza existencias, cierra parcial o totalmente la orden y deja trazabilidad de la factura del proveedor.')

moduleCard(8, 'Pagos a Proveedores', 'Programacion y control de pagos a proveedores asociados a las facturas recibidas, con estados, fechas de vencimiento y reportes de cuentas por pagar.')

moduleCard(9, 'Control Bancario', 'Registro de movimientos bancarios y conciliacion con pagos del sistema. Permite mantener saldos actualizados por cuenta y banco.')

moduleCard(10, 'Bodegas', 'Definicion de las bodegas o almacenes de la empresa con saldos por producto. Soporta multiples bodegas con valorizacion independiente.')

moduleCard(11, 'Transferencias', 'Movimientos de productos entre bodegas con documento, fecha y trazabilidad. Actualiza existencias en origen y destino automaticamente.')

moduleCard(12, 'Salidas de Almacen', 'Registro de salidas por consumo, obra, devolucion o entrega, con afectacion al kardex y al centro de costo correspondiente.')

moduleCard(13, 'Ajustes de Inventario', 'Correccion de saldos por sobrantes, faltantes o errores con justificacion y aprobacion. Toda accion queda registrada en el kardex.')

moduleCard(14, 'Toma de Inventario Fisico', 'Modulo para programar y ejecutar conteos fisicos: hoja de captura, comparacion con saldos del sistema y generacion automatica de ajustes.')

moduleCard(15, 'Centros de Costo', 'Maestro de centros de costo (obras, proyectos, areas) que permite imputar consumos y compras para reportes financieros segmentados.')

moduleCard(16, 'Correos Enviados', 'Bitacora de los correos electronicos generados desde el sistema (ordenes, recepciones, pagos) con destinatario, asunto, fecha y estado.')

moduleCard(17, 'Tareas', 'Gestion de tareas y pendientes por usuario o area, con prioridad, fecha limite, situacion (Pendiente, En Proceso, Completada, Vencida) y graficos de seguimiento.')

moduleCard(18, 'Personal Empresa', 'Registro del personal con datos de contacto, cargo, departamento y situacion. Base para asignacion de tareas y permisos del sistema.')

moduleCard(19, 'Tablas de Referencias', 'Configuracion centralizada de listas maestras: unidades de medida, categorias, condiciones de pago, tipos de moneda, situaciones, etc.')

moduleCard(20, 'Asistente con Voz (Agente)', 'Asistente conversacional bilingue (espanol/ingles) que permite consultar el estado del inventario, ordenes y operaciones mediante voz, con respuesta hablada en tiempo real.')

moduleCard(21, 'Datos de Empresa', 'Configuracion del cliente: razon social, NIT, logo, datos de facturacion, direccion. Se aplican en todos los reportes y documentos generados.')

moduleCard(22, 'Gestion de Usuarios', 'Administracion de usuarios del sistema con roles, permisos por modulo (registrar, editar, eliminar) y control de acceso. Soporta hasta 8 usuarios concurrentes en esta licencia.')

moduleCard(23, 'Modulos del Sistema', 'Panel administrativo donde el cliente puede activar o desactivar modulos segun sus necesidades operativas, sin afectar la integridad de los datos.')

// ============== 3. PDFS, REPORTES Y GRAFICOS ==============
addPage()
sectionTitle('3. GENERACION DE PDF, REPORTES Y GRAFICOS')

para('Cada modulo del sistema cuenta con una pestana de Reportes que permite a los usuarios autorizados generar documentos analiticos a partir de la informacion almacenada, sin necesidad de exportar a herramientas externas.')

subTitle('Capacidades de reporteria')
bulletList([
  'Exportacion directa a Excel (.xlsx) con formato profesional, totales y filtros aplicados.',
  'Generacion de PDF con encabezados corporativos, logo de la empresa y pie de pagina personalizado.',
  'Filtros por rango de fechas, situacion, bodega, proveedor, centro de costo, tipo de inventario y otros criterios.',
  'Reportes ejecutivos: kardex valorizado, productos bajo minimo, ordenes pendientes, cuentas por pagar, saldos por bodega.',
  'Graficos de barras, tortas y lineas integrados en el dashboard y modulos clave.',
  'Bitacora de correos para auditoria de comunicaciones automaticas del sistema.',
])

subTitle('Documentos operativos generados')
bulletList([
  'Orden de Compra en PDF con logotipo, totales, condiciones y firma electronica del aprobador.',
  'Orden de Pedido para envio a proveedores.',
  'Recepcion de factura con detalle de productos recibidos.',
  'Comprobante de transferencia entre bodegas.',
  'Toma de inventario fisico con hojas de captura imprimibles.',
  'Estados de cuenta de proveedores y centros de costo.',
  'Comprobantes de Pago a Proveedores o personas naturales con detalle de la operacion, retenciones y firma de quien autoriza.',
  'Comprobantes de Pago por concepto de Anticipos, con identificacion del beneficiario, valor entregado y referencia de la orden u operacion asociada.',
])

infoBox('Todos los reportes y documentos llevan la identidad corporativa de Constructora Borinquen S.A.S. (logo, razon social, NIT y datos de contacto) configurada desde el modulo Datos de Empresa.', 'green')

// ============== 4. COSTOS ==============
addPage()
sectionTitle('4. INVERSION - DETALLE DE COSTOS')

para('La presente oferta contempla tres componentes de inversion claramente diferenciados: una inversion unica (licencia), una inversion de implementacion y capacitacion, y un servicio mensual recurrente que incluye toda la infraestructura tecnologica y soporte.')

priceTable([
  {
    titulo: 'A. Licencia Global del Sistema',
    detalle: 'Licencia de uso global del sistema con todos los modulos descritos en esta cotizacion. Pago unico.',
    valor: '$ 3.850.000',
    unidad: 'Pago unico',
  },
  {
    titulo: 'B. Capacitacion e Implementacion',
    detalle: 'Implementacion completa del sistema: definicion de roles y perfiles de usuarios, carga inicial de datos maestros y capacitacion presencial. Duracion: 16 horas.',
    valor: '$ 1.950.000',
    unidad: 'Pago unico - 16 horas presenciales',
  },
  {
    titulo: 'C. Uso Mensual',
    detalle: 'Hosting, dominio dedicado, graficacion en linea, backup de respaldo diario, 1 GB de almacenamiento y soporte tecnico hasta 4 horas mensuales (no acumulables).',
    valor: '$ 695.000',
    unidad: 'Mensual recurrente',
  },
])

y += 2
checkPage(28)
doc.setFillColor(...BLUE)
doc.roundedRect(M, y, W - M * 2, 22, 2, 2, 'F')
doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...SOFT_BLUE)
doc.text('TOTAL INVERSION INICIAL (Licencia + Implementacion)', M + 5, y + 8)
doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GOLD)
doc.text('$ 5.800.000 COP', W - M - 5, y + 12, { align: 'right' })
doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...SOFT_BLUE)
doc.text('Mas mensualidad recurrente de $ 695.000 COP', M + 5, y + 17)
y += 26

infoBox('Valores expresados en pesos colombianos (COP). No incluyen IVA si aplicara segun normatividad vigente.', 'gold')

// ============== 5. FORMA DE PAGO ==============
addPage()
sectionTitle('5. FORMA DE PAGO')

priceTable([
  {
    titulo: 'Pago Inicial Licencia',
    detalle: 'Cuota inicial sobre la licencia global del sistema, al momento de la firma de esta cotizacion, para iniciar la implementacion y configuracion.',
    valor: '$ 1.700.000',
    unidad: 'A la firma',
  },
  {
    titulo: 'Pago Inicial Capacitacion e Implementacion',
    detalle: '50% del valor de capacitacion e implementacion al inicio de pruebas (20 de Mayo de 2026). El 50% restante queda incluido en el saldo final a la entrega.',
    valor: '$ 975.000',
    unidad: 'Al inicio de pruebas',
  },
  {
    titulo: 'Saldo Final',
    detalle: 'Saldo restante (Total general menos los dos pagos iniciales) a la entrega del sistema funcionando y aceptado por la gerencia.',
    valor: '$ 3.125.000',
    unidad: 'A la entrega y funcionamiento',
  },
  {
    titulo: 'Mensualidad',
    detalle: 'Cuota mensual recurrente que inicia a partir de la instalacion y generacion de dominio y hosting dentro del servidor SaaS Factory International & Professional Factory Software.',
    valor: '$ 695.000',
    unidad: 'A partir de la instalacion',
  },
])

infoBox('La mensualidad cubre la operacion del sistema dentro de la infraestructura cloud de SaaS Factory International. El servicio se mantiene activo mientras el cliente este al dia con la cuota mensual.', 'blue')

// ============== 6. COBERTURA DE LA LICENCIA ==============
sectionTitle('6. COBERTURA DE LA LICENCIA')

para('La inversion contemplada en esta cotizacion incluye los siguientes alcances:')

bulletList([
  'Uso total e ilimitado de todos los modulos que posee el sistema, sin restricciones por volumen de transacciones.',
  'Capacidad para 8 usuarios concurrentes con sus roles y permisos definidos a la medida del organigrama de la empresa.',
  'Backup diario automatico de toda la informacion almacenada, con politica de retencion segun mejores practicas.',
  'Adecuacion y correccion sobre eventualidades que se presenten en la operacion regular del sistema.',
  'Soporte tecnico de 4 horas mensuales (no acumulables) para resolucion de incidentes, dudas funcionales y ajustes menores.',
  'Hosting dedicado en infraestructura cloud profesional con dominio propio bajo SaaS Factory International.',
  'Almacenamiento inicial de 1 GB para la operacion del sistema y respaldos.',
])

// ============== 7. EXCLUSIONES ==============
addPage()
sectionTitle('7. EXCLUSIONES')

para('La presente cotizacion no incluye:')

bulletList([
  'Desarrollos adicionales a los modulos y funcionalidades descritas en esta oferta.',
  'Personalizaciones especificas que requieran modificacion del codigo fuente del sistema.',
  'Integraciones con sistemas externos no contemplados en el alcance original.',
  'Capacitaciones adicionales por encima de las 16 horas presenciales acordadas.',
  'Soporte que exceda las 4 horas mensuales (se cotizara por separado a tarifa profesional).',
  'Almacenamiento adicional por encima del 1 GB inicial (se cotizara segun consumo).',
  'Migracion de datos historicos desde sistemas anteriores (cotizable bajo proyecto independiente).',
])

infoBox('Cualquier requerimiento adicional sera evaluado y cotizado de manera independiente, manteniendo siempre la calidad y el estandar profesional del proyecto.', 'gold')

// ============== 8. NOTAS IMPORTANTES ==============
addPage()
sectionTitle('8. NOTAS IMPORTANTES')

para('Debido a que el sistema esta en desarrollo y adecuacion a las necesidades especificas de Constructora Borinquen S.A.S., el cliente se compromete a entregar oportunamente la documentacion de formas y reportes requeridos para la gestion relacionada con los sistemas ofrecidos. Esta entrega es indispensable para garantizar que la implementacion refleje fielmente la operacion real de la empresa.')

subTitle('Cronograma sugerido de implementacion')
para(`De acuerdo con los tiempos de planeacion definidos por el ${CONSULTOR}, se proyectan los siguientes hitos:`)

bulletList([
  'Inicio de pruebas y validacion funcional: 20 de Mayo de 2026.',
  'Inicio en firme de la operacion productiva: 16 de Junio de 2026.',
])

infoBox('Esta planeacion debe ser estructurada en conjunto con el Director General de Constructora Borinquen S.A.S. para asegurar la disponibilidad del equipo, la entrega de la documentacion requerida y el cumplimiento de los hitos en las fechas previstas.', 'gold')

subTitle('Compromisos del cliente')
bulletList([
  'Designar un interlocutor unico (Director General o delegado) que coordine la entrega de informacion y la toma de decisiones operativas.',
  'Entregar la documentacion de formas, reportes y procesos especificos necesarios para parametrizar el sistema.',
  'Disponer del personal clave para las jornadas de capacitacion presencial (16 horas).',
  'Validar y aprobar formalmente cada hito del cronograma para avanzar a la siguiente fase.',
])

quoteBox('Los sistemas hay que adecuarlos a las necesidades de los Clientes, y no que los Clientes se adapten a las exigencias de un sistema.')

// ============== 9. VALIDEZ Y FIRMAS ==============
addPage()
sectionTitle('9. VALIDEZ DE LA OFERTA')

para('La presente cotizacion tiene una validez de OCHO (8) DIAS CALENDARIO contados a partir de la fecha de entrega del documento al cliente.')

para('Vencido este plazo sin haber recibido confirmacion formal de aceptacion, los valores y condiciones aqui consignadas podran ser revisados y ajustados conforme a la realidad del mercado al momento de la nueva negociacion.')

infoBox(`Documento elaborado el ${FECHA} por ${CONSULTOR}, Consultor de Sistemas y Marketing.`, 'blue')

y += 12
subTitle('Firmas de aceptacion')

para('En constancia de lo anterior y en senal de aceptacion, firman las partes:')

signatureBlock()

doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY)
doc.text('Documento generado electronicamente. La firma fisica o digital de ambas partes constituye la aceptacion formal de la oferta.', W / 2, y + 4, { align: 'center' })

// ============== FOOTERS ==============
const totalPages = doc.internal.getNumberOfPages()
for (let i = 2; i <= totalPages; i++) {
  doc.setPage(i)
  drawFooter(i - 1)
}

// ============== SAVE ==============
const outPath = path.join(process.cwd(), 'docs', `COTIZACION_BORINQUEN_${COT_NUMERO}.pdf`)
fs.writeFileSync(outPath, Buffer.from(doc.output('arraybuffer')))
console.log('PDF generado:', outPath)
console.log('Paginas:', totalPages)
