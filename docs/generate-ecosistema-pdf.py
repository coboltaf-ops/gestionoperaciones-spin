#!/usr/bin/env python3
"""
Generador PDF del Ecosistema de Software Empresarial - SISTECH
Replica de la pagina /tour de gestioninventario en formato PDF.
"""

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image,
    Table, TableStyle, KeepTogether, PageTemplate, Frame, NextPageTemplate
)
from datetime import date
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT = os.path.join(OUT_DIR, "ECOSISTEMA_SISTECH.pdf")

# === Paleta ===
DARK_BG      = HexColor("#0a0e1a")
NAVY         = HexColor("#0c1a3d")
BLUE         = HexColor("#1e3a8a")
LIGHT_BLUE   = HexColor("#3b82f6")
PURPLE       = HexColor("#8b5cf6")
GREEN        = HexColor("#10b981")
AMBER        = HexColor("#f59e0b")
PINK         = HexColor("#ec4899")
ORANGE       = HexColor("#f97316")
CYAN         = HexColor("#06b6d4")
TEXT_WHITE   = HexColor("#ffffff")
TEXT_GRAY    = HexColor("#9ca3af")
TEXT_DARK    = HexColor("#1f2937")
BG_CARD      = HexColor("#1a2238")

# === Datos del ecosistema (replica de src/app/tour/data.ts) ===
SISTEMAS = [
    {
        "id": "crm-comercial",
        "nombre": "CRM Comercial",
        "subtitulo": "Gestion Comercial y Ventas",
        "icon": "#",
        "color": LIGHT_BLUE,
        "descripcion": "CRM completo para gestionar todo el ciclo comercial: desde la captacion de prospectos hasta el cierre de ventas, con pipeline visual, cotizaciones, email marketing y automatizaciones.",
        "highlights": ["Pipeline de Ventas", "Email Marketing", "Automatizaciones", "PQRS Publico"],
        "modulos": [
            ("Dashboard", "Panel ejecutivo con metricas clave del negocio.", ["KPIs: Empresas, Contactos, Oportunidades, Cotizaciones, PQRS", "Pipeline de oportunidades por etapa con montos", "Resumen de PQRS por tipo", "Navegacion rapida a cualquier modulo"]),
            ("Clientes (Empresas)", "Directorio completo de empresas cliente con seguimiento y documentos.", ["Ficha completa: NIT, razon social, actividad, ubicacion", "Codigo de acceso publico para PQRS", "Panel de seguimiento con historial", "Gestion de documentos adjuntos", "Reportes con filtros por situacion y ciudad"]),
            ("Contactos", "Personas de contacto vinculadas a empresas con nivel de influencia.", ["Datos: cargo, departamento, telefono, email, cumpleanos", "Nivel de influencia para priorizacion", "Contacto principal por empresa", "Panel de seguimiento y documentos"]),
            ("Productos / Servicios", "Catalogo de productos y servicios con precios para cotizaciones.", ["Unidad de medida configurable", "Precios por producto", "Estado Activo/Inactivo"]),
            ("Oportunidades", "Pipeline de ventas con etapas, probabilidad y valor estimado.", ["5 etapas: Prospeccion, Calificacion, Propuesta, Negociacion, Cierre", "Monto estimado y probabilidad (25%, 50%, 75%+)", "Responsable y cliente vinculados", "Estados: Abierta, En Negociacion, Ganada, Perdida", "Seguimiento con historial completo"]),
            ("Cotizaciones", "Generacion de cotizaciones profesionales con lineas de detalle.", ["Multi-linea con productos, cantidades y precios", "Calculo automatico de descuentos e IVA", "Condiciones de pago y moneda", "Envio por email al cliente", "Estados: Borrador, Enviada, Aprobada", "PDF profesional con logo"]),
            ("Prospectos", "Captacion de leads desde formularios web publicos.", ["Formulario publico para captacion web", "Origen: Web, Telefono, Referido", "Importacion de prospectos externos", "Estados: Nuevo, Contactado, Calificado"]),
            ("PQRS", "Peticiones, Quejas, Reclamos y Sugerencias con formulario publico.", ["Formulario publico con codigo de acceso del cliente", "Tipos: Peticion, Queja, Reclamo, Sugerencia", "Prioridad: Baja, Media, Alta", "Asignacion de responsable y seguimiento"]),
            ("Tareas", "Asignacion y seguimiento de tareas con vista Kanban.", ["Vista Kanban con drag and drop", "Asignador vs. Ejecutor con fechas limite", "Notificacion por email al ejecutor", "Estados: Pendiente, En Proceso, Completada, Vencida"]),
            ("Email Marketing", "Campanas de email masivo con disenador de plantillas.", ["Multiples destinatarios: Clientes, Contactos, Prospectos", "Editor HTML con imagenes", "Biblioteca de plantillas reutilizables", "Estados: Borrador, Enviando, Enviada"]),
            ("Disenador de Correos", "Constructor visual de plantillas de email profesionales.", ["Diseno visual tipo WYSIWYG", "Biblioteca de imagenes", "Plantillas guardadas y reutilizables"]),
            ("Automatizaciones", "Flujos de trabajo automatizados basados en reglas y triggers.", ["Triggers: Registro creado, estado cambiado, programado", "Condiciones con AND/OR multiples", "Acciones: Enviar email, actualizar campo, crear registro", "Historial de ejecucion"]),
            ("Correos Enviados", "Log completo de todas las comunicaciones enviadas.", ["Historial con rastreo de apertura", "Vinculacion con orden o cotizacion"]),
            ("Configuracion", "Datos empresa, usuarios, permisos, modulos y referencias.", ["Usuarios con roles y permisos", "Tablas de referencia", "Modulos activables"]),
        ],
    },
    {
        "id": "crm-gtm",
        "nombre": "CRM Grupo GTM",
        "subtitulo": "CRM Empresarial con Base de Datos en la Nube",
        "icon": "@",
        "color": PURPLE,
        "descripcion": "CRM empresarial con datos persistentes en Supabase PostgreSQL. Gestion completa del ciclo de vida del cliente con tickets de soporte, proyectos, importacion masiva desde Excel y agente IA conversacional.",
        "highlights": ["Supabase PostgreSQL", "Tickets Soporte", "Importar Excel", "Agente IA"],
        "modulos": [
            ("Dashboard", "Panel con KPIs y 4 graficos analiticos en tiempo real.", ["5 KPIs: Clientes, Contactos, Oportunidades, Tareas, Tickets", "Oportunidades por situacion con montos", "Tareas por estado", "Tickets por prioridad (donut)", "Clientes por ciudad (barras)"]),
            ("Empresa", "Gestion de entidades corporativas con logo.", ["NIT, correo, representante legal", "Logo con preview", "Multiples empresas"]),
            ("Clientes", "Base de datos con integridad referencial en PostgreSQL.", ["Ficha con tipo de cliente y situacion", "Datos en Supabase PostgreSQL", "Formulario multi-seccion", "Exportacion PDF/Excel/CSV"]),
            ("Contactos", "Personas vinculadas a clientes con nivel de influencia.", ["Departamento, cargo, nivel de influencia", "Vinculacion directa con empresa", "Server Actions seguros"]),
            ("Oportunidades", "Pipeline persistente con montos por moneda.", ["Adjudicada, En Proceso, Ganada, Perdida, Cerrada", "Montos con colores por estado", "Datos persistentes en la nube"]),
            ("Tareas", "Doble vista: tabla y Kanban.", ["Vista tabla y Kanban alternables", "Estados con colores", "Asignacion con paginacion"]),
            ("Tickets de Soporte", "Sistema de tickets con priorizacion.", ["Prioridades: Baja, Media, Alta, Critica", "Categorizacion por tipo de incidencia", "Estadisticas en dashboard"]),
            ("Proyectos", "Gestion de proyectos con estado y seguimiento.", ["Creacion y seguimiento", "Estado vinculado a referencia", "Detalle con fechas"]),
            ("Agente IA", "Asistente conversacional con voz.", ["Chat por texto y voz en espanol", "Consultas sobre datos del CRM", "Respuestas en tiempo real"]),
            ("Importar Excel", "Importacion masiva desde archivos Excel.", ["Multiples modulos soportados", "Validacion durante importacion", "Procesamiento por lotes"]),
            ("Email Marketing", "Campanas con disenador y plantillas.", ["Destinatarios multiples", "Disenador visual", "Seguimiento de estado"]),
            ("Automatizaciones", "Reglas de automatizacion para procesos.", ["Triggers y condiciones personalizables", "Acciones automaticas", "Activacion/desactivacion"]),
            ("Configuracion", "16 tablas de referencia + usuarios + permisos.", ["16 tablas referenciales", "Usuarios con permisos", "Modulos activables", "Personal comercial"]),
        ],
    },
    {
        "id": "gestion-inventario",
        "nombre": "Gestion de Inventario",
        "subtitulo": "Control de Inventario, Compras y Produccion",
        "icon": "I",
        "color": GREEN,
        "descripcion": "Sistema integral para controlar inventario, compras, produccion y operaciones. Productos con serializacion, multiples bodegas, transferencias, formulas de produccion, centros de costo y asistente IA con voz.",
        "highlights": ["22 Modulos", "Produccion", "Multi-Bodega", "Asistente IA"],
        "modulos": [
            ("Dashboard", "Indicadores clave de inventario en tiempo real.", ["KPIs: Productos, Proveedores, Ordenes, Recepciones, Bodegas", "Unidades en stock, valor total, bajo minimo", "Ordenes por estado con montos", "Asistente de voz integrado"]),
            ("Productos", "Catalogo con codigo automatico y reportes avanzados.", ["Codigo PROD-00001 con validacion de duplicados", "Tipo Inventario, Categoria, Grupo, Sub-Grupo", "Existencias con min/max y ultimo costo", "Codigos de barras y serializacion", "Reportes PDF/Excel", "Busqueda por voz"]),
            ("Proveedores", "Directorio con contacto y clasificacion.", ["Identificacion, actividad, contacto, ciudad, pais", "Estados: Activo, Bloqueado, Inactivo", "Referencias con notas", "Reportes y busqueda por voz"]),
            ("Ordenes de Compra", "Creacion y envio con calculo de impuestos.", ["Numeracion OC-00001", "Multi-linea con subtotales e IVA", "Envio por email al proveedor", "Pendiente a Aprobada a Recibida a Rechazada", "PDF con logo", "Rastreo de correos"]),
            ("Recepcion de Facturas", "Recepcion parcial o total contra ordenes.", ["Recepcion linea por linea", "Monitoreo recibido vs. pendiente", "Actualizacion automatica de costos"]),
            ("Bodegas", "Almacenes con movimientos y saldos.", ["Registro con ubicacion y contacto", "Historial: Entrada/Salida/Ajuste", "Saldos por bodega y producto", "Activa, Mantenimiento, Cerrada"]),
            ("Transferencias", "Traslados entre bodegas con aprobacion.", ["TRF-00001 multi-linea", "Bodega origen y destino", "Borrador a Aprobada a Completada", "PDF con firmas"]),
            ("Salidas de Almacen", "Salidas con centro de costo y autorizador.", ["Deduccion automatica de inventario", "Centro de costo", "Flujo de aprobacion", "PDF estandarizado"]),
            ("Ajustes de Inventario", "Correcciones con clasificacion y motivo.", ["Adicion o sustraccion", "Bodega y producto", "Aprobacion con autorizador", "PDF/Excel"]),
            ("Carga Inicial", "Carga masiva al arrancar una bodega.", ["Multi-linea con cantidades y costos", "CII-00001", "Bodega destino", "PDF con firma"]),
            ("Formulas de Produccion", "Recetas de materias primas por producto terminado.", ["FORM-00001", "Multi-ingrediente", "Solo productos tipo Producto Terminado", "Activa/Inactiva"]),
            ("Ordenes de Produccion", "Ordenes desde formulas con requerimientos.", ["Generacion desde formula", "Multiplicador de ingredientes", "Verificacion de stock", "Pendiente a En Proceso a Completada"]),
            ("Ejecucion de Produccion", "Consumo real y confirmacion de fabricacion.", ["Consumo con ajuste", "Deduccion de materias primas", "Incremento de producto terminado", "Verificacion de stock"]),
            ("Ajustes Materia Prima", "Entrada/salida por dano, perdida o pruebas.", ["AMP-00001", "Motivo documentado", "Inventario en tiempo real", "Responsable"]),
            ("Centros de Costo", "Estructura para asignar gastos de material.", ["Codigo y descripcion", "Activo/Inactivo", "PDF/Excel", "Usado en Salidas"]),
            ("Tareas", "Asignacion con vista Kanban.", ["Kanban drag and drop", "Asignador vs. Ejecutor", "Email al ejecutor", "Pendiente, En Proceso, Completada, Vencida"]),
            ("Personal Empresa", "Directorio de empleados.", ["Nombre, email, telefono", "Prevencion de duplicados", "Integracion con Tareas"]),
            ("Ordenes de Pedido", "Solicitudes con envio por correo.", ["Multi-linea", "Proveedor y bodega", "Envio por email", "Correos integrados"]),
            ("Correos Enviados", "Log de comunicaciones del sistema.", ["Rastreo: Enviado / Abierto", "Vinculacion con orden", "Busqueda avanzada"]),
            ("Agente IA", "Asistente con reconocimiento de voz.", ["Voz en espanol e ingles", "Sintesis de texto", "Inventario, ordenes, tareas", "Historial de conversacion"]),
            ("Configuracion", "Empresa, usuarios, permisos, modulos, referencias.", ["Logo para PDFs y correos", "Servidor de correo", "Roles y permisos por modulo", "Modulos activables", "Tablas de referencias"]),
        ],
    },
    {
        "id": "calzado-ropa",
        "nombre": "Calzado y Ropa",
        "subtitulo": "Inventario Retail con Variantes y Punto de Venta",
        "icon": "R",
        "color": AMBER,
        "descripcion": "Sistema retail especializado en calzado y ropa. Variantes de talla y color, SKU unico, codigo de barras, punto de venta con multiples metodos de pago y gestion multi-bodega.",
        "highlights": ["Variantes Talla/Color", "Punto de Venta", "Codigos de Barras", "Multi-Bodega"],
        "modulos": [
            ("Dashboard", "Metricas de stock, valor y alertas.", ["Unidades en stock y valor total", "Variantes bajo minimo", "Ordenes pendientes", "Bodegas activas"]),
            ("Productos con Variantes", "Catalogo con talla/color y SKU automatico.", ["Codigo PRD-00001", "Variantes por color + talla", "SKU: PRD-00001-BLA-38", "Codigo de barras por variante", "Stock, costo y precio por variante", "Min/max por variante", "Tipo: Nino, Nina, Hombre, Mujer, Unisex", "Categoria: Calzado, Ropa, Accesorios"]),
            ("Punto de Venta (POS)", "Interfaz de venta rapida con impuestos.", ["Seleccion por variante", "Multiples metodos de pago", "Calculo de impuestos", "Impresion de recibo", "Cierre de caja diario"]),
            ("Clientes", "Base de datos para ventas y pedidos.", ["Contacto completo", "Tipo: minorista, mayorista", "Activo/Inactivo"]),
            ("Pedidos de Cliente", "Ordenes de cliente con seguimiento.", ["Estado del pedido", "Informacion de entrega", "Cumplimiento"]),
            ("PQRS", "Peticiones, Quejas, Reclamos y Sugerencias.", ["Abierto, En Proceso, Cerrado", "Seguimiento y respuesta", "Historial por cliente"]),
            ("Proveedores", "Directorio de proveedores.", ["Contacto y referencias", "Actividad y ubicacion", "Estados y reportes"]),
            ("Ordenes de Compra", "Compras con detalle por variante.", ["Desglose color/talla/cantidad", "Flujo de aprobacion", "Recepcion parcial/total", "Unidad: Par o Unidad"]),
            ("Recepcion de Facturas", "Ingreso a bodega contra ordenes.", ["Parcial o completa", "Control de calidad", "Stock automatico"]),
            ("Bodegas", "Multiples almacenes con saldos.", ["Saldos por bodega y variante", "Activa, Mantenimiento, Cerrada"]),
            ("Transferencias", "Traslados con detalle de variantes.", ["Origen y destino", "Aprobacion", "Trazabilidad completa"]),
            ("Salidas de Almacen", "Salidas controladas.", ["Deduccion de inventario", "Centro de costo", "Autorizador"]),
            ("Ajustes de Inventario", "Correcciones por conteo, dano o perdida.", ["Adicion o sustraccion", "Motivo documentado", "Autorizacion requerida"]),
            ("Carga Inicial", "Carga masiva de inventario.", ["Importacion desde Excel", "Validacion", "Bodega destino"]),
            ("Configuracion", "Empresa, usuarios, referencias, modulos.", ["20+ tablas incluyendo colores y tallas", "Etiquetas con codigo de barras/QR", "Roles y permisos", "Modulos activables"]),
        ],
    },
    {
        "id": "portal-inmobiliario",
        "nombre": "Portal Inmobiliario",
        "subtitulo": "Gestion de Propiedades y Catalogo Publico",
        "icon": "P",
        "color": PINK,
        "descripcion": "Portal inmobiliario con catalogo publico para compradores y panel administrativo. Propiedades con galeria, clientes con presupuesto, equipo comercial por zonas, cotizaciones, contratos y busqueda por voz.",
        "highlights": ["Catalogo Publico", "Galeria Fotos", "Contratos", "Busqueda por Voz"],
        "modulos": [
            ("Catalogo Publico", "Portal web sin login para explorar propiedades.", ["Listado sin autenticacion", "Filtros: tipo, ciudad, zona, modalidad", "Ficha detallada con galeria", "Diseno responsive"]),
            ("Dashboard", "Metricas de propiedades y operaciones.", ["Disponibles, en venta, en arriendo", "Comerciales activos", "Cotizaciones y contratos", "Propiedades por estado"]),
            ("Propiedades", "Inmuebles con galeria y ficha PDF.", ["Tipos: Apartamento, Casa, Oficina, Local, Lote, Bodega", "Venta, Alquiler o Ambos", "Galeria hasta 5 imagenes", "Area, habitaciones, banos, parqueaderos", "Ficha PDF profesional", "Disponible, Vendida, Reservada, Alquilada"]),
            ("Comerciales", "Asesores inmobiliarios por zona.", ["Nombre, email, cargo, departamento", "Zonas asignadas", "Foto con compresion", "Activo/Inactivo"]),
            ("Clientes / Prospectos", "Compradores con presupuesto y preferencias.", ["Cliente o Prospecto", "Interes: Compra o Alquiler", "Presupuesto min/max con moneda", "Ciudad, zona y tipo preferido", "Asesor asignado"]),
            ("Cotizaciones", "Ofertas con envio por email.", ["Cliente + propiedad + asesor", "Precio y condiciones", "Envio por email", "Pendiente, Aceptada, Rechazada"]),
            ("Contratos", "Contratos de venta y alquiler con PDF.", ["Tipo: Venta o Alquiler", "Monto, duracion, fechas", "Condiciones y observaciones", "Multiples documentos adjuntos", "PDF generado", "Borrador, Vigente, Cancelado"]),
            ("Solicitudes", "Consultas de interesados.", ["Datos del solicitante y mensaje", "Propiedad vinculada", "Asesor con notas", "Nueva, En Revision, Respondida, Cerrada"]),
            ("Configuracion", "Monedas, tipos, ciudades, zonas.", ["Monedas con simbolos", "Tipos de propiedad", "Ciudades y zonas", "Datos de empresa"]),
        ],
    },
    {
        "id": "homeux",
        "nombre": "HomeUX",
        "subtitulo": "Gestion de Servicios del Hogar",
        "icon": "H",
        "color": ORANGE,
        "descripcion": "Sistema para empresas de servicios del hogar. Ciclo completo desde solicitud hasta cotizacion, con catalogo de productos, personal tecnico con habilidades y certificaciones.",
        "highlights": ["Solicitudes", "Cotizaciones", "Personal Tecnico", "Habilidades"],
        "modulos": [
            ("Dashboard", "Metricas de solicitudes, clientes y personal.", ["Solicitudes nuevas y en proceso", "Clientes activos", "Cotizaciones aprobadas", "Personal activo"]),
            ("Solicitudes de Servicio", "Registro con tipo de trabajo e imagenes.", ["Codigo SOL-00001", "Tipo de trabajo configurable", "Datos del cliente y ubicacion", "Imagenes adjuntas", "Nueva a En Proceso a Completada a Cancelada", "PDF/Excel/Impresion"]),
            ("Clientes / Prospectos", "Base de datos con datos de vivienda.", ["Codigo CLI-00001", "Datos personales y contacto", "Tipo de vivienda, urbanizacion", "Estado civil y situacion", "Foto de perfil"]),
            ("Productos y Materiales", "Catalogo con unidades variadas.", ["Codigo PROD-00001", "Precio unitario", "Unidades: m2, litro, galon, kg, rollo, caja, servicio", "Activo/Inactivo"]),
            ("Cotizaciones", "Presupuestos con lineas de detalle.", ["Codigo COT-00001", "Vinculacion con cliente y solicitud", "Lineas con productos y cantidades", "Precio auto-poblado", "Calculo de totales", "Pendiente, Aprobada, Rechazada"]),
            ("Personal Tecnico", "Trabajadores con habilidades y formacion.", ["Codigo PER-00001", "Tipo: Persona o Empresa", "Formacion y capacitacion", "Seleccion multiple de habilidades", "Experiencia previa", "Foto y referencias"]),
            ("Configuracion", "11 tablas de referencia.", ["Paises y ciudades", "Tipos de trabajo y vivienda", "Identificaciones y estados civiles", "Formaciones y habilidades"]),
        ],
    },
    {
        "id": "portales-publicos",
        "nombre": "Portales Publicos",
        "subtitulo": "Formularios y Catalogos sin Login - Conectados al Admin",
        "icon": "W",
        "color": CYAN,
        "descripcion": "Paginas publicas accesibles sin autenticacion que alimentan directamente los sistemas administrativos. Captacion de prospectos, atencion al cliente via PQRS, y catalogo inmobiliario con solicitudes de contacto.",
        "highlights": ["Sin Login", "Formularios Publicos", "Catalogo Web", "Conectados al CRM"],
        "modulos": [
            ("Formulario de Prospectos", "Formulario web publico para que cualquier persona envie sus datos e interes comercial. Los prospectos llegan al CRM Comercial para seguimiento.", ["Campos: Nombre, Apellido, Empresa, Correo, Movil, Requerimiento", "Validacion en tiempo real con feedback visual", "Pantalla de exito con confirmacion", "Email automatico de confirmacion al prospecto via SMTP", "Los datos se almacenan como prospectos externos", "El admin los importa al CRM con codigo PRS-XXXXX", "Origen marcado como Formulario Web", "Estado inicial: Sin Contactar"]),
            ("PQRS Publico", "Sistema de Peticiones, Quejas, Reclamos y Sugerencias para clientes existentes. Requiere codigo de acceso unico por cliente.", ["Paso 1: Validacion con codigo de acceso del cliente (6-10 caracteres)", "Paso 2: Formulario PQRS con datos del cliente auto-poblados", "Tipos con iconos: Peticion, Queja, Reclamo, Sugerencia", "Prioridad con colores: Baja (verde), Media (amarillo), Alta (naranja), Urgente (rojo)", "Campos: Fecha aviso, hora, persona que avisa, movil, detalle", "Genera numero de radicado unico: RAD-YYYYMMDD-0001", "El cliente usa el radicado para dar seguimiento", "El admin importa los PQRS al CRM para gestion interna", "Puede enviar multiples PQRS sin re-validar el codigo"]),
            ("Portal Inmobiliario - Inicio", "Landing page publica del portal de propiedades con estadisticas y propiedades destacadas.", ["Hero con llamada a la accion Ver Propiedades", "Estadisticas en vivo: propiedades disponibles, ciudades, tipos, zonas", "Grid de 6 propiedades destacadas con imagen, tipo, precio y specs", "Cada tarjeta muestra: habitaciones, banos, metros cuadrados", "Link directo a ficha detallada de cada propiedad", "Diseno responsive para moviles y tablets"]),
            ("Portal Inmobiliario - Catalogo", "Catalogo completo y filtrable de todas las propiedades disponibles, sin necesidad de login.", ["Busqueda libre por nombre, direccion, ciudad o codigo", "Filtro por tipo de propiedad", "Filtro por ciudad/municipio", "Filtro por zona (dinamico segun ciudad seleccionada)", "Filtro por modalidad: Venta, Alquiler, Ambos", "Boton Limpiar filtros para reiniciar", "Contador de resultados en tiempo real", "Grid responsive: 1/2/3 columnas segun pantalla", "Tarjetas con imagen, badge de tipo, precio y caracteristicas"]),
            ("Portal Inmobiliario - Ficha de Propiedad", "Pagina detallada de cada propiedad con galeria de fotos, especificaciones, asesor asignado y formulario de contacto.", ["Galeria de imagenes con thumbnails navegables", "Badges de tipo y modalidad (Venta/Alquiler)", "Precio de venta y/o alquiler con moneda", "Caracteristicas: area m2, habitaciones, banos, parqueaderos, balcones", "Amenidades y descripcion completa", "Tarjeta del asesor asignado con foto, telefono y email", "Formulario Te interesa esta propiedad?", "Genera solicitud automatica (SOL-00001) vinculada a la propiedad", "Se asigna al asesor de la propiedad automaticamente", "Pantalla de exito con confirmacion"]),
        ],
    },
]

