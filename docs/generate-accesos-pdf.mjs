import jsPDFModule from 'jspdf'
import fs from 'fs'

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
const RED = [220, 38, 38]
const AMBER = [217, 119, 6]
const WHITE = [255, 255, 255]

function addPage() { doc.addPage(); pageNum++; y = M }
function checkPage(need = 20) { if (y + need > H - 20) addPage() }

function footer() {
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('SISTECH — Accesos y Flujo de Alta de Clientes', W / 2, H - 8, { align: 'center' })
  doc.text(`Pag ${pageNum}`, W - M, H - 8, { align: 'right' })
}

function sectionTitle(text) {
  checkPage(16)
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F')
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(text, M + 5, y + 7)
  y += 14
}

function subTitle(text) {
  checkPage(12)
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...LIGHT_BLUE)
  doc.text(text, M, y); y += 6
}

function para(text) {
  checkPage(10)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  doc.splitTextToSize(text, W - M * 2).forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.5 })
  y += 2
}

function paraBold(text) {
  checkPage(10)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.splitTextToSize(text, W - M * 2).forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.5 })
  y += 1
}

function paraRed(text) {
  checkPage(10)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RED)
  doc.splitTextToSize(text, W - M * 2).forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.5 })
  y += 1
}

function bulletList(items) {
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  items.forEach(item => {
    checkPage(8)
    doc.text('•', M + 2, y)
    doc.splitTextToSize(item, W - M * 2 - 8).forEach((line, i) => {
      checkPage(5); doc.text(line, M + 7, y); if (i < line.length - 1) y += 4.5
      y += 4.5
    })
    y += 1
  })
  y += 1
}

function formTable(rows) {
  const labelW = 55
  doc.setFontSize(8.5)
  rows.forEach((r, i) => {
    checkPage(7)
    if (i % 2 === 0) { doc.setFillColor(...BG_LIGHT); doc.rect(M, y - 1, W - M * 2, 6, 'F') }
    doc.setFillColor(...LIGHT_BLUE); doc.rect(M, y - 1, 1.5, 6, 'F')
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE); doc.text(r[0], M + 4, y + 3)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK); doc.text(r[1], M + labelW, y + 3)
    y += 6
  })
  y += 3
}

function detailTable(headers, rows, colWidths) {
  const totalW = W - M * 2
  doc.setFontSize(7.5)
  checkPage(8)
  doc.setFillColor(...BLUE); doc.rect(M, y, totalW, 6, 'F')
  doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold')
  let xPos = M
  headers.forEach((h, i) => { doc.text(h, xPos + 2, y + 4); xPos += colWidths[i] })
  y += 6
  doc.setFont('helvetica', 'normal')
  rows.forEach((row, ri) => {
    checkPage(7)
    if (ri % 2 === 0) { doc.setFillColor(...BG_LIGHT); doc.rect(M, y, totalW, 6, 'F') }
    xPos = M
    row.forEach((cell, ci) => {
      const text = String(cell)
      const looksLikeUrl = /\.(vercel\.app|com|co|net|org|io|sistech\.com)(\/|$)/.test(text)
      if (looksLikeUrl) {
        const url = text.startsWith('http') ? text : `https://${text}`
        doc.setTextColor(37, 99, 235)
        doc.textWithLink(text, xPos + 2, y + 4, { url })
      } else {
        doc.setTextColor(...DARK)
        doc.text(text, xPos + 2, y + 4)
      }
      xPos += colWidths[ci]
    })
    y += 6
  })
  y += 4
}

function stepBox(num, title, desc) {
  checkPage(20)
  // Step number circle
  doc.setFillColor(...BLUE)
  doc.circle(M + 5, y + 2, 5, 'F')
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(String(num), M + 5, y + 3.5, { align: 'center' })
  // Title
  doc.setFontSize(11); doc.setTextColor(...BLUE)
  doc.text(title, M + 14, y + 3.5)
  y += 8
  // Left border
  doc.setFillColor(...LIGHT_BLUE); doc.rect(M, y, 1.5, 2, 'F')
  // Description
  if (desc) { para(desc) }
}

