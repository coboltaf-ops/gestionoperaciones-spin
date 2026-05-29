---
name: Proceso de alta de cliente nuevo
description: Checklist completo para instalar el sistema en un cliente nuevo, incluyendo configuracion de correos con identidad del cliente
type: project
---

## Proceso de Alta de Cliente Nuevo

Cuando se instala el sistema para un cliente nuevo, seguir estos pasos en orden:

### 1. Crear proyecto Supabase
- Nuevo proyecto en supabase.com (Free o Pro)
- Anotar: Project URL, Anon Key, Service Role Key
- Region cercana al cliente

### 2. Aplicar estructura de BD
- Vincular: `supabase link --project-ref [ID]`
- Aplicar migraciones: `supabase db push`
- Verificar tablas y configurar RLS granular

### 3. Deploy en Vercel
- Crear proyecto en Vercel conectado al repo
- Configurar variables de entorno:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_SITE_URL
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

### 4. Crear usuario administrador
- Crear primer usuario con rol Admin en la BD

### 5. Configurar Datos Empresa (CRITICO para correos)
- El cliente DEBE registrar sus datos en el modulo "Datos Empresa":
  - **Nombre de la empresa**: Aparece en header de emails y PDFs
  - **Correo de la empresa**: Se usa como remitente de correos
  - **Servidor de correo (SMTP)**: Para que los correos salgan desde su dominio
  - **Logo**: Aparece en PDFs y emails
  - **Direccion, telefono, RIF/NIT**: Aparecen en documentos oficiales
- Sin esto, los correos salen con identidad generica y los clientes del cliente no saben quien les envio

### 6. Configurar modulos activos
- Activar/desactivar modulos segun necesidad del cliente

### 7. Capacitacion y entrega
- Entregar credenciales
- Capacitar en uso basico
- Verificar envio de correos con identidad correcta
- Soporte inicial primera semana

**Why:** Cada cliente necesita que el sistema refleje SU identidad de empresa en todos los correos y documentos que genera. Sin esto, los proveedores y empleados no reconocen quien les envia.

**How to apply:** Siempre completar el paso 5 antes de dar el sistema por entregado. Verificar enviando un correo de prueba y confirmando que llega con el nombre y logo del cliente.
