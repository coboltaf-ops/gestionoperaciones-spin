import jsPDFModule from 'jspdf'
import fs from 'fs'
import path from 'path'

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
const W = doc.internal.pageSize.getWidth()
const H = doc.internal.pageSize.getHeight()
const M = 16

let y = 0

// Colores
const BLUE = [30, 58, 138]
const LIGHT_BLUE = [96, 165, 250]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const BG_LIGHT = [241, 245, 249]
const GREEN = [22, 163, 74]
const RED = [220, 38, 38]
const AMBER = [217, 119, 6]

// Logo base64
let LOGO = null
try {
  const logoPath = path.join(process.cwd(), 'src', 'shared', 'lib', 'logo-base64.ts')
  const content = fs.readFileSync(logoPath, 'utf-8')
  const match = content.match(/export const LOGO_BASE64\s*=\s*['"]([^'"]+)['"]/)
  if (match) LOGO = match[1]
} catch { /* sin logo */ }

function addPage() {
  doc.addPage()
  y = M
}

function checkPage(need = 20) {
  if (y + need > H - 20) addPage()
}

function drawFooter(pageNum) {
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('Constructora Borinquen — Anexos Manual de Funciones — Gestion de Inventario', W / 2, H - 10, { align: 'center' })
  doc.text(`Pagina ${pageNum}`, W - M, H - 10, { align: 'right' })
}

function sectionTitle(text) {
  checkPage(25)
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F')
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(text, M + 5, y + 7)
  y += 14
}

function subTitle(text) {
  checkPage(12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...LIGHT_BLUE)
  doc.text(text, M, y)
  y += 6
}

function subTitle2(text) {
  checkPage(10)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GREEN)
  doc.text(text, M + 3, y)
  y += 5
}

function para(text) {
  checkPage(10)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  const lines = doc.splitTextToSize(text, W - M * 2)
  lines.forEach(line => {
    checkPage(5)
    doc.text(line, M, y)
    y += 4.5
  })
  y += 2
}

function paraBold(text) {
  checkPage(10)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  const lines = doc.splitTextToSize(text, W - M * 2)
  lines.forEach(line => {
    checkPage(5)
    doc.text(line, M, y)
    y += 4.5
  })
  y += 1
}

function bulletList(items) {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  items.forEach(item => {
    checkPage(6)
    doc.text('•', M + 2, y)
    const lines = doc.splitTextToSize(item, W - M * 2 - 8)
    lines.forEach((line, i) => {
      checkPage(5)
      doc.text(line, M + 7, y)
      if (i < lines.length - 1) y += 4.5
    })
    y += 5
  })
  y += 1
}

// Tabla de datos (campo: valor) - formulario
function formTable(rows) {
  const labelW = 55
  const valueW = W - M * 2 - labelW
  doc.setFontSize(8.5)

  rows.forEach((r, i) => {
    checkPage(7)
    if (i % 2 === 0) {
      doc.setFillColor(...BG_LIGHT)
      doc.rect(M, y - 1, W - M * 2, 6, 'F')
    }
    // Borde izquierdo azul
    doc.setFillColor(...LIGHT_BLUE)
    doc.rect(M, y - 1, 1.5, 6, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BLUE)
    doc.text(r[0], M + 4, y + 3)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text(r[1], M + labelW, y + 3)
    y += 6
  })
  y += 3
}