function infoBox(text, borderColor = LIGHT_BLUE) {
  checkPage(16)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const boxH = lines.length * 4.5 + 8
  doc.setFillColor(239, 246, 255); doc.setDrawColor(...borderColor); doc.setLineWidth(0.8)
  doc.roundedRect(M, y - 2, W - M * 2, boxH, 2, 2, 'FD')
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  lines.forEach(line => {
    const urlMatch = line.match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      const url = urlMatch[0]
      const beforeUrl = line.substring(0, urlMatch.index)
      doc.setTextColor(...DARK)
      doc.text(beforeUrl, M + 6, y + 3)
      const urlX = M + 6 + doc.getTextWidth(beforeUrl)
      doc.setTextColor(37, 99, 235)
      doc.textWithLink(url, urlX, y + 3, { url })
      doc.setTextColor(...DARK)
    } else {
      doc.text(line, M + 6, y + 3)
    }
    y += 4.5
  })
  y += 6
}

function alertBox(text) {
  checkPage(16)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const boxH = lines.length * 4.5 + 8
  doc.setFillColor(254, 242, 242); doc.setDrawColor(...RED); doc.setLineWidth(0.8)
  doc.roundedRect(M, y - 2, W - M * 2, boxH, 2, 2, 'FD')
  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RED)
  lines.forEach(line => { doc.text(line, M + 6, y + 3); y += 4.5 })
  y += 6
}

function badge(text, color) {
  const bw = doc.getTextWidth(text) * 1.3 + 10
  doc.setFillColor(...color); doc.roundedRect(M, y, bw, 5.5, 2, 2, 'F')
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(text, M + 4, y + 4); y += 9
}

// ══════════════════════════════════════════════════════
// PORTADA
// ══════════════════════════════════════════════════════
doc.setFillColor(...BLUE); doc.rect(0, 0, W, H, 'F')

doc.setTextColor(...WHITE); doc.setFontSize(36); doc.setFont('helvetica', 'bold')
doc.text('SISTECH', W / 2, 80, { align: 'center' })

doc.setFontSize(14); doc.setFont('helvetica', 'normal'); doc.setTextColor(147, 197, 253)
doc.text('Sistemas Inteligentes de Tecnologia', W / 2, 92, { align: 'center' })

doc.setDrawColor(59, 130, 246); doc.setLineWidth(1.5)
doc.line(W / 2 - 35, 100, W / 2 + 35, 100)

doc.setFontSize(18); doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold')
doc.text('Documento de Accesos', W / 2, 115, { align: 'center' })
doc.text('y Flujo de Alta de Clientes', W / 2, 125, { align: 'center' })

// Badge confidencial - fondo negro profundo
doc.setFillColor(0, 0, 0); doc.setDrawColor(255, 255, 255)
doc.roundedRect(W / 2 - 55, 143, 110, 28, 4, 4, 'FD')
doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
doc.text('DOCUMENTO CONFIDENCIAL', W / 2, 155, { align: 'center' })
doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 255, 255)
doc.text('Solo para uso interno del administrador', W / 2, 163, { align: 'center' })

doc.setFontSize(10); doc.setTextColor(147, 197, 253)
doc.text('Generado: 18 de Abril de 2026 (Actualizado)', W / 2, 195, { align: 'center' })

// ══════════════════════════════════════════════════════
// PARTE 1: ACCESOS
// ══════════════════════════════════════════════════════
addPage()

alertBox('DOCUMENTO CONFIDENCIAL - ACCESOS A SISTEMAS. Guarde este documento en un lugar seguro.')

y += 2
sectionTitle('PARTE 1: ACCESOS A SISTEMAS EN VERCEL')

// App 1
subTitle('1. GESTION DE INVENTARIO')
para('Sistema de gestion de inventario con control de productos, proveedores, ordenes de compra, bodegas, transferencias, centros de costo, tareas con Kanban y asistente de voz.')
infoBox('URL Vercel: https://gestioninventario-two.vercel.app\nURL Local: http://localhost:3003')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [
    ['jarango', 'admin123', 'ADMIN - Acceso total'],
    ['contable00', 'Contable00*', 'Contabilidad y Administracion'],
  ],
  [45, 45, W - M * 2 - 90]
)

// App 2
subTitle('2. GESTION INVENTARIO ROPA Y CALZADO')
para('Sistema de inventario especializado en ropa y calzado con variantes por color/talla, costo promedio ponderado, monto de existencia, POS pantalla completa, busqueda de existencias, clientes, PQRS y asistente de voz.')
infoBox('URL Vercel: https://calzadoropa.vercel.app')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [
    ['gloria', 'gloria0305*', 'ADMIN - Acceso total'],
  ],
  [45, 45, W - M * 2 - 90]
)

