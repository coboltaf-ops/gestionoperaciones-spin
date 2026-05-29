# PRP-001: Módulo de Configuración — Activar/Desactivar Módulos CRM GTM

> **Estado**: PENDIENTE
> **Fecha**: 2026-03-17
> **Proyecto**: Gestión de Inventario — CRM GTM

---

## Objetivo

Construir un panel de configuración donde el administrador pueda activar o desactivar módulos del sistema CRM GTM (Clientes, Contactos, Oportunidades, Tareas, Tickets), y que el menú lateral refleje en tiempo real solo los módulos habilitados.

---

## Por Qué

| Problema | Solución |
|----------|----------|
| El menú lateral es estático: muestra todos los módulos aunque no todos sean relevantes para el negocio del cliente | Un panel de configuración que persiste el estado activo/inactivo de cada módulo |
| Cada instalación del sistema tiene necesidades distintas; forzar todos los módulos genera ruido visual | El sidebar lee el store de configuración y renderiza solo los módulos activados |
| No existe una forma de escalar el sistema sin recompilar código para habilitar/deshabilitar funcionalidad | Un store Zustand con `persist` permite encender/apagar módulos sin tocar código |

**Valor de negocio**: Reduce la fricción de onboarding al mostrar solo lo relevante para cada cliente. Permite al administrador adaptar el sistema sin intervención técnica. Sienta las bases de un sistema multi-tenant con features flag.

---

## Qué

### Criterios de Éxito

- [ ] El panel de configuración está accesible desde `/configuracion` con una ruta protegida en el sidebar
- [ ] El administrador puede activar/desactivar cada uno de los 5 módulos CRM con un toggle
- [ ] El sidebar se actualiza inmediatamente (sin recarga) cuando un módulo se activa o desactiva
- [ ] El estado de los módulos persiste entre sesiones (Zustand `persist` en localStorage)
- [ ] Los módulos desactivados no aparecen en el sidebar ni son navegables directamente
- [ ] `npm run typecheck` y `npm run build` pasan sin errores

### Comportamiento Esperado (Happy Path)

1. El administrador navega a `/configuracion` desde el link en el sidebar (sección inferior o separada)
2. Ve un panel con los 5 módulos CRM: Clientes, Contactos, Oportunidades, Tareas, Tickets
3. Cada módulo muestra su nombre, ícono, descripción breve y un toggle ON/OFF
4. Al hacer toggle en "Oportunidades" → el switch cambia a OFF visualmente al instante
5. El sidebar, que lee el mismo store, elimina "Oportunidades" de la navegación de inmediato
6. Al refrescar la página, el sidebar sigue sin mostrar "Oportunidades" (estado persistido)
7. El administrador puede volver al panel y reactivar el módulo con un toggle → reaparece en el sidebar

---

## Contexto

### Referencias

- `src/app/(main)/layout.tsx` — Sidebar actual con `navItems` hardcodeados. Este es el archivo clave a modificar para leer el store dinámicamente
- `src/features/usuarios/store/current-user-store.ts` — Patrón de Zustand con `persist`. Modelo exacto a replicar para el store de módulos
- `src/features/bodegas/store/bodegas-store.ts` — Segundo ejemplo del patrón Zustand + persist del proyecto
- `src/app/(main)/bodegas/page.tsx` — Patrón de página para orientar la estructura del panel de configuración

### Arquitectura Propuesta (Feature-First)

```
src/features/configuracion/
├── components/
│   ├── module-toggle-card.tsx     # Tarjeta individual de módulo con toggle
│   └── modules-config-panel.tsx   # Panel completo con lista de módulos
├── store/
│   └── modules-store.ts           # Zustand + persist — estado ON/OFF de módulos
└── types/
    └── index.ts                   # Tipos: ModuleId, ModuleConfig, ModulesState

src/app/(main)/configuracion/
└── page.tsx                        # Página /configuracion que renderiza el panel
```

### Módulos CRM GTM a gestionar

| ModuleId | Nombre display | Ícono | Ruta |
|----------|---------------|-------|------|
| `clientes` | Clientes | 👥 | `/clientes` |
| `contactos` | Contactos | 📇 | `/contactos` |
| `oportunidades` | Oportunidades | 💼 | `/oportunidades` |
| `tareas` | Tareas | ✅ | `/tareas` |
| `tickets` | Tickets | 🎫 | `/tickets` |