// Tabla de detalle (con encabezado y filas) - renglones
function detailTable(headers, rows, colWidths) {
  const totalW = W - M * 2
  doc.setFontSize(7.5)

  // Header
  checkPage(8)
  doc.setFillColor(...BLUE)
  doc.rect(M, y, totalW, 6, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  let xPos = M
  headers.forEach((h, i) => {
    doc.text(h, xPos + 2, y + 4)
    xPos += colWidths[i]
  })
  y += 6

  // Rows
  doc.setFont('helvetica', 'normal')
  rows.forEach((row, ri) => {
    checkPage(7)
    if (ri % 2 === 0) {
      doc.setFillColor(...BG_LIGHT)
      doc.rect(M, y, totalW, 6, 'F')
    }
    xPos = M
    doc.setTextColor(...DARK)
    row.forEach((cell, ci) => {
      doc.text(String(cell), xPos + 2, y + 4)
      xPos += colWidths[ci]
    })
    y += 6
  })

  // Borde
  doc.setDrawColor(200, 200, 200)
  doc.rect(M, y - 6 * (rows.length + 1), totalW, 6 * (rows.length + 1))
  y += 4
}

// Totales alineados a la derecha
function totalsBox(items) {
  checkPage(items.length * 6 + 4)
  const boxW = 80
  const boxX = W - M - boxW

  doc.setFillColor(245, 247, 250)
  doc.roundedRect(boxX, y, boxW, items.length * 6 + 2, 2, 2, 'F')
  doc.setDrawColor(...LIGHT_BLUE)
  doc.roundedRect(boxX, y, boxW, items.length * 6 + 2, 2, 2, 'S')

  doc.setFontSize(8.5)
  let ty = y + 5
  items.forEach((item, i) => {
    const isLast = i === items.length - 1
    doc.setFont('helvetica', isLast ? 'bold' : 'normal')
    doc.setTextColor(...(isLast ? BLUE : DARK))
    doc.text(item[0], boxX + 4, ty)
    doc.text(item[1], boxX + boxW - 4, ty, { align: 'right' })
    ty += 6
  })
  y += items.length * 6 + 6
}

// Badge de estado
function statusBadge(text, color) {
  checkPage(10)
  const badgeW = doc.getTextWidth(text) + 10
  doc.setFillColor(...color)
  doc.roundedRect(M, y, badgeW + 4, 6, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(text, M + 4, y + 4.2)
  y += 10
}

// Separador con nota
function exampleNote(text) {
  checkPage(12)
  doc.setDrawColor(...LIGHT_BLUE)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)
  y += 3
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...GRAY)
  const lines = doc.splitTextToSize(text, W - M * 2)
  lines.forEach(line => {
    doc.text(line, M, y)
    y += 4
  })
  y += 3
}

// ══════════════════════════════════════════════════════════════════
// PORTADA
// ══════════════════════════════════════════════════════════════════
doc.setFillColor(...BLUE)
doc.rect(0, 0, W, H, 'F')

if (LOGO) {
  try { doc.addImage(LOGO, 'JPEG', W / 2 - 25, 45, 50, 50) } catch { /* */ }
}

doc.setTextColor(255, 255, 255)
doc.setFontSize(26)
doc.setFont('helvetica', 'bold')
doc.text('Anexos', W / 2, 115, { align: 'center' })

doc.setFontSize(18)
doc.text('Manual de Funciones', W / 2, 126, { align: 'center' })

doc.setFontSize(14)
doc.setFont('helvetica', 'normal')
doc.text('Gestion de Inventario', W / 2, 138, { align: 'center' })

doc.setFontSize(20)
doc.setFont('helvetica', 'bold')
doc.text('Constructora Borinquen', W / 2, 155, { align: 'center' })

doc.setFontSize(11)
doc.setFont('helvetica', 'normal')
doc.setTextColor(200, 210, 240)
doc.text('Ejemplos practicos de uso por modulo', W / 2, 170, { align: 'center' })
doc.text('Version 1.0 — Marzo 2026', W / 2, 178, { align: 'center' })

// ══════════════════════════════════════════════════════════════════
// ÍNDICE
// ══════════════════════════════════════════════════════════════════
addPage()
doc.setFontSize(18)
doc.setFont('helvetica', 'bold')
doc.setTextColor(...BLUE)
doc.text('Indice de Anexos', W / 2, y + 5, { align: 'center' })
y += 18

const items = [
  'Anexo 1: Ejemplo de Orden de Compra',
  'Anexo 2: Ejemplo de Recepcion de Factura',
  'Anexo 3: Ejemplo de Bodega y Movimientos',
  'Anexo 4: Ejemplo de Transferencia entre Bodegas',
  'Anexo 5: Ejemplo de Salida de Almacen',
  'Anexo 6: Ejemplo de Ajuste de Inventario',
]

doc.setFontSize(12)
doc.setFont('helvetica', 'normal')
doc.setTextColor(...DARK)
items.forEach((m, i) => {
  doc.text(m, M + 10, y)
  y += 9
})

y += 10
para('Cada anexo presenta un ejemplo completo y realista de como se registra una operacion en el sistema, con datos de encabezado, detalle de productos, calculos automaticos, y el estado resultante.')

// ══════════════════════════════════════════════════════════════════
// ANEXO 1: ORDEN DE COMPRA
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('Anexo 1: Ejemplo de Orden de Compra')