CAPACIDADES = [
    ("PDF Profesional", "Documentos con logo, membrete y firmas"),
    ("Reportes Excel", "Exportacion con filtros y totales"),
    ("Impresion", "Vista optimizada para impresora"),
    ("Permisos", "Leer, Registrar, Editar, Eliminar por modulo"),
    ("Email Integrado", "Envio de documentos con rastreo"),
    ("Busqueda por Voz", "Reconocimiento de voz en espanol e ingles"),
    ("Agente IA", "Consultas inteligentes por voz y texto"),
    ("Modulos On/Off", "El admin activa solo lo que necesita"),
]

# === Estilos ===
ss = getSampleStyleSheet()
style_h1 = ParagraphStyle('H1', parent=ss['Heading1'], fontSize=20, textColor=BLUE,
    spaceAfter=10, spaceBefore=14, alignment=TA_LEFT, fontName='Helvetica-Bold', leading=24)
style_sys_title = ParagraphStyle('SysTitle', parent=ss['Heading1'], fontSize=22, textColor=TEXT_WHITE,
    spaceAfter=4, spaceBefore=0, alignment=TA_LEFT, fontName='Helvetica-Bold', leading=26)
style_sys_sub = ParagraphStyle('SysSub', parent=ss['BodyText'], fontSize=11,
    spaceAfter=8, alignment=TA_LEFT, fontName='Helvetica-Oblique', leading=14)