// App 3
subTitle('3. CRM GTM (Go To Market)')
para('CRM completo con gestion de clientes, contactos, empresas, oportunidades, proyectos, tareas, tickets y correos. Autenticacion via Supabase Auth con registro publico y recuperacion de clave.')
infoBox('URL Sistema (login): https://crmgtm.vercel.app/login\nURL Landing Comercial: https://nortonlanding.vercel.app\nURL Local: http://localhost:3001')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [
    ['administrador', 'Admin01*', 'ADMIN'],
    ['jpalomares', 'Admin02*', 'ADMIN'],
    ['comercial01', 'Comercial01*', 'Comercial'],
  ],
  [45, 45, W - M * 2 - 90]
)
para('Paginas publicas (sin login):')
detailTable(
  ['Tipo', 'URL'],
  [
    ['Landing Comercial', 'https://nortonlanding.vercel.app'],
    ['Registro de Usuarios (Sign Up)', 'https://crmgtm.vercel.app/signup'],
    ['Recuperacion de Clave', 'https://crmgtm.vercel.app/forgot-password'],
  ],
  [60, W - M * 2 - 60]
)
para('Nota: Autenticacion via Supabase Auth (tabla usuarios_sistema)')

// App 4
subTitle('4. CRM COMERCIAL')
para('CRM comercial con gestion de clientes, contactos, prospectos, oportunidades, cotizaciones, productos, PQRS, correos y modulos configurables.')
infoBox('URL Vercel: https://crmcomercial.vercel.app')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [['admin', 'admin123', 'ADMIN - Acceso total']],
  [45, 45, W - M * 2 - 90]
)
para('Formularios Publicos (sin login):')
bulletList([
  'Registro de Prospectos: https://crmcomercial.vercel.app/prospectos-publico',
  'PQRS (Quejas y Reclamos): https://crmcomercial.vercel.app/pqrs-publico (requiere codigo de acceso ACC-XXXXXX)',
])

// App 5 - CRM NOVA SEGURIDAD
subTitle('5. CRM NOVA SEGURIDAD')
para('CRM especializado para empresas de seguridad. Gestion de clientes, contactos, prospectos, oportunidades, cotizaciones, contratos, lineas de servicio, productos, tareas, correos, PQRS, diseñador de correos, email marketing y flujos automatizados.')
infoBox('URL Vercel: https://crmnovaseguridad.vercel.app')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [['admin', 'admin123', 'ADMIN - Acceso total']],
  [45, 45, W - M * 2 - 90]
)
para('Formularios Publicos (sin login):')
bulletList([
  'Registro de Prospectos: https://crmnovaseguridad.vercel.app/prospectos-publico',
  'PQRS (Quejas y Reclamos): https://crmnovaseguridad.vercel.app/pqrs-publico',
])

// App 6 - PORTAL INMOBILIARIO
checkPage(40)
subTitle('6. PORTAL INMOBILIARIO')
para('Portal de gestion de propiedades con catalogo publico, comerciales, cotizaciones, contratos, solicitudes y correos. Autenticacion via Supabase.')
infoBox('URL Vercel: https://portalinmobiliario.vercel.app')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [['admin', 'admin', 'ADMIN']],
  [45, 45, W - M * 2 - 90]
)
para('Paginas Publicas (sin login):')
bulletList([
  'Pagina de Inicio: https://portalinmobiliario.vercel.app/inicio',
  'Catalogo de Propiedades: https://portalinmobiliario.vercel.app/catalogo',
  'Detalle de Propiedad: https://portalinmobiliario.vercel.app/propiedad/[id]',
])

// App 7 - HOMEUX
subTitle('7. HOMEUX - Servicios del Hogar')
para('Sistema de gestion de servicios para el hogar (plomeria, electricidad, pintura, limpieza) con clientes, personal, cotizaciones y solicitudes.')
infoBox('URL Vercel: https://homeux-pearl.vercel.app')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [
    ['admin', 'admin', 'ADMIN'],
    ['jpalomares', '1234', 'ADMIN'],
    ['mgarcia', '1234', 'Operador'],
  ],
  [45, 45, W - M * 2 - 90]
)

// App 8 - LANDING CONSULTOR PALOMARES
checkPage(30)
subTitle('8. CONSULTOR PALOMARES (Landing)')
para('Landing personal de Jose Enrique Palomares Tafur. Sitio publico con presentacion del consultor, servicios, catalogo de sistemas propios, capacitaciones y formulario de contacto.')
infoBox('URL Vercel: https://consultorpalomares.vercel.app')
para('Sin login. Landing publica accesible para cualquier visitante.')

