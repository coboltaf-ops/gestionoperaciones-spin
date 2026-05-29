---
name: Productos - Validaciones Activas
description: Validación de duplicados y código auto-incremental en productos
type: project
---

## Productos — Reglas Activas

### Código Auto-Incremental
- Formato: PROD-NNNNN (ej: PROD-00001, PROD-00002)
- Se genera automáticamente al crear producto

### Validación de Duplicados
- No permite descripciones duplicadas (case-insensitive con trim)

### Estilos por Situación
- Activo → azul
- Descontinuado → ámbar
- Inactivo → rojo

**Why:** Consistencia en catálogo de materiales de construcción.
**How to apply:** Mantener estas validaciones al modificar el módulo de productos.