para('Escenario: El departamento de compras necesita adquirir materiales de construccion para el proyecto Torre Norte. Se crea una orden de compra al proveedor Materiales del Caribe, C.A. para cemento, cabillas y bloques.')

y += 2
subTitle('Paso 1: Crear nueva orden')
para('El usuario hace clic en el boton "+ Nueva Orden". El sistema genera automaticamente el consecutivo ORD-00015 y coloca la fecha actual.')

subTitle('Paso 2: Llenar encabezado')
formTable([
  ['Nro. Orden:', 'ORD-00015 (auto-generado)'],
  ['Fecha Emision:', '26/03/2026'],
  ['Fecha Vencimiento:', '10/04/2026'],
  ['Proveedor:', 'Materiales del Caribe, C.A.'],
  ['Comprador:', 'Carlos Martinez'],
  ['Tipo de Moneda:', 'USD ($)'],
  ['% Impuesto:', '16.00'],
  ['Condicion de Pago:', 'Credito 30 dias'],
  ['Bodega de Llegada:', 'Bodega Central'],
  ['Centro de Costo:', 'CC-003 Proyecto Torre Norte'],
  ['Observaciones:', 'Materiales para fase de estructura. Entregar en horario 7am-4pm.'],
  ['Situacion:', 'Pendiente'],
])

subTitle('Paso 3: Agregar productos (renglones)')
para('El usuario hace clic en "+ Agregar Renglon" para cada producto. Al seleccionar el codigo, la descripcion y unidad de medida se llenan automaticamente:')

detailTable(
  ['Codigo', 'Descripcion', 'Cant.', 'Und.', 'Costo Unit.', 'Subtotal'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I (42.5 kg)', '500', 'Saco', '8.50', '4,250.00'],
    ['PROD-00045', 'Cabilla 1/2" (12mm) x 12m', '300', 'Unidad', '12.75', '3,825.00'],
    ['PROD-00067', 'Bloque de concreto 15x20x40', '2,000', 'Unidad', '1.20', '2,400.00'],
    ['PROD-00089', 'Alambre de amarre calibre 18', '50', 'Kg', '3.50', '175.00'],
  ],
  [28, 62, 16, 18, 24, 30]
)

subTitle('Paso 4: Calculos automaticos')
totalsBox([
  ['Subtotal:', '10,650.00 $'],
  ['Impuesto (16%):', '1,704.00 $'],
  ['TOTAL:', '12,354.00 $'],
])

subTitle('Paso 5: Guardar y enviar')
para('El usuario hace clic en "Guardar". La orden queda registrada con situacion "Pendiente".')

y += 2
subTitle('Paso 6: Enviar por correo al proveedor')
para('El usuario hace clic en el boton "Enviar por Email" de la orden. Se abre un modal con:')
formTable([
  ['Destinatario:', 'compras@materialesdelcaribe.com'],
  ['Asunto:', 'Orden de Compra ORD-00015 — Constructora Borinquen'],
  ['Mensaje:', 'Estimados Materiales del Caribe, C.A., adjunto encontraran la Orden de Compra ORD-00015 por un monto de $12,354.00. Agradecemos confirmar recepcion y disponibilidad...'],
])
para('Al hacer clic en "Enviar", el correo se despacha con el PDF adjunto y se registra automaticamente en el modulo Correos Enviados.')

exampleNote('Nota: El PDF generado incluye el logo de Constructora Borinquen en la cabecera, los datos fiscales de la empresa, y la tabla completa de productos con totales.')

// ══════════════════════════════════════════════════════════════════
// ANEXO 2: RECEPCIÓN DE FACTURA
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('Anexo 2: Ejemplo de Recepcion de Factura')

para('Escenario: El proveedor Materiales del Caribe, C.A. entrega parcialmente la Orden ORD-00015. Llega el cemento y las cabillas, pero los bloques y el alambre quedan pendientes. Se registra la recepcion con la factura del proveedor.')

y += 2
subTitle('Paso 1: Crear nueva recepcion')
para('El usuario hace clic en "+ Nueva Recepcion". El sistema genera el consecutivo REC-00008.')