// App 9 - LANDING ALFREDO STERLING
checkPage(30)
subTitle('9. ALFREDO STERLING - APRENDER LIDERAZGO (Landing)')
para('Landing publica de Alfredo Sterling. Sitio para promocionar contenidos, cursos y experiencia en liderazgo, comunicacion y formacion ejecutiva.')
infoBox('URL Vercel: https://aprenderliderazgo.vercel.app')
para('Sin login. Landing publica accesible para cualquier visitante.')

// App 10 - POSTRES EXQUISITOS
checkPage(30)
subTitle('10. POSTRES EXQUISITOS')
para('Sitio e-commerce de postres artesanales. Catalogo de productos por categoria (tortas, cheesecakes, brownies, flanes, galletas, especiales), carrito de compras y pedidos exclusivamente por WhatsApp. Sin base de datos, sitio 100% publico.')
infoBox('URL Vercel: https://postresexquisitos.vercel.app')
para('Sin login. Sitio publico. Pedidos por WhatsApp (+57 300 123 4567).')

// App 11 - CRM SPIN
checkPage(45)
subTitle('11. CRM SPIN (Silicatos para la Industria)')
para('CRM especializado para la industria de silicatos. Gestion de clientes con datos DIAN completos, contactos, prospectos, oportunidades, cotizaciones, productos con formulas de precio (Normal/Especial), PQRS con codigo de acceso, tareas, correos, diseñador de correos, email marketing y flujos automatizados. Vista 360 del cliente con tabs para ver Contactos, Cotizaciones, Oportunidades y Tickets asociados.')
infoBox('URL Vercel: https://crmspin.vercel.app')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [['admin', 'admin123', 'ADMIN - Acceso total']],
  [45, 45, W - M * 2 - 90]
)
para('Formularios Publicos (sin login):')
bulletList([
  'Registro de Prospectos: https://crmspin.vercel.app/prospectos-publico',
  'PQRS (Quejas y Reclamos): https://crmspin.vercel.app/pqrs-publico (requiere codigo de acceso ACC-XXXXXX del cliente)',
])

// App 12 - GESTION CONTABLE
checkPage(45)
subTitle('12. GESTION CONTABLE')
para('Sistema de contabilidad y gestion financiera completo. Incluye: Catalogo de cuentas jerarquico, comprobantes (Ingreso, Egreso, Diario, Nomina, Ajuste), libro diario, libro mayor, balance de comprobacion, balance general y estado de resultados. Modulos operativos en desarrollo: Terceros, Cuentas por Cobrar con antiguedad de saldos, Cuentas por Pagar con programacion de pagos, Control Bancario con conciliacion, Activos Fijos con depreciacion mensual automatica. Dashboard con KPIs financieros en pesos colombianos (COP).')
infoBox('URL Vercel: https://gestioncontable-pearl.vercel.app')
detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [
    ['admin', 'admin123', 'ADMIN — Acceso total'],
    ['contador', 'contador123', 'Contador General'],
  ],
  [40, 40, W - M * 2 - 80]
)

// Resumen
checkPage(45)
subTitle('RESUMEN RAPIDO DE LINKS')
detailTable(
  ['App', 'URL', 'Estado'],
  [
    ['Gestion Inventario', 'gestioninventario-two.vercel.app', 'Activo'],
    ['Ropa y Calzado', 'calzadoropa.vercel.app', 'Activo'],
    ['CRM GTM (sistema)', 'https://crmgtm.vercel.app/login', 'Activo'],
    ['CRM Comercial', 'crmcomercial.vercel.app', 'Activo'],
    ['CRM Nova Seguridad', 'crmnovaseguridad.vercel.app', 'Activo'],
    ['CRM SPIN', 'crmspin.vercel.app', 'Activo'],
    ['Portal Inmobiliario', 'portalinmobiliario.vercel.app', 'Activo'],
    ['HomeUX', 'homeux-pearl.vercel.app', 'Activo'],
    ['Consultor Palomares (Landing)', 'consultorpalomares.vercel.app', 'Activo'],
    ['Alfredo Sterling (Landing)', 'aprenderliderazgo.vercel.app', 'Activo'],
    ['Postres Exquisitos', 'postresexquisitos.vercel.app', 'Activo'],
    ['Gestion Contable', 'gestioncontable-pearl.vercel.app', 'Activo'],
  ],
  [55, W - M * 2 - 75, 20]
)

