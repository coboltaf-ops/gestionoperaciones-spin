const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// Hoja 1: Plantilla de Productos (con 3 ejemplos)
const productos = [
  {
    "Código": "PROD-00001",
    "Descripción": "Cemento Portland Tipo I 42.5 kg",
    "Tipo Inventario": "Mercancía",
    "Categoría": "Estructura",
    "Grupo": "Concreto",
    "Sub-Grupo": "Cemento",
    "Unidad de Medida": "Saco",
    "Último Costo": 350.00,
    "Máximo": 500,
    "Mínimo": 50,
    "Existencia": 0,
    "Situación": "Activo"
  },
  {
    "Código": "PROD-00002",
    "Descripción": "Varilla Corrugada 3/8\" 6m",
    "Tipo Inventario": "Mercancía",
    "Categoría": "Estructura",
    "Grupo": "Acero",
    "Sub-Grupo": "Varillas",
    "Unidad de Medida": "Unidad",
    "Último Costo": 185.00,
    "Máximo": 2000,
    "Mínimo": 200,
    "Existencia": 0,
    "Situación": "Activo"
  },
  {
    "Código": "PROD-00003",
    "Descripción": "Pintura Latex Interior Blanca 5 Gal",
    "Tipo Inventario": "Mercancía",
    "Categoría": "Acabados",
    "Grupo": "Pintura",
    "Sub-Grupo": "Interior",
    "Unidad de Medida": "Cubeta",
    "Último Costo": 2200.00,
    "Máximo": 100,
    "Mínimo": 10,
    "Existencia": 0,
    "Situación": "Activo"
  },
];

const wsProductos = XLSX.utils.json_to_sheet(productos);

wsProductos['!cols'] = [
  { wch: 14 },  // Código
  { wch: 42 },  // Descripción
  { wch: 16 },  // Tipo Inventario
  { wch: 20 },  // Categoría
  { wch: 18 },  // Grupo
  { wch: 18 },  // Sub-Grupo
  { wch: 18 },  // Unidad de Medida
  { wch: 14 },  // Último Costo
  { wch: 10 },  // Máximo
  { wch: 10 },  // Mínimo
  { wch: 12 },  // Existencia
  { wch: 12 },  // Situación
];

XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");

// Hoja 2: Instrucciones
const instrucciones = [
  { "Campo": "Código", "Obligatorio": "SÍ", "Formato": "PROD-00001", "Descripción": "Código único del producto. Formato: PROD-XXXXX" },
  { "Campo": "Descripción", "Obligatorio": "SÍ", "Formato": "Texto libre", "Descripción": "Nombre completo del producto" },
  { "Campo": "Tipo Inventario", "Obligatorio": "SÍ", "Formato": "Texto", "Descripción": "Tipo de inventario (ej: Mercancía, Materia Prima, Suministro)" },
  { "Campo": "Categoría", "Obligatorio": "SÍ", "Formato": "Texto", "Descripción": "Categoría del producto (ej: Estructura, Acabados, Eléctrica)" },
  { "Campo": "Grupo", "Obligatorio": "SÍ", "Formato": "Texto", "Descripción": "Grupo dentro de la categoría (ej: Concreto, Acero, Pintura)" },
  { "Campo": "Sub-Grupo", "Obligatorio": "NO", "Formato": "Texto", "Descripción": "Sub-grupo más específico (ej: Cemento, Varillas, Interior)" },
  { "Campo": "Unidad de Medida", "Obligatorio": "SÍ", "Formato": "Texto", "Descripción": "Unidad de medida (ej: Unidad, Saco, Metro, Galón, Rollo)" },
  { "Campo": "Último Costo", "Obligatorio": "NO", "Formato": "Número (2 decimales)", "Descripción": "Último costo unitario en pesos. Ej: 350.00" },
  { "Campo": "Máximo", "Obligatorio": "NO", "Formato": "Número", "Descripción": "Cantidad máxima en inventario (alerta de sobrestock)" },
  { "Campo": "Mínimo", "Obligatorio": "NO", "Formato": "Número", "Descripción": "Cantidad mínima en inventario (alerta de reorden)" },
  { "Campo": "Existencia", "Obligatorio": "NO", "Formato": "Número", "Descripción": "Cantidad actual en existencia. Por defecto: 0" },
  { "Campo": "Situación", "Obligatorio": "NO", "Formato": "Activo / Inactivo", "Descripción": "Estado del producto. Por defecto: Activo" },
];

const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);

wsInstrucciones['!cols'] = [
  { wch: 18 },
  { wch: 14 },
  { wch: 22 },
  { wch: 60 },
];

XLSX.utils.book_append_sheet(wb, wsInstrucciones, "Instrucciones");

// Hoja 3: Valores de Referencia
const referencias = [
  { "Tipo": "Tipo Inventario", "Valores Sugeridos": "Mercancía, Materia Prima, Suministro, Herramienta, Equipo" },
  { "Tipo": "Categoría", "Valores Sugeridos": "Estructura, Acabados, Instalaciones Eléctricas, Instalaciones Sanitarias, Carpintería, Herrería, Impermeabilización, Seguridad" },
  { "Tipo": "Unidad de Medida", "Valores Sugeridos": "Unidad, Saco, Metro Cuadrado, Metro Cúbico, Metro Lineal, Kilogramo, Galón, Rollo, Cubeta, Par, Juego, Libra" },
  { "Tipo": "Situación", "Valores Sugeridos": "Activo, Inactivo, Descontinuado" },
];

const wsReferencias = XLSX.utils.json_to_sheet(referencias);

wsReferencias['!cols'] = [
  { wch: 18 },
  { wch: 90 },
];

XLSX.utils.book_append_sheet(wb, wsReferencias, "Valores de Referencia");

// Guardar archivo
const outputPath = path.join(__dirname, '..', 'Plantilla_Productos_GestionInventario.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Plantilla generada: ${outputPath}`);
console.log(`📄 Hojas: Productos (con 3 ejemplos), Instrucciones, Valores de Referencia`);
