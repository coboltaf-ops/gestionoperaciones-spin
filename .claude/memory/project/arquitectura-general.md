---
name: Arquitectura General del Sistema
description: Stack, estructura de archivos, patrones de stores, sync, y APIs del sistema de inventario Constructora Borinquen
type: project
---

## Sistema de Gestion de Inventario — Constructora Borinquen

### Stack
- Next.js 16 + React 19 + TypeScript + Tailwind CSS 3.4
- Zustand con persist middleware (localStorage)
- Sincronizacion bidireccional localStorage <-> /api/data/[collection] via ServerSyncProvider
- API genérica /api/data/[collection] guarda en JSON en disco
- Email de OC via nodemailer con PDF adjunto (jsPDF)

### 12 Módulos (cada uno con su Zustand store + página)
1. Dashboard — métricas generales
2. Productos — catálogo (código auto PROD-NNNNN, validación duplicados)
3. Proveedores — directorio con contacto completo
4. Órdenes de Compra — con DetalleOrden[] (líneas anidadas)
5. Recepción de Facturas — liga recepciones a OC, tracking de cantidades
6. Bodegas — ubicaciones de almacén
7. Transferencias — movimientos entre bodegas con RenglonTransferencia[]
8. Ajustes de Inventario — correcciones de stock con tipo +/- y RenglonAjuste[]
9. Centros de Costo — asignación de gastos
10. Correos Enviados — log de emails de OC
11. Tablas de Referencias — 14 tablas maestras configurables
12. Usuarios — gestión de cuentas y roles

### Patrones Clave
- Todas las páginas: tabs "Registros" + "Reportes" (ReportPanel con export PDF/Excel/Print)
- Campos `situacion` en casi todas las entidades (Activo/Inactivo/etc)
- Formato moneda: `toLocaleString('es-CO', ...)`
- Formato fecha: DD/MM/AAAA via shared/lib/format-date.ts
- UI glassmorphism (fondo oscuro, blur, bordes translúcidos)

### Shared Components
- ReportPanel: filtros dinámicos, columnas seleccionables, sumas, export
- ServerSyncProvider: sync bidireccional localStorage <-> API
- export-report.ts: PDF/Excel/Print

### APIs
- GET/PUT /api/data/[collection] — CRUD genérico (11 colecciones en whitelist)
- POST /api/send-order-email — envío OC por email con PDF