### Modelo de Datos (Solo Store, sin BD)

El estado se gestiona 100% en cliente con Zustand + `persist` (localStorage). No requiere migración de base de datos en esta versión.

```typescript
// src/features/configuracion/types/index.ts
export type ModuleId = 'clientes' | 'contactos' | 'oportunidades' | 'tareas' | 'tickets'

export type ModuleConfig = {
  id: ModuleId
  name: string
  icon: string
  description: string
  href: string
  enabled: boolean
}

export interface ModulesState {
  modules: ModuleConfig[]
  toggleModule: (id: ModuleId) => void
  isEnabled: (id: ModuleId) => boolean
}
```

```typescript
// Estructura del store (patrón idéntico a current-user-store.ts)
export const useModulesStore = create<ModulesState>()(
  persist(
    (set, get) => ({
      modules: [...],  // 5 módulos, todos enabled: true por defecto
      toggleModule: (id) => set(s => ({
        modules: s.modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m)
      })),
      isEnabled: (id) => get().modules.find(m => m.id === id)?.enabled ?? true,
    }),
    { name: 'crm-modules-config' }
  )
)
```

### Cambio en el Sidebar

El `layout.tsx` actual tiene `navItems` hardcodeados. La modificación será:

1. Importar `useModulesStore`
2. Leer `modules` del store
3. Filtrar con `.filter(m => m.enabled)` antes de renderizar
4. Agregar el link de "Configuración" al final del nav (siempre visible, no toggleable)

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo se definen FASES. Las subtareas se generan al entrar a cada fase siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Store de Configuración de Módulos
**Objetivo**: Crear el store Zustand con el estado inicial de los 5 módulos CRM, sus tipos, y la acción `toggleModule`
**Validación**: El store exporta `useModulesStore` con los 5 módulos y `toggleModule` funciona en prueba unitaria mental (toggle cambia `enabled`)

### Fase 2: Panel de Configuración UI
**Objetivo**: Crear los componentes `ModuleToggleCard` y `ModulesConfigPanel`, y la página `/configuracion/page.tsx` que los renderiza
**Validación**: La ruta `/configuracion` carga sin errores, muestra las 5 tarjetas con toggle, y el toggle actualiza el estado visualmente

### Fase 3: Sidebar Dinámico
**Objetivo**: Modificar `src/app/(main)/layout.tsx` para leer el store de módulos y renderizar solo los módulos habilitados; agregar el link de Configuración al sidebar
**Validación**: Al activar/desactivar un toggle en `/configuracion`, el sidebar refleja el cambio inmediatamente sin recarga de página

### Fase 4: Validación Final
**Objetivo**: Sistema funcionando end-to-end con persistencia entre sesiones
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Desactivar un módulo → desaparece del sidebar → recargar página → sigue desaparecido
- [ ] Reactivar módulo → reaparece en sidebar al instante
- [ ] Playwright screenshot confirma UI del panel y sidebar dinámico

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.

*(vacío — se completa durante la ejecución)*

---

## Gotchas

- [ ] El `layout.tsx` usa `'use client'` — el store de Zustand solo funciona en Client Components, esto ya está alineado
- [ ] Zustand `persist` escribe en localStorage; en SSR el store no está disponible en el primer render. Usar `useHydration` o chequear `mounted` si hay hydration mismatch
- [ ] Los módulos CRM (`/clientes`, `/contactos`, etc.) **aún no existen** como rutas. El sidebar los mostrará como links, pero las páginas se crearán en PRPs futuros. El toggle debe funcionar igual aunque la ruta no exista
- [ ] No usar `any` en TypeScript — el tipo `ModuleId` como union literal previene esto
- [ ] El link de "Configuración" en el sidebar debe ser siempre visible (no toggleable), para que el admin no se quede sin acceso al panel

## Anti-Patrones

- NO duplicar la lista de módulos (definirla una sola vez en el store, no en el layout)
- NO usar `localStorage` directamente — todo pasa por Zustand `persist`
- NO hardcodear strings de módulos — usar el tipo `ModuleId` como fuente de verdad
- NO ignorar errores de TypeScript
- NO omitir el estado inicial `enabled: true` para todos los módulos (el sistema arranca con todo activo)

---

*PRP pendiente aprobación. No se ha modificado código.*