subTitle('Paso 2: Llenar encabezado')
formTable([
  ['Nro. Recepcion:', 'REC-00008 (auto-generado)'],
  ['Nro. Factura:', 'FAC-2026-00342'],
  ['Fecha Emision Factura:', '01/04/2026'],
  ['Fecha Recibida:', '02/04/2026'],
  ['Orden de Compra:', 'ORD-00015 — Materiales del Caribe, C.A.'],
  ['Persona que Recibe:', 'Luis Rodriguez'],
  ['Observaciones:', 'Recepcion parcial. Bloques y alambre pendientes por falta de transporte.'],
  ['Estado:', 'Parcial'],
])

subTitle('Paso 3: Verificar renglones')
para('Al seleccionar la Orden de Compra ORD-00015, el sistema carga automaticamente todos los renglones. El usuario ingresa las cantidades que realmente recibe:')

detailTable(
  ['Codigo', 'Descripcion', 'Pedido', 'Ya Rec.', 'A Recibir', 'Completo'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I', '500', '0', '500', 'Si'],
    ['PROD-00045', 'Cabilla 1/2" x 12m', '300', '0', '300', 'Si'],
    ['PROD-00067', 'Bloque concreto 15x20x40', '2,000', '0', '0', 'No'],
    ['PROD-00089', 'Alambre amarre cal. 18', '50', '0', '0', 'No'],
  ],
  [28, 52, 18, 18, 22, 20]
)

exampleNote('El campo "Completo" se calcula automaticamente: si Ya Recibido + A Recibir >= Cantidad Pedida, muestra "Si". En este caso, el cemento y las cabillas se reciben completos, pero los bloques y alambre quedan pendientes.')

subTitle('Paso 4: Guardar')
para('El usuario hace clic en "Guardar". La recepcion queda con estado "Parcial" porque no todos los productos fueron recibidos.')

y += 3
subTitle('Recepcion posterior (segunda entrega)')
para('Cuando llegan los bloques y el alambre, se crea una nueva recepcion REC-00012 vinculada a la misma orden ORD-00015:')

detailTable(
  ['Codigo', 'Descripcion', 'Pedido', 'Ya Rec.', 'A Recibir', 'Completo'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I', '500', '500', '0', 'Si'],
    ['PROD-00045', 'Cabilla 1/2" x 12m', '300', '300', '0', 'Si'],
    ['PROD-00067', 'Bloque concreto 15x20x40', '2,000', '0', '2,000', 'Si'],
    ['PROD-00089', 'Alambre amarre cal. 18', '50', '0', '50', 'Si'],
  ],
  [28, 52, 18, 18, 22, 20]
)

para('Ahora todos los renglones muestran "Completo = Si" y la orden ORD-00015 puede cambiar su estado a "Recibida".')

// ══════════════════════════════════════════════════════════════════
// ANEXO 3: BODEGAS Y MOVIMIENTOS
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('Anexo 3: Ejemplo de Bodega y Movimientos')

para('Escenario: La empresa tiene 3 bodegas activas. Se muestra como se registra una bodega y como se consultan los saldos y movimientos.')

y += 2
subTitle('Ejemplo de registro de Bodega')
para('El usuario hace clic en "+ Nueva Bodega" y completa los datos:')

formTable([
  ['Nombre:', 'Bodega Central'],
  ['Correo:', 'bodegacentral@borinquen.com'],
  ['Telefono:', '0212-555-1234'],
  ['Direccion:', 'Av. Principal, Zona Industrial Norte, Galpon 5'],
  ['Ciudad:', 'Caracas'],
  ['Pais:', 'Venezuela'],
  ['Situacion:', 'Activa'],
])

y += 2
subTitle('Bodegas registradas en el sistema')
detailTable(
  ['Nombre', 'Correo', 'Telefono', 'Ciudad', 'Situacion'],
  [
    ['Bodega Central', 'bodegacentral@borinquen.com', '0212-555-1234', 'Caracas', 'Activa'],
    ['Bodega Obra Torre Norte', 'obranorte@borinquen.com', '0212-555-5678', 'Caracas', 'Activa'],
    ['Bodega Proyecto Sur', 'proyectosur@borinquen.com', '0261-555-9012', 'Maracaibo', 'Activa'],
    ['Bodega Vieja (Desuso)', 'n/a', '—', 'Caracas', 'Inactiva'],
  ],
  [40, 52, 30, 26, 22]
)

subTitle('Ejemplo de movimiento de bodega')
para('Al recibir la factura del ejemplo anterior, se genera un movimiento de entrada en Bodega Central:')

