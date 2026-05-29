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

const PINK = [136, 14, 79]
const LIGHT_PINK = [240, 98, 146]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const BG_LIGHT = [252, 228, 236]
const GREEN = [46, 125, 50]
const RED = [198, 40, 40]
const BLUE = [21, 101, 192]
const WHITE = [255, 255, 255]

function addPage() { doc.addPage(); pageNum++; y = M }
function checkPage(need = 20) { if (y + need > H - 20) addPage() }

function drawFooter(pNum) {
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('Postres Exquisitos — Plan de Negocios', W / 2, H - 8, { align: 'center' })
  doc.text(`Pag ${pNum}`, W - M, H - 8, { align: 'right' })
}

function sectionTitle(text) {
  checkPage(18)
  doc.setFillColor(...PINK)
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F')
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  doc.text(text, M + 5, y + 7)
  y += 14
}

function subTitle(text) {
  checkPage(12)
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...LIGHT_PINK)
  doc.text(text, M, y)
  y += 6
}

function subTitle2(text) {
  checkPage(10)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN)
  doc.text(text, M + 3, y)
  y += 5
}

function para(text) {
  checkPage(10)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  const lines = doc.splitTextToSize(text, W - M * 2)
  lines.forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.5 })
  y += 2
}

function paraBold(text) {
  checkPage(10)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
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

function infoBox(title, text) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const h = lines.length * 5 + 12
  doc.setFillColor(252, 228, 236)
  doc.setDrawColor(244, 143, 177)
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PINK)
  doc.text(title, M + 6, y + 5)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  let ty = y + 10
  lines.forEach(line => { doc.text(line, M + 6, ty); ty += 5 })
  y += h + 4
}

function greenBox(title, text) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const h = lines.length * 5 + 12
  doc.setFillColor(232, 245, 233)
  doc.setDrawColor(102, 187, 106)
  doc.setLineWidth(0.5)
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN)
  doc.text(title, M + 6, y + 5)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  let ty = y + 10
  lines.forEach(line => { doc.text(line, M + 6, ty); ty += 5 })
  y += h + 4
}

function warnBox(title, text) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const h = lines.length * 5 + 12
  doc.setFillColor(255, 243, 224)
  doc.setDrawColor(255, 204, 128)
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(230, 81, 0)
  doc.text(title, M + 6, y + 5)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  let ty = y + 10
  lines.forEach(line => { doc.text(line, M + 6, ty); ty += 5 })
  y += h + 4
}

function highlightBox(title, text) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const h = lines.length * 5 + 12
  doc.setFillColor(...PINK)
  doc.roundedRect(M, y, W - M * 2, h, 2, 2, 'F')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(248, 187, 208)
  doc.text(title, M + 6, y + 5)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(252, 228, 236)
  let ty = y + 10
  lines.forEach(line => { doc.text(line, M + 6, ty); ty += 5 })
  y += h + 4
}

function detailTable(headers, rows, colWidths) {
  checkPage(10 + rows.length * 6)
  doc.setFontSize(8)
  doc.setFillColor(...PINK)
  doc.roundedRect(M, y, W - M * 2, 7, 1, 1, 'F')
  doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
  let x = M + 3
  headers.forEach((h, i) => { doc.text(h, x, y + 5); x += colWidths[i] })
  y += 7
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

function phaseBox(title, items, investment, goal) {
  checkPage(15 + items.length * 5)
  doc.setFillColor(252, 228, 236)
  doc.setDrawColor(194, 24, 91)
  doc.setLineWidth(0.5)
  const itemLines = items.map(it => doc.splitTextToSize('- ' + it, W - M * 2 - 16)).flat()
  const invLine = doc.splitTextToSize('Inversion: ' + investment + ' | Meta: ' + goal, W - M * 2 - 16)
  const h = 10 + itemLines.length * 4.5 + invLine.length * 4.5 + 4
  doc.roundedRect(M + 4, y, W - M * 2 - 8, h, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PINK)
  doc.text(title, M + 10, y + 6)
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  let ty = y + 11
  itemLines.forEach(line => { doc.text(line, M + 10, ty); ty += 4.5 })
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...PINK)
  ty += 2
  invLine.forEach(line => { doc.text(line, M + 10, ty); ty += 4.5 })
  y += h + 4
}

