import jsPDFModule from 'jspdf'
import fs from 'fs'
import path from 'path'

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule

// Cargar imágenes como base64
const IMG_DIR = '/tmp/brochure-imgs'
function loadImg(name) {
  const buf = fs.readFileSync(path.join(IMG_DIR, name))
  return 'data:image/jpeg;base64,' + buf.toString('base64')
}
const IMG_COVER = loadImg('industrial.jpg')
const IMG_ABOUT = loadImg('cover.jpg')
const IMG_P1 = loadImg('p1.jpg')
const IMG_P2 = loadImg('p2.jpg')
const IMG_P3 = loadImg('p3.jpg')
const IMG_P4 = loadImg('p4.jpg')

// ═══ Paleta Norton — Azul Rey unificado ═══
const BLUE = '#1E3A8A'
const BLUE_DARK = '#1E3A8A'
const BLUE_DEEP = '#1E3A8A'
const INK = '#1A1A1A'
const MUTED = '#64748B'
const LIGHT = '#F7F7F8'
const BORDER = '#E5E7EB'

const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
const W = doc.internal.pageSize.getWidth()
const H = doc.internal.pageSize.getHeight()
const M = 48

function hex(v) { return v }
function setFill(c) { doc.setFillColor(c) }
function setText(c) { doc.setTextColor(c) }
function setDraw(c) { doc.setDrawColor(c) }

function drawLogoMark(x, y, size = 28, { onDark = false } = {}) {
  const s = size / 32
  // Izquierdo: azul rey fuerte (más brillante sobre fondos oscuros para contraste)
  setFill(onDark ? '#3B82F6' : '#1E3A8A')
  doc.triangle(x, y + 24 * s, x + 14 * s, y + 6 * s, x + 22 * s, y + 16 * s, 'F')
  doc.triangle(x, y + 24 * s, x + 22 * s, y + 16 * s, x + 14 * s, y + 24 * s, 'F')
  // Derecho: rojo Norton
  setFill('#E30613')
  doc.triangle(x + 22 * s, y + 16 * s, x + 30 * s, y + 6 * s, x + 46 * s, y + 24 * s, 'F')
  doc.triangle(x + 22 * s, y + 16 * s, x + 46 * s, y + 24 * s, x + 30 * s, y + 24 * s, 'F')
}