formTable([
  ['Consecutivo:', 'MOV-00045 (auto-generado)'],
  ['Fecha:', '02/04/2026'],
  ['Tipo:', 'Entrada'],
  ['Bodega:', 'Bodega Central'],
  ['Referencia:', 'Recepcion REC-00008 / Factura FAC-2026-00342'],
  ['Observaciones:', 'Entrada por recepcion parcial de OC ORD-00015'],
])

detailTable(
  ['Codigo', 'Descripcion', 'Cantidad', 'Und. Medida', 'Costo Unit.'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I (42.5 kg)', '500', 'Saco', '8.50'],
    ['PROD-00045', 'Cabilla 1/2" (12mm) x 12m', '300', 'Unidad', '12.75'],
  ],
  [28, 62, 22, 26, 28]
)

subTitle('Consulta de saldos por bodega')
para('En la pestana "Saldos", el usuario selecciona "Bodega Central" y ve las existencias actuales:')

detailTable(
  ['Codigo', 'Descripcion', 'Und.', 'Existencia', 'Costo Unit.', 'Valor Total'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I', 'Saco', '500', '8.50', '4,250.00'],
    ['PROD-00045', 'Cabilla 1/2" x 12m', 'Unidad', '300', '12.75', '3,825.00'],
    ['PROD-00102', 'Arena lavada', 'm3', '45', '25.00', '1,125.00'],
    ['PROD-00115', 'Piedra picada 1"', 'm3', '30', '28.00', '840.00'],
  ],
  [24, 48, 16, 24, 24, 30]
)

totalsBox([
  ['Total Bodega Central:', '10,040.00 $'],
])

// ══════════════════════════════════════════════════════════════════
// ANEXO 4: TRANSFERENCIA
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('Anexo 4: Ejemplo de Transferencia entre Bodegas')

para('Escenario: El proyecto Torre Norte necesita cemento y cabillas que estan en la Bodega Central. Se crea una transferencia para mover 200 sacos de cemento y 100 cabillas a la Bodega Obra Torre Norte.')

y += 2
subTitle('Paso 1: Crear nueva transferencia')
para('El usuario hace clic en "+ Nueva Transferencia". El sistema genera automaticamente TRF-00006.')

subTitle('Paso 2: Llenar encabezado')
formTable([
  ['Nro. Transferencia:', 'TRF-00006 (auto-generado)'],
  ['Fecha Emision:', '05/04/2026'],
  ['Bodega Salida:', 'Bodega Central'],
  ['Bodega Entrada:', 'Bodega Obra Torre Norte'],
  ['Persona que Emite:', 'Carlos Martinez'],
  ['Observaciones:', 'Traslado de materiales para inicio de fase de estructura nivel 3.'],
  ['Estado:', 'Pendiente'],
])

exampleNote('Validacion: El sistema no permite seleccionar la misma bodega como salida y entrada. Si el usuario intenta hacerlo, muestra un mensaje de error.')

subTitle('Paso 3: Agregar productos')
para('El usuario agrega los productos a transferir:')

detailTable(
  ['Codigo', 'Descripcion', 'Und. Medida', 'Cantidad'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I (42.5 kg)', 'Saco', '200'],
    ['PROD-00045', 'Cabilla 1/2" (12mm) x 12m', 'Unidad', '100'],
  ],
  [30, 68, 30, 28]
)

subTitle('Paso 4: Guardar')
para('Al hacer clic en "Guardar", la transferencia queda en estado "Pendiente" hasta que sea aprobada.')

y += 3
subTitle('Paso 5: Aprobar transferencia')
para('El supervisor revisa y cambia el estado a "Aprobada". Se actualiza la fecha de aprobacion:')
formTable([
  ['Fecha Aprobacion:', '05/04/2026'],
  ['Estado:', 'Aprobada'],
])

y += 2
subTitle('Resultado en saldos')
para('Despues de aprobar la transferencia, los saldos se actualizan:')

detailTable(
  ['Bodega', 'Producto', 'Antes', 'Movimiento', 'Despues'],
  [
    ['Bodega Central', 'Cemento Portland', '500', '-200', '300'],
    ['Bodega Central', 'Cabilla 1/2"', '300', '-100', '200'],
    ['Bodega Obra Torre Norte', 'Cemento Portland', '0', '+200', '200'],
    ['Bodega Obra Torre Norte', 'Cabilla 1/2"', '0', '+100', '100'],
  ],
  [42, 46, 24, 26, 24]
)

