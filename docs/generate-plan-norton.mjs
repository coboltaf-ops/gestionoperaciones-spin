import jsPDFModule from 'jspdf'
import fs from 'fs'

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
const W = doc.internal.pageSize.getWidth()
const H = doc.internal.pageSize.getHeight()
const M = 16
let y = 0
let pageNum = 1

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

function sectionTitle(text) {
  checkPage(18)
  doc.setFillColor(...BLUE)
  doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'F')
  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(text, M + 5, y + 7)
  y += 14
}

function subTitle(text) {
  checkPage(12)
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...LIGHT_BLUE)
  doc.text(text, M, y); y += 6
}

function para(text) {
  checkPage(8)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  doc.splitTextToSize(text, W - M * 2).forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.5 })
  y += 2
}

function paraBold(text) {
  checkPage(8)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK)
  doc.splitTextToSize(text, W - M * 2).forEach(line => { checkPage(5); doc.text(line, M, y); y += 4.5 })
  y += 1
}

function bulletList(items) {
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  items.forEach(item => {
    checkPage(8)
    doc.text('•', M + 2, y)
    const lines = doc.splitTextToSize(item, W - M * 2 - 8)
    lines.forEach((line, i) => { if (i > 0) checkPage(5); doc.text(line, M + 7, y); y += 4.5 })
    y += 1
  })
  y += 1
}

function infoBox(text, borderColor = LIGHT_BLUE) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const boxH = lines.length * 4.5 + 8
  doc.setFillColor(239, 246, 255); doc.setDrawColor(...borderColor); doc.setLineWidth(0.8)
  doc.roundedRect(M, y - 2, W - M * 2, boxH, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  lines.forEach(line => { doc.text(line, M + 6, y + 3); y += 4.5 })
  y += 6
}

function alertBox(text) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const boxH = lines.length * 4.5 + 8
  doc.setFillColor(254, 242, 242); doc.setDrawColor(...RED); doc.setLineWidth(0.8)
  doc.roundedRect(M, y - 2, W - M * 2, boxH, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RED)
  lines.forEach(line => { doc.text(line, M + 6, y + 3); y += 4.5 })
  y += 6
}

function successBox(text) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const boxH = lines.length * 4.5 + 8
  doc.setFillColor(240, 253, 244); doc.setDrawColor(...GREEN); doc.setLineWidth(0.8)
  doc.roundedRect(M, y - 2, W - M * 2, boxH, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN)
  lines.forEach(line => { doc.text(line, M + 6, y + 3); y += 4.5 })
  y += 6
}

function warnBox(text) {
  checkPage(18)
  const lines = doc.splitTextToSize(text, W - M * 2 - 12)
  const boxH = lines.length * 4.5 + 8
  doc.setFillColor(255, 251, 235); doc.setDrawColor(...AMBER); doc.setLineWidth(0.8)
  doc.roundedRect(M, y - 2, W - M * 2, boxH, 2, 2, 'FD')
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK)
  lines.forEach(line => { doc.text(line, M + 6, y + 3); y += 4.5 })
  y += 6
}

function detailTable(headers, rows, colWidths) {
  const totalW = W - M * 2
  doc.setFontSize(8)
  checkPage(10)
  doc.setFillColor(...BLUE); doc.rect(M, y, totalW, 7, 'F')
  doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold')
  let xPos = M
  headers.forEach((h, i) => { doc.text(h, xPos + 2, y + 5); xPos += colWidths[i] })
  y += 7
  doc.setFont('helvetica', 'normal')
  rows.forEach((row, ri) => {
    const maxLines = Math.max(...row.map((c, ci) => doc.splitTextToSize(String(c), colWidths[ci] - 4).length))
    const rowH = Math.max(6, maxLines * 4 + 2)
    checkPage(rowH + 2)
    if (ri % 2 === 0) { doc.setFillColor(...BG_LIGHT); doc.rect(M, y, totalW, rowH, 'F') }
    xPos = M
    row.forEach((cell, ci) => {
      doc.setTextColor(...DARK)
      const lines = doc.splitTextToSize(String(cell), colWidths[ci] - 4)
      lines.forEach((line, li) => doc.text(line, xPos + 2, y + 4 + li * 4))
      xPos += colWidths[ci]
    })
    y += rowH
  })
  y += 4
}

function stepBox(num, title, desc) {
  checkPage(20)
  doc.setFillColor(...BLUE); doc.circle(M + 5, y + 2, 5, 'F')
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
  doc.text(String(num), M + 5, y + 3.5, { align: 'center' })
  doc.setFontSize(11); doc.setTextColor(...BLUE)
  doc.text(title, M + 14, y + 3.5)
  y += 8
  doc.setFillColor(...LIGHT_BLUE); doc.rect(M, y, 1.5, 2, 'F')
  if (desc) para(desc)
}

// ══════════════════════════════════════════════════════
// PORTADA
// ══════════════════════════════════════════════════════
doc.setFillColor(...BLUE); doc.rect(0, 0, W, H, 'F')

doc.setTextColor(...WHITE); doc.setFontSize(40); doc.setFont('helvetica', 'bold')
doc.text('NORTON', W / 2, 70, { align: 'center' })

