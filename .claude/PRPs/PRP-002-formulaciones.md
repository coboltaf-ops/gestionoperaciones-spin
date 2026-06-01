# PRP-002: Módulo Formulaciones (BOM - Bill of Materials)

**Fecha:** 2026-05-31  
**Estado:** En Revisión  
**Prioridad:** CRÍTICA  
**Aprobado por:** José Palomares

---

## 1. DESCRIPCIÓN EJECUTIVA

Sistema para definir **Fórmulas de Producción** (BOM) donde especialistas en producción especifican qué **Materia Prima** se necesita para fabricar un **Producto Terminado**.

Cada Formulación es un template que define:
- ✅ Producto Terminado final (SELECCIONAR del catálogo)
- ✅ Componentes/Ingredientes necesarios (Materia Prima)
- ✅ Cantidades exactas de cada componente

Las Formulaciones se usan luego en **Órdenes de Producción** para calcular qué se debe fabricar.

---

## 2. ESPECIFICACIÓN TÉCNICA

### 2.1 Tabla Supabase: `formulaciones`

```sql
CREATE TABLE formulaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificación
  nro_formula integer NOT NULL,
  consecutivo text NOT NULL UNIQUE, -- FORM-00001
  
  -- Producto Terminado (seleccionado del catálogo)
  producto_terminado_id uuid NOT NULL REFERENCES productos(id),
  producto_terminado_codigo text NOT NULL,
  producto_terminado_nombre text NOT NULL,
  unidad_medida text NOT NULL,
  
  -- Metadatos
  nombre_formula text,
  descripcion text,
  
  -- Estado
  situacion text NOT NULL DEFAULT 'Activa' CHECK (situacion IN ('Activa', 'Inactiva')),
  
  -- Auditoría
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  empresa_id uuid NOT NULL,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE INDEX idx_formulaciones_producto ON formulaciones(producto_terminado_id);
CREATE INDEX idx_formulaciones_empresa ON formulaciones(empresa_id);
```

### 2.2 Tabla Supabase: `formulaciones_renglones`

```sql
CREATE TABLE formulaciones_renglones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referencia a Formulación
  formulacion_id uuid NOT NULL REFERENCES formulaciones(id) ON DELETE CASCADE,
  
  -- Materia Prima (seleccionada del catálogo)
  producto_id uuid NOT NULL REFERENCES productos(id),
  producto_codigo text NOT NULL,
  producto_nombre text NOT NULL,
  unidad_medida text NOT NULL,
  
  -- Cantidad necesaria para hacer 1 unidad del Producto Terminado
  cantidad_necesaria numeric(12,4) NOT NULL,
  
  -- Orden del renglón
  numero_renglon integer NOT NULL,
  
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  
  FOREIGN KEY (formulacion_id) REFERENCES formulaciones(id) ON DELETE CASCADE
);

CREATE INDEX idx_formulaciones_renglones_formulacion ON formulaciones_renglones(formulacion_id);
CREATE INDEX idx_formulaciones_renglones_producto ON formulaciones_renglones(producto_id);
```

---

## 3. TIPOS TYPESCRIPT

### 3.1 `RenglonFormulacion`
```typescript
type RenglonFormulacion = {
  id: string
  formulacion_id: string
  producto_id: string
  producto_codigo: string
  producto_nombre: string
  unidad_medida: string
  cantidad_necesaria: number
  numero_renglon: number
  created_at?: string
  updated_at?: string
}
```

### 3.2 `Formulacion`
```typescript
type Formulacion = {
  id: string
  nro_formula: number
  consecutivo: string // FORM-00001
  
  // Producto Terminado
  producto_terminado_id: string
  producto_terminado_codigo: string
  producto_terminado_nombre: string
  unidad_medida: string
  
  // Metadatos
  nombre_formula?: string
  descripcion?: string
  
  // Renglones (Materia Prima)
  renglones: RenglonFormulacion[]
  
  // Estado
  situacion: 'Activa' | 'Inactiva'
  
  // Auditoría
  created_at?: string
  updated_at?: string
  empresa_id: string
}
```

---

## 4. STORE ZUSTAND

**Archivo:** `src/features/produccion/store/formulaciones-store.ts`

```typescript
interface FormulacionesState {
  formulaciones: Formulacion[]
  addFormulacion: (f: Formulacion) => void
  updateFormulacion: (id: string, f: Partial<Formulacion>) => void
  deleteFormulacion: (id: string) => void
  setFormulaciones: (fs: Formulacion[]) => void
  getMaxNroFormula: () => number
}
```

**Métodos:**
- ✅ `addFormulacion(f)` → Agregar nueva formulación
- ✅ `updateFormulacion(id, f)` → Actualizar (incluye renglones)
- ✅ `deleteFormulacion(id)` → Eliminar formulación + sus renglones
- ✅ `getMaxNroFormula()` → Obtener próximo número