subTitle('Paso 6: Generar PDF')
para('El usuario puede hacer clic en "Generar PDF" para obtener un documento imprimible con el logo de la empresa, datos de la transferencia y la tabla de productos. Este PDF sirve como comprobante de despacho.')

// ══════════════════════════════════════════════════════════════════
// ANEXO 5: SALIDA DE ALMACÉN
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('Anexo 5: Ejemplo de Salida de Almacen')

para('Escenario: El equipo de construccion del proyecto Torre Norte necesita materiales para el vaciado de la losa del nivel 3. Se registra una salida de almacen desde la Bodega Obra Torre Norte, asignada al centro de costo del proyecto.')

y += 2
subTitle('Paso 1: Crear nueva salida')
para('El usuario hace clic en "+ Nueva Salida". El sistema genera SAL-00012.')

subTitle('Paso 2: Llenar encabezado')
formTable([
  ['Nro. Salida:', 'SAL-00012 (auto-generado)'],
  ['Fecha Emision:', '08/04/2026'],
  ['Bodega Salida:', 'Bodega Obra Torre Norte'],
  ['Persona que Emite:', 'Luis Rodriguez'],
  ['Centro de Costo:', 'CC-003 Proyecto Torre Norte'],
  ['Observaciones:', 'Materiales para vaciado de losa nivel 3. Autorizado por Ing. Gomez.'],
  ['Situacion:', 'Pendiente'],
])

exampleNote('Nota: El Centro de Costo es OBLIGATORIO en las salidas de almacen. Si el usuario intenta guardar sin seleccionarlo, el sistema muestra un error y no permite continuar.')

subTitle('Paso 3: Agregar productos')
detailTable(
  ['Codigo', 'Descripcion', 'Und. Medida', 'Cantidad'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I (42.5 kg)', 'Saco', '80'],
    ['PROD-00045', 'Cabilla 1/2" (12mm) x 12m', 'Unidad', '50'],
    ['PROD-00102', 'Arena lavada', 'm3', '10'],
    ['PROD-00115', 'Piedra picada 1"', 'm3', '8'],
  ],
  [30, 68, 30, 28]
)

subTitle('Paso 4: Guardar y aprobar')
para('Al guardar, la salida queda en estado "Pendiente". El supervisor la revisa y cambia a "Aprobada":')
formTable([
  ['Fecha Aprobacion:', '08/04/2026'],
  ['Situacion:', 'Aprobada'],
])

y += 3
subTitle('Resultado en inventario')
para('Las existencias de la Bodega Obra Torre Norte se reducen:')

detailTable(
  ['Producto', 'Existencia Antes', 'Salida', 'Existencia Despues'],
  [
    ['Cemento Portland Tipo I', '200', '-80', '120'],
    ['Cabilla 1/2" x 12m', '100', '-50', '50'],
    ['Arena lavada', '45', '-10', '35'],
    ['Piedra picada 1"', '30', '-8', '22'],
  ],
  [56, 34, 28, 38]
)

exampleNote('Validacion de existencia: Si el usuario intenta sacar mas cantidad de la disponible (ej: 300 sacos cuando solo hay 200), el sistema muestra un error: "No hay cantidad suficiente en la bodega seleccionada" y no permite guardar.')

subTitle('Paso 5: Generar PDF')
para('El PDF de salida incluye el logo de la empresa, datos del encabezado, tabla de productos, y un espacio para firma de quien recibe. Sirve como vale de almacen.')

// ══════════════════════════════════════════════════════════════════
// ANEXO 6: AJUSTE DE INVENTARIO
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('Anexo 6: Ejemplo de Ajuste de Inventario')

para('Escenario: Durante un inventario fisico en la Bodega Central, se detecta que hay 15 sacos de cemento danados por humedad y 5 cabillas adicionales que no estaban registradas. Se deben realizar dos ajustes: uno de salida por dano y otro de entrada por sobrante.')

y += 3
subTitle('Ejemplo A: Ajuste por Dano (Salida)')
paraBold('Tipo de ajuste: Salida por Dano (-) — Resta del inventario')