doc.setFontSize(13); doc.setFont('helvetica', 'normal'); doc.setTextColor(147, 197, 253)
doc.text('Grupo GTM — Unidad Norton', W / 2, 82, { align: 'center' })

doc.setDrawColor(59, 130, 246); doc.setLineWidth(1.5)
doc.line(W / 2 - 40, 90, W / 2 + 40, 90)

doc.setFontSize(20); doc.setTextColor(...WHITE); doc.setFont('helvetica', 'bold')
doc.text('Plan de Accion', W / 2, 108, { align: 'center' })
doc.text('Implementacion CRM Norton', W / 2, 120, { align: 'center' })

doc.setFontSize(13); doc.setFont('helvetica', 'normal'); doc.setTextColor(147, 197, 253)
doc.text('Rebranding, Arquitectura Multi-Pais y', W / 2, 135, { align: 'center' })
doc.text('Estrategia de Mantenimiento', W / 2, 143, { align: 'center' })

// Badge
doc.setFillColor(0, 0, 0); doc.setDrawColor(255, 255, 255)
doc.roundedRect(W / 2 - 60, 163, 120, 30, 4, 4, 'FD')
doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
doc.text('DOCUMENTO DE PROPUESTA', W / 2, 175, { align: 'center' })
doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 255, 255)
doc.text('Para revision de Grupo GTM / Norton', W / 2, 183, { align: 'center' })

// Países
doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE)
doc.text('Ecuador   ·   Peru   ·   Colombia', W / 2, 215, { align: 'center' })

doc.setFontSize(9); doc.setTextColor(147, 197, 253)
doc.text('Preparado por: SISTECH', W / 2, 245, { align: 'center' })
doc.text('Fecha: 19 de Abril de 2026', W / 2, 252, { align: 'center' })

// ══════════════════════════════════════════════════════
// RESUMEN EJECUTIVO
// ══════════════════════════════════════════════════════
addPage()

sectionTitle('RESUMEN EJECUTIVO')

para('Este documento presenta el plan de accion para la implementacion del CRM para la unidad Norton del Grupo GTM, basado en los requerimientos recibidos durante el demo del 18 de Abril de 2026. Norton, aunque pertenece al Grupo GTM, opera como unidad independiente y requiere una solucion separada del CRM GTM actual.')

subTitle('Requerimientos clave del cliente')
bulletList([
  'Rebranding: cambiar el nombre "CRM GTM" por "CRM Norton" en todas las pantallas.',
  'Reemplazar el logo actual por el logo oficial de Norton (pendiente de recibir).',
  'Operar en 3 paises inicialmente: Ecuador, Peru y Colombia.',
  'Definir como se manejarian los cambios/actualizaciones una vez desplegado.',
  'Mantener la landing actual — solo cambiar el logo.',
])

subTitle('Que propone este documento')
bulletList([
  'Fase 1: Rebranding completo de CRM GTM a CRM Norton (cambios de nombre, logo, colores).',
  'Fase 2: Arquitectura multi-pais propuesta y comparacion de 3 alternativas.',
  'Fase 3: Estrategia de mantenimiento continuo basada en monorepo + despliegue automatizado.',
  'Fase 4: Roadmap y cronograma de ejecucion en 3 fases.',
  'Matriz de riesgos, costos de infraestructura y siguientes pasos.',
])

successBox('RECOMENDACION PRINCIPAL: Monorepo con despliegue por pais (Opcion C). Se detalla tecnicamente en la seccion "Arquitectura".')

// ══════════════════════════════════════════════════════
// FASE 1 — REBRAND
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('FASE 1 — REBRAND: CRM GTM a CRM NORTON')

para('Esta fase consiste en transformar la identidad visual e informativa del sistema actual de CRM GTM hacia Norton. No implica cambios funcionales, solo cosmeticos e informativos.')

subTitle('Elementos a cambiar')
detailTable(
  ['Elemento', 'Actual (GTM)', 'Nuevo (Norton)'],
  [
    ['Nombre del sistema', 'CRM GTM', 'CRM Norton'],
    ['Logo en Dashboard', 'Logo GTM', 'Logo Norton (pendiente)'],
    ['Logo en Login', 'Logo GTM', 'Logo Norton'],
    ['Logo en PDFs y reportes', 'Logo GTM', 'Logo Norton'],
    ['Logo en correos automaticos', 'Logo GTM', 'Logo Norton'],
    ['Titulo del navegador', 'CRM GTM', 'CRM Norton'],
    ['Favicon', 'Icono GTM', 'Icono Norton'],
    ['Landing publica', 'Logo GTM', 'Logo Norton (resto igual)'],
    ['Textos "GTM" en el sistema', 'Varios', 'Norton'],
    ['Emails SMTP (remitente)', 'GTM', 'Norton'],
  ],
  [52, 55, 55]
)