// ══════════════════════════════════════════════════════
// FORMULARIOS PUBLICOS - RESUMEN
// ══════════════════════════════════════════════════════
checkPage(45)
subTitle('FORMULARIOS Y PAGINAS PUBLICAS (sin login)')
para('Estos enlaces se pueden compartir con clientes finales, prospectos o publicar en redes sociales. No requieren autenticacion.')
detailTable(
  ['Tipo', 'Sistema', 'URL Publica'],
  [
    ['Landing Comercial', 'CRM GTM', 'nortonlanding.vercel.app'],
    ['Sign Up', 'CRM GTM', 'crmgtm.vercel.app/signup'],
    ['Forgot Password', 'CRM GTM', 'crmgtm.vercel.app/forgot-password'],
    ['Prospectos', 'CRM Comercial', 'crmcomercial.vercel.app/prospectos-publico'],
    ['PQRS', 'CRM Comercial', 'crmcomercial.vercel.app/pqrs-publico'],
    ['Prospectos', 'CRM Nova Seguridad', 'crmnovaseguridad.vercel.app/prospectos-publico'],
    ['PQRS', 'CRM Nova Seguridad', 'crmnovaseguridad.vercel.app/pqrs-publico'],
    ['Prospectos', 'CRM SPIN', 'crmspin.vercel.app/prospectos-publico'],
    ['PQRS', 'CRM SPIN', 'crmspin.vercel.app/pqrs-publico'],
    ['Inicio', 'Portal Inmobiliario', 'portalinmobiliario.vercel.app/inicio'],
    ['Catalogo Inmuebles', 'Portal Inmobiliario', 'portalinmobiliario.vercel.app/catalogo'],
    ['Landing', 'Consultor Palomares', 'consultorpalomares.vercel.app'],
    ['Landing', 'Alfredo Sterling', 'aprenderliderazgo.vercel.app'],
    ['E-commerce', 'Postres Exquisitos', 'postresexquisitos.vercel.app'],
  ],
  [30, 50, W - M * 2 - 80]
)

// ══════════════════════════════════════════════════════
// PARTE 2: FLUJO DE ALTA
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('PARTE 2: FLUJO DE ALTA DE NUEVO CLIENTE')

para('Este flujo describe el proceso paso a paso para instalar un sistema nuevo para un cliente usando la plataforma SISTECH.')

y += 2
infoBox('Nomenclatura de Subdominios: [sistema] + [cliente] + [pais] + .sistech.com — Ejemplos: crmgtmcol.sistech.com | invborinquen.sistech.com')

// ══════════════════════════════════════════════════════
// DOS VIAS DE ALTA
// ══════════════════════════════════════════════════════
y += 4
subTitle('DOS VIAS DE ALTA DEL CLIENTE')
para('Existen dos modelos para entregar el sistema al cliente. La eleccion depende de quien asume el costo y la responsabilidad de hosting/dominio.')

y += 2
paraBold('VIA 1 — El cliente pone hosting y dominio')
infoBox('El cliente paga y administra su infraestructura. Nosotros desplegamos el sistema en el entorno que el cliente provee.')
bulletList([
  'Cliente compra dominio propio (ej: gtmgrupo.com) y nos da acceso al DNS',
  'Cliente contrata su Vercel Pro / Netlify / VPS / hosting',
  'Cliente provee credenciales de Supabase (o le ayudamos a crear su proyecto)',
  'Nosotros hacemos el deploy del sistema en SU infraestructura',
  'Configuramos las variables de entorno (SMTP, API keys) en SU cuenta',
  'Personalizamos logo, colores, datos de empresa',
  'Creamos los usuarios iniciales',
  'Entregamos accesos y soporte tecnico',
])
paraBold('Ventajas Via 1:')
bulletList([
  'Cliente es dueno completo de su infraestructura y datos',
  'Costos directos del cliente (no intermediario)',
  'Cliente puede migrar a otro proveedor sin depender de SISTECH',
  'Ideal para empresas grandes con politicas de TI propias',
])
paraBold('Costos para el cliente:')
detailTable(
  ['Concepto', 'Costo aprox', 'Frecuencia'],
  [
    ['Dominio propio', '$12-20 USD', 'Anual'],
    ['Vercel Pro o equivalente', '$20 USD', 'Mensual'],
    ['Supabase Pro', '$25 USD', 'Mensual'],
    ['SMTP (Gmail/SendGrid/SES)', 'Gratis-$15', 'Mensual'],
    ['Honorarios SISTECH (setup unico)', 'Cotizar', 'Una vez'],
    ['Soporte/mantenimiento mensual', 'Cotizar', 'Mensual'],
  ],
  [55, 35, W - M * 2 - 90]
)