// ══════════════════════════════════════════════════════════════════
// PORTADA
// ══════════════════════════════════════════════════════════════════
// Background gradient
doc.setFillColor(74, 25, 66)
doc.rect(0, 0, W, H, 'F')
doc.setFillColor(194, 24, 91)
doc.rect(0, H * 0.5, W, H * 0.5, 'F')

doc.setTextColor(255, 255, 255)
doc.setFontSize(40); doc.setFont('helvetica', 'bold')
doc.text('Postres', W / 2, 80, { align: 'center' })
doc.text('Exquisitos', W / 2, 95, { align: 'center' })

doc.setFontSize(14); doc.setFont('helvetica', 'normal')
doc.setTextColor(252, 228, 236)
doc.text('Plan de Negocios y Estrategia de Lanzamiento', W / 2, 112, { align: 'center' })

doc.setDrawColor(248, 187, 208); doc.setLineWidth(0.8)
doc.line(W / 2 - 35, 120, W / 2 + 35, 120)

doc.setFontSize(10); doc.setTextColor(252, 228, 236)
doc.text('Analisis de alternativas, costos operativos,', W / 2, 132, { align: 'center' })
doc.text('fases de crecimiento y recomendacion estrategica', W / 2, 139, { align: 'center' })

doc.setFillColor(255, 255, 255, 0.15)
doc.roundedRect(W / 2 - 50, 155, 100, 20, 4, 4, 'F')
doc.setFontSize(9); doc.setTextColor(248, 187, 208)
doc.text('DOCUMENTO CONFIDENCIAL', W / 2, 163, { align: 'center' })
doc.text('Preparado para los socios fundadores', W / 2, 169, { align: 'center' })

doc.setFontSize(9); doc.setTextColor(248, 187, 208)
doc.text('Abril 2026 — SISTECH Consultoria', W / 2, 195, { align: 'center' })

// ══════════════════════════════════════════════════════════════════
// 1. RESUMEN EJECUTIVO
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('1. Resumen Ejecutivo')
para('Postres Exquisitos es un emprendimiento de postres artesanales que busca posicionarse en el mercado con productos de alta calidad, elaborados con ingredientes naturales. El negocio ya cuenta con una plataforma digital (e-commerce) para recibir pedidos y canalizarlos via WhatsApp.')
para('Este documento analiza 3 alternativas para iniciar operaciones, con enfasis en minimizar riesgo financiero y maximizar la velocidad de salida al mercado.')

highlightBox('La Pregunta Clave', 'Como empezar a producir y entregar postres sin arriesgar capital excesivo mientras se valida que el mercado realmente paga por el producto?')

// ══════════════════════════════════════════════════════════════════
// 2. ALTERNATIVAS
// ══════════════════════════════════════════════════════════════════
sectionTitle('2. Alternativas Analizadas')

subTitle('Alternativa A: Cocina Oculta (Dark Kitchen)')
para('Recibir pedidos por la plataforma web/WhatsApp y transferirlos a una cocina oculta (ghost kitchen) que ya tiene equipos, infraestructura y permisos sanitarios.')
bulletList(['Inversion inicial: Baja', 'Riesgo: Bajo', 'Control: Limitado'])

subTitle('Alternativa B: Local Propio')
para('Montar un local con cocina propia, equipos, personal contratado y punto de venta fisico.')
bulletList(['Inversion inicial: Alta ($10,000 - $29,000 USD)', 'Riesgo: Alto', 'Control: Total'])

subTitle('Alternativa C: Modelo Hibrido (RECOMENDADA)')
para('Empezar con cocina oculta para validar el mercado, y migrar gradualmente a local propio cuando la demanda lo justifique. Combina lo mejor de A y B.')
bulletList(['Inversion inicial: Baja, crecimiento gradual', 'Riesgo: Bajo → controlado', 'Control: Limitado → Total'])

// ══════════════════════════════════════════════════════════════════
// 3. COSTOS
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('3. Comparativo Detallado de Costos')