subTitle('Metodologia del rebrand')
para('El sistema ya tiene el modulo "Mi Empresa" con un campo "Logo" que se usa para generar PDFs, reportes y correos. Una vez cargado el logo oficial de Norton en ese campo, la propagacion es automatica en la mayoria de lugares.')
para('Los lugares hardcoded que dicen "CRM GTM" (como el titulo del sidebar o el titulo del navegador) se actualizan con un pequeno ajuste de codigo — sin impacto en la base de datos ni en los datos existentes.')

infoBox('El logo oficial de Norton debe entregarse en formato PNG con fondo transparente, tamano minimo 400x400 px. Si se dispone en vectorial (SVG), tambien sirve y da mejor calidad en PDFs.')

subTitle('Tiempo estimado')
bulletList([
  'Rebrand completo de textos: ~2 horas de codigo + deploy',
  'Carga del logo en Mi Empresa: 5 minutos (una vez el cliente lo entregue)',
  'Ajustes finos en landing: ~30 minutos',
  'Validacion y pruebas: ~1 hora',
  'Total Fase 1: aprox. 4 horas efectivas',
])

// ══════════════════════════════════════════════════════
// FASE 2 — ARQUITECTURA MULTI-PAIS
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('FASE 2 — ARQUITECTURA MULTI-PAIS')

para('La pregunta estrategica central es: como instalar y operar Norton en 3 paises (Ecuador, Peru, Colombia). Hay 3 caminos tecnicos, cada uno con ventajas y desventajas claras.')

subTitle('Opcion A — Multi-tenant (1 sistema para los 3 paises)')
para('Se despliega UNA sola aplicacion (un solo crmnorton.sistech.com) y UNA sola base de datos. Los usuarios de los 3 paises se conectan al mismo sistema; cada uno ve solo los datos de su pais gracias a filtros por rol.')
paraBold('Ventajas:')
bulletList([
  'Un unico deploy — los cambios aparecen al instante en los 3 paises.',
  'Reportes consolidados cross-pais muy faciles (dashboard LATAM).',
  'Costos de infraestructura mas bajos (1 Vercel + 1 BD).',
  'Catalogo maestro de productos/clientes puede ser compartido si hay sinergias.',
])
paraBold('Desventajas:')
bulletList([
  'Un error o caida afecta a los 3 paises simultaneamente.',
  'Requiere arquitectura multi-tenant robusta (aislamiento logico de datos).',
  'Cumplimiento regulatorio complejo: cada pais tiene normativa distinta de datos (habeas data Colombia, Ley 29733 Peru, Ley de Proteccion Ecuador).',
  'Monedas y configuraciones fiscales mezcladas en el mismo sistema.',
  'Escalabilidad mas compleja si un pais crece mucho mas que los otros.',
])

subTitle('Opcion B — Aplicaciones independientes por pais')
para('Se despliegan 3 aplicaciones totalmente separadas: crmnortonecu, crmnortonperu, crmnortoncol. Cada una tiene su propia base de datos. No se comparte nada.')
paraBold('Ventajas:')
bulletList([
  'Aislamiento total de datos: cumplimiento regulatorio automatico.',
  'Una caida de un pais no afecta a los demas.',
  'Cada pais puede tener su propia version si se necesitan customizaciones.',
])
paraBold('Desventajas:')
bulletList([
  'Cada cambio requiere desplegar 3 veces — propenso a olvidos y desincronizaciones.',
  'Con el tiempo los 3 codigos se van divergiendo (drift) y se vuelven distintos sin querer.',
  'Triple costo de infraestructura.',
  'No hay reportes consolidados sin esfuerzo adicional.',
])

subTitle('Opcion C — Monorepo con Despliegue por Pais (RECOMENDADA)')
para('UN solo codigo fuente (un repositorio git), pero 3 despliegues separados con 3 bases de datos independientes. Cada pais tiene su propia URL y su propia BD, pero comparten el mismo codigo base.')
paraBold('Ventajas:')
bulletList([
  'Un solo sitio para cambiar el codigo — cero riesgo de divergencia.',
  'Aislamiento de datos por pais (cumplimiento regulatorio facil).',
  'Una caida afecta solo a un pais.',
  'Cada despliegue puede configurarse con su propia moneda, impuestos, formato de documento (RUC/NIT), idioma y zona horaria mediante variables de entorno.',
  'Se puede liberar una actualizacion en un pais primero (canary) antes de los otros.',
  'Reportes corporativos cross-pais disponibles con un pequeno dashboard consolidador.',
])
paraBold('Desventajas:')
bulletList([
  'Triple costo de infraestructura (similar a B, pero aprovechable con Vercel Pro que permite proyectos ilimitados).',
  'Requiere disciplina de CI/CD para que los despliegues a los 3 paises sean automaticos.',
])

