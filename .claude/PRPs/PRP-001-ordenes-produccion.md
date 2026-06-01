# PRP-001: Módulo Completo de Órdenes de Producción

> **Estado**: PENDIENTE APROBACIÓN
> **Fecha**: 2026-05-31
> **Proyecto**: gestionoperaciones-spin

---

## Objetivo

Construir un módulo completo de **Órdenes de Producción** con CRUD operacional, gestión de estados de producción, integración con tablas de Clientes y Productos, y validación de permisos con RLS. El sistema debe permitir crear, trackear y finalizar órdenes de producción con control automático de consecutivos y auditoría de cambios.

## Por Qué

| Problema | Solución |
|----------|----------|
| Sin trazabilidad de órdenes de producción | Sistema centralizado que registra cada orden desde emisión hasta finalización |
| Consecutivos manuales → errores | Generación automática de consecutivos (OP-001, OP-002...) |
| Sin validación de datos entrada | Validación con Zod en cliente/servidor antes de guardar |
| Sin control de permisos | RLS en Supabase asegura que usuarios solo vean/editen sus órdenes |
| Sin historial de cambios | Timestamps (created_at, updated_at) y campo updated_by |

**Valor de negocio**: Reducir errores en producción, mejorar trazabilidad, acelerar auditorías, cumplimiento normativo.

---

## Qué

### Criterios de Éxito

- [ ] Tabla `ordenes_produccion` creada en Supabase con todos los campos y RLS habilitado
- [ ] CRUD funcional: crear orden con cliente/producto seleccionados, leer listado con paginación, actualizar orden (solo si no está Finalizada), eliminar orden (soft delete o marca cancelada)
- [ ] Página `/ordenes-produccion` con listado, filtros por Cliente/Producto/Situación, y paginación
- [ ] Formulario de crear/editar con validación Zod (cliente + servidor)
- [ ] Vista detallada de orden individual con historial de cambios
- [ ] Consecutivos automáticos (OP-001, OP-002...) sin duplicados
- [ ] Estados de Situación funcionales: Borrador → En Producción → Finalizada, con transiciones validadas
- [ ] RLS restricciones: usuarios solo ven/editan órdenes de su empresa/departamento
- [ ] Integración con tablas Clientes (select dropdown) y Productos (select dropdown)
- [ ] TypeScript 100% type-safe (sin `any`)
- [ ] Componentes reutilizables (dialog, form, table)

### Comportamiento Esperado (Happy Path)

1. **Usuario accede a `/ordenes-produccion`**
   - Ve listado de todas las órdenes de su empresa (RLS)
   - Columnas: Consecutivo, Cliente, Producto, Cantidad Planeada, Cantidad Real, Situación, Fecha

2. **Crea una nueva orden: botón "Nueva Orden"**
   - Abre Modal/Dialog con Formulario
   - Campos:
     - Cliente (Select → carga desde tabla `clientes`)
     - Producto a Producir (Select → carga desde tabla `productos`)
     - Cantidad a Producir (Kgs) - number input, requerido
     - Fecha Real de Producción (date picker)
     - Observaciones (textarea)
   - Validación al guardar con Zod:
     - Cliente requerido
     - Producto requerido
     - Cantidad > 0
     - Fecha válida
   - Al guardar:
     - Genera consecutivo automático (OP-001, OP-002...)
     - Asigna Preparada por = usuario actual
     - Situación = "Borrador"
     - Inserta en tabla

3. **Edita una orden existente (Borrador)**
   - Abre misma modal con datos precargados
   - Puede cambiar Cliente, Producto, Cantidad, Observaciones
   - Bloquea edición si Situación = "Finalizada"

4. **Transición de estado: Borrador → En Producción → Finalizada**
   - Botón en vista detallada: "Iniciar Producción"
   - Valida que Cantidad a Producir > 0
   - Cambia Situacion = "En Producción"
   - Cuando termina: "Finalizar Orden"
   - Ingresa "Cantidad Real Producida"
   - Cambia Situacion = "Finalizada"
   - Ya no se puede editar

5. **Filtros en listado**
   - Por Cliente (multi-select o combobox)
   - Por Producto (multi-select)
   - Por Situación (checkbox: Borrador, En Producción, Finalizada, Cancelada)
   - Guardar filtros en querystring para shareable URLs

6. **Eliminación**
   - Botón "Cancelar Orden" en órdenes Borrador/En Producción
   - Soft delete: marca Situacion = "Cancelada" (no elimina datos)

---

## Contexto

### Referencias Existentes

#### Código Similar
- `src/features/pedidos/` - Patrón similar: CRUD, store Zustand, tipos TypeScript
- `src/features/productos/` - Select de productos, relaciones
- `src/features/salidas-almacen/` - Listado con filtros
- `src/app/(main)/pedidos/page.tsx` - UI de listado