subTitle('3.1 Alternativa A — Cocina Oculta (Dark Kitchen)')
detailTable(
  ['Concepto', 'Costo Estimado', 'Frecuencia'],
  [
    ['Alquiler espacio dark kitchen', '$300 - $800 USD/mes', 'Mensual'],
    ['Comision cocina', '15% - 30% del valor', 'Por pedido'],
    ['Ingredientes y materia prima', '$200 - $500 USD/mes', 'Mensual'],
    ['Empaques y presentacion', '$100 - $200 USD/mes', 'Mensual'],
    ['Delivery / domicilios', '$150 - $300 USD/mes', 'Mensual'],
    ['Marketing digital', '$100 - $300 USD/mes', 'Mensual'],
    ['Plataforma web (ya existe)', '$0', '—'],
    ['TOTAL MENSUAL', '$850 - $2,100 USD/mes', ''],
  ],
  [55, 55, W - M * 2 - 110]
)

greenBox('Ventajas de la Cocina Oculta', 'Inversion inicial casi nula. Permisos sanitarios ya resueltos. Puedes empezar a vender en 1-2 semanas. Si no funciona, puedes salir sin deudas. Escalas segun demanda.')

warnBox('Riesgos de la Cocina Oculta', 'Dependencia del tercero. Menos control de calidad. Margen reducido por comision. Limitacion en horarios y capacidad.')

subTitle('3.2 Alternativa B — Local Propio')
paraBold('INVERSION INICIAL (una sola vez):')
detailTable(
  ['Concepto', 'Costo Estimado'],
  [
    ['Adecuacion del local', '$3,000 - $8,000 USD'],
    ['Equipos de cocina', '$5,000 - $15,000 USD'],
    ['Mobiliario', '$1,000 - $3,000 USD'],
    ['Permisos y licencias', '$500 - $1,500 USD'],
    ['Inventario inicial', '$500 - $1,000 USD'],
    ['Branding', '$300 - $800 USD'],
    ['SUBTOTAL INVERSION', '$10,300 - $29,300 USD'],
  ],
  [60, W - M * 2 - 60]
)

paraBold('COSTOS OPERATIVOS MENSUALES:')
detailTable(
  ['Concepto', 'Costo Estimado'],
  [
    ['Arriendo del local', '$500 - $1,500 USD/mes'],
    ['Servicios (luz, agua, gas)', '$150 - $400 USD/mes'],
    ['Nomina (3 personas)', '$1,200 - $2,500 USD/mes'],
    ['Ingredientes', '$400 - $800 USD/mes'],
    ['Empaques + Delivery + Marketing', '$350 - $800 USD/mes'],
    ['Contador / legal', '$100 - $200 USD/mes'],
    ['TOTAL MENSUAL', '$2,700 - $6,200 USD/mes'],
  ],
  [60, W - M * 2 - 60]
)

warnBox('Riesgo Principal', 'Si la demanda no es suficiente en los primeros 3-6 meses, los costos fijos siguen corriendo. Necesitas vender $4,000 - $8,000 USD/mes solo para cubrir costos sin ganancia.')

// ══════════════════════════════════════════════════════════════════
// 4. RECOMENDACION
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('4. Recomendacion: Modelo Hibrido')

greenBox('La Estrategia Inteligente', 'Empezar ligero, crecer con datos. La mayoria de negocios de alimentos exitosos en la era digital empezaron con modelos lean. La clave no es tener el local perfecto, sino validar que la gente paga por tu producto antes de invertir fuerte.')

y += 2
subTitle('Fase 1 — Validacion (Meses 1-3): Cocina Oculta')
phaseBox('Objetivo: Validar producto, precio y demanda real', [
  'Operar desde la dark kitchen existente',
  'Recibir pedidos por plataforma web + WhatsApp + Instagram',
  'Probar el menu completo (8 productos iniciales)',
  'Medir: pedidos/semana, ticket promedio, producto mas vendido, zona de demanda',
  'Ajustar precios, recetas y presentacion segun feedback real',
  'Construir base de datos de clientes y seguidores en redes',
], '~$1,500 USD/mes', '50+ pedidos/mes')

