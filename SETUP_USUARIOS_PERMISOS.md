# 🔐 SETUP: Usuarios y Permisos en Supabase

> Instrucciones paso a paso para activar el sistema de usuarios y permisos.

---

## ⚡ TL;DR

1. Abre: https://supabase.com/dashboard/project/[TU_PROJECT_ID]/sql/new
2. Copia TODO el contenido de `MIGRACIONES_SUPABASE.sql`
3. Pégalo en el editor SQL
4. Click en "Run"
5. Espera a que termine
6. **LISTO**: Sistema de usuarios y permisos activado

---

## 📋 QUE SE CREA

### Tablas (3)
- **usuarios** - Usuarios del sistema con claves hasheadas en bcrypt
- **modulos_sistema** - Módulos del sistema (Dashboard, Productos, etc.)
- **permisos** - Permisos por usuario/módulo con granularidad CRUD

### Usuarios (5)
| Usuario | Clave | Rol | Permisos |
|---------|-------|-----|----------|
| **jarango** | Password123! | Admin | Acceso total (CRUD en todo) |
| **contador** | Password456! | Contador | Lectura, creación, edición (sin eliminar) |
| **contable00** | Password789! | Contador | Lectura, creación, edición (sin eliminar) |
| **auxiliar** | Password012! | Auxiliar | Solo lectura |
| **admin** | Password345! | Admin | Acceso total |

### Módulos (12)
Dashboard, Productos, Proveedores, Órdenes de Compra, Recepción de Facturas, Bodegas, Transferencias, Salidas de Almacén, Ajustes de Inventario, Producción, Tareas, Reportes

---

## 🔧 COMO HACER EL SETUP

### Paso 1: Abre el editor SQL de Supabase

```
https://supabase.com/dashboard/project/[TU_PROJECT_ID]/sql/new
```

Reemplaza `[TU_PROJECT_ID]` con tu ID de proyecto (mira en la URL del dashboard).

### Paso 2: Copia el SQL

Abre el archivo: `/MIGRACIONES_SUPABASE.sql` en este proyecto

**Selecciona todo** (Ctrl+A) y **copia** (Ctrl+C)

### Paso 3: Pégalo en Supabase

En el editor SQL del paso 1, **pega** todo (Ctrl+V)

Debería verse así (fragmento):
```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario VARCHAR(255) UNIQUE NOT NULL,
  clave VARCHAR(255) NOT NULL,
  ...
)
```

### Paso 4: Ejecuta

Click azul en "Run" (arriba a la derecha)

Espera. Deberías ver:
```
✅ Success

Rows: 5 (from INSERT into usuarios)
Rows: 12 (from INSERT into modulos_sistema)
Rows: 60 (from INSERT into permisos - 5 usuarios × 12 módulos)
```

### Paso 5: Verifica en el Dashboard

1. Ve a "Tables" en la izquierda
2. Deberías ver 3 tablas nuevas:
   - `usuarios` (5 filas)
   - `modulos_sistema` (12 filas)
   - `permisos` (60 filas)

---

## ✅ PRUEBA EL LOGIN

### Opción A: En el navegador (local)

```bash
npm run dev
```

Luego ve a: `http://localhost:3000/login`

Intenta con:
- Usuario: `jarango`
- Clave: `Password123!`

Deberías entrar al dashboard.

### Opción B: Con curl (desde terminal)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"jarango","clave":"Password123!"}'
```

Respuesta esperada:
```json
{
  "ok": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "usuario": "jarango",
    "nombre": "Juan Andres",
    "apellido": "Arango Velasquez",
    "rol": "Admin",
    "correo": "jarango@empresa.com",
    "situacion": "Activo",
    "permisos": [
      { "modulo_id": "...", "leer": true, "crear": true, "editar": true, "eliminar": true },
      ...
    ]
  }
}
```

---

## 🛡️ COMO USAR PERMISOS EN COMPONENTES

### Verificar si el usuario puede hacer algo

```tsx
'use client'

import { usePermisos } from '@/features/usuarios/hooks/use-permisos'

export function MiComponente() {
  const { puedeVer, puedeCrear, puedeEditar, puedeEliminar } = usePermisos()

  return (
    <div>
      {puedeVer('productos') && <h1>Productos</h1>}
      
      {puedeCrear('productos') && (
        <button>Nuevo Producto</button>
      )}
      
      {!puedeEliminar('productos') && (
        <p>No tienes permisos para eliminar</p>
      )}
    </div>
  )
}
```

### Proteger rutas

```tsx
'use client'

import { useAuthStore } from '@/features/auth/store/auth-store'
import { usePermisos } from '@/features/usuarios/hooks/use-permisos'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProductosPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const { puedeVer } = usePermisos()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!puedeVer('productos')) {
      router.push('/no-permisos')
      return
    }
  }, [user, puedeVer, router])

  return <h1>Productos</h1>
}
```

---

## 🔑 VARIABLES DE ENTORNO NECESARIAS

Asegúrate de que en `.env.local` o `.env` tienes:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Donde obtener:**
1. Ve a: https://supabase.com/dashboard/project/[PROJECT_ID]/settings/api
2. Copia `Project URL` → NEXT_PUBLIC_SUPABASE_URL
3. Copia `service_role secret` → SUPABASE_SERVICE_ROLE_KEY

---

## ❓ TROUBLESHOOTING

### "Error: relation 'usuarios' does not exist"
→ Las migraciones no se ejecutaron. Repite los pasos 1-4.

### "Invalid password hash"
→ Comprueba que las claves tienen los hashes bcrypt correctos. Están en la columna `clave` de la tabla `usuarios`.

### "User has no permissions"
→ El usuario no tiene permisos para ese módulo. Ve a la tabla `permisos` y asigna permisos manualmente.

### Los permisos no se cargan después del login
→ El endpoint `/api/auth/login` está buscando los permisos. Si no están en la respuesta, revisa si la tabla `permisos` está poblada.

---

## 🎯 RESUMEN

Ahora tienes:

✅ **Autenticación segura** con bcrypt  
✅ **Base de datos Supabase** con 3 tablas relacionadas  
✅ **5 usuarios** listos para probar  
✅ **12 módulos** del sistema  
✅ **Permisos granulares** CRUD por usuario/módulo  
✅ **Hook usePermisos()** para usar en componentes  
✅ **Endpoint /api/auth/login** que devuelve permisos  

**Próximo paso**: Aplicar permisos a rutas y componentes según sea necesario.

---

*Generado: 2026-06-04*