// Tabla comparativa
checkPage(50)
subTitle('Comparativa Rapida')
detailTable(
  ['Criterio', 'A (Multi-tenant)', 'B (Indep.)', 'C (Monorepo) *'],
  [
    ['Aislamiento de datos', 'Bajo', 'Alto', 'Alto'],
    ['Cumplimiento regulatorio', 'Dificil', 'Facil', 'Facil'],
    ['Facilidad de mantenimiento', 'Facil', 'Dificil', 'Facil'],
    ['Reportes cross-pais', 'Facil', 'Dificil', 'Medio'],
    ['Caida afecta a todos', 'Si', 'No', 'No'],
    ['Costo infraestructura', 'Bajo', 'Alto', 'Alto'],
    ['Personalizacion por pais', 'Limitada', 'Total', 'Alta'],
    ['Riesgo de divergencia', 'No', 'Alto', 'No'],
    ['Escalabilidad por pais', 'Complejo', 'Simple', 'Simple'],
  ],
  [52, 40, 35, 35]
)
para('* Opcion C combina lo mejor de A y B: un solo codigo, despliegues independientes.')

// ══════════════════════════════════════════════════════
// ESTRUCTURA PROPUESTA
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('ESTRUCTURA PROPUESTA (OPCION C)')

subTitle('URLs por pais')
detailTable(
  ['Pais', 'URL Produccion', 'Base de Datos'],
  [
    ['Ecuador', 'crmnortonecu.sistech.com', 'BD Ecuador (independiente)'],
    ['Peru', 'crmnortonperu.sistech.com', 'BD Peru (independiente)'],
    ['Colombia', 'crmnortoncol.sistech.com', 'BD Colombia (independiente)'],
    ['(Opcional) Portal Corporativo', 'crmnorton.sistech.com', 'Agrega datos de los 3'],
  ],
  [30, 65, 67]
)

para('El portal corporativo "crmnorton.sistech.com" es opcional. Se puede armar en una Fase 2 posterior y seria un dashboard consolidado que muestra KPIs de los 3 paises a la alta direccion.')

subTitle('Configuracion por pais (Variables de Entorno)')
para('Cada despliegue recibe un conjunto de variables que le indican en que pais opera. El codigo es el mismo, la configuracion es diferente.')

detailTable(
  ['Variable', 'Ecuador', 'Peru', 'Colombia'],
  [
    ['COUNTRY_CODE', 'ECU', 'PER', 'COL'],
    ['COUNTRY_NAME', 'Ecuador', 'Peru', 'Colombia'],
    ['CURRENCY', 'USD', 'PEN', 'COP'],
    ['CURRENCY_SYMBOL', '$', 'S/.', '$'],
    ['TAX_ID_LABEL', 'RUC', 'RUC', 'NIT'],
    ['TIMEZONE', 'America/Guayaquil', 'America/Lima', 'America/Bogota'],
    ['DATE_FORMAT', 'DD/MM/AAAA', 'DD/MM/AAAA', 'DD/MM/AAAA'],
    ['SUPABASE_URL', 'URL BD Ecuador', 'URL BD Peru', 'URL BD Colombia'],
    ['SUPABASE_KEY', 'Key Ecuador', 'Key Peru', 'Key Colombia'],
    ['SMTP_FROM', 'notif.ec@norton.com', 'notif.pe@norton.com', 'notif.co@norton.com'],
  ],
  [45, 42, 42, 43]
)

subTitle('Datos que se configuran en "Mi Empresa" por pais')
bulletList([
  'Nombre legal de la razon social en ese pais (ej: Norton Ecuador S.A., Norton Peru S.A.C., Norton Colombia S.A.S.)',
  'Numero de identificacion fiscal (RUC/NIT) propio de cada pais',
  'Direccion y ciudad de operacion',
  'Logo (el mismo para los 3, pero podria diferir si hay variante nacional)',
  'Lista de referencia de departamentos/regiones/provincias propia de cada pais',
  'Moneda y simbolo',
])

// ══════════════════════════════════════════════════════
// FASE 3 — MANTENIMIENTO
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('FASE 3 — ESTRATEGIA DE MANTENIMIENTO')

para('La pregunta critica del cliente fue: "una vez instalado en los 3 paises, si hay cambios, tendriamos que replicarlos en cada pais?". La respuesta con la arquitectura propuesta es NO, se replican automaticamente.')

subTitle('Como funciona el flujo de actualizaciones')

stepBox(1, 'Desarrollo en el codigo unico', 'El equipo de SISTECH hace un cambio (nueva funcionalidad, correccion de bug, mejora) en el repositorio principal.')
stepBox(2, 'Commit y push a la rama "main"', 'El cambio se sube al repositorio git. Esto dispara automaticamente un proceso de CI/CD.')
stepBox(3, 'Build + Pruebas Automaticas', 'El sistema corre pruebas de calidad, verificacion de tipos (TypeScript) y construccion. Si algo falla, el despliegue se detiene.')
stepBox(4, 'Despliegue automatico a los 3 paises', 'Vercel despliega automaticamente a los 3 proyectos (Ecuador, Peru, Colombia) con sus respectivas variables de entorno.')
stepBox(5, 'Verificacion post-deploy', 'Se valida que los 3 sitios respondan correctamente. Si alguno falla, se hace rollback automatico.')

successBox('RESULTADO: Un solo cambio en el codigo se propaga a los 3 paises en ~2 minutos, con cero intervencion manual y cero riesgo de que un pais "se quede atras".')

subTitle('Estrategias adicionales de seguridad')

