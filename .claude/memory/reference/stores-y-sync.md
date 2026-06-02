---
name: Stores y Sincronización
description: Ubicación de stores, patrón de persistencia, y mecanismo de sync con servidor
type: reference
---

## Stores Zustand
- Ubicación: `src/features/[feature]/store/[feature]-store.ts`
- Todos usan `persist` middleware con localStorage
- Nombres de storage keys: `[feature]-storage` (ej: `referencias-storage`, `productos-storage`)

### ⚠️ IMPORTANTE: Configuración correcta de persist()
TODOS los stores DEBEN tener `storage: createJSONStorage(() => localStorage)` en su config:

```typescript
export const useMyStore = create<MyState>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'my-storage',
      storage: createJSONStorage(() => localStorage), // ← OBLIGATORIO
    }
  )
)
```

**Por qué**: Sin `storage` explícito, Zustand puede usar sessionStorage o no persistir correctamente, causando pérdida de datos al refrescar.

**Caso real** (2026-06-02): 24 stores NO tenían esto → datos desaparecían al cerrar/abrir navegador → **SOLUCIONADO con commit 71642eb**

## Sincronización
- ServerSyncProvider en `src/shared/components/server-sync-provider.tsx`
- Lógica: al montar, si servidor tiene datos → carga (servidor = fuente de verdad). Si servidor vacío → push local a servidor
- Auto-save: guarda en servidor cuando cambian datos del store
- Race-safety: ref `fetchDone` previene saves durante carga inicial

## API
- Endpoint: `/api/data/[collection]/route.ts`
- Colecciones permitidas (whitelist): productos, proveedores, bodegas, ordenes-compra, referencias, transferencias, ajustes-inventario, centros-costo, correos-enviados, recepciones, usuarios
- `referencias` se guarda como objeto JSON (no array)

## Shared Utilities
- `src/shared/components/report-panel.tsx` — reportes con export
- `src/shared/lib/export-report.ts` — PDF/Excel/Print
- `src/shared/lib/format-date.ts` — formato DD/MM/AAAA