y += 2
paraBold('VIA 2 — Nosotros ponemos todo (modelo SaaS)')
infoBox('SISTECH provee dominio, hosting, base de datos, correo y mantenimiento. El cliente solo paga una mensualidad y usa el sistema.')
bulletList([
  'SISTECH crea un subdominio bajo sistech.com (ej: crmgtmcol.sistech.com)',
  'SISTECH despliega el sistema en su Vercel Pro (proyectos ilimitados)',
  'SISTECH crea la base de datos en su Supabase',
  'SISTECH configura el SMTP (con cuenta del cliente o Gmail dedicado)',
  'SISTECH personaliza logo, colores y datos del cliente',
  'Cliente solo recibe URL + usuario + clave y comienza a usar',
  'Mantenimiento, actualizaciones, backups y soporte incluidos',
])
paraBold('Ventajas Via 2:')
bulletList([
  'Cliente arranca sin inversion en infraestructura',
  'Cero conocimiento tecnico requerido del lado del cliente',
  'Actualizaciones automaticas (todos los clientes reciben mejoras)',
  'Backups y monitoreo gestionados por SISTECH',
  'Ideal para PYMES y emprendimientos',
])
paraBold('Costos para el cliente:')
detailTable(
  ['Concepto', 'Costo', 'Frecuencia'],
  [
    ['Setup inicial (configuracion + capacitacion)', 'Cotizar', 'Una vez'],
    ['Mensualidad SaaS (incluye todo)', 'Cotizar', 'Mensual'],
    ['Modulos extra / customizaciones', 'Cotizar', 'Bajo demanda'],
  ],
  [85, 35, W - M * 2 - 120]
)
paraBold('Costos internos para SISTECH (absorbidos en la mensualidad):')
bulletList([
  'Dominio sistech.com: ~$12 USD/ano (compartido con todos los clientes)',
  'Vercel Pro: $20 USD/mes (proyectos ilimitados)',
  'Supabase: gratis hasta 500MB por proyecto, despues $25/mes/proyecto',
  'Tiempo de soporte y mantenimiento',
])

y += 2
subTitle('Comparativa Rapida')
detailTable(
  ['Aspecto', 'Via 1 (Cliente)', 'Via 2 (SISTECH)'],
  [
    ['Quien paga el dominio', 'Cliente', 'SISTECH (subdominio)'],
    ['Quien paga el hosting', 'Cliente', 'SISTECH'],
    ['Quien paga la BD', 'Cliente', 'SISTECH'],
    ['Conocimiento tecnico cliente', 'Medio-Alto', 'Cero'],
    ['Tiempo de setup', '3-5 dias', '1-2 dias'],
    ['Independencia del cliente', 'Total', 'Limitada'],
    ['Modelo de cobro', 'Setup + soporte', 'Mensualidad SaaS'],
  ],
  [60, 50, W - M * 2 - 110]
)

// PASO 1
y += 3
stepBox(1, 'DOMINIO Y SUBDOMINIO', 'Definir la URL del cliente.')
formTable([
  ['Dominio principal:', 'sistech.com'],
  ['Subdominio del cliente:', 'crmgtmcol'],
  ['URL resultante:', 'crmgtmcol.sistech.com'],
])

// PASO 2
stepBox(2, 'DATOS DE LA EMPRESA', 'Informacion del cliente para personalizar el sistema.')
formTable([
  ['Nombre de la empresa:', 'GTM Grupo Empresarial S.A.S.'],
  ['NIT / RUC / Identificacion:', '900.123.456-7'],
  ['Pais:', 'Colombia'],
  ['Ciudad:', 'Bogota'],
  ['Direccion:', 'Cra 15 #93-47 Oficina 302'],
  ['Telefono:', '+57 601 456 7890'],
  ['Correo de contacto:', 'gerencia@gtmgrupo.com'],
  ['Logo de la empresa:', 'Subir archivo PNG/JPG'],
])

// PASO 3
stepBox(3, 'SISTEMA A INSTALAR', 'Seleccionar el tipo de sistema y modelo de despliegue.')
formTable([
  ['Tipo de sistema:', 'CRM GTM / CRM Comercial / Inventario / Inmobiliario / HomeUX / Custom'],
  ['Modelo de despliegue:', 'Nuestro Vercel (SaaS) / Hosting del cliente'],
  ['Modulos a activar:', 'Dashboard, Clientes, Contactos, Oportunidades, Cotizaciones...'],
])