#### Tablas Supabase Relacionadas
- `clientes` - para Select de clientes
- `productos` - para Select de productos
- `auth.users` - para usuario "Preparada por"

### Arquitectura Propuesta (Feature-First)

```
src/features/produccion/
├── components/
│   ├── ordenes-list.tsx          # Tabla con listado
│   ├── orden-form.tsx             # Formulario crear/editar
│   ├── orden-detail.tsx           # Vista detallada
│   ├── orden-filters.tsx          # Filtros sidebar/toolbar
│   └── estado-badge.tsx           # Badge de situación
│
├── hooks/
│   ├── use-ordenes-produccion.ts # Hook custom para fetch + cache
│   └── use-orden-form.ts          # Hook de lógica formulario
│
├── services/
│   └── ordenes-service.ts         # API calls a supabase
│
├── store/
│   └── ordenes-produccion-store.ts # Zustand (ya existe)
│
└── types/
    └── index.ts                   # OrdenProduccion (ya existe)

src/app/(main)/
└── ordenes-produccion/
    ├── page.tsx                   # Página principal /ordenes-produccion
    ├── [id]/
    │   └── page.tsx               # Vista detallada /ordenes-produccion/[id]
    └── layout.tsx                 # Layout compartido
```

### Modelo de Datos (Supabase)

```sql
-- Tabla principal
CREATE TABLE ordenes_produccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Numeración automática
  nro_orden BIGINT NOT NULL UNIQUE GENERATED ALWAYS AS IDENTITY,
  consecutivo TEXT UNIQUE NOT NULL, -- OP-00001, se genera con trigger
  
  -- Relaciones
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  empresa_id UUID NOT NULL REFERENCES empresas(id), -- para RLS
  
  -- Fechas
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_produccion TIMESTAMPTZ NOT NULL,
  
  -- Cantidades
  cantidad_producir NUMERIC(12,2) NOT NULL CHECK (cantidad_producir > 0),
  cantidad_real NUMERIC(12,2) DEFAULT 0,
  
  -- Responsable
  preparada_por UUID NOT NULL REFERENCES auth.users(id),
  
  -- Estado
  situacion TEXT NOT NULL DEFAULT 'Borrador'
    CHECK (situacion IN ('Borrador', 'En Producción', 'Finalizada', 'Cancelada')),
  
  -- Auditoría
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT cantidad_real_valid CHECK (cantidad_real >= 0)
);

-- Índices para queries frecuentes
CREATE INDEX idx_ordenes_cliente ON ordenes_produccion(cliente_id);
CREATE INDEX idx_ordenes_producto ON ordenes_produccion(producto_id);
CREATE INDEX idx_ordenes_empresa ON ordenes_produccion(empresa_id);
CREATE INDEX idx_ordenes_situacion ON ordenes_produccion(situacion);
CREATE INDEX idx_ordenes_fecha ON ordenes_produccion(fecha_registro DESC);

-- RLS: Usuarios solo ven órdenes de su empresa
ALTER TABLE ordenes_produccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company orders"
  ON ordenes_produccion
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM usuarios
      WHERE empresa_id = ordenes_produccion.empresa_id
    )
  );

CREATE POLICY "Users edit own company orders"
  ON ordenes_produccion
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM usuarios
      WHERE empresa_id = ordenes_produccion.empresa_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM usuarios
      WHERE empresa_id = ordenes_produccion.empresa_id
    )
  );

CREATE POLICY "Users insert own company orders"
  ON ordenes_produccion
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM usuarios
      WHERE empresa_id = ordenes_produccion.empresa_id
    )
  );

-- Trigger para generar consecutivo automático
CREATE OR REPLACE FUNCTION generar_consecutivo_orden()
RETURNS TRIGGER AS $$
BEGIN
  NEW.consecutivo := 'OP-' || LPAD(NEW.nro_orden::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_consecutivo_orden
BEFORE INSERT ON ordenes_produccion
FOR EACH ROW
EXECUTE FUNCTION generar_consecutivo_orden();

-- Trigger para actualizar updated_at y updated_by
CREATE OR REPLACE FUNCTION actualizar_auditoria_orden()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_auditoria_orden
BEFORE UPDATE ON ordenes_produccion
FOR EACH ROW
EXECUTE FUNCTION actualizar_auditoria_orden();
```

### Validación (Zod)

