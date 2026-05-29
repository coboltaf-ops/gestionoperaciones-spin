import { jsPDF } from 'jspdf';
import fs from 'fs';

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
const pageWidth = 216;
const pageHeight = 279;
const marginLeft = 25;
const marginRight = 25;
const contentWidth = pageWidth - marginLeft - marginRight;
let y = 0;
let pageNum = 1;

// Colors
const PRIMARY = [30, 58, 138];      // Azul oscuro
const SECONDARY = [59, 130, 246];   // Azul medio
const ACCENT = [16, 185, 129];      // Verde
const DARK = [30, 41, 59];          // Slate oscuro
const LIGHT_BG = [241, 245, 249];   // Fondo gris claro
const WHITE = [255, 255, 255];
const ORANGE = [234, 88, 12];       // Naranja

function addHeader() {
  // Header bar
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'normal');
  doc.text('SaaS Factory V4 - Metodologia de Desarrollo', marginLeft, 12);
  doc.text(`Pagina ${pageNum}`, pageWidth - marginRight, 12, { align: 'right' });
  y = 28;
}

function addFooter() {
  doc.setFillColor(...PRIMARY);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text('Documento Confidencial - SaaS Factory V4', marginLeft, pageHeight - 4);
  doc.text('Abril 2026', pageWidth - marginRight, pageHeight - 4, { align: 'right' });
}

function newPage() {
  addFooter();
  doc.addPage();
  pageNum++;
  addHeader();
}

function checkSpace(needed) {
  if (y + needed > pageHeight - 25) {
    newPage();
  }
}

function title(text, size = 18, color = PRIMARY) {
  checkSpace(15);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.text(text, marginLeft, y);
  y += size * 0.5 + 2;
}

function subtitle(text) {
  checkSpace(12);
  doc.setFontSize(13);
  doc.setTextColor(...SECONDARY);
  doc.setFont('helvetica', 'bold');
  doc.text(text, marginLeft, y);
  y += 8;
}

function sectionNumber(num, text) {
  checkSpace(18);
  // Circulo con numero
  doc.setFillColor(...PRIMARY);
  doc.circle(marginLeft + 5, y - 2, 5, 'F');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.text(String(num), marginLeft + 5, y, { align: 'center' });
  // Texto
  doc.setFontSize(14);
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text(text, marginLeft + 14, y);
  y += 5;
  // Linea
  doc.setDrawColor(...SECONDARY);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, marginLeft + contentWidth, y);
  y += 6;
}

function paragraph(text) {
  checkSpace(10);
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, contentWidth);
  lines.forEach(line => {
    checkSpace(5);
    doc.text(line, marginLeft, y);
    y += 5;
  });
  y += 2;
}

function bullet(text, indent = 0) {
  checkSpace(8);
  const x = marginLeft + 5 + indent;
  doc.setFillColor(...ACCENT);
  doc.circle(x - 2, y - 1.5, 1.2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, contentWidth - 8 - indent);
  lines.forEach((line, i) => {
    checkSpace(5);
    doc.text(line, x + 2, y);
    y += 5;
  });
  y += 1;
}

function numberedItem(num, text) {
  checkSpace(8);
  const x = marginLeft + 5;
  doc.setFillColor(...SECONDARY);
  doc.roundedRect(x - 5, y - 4.5, 7, 6, 1, 1, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.text(String(num), x - 1.5, y, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, contentWidth - 12);
  lines.forEach((line, i) => {
    checkSpace(5);
    doc.text(line, x + 5, y);
    y += 5;
  });
  y += 1;
}

function infoBox(text, color = LIGHT_BG, borderColor = SECONDARY) {
  checkSpace(18);
  const lines = doc.splitTextToSize(text, contentWidth - 16);
  const boxH = lines.length * 5 + 8;
  doc.setFillColor(...color);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(marginLeft, y - 4, contentWidth, boxH, 2, 2, 'FD');
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'italic');
  lines.forEach(line => {
    doc.text(line, marginLeft + 8, y + 2);
    y += 5;
  });
  y += 6;
}