// PASO 4
stepBox(4, 'USUARIOS INICIALES', 'Crear los usuarios que tendran acceso al sistema.')
formTable([
  ['Nombre completo:', 'Carlos Mendoza Rios'],
  ['Usuario de acceso:', 'cmendoza'],
  ['Correo electronico:', 'cmendoza@gtmgrupo.com'],
  ['Clave inicial:', 'Admin01*'],
  ['Rol:', 'Administrador / Comercial / Operaciones / Contabilidad'],
])

// PASO 5
stepBox(5, 'CONFIRMACION Y CREACION', 'Revisar toda la informacion y confirmar la creacion del sistema.')
bulletList([
  'Se revisa el resumen completo con el administrador',
  'Se muestra vista previa de la pantalla de login personalizada',
  'Se confirma y se procede a la creacion automatica',
])

// PASO 6
stepBox(6, 'EJECUCION AUTOMATICA', 'El sistema ejecuta automaticamente:')
bulletList([
  'Crear el proyecto en Vercel',
  'Configurar el subdominio (ej: crmgtmcol.sistech.com)',
  'Crear la base de datos en Supabase',
  'Instalar el sistema con los modulos seleccionados',
  'Crear los usuarios con sus roles y permisos',
  'Personalizar logo, nombre de empresa, ciudad y pais',
  'Preparar configuracion base de correo (ver Paso 7)',
])

// ══════════════════════════════════════════════════════
// PASO 7: CONFIGURACION DE CORREO (NUEVO)
// ══════════════════════════════════════════════════════
addPage()
stepBox(7, 'CONFIGURACION DE CORREO (IDENTIDAD DEL CLIENTE)', null)

alertBox('CRITICO: Sin este paso, los correos salen con remitente generico y los destinatarios (proveedores, empleados) no saben quien les envio el correo.')

y += 2
para('Configurar el servidor de correo para que todos los emails del sistema salgan con la identidad de la empresa del cliente. Esto incluye: ordenes de compra, notificaciones de tareas, pedidos, y cualquier comunicacion automatica.')

y += 2
subTitle('Datos de Correo del Cliente')
formTable([
  ['Nombre remitente (From Name):', 'GTM Grupo Empresarial S.A.S.'],
  ['Correo remitente (From Email):', 'sistema@gtmgrupo.com'],
  ['Servidor SMTP:', 'smtp.gmail.com / SMTP del cliente'],
  ['Puerto SMTP:', '465 (SSL) o 587 (TLS)'],
  ['Usuario SMTP:', 'sistema@gtmgrupo.com'],
  ['Contraseña SMTP / App Password:', '********'],
])

y += 2
subTitle('Opciones de Servidor de Correo')

paraBold('Opcion A — Gmail (rapido y gratis):')
bulletList([
  'El cliente crea una cuenta Gmail dedicada (ej: notificaciones.gtm@gmail.com)',
  'En Google: Cuenta > Seguridad > Verificacion en 2 pasos > Contrasenas de aplicacion',
  'Genera una App Password y la proporciona',
  'Servidor: smtp.gmail.com | Puerto: 465 | SSL: Si',
])

paraBold('Opcion B — Correo corporativo (profesional):')
bulletList([
  'El cliente proporciona datos SMTP de su dominio (ej: sistema@gtmgrupo.com)',
  'Mas profesional: el destinatario ve el dominio de la empresa',
  'Requiere que el cliente tenga hosting de correo configurado',
])

y += 2
subTitle('Donde Aparece el Nombre de la Empresa')
bulletList([
  'Remitente del email: "GTM Grupo Empresarial S.A.S." <sistema@gtmgrupo.com>',
  'Header del PDF adjunto: logo + nombre de empresa',
  'Header del email HTML: logo + nombre de empresa',
  'Footer del correo: "Enviado desde GTM Grupo Empresarial S.A.S."',
  'Asunto: "Orden de Compra OC-00015 — GTM Grupo Empresarial S.A.S."',
])

y += 2
subTitle('Donde se Configuran estos Datos')

paraBold('1. Variables de entorno en Vercel:')
formTable([
  ['SMTP_HOST:', 'smtp.gmail.com (o SMTP del cliente)'],
  ['SMTP_PORT:', '465'],
  ['SMTP_USER:', 'sistema@gtmgrupo.com'],
  ['SMTP_PASS:', 'App Password o contraseña SMTP'],
])

paraBold('2. Modulo "Datos Empresa" en el sistema:')
bulletList([
  'Nombre de empresa, correo, telefono, direccion, logo',
  'El sistema lee estos datos para generar PDFs y emails con la identidad correcta',
])

