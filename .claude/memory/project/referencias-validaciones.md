---
name: Tablas de Referencias - Validaciones y Ordenamiento
description: Validación de duplicados y ordenamiento alfabético implementados en las 14 tablas de referencias
type: project
---

## Tablas de Referencias — Reglas Activas

### Validación de Duplicados (YA IMPLEMENTADA)
- En `addRecord` y `updateRecord` del reference-store.ts
- Comparación case-insensitive con trim: `descripcion.trim().toLowerCase()`
- Mensaje: "Ya existe un registro con la descripción X en esta tabla."
- Aplica a las 14 tablas de referencias

### Ordenamiento Alfabético (YA IMPLEMENTADO)
- En referencias-manager.tsx: `activeData` se ordena con `localeCompare('es')`
- Soporta acentos y caracteres especiales del español
- Aplica automáticamente a todas las tablas

### Deep-Merge en Persistencia
- El reference-store usa merge custom para que nuevas tablas en initialData siempre estén disponibles aunque localStorage tenga versión vieja

### 14 Tablas
categoría, grupo, subgrupo, unidad_medida, tipo_inventario, tipo_moneda, actividad_proveedor, condiciones_pago, situación_producto, situación_orden_compra, situación_bodega, situación_proveedor, tipo_identificación, tipo_ajuste

**Why:** El usuario requiere integridad de datos — no duplicados y siempre ordenado.
**How to apply:** Cualquier nueva tabla de referencia debe seguir estos mismos patrones.