paraBold('1. Despliegue por fases (Canary Deployment)')
para('Para cambios sensibles, se puede configurar que el cambio vaya primero a un pais (ej: el mas pequeno), se observe por 24h, y si todo va bien, se libere a los otros dos. Esto reduce el riesgo de un cambio masivo.')

paraBold('2. Preview Deployments')
para('Cada cambio genera automaticamente una URL de preview donde el cliente puede revisarlo ANTES de que llegue a produccion. Asi, nada sale en vivo sin validacion previa.')

paraBold('3. Rollback inmediato')
para('Si un cambio en produccion genera problemas, con un solo click se revierte a la version anterior en los 3 paises simultaneamente.')

paraBold('4. Control de cambios de base de datos')
para('Los cambios estructurales en la base de datos (nuevas tablas, columnas) se gestionan con migraciones versionadas. Cada pais recibe las mismas migraciones, en el mismo orden, garantizando consistencia del esquema.')

paraBold('5. Monitoreo proactivo')
para('Se configura monitoreo automatico: si un pais tiene caida, alerta en tiempo real. Si hay errores de aplicacion, se reportan con contexto completo.')

// ══════════════════════════════════════════════════════
// ROADMAP
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('ROADMAP DE EJECUCION')

para('Propuesta de cronograma en 4 fases. Los tiempos son estimados; la secuencia si es importante.')

subTitle('FASE 1 — Rebrand CRM GTM a CRM Norton  |  Semana 1')
bulletList([
  'Recibir logo oficial de Norton del cliente.',
  'Cambiar todos los textos "CRM GTM" por "CRM Norton".',
  'Cargar logo en "Mi Empresa" y verificar propagacion a PDFs, correos, reportes.',
  'Ajustar landing actual: solo cambio de logo.',
  'Cambiar titulo de navegador y favicon.',
  'Deploy a produccion actual (crmgtm.vercel.app) como CRM Norton.',
  'Validacion con el cliente.',
])
infoBox('Duracion estimada: 3-5 dias habiles. Entregable: CRM Norton funcionando en produccion con identidad Norton.')

subTitle('FASE 2 — Instancia piloto: Ecuador  |  Semana 2')
bulletList([
  'Crear repositorio git "crmnorton" (monorepo) como fork del actual crmgtm.',
  'Crear proyecto en Vercel: crmnortonecu.sistech.com.',
  'Crear base de datos Supabase independiente para Ecuador.',
  'Configurar variables de entorno para Ecuador (moneda, idioma, tax ID).',
  'Configurar SMTP con el correo dedicado de Norton Ecuador.',
  'Cargar listas de referencia: provincias Ecuador, ciudades principales, etc.',
  'Crear usuarios iniciales de Ecuador.',
  'Capacitacion al equipo de Ecuador (2-4 horas).',
  'Inicio de operacion controlada con Ecuador.',
])
infoBox('Duracion estimada: 7-10 dias habiles. Por que Ecuador primero? Puede ser el mercado mas pequeno o mas controlado — sirve para detectar ajustes antes de escalar.')

subTitle('FASE 3 — Despliegue a Peru y Colombia  |  Semanas 3-4')
bulletList([
  'Con las lecciones aprendidas de Ecuador, se replica el proceso para Peru.',
  'Crear crmnortonperu.sistech.com con sus configuraciones (Soles, RUC Peru).',
  'Cargar listas de referencia propias de Peru (regiones, departamentos).',
  'Capacitacion equipo Peru.',
  'Misma secuencia para Colombia: crmnortoncol.sistech.com, configuraciones COP, departamentos de Colombia (ya disponibles en el sistema), capacitacion.',
  'Durante esta fase, los 3 sistemas ya estan en produccion.',
])
infoBox('Duracion estimada: 10-15 dias habiles para los dos paises. En este punto, los 3 paises operan de forma independiente con el mismo codigo base.')

subTitle('FASE 4 — Consolidacion y Portal Corporativo (Opcional)  |  Mes 2')
bulletList([
  'Activar el pipeline de CI/CD para que los cambios se propaguen automaticamente a los 3 paises.',
  'Configurar monitoreo centralizado.',
  'Crear el portal corporativo crmnorton.sistech.com (dashboard LATAM con KPIs consolidados).',
  'Estandarizar reportes cross-pais.',
  'Establecer rutina de actualizaciones mensuales (o bajo demanda).',
])

// ══════════════════════════════════════════════════════
// PARTE A — COSTOS TECNICOS (INFRAESTRUCTURA PURA)
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('PARTE A — COSTOS TECNICOS DE INFRAESTRUCTURA')

infoBox('Esta seccion detalla UNICAMENTE el costo tecnico real de operar los 3 CRMs Norton en la nube. NO incluye servicios profesionales ni soporte humano. Es lo que cualquier proveedor tendria que pagar si, o si, para mantener la infraestructura encendida.')

subTitle('Componentes tecnicos requeridos')
para('Para operar los 3 CRMs de Norton (Ecuador, Peru, Colombia) en la infraestructura SISTECH se requieren los siguientes servicios:')

