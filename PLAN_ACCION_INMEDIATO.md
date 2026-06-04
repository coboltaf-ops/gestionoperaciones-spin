# 🚀 PLAN DE ACCIÓN INMEDIATO - SPIN

**Objetivo**: Normalizar infraestructura y fijar bugs críticos para poder trabajar módulo por módulo sin perder tiempo.

**Fecha Inicio**: 2026-06-04  
**Disponibilidad**: Esta semana (4 días)

---

## ⚠️ PROBLEMAS CRÍTICOS A RESOLVER

### 🔴 CRÍTICO #1: Contraseñas en Plain Text
**Problema**: `/data/usuarios.json` tiene contraseñas sin encriptar  
**Riesgo**: Si alguien accede al repo, tiene todas las contraseñas  
**Tiempo**: 2-3 horas  
**Pasos**:

1. Instalar `bcrypt`: `npm install bcrypt`
2. Crear script para hashear contraseñas actuales
3. Modificar endpoint `/api/auth/login` para validar con bcrypt
4. Actualizar usuarios.json (almacenar hash, no contraseña)
5. Actualizar login page si es necesario

**Responsable**: Claude  
**Verificación**: Probar login con nuevo hash

---

### 🔴 CRÍTICO #2: Referencias (tipo_inventario) NO sincroniza
**Problema**: initialData vacío pero ServerSyncProvider no descarga  
**Síntoma**: El usuario no ve "Mercancía, Materia Prima, Materiales y Suministros"  
**Tiempo**: 1-2 horas (ya parcialmente arreglado)  
**Pasos**:

1. ✅ Ya cambié initialData a vacío
2. ✅ Ya arreglé función merge del reference-store
3. 🔄 **FALTA**: Validar que Supabase tiene los tipos correctos
4. 🔄 **FALTA**: Limpiar localStorage y probar sincronización
5. 🔄 **FALTA**: Verificar en Vercel producción

**Responsable**: Claude  
**Verificación**: 
- Abrir app → ir a Órdenes → crear orden → ver dropdown tipo inventario
- Debe mostrar: "Mercancía", "Materia Prima", "Materiales y Suministros", "Producto Terminado", "Servicios"

---

### 🔴 CRÍTICO #3: PDF No Profesional
**Problema**: jsPDF genera HTML básico sin formato profesional  
**Ubicación**: `/src/app/(main)/ordenes-compra/page.tsx:192` función `generateOrdenPDF()`  
**Riesgo**: El cliente ve PDFs feos (no profesional)  
**Tiempo**: 4-6 horas  
**Pasos**:

1. Evaluar opciones:
   - **Opción A** (Recomendado): Usar `html2pdf` + mejorar estilos HTML
   - **Opción B**: Usar `pdfkit` para más control
   - **Opción C**: Generar en servidor con templates profesionales
   
2. Mejorar elementos:
   - Header con logo y info empresa
   - Footer con firma
   - Tablas con mejor formato
   - Totales con colores
   - Números formateados (moneda, fecha)
   
3. Aplicar a TODOS los PDFs:
   - Órdenes de Compra
   - Remisiones
   - Facturas
   - Otros

**Responsable**: Claude  
**Verificación**: Generar PDF y verificar que se vea profesional

---

## 🟡 ALTO #1: Usuarios Hardcodeados en Archivo
**Problema**: No se pueden agregar/eliminar usuarios sin editar JSON  
**Tiempo**: 6-8 horas (depende de BD)  
**Pasos**:

1. Crear tabla `usuarios` en Supabase (si no existe)
2. Migrar usuarios.json a tabla
3. Modificar endpoint `/api/auth/login` para leer de Supabase
4. Crear CRUD para gestionar usuarios
5. Agregar UI para admininstración de usuarios

**Responsable**: Claude (después de críticos)  
**Verif icación**: Poder crear/editar/borrar usuarios desde UI

---

## 🟡 ALTO #2: Permisos Vacíos
**Problema**: `permisos: []` en todos los usuarios, sin control real  
**Tiempo**: 8-10 horas  
**Pasos**:

1. Definir estructura de permisos (por módulo)
2. Crear tabla `permisos` en Supabase
3. Crear tabla intermedia `usuario_permisos`
4. Implementar middleware de validación
5. Aplicar a rutas y componentes

**Responsable**: Claude (después de usuarios en Supabase)  
**Verificación**: Algunos usuarios solo ven ciertos módulos

---

## 🟡 ALTO #3: MCPs No Validadas
**Problema**: Nunca verificamos si Supabase, Blob, Playwright realmente funcionan  
**Tiempo**: 2-3 horas  
**Pasos**:

1. **Supabase MCP**:
   - [ ] Ejecutar query simple (`select * from usuarios limit 1`)
   - [ ] Verificar que devuelve datos
   
2. **Vercel Blob MCP**:
   - [ ] Subir archivo de prueba
   - [ ] Descargar y verificar
   
3. **Playwright MCP**:
   - [ ] Ejecutar test simple de login
   - [ ] Verificar que navega y hace click

**Responsable**: Claude  
**Verificación**: Todos los MCPs reportan "Funcionando"

