#!/usr/bin/env python3
"""
Generador del Manual del Sistema de Gestion de Inventario
INVEN
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
from reportlab.platypus.tableofcontents import TableOfContents
from datetime import date
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(OUT_DIR, "screenshots")
OUTPUT = os.path.join(OUT_DIR, "MANUAL_SISTEMA_GESTION_INVENTARIO.pdf")

# === Paleta corporativa ===
AZUL_REY     = HexColor("#1e3a8a")
AZUL_CLARO   = HexColor("#3b82f6")
GRIS_OSCURO  = HexColor("#1f2937")
GRIS_TEXTO   = HexColor("#374151")
GRIS_CLARO   = HexColor("#f3f4f6")
ACENTO       = HexColor("#dc2626")

# === Estilos ===
ss = getSampleStyleSheet()

style_h1 = ParagraphStyle(
    'H1', parent=ss['Heading1'], fontSize=20, textColor=AZUL_REY,
    spaceAfter=14, spaceBefore=18, alignment=TA_LEFT,
    fontName='Helvetica-Bold', leading=24, keepWithNext=True
)
style_h2 = ParagraphStyle(
    'H2', parent=ss['Heading2'], fontSize=15, textColor=AZUL_REY,
    spaceAfter=10, spaceBefore=14, fontName='Helvetica-Bold', leading=18,
    keepWithNext=True
)
style_h3 = ParagraphStyle(
    'H3', parent=ss['Heading3'], fontSize=12, textColor=GRIS_OSCURO,
    spaceAfter=6, spaceBefore=10, fontName='Helvetica-Bold', leading=15,
    keepWithNext=True
)
style_body = ParagraphStyle(
    'Body', parent=ss['BodyText'], fontSize=10.5, textColor=GRIS_TEXTO,
    alignment=TA_JUSTIFY, leading=15, spaceAfter=6, fontName='Helvetica'
)
style_bullet = ParagraphStyle(
    'Bullet', parent=style_body, leftIndent=18, bulletIndent=6,
    spaceAfter=3, leading=14
)
style_caption = ParagraphStyle(
    'Caption', parent=style_body, fontSize=9, alignment=TA_CENTER,
    textColor=GRIS_OSCURO, spaceAfter=14, fontName='Helvetica-Oblique'
)
style_proc_step = ParagraphStyle(
    'ProcStep', parent=style_body, leftIndent=20, fontSize=10.5,
    spaceAfter=4
)
style_warn = ParagraphStyle(
    'Warn', parent=style_body, fontSize=10, textColor=ACENTO,
    fontName='Helvetica-Bold', spaceAfter=6
)

# === Page templates ===
def header_footer(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFillColor(AZUL_REY)
    canvas.rect(0, LETTER[1] - 0.5*inch, LETTER[0], 0.5*inch, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(0.6*inch, LETTER[1] - 0.32*inch, "MANUAL DEL SISTEMA DE GESTION DE INVENTARIO")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(LETTER[0] - 0.6*inch, LETTER[1] - 0.32*inch, "INVEN")
    # Footer
    canvas.setFillColor(GRIS_OSCURO)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(0.6*inch, 0.4*inch, f"MAN-INV-001  |  v1.0  |  {date.today().strftime('%B %Y')}")
    canvas.drawRightString(LETTER[0] - 0.6*inch, 0.4*inch, f"Pagina {doc.page}")
    canvas.setStrokeColor(AZUL_REY)
    canvas.setLineWidth(0.5)
    canvas.line(0.6*inch, 0.55*inch, LETTER[0] - 0.6*inch, 0.55*inch)
    canvas.restoreState()

def cover_page(canvas, doc):
    canvas.saveState()
    # Fondo
    canvas.setFillColor(AZUL_REY)
    canvas.rect(0, 0, LETTER[0], LETTER[1], fill=1, stroke=0)
    # Banda decorativa
    canvas.setFillColor(AZUL_CLARO)
    canvas.rect(0, LETTER[1] - 1.5*inch, LETTER[0], 0.08*inch, fill=1, stroke=0)
    canvas.rect(0, 1.2*inch, LETTER[0], 0.08*inch, fill=1, stroke=0)
    # Logo INVEN (cuadrado redondeado con texto, igual al sidebar de la app)
    cx = LETTER[0] / 2
    cy = LETTER[1] - 2.5*inch
    canvas.setFillColor(HexColor("#1e3a8a"))
    canvas.setStrokeColor(white)
    canvas.setLineWidth(2)
    canvas.roundRect(cx - 0.55*inch, cy - 0.5*inch, 1.1*inch, 1.0*inch, 0.12*inch, stroke=1, fill=1)
    canvas.setFont("Helvetica-Bold", 22)
    canvas.setFillColor(white)
    canvas.drawCentredString(cx, cy - 0.08*inch, "INVEN")
    # Titulo
    canvas.setFont("Helvetica-Bold", 30)
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 4.0*inch, "MANUAL DEL SISTEMA DE")
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 4.5*inch, "GESTION DE INVENTARIO")
    # Subtitulo
    canvas.setFont("Helvetica", 14)
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 5.2*inch, "Procedimientos Operativos para")
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 5.5*inch, "Almacenes, Compras y Bodegas")
    # Empresa
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawCentredString(LETTER[0]/2, LETTER[1] - 6.2*inch, "INVEN")
    # Datos
    canvas.setFont("Helvetica", 10)
    canvas.drawCentredString(LETTER[0]/2, 2.0*inch, "Codigo: MAN-INV-001  |  Version: 1.0")
    canvas.drawCentredString(LETTER[0]/2, 1.7*inch, f"Fecha de emision: {date.today().strftime('%B %Y').title()}")
    canvas.drawCentredString(LETTER[0]/2, 0.7*inch, "Documento de uso interno - Confidencial")
    canvas.restoreState()

# ===========================
#  DocTemplate con TOC
# ===========================
class InvenDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            text = flowable.getPlainText()
            style = flowable.style.name
            if style == 'H1':
                self.notify('TOCEntry', (0, text, self.page))
            elif style == 'H2':
                self.notify('TOCEntry', (1, text, self.page))

# ===========================
#  Helpers de contenido
# ===========================

def h1(text): return Paragraph(text, style_h1)
def h2(text): return Paragraph(text, style_h2)
def h3(text): return Paragraph(text, style_h3)
def p(text):  return Paragraph(text, style_body)
def b(text):  return Paragraph(f"&bull; {text}", style_bullet)
def step(n, text): return Paragraph(f"<b>{n}.</b> {text}", style_proc_step)
def warn(text): return Paragraph(f"&#9888; {text}", style_warn)

def img(filename, caption=None, width=6.4*inch):
    path = os.path.join(SHOTS, filename)
    if not os.path.exists(path):
        return p(f"<i>[Pantalla: {filename.replace('.png','').replace('-', ' ')}]</i>")
    im = Image(path, width=width, height=width * 0.625)
    im.hAlign = 'CENTER'
    elements = [Spacer(1, 0.1*inch), im]
    if caption:
        elements.append(Paragraph(caption, style_caption))
    else:
        elements.append(Spacer(1, 0.1*inch))
    return KeepTogether(elements)

def fields_table(rows):
    """rows: [[campo, tipo, obligatorio, descripcion], ...]"""
    data = [["Campo", "Tipo", "Obligatorio", "Descripcion"]] + rows
    t = Table(data, colWidths=[1.6*inch, 0.9*inch, 0.9*inch, 3.0*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL_REY),
        ('TEXTCOLOR',  (0,0), (-1,0), white),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 9),
        ('ALIGN',      (0,0), (-1,0), 'CENTER'),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('GRID',       (0,0), (-1,-1), 0.4, GRIS_OSCURO),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, GRIS_CLARO]),
        ('LEFTPADDING',(0,0), (-1,-1), 6),
        ('RIGHTPADDING',(0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5),
    ]))
    return t

# ===========================
#  Contenido por modulo (helper reutilizable)
# ===========================

def modulo_section(num, titulo, screenshot, proposito, procedimiento, campos, acciones, reportes=None, extra=None):
    elements = []
    elements.append(h2(f"{num}. Modulo {titulo}"))
    elements.append(h3(f"{num}.1 Proposito"))
    elements.append(p(proposito))
    elements.append(h3(f"{num}.2 Pantalla principal"))
    elements.append(img(screenshot, f"Figura {num}. Listado del modulo {titulo}."))
    elements.append(h3(f"{num}.3 Procedimiento - Crear nuevo registro"))
    for i, paso in enumerate(procedimiento, 1):
        elements.append(step(i, paso))
    if campos:
        elements.append(h3(f"{num}.4 Campos del formulario"))
        elements.append(fields_table(campos))
    if acciones:
        elements.append(h3(f"{num}.5 Acciones disponibles por registro"))
        for a in acciones:
            elements.append(b(a))
    if reportes:
        elements.append(h3(f"{num}.6 Reportes disponibles"))
        for r in reportes:
            elements.append(b(r))
    if extra:
        elements.extend(extra)
    return elements

# ===========================
#  Construir contenido
# ===========================

def build_content():
    story = []

    # === COVER ===
    story.append(NextPageTemplate('content'))
    story.append(PageBreak())

    # === FICHA DE CONTROL ===
    story.append(h1("Ficha de Control del Documento"))
    ficha_data = [
        ["Codigo", "MAN-INV-001"],
        ["Titulo", "Manual del Sistema de Gestion de Inventario"],
        ["Version", "1.0"],
        ["Fecha de emision", date.today().strftime("%d / %m / %Y")],
        ["Elaborado por", "Departamento de Sistemas - Normas y Procedimientos"],
        ["Revisado por", "Coordinacion de Almacen y Compras"],
        ["Aprobado por", "Direccion de Operaciones INVEN"],
        ["Audiencia", "Personal de Almacen, Compras, Administracion y Usuarios del sistema"],
        ["Clasificacion", "Uso interno - Confidencial"],
        ["Proxima revision", "Abril 2027"],
    ]
    ft = Table(ficha_data, colWidths=[2.0*inch, 4.4*inch])
    ft.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), AZUL_REY),
        ('TEXTCOLOR',  (0,0), (0,-1), white),
        ('FONTNAME',   (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 10),
        ('GRID',       (0,0), (-1,-1), 0.4, GRIS_OSCURO),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING',(0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING',(0,0), (-1,-1), 8),
    ]))
    story.append(ft)
    story.append(PageBreak())

    # === TABLA DE CONTENIDO ===
    story.append(h1("Tabla de Contenido"))
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle('TOC1', fontName='Helvetica-Bold', fontSize=11,
                       textColor=AZUL_REY, leftIndent=8, leading=18),
        ParagraphStyle('TOC2', fontName='Helvetica', fontSize=10,
                       textColor=GRIS_TEXTO, leftIndent=24, leading=15),
    ]
    story.append(toc)
    story.append(PageBreak())

    # ============================================================
    # PARTE I - ASPECTOS GENERALES
    # ============================================================
    story.append(h1("PARTE I - Aspectos Generales"))

    story.append(h2("1. Introduccion"))
    story.append(p(
        "El presente manual describe los procedimientos operativos del <b>Sistema de Gestion de "
        "Inventario INVEN</b>. Este documento constituye la guia oficial para el uso correcto de "
        "la herramienta por parte del personal de las areas de Almacen, Compras, "
        "Administracion y Sistemas."))
    story.append(p(
        "El sistema ha sido disenado para centralizar la operacion de inventarios de la "
        "organizacion, permitiendo administrar de forma unificada el catalogo de productos, "
        "proveedores, ordenes de compra, recepciones, bodegas, transferencias, salidas de almacen, "
        "ajustes de inventario, toma fisica, pedidos, tareas, asistente "
        "con voz y reportes gerenciales."))

    story.append(h2("2. Objetivo del Manual"))
    story.append(p(
        "Establecer los lineamientos, procedimientos y mejores practicas para el uso eficiente y "
        "estandarizado del Sistema de Gestion de Inventario, garantizando que los movimientos e "
        "informacion operativa sean registrados de manera consistente y oportuna por todos los "
        "usuarios autorizados."))
    story.append(b("Estandarizar el registro de movimientos de inventario en toda la organizacion."))
    story.append(b("Asegurar la trazabilidad de cada entrada, salida, transferencia y ajuste."))
    story.append(b("Optimizar la planeacion de compras y la reposicion de existencias."))
    story.append(b("Habilitar la generacion de reportes confiables para la toma de decisiones."))
    story.append(b("Cumplir con las politicas contables y de control interno de la empresa."))

    story.append(h2("3. Alcance"))
    story.append(p(
        "El presente manual aplica a <b>todo el personal</b> de INVEN con acceso autorizado al "
        "Sistema de Gestion de Inventario, incluyendo almacenistas, compradores, recepcionistas "
        "de mercancia, contralores de inventario y administradores del "
        "sistema."))
    story.append(p("Cubre los siguientes procesos:"))
    story.append(b("Gestion del catalogo de productos, proveedores y bodegas."))
    story.append(b("Emision, aprobacion y seguimiento de ordenes de compra."))
    story.append(b("Recepcion de facturas y actualizacion de existencias."))
    story.append(b("Transferencias entre bodegas y salidas a centros de costo."))
    story.append(b("Ajustes de inventario (fisicos y contables)."))
    story.append(b("Toma de inventario fisico y conciliacion con saldos del sistema."))
    story.append(b("Gestion de ordenes de pedido a proveedores con flujo de adjudicacion."))
    story.append(b("Gestion de tareas, personal de empresa y correos enviados."))
    story.append(b("Asistente con voz para consultas rapidas en espanol e ingles."))

    story.append(h2("4. Definiciones y Glosario"))
    glosario = [
        ["Inventario", "Conjunto de bienes, materiales y productos disponibles en la empresa."],
        ["Producto", "Articulo individual del catalogo con codigo unico, costo, unidad de medida y existencia."],
        ["Kardex", "Registro historico cronologico de movimientos de un producto (entradas, salidas, ajustes)."],
        ["Proveedor", "Persona natural o juridica que suministra productos o servicios a la empresa."],
        ["Bodega", "Ubicacion fisica donde se almacenan los productos. Cada bodega tiene sus propios saldos."],
        ["Orden de Compra (OC)", "Documento formal de compra emitido al proveedor. Define cantidad, costo y fecha."],
        ["Recepcion de Factura", "Ingreso fisico de mercancia contra una OC, actualiza existencia y costo promedio."],
        ["Transferencia", "Movimiento de productos entre dos bodegas de la misma empresa."],
        ["Salida de Almacen", "Despacho de productos desde bodega hacia un centro de costo o consumo interno."],
        ["Ajuste de Inventario", "Correccion de saldo por perdida, dano, diferencia fisica o reclasificacion."],
        ["Centro de Costo", "Unidad organizativa que consume productos. Permite costear proyectos y areas."],
        ["Toma Fisica", "Conteo presencial de existencias para conciliar con el sistema."],
        ["Costo Promedio", "Costo unitario resultante del promedio ponderado de las entradas."],
        ["Saldo", "Existencia disponible de un producto en una bodega, calculada desde movimientos."],
    ]
    table_style_data = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL_REY),
        ('TEXTCOLOR',  (0,0), (-1,0), white),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 10),
        ('GRID',       (0,0), (-1,-1), 0.4, GRIS_OSCURO),
        ('VALIGN',     (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, GRIS_CLARO]),
        ('LEFTPADDING',(0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING',(0,0), (-1,-1), 6),
    ])
    g_table = Table([["Termino", "Definicion"]] + glosario, colWidths=[1.8*inch, 4.7*inch])
    g_table.setStyle(table_style_data)
    story.append(g_table)

    story.append(h2("5. Responsabilidades por Rol"))
    roles = [
        ["Administrador", "Crear/modificar usuarios, asignar permisos, configurar tablas referenciales, activar modulos, supervisar integridad de la informacion."],
        ["Almacenista / Bodeguero", "Registrar recepciones, transferencias, salidas y ajustes. Ejecutar toma fisica."],
        ["Comprador", "Crear ordenes de compra, gestionar proveedores, seguir adjudicaciones y vencimientos."],
        ["Analista de Inventario", "Monitorear existencias, analizar movimientos, generar reportes gerenciales."],
        ["Gerencia", "Consultar dashboards, descargar reportes, monitorear indicadores operativos."],
        ["Consulta", "Acceso de solo lectura a la informacion autorizada segun su area."],
    ]
    r_table = Table([["Rol", "Responsabilidad principal"]] + roles, colWidths=[1.8*inch, 4.7*inch])
    r_table.setStyle(table_style_data)
    story.append(r_table)

    story.append(h2("6. Politica de Uso del Sistema"))
    story.append(p(
        "El acceso al Sistema de Gestion de Inventario es <b>personal e intransferible</b>. Cada "
        "usuario es responsable del manejo confidencial de su contrasena y de las acciones "
        "realizadas bajo su sesion."))
    story.append(b("La informacion contenida en el sistema es de caracter <b>confidencial</b> y propiedad de INVEN."))
    story.append(b("Todo movimiento (entrada, salida, ajuste, transferencia) debe registrarse en el momento en que ocurre."))
    story.append(b("Los ajustes de inventario deben estar respaldados por un motivo documentado y aprobado."))
    story.append(b("La toma fisica es un proceso formal que debe planearse y cerrarse en el mismo dia."))
    story.append(b("Cualquier incidencia con el sistema debe reportarse al area de Sistemas."))

    story.append(PageBreak())

    # ============================================================
    # PARTE II - ACCESO AL SISTEMA
    # ============================================================
    story.append(h1("PARTE II - Acceso al Sistema"))

    story.append(h2("7. Requisitos Tecnicos"))
    story.append(b("<b>Navegador:</b> Google Chrome, Microsoft Edge o Mozilla Firefox (version actualizada)."))
    story.append(b("<b>Conexion a internet:</b> minimo 5 Mbps."))
    story.append(b("<b>Resolucion minima recomendada:</b> 1366 x 768 pixeles."))
    story.append(b("<b>Dispositivos:</b> computador de escritorio o portatil. Interfaz responsive en tablets."))
    story.append(b("<b>Microfono:</b> requerido unicamente para el Agente de voz y busqueda por voz."))

    story.append(h2("8. Acceso por Primera Vez"))
    story.append(p("El proceso de alta inicial es ejecutado por el Administrador del sistema:"))
    story.append(step(1, "El Administrador crea el usuario en el modulo de <b>Configuracion - Gestion de Usuarios</b>."))
    story.append(step(2, "Se asignan los modulos y permisos (leer/registrar/editar/eliminar) por rol."))
    story.append(step(3, "El usuario recibe las credenciales iniciales del Administrador."))
    story.append(step(4, "En el primer ingreso se recomienda cambiar la clave inicial."))

    story.append(h2("9. Inicio y Cierre de Sesion"))
    story.append(h3("9.1 Iniciar sesion"))
    story.append(p("El acceso al sistema se realiza a traves del navegador en la URL corporativa: "
                   "<b>https://gestioninventario-two.vercel.app</b>"))
    story.append(img("01-login.png", "Figura 1. Pantalla de inicio de sesion del sistema."))
    story.append(p("Procedimiento:"))
    story.append(step(1, "Acceda a la URL corporativa en el navegador."))
    story.append(step(2, "Digite su <b>nombre de usuario</b> en el campo correspondiente."))
    story.append(step(3, "Digite su <b>clave</b>."))
    story.append(step(4, "Haga clic en el boton <b>Ingresar al Sistema</b>."))
    story.append(step(5, "El sistema lo redirigira al Dashboard principal."))

    story.append(h3("9.2 Cerrar sesion"))
    story.append(p("Para finalizar su sesion, haga clic en el boton <b>Salir</b> ubicado en la "
                   "barra superior derecha de la pantalla."))
    story.append(warn("Es obligatorio cerrar sesion al terminar la jornada o al alejarse del equipo."))

    story.append(h2("10. Cambio de Idioma"))
    story.append(p("El sistema soporta los idiomas <b>Espanol (ES)</b> e <b>Ingles (EN)</b>. Para "
                   "cambiar el idioma, utilice los botones <b>ES | EN</b> ubicados:"))
    story.append(b("En la pantalla de login: en la esquina superior derecha del card de login."))
    story.append(b("Dentro del sistema: en la parte superior de la barra (topbar)."))
    story.append(p("El cambio se aplica de inmediato en toda la interfaz, incluyendo titulos, "
                   "formularios, tabs, tablas, botones y el Agente con voz."))

    story.append(PageBreak())

    # ============================================================
    # PARTE III - DASHBOARD Y NAVEGACION
    # ============================================================
    story.append(h1("PARTE III - Dashboard y Navegacion"))

    story.append(h2("11. Estructura General de la Interfaz"))
    story.append(p("La interfaz del sistema se divide en tres areas principales:"))
    story.append(b("<b>Menu lateral (izquierda):</b> acceso a los 18 modulos agrupados por categorias (Principales, Compras, Almacen, Operaciones, Configuracion)."))
    story.append(b("<b>Barra superior (topbar):</b> selector de idioma, identificacion del usuario y boton de Salir."))
    story.append(b("<b>Area de trabajo (centro):</b> muestra el contenido del modulo seleccionado (tablas, formularios, graficos, Kanban)."))

    story.append(h2("12. Dashboard Ejecutivo"))
    story.append(p("Al iniciar sesion, el sistema presenta el <b>Dashboard ejecutivo</b> con los "
                   "indicadores clave (KPIs) y graficos de seguimiento:"))
    story.append(img("02-dashboard.png", "Figura 2. Dashboard ejecutivo con KPIs y graficos en tiempo real."))
    story.append(b("<b>KPIs principales:</b> Unidades en Inventario, Valor del Inventario, Total en Ordenes, Productos Bajo Minimo."))
    story.append(b("<b>KPIs secundarios:</b> Productos Activos, Proveedores Activos, Ordenes de Compra, Recepciones, Bodegas, Transferencias, Ajustes, Ordenes Pendientes."))
    story.append(b("<b>Productos Bajo Minimo:</b> listado de productos cuya existencia es inferior al minimo configurado."))
    story.append(b("<b>Grafico Ordenes por Estado:</b> distribucion de OCs por situacion con montos."))
    story.append(b("<b>Grafico Tareas por Situacion:</b> pie chart con el avance de tareas."))
    story.append(b("<b>Valor de Inventario por Bodega:</b> distribucion del valor por ubicacion."))
    story.append(p("<b>Funcionalidad clave:</b> cada grafico es clickeable y navega al modulo correspondiente."))

    story.append(h2("13. Navegacion entre Modulos"))
    story.append(p("El menu lateral permite acceder a los modulos en cualquier momento. Los modulos "
                   "se agrupan en: <b>Principales</b> (Dashboard, Productos, Kardex, Proveedores), "
                   "<b>Compras</b> (Ordenes de Compra, Recepcion de Facturas), <b>Almacen</b> "
                   "(Bodegas, Transferencias, Salidas, Ajustes, Toma Fisica, Centros de Costo), "
                   "<b>Operaciones</b> (Pedidos, Tareas, Personal Empresa, Correos, Agente) y "
                   "<b>Configuracion</b> (Referencias, Datos Empresa, Usuarios, Modulos Sistema)."))

    story.append(PageBreak())

    # ============================================================
    # PARTE IV - MODULOS OPERATIVOS
    # ============================================================
    story.append(h1("PARTE IV - Modulos Operativos"))

    # 14. PRODUCTOS
    story.extend(modulo_section(
        14, "Productos", "03-productos.png",
        "Administrar el catalogo de productos de la empresa. Cada producto tiene un codigo unico, "
        "unidad de medida, costo, existencia y nivel minimo/maximo. Es el modulo base del sistema "
        "ya que todos los movimientos (compras, recepciones, transferencias, salidas, ajustes) "
        "hacen referencia a productos registrados aqui.",
        [
            "Ingrese al modulo <b>Productos</b> desde el menu lateral.",
            "Haga clic en el boton <b>+ Nuevo Producto</b> (esquina superior derecha).",
            "Complete los campos obligatorios (Codigo, Descripcion, Unidad de Medida).",
            "Asigne categoria, grupo, sub-grupo y tipo de inventario si aplica.",
            "Configure el minimo y maximo para alertas automaticas.",
            "Haga clic en <b>Guardar</b>.",
        ],
        [
            ["Codigo",            "Texto",  "SI",  "Identificador unico (ej. PROD-00001)."],
            ["Descripcion",       "Texto",  "SI",  "Nombre comercial del producto."],
            ["Unidad de Medida",  "Lista",  "SI",  "Unidad, Kg, Litro, Metro, Caja, etc."],
            ["Tipo Inventario",   "Lista",  "No",  "Mercancia, Suministro."],
            ["Categoria",         "Lista",  "No",  "Clasificacion principal."],
            ["Grupo / Sub-Grupo", "Lista",  "No",  "Sub-clasificaciones."],
            ["Costo Promedio",    "Decimal","No",  "Calculado automaticamente en recepciones."],
            ["Minimo / Maximo",   "Numero", "No",  "Alertas cuando existencia sale del rango."],
            ["Situacion",         "Lista",  "No",  "Activo / Inactivo / Descontinuado."],
            ["Foto del Producto", "Imagen", "No",  "Imagen de referencia (max. 2 MB)."],
        ],
        [
            "<b>Ver:</b> consultar los datos completos en modal de detalle.",
            "<b>Editar:</b> modificar la informacion del producto.",
            "<b>Eliminar:</b> dar de baja el producto. Requiere confirmacion.",
            "<b>Codigo de Barras / QR:</b> imprimir etiquetas filtradas por categoria, grupo o sub-grupo.",
            "<b>Resetear Existencias:</b> (solo admin) colocar en 0 la existencia de todos los productos activos.",
            "<b>Resetear Ult. Costo:</b> (solo admin) colocar en 0 el ultimo costo de todos los productos.",
        ],
        [
            "<b>Reportes:</b> listado general con filtros por categoria, grupo, situacion.",
            "<b>Reportes Especificos:</b> Inventario Valorizado, Productos Bajo Minimo, Montos por Categoria.",
        ]
    ))

    # 15. KARDEX
    story.append(PageBreak())
    story.extend(modulo_section(
        15, "Kardex de Productos", "04-kardex.png",
        "Visualizar el historial cronologico completo de movimientos de un producto en todas las "
        "bodegas. Muestra entradas, salidas, transferencias, ajustes y saldos resultantes, con "
        "fecha, tipo de movimiento, documento de origen y costo promedio del momento.",
        [
            "Ingrese al modulo <b>Kardex de Productos</b>.",
            "Seleccione el producto en el combo superior.",
            "Opcionalmente filtre por bodega o rango de fechas.",
            "El sistema mostrara el historial completo con saldo corrido.",
        ],
        None,
        [
            "<b>Exportar PDF / Excel:</b> descargar el kardex completo para archivo o auditoria.",
            "<b>Filtro por Bodega:</b> ver el kardex especifico de una bodega.",
            "<b>Filtro por Fecha:</b> rango personalizado.",
        ],
        [
            "<b>Reportes:</b> Kardex completo en formato para archivo."
        ]
    ))

    # 16. PROVEEDORES
    story.append(PageBreak())
    story.extend(modulo_section(
        16, "Proveedores", "05-proveedores.png",
        "Administrar el directorio de proveedores de la empresa. Cada proveedor se registra con sus "
        "datos fiscales, contacto, actividad economica y ciudad/pais. El proveedor activo se usa en "
        "ordenes de compra, pedidos y recepciones.",
        [
            "Ingrese al modulo <b>Proveedores</b>.",
            "Haga clic en <b>+ Nuevo Proveedor</b>.",
            "Complete razon social, tipo y numero de documento, ciudad y pais.",
            "Registre correo, telefono y persona de contacto.",
            "Asigne la situacion (Activo) y haga clic en <b>Guardar</b>.",
        ],
        [
            ["Nombre Empresa",    "Texto", "SI", "Razon social oficial."],
            ["Tipo Identificacion","Lista","No", "NIT, RUC, RFC, etc."],
            ["Nro Documento",     "Texto", "No", "Numero de identificacion tributaria."],
            ["Correo",            "Email", "No", "Correo principal del proveedor."],
            ["Telefono Oficina",  "Texto", "No", "Telefono fijo o conmutador."],
            ["Actividad",         "Texto", "No", "Sector o rubro economico."],
            ["Persona de Contacto","Texto","No", "Persona de contacto principal."],
            ["Direccion",         "Texto", "No", "Direccion fisica."],
            ["Ciudad / Pais",     "Lista", "No", "Ubicacion."],
            ["Situacion",         "Lista", "No", "Activo / Inactivo."],
        ],
        [
            "<b>Ver:</b> consultar los datos completos.",
            "<b>Editar:</b> modificar la informacion del proveedor.",
            "<b>Eliminar:</b> dar de baja. Requiere confirmacion.",
        ],
        [
            "<b>Reportes:</b> listado general.",
            "<b>Reportes Especificos:</b> filtros por ciudad, pais, actividad o situacion."
        ]
    ))

    # 17. ORDENES DE COMPRA
    story.append(PageBreak())
    story.extend(modulo_section(
        17, "Ordenes de Compra", "06-ordenes-compra.png",
        "Emitir, aprobar y dar seguimiento a las ordenes de compra a proveedores. Cada OC tiene un "
        "consecutivo, renglones (productos con cantidad y costo unitario), impuesto y total. El "
        "estado de la OC indica si esta pendiente, aprobada, recibida parcial o totalmente, anulada "
        "o rechazada.",
        [
            "Ingrese al modulo <b>Ordenes de Compra</b>.",
            "Haga clic en <b>+ Nueva Orden</b>.",
            "Seleccione proveedor, fecha emision, fecha estimada de llegada, comprador y condicion de pago.",
            "Agregue los renglones (productos, cantidad y costo unitario) con el boton <b>+ Agregar Renglon</b>.",
            "Configure el porcentaje de impuesto aplicable.",
            "Haga clic en <b>Guardar Orden</b>.",
            "Envie la OC al proveedor por email desde el boton <b>Enviar Email</b>.",
        ],
        [
            ["Nro. Orden",         "Texto", "SI", "Consecutivo generado (OC-00001)."],
            ["Proveedor",          "Lista", "SI", "Del catalogo de proveedores activos."],
            ["Fecha Emision",      "Fecha", "SI", "Fecha de emision."],
            ["Fecha Vencimiento",  "Fecha", "No", "Fecha limite de validez."],
            ["Fecha Est. Llegada", "Fecha", "No", "Entrega estimada."],
            ["Comprador",          "Lista", "SI", "Persona del area de compras."],
            ["Tipo Moneda",        "Lista", "No", "Pesos, USD, Euros."],
            ["Cond. Pago",         "Texto", "No", "Credito 30 dias, contado, etc."],
            ["Pct Impuesto",       "Numero","No", "Porcentaje de IVA."],
            ["Observaciones",      "Texto", "No", "Notas adicionales."],
        ],
        [
            "<b>Ver:</b> detalle de la OC con todos los renglones.",
            "<b>Editar:</b> modificar OCs pendientes.",
            "<b>Aprobar / Rechazar:</b> flujo de aprobacion por rol.",
            "<b>Generar PDF:</b> PDF formateado con logo de empresa.",
            "<b>Enviar Email:</b> envio al correo del proveedor con adjunto.",
            "<b>Anular:</b> invalida la OC (queda registrada pero no afecta existencias).",
        ],
        [
            "<b>Reportes:</b> listado general de OCs.",
            "<b>Reportes Especificos:</b> por rango de fechas, proveedor, estado, comprador."
        ]
    ))

    # 18. RECEPCION DE FACTURAS
    story.append(PageBreak())
    story.extend(modulo_section(
        18, "Recepcion de Facturas", "07-recepcion.png",
        "Registrar la recepcion fisica de la mercancia contra una orden de compra, actualizando "
        "existencias y costo promedio. Cada recepcion genera movimientos de entrada en la bodega "
        "seleccionada y actualiza el estado de la OC (parcial/completa).",
        [
            "Ingrese al modulo <b>Recepcion de Facturas</b>.",
            "Haga clic en <b>+ Nueva Recepcion</b>.",
            "Seleccione la <b>Orden de Compra</b> a recibir.",
            "Seleccione la <b>Bodega de Recepcion</b>.",
            "Ajuste la <b>Cantidad a Recibir</b> por cada renglon (puede ser parcial).",
            "Registre numero y fecha de factura del proveedor.",
            "Haga clic en <b>Guardar Recepcion</b>.",
        ],
        [
            ["Nro Recepcion",    "Texto", "SI", "Consecutivo (RF-00001)."],
            ["Nro Factura",      "Texto", "SI", "Numero de la factura fisica del proveedor."],
            ["Orden de Compra",  "Lista", "SI", "OC a la que corresponde."],
            ["Bodega Recepcion", "Lista", "SI", "Bodega destino."],
            ["Persona Recibe",   "Lista", "SI", "Responsable de la recepcion."],
            ["Fecha Recibida",   "Fecha", "SI", "Fecha fisica de recepcion."],
            ["Observaciones",    "Texto", "No", "Notas sobre la recepcion."],
        ],
        [
            "<b>Ver:</b> detalle de la recepcion.",
            "<b>Editar:</b> modificar recepciones pendientes de aprobacion.",
            "<b>Generar PDF:</b> comprobante de recepcion.",
            "<b>Aprobar:</b> actualiza existencia y costo promedio de manera definitiva.",
            "<b>Anular:</b> revierte los movimientos (requiere permiso).",
        ],
        [
            "<b>Reportes:</b> listado general.",
            "<b>Reportes Especificos:</b> por rango, proveedor, bodega, estado."
        ]
    ))

    # 19. BODEGAS
    story.append(PageBreak())
    story.extend(modulo_section(
        19, "Bodegas", "08-bodegas.png",
        "Administrar las ubicaciones fisicas donde se almacenan los productos. Cada bodega tiene "
        "su propio saldo por producto. El modulo incluye tres vistas: Bodegas (registro), "
        "Movimientos (historial general) y Saldo de Inventario (valorizado por bodega).",
        [
            "Ingrese al modulo <b>Bodegas</b>.",
            "Haga clic en <b>+ Nueva Bodega</b>.",
            "Complete nombre, correo, telefono, direccion, ciudad y pais.",
            "Asigne situacion (Activa) y haga clic en <b>Guardar</b>.",
        ],
        [
            ["Nombre",      "Texto", "SI", "Nombre de la bodega."],
            ["Correo",      "Email", "No", "Correo de la bodega."],
            ["Telefono",    "Texto", "No", "Telefono de contacto."],
            ["Direccion",   "Texto", "No", "Direccion fisica."],
            ["Ciudad / Pais","Lista","No", "Ubicacion."],
            ["Situacion",   "Lista", "No", "Activa / En Mantenimiento / Inactiva."],
        ],
        [
            "<b>Ver:</b> consultar datos de la bodega.",
            "<b>Editar:</b> modificar informacion.",
            "<b>Eliminar:</b> dar de baja (solo si no tiene movimientos).",
            "<b>Nuevo Movimiento:</b> registrar movimiento manual cuando aplica.",
        ],
        [
            "<b>Reportes:</b> listado de bodegas y movimientos.",
            "<b>Reportes Especificos:</b> Saldo valorizado por bodega, movimientos por tipo y fecha."
        ]
    ))

    # 20. TRANSFERENCIAS
    story.append(PageBreak())
    story.extend(modulo_section(
        20, "Transferencias entre Bodegas", "09-transferencias.png",
        "Registrar el traslado fisico de productos de una bodega origen a una bodega destino. Cada "
        "transferencia genera dos movimientos: salida en origen y entrada en destino. El flujo "
        "tiene aprobacion y confirmacion de recepcion.",
        [
            "Ingrese al modulo <b>Transferencias</b>.",
            "Haga clic en <b>+ Nueva Transferencia</b>.",
            "Seleccione Bodega Salida y Bodega Entrada.",
            "Agregue los renglones con producto y cantidad.",
            "Registre persona que emite, fecha emision y observaciones.",
            "Haga clic en <b>Guardar Transferencia</b>.",
            "El Bodeguero destino confirma la recepcion.",
        ],
        [
            ["Nro Transferencia","Texto", "SI", "Consecutivo (TR-00001)."],
            ["Fecha Emision",    "Fecha", "SI", "Fecha de salida."],
            ["Bodega Salida",    "Lista", "SI", "Bodega origen."],
            ["Bodega Entrada",   "Lista", "SI", "Bodega destino."],
            ["Persona Emite",    "Lista", "SI", "Responsable del despacho."],
            ["Persona Recibe",   "Lista", "No", "Responsable de la recepcion."],
            ["Observaciones",    "Texto", "No", "Notas."],
        ],
        [
            "<b>Ver / Editar / Eliminar</b> transferencias pendientes.",
            "<b>Generar PDF:</b> comprobante de transferencia.",
            "<b>Aprobar / Confirmar Recepcion</b> segun flujo.",
        ],
        [
            "<b>Reportes Especificos:</b> por rango, bodega origen/destino, persona."
        ]
    ))

    # 21. SALIDAS DE ALMACEN
    story.append(PageBreak())
    story.extend(modulo_section(
        21, "Salidas de Almacen", "10-salidas.png",
        "Registrar el despacho de productos desde una bodega hacia un centro de costo, proyecto o "
        "consumo interno. Cada salida descuenta existencia y se imputa al centro de costo indicado.",
        [
            "Ingrese al modulo <b>Salidas de Almacen</b>.",
            "Haga clic en <b>+ Nueva Salida</b>.",
            "Seleccione Bodega Salida, Persona que Emite y Centro de Costo.",
            "Agregue los renglones con producto y cantidad.",
            "Registre observaciones.",
            "Haga clic en <b>Guardar</b>.",
        ],
        [
            ["Nro Salida",       "Texto", "SI", "Consecutivo (SAL-00001)."],
            ["Fecha Emision",    "Fecha", "SI", "Fecha de la salida."],
            ["Bodega Salida",    "Lista", "SI", "Bodega origen."],
            ["Persona Emite",    "Lista", "SI", "Responsable del despacho."],
            ["Centro de Costo",  "Lista", "SI", "Centro que consume."],
            ["Observaciones",    "Texto", "No", "Notas u observaciones sobre la salida."],
        ],
        [
            "<b>Ver / Editar / Eliminar.</b>",
            "<b>Generar PDF:</b> comprobante de salida con logo.",
            "<b>Aprobar:</b> confirma el movimiento (descuenta existencia).",
        ],
        [
            "<b>Reportes:</b> listado general.",
            "<b>Reportes Especificos:</b> por bodega, centro de costo, rango de fechas."
        ]
    ))

    # 22. AJUSTES DE INVENTARIO
    story.append(PageBreak())
    story.extend(modulo_section(
        22, "Ajustes de Inventario", "11-ajustes-inventario.png",
        "Registrar correcciones de existencia por entrada o salida causadas por perdida, dano, "
        "merma, devolucion interna, sobrantes o reclasificacion. Cada ajuste tiene un tipo (firmado "
        "+ para entrada o - para salida), una bodega, un motivo y un responsable que lo autoriza.",
        [
            "Ingrese al modulo <b>Ajustes de Inventario</b>.",
            "Haga clic en <b>+ Nuevo Ajuste</b>.",
            "Seleccione Bodega, Persona que Autoriza y Tipo de Ajuste.",
            "Agregue los renglones con producto y cantidad.",
            "Haga clic en <b>Guardar Ajuste</b>.",
            "Despues de aprobado, se actualizan las existencias.",
        ],
        [
            ["Nro Ajuste",       "Texto", "SI", "Consecutivo (AJU-00001)."],
            ["Fecha Emision",    "Fecha", "SI", "Fecha del ajuste."],
            ["Bodega",           "Lista", "SI", "Bodega afectada."],
            ["Persona Autoriza", "Lista", "SI", "Responsable que autoriza."],
            ["Tipo de Ajuste",   "Lista", "SI", "Tipo (+/-) con motivo predefinido."],
        ],
        [
            "<b>Ver / Editar</b> ajustes pendientes.",
            "<b>Generar PDF</b> del ajuste.",
            "<b>Aprobar y Ejecutar:</b> aplica el movimiento en bodega.",
            "<b>Anular:</b> invalida sin revertir (trazabilidad).",
        ],
        [
            "<b>Reportes Especificos:</b> por rango, bodega, tipo de ajuste."
        ]
    ))

    # 23. TOMA DE INVENTARIO FISICO
    story.append(PageBreak())
    story.extend(modulo_section(
        23, "Toma de Inventario Fisico", "12-toma-fisica.png",
        "Conciliar las existencias del sistema con las existencias fisicas reales de cada bodega. "
        "El modulo genera una plantilla Excel con los saldos teoricos, el personal cuenta en sitio "
        "y al cargar la plantilla se generan automaticamente los ajustes por sobrantes/faltantes.",
        [
            "Ingrese al modulo <b>Toma de Inventario Fisico</b>.",
            "Seleccione la bodega y haga clic en <b>Generar Plantilla de Conteo</b>.",
            "Imprima o abra el Excel en el dispositivo.",
            "El personal va a la bodega y cuenta cada producto.",
            "Escribe la cantidad contada en la columna correspondiente.",
            "Guarde el archivo y pase a la pestana <b>Cargar Excel con Conteos</b>.",
            "Cargue el archivo y revise las diferencias.",
            "Confirme para generar los ajustes automaticos.",
        ],
        None,
        [
            "<b>Generar Plantilla:</b> crear Excel con saldos actuales.",
            "<b>Cargar Conteos:</b> importar Excel con cantidades fisicas.",
            "<b>Ver Historial:</b> consultar tomas procesadas anteriormente.",
            "<b>Aplicar Ajustes:</b> generar ajustes automaticos por diferencias.",
        ]
    ))

    # 24. CENTROS DE COSTO
    story.append(PageBreak())
    story.extend(modulo_section(
        24, "Centros de Costo", "13-centros-costo.png",
        "Administrar los centros de costo organizacionales. Cada centro representa un proyecto, "
        "area o unidad que consume productos. Al registrar una salida de almacen, se imputa al "
        "centro de costo, permitiendo costear proyectos y areas.",
        [
            "Ingrese al modulo <b>Centros de Costo</b>.",
            "Haga clic en <b>+ Nuevo Centro</b>.",
            "Complete codigo, descripcion y responsable.",
            "Asigne la situacion y guarde.",
        ],
        [
            ["Codigo",      "Texto", "SI", "Identificador unico (CC-001)."],
            ["Descripcion", "Texto", "SI", "Nombre del centro de costo."],
            ["Responsable", "Texto", "No", "Persona a cargo."],
            ["Situacion",   "Lista", "No", "Activo / Inactivo."],
        ],
        [
            "<b>Ver / Editar / Eliminar.</b>",
        ],
        [
            "<b>Reportes:</b> listado general.",
            "<b>Reportes Especificos:</b> gasto por centro, rango de fechas."
        ]
    ))

    # 25. CARGA INICIAL DE INVENTARIO
    story.append(PageBreak())
    story.extend(modulo_section(
        25, "Carga Inicial de Inventario", "18-carga-inicial.png",
        "Registrar las existencias iniciales del inventario al comenzar a usar el sistema o al "
        "habilitar una nueva bodega. Cada carga inicial documenta la existencia fisica de cada "
        "producto en una bodega al momento de arranque, con su costo unitario.",
        [
            "Ingrese al modulo <b>Carga Inicial de Inventario</b>.",
            "Haga clic en <b>+ Nueva Carga</b>.",
            "Seleccione la bodega y fecha.",
            "Agregue los renglones con producto, cantidad y costo unitario.",
            "Guarde la carga.",
            "Despues de aprobada, se crean los saldos iniciales en la bodega.",
        ],
        [
            ["Nro Carga",   "Texto",  "SI", "Consecutivo (CGI-00001)."],
            ["Fecha",       "Fecha",  "SI", "Fecha de apertura."],
            ["Bodega",      "Lista",  "SI", "Bodega que recibe saldos."],
            ["Descripcion", "Texto",  "No", "Descripcion de la carga inicial..."],
            ["Renglones",   "Tabla",  "SI", "Productos con cantidad y costo unitario."],
        ],
        [
            "<b>Ver / Editar / Eliminar</b> cargas pendientes.",
            "<b>Generar PDF:</b> reporte de la carga.",
            "<b>Aprobar:</b> ejecuta los movimientos en bodega.",
        ]
    ))

    # 26. PEDIDOS
    story.append(PageBreak())
    story.extend(modulo_section(
        26, "Ordenes de Pedido", "19-pedidos.png",
        "Gestionar las ordenes de pedido a proveedores (solicitudes previas a la orden de compra "
        "formal). Permite seguimiento por rango de fechas, comprador y estado. Se puede enviar el "
        "pedido al proveedor por email.",
        [
            "Ingrese al modulo <b>Pedidos</b>.",
            "Haga clic en <b>+ Nueva Orden de Pedido</b>.",
            "Seleccione proveedor, comprador, bodega de llegada y centro de costo.",
            "Agregue los renglones con producto, cantidad y unidad.",
            "Complete fechas, condicion de pago y observaciones.",
            "Guarde y envie al proveedor por email.",
        ],
        [
            ["Nro Pedido",       "Texto", "SI", "Consecutivo (PED-00001)."],
            ["Proveedor",        "Lista", "SI", "Del catalogo activo."],
            ["Comprador",        "Lista", "SI", "Persona del area."],
            ["Bodega Llegada",   "Lista", "No", "Bodega destino estimada."],
            ["Centro de Costo",  "Lista", "No", "Centro que consume."],
            ["Cond. Pago",       "Texto", "No", "Terminos de pago."],
            ["Tipo Moneda",      "Lista", "No", "Moneda del pedido."],
        ],
        [
            "<b>Ver / Editar / Eliminar.</b>",
            "<b>Generar PDF</b> del pedido.",
            "<b>Enviar Email</b> al proveedor.",
        ],
        [
            "<b>Reportes Especificos:</b> por rango, proveedor, comprador, estado."
        ]
    ))

    # 27. TAREAS
    story.append(PageBreak())
    story.extend(modulo_section(
        27, "Tareas", "20-tareas.png",
        "Asignar y dar seguimiento a tareas del personal de almacen y compras. Cada "
        "tarea tiene una persona que asigna, una persona que ejecuta, fechas de asignacion y "
        "requerimiento, descripcion y situacion. El modulo ofrece dos vistas: Tabla y Kanban.",
        [
            "Ingrese al modulo <b>Tareas</b>.",
            "Haga clic en <b>+ Nueva Tarea</b>.",
            "Seleccione persona que asigna y persona que ejecuta.",
            "Defina fecha requerida de finalizacion y descripcion.",
            "Guarde. El sistema envia un correo automatico a la persona que ejecuta.",
            "Use la vista <b>Kanban</b> para arrastrar tareas entre estados.",
        ],
        [
            ["Nro Tarea",         "Texto", "SI", "Consecutivo (TAR-00001)."],
            ["Fecha Asignacion",  "Fecha", "SI", "Fecha de creacion."],
            ["Persona Asigna",    "Lista", "SI", "Del catalogo Personal Empresa activo."],
            ["Persona Ejecuta",   "Lista", "SI", "Responsable de ejecutar."],
            ["Fecha Requerida",   "Fecha", "SI", "Fecha limite de cumplimiento."],
            ["Descripcion",       "Texto", "SI", "Detalle de la tarea."],
            ["Situacion",         "Lista", "SI", "Pendiente / En Proceso / Completada / Vencida / Cancelada."],
        ],
        [
            "<b>Ver / Editar / Eliminar.</b>",
            "<b>Vista Kanban:</b> mover tareas entre columnas con drag and drop.",
            "<b>Auto-vencimiento:</b> si la fecha requerida es menor a hoy y la tarea esta pendiente o en proceso, el sistema la marca automaticamente como Vencida.",
        ],
        [
            "<b>Reportes:</b> listado general.",
            "<b>Reportes Especificos:</b> por responsable, estado, rango de fechas."
        ]
    ))

    # 28. PERSONAL EMPRESA
    story.append(PageBreak())
    story.extend(modulo_section(
        28, "Personal Empresa", "21-personal.png",
        "Administrar el catalogo del personal interno de la empresa que se usa en modulos "
        "operativos (personas que asignan/ejecutan tareas, personas que emiten movimientos, "
        "personas que autorizan ajustes, etc.).",
        [
            "Ingrese al modulo <b>Personal Empresa</b>.",
            "Haga clic en <b>+ Nuevo</b>.",
            "Complete nombre, apellido, correo, telefono movil.",
            "Asigne situacion y guarde.",
        ],
        [
            ["Nombre",       "Texto", "SI", "Nombre de la persona."],
            ["Apellido",     "Texto", "SI", "Apellido."],
            ["Correo",       "Email", "No", "Correo corporativo."],
            ["Nro Movil",    "Texto", "No", "Numero celular."],
            ["Situacion",    "Lista", "No", "Activo / Inactivo."],
        ],
        [
            "<b>Ver / Editar / Eliminar.</b>",
        ]
    ))

    # 29. CORREOS ENVIADOS
    story.append(PageBreak())
    story.extend(modulo_section(
        29, "Correos Enviados", "22-correos.png",
        "Registro completo y trazabilidad de todos los correos electronicos enviados desde el "
        "sistema (ordenes de compra, pedidos, notificaciones de tareas, etc.).",
        [
            "Ingrese al modulo <b>Correos Enviados</b>.",
            "Consulte el listado con filtro por destinatario, proveedor o asunto.",
            "Haga clic en una fila para ver el detalle del correo.",
        ],
        None,
        [
            "<b>Ver detalle:</b> consultar asunto, destinatario, mensaje.",
            "<b>Limpiar Historial:</b> (solo admin) borra el historial completo.",
            "<b>Reenviar:</b> disponible en algunos flujos.",
        ],
        [
            "<b>Reportes:</b> listado de correos."
        ]
    ))

    # 30. AGENTE (Asistente con voz)
    story.append(PageBreak())
    story.extend(modulo_section(
        30, "Agente (Asistente con Voz)", "23-asistente.png",
        "Asistente que permite consultar informacion del sistema mediante voz o texto en lenguaje "
        "natural, en espanol o ingles. Responde por escrito y por voz en el idioma activo del "
        "sistema.",
        [
            "Ingrese al modulo <b>Agente</b>.",
            "Use los botones de <b>Consulta Rapida</b> para preguntas predefinidas.",
            "O escriba su pregunta en el campo de texto y presione Enviar.",
            "O haga clic en el microfono, permita el acceso y formule la pregunta en voz alta.",
            "El agente respondera en el idioma activo con texto y voz.",
        ],
        None,
        [
            "<b>Consulta Rapida:</b> Valor del Inventario Actual, Ordenes Pendientes, Tareas por Situacion.",
            "<b>Preguntas libres:</b> detecta palabras clave en espanol o ingles (inventario, ordenes, tareas, proveedores por ciudad, bodegas, personal).",
            "<b>Detener Voz:</b> detiene la respuesta hablada en curso.",
            "<b>Repetir Respuesta:</b> vuelve a leer la respuesta.",
        ]
    ))

    story.append(PageBreak())

    # ============================================================
    # PARTE V - CONFIGURACION ADMINISTRATIVA
    # ============================================================
    story.append(h1("PARTE V - Configuracion Administrativa"))
    story.append(p("<i>Esta seccion esta reservada exclusivamente al rol de <b>Administrador</b>.</i>"))

    story.append(h2("31. Datos Empresa"))
    story.append(p("Registro y mantenimiento de los datos empresariales: razon social, "
                   "identificacion tributaria, direccion, telefono, correo, logo y representante "
                   "legal. Esta informacion se usa en los encabezados de PDFs, correos y reportes."))
    story.append(img("24-datos-empresa.png", "Figura 24. Modulo Datos Empresa."))

    story.append(h2("32. Gestion de Usuarios"))
    story.append(p("Permite crear, modificar, bloquear y dar de baja a los usuarios del sistema."))
    story.append(b("<b>Estados:</b> Activo, Inactivo, Bloqueado."))
    story.append(b("<b>Roles:</b> Admin, Ventas, Almacen, Compras (configurables)."))
    story.append(b("<b>Matriz de permisos:</b> por rol y por modulo con acciones Leer/Registrar/Editar/Eliminar."))
    story.append(warn("No se puede eliminar un usuario con rol Admin."))

    story.append(h2("33. Tablas Referenciales"))
    story.append(p("Catalogos que alimentan los formularios del sistema. Incluyen:"))
    story.append(b("Paises y ciudades"))
    story.append(b("Tipos de identificacion fiscal"))
    story.append(b("Unidades de medida"))
    story.append(b("Categorias, grupos y sub-grupos de productos"))
    story.append(b("Tipos de ajuste de inventario (con signo + o -)"))
    story.append(b("Situaciones (tarea, orden, etc.)"))
    story.append(b("Actividades de proveedor"))
    story.append(b("Tipos de inventario (Mercancia, Suministro)"))
    story.append(b("Condiciones de pago y tipos de moneda"))

    story.append(h2("34. Modulos del Sistema"))
    story.append(p("Permite activar o desactivar modulos segun las necesidades de cada empresa. "
                   "Los modulos desactivados desaparecen del menu lateral. Los modulos <b>Dashboard</b> "
                   "y <b>Modulos Sistema</b> no pueden desactivarse."))
    story.append(img("25-modulos.png", "Figura 25. Modulo de Modulos del Sistema."))

    story.append(PageBreak())

    # ============================================================
    # PARTE VI - REPORTES Y ANALITICA
    # ============================================================
    story.append(h1("PARTE VI - Reportes y Analitica"))

    story.append(h2("35. Reportes Generales"))
    story.append(p("Cada modulo cuenta con una pestana <b>Reportes</b> que permite exportar el "
                   "listado completo en formatos Excel y PDF, con todos los campos visibles y el "
                   "logo de empresa."))

    story.append(h2("36. Reportes Especificos"))
    story.append(p("La pestana <b>Reportes Especificos</b> permite generar reportes filtrados por "
                   "criterios particulares: rango de fechas, bodega, proveedor, situacion, tipo de "
                   "movimiento, centro de costo, etc. Todos los reportes pueden exportarse a Excel "
                   "o PDF."))

    story.append(h2("37. Exportacion de Datos"))
    story.append(b("<b>Excel (XLSX):</b> para analisis en hoja de calculo."))
    story.append(b("<b>PDF:</b> para impresion, archivo y firmas."))
    story.append(b("<b>Etiquetas:</b> impresion de codigos de barras y QR por categoria/grupo."))

    story.append(h2("38. Dashboard Ejecutivo"))
    story.append(p("Los graficos del Dashboard se actualizan en tiempo real con los datos del "
                   "sistema. Cada grafico es <b>clickeable</b> y lleva al modulo correspondiente "
                   "para analisis detallado."))

    story.append(h2("39. Inventario Valorizado"))
    story.append(p("El reporte especifico <b>Inventario Valorizado</b> muestra el listado completo "
                   "de productos activos con existencia, costo unitario y valor total. Se puede "
                   "filtrar por bodega, categoria o grupo."))

    story.append(PageBreak())

    # ============================================================
    # PARTE VII - APOYO Y SOPORTE
    # ============================================================
    story.append(h1("PARTE VII - Apoyo y Soporte"))

    story.append(h2("40. Preguntas Frecuentes (FAQ)"))
    faqs = [
        ("Por que no veo algunos modulos en mi menu?",
         "Su rol no tiene permisos sobre esos modulos, o los modulos estan desactivados. Solicite al Administrador la habilitacion."),
        ("Como corrijo una existencia que no coincide con lo fisico?",
         "Use el modulo Ajustes de Inventario (con su motivo) o realice una Toma de Inventario Fisico para conciliacion formal."),
        ("Puedo eliminar una orden de compra ya aprobada?",
         "No directamente. Debe anularse para mantener trazabilidad. La anulacion no revierte recepciones asociadas."),
        ("Como recupero un registro eliminado?",
         "No es posible desde la interfaz. Contacte a Sistemas para evaluar restauracion desde respaldo."),
        ("El costo promedio cambio solo, por que?",
         "El costo promedio se recalcula automaticamente en cada recepcion (promedio ponderado con la existencia previa y la nueva entrada)."),
        ("El Agente me responde en espanol pero quiero ingles.",
         "Cambie el idioma del sistema con el boton ES/EN en la topbar. El Agente usara la voz del navegador del idioma seleccionado."),
        ("Una tarea aparecio sola como Vencida.",
         "Correcto. Las tareas pendientes o en proceso se marcan automaticamente como Vencidas cuando la fecha requerida es anterior a hoy."),
        ("Mis datos estan seguros?",
         "Si. El sistema usa cifrado HTTPS en transito, autenticacion segura y respaldos periodicos en Vercel."),
    ]
    for q, a in faqs:
        story.append(Paragraph(f"<b>P:</b> {q}", style_body))
        story.append(Paragraph(f"<b>R:</b> {a}", style_body))
        story.append(Spacer(1, 6))

    story.append(h2("41. Soporte Tecnico"))
    story.append(p("Para reportar incidencias o solicitar mejoras del sistema, contacte al area de "
                   "Sistemas a traves de los canales corporativos establecidos. Incluya en el "
                   "reporte: usuario, modulo afectado, pasos para reproducir el error y capturas "
                   "de pantalla si es posible."))

    story.append(h2("42. Control de Cambios del Documento"))
    cambios = [["Version", "Fecha", "Descripcion del cambio", "Responsable"],
               ["1.0", date.today().strftime("%d/%m/%Y"), "Emision inicial del manual", "Sistemas / Normas y Procedimientos"]]
    cc_table = Table(cambios, colWidths=[0.7*inch, 1.0*inch, 3.2*inch, 1.6*inch])
    cc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL_REY),
        ('TEXTCOLOR',  (0,0), (-1,0), white),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 9),
        ('GRID',       (0,0), (-1,-1), 0.4, GRIS_OSCURO),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN',      (0,0), (-1,0), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING',(0,0), (-1,-1), 6),
    ]))
    story.append(cc_table)

    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph(
        "<i>Este documento fue elaborado conforme a los principios de documentacion "
        "corporativa de INVEN. Toda observacion o sugerencia para mejorar este manual "
        "debe canalizarse al Departamento de Sistemas.</i>", style_body))

    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph("- FIN DEL DOCUMENTO -", ParagraphStyle(
        'End', parent=style_body, alignment=TA_CENTER,
        fontName='Helvetica-Bold', textColor=AZUL_REY, fontSize=12)))

    return story

# ===========================
#  Build PDF
# ===========================
def build():
    doc = InvenDocTemplate(
        OUTPUT, pagesize=LETTER,
        leftMargin=0.7*inch, rightMargin=0.7*inch,
        topMargin=0.9*inch, bottomMargin=0.7*inch,
        title="Manual del Sistema de Gestion de Inventario",
        author="INVEN",
        subject="Procedimientos operativos del sistema de gestion de inventario",
    )

    # Frames
    cover_frame = Frame(0, 0, LETTER[0], LETTER[1], id='cover')
    content_frame = Frame(0.7*inch, 0.7*inch, LETTER[0]-1.4*inch, LETTER[1]-1.6*inch, id='content')

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=cover_frame, onPage=cover_page),
        PageTemplate(id='content', frames=content_frame, onPage=header_footer),
    ])

    story = build_content()
    doc.multiBuild(story)
    print(f"PDF generado: {OUTPUT}")
    print(f"Tamano: {os.path.getsize(OUTPUT) // 1024} KB")

if __name__ == "__main__":
    build()