subTitle('Fase 2 — Crecimiento (Meses 4-6): Presencia Fisica Minima')
phaseBox('Objetivo: Aumentar volumen y visibilidad', [
  'Seguir con dark kitchen, negociar mejor tarifa por volumen',
  'Participar en ferias, bazares y mercados de fin de semana',
  'Alianzas con cafeterias y restaurantes (venta al por mayor)',
  'Sistema de pedidos recurrentes (suscripciones semanales)',
  'Medir: punto de equilibrio, capacidad maxima de la dark kitchen',
], '~$2,000 USD/mes', '120+ pedidos/mes')

subTitle('Fase 3 — Expansion (Meses 7-12): Local Propio')
phaseBox('Objetivo: Independencia operativa total — SOLO si Fase 2 confirmo demanda', [
  'Buscar local en zona de mayor concentracion de clientes (ya tienes datos)',
  'Montar cocina propia con equipos que ya sabes que necesitas',
  'Contratar personal con base en carga real de trabajo',
  'Abrir punto de venta fisico + seguir con delivery',
  'Usar ganancias acumuladas de Fase 1-2 para financiar la inversion',
], '$10,000 - $20,000 USD', 'Rentabilidad mensual positiva')

// ══════════════════════════════════════════════════════════════════
// 5. COMPARATIVO
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('5. Por que Funciona el Modelo Hibrido')

detailTable(
  ['Criterio', 'Cocina Oculta (A)', 'Local Propio (B)', 'Hibrido (C)'],
  [
    ['Inversion inicial', 'Baja ($1,500)', 'Alta ($15,000+)', 'Baja → gradual'],
    ['Tiempo para vender', '1-2 semanas', '3-6 meses', '1-2 semanas'],
    ['Riesgo si no funciona', 'Pierdes poco', 'Pierdes mucho', 'Pierdes poco'],
    ['Control de calidad', 'Limitado', 'Total', 'Limitado → Total'],
    ['Margen de ganancia', 'Medio', 'Alto', 'Medio → Alto'],
    ['Escalabilidad', 'Limitada', 'Alta', 'Alta'],
    ['Decisiones con datos', 'Pocos', 'Sin datos previos', 'Basadas en datos'],
  ],
  [35, 38, 38, W - M * 2 - 111]
)

highlightBox('Regla de Oro del Emprendimiento', 'Nunca inviertas fuerte en algo que no has validado con clientes reales. La dark kitchen te permite validar con riesgo minimo. El local propio lo abres cuando ya sabes cuanto vendes, que productos piden mas, en que zona estan tus clientes y cuanto personal necesitas.')

// ══════════════════════════════════════════════════════════════════
// 6. FINANCIERO
// ══════════════════════════════════════════════════════════════════
sectionTitle('6. Proyeccion Financiera')

subTitle('Escenario con ticket promedio $15 USD')
para('Combos, tortas enteras, pedidos corporativos, suscripciones semanales.')

detailTable(
  ['Metrica', 'Fase 1 (Mes 1-3)', 'Fase 2 (Mes 4-6)', 'Fase 3 (Mes 7-12)'],
  [
    ['Pedidos/mes', '50', '120', '250+'],
    ['Ingreso bruto', '$750 USD', '$1,800 USD', '$3,750+ USD'],
    ['Costo operativo', '$1,500 USD', '$2,000 USD', '$3,500 USD'],
    ['Resultado', '-$750 USD', '-$200 USD', '+$250+ USD'],
  ],
  [35, 40, 40, W - M * 2 - 115]
)

greenBox('Claves para Subir el Ticket Promedio', 'Tortas enteras ($30-$50 USD) en vez de porciones. Combos familiares ($25-$35 USD). Pedidos corporativos para eventos. Suscripciones semanales "Caja Dulce" ($20 USD/semana). Fechas especiales: San Valentin, Dia de la Madre, Navidad ($40-$80 USD). Alianzas B2B con cafeterias y restaurantes.')

// ══════════════════════════════════════════════════════════════════
// 7. VENTAJA DIGITAL
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('7. Ventaja Competitiva: La Plataforma Digital')
para('Postres Exquisitos ya tiene algo que el 90% de las pastelerias no tiene: una plataforma digital profesional con catalogo, carrito de compras y pedidos por WhatsApp.')