function drawLogoWithText(x, y, { small = false, onDark = false } = {}) {
  const markSize = small ? 22 : 32
  drawLogoMark(x, y, markSize, { onDark })
  const textX = x + (small ? 38 : 54)
  setText(onDark ? '#FFFFFF' : BLUE_DEEP)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(small ? 16 : 22)
  doc.text('Norton', textX, y + (small ? 14 : 18))
  setText(onDark ? '#C6CBD5' : MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(small ? 7 : 9)
  doc.text('edificios industriales', textX, y + (small ? 22 : 30))
}

function pageHeaderBand(text) {
  setFill(BLUE)
  doc.rect(0, 0, W, 6, 'F')
  drawLogoWithText(M, 22, { small: true })
  setText('#000000')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(text, W - M, 34, { align: 'right' })
  setDraw(BORDER)
  doc.setLineWidth(0.5)
  doc.line(M, 58, W - M, 58)
}

function pageFooter(pageNum, total) {
  setText(MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('NORTON EDIFICIOS INDUSTRIALES  ·  nortonei.com', M, H - 24)
  doc.text(`${pageNum} / ${total}`, W - M, H - 24, { align: 'right' })
}

// ═══════════════════════════════════════════════════════
// PÁGINA 1 — PORTADA
// ═══════════════════════════════════════════════════════
doc.addImage(IMG_COVER, 'JPEG', 0, 0, W, H, undefined, 'FAST')
setFill(BLUE_DARK)
doc.setGState(new doc.GState({ opacity: 0.82 }))
doc.rect(0, 0, W, H, 'F')
doc.setGState(new doc.GState({ opacity: 1 }))
setFill(BLUE_DEEP)
doc.setGState(new doc.GState({ opacity: 0.55 }))
doc.rect(0, H * 0.62, W, H * 0.38, 'F')
doc.setGState(new doc.GState({ opacity: 1 }))
setFill(BLUE)
doc.rect(0, 0, W, 8, 'F')

drawLogoWithText(M, 70, { onDark: true })

setText('#D5DAE2')
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)
doc.text('BROCHURE CORPORATIVO', M, 140)
setDraw('#7A8296')
doc.setLineWidth(0.7)
doc.line(M, 146, M + 120, 146)

setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(42)
doc.text('Construyendo', M, 240)
doc.text('el futuro', M, 282)
setText('#D5DAE2')
doc.text('industrial', M, 324)

setText('#CDD2DB')
doc.setFont('helvetica', 'normal')
doc.setFontSize(13)
const subtitulo = 'Diseño y construcción de edificios industriales llave en mano,\ncon funcionalidad, eficiencia energética y diseño de vanguardia.'
doc.text(subtitulo, M, 370)

setFill('#FFFFFF')
doc.setGState(new doc.GState({ opacity: 0.14 }))
doc.roundedRect(M, H * 0.72, W - M * 2, 96, 6, 6, 'F')
doc.setGState(new doc.GState({ opacity: 1 }))
setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(9)
doc.text('PRESENCIA INTERNACIONAL', M + 20, H * 0.72 + 24)
doc.setFont('helvetica', 'normal')
doc.setFontSize(12)
doc.text('España  ·  Portugal  ·  Colombia  ·  Ecuador  ·  Perú', M + 20, H * 0.72 + 48)
setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(9)
doc.text('Más de 35 años · 500+ proyectos entregados · 2M+ m² construidos', M + 20, H * 0.72 + 70)

setText('#7F8798')
doc.setFont('helvetica', 'normal')
doc.setFontSize(8)
doc.text('nortonei.com  ·  norton@nortonei.com', M, H - 30)

// ═══════════════════════════════════════════════════════
// PÁGINA 2 — QUIÉNES SOMOS
// ═══════════════════════════════════════════════════════
doc.addPage()
pageHeaderBand('Quiénes somos')

setText(BLUE)
doc.setFont('helvetica', 'bold')
doc.setFontSize(10)
doc.text('NORTON EDIFICIOS INDUSTRIALES', M, 100)

setText(INK)
doc.setFontSize(28)
doc.text('Un aliado estratégico para', M, 138)
doc.text('la industria que construye futuro.', M, 170)

setText(INK)
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
const parrafo1 = [
  'Norton es una compañía especializada en el diseño, promoción y construcción de',
  'edificios industriales y logísticos. Operamos bajo modelos llave en mano, promoción',
  'delegada y open book, garantizando transparencia, control de costes y cumplimiento',
  'riguroso de plazos en cada proyecto que desarrollamos.',
]
parrafo1.forEach((l, i) => doc.text(l, M, 210 + i * 18))

const parrafo2 = [
  'A lo largo de más de tres décadas hemos construido referentes industriales en Europa',
  'y Latinoamérica, integrando eficiencia energética, sostenibilidad y certificaciones',
  'internacionales (BREEAM, LEED) en cada entrega.',
]
parrafo2.forEach((l, i) => doc.text(l, M, 310 + i * 18))

// Cifras clave
const yStats = 400
const cifras = [
  { n: '35+', l: 'AÑOS DE TRAYECTORIA' },
  { n: '5', l: 'PAÍSES' },
  { n: '500+', l: 'PROYECTOS ENTREGADOS' },
  { n: '2M+', l: 'METROS CUADRADOS' },
]
const colW = (W - M * 2 - 18 * 3) / 4
cifras.forEach((c, i) => {
  const x = M + i * (colW + 18)
  setFill(LIGHT)
  doc.roundedRect(x, yStats, colW, 92, 6, 6, 'F')
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.text(c.n, x + colW / 2, yStats + 42, { align: 'center' })
  setText(MUTED)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text(c.l, x + colW / 2, yStats + 68, { align: 'center' })
})

// Banda con imagen entre cifras y misión
const yImg = 510
doc.addImage(IMG_ABOUT, 'JPEG', M, yImg, W - M * 2, 60, undefined, 'FAST')
setFill(BLUE_DEEP)
doc.setGState(new doc.GState({ opacity: 0.35 }))
doc.rect(M, yImg, W - M * 2, 60, 'F')
doc.setGState(new doc.GState({ opacity: 1 }))
setText('#FFFFFF')
doc.setFont('helvetica', 'italic')
doc.setFontSize(11)
doc.text('"Convertimos visión industrial en infraestructura eficiente."', W / 2, yImg + 36, { align: 'center' })

// Misión / Visión
const yMV = 590
setFill('#FFFFFF')
setDraw(BORDER)
doc.setLineWidth(0.7)
doc.roundedRect(M, yMV, (W - M * 2 - 18) / 2, 150, 6, 6, 'FD')
doc.roundedRect(M + (W - M * 2 - 18) / 2 + 18, yMV, (W - M * 2 - 18) / 2, 150, 6, 6, 'FD')

setFill(BLUE)
doc.rect(M, yMV, 4, 32, 'F')
setText(BLUE)
doc.setFont('helvetica', 'bold')
doc.setFontSize(11)
doc.text('MISIÓN', M + 16, yMV + 22)
setText(INK)
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)
doc.text('Desarrollar edificios industriales que maximicen la', M + 16, yMV + 52)
doc.text('eficiencia operacional de nuestros clientes, con el más', M + 16, yMV + 68)
doc.text('alto estándar de calidad, seguridad y sostenibilidad.', M + 16, yMV + 84)