---

## 📅 TIMELINE PROPUESTO

### Lunes 4 de Junio
```
Mañana (9am-1pm):
  [ ] Arreglar CRÍTICO #2 (Referencias sincronización) - 1h
  [ ] Validar que funcione - 30min
  [ ] Commit a producción si funciona - 30min
  
Tarde (2pm-6pm):
  [ ] Implementar CRÍTICO #1 (Bcrypt) - 2.5h
  [ ] Probar - 30min
  [ ] Commit - 30min
```

### Martes 5 de Junio
```
Día completo:
  [ ] CRÍTICO #3 (PDF profesionales) - 4-6h
  [ ] Probar en todos los módulos - 1h
  [ ] Commit y deploy - 30min
```

### Miércoles 6 de Junio
```
Mañana:
  [ ] ALTO #1 (Usuarios en Supabase) - 4h
  
Tarde:
  [ ] Validación y pruebas - 2h
  [ ] Commit - 30min
```

### Jueves 7 de Junio
```
Día completo:
  [ ] ALTO #2 (Permisos reales) - 4-5h
  [ ] Validación - 2h
  [ ] Documentar - 1h
  [ ] Deploy final - 30min
```

---

## ✅ CHECKLIST DE CADA TAREA

### Para CRÍTICO #1 (Bcrypt)
- [ ] npm install bcrypt
- [ ] Hashear usuarios.json
- [ ] Actualizar `/api/auth/login`
- [ ] Probar login local
- [ ] Probar en Vercel
- [ ] Documentar en CAMBIOS.md

### Para CRÍTICO #2 (Referencias)
- [ ] Limpiar localStorage
- [ ] Probar en dev
- [ ] Verificar tipos en dropdown
- [ ] Probar crear orden
- [ ] Deploy a Vercel
- [ ] Probar en producción

### Para CRÍTICO #3 (PDF)
- [ ] Elegir librería
- [ ] npm install nueva librería
- [ ] Mejorar función generateOrdenPDF()
- [ ] Aplicar a otros PDFs
- [ ] Probar generación
- [ ] Validar que se vea profesional
- [ ] Deploy a Vercel

### Para ALTO #1 (Usuarios BD)
- [ ] Crear tabla usuarios en Supabase
- [ ] Script de migración
- [ ] Actualizar `/api/auth/login`
- [ ] Crear CRUD endpoints
- [ ] Crear UI
- [ ] Probar completo
- [ ] Deploy

### Para ALTO #2 (Permisos)
- [ ] Crear tabla permisos
- [ ] Crear tabla usuario_permisos
- [ ] Implementar middleware
- [ ] Aplicar a rutas
- [ ] Aplicar a componentes
- [ ] Pruebas
- [ ] Deploy

---

## 📊 BENEFICIOS POR TAREA

| Tarea | Beneficio | Riesgo si NO lo hacemos |
|-------|-----------|------------------------|
| CRÍTICO #1 (Bcrypt) | 🔐 Seguridad | 🔴 CRÍTICO: Filtraciones de contraseña |
| CRÍTICO #2 (Referencias) | 🔧 Funcionalidad | 🔴 CRÍTICO: No funciona crear órdenes |
| CRÍTICO #3 (PDF) | 👁️ Profesionalismo | 🟡 ALTO: Cliente ve PDFs feos |
| ALTO #1 (Usuarios) | 👥 Escalabilidad | 🟡 ALTO: No se puede agregar usuarios |
| ALTO #2 (Permisos) | 🔒 Seguridad | 🟡 ALTO: Cualquiera ve todo |

---

## 🎯 SUCCESS CRITERIA

**Viernes 7 de Junio (Fin del día)**:
- ✅ Contraseñas hasheadas en Supabase
- ✅ Referencias sincronizan correctamente
- ✅ PDFs se ven profesionales
- ✅ Usuarios se pueden gestionar desde BD
- ✅ Permisos limitan acceso correctamente
- ✅ TODO en Vercel funcionando
- ✅ Documentación actualizada

---

## 📝 DOCUMENTACIÓN A CREAR

Después de cada tarea, actualizar:
- [ ] CAMBIOS.md - Qué se cambió y por qué
- [ ] INFRAESTRUCTURA_STATUS.md - Actualizar estado
- [ ] MAPEO_MODULOS.md - Marcar módulos como ✅

---

## 🚨 REGLAS DURANTE EJECUCIÓN

1. **NO hagas cambios si el sistema está en producción y hay usuarios usando**
   - Hacer cambios en horario fuera de negocios
   - O hacer en rama, mergear a master con PR

2. **SIEMPRE prueba en dev ANTES de Vercel**
   - Local → Vercel (nunca directo a Vercel)

3. **SIEMPRE documenta**
   - Qué cambió
   - Por qué cambió
   - Cómo se valida

4. **SIEMPRE valida con José si algo es incierto**
   - Preguntar antes de commitear algo riesgoso

---

## ¿LISTO?

Cuando termines cada tarea, marca como ✅ en este documento.

**Empiezo ahora con CRÍTICO #1: Bcrypt**