y += 2
subTitle('Ejemplo de Correo Recibido por el Proveedor')

checkPage(30)
doc.setFillColor(248, 250, 252); doc.setDrawColor(...BLUE); doc.setLineWidth(0.5)
doc.roundedRect(M, y, W - M * 2, 38, 3, 3, 'FD')

doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY)
doc.text('De:', M + 5, y + 7)
doc.setTextColor(...DARK)
doc.text('GTM Grupo Empresarial S.A.S. <sistema@gtmgrupo.com>', M + 15, y + 7)

doc.setTextColor(...GRAY)
doc.text('Para:', M + 5, y + 13)
doc.setTextColor(...DARK); doc.setFont('helvetica', 'normal')
doc.text('compras@proveedorxyz.com', M + 15, y + 13)

doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY)
doc.text('Asunto:', M + 5, y + 19)
doc.setTextColor(...DARK)
doc.text('Orden de Compra OC-00015 — GTM Grupo Empresarial S.A.S.', M + 20, y + 19)

doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY); doc.setFontSize(7.5)
doc.text('Adjunto: OC-00015.pdf (con logo y datos fiscales de GTM Grupo Empresarial)', M + 5, y + 26)

doc.setFillColor(...GREEN); doc.roundedRect(M + 5, y + 30, 55, 4, 1, 1, 'F')
doc.setFontSize(7); doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold')
doc.text('El proveedor identifica claramente al remitente', M + 7, y + 33)

y += 44

y += 2
subTitle('Verificacion Obligatoria')
alertBox('ANTES de entregar el sistema al cliente: enviar un correo de prueba (ej: una orden de compra) y confirmar que el destinatario ve el nombre correcto de la empresa como remitente. Si no se hace esto, los proveedores no sabran quien les escribio.')

// ══════════════════════════════════════════════════════
// PASO 8: ENTREGA
// ══════════════════════════════════════════════════════
addPage()
stepBox(8, 'ENTREGA DE ACCESOS', 'Se genera el documento de entrega con toda la informacion del sistema creado.')

checkPage(30)
doc.setFillColor(240, 253, 244); doc.setDrawColor(...GREEN); doc.setLineWidth(0.8)
doc.roundedRect(M, y, W - M * 2, 35, 3, 3, 'FD')

doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN)
doc.text('SISTEMA CREADO EXITOSAMENTE', M + 5, y + 8)

doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
doc.text('Cliente: GTM Grupo Empresarial S.A.S.', M + 5, y + 15)
doc.text('Sistema: CRM GTM — Colombia', M + 5, y + 21)
doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLUE)
doc.text('URL: https://crmgtmcol.sistech.com', M + 5, y + 27)

y += 40

detailTable(
  ['Usuario', 'Clave', 'Rol'],
  [['cmendoza', 'Admin01*', 'Administrador']],
  [45, 45, W - M * 2 - 90]
)

// ══════════════════════════════════════════════════════
// COSTOS
// ══════════════════════════════════════════════════════
y += 5
subTitle('COSTOS DE INFRAESTRUCTURA')

detailTable(
  ['Concepto', 'Costo', 'Nota'],
  [
    ['Dominio (sistech.com)', '~$12 USD/ano', 'Se paga una sola vez al ano'],
    ['Subdominios', 'GRATIS', 'Ilimitados bajo el dominio principal'],
    ['Vercel Hobby', 'GRATIS', 'Hasta 3 proyectos'],
    ['Vercel Pro', '$20 USD/mes', 'Proyectos ilimitados'],
    ['Supabase Free', 'GRATIS', 'Hasta 500MB por proyecto'],
    ['Supabase Pro', '$25 USD/mes', 'Cuando el cliente crece'],
  ],
  [50, 35, W - M * 2 - 85]
)

// Footer en todas las paginas
const totalPages = doc.getNumberOfPages()
for (let i = 2; i <= totalPages; i++) {
  doc.setPage(i)
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('SISTECH — Accesos y Flujo de Alta de Clientes — 18 Abril 2026', W / 2, H - 8, { align: 'center' })
  doc.text(`Pag ${i - 1}`, W - M, H - 8, { align: 'right' })
}

// GUARDAR
const outputPath = 'docs/ACCESOS_Y_FLUJO_SISTECH.pdf'
fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')))
console.log(`PDF generado: ${outputPath}`)
console.log(`Paginas: ${totalPages}`)