style_h2 = ParagraphStyle('H2', parent=ss['Heading2'], fontSize=13, textColor=TEXT_WHITE,
    spaceAfter=4, spaceBefore=4, fontName='Helvetica-Bold', leading=16)
style_body_white = ParagraphStyle('BodyW', parent=ss['BodyText'], fontSize=10,
    textColor=HexColor("#cbd5e1"), alignment=TA_JUSTIFY, leading=14, spaceAfter=4, fontName='Helvetica')
style_body_dim = ParagraphStyle('BodyD', parent=ss['BodyText'], fontSize=9,
    textColor=HexColor("#94a3b8"), alignment=TA_LEFT, leading=13, spaceAfter=3, fontName='Helvetica')
style_mod_name = ParagraphStyle('ModN', parent=ss['BodyText'], fontSize=10,
    textColor=TEXT_WHITE, fontName='Helvetica-Bold', leading=13, spaceAfter=2)
style_mod_desc = ParagraphStyle('ModD', parent=ss['BodyText'], fontSize=8.5,
    textColor=HexColor("#94a3b8"), fontName='Helvetica', leading=11, spaceAfter=2)
style_feat = ParagraphStyle('Feat', parent=ss['BodyText'], fontSize=8,
    textColor=HexColor("#cbd5e1"), fontName='Helvetica', leftIndent=10, leading=11, spaceAfter=1)
