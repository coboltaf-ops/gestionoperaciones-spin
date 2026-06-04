# 📋 MAPEO COMPLETO DE MÓDULOS - SPIN

**Última actualización**: 2026-06-04

---

## LEYENDA
- ✅ **Funciona** - Implementado y operativo
- ⚠️ **Parcial** - Funciona pero incompleto o con issues
- 🔴 **Roto** - No funciona o tiene bugs críticos
- ❓ **Desconocido** - Necesita validación

---

## 🏭 GESTIÓN DE INVENTARIO

| Módulo | Estado | Descripción | Ubicación | Notas |
|--------|--------|-------------|-----------|-------|
| **Productos** | ✅ | Archivo de productos del sistema | `/features/productos` | Store Zustand con persist |
| **Proveedores** | ✅ | Gestión de proveedores | `/features/proveedores` | Incluye contactos, términos pago |
| **Órdenes de Compra** | ⚠️ | Crear OC a proveedores | `/features/ordenes-compra` | **ISSUE**: Tipo inventario no filtra bien |
| **Remisiones** | ⚠️ | Recepción de remisiones | `/features/recepcion-remisiones` | **ISSUE**: Sincronización con órdenes |
| **Recepción de Facturas** | ⚠️ | Recibir facturas de proveedores | `/features/recepcion-facturas` | Valida vs orden de compra |
| **Bodegas** | ✅ | Gestión de bodegas/almacenes | `/features/bodegas` | Store con tipos de inventario |

---

## 📦 MOVIMIENTOS DE INVENTARIO

| Módulo | Estado | Descripción | Ubicación | Notas |
|--------|--------|-------------|-----------|-------|
| **Centros de Costo** | ✅ | Gestión de centros de costo | `/features/centros-costo` | Para reportes por centro |
| **Transferencias** | ✅ | Traspasos entre bodegas | `/features/transferencias` | Controla movimientos |
| **Salidas de Almacén** | ⚠️ | Salidas a centro de costo | `/features/salidas-almacen` | **ISSUE**: Verificar flujo completo |
| **Ajustes de Inventario** | ✅ | Ajustes por falta/sobrante | `/features/ajustes-inventario` | Genera transacciones de ajuste |

---

## 🔧 PRODUCCIÓN

| Módulo | Estado | Descripción | Ubicación | Notas |
|--------|--------|-------------|-----------|-------|
| **Formulaciones** | ⚠️ | Fórmulas de productos | `/features/produccion` | **ISSUE**: Materia prima % vs cantidad |
| **Órdenes de Producción** | ⚠️ | Órdenes para fabricación | `/features/produccion` | **ISSUE**: Ajustes incompletos |
| **Ajustes de OP** | ⚠️ | Correcciones a órdenes | `/features/produccion` | Necesita detalle |

---

## 💰 FINANZAS & CARTERA

| Módulo | Estado | Descripción | Ubicación | Notas |
|--------|--------|-------------|-----------|-------|
| **Control Bancario** | ⚠️ | Movimientos bancarios | `/features/control-bancario` | **ISSUE**: Reconciliación |
| **Pagos a Proveedores** | ⚠️ | Gestión de pagos | `/features/pagos-proveedores` | Anticipo + pagos |
| **Cuentas por Cobrar** | ❓ | CxC de clientes | ??? | **NO ENCONTRADO** |
| **Cuentas por Pagar** | ❓ | CxP a proveedores | ??? | **NO ENCONTRADO** |

---

## 👥 ADMINISTRACIÓN

| Módulo | Estado | Descripción | Ubicación | Notas |
|--------|--------|-------------|-----------|-------|
| **Usuarios** | ⚠️ | Gestión de usuarios | `/features/usuarios` + `/data/usuarios.json` | **ISSUE**: Contraseñas en plain text |
| **Datos de Empresa** | ✅ | Info de SPIN | `/features/datos-empresa` | Logo, nombre, dirección |
| **Personal Empresa** | ✅ | Empleados/staff | `/features/personal-empresa` | Información de personal |
| **Módulos Sistema** | ✅ | Configuración de módulos | `/features/modulos-sistema` | Activar/desactivar features |
| **Referencias** | ⚠️ | Tablas de referencia | `/features/referencias` | **ISSUE**: No sincroniza tipos inventario |
| **Tareas** | ✅ | Gestión de tareas | `/features/tareas` | Sistema de seguimiento |

---

## 📊 REPORTES & OTROS