const x2 = M + (W - M * 2 - 18) / 2 + 18
setFill(BLUE)
doc.rect(x2, yMV, 4, 32, 'F')
setText(BLUE)
doc.setFont('helvetica', 'bold')
doc.setFontSize(11)
doc.text('VISIÓN', x2 + 16, yMV + 22)
setText(INK)
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)
doc.text('Ser el referente en construcción industrial del mercado', x2 + 16, yMV + 52)
doc.text('europeo y latinoamericano, liderando la transición hacia', x2 + 16, yMV + 68)
doc.text('proyectos más eficientes, sostenibles y transparentes.', x2 + 16, yMV + 84)

pageFooter(2, 5)

// ═══════════════════════════════════════════════════════
// PÁGINA 3 — SERVICIOS
// ═══════════════════════════════════════════════════════
doc.addPage()
pageHeaderBand('Nuestros servicios')

setText(BLUE)
doc.setFont('helvetica', 'bold')
doc.setFontSize(10)
doc.text('CAPACIDADES', M, 100)

setText(INK)
doc.setFontSize(28)
doc.text('Soluciones integrales', M, 138)
doc.text('para la industria.', M, 170)

setText(MUTED)
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('Acompañamos al cliente desde la concepción del proyecto hasta su puesta en operación,', M, 200)
doc.text('con modelos de contratación flexibles y un único interlocutor responsable.', M, 216)

const servicios = [
  { t: 'Proyectos Llave en Mano', d: 'Gestión integral del proyecto desde el diseño inicial hasta la entrega final operativa, con un único responsable y compromiso de plazo y presupuesto.' },
  { t: 'Promoción Delegada', d: 'Actuamos como promotor delegado gestionando el desarrollo completo, optimizando costes, plazos y riesgos técnicos y administrativos.' },
  { t: 'Modelo Open Book', d: 'Gestión transparente en la que compartimos con el cliente los costos reales del proyecto, garantizando máxima eficiencia y trazabilidad.' },
  { t: 'Estructuras y Envolventes', d: 'Diseño y ejecución de estructuras metálicas, cubiertas y cerramientos de alta calidad y durabilidad adaptados a cada tipología industrial.' },
  { t: 'Instalaciones Industriales', d: 'Instalaciones mecánicas, eléctricas, hidráulicas y especiales (cámaras frigoríficas, salas blancas) adaptadas a cada tipo de industria.' },
  { t: 'Certificaciones Sostenibles', d: 'Proyectos con certificación BREEAM y LEED para cumplir con los más altos estándares internacionales de sostenibilidad.' },
]

const yServ = 250
const cellW = (W - M * 2 - 14) / 2
const cellH = 108
servicios.forEach((s, i) => {
  const row = Math.floor(i / 2)
  const col = i % 2
  const x = M + col * (cellW + 14)
  const y = yServ + row * (cellH + 14)
  setFill('#FFFFFF')
  setDraw(BORDER)
  doc.setLineWidth(0.7)
  doc.roundedRect(x, y, cellW, cellH, 6, 6, 'FD')
  setFill(BLUE)
  doc.rect(x + 16, y + 16, 28, 3, 'F')
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(s.t, x + 16, y + 40)
  setText(INK)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const words = s.d.split(' ')
  const lines = []
  let cur = ''
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > 56) {
      lines.push(cur.trim())
      cur = w
    } else cur = cur + ' ' + w
  })
  if (cur.trim()) lines.push(cur.trim())
  lines.slice(0, 4).forEach((l, j) => doc.text(l, x + 16, y + 58 + j * 12))
})