detailTable(
  ['Componente', 'Proveedor', 'Proposito'],
  [
    ['Hosting de aplicacion', 'Vercel Pro', 'Servir los 3 frontends + APIs (3 deploys)'],
    ['Dominio', 'sistech.com', 'Subdominios por pais'],
    ['Base de datos Ecuador', 'Supabase Pro', 'Datos aislados de operacion Ecuador'],
    ['Base de datos Peru', 'Supabase Pro', 'Datos aislados de operacion Peru'],
    ['Base de datos Colombia', 'Supabase Pro', 'Datos aislados de operacion Colombia'],
    ['Storage para archivos', 'Vercel Blob', 'Logos, PDFs, documentos'],
    ['SMTP (correo saliente)', 'Gmail / SMTP pro', 'Envio de correos automaticos'],
  ],
  [50, 40, W - M * 2 - 90]
)

subTitle('Costos mensuales tecnicos (en USD)')
detailTable(
  ['Concepto', 'Mensual', 'Anual'],
  [
    ['Vercel Pro (cubre los 3 deploys + landing)', '$20', '$240'],
    ['Supabase Pro - Ecuador', '$25', '$300'],
    ['Supabase Pro - Peru', '$25', '$300'],
    ['Supabase Pro - Colombia', '$25', '$300'],
    ['Vercel Blob (storage archivos)', '$0-5', '$0-60'],
    ['SMTP dedicado por pais (opcional)', '$0-15', '$0-180'],
    ['Dominio sistech.com (amortizado)', '$1', '$12'],
    ['SUBTOTAL TECNICO (base, Gmail SMTP)', '$96', '$1,152'],
    ['SUBTOTAL TECNICO (con SMTP Pro)', '$111-140', '$1,332-1,680'],
  ],
  [95, 35, 40]
)

paraBold('Modalidades posibles para la infraestructura tecnica:')
bulletList([
  'Opcion 1: SISTECH administra y absorbe toda la infraestructura (contratos directos con Vercel/Supabase a nombre de SISTECH). Norton no firma nada con proveedores externos.',
  'Opcion 2: Norton contrata directamente los servicios (Vercel Pro, Supabase, dominio) y SISTECH solo administra. Norton paga facturas directas a cada proveedor.',
  'Opcion 3 (HIBRIDA, recomendada): SISTECH provee la infraestructura como parte del paquete SaaS, sin que Norton vea facturas tecnicas separadas. Simple y limpio.',
])

infoBox('Los costos tecnicos NO varian significativamente si crece el volumen de uso (salvo que se supere el plan Free de Vercel o Supabase). Son predecibles y fijos.')

// ══════════════════════════════════════════════════════
// PARTE B — SERVICIOS SISTECH (LO QUE SE COBRA)
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('PARTE B — SERVICIOS PROFESIONALES SISTECH')

infoBox('Esta seccion detalla los servicios que SISTECH ofrece a Norton por encima de la infraestructura tecnica. Aqui esta el verdadero valor agregado: experiencia, personalizacion, capacitacion, soporte continuo y evolucion del producto.')

// ─── B.1 SETUP ───
subTitle('B.1 - Setup Inicial (pago unico)')
para('Trabajo profesional de implementacion, configuracion y puesta en marcha. Se cobra una sola vez al inicio.')

detailTable(
  ['Servicio', 'Descripcion', 'Valor (USD)'],
  [
    ['Rebrand CRM GTM a CRM Norton', 'Cambio de marca completo: logo, nombres, colores, favicon, titulos. Incluye validacion.', '$800'],
    ['Implementacion Ecuador (piloto)', 'Setup + BD + configuraciones pais + capacitacion (4h) + migracion datos.', '$1,200'],
    ['Implementacion Peru', 'Setup + BD + configuraciones pais + capacitacion (4h) + migracion datos.', '$900'],
    ['Implementacion Colombia', 'Setup + BD + configuraciones pais + capacitacion (4h) + migracion datos.', '$900'],
    ['Portal Corporativo (opcional)', 'Dashboard LATAM consolidado con KPIs cross-pais.', '$1,500'],
    ['TOTAL SETUP 3 PAISES', 'Sin portal corporativo', 'USD 3,800'],
    ['TOTAL SETUP 3 PAISES + Portal', 'Con portal corporativo', 'USD 5,300'],
  ],
  [55, 80, 35]
)

paraBold('Forma de pago sugerida para el setup:')
bulletList([
  '40% a la firma del acuerdo (arranque Fase 1: rebrand).',
  '30% contra entrega del piloto Ecuador operativo.',
  '30% contra entrega de Peru + Colombia operativos.',
])

// ─── B.2 MENSUALIDAD ───
subTitle('B.2 - Mensualidad de Servicios SISTECH (recurrente)')
para('Servicios continuos que mantienen la operacion funcionando: infraestructura gestionada, soporte tecnico, actualizaciones, backups, monitoreo y pequenos ajustes.')