style_highlight = ParagraphStyle('Hi', parent=ss['BodyText'], fontSize=9,
    textColor=TEXT_WHITE, fontName='Helvetica-Bold', alignment=TA_CENTER, leading=12)

# === Page backgrounds ===
def dark_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(DARK_BG)
    canvas.rect(0, 0, LETTER[0], LETTER[1], fill=1, stroke=0)
    # Top band
    canvas.setFillColor(BLUE)
    canvas.rect(0, LETTER[1] - 14, LETTER[0], 14, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 9); canvas.setFillColor(TEXT_WHITE)
    canvas.drawString(0.6*inch, LETTER[1] - 10, "SISTECH - Ecosistema de Software Empresarial")
    canvas.drawRightString(LETTER[0] - 0.6*inch, LETTER[1] - 10, "Presentacion Comercial")
    # Bottom footer
    canvas.setFillColor(HexColor("#475569"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(0.6*inch, 0.4*inch, f"SISTECH  |  {date.today().strftime('%B %Y')}")
    canvas.drawRightString(LETTER[0] - 0.6*inch, 0.4*inch, f"Pagina {doc.page}")
    canvas.setStrokeColor(BLUE); canvas.setLineWidth(0.3)
    canvas.line(0.6*inch, 0.55*inch, LETTER[0] - 0.6*inch, 0.55*inch)
    canvas.restoreState()

def cover_page(canvas, doc):
    canvas.saveState()
    # Degradado simulado con 3 circulos de color
    canvas.setFillColor(DARK_BG)
    canvas.rect(0, 0, LETTER[0], LETTER[1], fill=1, stroke=0)
    # Halos radiales (circulos grandes semitransparentes)
    canvas.setFillColor(HexColor("#1e40af"))
    canvas.setFillAlpha(0.35)
    canvas.circle(LETTER[0]*0.25, LETTER[1]*0.7, 4.5*inch, stroke=0, fill=1)
    canvas.setFillColor(HexColor("#7c3aed"))
    canvas.circle(LETTER[0]*0.75, LETTER[1]*0.3, 3.5*inch, stroke=0, fill=1)
    canvas.setFillColor(HexColor("#059669"))
    canvas.circle(LETTER[0]*0.5, LETTER[1]*0.5, 3*inch, stroke=0, fill=1)
    canvas.setFillAlpha(1.0)
    # Logo SISTECH
    cx, cy = LETTER[0] / 2, LETTER[1] - 2.2*inch
    canvas.setFillColor(BLUE); canvas.setStrokeColor(TEXT_WHITE); canvas.setLineWidth(2)
    canvas.roundRect(cx - 0.55*inch, cy - 0.5*inch, 1.1*inch, 1.0*inch, 0.12*inch, stroke=1, fill=1)
    canvas.setFont("Helvetica-Bold", 20); canvas.setFillColor(TEXT_WHITE)
    canvas.drawCentredString(cx, cy - 0.05*inch, "S")
    # Tagline
    canvas.setFillColor(HexColor("#60a5fa")); canvas.setFont("Helvetica-Bold", 10)
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 3.3*inch, "SISTECH")
    # Titulo
    canvas.setFont("Helvetica-Bold", 34); canvas.setFillColor(TEXT_WHITE)
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 4.1*inch, "Ecosistema de")
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 4.7*inch, "Software Empresarial")
    # Underline acento
    canvas.setStrokeColor(HexColor("#60a5fa")); canvas.setLineWidth(1.2)
    canvas.line(LETTER[0]/2 - 60, LETTER[1] - 4.85*inch, LETTER[0]/2 + 60, LETTER[1] - 4.85*inch)
    # Subtitulo con stats
    total_mod = sum(len(s["modulos"]) for s in SISTEMAS)
    canvas.setFont("Helvetica", 13); canvas.setFillColor(HexColor("#cbd5e1"))
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 5.4*inch,
        f"{len(SISTEMAS)} sistemas completos, {total_mod} modulos,")
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 5.8*inch,
        "disenados para que tu operacion funcione sin fricciones.")
    # Badges stats
    badge_y = LETTER[1] - 7*inch
    badge_data = [
        ("Sistemas", str(len(SISTEMAS))),
        ("Modulos", str(total_mod)),
        ("Exportar", "PDF/Excel"),
        ("Asistente", "IA con Voz"),
        ("Permisos", "Por Modulo"),
    ]
    bw = 1.3*inch; bh = 0.7*inch; total_w = bw * len(badge_data) + 0.15*inch * (len(badge_data)-1)
    start_x = (LETTER[0] - total_w) / 2
    for i, (label, value) in enumerate(badge_data):
        bx = start_x + i * (bw + 0.15*inch)
        canvas.setFillColor(HexColor("#1e293b")); canvas.setStrokeColor(HexColor("#334155"))
        canvas.setLineWidth(0.5)
        canvas.roundRect(bx, badge_y, bw, bh, 0.1*inch, stroke=1, fill=1)
        canvas.setFont("Helvetica-Bold", 11); canvas.setFillColor(TEXT_WHITE)
        canvas.drawCentredString(bx + bw/2, badge_y + 0.4*inch, value)
        canvas.setFont("Helvetica", 8); canvas.setFillColor(HexColor("#94a3b8"))
        canvas.drawCentredString(bx + bw/2, badge_y + 0.15*inch, label.upper())
    # Footer de portada
    canvas.setFont("Helvetica-Oblique", 10); canvas.setFillColor(HexColor("#94a3b8"))
    canvas.drawCentredString(LETTER[0]/2, 0.9*inch,
        f"Documento generado: {date.today().strftime('%B %Y').title()}")
    canvas.restoreState()