pageFooter(3, 5)

// ═══════════════════════════════════════════════════════
// PÁGINA 4 — SECTORES & PROYECTOS
// ═══════════════════════════════════════════════════════
doc.addPage()
pageHeaderBand('Sectores y proyectos')

setText(BLUE)
doc.setFont('helvetica', 'bold')
doc.setFontSize(10)
doc.text('ESPECIALIZACIÓN SECTORIAL', M, 100)

setText(INK)
doc.setFontSize(24)
doc.text('Industrias exigentes,', M, 134)
doc.text('ejecución a la altura.', M, 162)

const sectores = [
  ['Logística y Cross Docking', 'Centros logísticos con diseño optimizado para eficiencia operacional.'],
  ['Logística de Frío', 'Instalaciones especializadas en cadena de frío con aislamiento de alta eficiencia.'],
  ['Pharma & Laboratorios', 'Espacios certificados para la industria farmacéutica y laboratorios.'],
  ['Automoción', 'Plantas productivas y centros logísticos para el sector automotriz.'],
  ['Edificación Industrial', 'Naves industriales a medida con soluciones integrales llave en mano.'],
  ['Retail & Gran Formato', 'Centros comerciales y espacios comerciales de gran superficie.'],
]

const ySect = 190
sectores.forEach((s, i) => {
  const row = Math.floor(i / 3)
  const col = i % 3
  const w3 = (W - M * 2 - 14 * 2) / 3
  const x = M + col * (w3 + 14)
  const y = ySect + row * 76
  setFill(LIGHT)
  doc.roundedRect(x, y, w3, 64, 5, 5, 'F')
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(s[0], x + 12, y + 20)
  setText(MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const words = s[1].split(' ')
  const lines = []
  let cur = ''
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > 36) {
      lines.push(cur.trim())
      cur = w
    } else cur = cur + ' ' + w
  })
  if (cur.trim()) lines.push(cur.trim())
  lines.slice(0, 3).forEach((l, j) => doc.text(l, x + 12, y + 36 + j * 11))
})

// Proyectos destacados
const yProy = 372
setText(BLUE)
doc.setFont('helvetica', 'bold')
doc.setFontSize(10)
doc.text('PROYECTOS DESTACADOS', M, yProy)

setText(INK)
doc.setFontSize(20)
doc.text('Construimos referentes.', M, yProy + 32)

const proyectos = [
  { n: 'COSTCO Torija', m: '38.007 m²', a: '2024', u: 'España', img: IMG_P1 },
  { n: 'Panattoni Illescas', m: '29.550 m²', a: '2023', u: 'España', img: IMG_P2 },
  { n: 'Crossbay Hospitalet', m: '8.900 m²', a: '2024', u: 'España', img: IMG_P3 },
  { n: 'Lidl AEP Oporto', m: '5.000 m²', a: '2022', u: 'Portugal', img: IMG_P4 },
]

