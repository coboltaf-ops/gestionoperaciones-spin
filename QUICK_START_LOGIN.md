# Quick Start - Como Hacer Login

## El Problema
Intentas entrar a https://gestionoperaciones-spin.vercel.app/login pero recibes "Credenciales Inválidas"

## La Razón
Las tablas de base de datos (`usuarios`, `modulos_sistema`, `permisos`) aún no han sido creadas en Supabase.

## La Solución - 3 Minutos

### PASO 1: Abre el Supabase SQL Editor
Ve a esta URL (reemplaza si es necesario):
```
https://app.supabase.com/project/hakxvtffjwrywpfsipvo/sql/new
```

### PASO 2: Copia el SQL
Abre este archivo y copia TODO su contenido:
```
supabase/migrations/init_auth_tables.sql
```

### PASO 3: Pega y Ejecuta
1. Pega el SQL en el editor
2. Presiona **Ctrl+Enter** (o haz click en Execute)
3. Espera 3-5 segundos
4. Deberías ver un mensaje de éxito

### PASO 4: Ahora Haz Login
1. Ve a: https://gestionoperaciones-spin.vercel.app/login
2. Usuario: `jarango`
3. Contraseña: Ver `/api/insert-data` para la lista (en desarrollo)

O para saber las contraseñas en texto plano:

## Obtener Contraseñas
Si tienes el proyecto localmente corriendo (`npm run dev`):

1. Abre http://localhost:3000/api/insert-data
2. Busca en los logs: "Usuarios listos:"
3. Verás las contraseñas en texto plano

---

## Si algo Falla

**❌ Aún recibo "Credenciales Inválidas"**
- Verifica que ejecutaste el SQL completo en Supabase Dashboard
- Haz un refresh de página (Ctrl+F5)
- Vacía caché del navegador

**❌ El SQL tiene errores**
- Asegúrate de haber copiado COMPLETAMENTE el archivo
- Verifica que no hay caracteres especiales raros
- Intenta ejecutar línea por línea

**❌ El usuario/password no funciona**
- El usuario correcto es: `jarango` (minúsculas)
- Copia exactamente la contraseña de `/api/insert-data`
- Sin espacios al inicio/final

---

## El SQL que se ejecuta crea:

✅ **Tabla `usuarios`** - almacena cuentas de usuario
✅ **Tabla `modulos_sistema`** - módulos/funcionalidades
✅ **Tabla `permisos`** - permisos por usuario/módulo
✅ **5 usuarios** - admin, contador, contable00, auxiliar, jarango
✅ **12 módulos** - Dashboard, Productos, Proveedores, etc.

---

¿Necesitas ayuda? Revisa `SETUP_INSTRUCTIONS.md` para más detalles.