y += 2
subTitle('Paso 1: Crear nuevo ajuste')
formTable([
  ['Nro. Ajuste:', 'AJU-00009 (auto-generado)'],
  ['Fecha Emision:', '10/04/2026'],
  ['Bodega:', 'Bodega Central'],
  ['Tipo de Ajuste:', 'Salida por Dano (-)'],
  ['Persona que Autoriza:', 'Ing. Maria Gomez'],
  ['Observaciones:', 'Cemento danado por filtracion de agua en zona norte del galpon. Se levanto acta fotografica.'],
  ['Estado:', 'Pendiente'],
])

subTitle('Paso 2: Agregar productos danados')
detailTable(
  ['Codigo', 'Descripcion', 'Und. Medida', 'Cantidad', 'Signo'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I (42.5 kg)', 'Saco', '15', '(-)'],
  ],
  [28, 64, 26, 20, 18]
)

subTitle('Paso 3: Aprobar')
para('El supervisor revisa el ajuste y lo aprueba. El resultado:')

detailTable(
  ['Producto', 'Existencia Antes', 'Ajuste', 'Existencia Despues'],
  [
    ['Cemento Portland Tipo I', '300', '-15', '285'],
  ],
  [56, 34, 28, 38]
)

y += 5
subTitle('Ejemplo B: Ajuste por Sobrante (Entrada)')
paraBold('Tipo de ajuste: Entrada por Sobrante (+) — Suma al inventario')

y += 2
subTitle('Paso 1: Crear nuevo ajuste')
formTable([
  ['Nro. Ajuste:', 'AJU-00010 (auto-generado)'],
  ['Fecha Emision:', '10/04/2026'],
  ['Bodega:', 'Bodega Central'],
  ['Tipo de Ajuste:', 'Entrada por Sobrante (+)'],
  ['Persona que Autoriza:', 'Ing. Maria Gomez'],
  ['Observaciones:', 'Cabillas encontradas en inventario fisico no registradas. Posible error en recepcion anterior.'],
  ['Estado:', 'Pendiente'],
])

subTitle('Paso 2: Agregar productos sobrantes')
detailTable(
  ['Codigo', 'Descripcion', 'Und. Medida', 'Cantidad', 'Signo'],
  [
    ['PROD-00045', 'Cabilla 1/2" (12mm) x 12m', 'Unidad', '5', '(+)'],
  ],
  [28, 64, 26, 20, 18]
)

subTitle('Paso 3: Aprobar')
para('El supervisor revisa y aprueba. El resultado:')

detailTable(
  ['Producto', 'Existencia Antes', 'Ajuste', 'Existencia Despues'],
  [
    ['Cabilla 1/2" (12mm) x 12m', '200', '+5', '205'],
  ],
  [56, 34, 28, 38]
)

exampleNote('Nota: El signo del ajuste se muestra visualmente en la interfaz: azul para incrementos (+) y rojo para reducciones (-). Los tipos de ajuste disponibles son: Entrada por Sobrante (+), Salida por Faltante (-), Ajuste por Dano (-), y Ajuste por Reconteo (+/-).')

y += 3
subTitle('Resumen de existencias despues de todos los ejemplos')
para('Estado final de la Bodega Central despues de todas las operaciones de los anexos:')

detailTable(
  ['Codigo', 'Producto', 'Existencia', 'Costo', 'Valor'],
  [
    ['PROD-00023', 'Cemento Portland Tipo I', '285', '8.50', '2,422.50'],
    ['PROD-00045', 'Cabilla 1/2" x 12m', '205', '12.75', '2,613.75'],
    ['PROD-00102', 'Arena lavada', '45', '25.00', '1,125.00'],
    ['PROD-00115', 'Piedra picada 1"', '30', '28.00', '840.00'],
  ],
  [26, 52, 24, 22, 32]
)

totalsBox([
  ['Valor Bodega Central:', '7,001.25 $'],
])

// ══════════════════════════════════════════════════════════════════
// FOOTER en todas las páginas
// ══════════════════════════════════════════════════════════════════
const totalPages = doc.getNumberOfPages()
for (let i = 2; i <= totalPages; i++) {
  doc.setPage(i)
  drawFooter(i - 1)
}

// Guardar
const output = doc.output('arraybuffer')
const outPath = path.join(process.cwd(), 'docs', 'Anexos_Manual_Funciones_Gestion_Inventario.pdf')
fs.writeFileSync(outPath, Buffer.from(output))
console.log(`PDF generado: ${outPath}`)
console.log(`Total de paginas: ${totalPages}`)