# === Helpers de contenido ===
def spacer(h=8): return Spacer(1, h)

def highlight_badge_table(highlights, color):
    """Retorna un row de badges horizontales coloreados."""
    cells = []
    for h in highlights:
        cells.append(Paragraph(f'<font color="{color.hexval()}"><b>{h}</b></font>', style_highlight))
    if not cells: return Spacer(1, 1)
    t = Table([cells], colWidths=[(6.9*inch) / len(cells)] * len(cells))
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (-1,-1), TEXT_WHITE),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#334155")),
    ]))
    return t

def system_header_block(sistema):
    """Cabecera del sistema: icono + titulo + subtitulo + descripcion + highlights."""
    color = sistema["color"]
    elements = []
    # Titulo grande con subtitulo
    elements.append(Paragraph(f'<font color="#ffffff">{sistema["nombre"]}</font>', style_sys_title))
    elements.append(Paragraph(f'<font color="{color.hexval()}">{sistema["subtitulo"]}</font>', style_sys_sub))
    elements.append(Spacer(1, 3))
    # Descripcion
    elements.append(Paragraph(sistema["descripcion"], style_body_white))
    elements.append(Spacer(1, 6))
    # Highlights
    elements.append(highlight_badge_table(sistema["highlights"], color))
    elements.append(Spacer(1, 5))
    # Stat modulos
    elements.append(Paragraph(
        f'<font color="{color.hexval()}"><b>{len(sistema["modulos"])} modulos operativos</b></font>',
        style_highlight))
    elements.append(Spacer(1, 10))
    return KeepTogether(elements)

