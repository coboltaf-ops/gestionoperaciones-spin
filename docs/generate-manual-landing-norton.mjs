import jsPDFModule from 'jspdf'
import fs from 'fs'
import path from 'path'

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule

// ═══ Paleta Norton ═══
const BLUE = '#1E3A8A'
const RED = '#E30613'
const INK = '#1A1A1A'
const MUTED = '#64748B'
const LIGHT = '#F7F7F8'
const BORDER = '#E5E7EB'

const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
const W = doc.internal.pageSize.getWidth()
const H = doc.internal.pageSize.getHeight()
const M = 48
const CONTENT_W = W - M * 2

// Control de cursor vertical
let y = M + 60

// Helpers
function setFill(c) { doc.setFillColor(c) }
function setText(c) { doc.setTextColor(c) }
function setDraw(c) { doc.setDrawColor(c) }

function drawLogoMark(x, yy, size = 22, { onDark = false } = {}) {
  const s = size / 32
  setFill(onDark ? '#3B82F6' : BLUE)
  doc.triangle(x, yy + 24 * s, x + 14 * s, yy + 6 * s, x + 22 * s, yy + 16 * s, 'F')
  doc.triangle(x, yy + 24 * s, x + 22 * s, yy + 16 * s, x + 14 * s, yy + 24 * s, 'F')
  setFill(RED)
  doc.triangle(x + 22 * s, yy + 16 * s, x + 30 * s, yy + 6 * s, x + 46 * s, yy + 24 * s, 'F')
  doc.triangle(x + 22 * s, yy + 16 * s, x + 46 * s, yy + 24 * s, x + 30 * s, yy + 24 * s, 'F')
}

let pageNum = 1
const TOTAL_PAGES_PLACEHOLDER = 10 // se reemplaza al final
let pageHeaderRightText = ''

