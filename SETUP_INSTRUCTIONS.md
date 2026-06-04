# Instrucciones de Setup - Sistema de Gestión de Operaciones

## Problema
El login falla con "Credenciales Inválidas" porque las tablas de autenticación (`usuarios`, `modulos_sistema`, `permisos`) no existen en Supabase.

## Solución

### Opción 1: Via Supabase Dashboard SQL Editor (RECOMENDADO)

1. Abre https://app.supabase.com
2. Selecciona tu proyecto (`hakxvtffjwrywpfsipvo`)
3. Ve a **SQL Editor** en el sidebar izquierdo
4. Haz click en **+ New Query**
5. Copia TODO el contenido del archivo: `supabase/migrations/init_auth_tables.sql`
6. Pega en el editor
7. Haz click en **Execute** (o Ctrl+Enter)
8. Espera a que se complete (unos segundos)
9. ¡Listo! Las tablas y datos están creados

### Opción 2: Via Supabase CLI (si tienes CLI instalada)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Authenticate
supabase login

# Deploy migrations
supabase db push
```

### Opción 3: Vía endpoint local (si has clonado el repo)

```bash
# 1. Asegúrate de tener .env.local con credenciales válidas
# NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY

# 2. Inicia el servidor dev
npm run dev

# 3. Abre en tu navegador
http://localhost:3000/api/create-auth-tables

# 4. Copia el SQL que aparece
# 5. Sigue los pasos de Opción 1 para ejecutar en SQL Editor
```

## Contenido de la Migración

Se crearán 3 tablas:

### `usuarios`
- `id` (UUID, PK)
- `usuario` (VARCHAR, UNIQUE) - nombre de usuario
- `clave` (VARCHAR) - contraseña hasheada con bcrypt
- `nombre`, `apellido`, `correo` - datos del usuario
- `rol`, `situacion` - estado del usuario

### `modulos_sistema`
- `id` (UUID, PK)
- `codigo` (VARCHAR, UNIQUE) - identificador del módulo
- `nombre`, `descripcion` - información
- `activo` (BOOLEAN) - si está activo

### `permisos`
- `usuario_id` → referencias `usuarios`
- `modulo_id` → referencias `modulos_sistema`
- `leer`, `crear`, `editar`, `eliminar` - permisos

## Usuarios Creados Automáticamente

| Usuario | Nombre | Rol | Contraseña (hash) |
|---------|--------|-----|-------------------|
| `jarango` | Juan Andres Arango Velasquez | Admin | (ver nota abajo) |
| `contador` | Contador Principal | Contador | (ver nota abajo) |
| `contable00` | Karina Silva | Contador | (ver nota abajo) |
| `auxiliar` | Auxiliar Contable | Auxiliar | (ver nota abajo) |
| `admin` | Administrador Sistema | Admin | (ver nota abajo) |

**Nota sobre contraseñas:** Las contraseñas están almacenadas como hashes bcrypt en la base de datos. El endpoint `/api/insert-data` muestra las contraseñas en texto plano para referencia.

## Verificación

Después de ejecutar la migración:

1. Abre https://gestionoperaciones-spin.vercel.app/login
2. Ingresa:
   - Usuario: `jarango`
   - Contraseña: (ver en `/api/insert-data` en el servidor local)
3. ¡Deberías poder entrar!

## Si Falla

Si aún ves "Credenciales Inválidas":

1. Verifica que las tablas fueron creadas:
   - Ve a SQL Editor en Supabase
   - Ejecuta: `SELECT * FROM usuarios LIMIT 1;`
   - Deberías ver al menos una fila

2. Verifica que el login endpoint está usando la BD correcta:
   - Archivo: `src/app/api/auth/login/route.ts`
   - Debe usar `from('usuarios')`

3. Limpia caché del navegador (Ctrl+Shift+Delete)

## Próximos Pasos

Después de que el login funcione:

1. Configura los permisos específicos para cada usuario
2. Personaliza los módulos según tus necesidades
3. Implementa contraseñas seguras (actualmente son hashes genéricos)

---

¿Preguntas? Revisa el código en `src/app/api/auth/login/route.ts`