def modulo_block(nombre, desc, features, color):
    """Bloque individual de un modulo como lista plana de flowables."""
    out = []
    out.append(Paragraph(
        f'<font color="{color.hexval()}">*</font>  <font color="#ffffff">{nombre}</font>',
        style_mod_name))
    out.append(Paragraph(desc, style_mod_desc))
    for f in features:
        out.append(Paragraph(
            f'<font color="{color.hexval()}">></font>  {f}',
            style_feat))
    out.append(Spacer(1, 5))
    return out

# === Construir documento ===
def build_content():
    story = []

    # Cover
    story.append(NextPageTemplate('content'))
    story.append(PageBreak())

    # =====================================================
    # INTRODUCCION
    # =====================================================
    story.append(Paragraph(
        '<font color="#60a5fa"><b>INTRODUCCION</b></font>',
        style_h2))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        f'El ecosistema <b>SISTECH</b> comprende {len(SISTEMAS)} sistemas empresariales '
        f'y {sum(len(s["modulos"]) for s in SISTEMAS)} modulos operativos, disenados para '
        f'integrar toda la operacion de una empresa - desde la gestion comercial y la captacion '
        f'de prospectos hasta el control de inventarios, la produccion, los servicios al hogar y '
        f'los portales publicos para atencion al cliente.',
        style_body_white))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'Cada sistema es autonomo y puede implementarse de manera independiente, pero fue '
        'disenado con criterios de diseno comunes para facilitar la adopcion por parte del '
        'usuario final: mismo patron de navegacion, mismas capacidades transversales '
        '(reportes, permisos, exportaciones, correos, asistente IA con voz) y la misma '
        'experiencia visual coherente en todos los productos.',
        style_body_white))
    story.append(Spacer(1, 14))

    # Tabla resumen de sistemas
    story.append(Paragraph(
        '<font color="#60a5fa"><b>LOS {n} SISTEMAS DEL ECOSISTEMA</b></font>'.format(n=len(SISTEMAS)),
        style_h2))
    story.append(Spacer(1, 4))

    resumen_rows = [["Sistema", "Enfoque", "Modulos"]]
    for s in SISTEMAS:
        resumen_rows.append([s["nombre"], s["subtitulo"], str(len(s["modulos"]))])
    resumen_table = Table(resumen_rows, colWidths=[1.8*inch, 4.0*inch, 0.8*inch])
    resumen_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BLUE),
        ('TEXTCOLOR',  (0,0), (-1,0), TEXT_WHITE),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 9.5),
        ('ALIGN',      (0,0), (-1,0), 'CENTER'),
        ('ALIGN',      (-1,0), (-1,-1), 'CENTER'),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR',  (0,1), (-1,-1), HexColor("#cbd5e1")),
        ('BACKGROUND', (0,1), (-1,-1), HexColor("#1e293b")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor("#1e293b"), HexColor("#0f172a")]),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, HexColor("#334155")),
        ('LEFTPADDING',(0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING',(0,0), (-1,-1), 7),
    ]))
    story.append(resumen_table)
    story.append(Spacer(1, 10))

    # Capacidades transversales resumen
    story.append(Paragraph(
        '<font color="#60a5fa"><b>CAPACIDADES TRANSVERSALES</b></font>',
        style_h2))
    story.append(Paragraph(
        'Presentes en todos los sistemas del ecosistema:',
        style_body_dim))
    story.append(Spacer(1, 4))

    # Grid 4x2
    cap_rows = []
    for i in range(0, len(CAPACIDADES), 4):
        row = []
        for j in range(4):
            if i + j < len(CAPACIDADES):
                title, desc = CAPACIDADES[i + j]
                row.append(Paragraph(
                    f'<font color="#ffffff"><b>{title}</b></font><br/>'
                    f'<font color="#94a3b8" size="8">{desc}</font>',
                    ParagraphStyle('cap', fontSize=9, leading=12, alignment=TA_CENTER)))
            else:
                row.append("")
        cap_rows.append(row)
    cap_table = Table(cap_rows, colWidths=[1.6*inch]*4)
    cap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor("#1e293b")),
        ('BOX', (0,0), (-1,-1), 0.3, HexColor("#334155")),
        ('INNERGRID', (0,0), (-1,-1), 0.3, HexColor("#334155")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(cap_table)

    # =====================================================
    # UN SISTEMA POR SECCION
    # =====================================================
    for idx, sistema in enumerate(SISTEMAS, 1):
        story.append(PageBreak())
        # Banda lateral del color del sistema (titulo de seccion)
        story.append(Paragraph(
            f'<font color="{sistema["color"].hexval()}"><b>SISTEMA {idx} DE {len(SISTEMAS)}</b></font>',
            ParagraphStyle('secnum', fontSize=9, fontName='Helvetica-Bold',
                           textColor=sistema["color"], spaceAfter=2)))
        story.append(system_header_block(sistema))

        # Modulos en lista simple (1 columna, legible y sin fallos de layout)
        for m in sistema["modulos"]:
            story.extend(modulo_block(m[0], m[1], m[2], sistema["color"]))

    # =====================================================
    # CIERRE
    # =====================================================
    story.append(PageBreak())
    story.append(Paragraph(
        '<font color="#60a5fa"><b>ESTO ES SOLO EL INICIO</b></font>',
        style_h2))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Este ecosistema es producto de los anos de experiencia en el <b>Analisis y Diseno '
        'de Sistemas de Informacion</b>, experiencia en el area de <b>Mercadeo, Ventas y '
        'Servicio al Cliente</b> y en varios procesos de la <b>Gestion Administrativa y '
        'Operativa</b> de las Empresas.',
        style_body_white))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'Todo lo que se aprecia fue elaborado en compania de la <b>Inteligencia Artificial</b> '
        'y herramientas profesionales que garantizan la estabilidad y buenos resultados de los '
        'Aplicativos.',
        style_body_white))
    story.append(Spacer(1, 14))

    total_mod = sum(len(s["modulos"]) for s in SISTEMAS)
    story.append(Paragraph(
        f'<font color="#60a5fa" size="14"><b>{len(SISTEMAS)} sistemas   -   {total_mod} modulos   '
        f'-   Powered by SISTECH</b></font>',
        ParagraphStyle('final', alignment=TA_CENTER, fontSize=14, spaceAfter=12,
                       fontName='Helvetica-Bold')))

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        '<font color="#94a3b8" size="9">Elaborado por SISTECH - Sistemas Inteligentes de Tecnologia</font>',
        ParagraphStyle('lastline', alignment=TA_CENTER, fontSize=9)))

    return story

# === Build ===
def build():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=LETTER,
        leftMargin=0.6*inch, rightMargin=0.6*inch,
        topMargin=0.5*inch, bottomMargin=0.6*inch,
        title="Ecosistema SISTECH - Software Empresarial",
        author="SISTECH",
        subject="Presentacion comercial del ecosistema de sistemas SISTECH",
    )

    cover_frame = Frame(0, 0, LETTER[0], LETTER[1], id='cover')
    content_frame = Frame(0.6*inch, 0.6*inch, LETTER[0]-1.2*inch, LETTER[1]-1.2*inch, id='content')

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=cover_frame, onPage=cover_page),
        PageTemplate(id='content', frames=content_frame, onPage=dark_page),
    ])

    doc.build(build_content())
    print(f"PDF generado: {OUTPUT}")
    print(f"Tamano: {os.path.getsize(OUTPUT) // 1024} KB")

if __name__ == "__main__":
    build()