paraBold('Tres planes de servicios profesionales:')
detailTable(
  ['Plan', 'Por Pais / Mes', 'Que incluye'],
  [
    ['Starter', 'USD 150', 'Hasta 5 usuarios. Soporte email (respuesta 48h). Backups. Sin customizaciones.'],
    ['Business *', 'USD 250', 'Hasta 20 usuarios. Soporte prioritario (respuesta 24h). 1 customizacion/mes (hasta 4h). Capacitacion refresco trimestral.'],
    ['Enterprise', 'USD 450', 'Usuarios ilimitados. Soporte 24/7. Customizaciones ilimitadas (hasta 10h/mes). Capacitacion mensual. Reportes a medida.'],
  ],
  [30, 30, W - M * 2 - 60]
)
para('* Plan Business es el recomendado para Norton en esta etapa.')

paraBold('Ejemplo de facturacion mensual para Norton (Plan Business):')
detailTable(
  ['Concepto', 'USD/mes', 'USD/ano'],
  [
    ['Servicios SISTECH - Ecuador', '$250', '$3,000'],
    ['Servicios SISTECH - Peru', '$250', '$3,000'],
    ['Servicios SISTECH - Colombia', '$250', '$3,000'],
    ['Portal Corporativo (opcional)', '$150', '$1,800'],
    ['SUBTOTAL 3 paises (sin portal)', '$750', '$9,000'],
    ['SUBTOTAL 3 paises (con portal)', '$900', '$10,800'],
  ],
  [95, 40, 40]
)

// ─── B.3 EXTRAS ───
subTitle('B.3 - Servicios bajo demanda (opcionales)')
para('Trabajos especificos que se cotizan aparte segun el alcance.')

detailTable(
  ['Servicio', 'Tarifa Sugerida'],
  [
    ['Desarrollo de modulo nuevo personalizado', 'USD 800-3,000 segun complejidad'],
    ['Integracion con sistema externo (ERP, contable, etc.)', 'USD 1,500-4,000'],
    ['Capacitacion adicional in-situ', 'USD 300/jornada (4h)'],
    ['Reportes/dashboards a medida', 'USD 400-800 por reporte'],
    ['Migracion de datos desde otro CRM', 'USD 600-2,000 segun volumen'],
    ['Consultoria de procesos comerciales', 'USD 80/hora'],
    ['Soporte fuera de plan (hora extra)', 'USD 60/hora'],
  ],
  [95, 80]
)

// ══════════════════════════════════════════════════════
// PARTE C — RECOMENDACION
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('PARTE C — RECOMENDACION DE SISTECH')

subTitle('Mi propuesta profesional para Norton')
para('Con base en el tamano estimado de Norton en los 3 paises y la cultura operativa observada en el demo, la recomendacion profesional es:')

successBox('PLAN BUSINESS EN LOS 3 PAISES con modalidad SaaS (Opcion 3 Hibrida): USD 750/mes + USD 3,800 de setup unico.')

paraBold('Por que esta es la mejor opcion para Norton:')
bulletList([
  'Previsibilidad total: una sola factura mensual, sin sobresaltos.',
  'Cero preocupacion tecnica: Norton se concentra en usar el CRM, no en mantenerlo.',
  'Escalable: si crecen mas de 20 usuarios por pais, se migra a Enterprise sin friccion.',
  'Ahorro real: USD 750/mes es ~USD 9,000/ano frente a los USD 20,000-35,000/ano que costaria montar infraestructura + contratar personal TI.',
  'Incluye actualizaciones continuas — Norton siempre esta en la version mas nueva.',
  'Con el Plan Business, 1 customizacion mensual cubre la mayoria de ajustes operativos.',
])

subTitle('Arranque economico si se desea fase inicial mas conservadora')
para('Alternativa para iniciar con menos riesgo economico:')

detailTable(
  ['Opcion de arranque', 'Mes 1-3', 'Mes 4+'],
  [
    ['Piloto solo Ecuador', '$250/mes', '$750/mes al activar 3 paises'],
    ['Plan Starter x 3 paises', '$450/mes', 'Escalar a Business cuando crezca uso'],
    ['Plan Business completo desde dia 1 (recomendado)', '$750/mes', '$750/mes'],
  ],
  [90, 40, W - M * 2 - 130]
)

// ─── Resumen Economico Final ───
subTitle('Resumen economico final recomendado')
detailTable(
  ['Concepto', 'Frecuencia', 'Valor USD'],
  [
    ['Setup inicial (3 paises)', 'Una sola vez', '$3,800'],
    ['Servicios mensuales (Plan Business x 3)', 'Mensual', '$750'],
    ['Inversion Ano 1 total', '', '$12,800'],
    ['Inversion Ano 2 en adelante', 'Anual', '$9,000'],
  ],
  [85, 35, 55]
)

paraBold('Que recibe Norton por esta inversion (Ano 1):')
bulletList([
  'CRM Norton funcionando en 3 paises (Ecuador, Peru, Colombia).',
  'Infraestructura completa: hosting, BDs, dominios, correo, backups.',
  'Rebrand completo del sistema a identidad Norton.',
  'Capacitacion inicial de todos los equipos por pais.',
  'Soporte tecnico todo el ano (respuesta 24h).',
  'Actualizaciones automaticas — siempre en la ultima version.',
  'Customizaciones menores mensuales (12 al ano).',
  'Vista 360 del cliente, formularios publicos, PQRS, cotizaciones, reportes.',
  'Logs de correos, bitacora, documentos, email marketing.',
])