---

## 5. PÁGINA CRUD

**Ruta:** `/app/(main)/produccion/formulaciones/page.tsx`

### 5.1 Funcionalidades

#### A. LISTA DE FORMULACIONES
- Tabla con: Consecutivo | Producto Terminado | Unidad | Estado | Acciones
- Búsqueda por: consecutivo, producto
- Filtros por: situacion (Activa/Inactiva)
- Acciones: Editar | Duplicar | Ver detalles | Eliminar

#### B. CREAR FORMULACIÓN
1. **Modal/Formulario:**
   - Campo: Seleccionar "Producto Terminado" (dropdown, tipo='Producto Terminado')
   - Auto-llenar: Código, Descripción, Unidad de Medida
   - Campo opcional: Nombre Fórmula
   - Campo opcional: Descripción

2. **Agregar Renglones (Materia Prima):**
   - Tabla inline para renglones
   - Botón: "+ Agregar Renglon"
   - Por cada renglón:
     - Seleccionar "Producto Materia Prima" (dropdown, tipo='Materia Prima')
     - Auto-llenar: Código, Descripción, Unidad
     - Input: Cantidad Necesaria (number, step=0.01)
     - Botón: Eliminar renglón
   - Validación: Mínimo 1 renglón

3. **Guardar:**
   - Generar UUID + nro_formula + consecutivo (FORM-00001)
   - Guardar formulación + todos los renglones
   - Verificar: producto_terminado_id ≠ ningún producto_id en renglones

#### C. EDITAR FORMULACIÓN
- Permitir editar:
  - Nombre/Descripción
  - Renglones (agregar/editar/eliminar)
- NO permitir cambiar Producto Terminado (para mantener integridad)
- Marcar como Activa/Inactiva

#### D. ELIMINAR FORMULACIÓN
- Confirmación: "¿Eliminar esta fórmula y todos sus renglones?"
- Si hay Órdenes de Producción que la usan → advertencia

### 5.2 Estilos
- Glassmorphism (como Órdenes de Producción)
- Colores estado: Activa (verde), Inactiva (gris)
- Responsive: Mobile-first

---

## 6. VALIDACIONES

| Campo | Validación |
|-------|-----------|
| Producto Terminado | Requerido, debe ser tipo 'Producto Terminado' |
| Renglones | Mínimo 1, máximo 50 |
| Producto en Renglón | Debe ser tipo 'Materia Prima', distinto a Producto Terminado |
| Cantidad Necesaria | > 0, numérico |
| Nombre Fórmula | Máx 255 caracteres (opcional) |

---

## 7. FLUJO DE IMPLEMENTACIÓN

### FASE 1: Migraciones Supabase
- [ ] Crear tablas: `formulaciones`, `formulaciones_renglones`
- [ ] Habilitar RLS con políticas
- [ ] Crear índices

### FASE 2: Tipos TypeScript
- [ ] Crear `src/features/produccion/types/formulacion.ts`
- [ ] Exportar `Formulacion`, `RenglonFormulacion`, `FormulacionFilters`

### FASE 3: Store Zustand
- [ ] Crear `src/features/produccion/store/formulaciones-store.ts`
- [ ] Implementar con persist middleware
- [ ] Métodos: add, update, delete, getMaxNro

### FASE 4: Página CRUD
- [ ] Crear `/app/(main)/produccion/formulaciones/page.tsx`
- [ ] Componente: ListaFormulaciones (tabla)
- [ ] Componente: FormulacionModal (crear/editar)
- [ ] Componente: RenglonFormulacionTable (renglones inline)

### FASE 5: Validación & Testing
- [ ] Testear crear/editar/eliminar formulaciones
- [ ] Testear agregar/editar/eliminar renglones
- [ ] Testear búsqueda y filtros
- [ ] Verificar BUILD limpio (npm run typecheck)

### FASE 6: Build & Deploy
- [ ] Build final sin errores
- [ ] Commit a main
- [ ] Deploy a Vercel

---

## 8. NOTAS IMPORTANTES

1. **Aislamiento de Empresa:** Usar `empresa_id` en RLS
2. **Consecutivos:** Sistema automático como en Órdenes (FORM-00001)
3. **Materia Prima vs Producto Terminado:** Validar que son tipos distintos
4. **Renglones:** No pueden editarse sin re-crear (eliminar + agregar)
5. **Integridad Referencial:** Proteger Productos (no borrar si están en uso)

---

## 9. ACEPTACIÓN

✅ **Especificación Clara:** Sí  
✅ **Campos Correctos:** Sí  
✅ **Validaciones Definidas:** Sí  
✅ **Flujo UX Claro:** Sí  

**Listo para BUCLE-AGENTICO:** SÍ ✅

---

*PRP creado: 2026-05-31*  
*Basado en especificación de José Palomares*