function tableRow(cols, widths, isHeader = false, bgColor = null) {
  checkSpace(10);
  let x = marginLeft;
  const rowH = 8;
  if (bgColor) {
    doc.setFillColor(...bgColor);
    doc.rect(x, y - 5, contentWidth, rowH, 'F');
  }
  if (isHeader) {
    doc.setFillColor(...PRIMARY);
    doc.rect(x, y - 5, contentWidth, rowH, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
  }
  doc.setFontSize(9);
  cols.forEach((col, i) => {
    const cellText = doc.splitTextToSize(String(col), widths[i] - 4);
    doc.text(cellText[0] || '', x + 3, y);
    x += widths[i];
  });
  y += rowH - 2;
}

function flowArrow(fromText, toText) {
  checkSpace(12);
  const boxW = 60;
  const boxH = 8;
  const x1 = marginLeft + 10;
  const x2 = marginLeft + contentWidth - boxW - 10;

  // From box
  doc.setFillColor(...SECONDARY);
  doc.roundedRect(x1, y - 5, boxW, boxH, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.text(fromText, x1 + boxW / 2, y, { align: 'center' });

  // Arrow
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1);
  const arrowStart = x1 + boxW + 3;
  const arrowEnd = x2 - 3;
  doc.line(arrowStart, y - 1, arrowEnd, y - 1);
  doc.setFillColor(...ACCENT);
  doc.triangle(arrowEnd, y - 4, arrowEnd, y + 2, arrowEnd + 4, y - 1, 'F');

  // To box
  doc.setFillColor(...ACCENT);
  doc.roundedRect(x2, y - 5, boxW, boxH, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.text(toText, x2 + boxW / 2, y, { align: 'center' });

  y += 10;
}

// ==========================================
// PORTADA
// ==========================================
doc.setFillColor(...PRIMARY);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Lineas decorativas
doc.setDrawColor(255, 255, 255, 0.1);
doc.setLineWidth(0.3);
for (let i = 0; i < 20; i++) {
  doc.setDrawColor(255, 255, 255);
  doc.line(0, 30 + i * 12, pageWidth, 30 + i * 12);
}

// Caja central
doc.setFillColor(255, 255, 255);
doc.roundedRect(30, 60, pageWidth - 60, 120, 4, 4, 'F');

doc.setFontSize(12);
doc.setTextColor(...SECONDARY);
doc.setFont('helvetica', 'normal');
doc.text('SAAS FACTORY V4', pageWidth / 2, 80, { align: 'center' });

doc.setFontSize(26);
doc.setTextColor(...PRIMARY);
doc.setFont('helvetica', 'bold');
doc.text('Metodologia de', pageWidth / 2, 100, { align: 'center' });
doc.text('Desarrollo', pageWidth / 2, 113, { align: 'center' });

doc.setDrawColor(...ACCENT);
doc.setLineWidth(2);
doc.line(pageWidth / 2 - 30, 120, pageWidth / 2 + 30, 120);

doc.setFontSize(11);
doc.setTextColor(...DARK);
doc.setFont('helvetica', 'normal');
doc.text('Guia completa del flujo de desarrollo,', pageWidth / 2, 132, { align: 'center' });
doc.text('despliegue e instalacion para clientes', pageWidth / 2, 139, { align: 'center' });

doc.setFontSize(10);
doc.setTextColor(...SECONDARY);
doc.text('Agent-First Software Factory', pageWidth / 2, 155, { align: 'center' });

// Info inferior
doc.setFontSize(11);
doc.setTextColor(...WHITE);
doc.text('Version 4.0', pageWidth / 2, 210, { align: 'center' });
doc.text('Abril 2026', pageWidth / 2, 220, { align: 'center' });

doc.setFontSize(9);
doc.text('Documento Confidencial', pageWidth / 2, 240, { align: 'center' });

// ==========================================
// INDICE
// ==========================================
doc.addPage();
pageNum++;
addHeader();

title('Indice de Contenido', 20);
y += 5;

const tocItems = [
  ['1', 'Filosofia Agent-First', '3'],
  ['2', 'Stack Tecnologico (Golden Path)', '4'],
  ['3', 'Arquitectura Feature-First', '5'],
  ['4', 'Flujo de Desarrollo', '6'],
  ['5', 'Entornos: Local, Staging, Produccion', '7'],
  ['6', 'Flujo de Trabajo con Supabase', '8'],
  ['7', 'Flujo de Deploy con Vercel', '9'],
  ['8', 'Instalacion para Cliente Nuevo', '10'],
  ['9', 'Skills: Herramientas del Agente', '11'],
  ['10', 'Reglas de Codigo y Convenciones', '13'],
  ['11', 'Auto-Blindaje (Mejora Continua)', '14'],
  ['12', 'Checklist de Calidad', '15'],
];

tocItems.forEach(([num, text, page]) => {
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text(num + '.', marginLeft, y);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.text(text, marginLeft + 10, y);
  // Dots
  const textW = doc.getTextWidth(text);
  const dotsStart = marginLeft + 10 + textW + 2;
  const dotsEnd = marginLeft + contentWidth - 10;
  doc.setTextColor(180, 180, 180);
  let dx = dotsStart;
  while (dx < dotsEnd) {
    doc.text('.', dx, y);
    dx += 2;
  }
  doc.setTextColor(...SECONDARY);
  doc.setFont('helvetica', 'bold');
  doc.text(page, marginLeft + contentWidth, y, { align: 'right' });
  y += 8;
});

addFooter();

// ==========================================
// SECCION 1: FILOSOFIA
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(1, 'Filosofia Agent-First');
y += 2;

paragraph('SaaS Factory V4 opera bajo el paradigma Agent-First: el humano dice QUE quiere construir y el agente decide COMO hacerlo. El usuario no necesita conocimientos tecnicos. El agente traduce lenguaje natural a codigo funcional.');

y += 3;
subtitle('Principios Fundamentales');

bullet('El usuario habla en lenguaje natural, el agente ejecuta');
bullet('NUNCA se le pide al usuario que ejecute comandos');
bullet('NUNCA se le pide al usuario que edite archivos');
bullet('El agente hace TODO, el usuario solo aprueba');
bullet('Cada error se documenta y nunca ocurre dos veces (Auto-Blindaje)');

y += 3;
subtitle('Flujo de Comunicacion');

infoBox('Usuario: "Quiero una app para gestionar inventario"\nAgente: Ejecuta entrevista de negocio -> Genera BUSINESS_LOGIC.md -> Pregunta diseno -> Implementa todo el sistema completo');

y += 2;
paragraph('Este enfoque permite que personas sin conocimiento tecnico puedan dirigir el desarrollo de software complejo, manteniendo la calidad y las mejores practicas de ingenieria.');

subtitle('Beneficios del Enfoque');

bullet('Velocidad: Features complejas en minutos, no dias');
bullet('Consistencia: Mismo stack, mismos patrones, misma calidad siempre');
bullet('Escalabilidad: Cada proyecto hereda las mejoras de la fabrica');
bullet('Accesibilidad: No se requiere equipo tecnico para operar');

addFooter();

// ==========================================
// SECCION 2: STACK TECNOLOGICO
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(2, 'Stack Tecnologico (Golden Path)');
y += 2;

paragraph('No se ofrecen opciones tecnologicas. Se ejecuta un stack unico, probado y optimizado. Esto elimina la "paralisis por analisis" y garantiza compatibilidad total entre componentes.');

y += 3;
const stackWidths = [55, 55, contentWidth - 110];
tableRow(['Capa', 'Tecnologia', 'Proposito'], stackWidths, true);
tableRow(['Framework', 'Next.js 16', 'App Router, SSR, API Routes, Turbopack'], stackWidths, false, LIGHT_BG);
tableRow(['UI', 'React 19', 'Componentes, Server Components, Suspense'], stackWidths);
tableRow(['Lenguaje', 'TypeScript 5.9', 'Tipado estatico, seguridad en compilacion'], stackWidths, false, LIGHT_BG);
tableRow(['Estilos', 'Tailwind CSS 3.4', 'Utility-first, responsive, temas custom'], stackWidths);
tableRow(['Base de Datos', 'Supabase', 'PostgreSQL, Auth, RLS, Storage, Realtime'], stackWidths, false, LIGHT_BG);
tableRow(['Estado', 'Zustand 5.0', 'State management ligero con persistencia'], stackWidths);
tableRow(['Validacion', 'Zod', 'Schemas, validacion runtime, type inference'], stackWidths, false, LIGHT_BG);
tableRow(['AI Engine', 'Vercel AI SDK v5', 'Chat, RAG, Vision, Tools, Streaming'], stackWidths);
tableRow(['AI Router', 'OpenRouter', 'Multi-modelo: GPT, Claude, Gemini, etc.'], stackWidths, false, LIGHT_BG);
tableRow(['Testing', 'Playwright', 'E2E automatizado, CLI + MCP'], stackWidths);
tableRow(['Deploy', 'Vercel', 'CI/CD automatico, Edge, Serverless'], stackWidths, false, LIGHT_BG);
tableRow(['Email', 'Nodemailer', 'SMTP, templates, adjuntos PDF'], stackWidths);
tableRow(['PDF/Excel', 'jsPDF + XLSX', 'Generacion de reportes exportables'], stackWidths, false, LIGHT_BG);

y += 5;
infoBox('IMPORTANTE: Este stack es fijo. No se negocia ni se cambia por proyecto. La consistencia es lo que permite velocidad y calidad predecible.');

addFooter();

// ==========================================
// SECCION 3: ARQUITECTURA
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(3, 'Arquitectura Feature-First');
y += 2;

paragraph('Cada feature contiene TODO su contexto en un solo directorio. Esto facilita el desarrollo, testing y mantenimiento. No hay que buscar en multiples carpetas para entender una funcionalidad.');

y += 3;
subtitle('Estructura del Proyecto');

const structLines = [
  { t: 'src/', d: 0, bold: true },
  { t: 'app/', d: 1, bold: true },
  { t: '(auth)/', d: 2, desc: 'Rutas de autenticacion (login, signup)' },
  { t: '(main)/', d: 2, desc: 'Rutas principales con layout sidebar' },
  { t: 'api/', d: 2, desc: 'API Routes (CRUD, emails)' },
  { t: 'features/', d: 1, bold: true },
  { t: '[feature]/', d: 2, bold: true },
  { t: 'components/', d: 3, desc: 'UI especifica de la feature' },
  { t: 'hooks/', d: 3, desc: 'Logica y estado local' },
  { t: 'services/', d: 3, desc: 'Llamadas a API/Supabase' },
  { t: 'types/', d: 3, desc: 'Tipos TypeScript' },
  { t: 'store/', d: 3, desc: 'Estado Zustand' },
  { t: 'shared/', d: 1, bold: true },
  { t: 'components/', d: 2, desc: 'Componentes reutilizables' },
  { t: 'hooks/', d: 2, desc: 'Hooks compartidos' },
  { t: 'lib/', d: 2, desc: 'Utilidades (export, format)' },
  { t: 'types/', d: 2, desc: 'Tipos globales' },
];

doc.setFillColor(...LIGHT_BG);
const boxStartY = y - 2;
structLines.forEach(line => {
  const x = marginLeft + 8 + line.d * 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', line.bold ? 'bold' : 'normal');
  doc.setTextColor(...(line.bold ? PRIMARY : DARK));
  doc.text((line.d > 0 ? '|-- ' : '') + line.t, x, y);
  if (line.desc) {
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('// ' + line.desc, x + 45, y);
  }
  y += 5;
});

y += 5;
subtitle('Patron de Datos');

numberedItem(1, 'Usuario interactua con la UI (React Components)');
numberedItem(2, 'Cambios se guardan en Zustand Store (con persistencia)');
numberedItem(3, 'Store sincroniza con Supabase via servicios de la feature');
numberedItem(4, 'Supabase aplica RLS (Row Level Security) automaticamente');
numberedItem(5, 'Datos fluyen de vuelta a la UI via React Server Components o queries');

addFooter();

// ==========================================
// SECCION 4: FLUJO DE DESARROLLO
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(4, 'Flujo de Desarrollo');
y += 2;

paragraph('El desarrollo sigue flujos predefinidos segun la complejidad de la tarea. Esto garantiza que cada tipo de trabajo reciba el nivel de planificacion adecuado.');

y += 3;
subtitle('Flujo 1: Proyecto Nuevo (desde cero)');

numberedItem(1, 'NEW-APP: Entrevista de negocio que genera BUSINESS_LOGIC.md con toda la logica del sistema');
numberedItem(2, 'Seleccion de Design System: Elegir estilo visual (Glassmorphism, Neobrutalism, etc.)');
numberedItem(3, 'ADD-LOGIN: Implementar autenticacion completa (Email + Google OAuth + profiles + RLS)');
numberedItem(4, 'PRP: Planificar la primera feature con Product Requirements Proposal');
numberedItem(5, 'BUCLE AGENTICO: Implementar por fases (BD -> Backend -> Frontend -> Testing)');
numberedItem(6, 'QA: Verificar con Playwright que todo funciona correctamente');

y += 5;
subtitle('Flujo 2: Feature Compleja');

numberedItem(1, 'PRP: Generar plan detallado (el usuario aprueba antes de implementar)');
numberedItem(2, 'BUCLE AGENTICO: Ejecutar por fases con mapeo de contexto real en cada fase');
numberedItem(3, 'AUTO-BLINDAJE: Si hay errores, se documentan y corrigen automaticamente');
numberedItem(4, 'QA: Validar resultado final con tests automatizados');

y += 5;
subtitle('Flujo 3: Tarea Rapida (Sprint)');

numberedItem(1, 'SPRINT: Ejecutar directo sin planificacion formal');
numberedItem(2, 'Verificar con el usuario que el resultado es correcto');
numberedItem(3, 'Pasar a la siguiente tarea');

y += 3;
infoBox('REGLA: Si la tarea toca mas de 3 archivos o requiere cambios en BD + API + UI, SIEMPRE usar PRP + Bucle Agentico. Nunca improvisar features complejas.');

addFooter();

// ==========================================
// SECCION 5: ENTORNOS
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(5, 'Entornos: Local, Staging, Produccion');
y += 2;

paragraph('El desarrollo debe fluir por tres entornos claramente definidos. Cada entorno tiene un proposito especifico y nunca se debe saltar un paso.');

y += 3;

// Entorno Local
subtitle('Entorno Local (Desarrollo)');
bullet('URL: http://localhost:3000');
bullet('Base de datos: Supabase local (puerto 54321) o Supabase remoto de desarrollo');
bullet('Proposito: Desarrollo activo, pruebas rapidas, iteracion');
bullet('Comando: npm run dev (auto-detecta puerto disponible 3000-3006)');

y += 3;

// Entorno Staging
subtitle('Entorno Staging (Validacion)');
bullet('URL: proyecto.vercel.app (URL automatica de Vercel)');
bullet('Base de datos: Supabase remoto (proyecto de desarrollo/staging)');
bullet('Proposito: Validar que todo funcione en entorno real antes de entregar al cliente');
bullet('Deploy: Automatico con cada push a la rama principal');

y += 3;

// Entorno Produccion
subtitle('Entorno Produccion (Cliente)');
bullet('URL: Dominio del cliente o subdominio dedicado');
bullet('Base de datos: Supabase remoto (proyecto exclusivo del cliente, BD vacia)');
bullet('Proposito: Sistema en uso real por el cliente');
bullet('Deploy: Vercel con variables de entorno del cliente');

y += 5;

subtitle('Flujo entre Entornos');

flowArrow('Local (Dev)', 'Staging (Vercel)');
y += 2;
flowArrow('Staging (Validar)', 'Produccion (Cliente)');

y += 5;
infoBox('REGLA DE ORO: NUNCA instalar directamente en produccion del cliente. Siempre validar en staging (Vercel + Supabase remoto) primero. Lo que funciona en local NO siempre funciona en produccion.');

addFooter();

// ==========================================
// SECCION 6: SUPABASE
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(6, 'Flujo de Trabajo con Supabase');
y += 2;

paragraph('Supabase es la base de datos central del sistema. Provee PostgreSQL, autenticacion, Row Level Security y storage. Cada cliente tiene su propio proyecto de Supabase.');

y += 3;
subtitle('Estructura de Migraciones');

paragraph('Las migraciones SQL viven en /supabase/migrations/ y definen toda la estructura de la base de datos. Se aplican automaticamente al crear un proyecto nuevo.');

bullet('Tablas de referencia: tipo_identificacion, categoria, grupo, subgrupo, unidad_medida, etc.');
bullet('Tablas de negocio: producto, proveedor, bodega, centro_costo, orden_compra, etc.');
bullet('RLS habilitado en TODAS las tablas (obligatorio)');
bullet('Extension uuid-ossp para IDs unicos');

y += 3;
subtitle('Row Level Security (RLS)');

paragraph('RLS es OBLIGATORIO en todas las tablas. Controla que cada usuario solo vea y modifique los datos que le corresponden. Sin RLS, cualquier usuario autenticado podria ver todos los datos.');

y += 2;
const rlsWidths = [40, contentWidth - 40];
tableRow(['Fase', 'Politica RLS'], rlsWidths, true);
tableRow(['Desarrollo', 'Permisiva (Allow all for authenticated) - temporal'], rlsWidths, false, LIGHT_BG);
tableRow(['Staging', 'Granular por rol (admin, supervisor, operador)'], rlsWidths);
tableRow(['Produccion', 'Granular + auditoria + validacion estricta'], rlsWidths, false, LIGHT_BG);

y += 5;
subtitle('Comandos Supabase');

bullet('supabase start - Iniciar Supabase local');
bullet('supabase db reset - Resetear BD local y aplicar migraciones');
bullet('supabase migration new [nombre] - Crear nueva migracion');
bullet('supabase db push - Aplicar migraciones a proyecto remoto');
bullet('supabase link --project-ref [ID] - Vincular a proyecto remoto');

y += 3;
infoBox('IMPORTANTE: Nunca modificar la BD directamente en produccion. Siempre crear migraciones y aplicarlas en orden. Esto garantiza que la estructura sea reproducible.');

addFooter();

// ==========================================
// SECCION 7: VERCEL
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(7, 'Flujo de Deploy con Vercel');
y += 2;

paragraph('Vercel es la plataforma de deploy. Cada push al repositorio genera un deploy automatico. Vercel provee URLs de preview para cada branch y una URL de produccion estable.');

y += 3;
subtitle('Configuracion Inicial');

numberedItem(1, 'Crear repositorio en GitHub (privado)');
numberedItem(2, 'Conectar repositorio a Vercel (vercel.com > Import Project)');
numberedItem(3, 'Configurar variables de entorno en Vercel:');

y += 2;
bullet('NEXT_PUBLIC_SUPABASE_URL - URL del proyecto Supabase', 8);
bullet('NEXT_PUBLIC_SUPABASE_ANON_KEY - Clave publica de Supabase', 8);
bullet('NEXT_PUBLIC_SITE_URL - URL del sitio en Vercel', 8);
bullet('SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS - Para emails', 8);

y += 3;
subtitle('Flujo de Deploy');

numberedItem(1, 'Desarrollar en local (npm run dev)');
numberedItem(2, 'Verificar build (npm run build + npm run typecheck)');
numberedItem(3, 'Commit y push a GitHub');
numberedItem(4, 'Vercel detecta el push y genera deploy automatico');
numberedItem(5, 'Verificar en URL de preview que todo funcione');
numberedItem(6, 'Merge a main = deploy a produccion');

y += 3;
subtitle('Variables de Entorno por Entorno');

const envWidths = [50, 50, contentWidth - 100];
tableRow(['Variable', 'Desarrollo', 'Produccion'], envWidths, true);
tableRow(['SUPABASE_URL', 'localhost:54321', 'xxx.supabase.co'], envWidths, false, LIGHT_BG);
tableRow(['SITE_URL', 'localhost:3000', 'dominio-cliente.com'], envWidths);
tableRow(['SMTP_*', 'Gmail dev', 'SMTP del cliente'], envWidths, false, LIGHT_BG);

y += 3;
infoBox('NUNCA subir archivos .env al repositorio. Las variables se configuran directamente en el dashboard de Vercel para cada entorno (Preview, Production).');

addFooter();

// ==========================================
// SECCION 8: INSTALACION CLIENTE
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(8, 'Instalacion para Cliente Nuevo');
y += 2;

paragraph('Este es el proceso completo para instalar el sistema en un cliente nuevo. El sistema se entrega como una aplicacion lista con base de datos vacia que el cliente llena con sus propios datos.');

y += 3;
subtitle('Paso 1: Crear Proyecto Supabase');

bullet('Ir a supabase.com y crear nuevo proyecto (plan Free o Pro segun necesidad)');
bullet('Anotar: Project URL, Anon Key, Service Role Key');
bullet('Region: Seleccionar la mas cercana al cliente');

y += 2;
subtitle('Paso 2: Aplicar Estructura de BD');

bullet('Vincular proyecto: supabase link --project-ref [PROJECT_ID]');
bullet('Aplicar migraciones: supabase db push');
bullet('Verificar tablas creadas en el dashboard de Supabase');
bullet('Configurar RLS granular (reemplazar politicas permisivas)');

y += 2;
subtitle('Paso 3: Configurar Autenticacion');

bullet('Habilitar Email/Password en Supabase Auth');
bullet('Configurar Google OAuth si el cliente lo requiere');
bullet('Configurar SMTP para emails de confirmacion');
bullet('Crear usuario administrador inicial');

y += 2;
subtitle('Paso 4: Deploy en Vercel');

bullet('Crear nuevo proyecto en Vercel (o duplicar existente)');
bullet('Configurar variables de entorno del cliente');
bullet('Asignar dominio personalizado si aplica');
bullet('Verificar que el deploy funcione correctamente');

y += 2;
subtitle('Paso 5: Entrega al Cliente');

bullet('Entregar credenciales de administrador');
bullet('Capacitar en uso basico del sistema');
bullet('Verificar que puede crear datos (productos, proveedores, etc.)');
bullet('Soporte inicial durante primera semana');

y += 3;
infoBox('TIEMPO ESTIMADO: La instalacion para un cliente nuevo toma aproximadamente 1-2 horas si el sistema ya esta validado en staging. La mayor parte del tiempo es configuracion, no codigo.');

addFooter();

// ==========================================
// SECCION 9: SKILLS
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(9, 'Skills: Herramientas del Agente');
y += 2;

paragraph('Los Skills son herramientas especializadas que el agente utiliza para ejecutar tareas. Se dividen en dos categorias: los que el usuario puede solicitar y los que el agente activa automaticamente.');

y += 3;
subtitle('Skills que el Usuario Puede Pedir');

const skillWidths = [35, contentWidth - 35];
tableRow(['Skill', 'Cuando Usarlo'], skillWidths, true);
tableRow(['new-app', 'Empezar proyecto desde cero. Entrevista de negocio -> BUSINESS_LOGIC.md'], skillWidths, false, LIGHT_BG);
tableRow(['add-login', 'Agregar auth completa: Email + Google OAuth + profiles + RLS'], skillWidths);
tableRow(['landing', 'Landing page cinematica: scroll-driven video + copy de alta conversion'], skillWidths, false, LIGHT_BG);
tableRow(['prp', 'Planificar feature compleja antes de implementar'], skillWidths);
tableRow(['bucle-agentico', 'Implementar features complejas por fases coordinadas'], skillWidths, false, LIGHT_BG);
tableRow(['sprint', 'Tareas rapidas que no necesitan planificacion formal'], skillWidths);
tableRow(['ai', 'Agregar IA: chat, RAG, vision, tools, web search'], skillWidths, false, LIGHT_BG);
tableRow(['qa', 'Testing automatizado con Playwright CLI'], skillWidths);
tableRow(['memory-manager', 'Guardar conocimiento persistente del proyecto'], skillWidths, false, LIGHT_BG);
tableRow(['image-generation', 'Generar imagenes con OpenRouter + Gemini'], skillWidths);
tableRow(['eject-sf', 'Remover SaaS Factory del proyecto (DESTRUCTIVO)'], skillWidths, false, LIGHT_BG);
tableRow(['update-sf', 'Actualizar template a ultima version'], skillWidths);
tableRow(['skill-creator', 'Crear nuevos skills personalizados'], skillWidths, false, LIGHT_BG);
tableRow(['autoresearch', 'Auto-optimizar skills con loop autonomo'], skillWidths);

y += 3;
subtitle('Skills Automaticos (el usuario no los invoca)');

newPage();

const autoWidths = [40, contentWidth - 40];
tableRow(['Skill', 'Se Activa Cuando...'], autoWidths, true);
tableRow(['backend', 'Server Actions, APIs, logica de negocio, Zod'], autoWidths, false, LIGHT_BG);
tableRow(['frontend', 'UI/UX, componentes React, Tailwind, animaciones'], autoWidths);
tableRow(['supabase-admin', 'Migraciones, RLS, queries SQL, config auth'], autoWidths, false, LIGHT_BG);
tableRow(['codebase-analyst', 'Entender patrones y arquitectura del proyecto'], autoWidths);
tableRow(['vercel-deployer', 'Deploy, env vars, dominios, rollbacks'], autoWidths, false, LIGHT_BG);
tableRow(['documentacion', 'Actualizar docs despues de cambios'], autoWidths);
tableRow(['calidad', 'Testing, validacion, quality gates'], autoWidths, false, LIGHT_BG);

y += 5;
subtitle('MCPs (Model Context Protocol)');

paragraph('Los MCPs son conexiones directas a servicios externos que el agente usa como "sentidos y manos":');

y += 2;
bullet('Playwright MCP: Ver la UI, hacer click, llenar formularios, tomar screenshots');
bullet('Supabase MCP: Ejecutar SQL, aplicar migraciones, listar tablas, ver logs');
bullet('Next.js DevTools MCP: Ver errores de build/runtime en tiempo real');

addFooter();

// ==========================================
// SECCION 10: REGLAS DE CODIGO
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(10, 'Reglas de Codigo y Convenciones');
y += 2;

paragraph('Estas reglas son obligatorias en todo el codigo. No son sugerencias. El agente las aplica automaticamente y el Auto-Blindaje las refuerza.');

y += 3;
subtitle('Principios de Diseno');

bullet('KISS (Keep It Simple, Stupid): Soluciones simples siempre');
bullet('YAGNI (You Ain\'t Gonna Need It): Solo implementar lo necesario');
bullet('DRY (Don\'t Repeat Yourself): Sin duplicacion de codigo');

y += 3;
subtitle('Limites de Tamano');

const sizeWidths = [50, contentWidth - 50];
tableRow(['Elemento', 'Limite Maximo'], sizeWidths, true);
tableRow(['Archivos', '500 lineas'], sizeWidths, false, LIGHT_BG);
tableRow(['Funciones', '50 lineas'], sizeWidths);
tableRow(['Componentes', '300 lineas (incluyendo JSX)'], sizeWidths, false, LIGHT_BG);
tableRow(['Props', '10 propiedades maximo'], sizeWidths);

y += 3;
subtitle('Convenciones de Nombrado');

const nameWidths = [45, 45, contentWidth - 90];
tableRow(['Elemento', 'Convencion', 'Ejemplo'], nameWidths, true);
tableRow(['Variables', 'camelCase', 'totalProductos, isLoading'], nameWidths, false, LIGHT_BG);
tableRow(['Funciones', 'camelCase', 'handleSubmit, fetchData'], nameWidths);
tableRow(['Componentes', 'PascalCase', 'ProductoForm, DashboardCard'], nameWidths, false, LIGHT_BG);
tableRow(['Archivos', 'kebab-case', 'producto-form.tsx, use-auth.ts'], nameWidths);
tableRow(['Tipos', 'PascalCase', 'Producto, OrdenCompra'], nameWidths, false, LIGHT_BG);
tableRow(['Constantes', 'UPPER_SNAKE', 'MAX_ITEMS, API_URL'], nameWidths);

y += 3;
subtitle('Reglas de Seguridad');

bullet('NUNCA usar "any" en TypeScript (usar "unknown" si es necesario)');
bullet('SIEMPRE validar entradas de usuario con Zod');
bullet('SIEMPRE habilitar RLS en tablas de Supabase');
bullet('NUNCA exponer secrets en codigo o en NEXT_PUBLIC_*');
bullet('NUNCA almacenar tokens de sesion en localStorage sin encriptacion');

addFooter();

// ==========================================
// SECCION 11: AUTO-BLINDAJE
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(11, 'Auto-Blindaje (Mejora Continua)');
y += 2;

paragraph('El Auto-Blindaje es el sistema de mejora continua de SaaS Factory. Cada error que ocurre se arregla, se documenta y se previene. El mismo error NUNCA ocurre dos veces.');

y += 3;
subtitle('Ciclo de Auto-Blindaje');

numberedItem(1, 'ERROR OCURRE: Se detecta un fallo durante desarrollo o testing');
numberedItem(2, 'SE ARREGLA: El agente corrige el error inmediatamente');
numberedItem(3, 'SE DOCUMENTA: Se registra la causa raiz y la solucion');
numberedItem(4, 'SE PREVIENE: Se actualiza el skill o regla para evitar recurrencia');

y += 5;
subtitle('Donde se Documenta Cada Error');

const blindWidths = [50, contentWidth - 50];
tableRow(['Ubicacion', 'Tipo de Error'], blindWidths, true);
tableRow(['PRP actual', 'Errores especificos de la feature en desarrollo'], blindWidths, false, LIGHT_BG);
tableRow(['Skill relevante', 'Errores que aplican a multiples features'], blindWidths);
tableRow(['CLAUDE.md', 'Errores criticos que aplican a TODO el sistema'], blindWidths, false, LIGHT_BG);
tableRow(['Memory (.claude/)', 'Aprendizajes del proyecto especifico'], blindWidths);

y += 5;
subtitle('Ejemplo Real de Auto-Blindaje');

infoBox('2025-01-09: Usar npm run dev, no next dev\n- Error: Puerto hardcodeado causa conflictos cuando multiples proyectos corren\n- Fix: Siempre usar npm run dev que auto-detecta puerto disponible (3000-3006)\n- Aplicar en: TODOS los proyectos de la fabrica');

y += 3;
paragraph('Este sistema convierte cada error en una mejora permanente. Con el tiempo, la fabrica se vuelve mas robusta y los errores comunes desaparecen completamente.');

addFooter();

// ==========================================
// SECCION 12: CHECKLIST
// ==========================================
doc.addPage();
pageNum++;
addHeader();

sectionNumber(12, 'Checklist de Calidad');
y += 2;

paragraph('Antes de entregar cualquier feature o sistema a un cliente, verificar TODOS los puntos de esta checklist. No se hace excepcion.');

y += 3;
subtitle('Antes de Cada Deploy');

const checkItems1 = [
  'npm run build completa sin errores',
  'npm run typecheck pasa sin errores',
  'npm run lint pasa sin warnings criticos',
  'Variables de entorno configuradas correctamente en Vercel',
  'Migraciones SQL aplicadas en la BD de destino',
  'RLS configurado y probado en todas las tablas',
];

checkItems1.forEach((item) => {
  checkSpace(7);
  const x = marginLeft + 5;
  doc.setDrawColor(...SECONDARY);
  doc.setLineWidth(0.5);
  doc.rect(x - 3, y - 4, 5, 5);
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.text(item, x + 6, y);
  y += 7;
});

y += 3;
subtitle('Antes de Entregar al Cliente');

const checkItems2 = [
  'Sistema accesible via URL de produccion',
  'Login funciona correctamente (email + password)',
  'Usuario administrador creado con credenciales seguras',
  'Todos los modulos activos y funcionales',
  'Emails de notificacion configurados y probados',
  'Exportacion PDF/Excel funciona en todos los reportes',
  'Datos de prueba eliminados (BD limpia)',
  'Dominio personalizado configurado (si aplica)',
  'SSL/HTTPS activo y funcionando',
  'Backup de BD configurado (si aplica)',
];

checkItems2.forEach((item) => {
  checkSpace(7);
  const x = marginLeft + 5;
  doc.setDrawColor(...SECONDARY);
  doc.setLineWidth(0.5);
  doc.rect(x - 3, y - 4, 5, 5);
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(item, contentWidth - 15);
  doc.text(lines[0], x + 6, y);
  y += 7;
});

y += 5;
subtitle('Validacion Funcional Minima');

const checkItems3 = [
  'Crear, editar y eliminar un producto',
  'Crear un proveedor y asociarlo a un producto',
  'Generar una orden de compra con detalle',
  'Registrar recepcion de factura',
  'Transferir producto entre bodegas',
  'Generar reporte y exportar a PDF/Excel',
  'Enviar email de orden de compra',
  'Verificar dashboard con datos reales',
];

checkItems3.forEach((item) => {
  checkSpace(7);
  const x = marginLeft + 5;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  doc.rect(x - 3, y - 4, 5, 5);
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.text(item, x + 6, y);
  y += 7;
});

addFooter();

// ==========================================
// PAGINA FINAL
// ==========================================
doc.addPage();
pageNum++;

doc.setFillColor(...PRIMARY);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

doc.setFillColor(255, 255, 255);
doc.roundedRect(40, 80, pageWidth - 80, 100, 4, 4, 'F');

doc.setFontSize(22);
doc.setTextColor(...PRIMARY);
doc.setFont('helvetica', 'bold');
doc.text('SaaS Factory V4', pageWidth / 2, 110, { align: 'center' });

doc.setDrawColor(...ACCENT);
doc.setLineWidth(2);
doc.line(pageWidth / 2 - 25, 117, pageWidth / 2 + 25, 117);

doc.setFontSize(14);
doc.setTextColor(...DARK);
doc.setFont('helvetica', 'normal');
doc.text('Metodologia de Desarrollo', pageWidth / 2, 130, { align: 'center' });

doc.setFontSize(10);
doc.setTextColor(...SECONDARY);
doc.text('El humano dice QUE.', pageWidth / 2, 148, { align: 'center' });
doc.text('El agente decide COMO.', pageWidth / 2, 156, { align: 'center' });
doc.text('Todo es un Skill. Agent-First.', pageWidth / 2, 164, { align: 'center' });

doc.setFontSize(9);
doc.setTextColor(...WHITE);
doc.text('Version 4.0 - Abril 2026', pageWidth / 2, 220, { align: 'center' });
doc.text('Documento generado automaticamente por SaaS Factory', pageWidth / 2, 230, { align: 'center' });

// ==========================================
// GUARDAR
// ==========================================
const outputPath = '/Users/josepalomares/aplicaciones/gestioninventario/docs/Metodologia_Desarrollo_SaaS_Factory.pdf';
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(outputPath, pdfBuffer);
console.log(`PDF generado: ${outputPath}`);
console.log(`Paginas: ${pageNum}`);