| Módulo | Estado | Descripción | Ubicación | Notas |
|--------|--------|-------------|-----------|-------|
| **Dashboard** | ✅ | Panel principal | `/features/dashboard` | KPIs y resumen |
| **Pedidos** | ⚠️ | Gestión de pedidos | `/features/pedidos` | **ISSUE**: Flujo completo? |
| **Correos** | ✅ | Histórico de emails | `/features/correos-enviados` | Registro de comunicaciones |
| **Carga Inicial** | ✅ | Setup inicial inventario | `/features/carga-inicial` | One-time setup |
| **Agente** | ⚠️ | Sistema de solicitudes IA | `/features/auth` | **ISSUE**: ¿Funciona? |

---

## 📄 GENERACIÓN DE DOCUMENTOS

| Tipo | Estado | Ubicación | Calidad | Notas |
|------|--------|-----------|---------|-------|
| **PDF - Órdenes** | ⚠️ | `/app/(main)/ordenes-compra/page.tsx:192` | 🔴 Básica | HTML simple, no profesional |
| **PDF - Facturas** | ❓ | ??? | ??? | Verificar implementación |
| **PDF - Remisiones** | ❓ | ??? | ??? | Verificar implementación |
| **Excel - Reportes** | ✅ | ??? | ✅ Buena | Usa XLSX |

---

## 🔐 SEGURIDAD & AUTENTICACIÓN

| Item | Estado | Descripción | Ubicación | CRÍTICO |
|------|--------|-------------|-----------|---------|
| **Login** | ✅ | Sistema de autenticación | `/app/(auth)/login` | ✅ Funciona |
| **Validación de Usuario** | ⚠️ | Check contra archivo | `/api/auth/login` | 🔴 Plain text password |
| **Permisos por Rol** | 🔴 | Control de acceso | `usuarios.json` | 🔴 Vacíos/no implementados |
| **SSO Contable** | ⚠️ | Integración con contable | `/login?from=contable` | 🔴 URL params inseguros |

---

## 🔄 SINCRONIZACIÓN DE DATOS

| Sistema | Estado | Descripción | Problema |
|---------|--------|-------------|----------|
| **ServerSyncProvider** | ⚠️ | Sincroniza cliente-servidor | 🔴 Referencias no se sincronizan |
| **Zustand Persist** | ⚠️ | Persistencia en localStorage | ⚠️ Algunos stores no persisten |
| **Vercel Blob** | ❓ | Almacenamiento de archivos | No validado |
| **Supabase RLS** | ❓ | Seguridad a nivel de BD | No validado |

---

## 📋 RESUMEN POR CRITICIDAD

### ✅ FUNCIONANDO BIEN (10)
1. Productos
2. Proveedores
3. Bodegas
4. Centros de Costo
5. Transferencias
6. Ajustes de Inventario
7. Datos de Empresa
8. Personal Empresa
9. Dashboard
10. Correos

### ⚠️ PARCIAL/CON ISSUES (13)
1. Órdenes de Compra - Filtrado tipo inventario
2. Remisiones - Sincronización
3. Recepción Facturas - Validación
4. Salidas de Almacén - Flujo completo
5. Formulaciones - Porcentaje vs cantidad
6. Órdenes de Producción - Ajustes
7. Ajustes OP - Detalle
8. Control Bancario - Reconciliación
9. Pagos Proveedores - Validación
10. Usuarios - Contraseñas plain text
11. Referencias - Sincronización
12. PDF - Calidad profesional
13. Agente - ¿Funciona?

### ❓ DESCONOCIDO (4)
1. Cuentas por Cobrar - No encontrado
2. Cuentas por Pagar - No encontrado
3. Facturas PDF - Implementación?
4. Remisiones PDF - Implementación?

### 🔴 CRÍTICO (3)
1. Contraseñas en plain text
2. Referencias no sincronizan
3. Permisos vacíos

---

## 🎯 PLAN DE VALIDACIÓN

### Esta Semana (Priority 1)
- [ ] Arreglar sincronización referencias (**ya iniciado**)
- [ ] Hash de contraseñas (bcrypt)
- [ ] Validar PDF generator
- [ ] Validar MCPs (Supabase, Blob, Playwright)

### Próxima Semana (Priority 2)
- [ ] Auditar módulo Órdenes de Compra (detalle completo)
- [ ] Auditar módulo Remisiones
- [ ] Auditar módulo Facturas
- [ ] Implementar permisos reales

### Después (Priority 3)
- [ ] Encontrar/implementar CxC y CxP
- [ ] Auditar módulos de Producción
- [ ] Auditar módulo Salidas
- [ ] Tests automatizados completos

---

**SIGUIENTE PASO**: Empezar auditoría detallada módulo por módulo, comenzando por:
1. Órdenes de Compra
2. Remisiones
3. Recepción de Facturas