```typescript
export const ordenProduccionSchema = z.object({
  cliente_id: z.string().uuid('Cliente requerido'),
  producto_id: z.string().uuid('Producto requerido'),
  cantidad_producir: z.number().positive('Cantidad debe ser mayor a 0'),
  fecha_produccion: z.string().datetime('Fecha válida requerida'),
  observaciones: z.string().optional(),
  situacion: z.enum(['Borrador', 'En Producción', 'Finalizada', 'Cancelada']).optional(),
})

export const transicionEstadoSchema = z.object({
  id: z.string().uuid(),
  nueva_situacion: z.enum(['En Producción', 'Finalizada', 'Cancelada']),
  cantidad_real: z.number().nonnegative().optional(),
})
```

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan en cada fase usando bucle agéntico.

### Fase 1: Preparación de BD (Supabase)
**Objetivo**: Tabla `ordenes_produccion` creada, con relaciones, índices, RLS y triggers
**Validación**:
- [ ] Migration aplicada sin errores
- [ ] Tabla visible en Supabase dashboard
- [ ] RLS policies visibles
- [ ] Triggers creados
- [ ] `list_tables --verbose` muestra columnas correctas

### Fase 2: Tipos + Store Zustand
**Objetivo**: TypeScript types y store Zustand actualizado
**Validación**:
- [ ] Types en `src/features/produccion/types/index.ts` actualizados
- [ ] Store extendido con acciones CRUD
- [ ] Tipado 100% (sin `any`)

### Fase 3: Servicios + API
**Objetivo**: Funciones para comunicar con Supabase (fetch, insert, update, delete)
**Validación**:
- [ ] `src/features/produccion/services/ordenes-service.ts` funcional
- [ ] Queries devuelven datos correctos
- [ ] Errores manejados

### Fase 4: Componentes UI (Lista)
**Objetivo**: Tabla listado de órdenes con filtros
**Validación**:
- [ ] Componente `ordenes-list.tsx` renderiza tabla
- [ ] Columnas visibles: Consecutivo, Cliente, Producto, Cantidad, Situación, Fecha
- [ ] Filtros funcionales (Cliente, Producto, Situación)
- [ ] Paginación si hay > 10 órdenes

### Fase 5: Componentes UI (Formulario)
**Objetivo**: Formulario crear/editar orden con validación Zod
**Validación**:
- [ ] Modal/Dialog abre al hacer clic "Nueva Orden"
- [ ] Selects de Cliente/Producto cargan datos
- [ ] Validación Zod en formulario
- [ ] Guardado exitoso crea orden en BD
- [ ] Edición precarga datos

### Fase 6: Vista Detallada
**Objetivo**: Página `/ordenes-produccion/[id]` con detalles y transiciones
**Validación**:
- [ ] Ruta dinámica funciona
- [ ] Carga datos de orden específica
- [ ] Botones de transición (Iniciar/Finalizar)
- [ ] Historial de cambios visible (updated_at, updated_by)

### Fase 7: Integración + Validación Final
**Objetivo**: Módulo operacional end-to-end
**Validación**:
- [ ] `npm run typecheck` sin errores
- [ ] `npm run build` exitoso
- [ ] Página `/ordenes-produccion` funciona con datos reales
- [ ] Flujo completo: crear → editar → finalizar
- [ ] Todos los criterios de éxito cumplidos

---

## 🧠 Aprendizajes (Self-Annealing)

> Esta sección se actualiza con cada error encontrado en implementación.

*(Vacío al inicio - se llena durante bucle-agentico)*

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] **RLS puede bloquear reads**: Si RLS está muy restrictivo, users no verán datos. Testear permisos temprano.
- [ ] **Consecutivos únicos**: El trigger debe asegurar que no haya duplicados en `consecutivo`. Validar con unique constraint.
- [ ] **Timestamp sync**: `created_at` y `updated_at` deben ser TIMESTAMPTZ para sincronización correcta en zonas horarias.
- [ ] **Soft delete vs Hard delete**: Decidir si "Cancelada" es soft delete o eliminar registro. Plan actual: soft delete (marca como Cancelada).
- [ ] **Relaciones cascada**: Producto/Cliente eliminadas no deben eliminar órdenes. Usar ON DELETE RESTRICT.
- [ ] **Estado machine validation**: Solo ciertos estados pueden transicionar a otros (Borrador → En Producción → Finalizada). Validar en servidor.
- [ ] **Usuarios contexto sesión**: "Preparada por" debe obtener `auth.uid()` de sesión. No pasar manualmente.

## Anti-Patrones

- NO crear un componente monolítico que haga todo (lista + form + detalle)
- NO omitir validación Zod en servidor (solo cliente es insuficiente)
- NO hardcodear estados como strings, usar enum o const
- NO ignorar RLS - puede causar data leaks
- NO hacer N queries cuando 1 JOIN resuelve (considerar select con joins)
- NO usar timestamps `timestamp` (sin TZ) en producción

---

*PRP pendiente aprobación del usuario. No se ha modificado código del proyecto.*