detailTable(
  ['Lo que ya tienen', 'Lo que la mayoria no tiene'],
  [
    ['Sitio web con catalogo visual', 'Solo venden por Instagram o boca a boca'],
    ['Carrito de compras funcional', 'Reciben pedidos desordenados por WhatsApp'],
    ['Precios claros y transparentes', 'Dicen "te paso el precio por interno"'],
    ['Pedido directo a WhatsApp con detalle', 'Pierden tiempo confirmando pedidos'],
    ['Marca visual profesional', 'Fotos de celular sin branding'],
  ],
  [(W - M * 2) / 2, (W - M * 2) / 2]
)

infoBox('Ventaja con el modelo hibrido', 'La plataforma permite recibir pedidos 24/7 sin local fisico. Los clientes ven el catalogo, eligen, agregan al carrito y piden. Esto funciona perfecto con la dark kitchen: todo el negocio opera 100% digital desde el dia 1.')

// ══════════════════════════════════════════════════════════════════
// 8. MARKETING
// ══════════════════════════════════════════════════════════════════
sectionTitle('8. Estrategias de Marketing para Arrancar')

subTitle('Marketing de bajo costo (primeros 3 meses)')
detailTable(
  ['Estrategia', 'Costo', 'Impacto'],
  [
    ['Instagram + TikTok (videos de preparacion)', '$0 (tiempo)', 'Alto'],
    ['Muestras gratis a influencers locales', '$50-$100 USD', 'Alto'],
    ['Descuento primer pedido 20% OFF', 'Margen reducido', 'Medio'],
    ['Programa referidos: invita amigo, 15% OFF', '$0', 'Alto'],
    ['Google Maps (registro del negocio)', '$0', 'Medio'],
    ['Pauta Instagram/Facebook por zona', '$50-$100/mes', 'Alto'],
    ['Muestras en oficinas cercanas', '$30-$50 USD', 'Alto'],
  ],
  [58, 35, W - M * 2 - 93]
)

// ══════════════════════════════════════════════════════════════════
// 9. INDICADORES
// ══════════════════════════════════════════════════════════════════
addPage()
sectionTitle('9. Indicadores Clave a Medir')

detailTable(
  ['Indicador', 'Meta Fase 1', 'Meta Fase 2', 'Meta Fase 3'],
  [
    ['Pedidos por mes', '50', '120', '250+'],
    ['Ticket promedio', '$10 USD', '$15 USD', '$15-20 USD'],
    ['Costo adquisicion cliente', 'Medir', '< $3 USD', '< $2 USD'],
    ['Tasa de recompra', 'Medir', '> 30%', '> 40%'],
    ['Producto mas vendido', 'Identificar', 'Potenciar', 'Expandir linea'],
    ['Zona mayor demanda', 'Identificar', 'Concentrar delivery', 'Ubicar local ahi'],
    ['Margen bruto/producto', '> 50%', '> 55%', '> 60%'],
  ],
  [40, 35, 40, W - M * 2 - 115]
)

// ══════════════════════════════════════════════════════════════════
// 10. CONCLUSION
// ══════════════════════════════════════════════════════════════════
sectionTitle('10. Conclusion y Recomendacion Final')

highlightBox('Recomendacion: ALTERNATIVA C — Modelo Hibrido', 'Empezar con la cocina oculta (dark kitchen) inmediatamente. No esperen a tener el local perfecto. El mercado no espera. Cada dia sin vender es un dia sin datos, sin clientes y sin marca. La dark kitchen les permite: empezar en 2 semanas con menos de $1,500 USD, validar el producto con clientes reales, acumular datos, generar ingresos desde el mes 1, y construir marca antes de abrir el local.')

y += 2
para('Cuando la demanda supere la capacidad de la dark kitchen (120-150 pedidos/mes sostenidos durante 2+ meses), ese es el momento de buscar local propio. No antes.')

y += 4
greenBox('Frase para recordar', '"No necesitas un restaurante para empezar un negocio de comida. Necesitas clientes que paguen. Todo lo demas viene despues."')

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
const outPath = path.join(process.cwd(), 'docs', 'PLAN_NEGOCIOS_POSTRES_EXQUISITOS.pdf')
fs.writeFileSync(outPath, Buffer.from(output))
console.log(`PDF generado: ${outPath}`)
console.log(`Paginas: ${totalPages}`)
