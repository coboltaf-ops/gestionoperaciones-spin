---
name: replica-milagros
description: Réplica independiente de SPIN para Grupo Milagros (localhost demo)
metadata:
  type: project
---

Se está construyendo **Gestión de Operaciones Milagros**: una réplica independiente del sistema SPIN para el cliente **Grupo Milagros** (empresa con SAP; el objetivo es demostrar un ERP apoyado en IA como prueba de concepto con datos de prueba).

**Ubicación y ejecución:**
- Carpeta hermana: `/Users/josepalomares/aplicaciones/gestionoperaciones-milagros` (clon de SPIN, sin `node_modules`/`.next`/`.git`/`.vercel`).
- Corre en **localhost:3002** (`npm run dev`). SPIN sigue en 3001.
- Es solo para **demo/pruebas en localhost** — sin Vercel por ahora.

**Acceso (usuario admin de demo):** `admin` / `Milagros2026*` (rol Admin). Hash bcrypt en `data/usuarios.json`.

**Diseño de auth:** `src/app/api/auth/login/route.ts` tiene **modo demo local**: si las vars de Supabase están vacías (ver `.env.local`), valida contra `data/usuarios.json`; si se llenan (URL con "supabase" + service role), usa Supabase. Así entra sin nube y luego migra sin refactor.

**Rebrand hecho:** nombre `gestionoperaciones-milagros`, textos en `messages/es.json` y `en.json` (app.title/brand + login.brand = "Grupo Milagros"), logo placeholder en `public/milagros-logo.svg` (referenciado en login page y `use-company-logo.ts`), empresa "GRUPO MILAGROS" en `data/datos-empresa.json`.

**Datos:** vaciados (`data/*.json` transaccionales = `[]`, más seeds hardcodeados eliminados en `bodegas/page.tsx` y `centros-costo/page.tsx`). Referencias: `tipo_inventario` reducido a 3 (Materia Prima, Materiales y Suministros, Producto Terminado); categoria/grupo/subgrupo vacíos. Producto clasifica por Categoría → Grupo → Sub-Grupo.

**Modelo de negocio del cliente:** fábrica EXTERNA (maquilador). La materia prima se compra y almacena en bodegas de Milagros, y se despacha por **"bono de salida"** al proveedor para fabricación. En SPIN eso es el módulo **Salidas de Almacén** (hoy despacha a Centro de Costo) → pendiente adaptarlo para despachar a proveedor/maquilador externo.

**Pendientes:**
- Integrar **logo real PNG** (lo enviará el usuario) en login, sidebar, Datos Empresa y **reportes PDF** (`src/shared/lib/logo-base64.ts` + `emp.logo`; jspdf necesita raster PNG, no SVG).
- Crear **Supabase nuevo independiente** + migrar `usuarios` cuando se monten datos reales (el usuario debe crear el proyecto en su cuenta).
- Fase "acomodar": flujo bono de salida a fábrica externa; defaults país a Colombia (hoy quedan "Venezuela" heredados de SPIN).

Relacionado: [[productos-validaciones]]