function renderHeaderBand() {
  setFill(BLUE)
  doc.rect(0, 0, W, 6, 'F')
  drawLogoMark(M, 22, 22)
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Norton', M + 38, 34)
  setText(MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('edificios industriales', M + 38, 44)
  setText('#000000')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(pageHeaderRightText, W - M, 36, { align: 'right' })
  setDraw(BORDER)
  doc.setLineWidth(0.5)
  doc.line(M, 58, W - M, 58)
}

function renderFooter() {
  setText(MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('MANUAL DE USO Y PROCEDIMIENTOS · LANDING NORTON · NORTON EDIFICIOS INDUSTRIALES', M, H - 24)
  doc.text(String(pageNum), W - M, H - 24, { align: 'right' })
}

function setPageHeader(title) { pageHeaderRightText = title }

function newPage(title) {
  doc.addPage()
  pageNum++
  if (title) setPageHeader(title)
  renderHeaderBand()
  renderFooter()
  y = 90
}

function ensure(spaceNeeded) {
  if (y + spaceNeeded > H - 60) newPage(pageHeaderRightText)
}

// Primitives
function sectionNumberTitle(num, title) {
  ensure(52)
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`SECCIÓN ${num}`, M, y)
  y += 6
  setFill(BLUE)
  doc.rect(M, y, 44, 2, 'F')
  y += 18
  setText(INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, M, y)
  y += 22
}

function subTitle(txt) {
  ensure(30)
  y += 6
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(txt, M, y)
  y += 16
}

function para(text, opts = {}) {
  const size = opts.size || 10
  const color = opts.color || INK
  const font = opts.bold ? 'bold' : 'normal'
  const maxChars = opts.maxChars || (size === 10 ? 92 : 85)
  setText(color)
  doc.setFont('helvetica', font)
  doc.setFontSize(size)
  const words = text.split(' ')
  let line = ''
  const lines = []
  words.forEach(w => {
    const candidate = (line + ' ' + w).trim()
    if (candidate.length > maxChars) {
      lines.push(line.trim())
      line = w
    } else {
      line = candidate
    }
  })
  if (line.trim()) lines.push(line.trim())
  lines.forEach(l => {
    ensure(size + 4)
    doc.text(l, M, y)
    y += size + 4
  })
  y += 4
}

function bullet(txt) {
  ensure(16)
  setFill(BLUE)
  doc.circle(M + 4, y - 3, 1.5, 'F')
  setText(INK)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const words = txt.split(' ')
  const maxChars = 86
  let line = ''
  const lines = []
  words.forEach(w => {
    const candidate = (line + ' ' + w).trim()
    if (candidate.length > maxChars) { lines.push(line.trim()); line = w } else line = candidate
  })
  if (line.trim()) lines.push(line.trim())
  lines.forEach((l, i) => {
    ensure(14)
    doc.text(l, M + 14, y)
    y += 14
  })
  y += 2
}

function noteBox(label, txt) {
  ensure(60)
  setFill(LIGHT)
  doc.roundedRect(M, y, CONTENT_W, 60, 4, 4, 'F')
  setFill(BLUE)
  doc.rect(M, y, 3, 60, 'F')
  setText(BLUE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(label.toUpperCase(), M + 14, y + 18)
  setText(INK)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  const words = txt.split(' ')
  const maxChars = 92
  let line = ''
  const lines = []
  words.forEach(w => {
    const candidate = (line + ' ' + w).trim()
    if (candidate.length > maxChars) { lines.push(line.trim()); line = w } else line = candidate
  })
  if (line.trim()) lines.push(line.trim())
  lines.slice(0, 2).forEach((l, i) => doc.text(l, M + 14, y + 36 + i * 12))
  y += 72
}

function fieldTable(rows) {
  ensure(30 + rows.length * 22)
  const colWidths = [110, 70, 290]
  // Header
  setFill(BLUE)
  doc.rect(M, y, CONTENT_W, 22, 'F')
  setText('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('CAMPO', M + 8, y + 15)
  doc.text('TIPO', M + 8 + colWidths[0], y + 15)
  doc.text('DESCRIPCIÓN / NORMA DE DILIGENCIAMIENTO', M + 8 + colWidths[0] + colWidths[1], y + 15)
  y += 22
  rows.forEach((r, i) => {
    const fillC = i % 2 === 0 ? '#FFFFFF' : LIGHT
    setFill(fillC)
    const rowH = 44
    ensure(rowH)
    doc.rect(M, y, CONTENT_W, rowH, 'F')
    setDraw(BORDER)
    doc.setLineWidth(0.3)
    doc.line(M, y + rowH, M + CONTENT_W, y + rowH)
    setText(INK)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(r[0], M + 8, y + 16)
    setText(r[1].includes('Obligatorio') ? RED : MUTED)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(r[1], M + 8 + colWidths[0], y + 16)
    setText(INK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    const words = r[2].split(' ')
    const maxChars = 60
    let line = ''
    const lines = []
    words.forEach(w => {
      const candidate = (line + ' ' + w).trim()
      if (candidate.length > maxChars) { lines.push(line.trim()); line = w } else line = candidate
    })
    if (line.trim()) lines.push(line.trim())
    lines.slice(0, 3).forEach((l, j) => doc.text(l, M + 8 + colWidths[0] + colWidths[1], y + 14 + j * 10))
    y += rowH
  })
  y += 10
}

function stepsBlock(steps) {
  steps.forEach((s, idx) => {
    ensure(58)
    setFill(BLUE)
    doc.circle(M + 14, y + 14, 14, 'F')
    setText('#FFFFFF')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(String(idx + 1), M + 14, y + 18, { align: 'center' })
    setText(BLUE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(s[0], M + 40, y + 12)
    setText(INK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    const words = s[1].split(' ')
    const maxChars = 82
    let line = ''
    const lines = []
    words.forEach(w => {
      const candidate = (line + ' ' + w).trim()
      if (candidate.length > maxChars) { lines.push(line.trim()); line = w } else line = candidate
    })
    if (line.trim()) lines.push(line.trim())
    lines.forEach((l, j) => doc.text(l, M + 40, y + 28 + j * 12))
    y += Math.max(50, 28 + lines.length * 12 + 10)
  })
  y += 6
}

// ═══════════════════════════════════════════════════════
// PÁGINA 1 — PORTADA
// ═══════════════════════════════════════════════════════
setFill(BLUE)
doc.rect(0, 0, W, H, 'F')
setFill('#122666')
doc.rect(0, H * 0.68, W, H * 0.32, 'F')

drawLogoMark(M, 70, 42)
setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(26)
doc.text('Norton', M + 72, 96)
setText('#C6CBD5')
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('edificios industriales', M + 72, 114)

setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(9)
doc.text('DOCUMENTO OFICIAL', M, 180)
setDraw('#FFFFFF')
doc.setLineWidth(0.7)
doc.line(M, 186, M + 120, 186)

setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(34)
doc.text('Manual de uso y', M, 256)
doc.text('procedimientos', M, 294)

setText('#D5DAE2')
doc.setFont('helvetica', 'normal')
doc.setFontSize(16)
doc.text('Landing de captación de prospectos y', M, 334)
doc.text('su integración con el CRM GTM.', M, 354)

setFill('#FFFFFF')
doc.setGState(new doc.GState({ opacity: 0.1 }))
doc.roundedRect(M, 410, CONTENT_W, 96, 6, 6, 'F')
doc.setGState(new doc.GState({ opacity: 1 }))

setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(9)
doc.text('ÁMBITO', M + 20, 432)
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('Landing Norton · Captación de solicitudes · Integración CRM GTM', M + 20, 452)
setText('#C6CBD5')
doc.setFontSize(9)
doc.text('Aplica a: equipos Comercial, Marketing y Tecnología de Norton y SISTECH.', M + 20, 472)

setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(9)
doc.text('URL PRODUCCIÓN', M, H * 0.76)
setDraw('#FFFFFF')
doc.setLineWidth(0.5)
doc.line(M, H * 0.76 + 6, M + 110, H * 0.76 + 6)
setText('#FFFFFF')
doc.setFont('helvetica', 'normal')
doc.setFontSize(14)
doc.text('https://nortonlanding.vercel.app', M, H * 0.76 + 30)

setText('#C6CBD5')
doc.setFont('helvetica', 'normal')
doc.setFontSize(8)
doc.text('Versión 1.0  ·  Documento elaborado por SISTECH  ·  Propiedad de NORTON Edificios Industriales', M, H - 40)

// Footer para portada
pageNum = 1

// ═══════════════════════════════════════════════════════
// PÁGINA 2 — SECCIÓN 1: OBJETIVOS Y ÁMBITO
// ═══════════════════════════════════════════════════════
newPage('Objetivos y ámbito')

sectionNumberTitle('1', 'Objetivos del sistema')

para('La Landing de Norton es la puerta de entrada digital a los servicios de NORTON Edificios Industriales. Su función primordial es captar solicitudes cualificadas de clientes potenciales y canalizarlas de forma automática hacia el CRM GTM, donde el equipo comercial inicia el proceso de atención.')

para('Este manual establece las normas, procedimientos y responsabilidades para el uso correcto de la Landing, desde la experiencia del visitante hasta la gestión interna del prospecto registrado.')

subTitle('1.1  Objetivo general')
para('Disponer de un canal digital profesional, confiable y trazable que permita presentar los servicios de Norton, recibir solicitudes de información y transformarlas en oportunidades comerciales gestionadas desde el CRM GTM.')

subTitle('1.2  Objetivos específicos')
bullet('Presentar de forma clara y homogénea la propuesta de valor, los sectores atendidos y los proyectos ejecutados por Norton en sus cinco mercados: España, Portugal, Colombia, Ecuador y Perú.')
bullet('Recoger de manera estructurada los datos mínimos necesarios para iniciar una relación comercial (identificación del contacto, empresa, ubicación y detalle del requerimiento).')
bullet('Registrar cada solicitud en el CRM GTM de forma automática, marcando el origen como "Landing Page" y la situación inicial como "Sin Contactar".')
bullet('Asegurar una respuesta inmediata al prospecto mediante un correo de bienvenida que incluye el brochure corporativo.')
bullet('Garantizar un tiempo de primer contacto comercial no superior a veinticuatro (24) horas desde la recepción de la solicitud.')

subTitle('1.3  Ámbito de aplicación')
para('Las disposiciones de este manual aplican a todas las personas y áreas que intervienen en el ciclo completo de la solicitud: el visitante que diligencia el formulario, el personal de Marketing responsable del contenido, el Departamento Comercial que atiende el prospecto y el equipo de Tecnología encargado de la operación y el mantenimiento del sistema.')

// ═══════════════════════════════════════════════════════
// PÁGINA 3 — SECCIÓN 2: ARQUITECTURA Y COMPONENTES
// ═══════════════════════════════════════════════════════
newPage('Arquitectura del sistema')

sectionNumberTitle('2', 'Arquitectura y componentes')

para('La solución está compuesta por tres elementos independientes que operan de manera coordinada mediante llamadas a servicios web seguros. Cada uno cumple un rol específico y puede mantenerse o evolucionar por separado sin afectar al conjunto.')

subTitle('2.1  Componentes')

// Tabla de componentes
const comps = [
  ['Landing Norton', 'Sitio público con la presentación de servicios y el formulario de solicitud. Bilingüe español/inglés.', 'https://nortonlanding.vercel.app'],
  ['CRM GTM', 'Sistema interno donde se almacena y gestiona el prospecto. Autenticación por usuario.', 'https://crmgtm.vercel.app'],
  ['Base de datos', 'Almacenamiento seguro de prospectos, catálogos y trazabilidad. Gestionado por Supabase.', 'Supabase PostgreSQL'],
]
ensure(30 + comps.length * 56)
setFill(BLUE)
doc.rect(M, y, CONTENT_W, 22, 'F')
setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(9)
doc.text('COMPONENTE', M + 8, y + 15)
doc.text('FUNCIÓN', M + 130, y + 15)
doc.text('URL / PLATAFORMA', M + 360, y + 15)
y += 22
comps.forEach((r, i) => {
  const fillC = i % 2 === 0 ? '#FFFFFF' : LIGHT
  setFill(fillC)
  doc.rect(M, y, CONTENT_W, 56, 'F')
  setDraw(BORDER)
  doc.setLineWidth(0.3)
  doc.line(M, y + 56, M + CONTENT_W, y + 56)
  setText(INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(r[0], M + 8, y + 20)
  setText(INK)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const w1 = r[1].split(' ')
  const maxC = 40
  let ln = ''
  const lns = []
  w1.forEach(w => { const c = (ln + ' ' + w).trim(); if (c.length > maxC) { lns.push(ln.trim()); ln = w } else ln = c })
  if (ln.trim()) lns.push(ln.trim())
  lns.slice(0, 4).forEach((l, j) => doc.text(l, M + 130, y + 16 + j * 10))
  setText(BLUE)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(r[2], M + 360, y + 20)
  y += 56
})
y += 10

subTitle('2.2  Flujo de datos')
para('Cuando un visitante envía el formulario, la Landing transmite los datos al CRM GTM mediante un canal cifrado y autenticado con un secreto compartido. El CRM valida, enriquece (resuelve país y ciudad contra sus catálogos) y registra el prospecto. Inmediatamente después, el sistema dispara un correo de bienvenida al solicitante con el brochure corporativo adjunto.')

noteBox('Norma de seguridad', 'Todas las comunicaciones entre la Landing y el CRM se realizan sobre HTTPS y se autentican mediante un token secreto compartido. Ningún dato sensible viaja expuesto.')

// ═══════════════════════════════════════════════════════
// PÁGINA 4 — SECCIÓN 3: FORMULARIO Y CAMPOS
// ═══════════════════════════════════════════════════════
newPage('Formulario de solicitud')

sectionNumberTitle('3', 'Descripción del formulario')

para('El formulario "Solicitar Información" es el único punto de captura de datos de la Landing. Se ubica en la sección "Contacto" del sitio y su diligenciamiento es el primer paso formal de la relación comercial.')

subTitle('3.1  Campos del formulario')

fieldTable([
  ['Nombre', 'Obligatorio', 'Nombre(s) del solicitante. Se utiliza en el saludo del correo de bienvenida y en la ficha del prospecto.'],
  ['Apellido', 'Obligatorio', 'Apellido(s) del solicitante. Junto con el nombre conforma la identificación personal.'],
  ['Empresa', 'Opcional', 'Razón social o nombre comercial de la organización a la que pertenece el solicitante. Se incluye en el saludo del correo cuando se diligencia.'],
  ['Correo', 'Obligatorio', 'Correo electrónico válido (debe contener "@"). A esta dirección se envía el correo de bienvenida con el brochure adjunto.'],
  ['Nro. Móvil', 'Opcional', 'Teléfono móvil de contacto, preferiblemente con prefijo internacional. Permite al comercial iniciar el primer contacto telefónico.'],
  ['País', 'Opcional', 'Selección del país desde una lista cerrada. Resuelve la región para priorización comercial.'],
  ['Ciudad', 'Opcional', 'Ciudad seleccionada en función del país elegido. Si el solicitante reside en una ciudad no catalogada, esta se crea automáticamente en el CRM.'],
  ['Detalle del Requerimiento', 'Obligatorio', 'Descripción libre de la necesidad del solicitante: tipo de edificación, metros cuadrados estimados, plazos, ubicación y cualquier información relevante.'],
])

// ═══════════════════════════════════════════════════════
// PÁGINA 5 — SECCIÓN 4: NORMAS DE DILIGENCIAMIENTO
// ═══════════════════════════════════════════════════════
newPage('Normas de diligenciamiento')

sectionNumberTitle('4', 'Normas para el usuario solicitante')

para('Las siguientes directrices buscan que el solicitante complete el formulario de forma correcta y que el equipo comercial reciba información suficiente para ofrecer una respuesta pertinente.')

subTitle('4.1  Antes de diligenciar')
bullet('Verifique que la URL del sitio corresponde exactamente a https://nortonlanding.vercel.app y que el navegador muestra el candado de conexión segura.')
bullet('Seleccione el idioma de su preferencia (Español / English) mediante los botones ES · EN ubicados en la parte superior derecha.')
bullet('Tenga a mano los datos básicos: nombre completo, empresa (si aplica), correo vigente y un resumen claro de su requerimiento.')

subTitle('4.2  Durante el diligenciamiento')
bullet('Todos los campos marcados con asterisco (*) son obligatorios. El sistema no permite el envío si alguno de ellos está vacío o es inválido.')
bullet('Seleccione primero el país; la lista de ciudades se activa y filtra automáticamente según el país elegido.')
bullet('Redacte el detalle del requerimiento con precisión: indique tipo de proyecto, dimensiones aproximadas, país y ciudad del proyecto, plazos previstos y cualquier condicionante técnico.')
bullet('Evite abreviaturas, mayúsculas sostenidas y expresiones ambiguas. Una redacción clara acelera la respuesta comercial.')

subTitle('4.3  Al enviar')
para('Tras pulsar "Enviar solicitud", el sistema presenta una confirmación visual ("Solicitud enviada"). A partir de ese momento el solicitante recibirá en su correo el mensaje de bienvenida con el brochure corporativo en PDF adjunto. Si no lo encuentra en bandeja de entrada, debe revisar la carpeta de correo no deseado.')

noteBox('Norma de privacidad', 'Al enviar el formulario el solicitante autoriza expresamente el tratamiento de sus datos personales para las finalidades de contacto comercial descritas en este manual y en las políticas de privacidad de NORTON Edificios Industriales.')

// ═══════════════════════════════════════════════════════
// PÁGINA 6 — SECCIÓN 5: FLUJO TÉCNICO
// ═══════════════════════════════════════════════════════
newPage('Flujo técnico al CRM')

sectionNumberTitle('5', 'Procedimiento técnico de registro en el CRM')

para('Este apartado documenta, paso a paso, la secuencia automática que se desencadena desde el envío del formulario hasta la disponibilidad del prospecto en el CRM GTM.')

stepsBlock([
  ['Validación en cliente', 'La Landing verifica en tiempo real que los campos obligatorios estén diligenciados y que el correo tenga un formato válido. Si alguna regla no se cumple, muestra un mensaje de error y detiene el envío.'],
  ['Envío seguro al servidor', 'La Landing envía los datos al endpoint /api/contacto mediante una petición HTTPS con cuerpo JSON. El servidor efectúa una segunda validación de seguridad.'],
  ['Reenvío autenticado al CRM', 'El servidor de la Landing reenvía los datos al CRM GTM al endpoint /api/public/prospectos, autenticado con un token secreto compartido (Bearer).'],
  ['Resolución de catálogos', 'El CRM resuelve el país por nombre contra su catálogo. La ciudad se busca dentro del país correspondiente y, si no existe, se crea automáticamente vinculada a dicho país.'],
  ['Asignación de origen y situación', 'El CRM marca el prospecto con origen "Landing Page" y situación "Sin Contactar". Estos dos valores son obligatorios y no pueden alterarse desde la Landing.'],
  ['Registro en la base de datos', 'El prospecto queda almacenado en la tabla "prospectos" del CRM con un identificador único (UUID) y marcas de tiempo de creación y actualización.'],
  ['Correo de bienvenida', 'El CRM envía un correo automático al solicitante con el saludo personalizado, el cuerpo del mensaje aprobado y el brochure corporativo PDF adjunto.'],
  ['Disponibilidad para el comercial', 'El prospecto aparece de inmediato en la vista de Prospectos del CRM GTM, listo para ser asignado y contactado.'],
])

// ═══════════════════════════════════════════════════════
// PÁGINA 7 — SECCIÓN 6: NORMAS DE OPERACIÓN INTERNA
// ═══════════════════════════════════════════════════════
newPage('Normas de operación interna')

sectionNumberTitle('6', 'Atención del prospecto en el CRM')

para('Una vez el prospecto ha ingresado al CRM GTM, su atención se rige por las siguientes normas, cuya observancia es responsabilidad del Departamento Comercial.')

subTitle('6.1  Tiempos de respuesta')
bullet('Primer contacto: dentro de las primeras veinticuatro (24) horas hábiles desde la recepción de la solicitud.')
bullet('Actualización de la situación del prospecto: inmediatamente después del primer contacto, registrando el resultado en el CRM.')
bullet('Seguimiento posterior: según la cadencia que defina el líder comercial, dejando evidencia en el CRM.')

subTitle('6.2  Actualización de la ficha')
para('Toda interacción con el prospecto debe quedar reflejada en el CRM. Se consideran interacciones registrables las llamadas, correos, reuniones presenciales o virtuales, propuestas enviadas y cualquier cambio en la situación comercial. El CRM es la única fuente oficial de información sobre el estado del prospecto.')

subTitle('6.3  Transiciones de situación')
fieldTable([
  ['Sin Contactar', 'Inicial', 'Estado asignado automáticamente al crearse el prospecto desde la Landing. No puede utilizarse para ningún otro origen.'],
  ['Contactado', 'Manual', 'El comercial confirma un primer contacto efectivo (llamada o correo respondido). Debe dejar la bitácora.'],
  ['En Propuesta', 'Manual', 'Se ha enviado una propuesta formal al prospecto y se está a la espera de su retroalimentación.'],
  ['Ganado / Perdido', 'Manual', 'Cierre de la oportunidad. Debe justificarse con evidencia en la ficha.'],
])

noteBox('Norma de trazabilidad', 'Ningún prospecto debe permanecer en estado "Sin Contactar" por más de veinticuatro (24) horas hábiles. El líder comercial es responsable de auditar semanalmente el cumplimiento de esta norma.')

// ═══════════════════════════════════════════════════════
// PÁGINA 8 — SECCIÓN 7: ESCALABILIDAD TAMOIN LATAM
// ═══════════════════════════════════════════════════════
newPage('Escalabilidad multi-landing')

sectionNumberTitle('7', 'Escalabilidad: Landing para Grupo Tamoin LATAM')

para('La arquitectura implementada permite extender el modelo a otras empresas del grupo sin duplicar sistemas. El mismo CRM GTM puede recibir prospectos desde múltiples landings, distinguiendo automáticamente su procedencia comercial.')

subTitle('7.1  Principio de funcionamiento')
para('Cada landing adicional se construye siguiendo el mismo patrón de la Landing Norton: presentación de la empresa, descripción de servicios y formulario de captación. Cada una envía los datos al CRM GTM identificándose con un valor propio en el campo "origen", lo que permite segmentar los prospectos por procedencia sin necesidad de bases de datos separadas.')

subTitle('7.2  Caso de aplicación: Grupo Tamoin LATAM')
para('La creación de una Landing para Grupo Tamoin LATAM se desarrollaría replicando la arquitectura actual, adaptando los siguientes elementos a la identidad de Tamoin: paleta de color, logo, textos de presentación, servicios, sectores atendidos y proyectos destacados.')

subTitle('7.3  Identificación del origen en el CRM')
para('El CRM GTM dispone de un catálogo de orígenes de prospecto. Los valores actuales incluyen, entre otros: "Landing Page" (Norton), "Referencia", "Visita del Comercial", "WhatsApp" y "Correo Recibido". Para una nueva landing se daría de alta un nuevo valor, por ejemplo "Landing Tamoin LATAM", y cada prospecto ingresado desde esa landing se etiquetaría con ese origen.')

subTitle('7.4  Beneficios del modelo')
bullet('Un único CRM centraliza todos los prospectos del grupo, facilitando la gestión comercial unificada.')
bullet('La segmentación por origen permite reportes claros sobre el rendimiento de cada landing y canal.')
bullet('La lógica técnica (validaciones, resolución de catálogos, correo de bienvenida, brochure adjunto) se reutiliza sin desarrollar nada desde cero.')
bullet('Nuevas landings pueden publicarse en pocas semanas y desplegarse con independencia.')

noteBox('Norma de escalabilidad', 'Toda nueva landing que se integre con el CRM GTM debe: (i) utilizar un token secreto propio, (ii) registrarse con un origen único en el catálogo "origen_prospecto" y (iii) documentarse mediante un manual equivalente a este.')

// ═══════════════════════════════════════════════════════
// PÁGINA 9 — SECCIÓN 8: RESPONSABILIDADES
// ═══════════════════════════════════════════════════════
newPage('Responsabilidades')

sectionNumberTitle('8', 'Roles y responsabilidades')

para('El correcto funcionamiento del sistema requiere la asignación clara de responsabilidades a tres áreas.')

subTitle('8.1  Departamento de Marketing')
bullet('Mantener actualizados los contenidos visibles de la Landing: servicios, sectores, proyectos destacados, imágenes y textos de presentación.')
bullet('Definir y aprobar la redacción del correo de bienvenida que reciben los solicitantes.')
bullet('Asegurar la vigencia del brochure corporativo disponible para descarga y anexado automático.')

subTitle('8.2  Departamento Comercial')
bullet('Atender cada prospecto dentro del tiempo establecido (máximo 24 horas hábiles para el primer contacto).')
bullet('Actualizar la situación y registrar la bitácora de cada interacción en el CRM GTM.')
bullet('Velar por que ningún prospecto permanezca en "Sin Contactar" más allá del límite establecido.')

subTitle('8.3  Departamento de Tecnología (SISTECH)')
bullet('Operar, mantener y monitorizar la infraestructura (Landing, CRM y base de datos).')
bullet('Custodiar los secretos de autenticación entre la Landing y el CRM, y rotarlos cuando sea necesario.')
bullet('Aplicar parches de seguridad, verificar el envío de correos y la integridad del flujo de registro.')
bullet('Documentar y versionar cualquier cambio técnico en la solución.')

// ═══════════════════════════════════════════════════════
// PÁGINA 10 — SECCIÓN 9: ANEXO TÉCNICO
// ═══════════════════════════════════════════════════════
newPage('Anexo técnico')

sectionNumberTitle('9', 'Anexo técnico')

subTitle('9.1  Direcciones y recursos')
fieldTable([
  ['Landing (Producción)', 'Público', 'https://nortonlanding.vercel.app'],
  ['Brochure PDF', 'Público', 'https://nortonlanding.vercel.app/brochure-norton.pdf'],
  ['CRM GTM', 'Privado', 'https://crmgtm.vercel.app'],
  ['Endpoint captura', 'Interno', '/api/contacto (en la Landing)'],
  ['Endpoint intake CRM', 'Interno', '/api/public/prospectos (en el CRM)'],
])

subTitle('9.2  Variables de entorno requeridas')
fieldTable([
  ['CRMGTM_URL', 'Landing', 'URL base del CRM GTM hacia el que se reenvían las solicitudes.'],
  ['CRMGTM_SECRET', 'Landing', 'Token secreto compartido con el CRM para autenticar el reenvío.'],
  ['EXTERNAL_LEAD_SECRET', 'CRM', 'Token secreto que valida las peticiones entrantes desde cualquier landing.'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'CRM', 'Clave de servicio de Supabase que permite al endpoint público insertar el prospecto.'],
  ['RESEND_API_KEY', 'CRM', 'Clave de Resend utilizada para enviar el correo de bienvenida con el brochure adjunto.'],
])

subTitle('9.3  Catálogos afectados en el CRM')
bullet('origen_prospecto: contiene el valor "Landing Page" asignado automáticamente a cada solicitud recibida desde la Landing Norton.')
bullet('situacion_prospecto: contiene el valor "Sin Contactar" asignado como estado inicial a todo prospecto ingresado por la Landing.')
bullet('pais: catálogo de países maestro del CRM. La Landing envía el nombre del país y el CRM lo resuelve por coincidencia.')
bullet('ciudad: catálogo de ciudades vinculado a país. Si la ciudad no existe, se crea automáticamente asociada al país correspondiente.')

subTitle('9.4  Control de versiones del manual')
fieldTable([
  ['1.0', 'Inicial', 'Versión inicial del manual de uso y procedimientos del sistema Landing Norton - CRM GTM.'],
])

// Cierre con bloque final
ensure(80)
y += 10
setFill(BLUE)
doc.roundedRect(M, y, CONTENT_W, 60, 6, 6, 'F')
setText('#FFFFFF')
doc.setFont('helvetica', 'bold')
doc.setFontSize(11)
doc.text('Para consultas sobre el contenido de este manual:', M + 16, y + 22)
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)
doc.text('Departamento Comercial NORTON  ·  norton@nortonei.com', M + 16, y + 40)
doc.text('Departamento de Tecnología SISTECH', M + 16, y + 52)

// Guardar
const outPath = path.resolve('/Users/josepalomares/aplicaciones/nortonlanding/public/manual-landing-norton.pdf')
fs.writeFileSync(outPath, Buffer.from(doc.output('arraybuffer')))
console.log('PDF generado:', outPath)
console.log('Paginas:', doc.internal.pages.length - 1)