const yPbox = yProy + 56
const pw = (W - M * 2 - 14 * 3) / 4
proyectos.forEach((p, i) => {
  const x = M + i * (pw + 14)
  doc.addImage(p.img, 'JPEG', x, yPbox, pw, 150, undefined, 'FAST')
  setFill('#000000')
  doc.setGState(new doc.GState({ opacity: 0.55 }))
  doc.rect(x, yPbox, pw, 150, 'F')
  doc.setGState(new doc.GState({ opacity: 1 }))
  setFill(BLUE)
  doc.rect(x, yPbox, pw, 3, 'F')
  setText('#D5DAE2')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text(p.a, x + pw - 12, yPbox + 18, { align: 'right' })
  doc.text(p.u.toUpperCase(), x + 12, yPbox + 90)
  setText('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  const nm = p.n.length > 18 ? p.n.substring(0, 18) + '…' : p.n
  doc.text(nm, x + 12, yPbox + 112)
  setText('#E1E5EB')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(p.m, x + 12, yPbox + 130)
})

pageFooter(4, 5)

// ═══════════════════════════════════════════════════════
// PÁGINA 5 — VALORES Y CONTACTO
// ═══════════════════════════════════════════════════════
doc.addPage()
pageHeaderBand('Valores y contacto')

setText(BLUE)
doc.setFont('helvetica', 'bold')
doc.setFontSize(10)
doc.text('NUESTROS VALORES', M, 100)

setText(INK)
doc.setFontSize(24)
doc.text('Seguridad, calidad y respeto', M, 134)
doc.text('al medioambiente.', M, 162)

setText(MUTED)
doc.setFont('helvetica', 'italic')
doc.setFontSize(11)
doc.text('"Basamos nuestra forma de construir en la seguridad, la calidad', M, 196)
doc.text('y el respeto al medioambiente."', M, 212)

const valores = [
  { t: 'Seguridad', d: 'Prioridad absoluta en cada fase del proyecto.' },
  { t: 'Sostenibilidad', d: 'Eficiencia energética y certificaciones BREEAM/LEED.' },
  { t: 'Transparencia', d: 'Modelo open book con comunicación clara al cliente.' },
  { t: 'Calidad', d: 'Estándares HSQE integrados en cada proceso.' },
]

const yV = 246
const vw = (W - M * 2 - 14 * 3) / 4
valores.forEach((v, i) => {
  const x = M + i * (vw + 14)
  setFill('#FFFFFF')
  setDraw(BORDER)
  doc.setLineWidth(0.7)
  doc.roundedRect(x, yV, vw, 98, 6, 6, 'FD')
  setFill(BLUE)
  doc.rect(x + 14, yV + 14, 24, 3, 'F')
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(v.t, x + 14, yV + 38)
  setText(INK)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const words = v.d.split(' ')
  const lines = []
  let cur = ''
  words.forEach(w => {
    if ((cur + ' ' + w).trim().length > 28) {
      lines.push(cur.trim())
      cur = w
    } else cur = cur + ' ' + w
  })
  if (cur.trim()) lines.push(cur.trim())
  lines.slice(0, 4).forEach((l, j) => doc.text(l, x + 14, yV + 56 + j * 11))
})

// Bloque CTA + contacto
const yCTA = 380
setFill(BLUE_DARK)
doc.roundedRect(M, yCTA, W - M * 2, 250, 8, 8, 'F')

setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(20)
doc.text('Conversemos sobre su próximo proyecto.', M + 24, yCTA + 40)

setText('#C6CBD5')
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)
doc.text('Cuéntenos su requerimiento y un consultor especializado le contactará en menos de 24 horas.', M + 24, yCTA + 62)

// Columnas contacto
const colX1 = M + 24
const colX2 = M + (W - M * 2) / 2 + 10
const yC = yCTA + 100

setText('#7F8798')
doc.setFont('helvetica', 'bold')
doc.setFontSize(8)
doc.text('CORREO', colX1, yC)
setText('#FFFFFF')
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('norton@nortonei.com', colX1, yC + 16)

setText('#7F8798')
doc.setFont('helvetica', 'bold')
doc.setFontSize(8)
doc.text('MADRID', colX1, yC + 44)
setText('#FFFFFF')
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('(+34) 91 447 28 08', colX1, yC + 60)

setText('#7F8798')
doc.setFont('helvetica', 'bold')
doc.setFontSize(8)
doc.text('BARCELONA', colX1, yC + 88)
setText('#FFFFFF')
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('(+34) 93 631 62 64', colX1, yC + 104)

setText('#7F8798')
doc.setFont('helvetica', 'bold')
doc.setFontSize(8)
doc.text('SITIO WEB', colX2, yC)
setText('#FFFFFF')
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('nortonei.com', colX2, yC + 16)

setText('#7F8798')
doc.setFont('helvetica', 'bold')
doc.setFontSize(8)
doc.text('SOLICITE INFORMACIÓN', colX2, yC + 44)
setText('#FFFFFF')
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('nortonlanding.vercel.app', colX2, yC + 60)

setText('#7F8798')
doc.setFont('helvetica', 'bold')
doc.setFontSize(8)
doc.text('PRESENCIA', colX2, yC + 88)
setText('#FFFFFF')
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)
doc.text('España · Portugal · Colombia · Ecuador · Perú', colX2, yC + 104)

pageFooter(5, 5)

// Guardar
const outPath = path.resolve('/Users/josepalomares/aplicaciones/nortonlanding/public/brochure-norton.pdf')
fs.writeFileSync(outPath, Buffer.from(doc.output('arraybuffer')))
console.log('PDF generado:', outPath)
console.log('Paginas:', doc.internal.pages.length - 1)