warnBox('Los precios presentados son referenciales. La propuesta comercial formal se presentara a Norton en un documento aparte, firmable, con alcances y SLAs detallados.')

// ══════════════════════════════════════════════════════
// MATRIZ DE RIESGOS
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('MATRIZ DE RIESGOS Y MITIGACIONES')

detailTable(
  ['Riesgo', 'Probab.', 'Impacto', 'Mitigacion'],
  [
    ['Logo Norton no llega a tiempo', 'Media', 'Bajo', 'Usar placeholder temporal; el rebrand avanza sin el logo y se coloca despues'],
    ['Caida de un pais en produccion', 'Baja', 'Medio', 'Rollback automatico, monitoreo 24/7, alertas inmediatas'],
    ['Divergencia de codigos entre paises', 'Baja (con Opcion C)', 'Alto', 'Monorepo elimina este riesgo por diseno'],
    ['Requerimiento regulatorio nuevo en un pais', 'Media', 'Medio', 'BDs aisladas permiten customizar un pais sin afectar otros'],
    ['Usuario clave no capacitado', 'Media', 'Medio', 'Sesiones de capacitacion, manual de usuario, videos'],
    ['Perdida de datos', 'Muy Baja', 'Alto', 'Backups automaticos diarios en Supabase (incluidos en tier Pro)'],
    ['Costos de infra escalan inesperadamente', 'Baja', 'Medio', 'Tiers gratuitos cubren fase inicial; alertas de uso configuradas'],
    ['Problema de email (SMTP caido)', 'Baja', 'Medio', 'SMTP dedicado por pais, fallback a Gmail App Password'],
    ['Cliente pide cambios que divergen', 'Media', 'Alto', 'Todo cambio especifico se evalua: feature flags para activar por pais'],
  ],
  [50, 22, 22, 80]
)

// ══════════════════════════════════════════════════════
// NEXT STEPS
// ══════════════════════════════════════════════════════
addPage()
sectionTitle('SIGUIENTES PASOS INMEDIATOS')

para('Para arrancar la Fase 1 (rebrand), lo siguiente debe quedar definido:')

subTitle('Acciones del cliente (Grupo GTM / Norton)')
bulletList([
  'Entregar el logo oficial de Norton en formato PNG (fondo transparente) y/o SVG vectorial.',
  'Confirmar que el nombre formal del sistema es "CRM Norton" (no "Norton CRM" o similar).',
  'Definir si habra cambios de paleta de colores (actualmente azules SISTECH) o se mantiene.',
  'Designar un responsable tecnico por cada pais (puede ser el mismo o distintos).',
  'Entregar razones sociales y NITs/RUCs de las 3 entidades (Ecuador, Peru, Colombia).',
  'Confirmar si los usuarios del CRM GTM actuales migran al nuevo CRM Norton o son equipos separados.',
])

subTitle('Acciones de SISTECH')
bulletList([
  'Una vez recibido el logo, ejecutar Fase 1 (rebrand) — 3 a 5 dias habiles.',
  'Preparar repositorio monorepo "crmnorton" como base para despliegues multi-pais.',
  'Documentar las variables de configuracion para cada pais.',
  'Preparar plantilla de capacitacion para los equipos.',
  'Validar dominio sistech.com para los subdominios por pais.',
])

subTitle('Decisiones pendientes que necesitan alineacion con el cliente')
bulletList([
  'Cual pais se usa como piloto (propuesta: Ecuador). Definir con el cliente.',
  'Si habra un portal corporativo consolidado (crmnorton.sistech.com) desde el inicio o en una fase posterior.',
  'Periodicidad deseada de actualizaciones (semanal/mensual/bajo demanda).',
  'Horarios de mantenimiento preferidos para los despliegues.',
])

y += 4
successBox('CONCLUSION: La Opcion C (Monorepo + Despliegue por Pais) entrega lo mejor de ambos mundos: aislamiento operativo por pais y mantenimiento centralizado desde un solo codigo. Esta es la recomendacion profesional de SISTECH.')

y += 2
warnBox('Este documento es una propuesta inicial para discusion. Cualquier ajuste de alcance, fases o arquitectura se trabajara en conjunto con Grupo GTM / Norton antes de iniciar la ejecucion.')

// Footer en todas las paginas
const totalPages = doc.getNumberOfPages()
for (let i = 2; i <= totalPages; i++) {
  doc.setPage(i)
  doc.setFontSize(8); doc.setTextColor(...GRAY)
  doc.text('SISTECH — Plan de Accion Implementacion CRM Norton — 19 Abril 2026', W / 2, H - 8, { align: 'center' })
  doc.text(`Pag ${i - 1}`, W - M, H - 8, { align: 'right' })
}

// GUARDAR
const outputPath = 'docs/PLAN_ACCION_CRM_NORTON.pdf'
fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')))
console.log(`PDF generado: ${outputPath}`)
console.log(`Paginas: ${totalPages}`)
