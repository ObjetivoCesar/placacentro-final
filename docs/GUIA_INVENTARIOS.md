# 📦 GUÍA COMPLETA DE GESTIÓN DE INVENTARIOS

## 🎯 OBJETIVO
Esta guía explica **paso a paso** cómo actualizar productos en la aplicación Aluvril, desde la preparación del archivo JSON hasta la verificación de cambios en la aplicación.

---

## 🚀 MÉTODOS DE ACTUALIZACIÓN

### **MÉTODO 1: Sistema Dinámico (Recomendado)**
**Ubicación**: Código → `app/admin/dynamic-sync/page.tsx`
**Acceso en Producción**: `https://tu-dominio.com/admin/dynamic-sync`

### **MÉTODO 2: Subida Simple**
**Ubicación**: Código → `app/admin/upload/page.tsx`
**Acceso en Producción**: `https://tu-dominio.com/admin/upload`

### **MÉTODO 3: Panel Básico**
**Ubicación**: Código → `app/admin/page.tsx`
**Acceso en Producción**: `https://tu-dominio.com/admin`

---

## 📋 PREPARACIÓN DEL ARCHIVO JSON

### Estructura Requerida
\`\`\`json
[
  {
    "id": "PL001",
    "name": "Plancha MDF 15mm",
    "category": "Planchas",
    "price": 45.50,
    "stock": 150,
    "image": "https://ejemplo.com/imagen.jpg",
    "description": "Plancha MDF de 15mm, ideal para mueblería"
  },
  {
    "id": "PL002",
    "name": "Plancha OSB 12mm",
    "category": "Planchas",
    "price": 32.75,
    "stock": 200,
    "image": "/placeholder.svg?height=200&width=200",
    "description": "Plancha OSB resistente al agua"
  }
]
\`\`\`

### Campos Obligatorios
- **id**: Código único del producto (texto)
- **name**: Nombre del producto (texto)
- **category**: Categoría (texto)
- **price**: Precio (número decimal)
- **stock**: Cantidad disponible (número entero)
- **image**: URL de imagen (texto)
- **description**: Descripción (texto)

### Validaciones Automáticas
✅ **Formato JSON válido**
✅ **Campos obligatorios presentes**
✅ **Tipos de datos correctos**
✅ **URLs de imagen válidas**

---

## 🔄 MÉTODO 1: SISTEMA DINÁMICO (Google Drive)

### **Paso 1: Preparar Google Drive**

1. **Crear archivo JSON en Google Drive**
   \`\`\`
   - Abre Google Drive
   - Nuevo → Archivo de texto
   - Nombra: "inventario_aluvril.json"
   - Pega el contenido JSON
   - Guarda el archivo
   \`\`\`

2. **Compartir archivo públicamente**
   \`\`\`
   - Clic derecho en el archivo
   - "Compartir"
   - "Cambiar a cualquier persona con el enlace"
   - Permisos: "Lector"
   - Copiar enlace
   \`\`\`

3. **Obtener URL correcta**
   \`\`\`
   URL original: https://drive.google.com/file/d/1ABC123.../view?usp=sharing
   URL necesaria: La misma (el sistema convierte automáticamente)
   \`\`\`

### **Paso 2: Configurar en la Aplicación**

**EN DESARROLLO (v0):**
\`\`\`
1. Ve al archivo: app/admin/dynamic-sync/page.tsx
2. En la sección "Google Drive"
3. Pega la URL en el campo correspondiente
4. Clic en "Sincronizar desde Drive"
\`\`\`

**EN PRODUCCIÓN:**
\`\`\`
1. Abre: https://tu-dominio.com/admin/dynamic-sync
2. Tab "Fuentes de Datos"
3. Pega URL en "URL de Google Drive"
4. Clic "Sincronizar desde Drive"
\`\`\`

### **Paso 3: Preview y Aplicación**

1. **Ver Preview**
   \`\`\`
   - Tab "Preview"
   - Revisar cambios detectados
   - Verificar productos nuevos/actualizados/eliminados
   - Confirmar precios y datos
   \`\`\`

2. **Aplicar Cambios**
   \`\`\`
   - Clic "Aplicar Cambios (X)"
   - Esperar confirmación
   - Verificar mensaje de éxito
   \`\`\`

### **Paso 4: Configurar Auto-Sync (Opcional)**

1. **Activar Automatización**
   \`\`\`
   - Tab "Automatización"
   - Activar "Auto-Sincronización"
   - Configurar intervalo (ej: 30 segundos)
   - Guardar configuración
   \`\`\`

2. **Funcionamiento Automático**
   \`\`\`
   - El sistema revisa Google Drive cada X segundos
   - Detecta cambios automáticamente
   - Aplica actualizaciones sin intervención
   - Crea backups automáticos
   \`\`\`

---

## 📤 MÉTODO 2: SUBIDA SIMPLE

### **Paso 1: Preparar Archivo Local**
\`\`\`
1. Crear archivo "inventario.json" en tu computadora
2. Copiar estructura JSON con productos
3. Guardar archivo
\`\`\`

### **Paso 2: Subir Archivo**

**EN DESARROLLO (v0):**
\`\`\`
1. Ve al archivo: app/admin/upload/page.tsx
2. Arrastra el archivo JSON a la zona indicada
3. O clic "Seleccionar Archivo JSON"
\`\`\`

**EN PRODUCCIÓN:**
\`\`\`
1. Abre: https://tu-dominio.com/admin/upload
2. Arrastra archivo a zona de subida
3. O clic "Seleccionar Archivo JSON"
4. Esperar procesamiento automático
\`\`\`

### **Paso 3: Verificación**
\`\`\`
1. Ver mensaje de confirmación
2. Verificar cantidad de productos cargados
3. Comprobar que aparece "Backup Creado"
\`\`\`

---

## 🛠️ MÉTODO 3: PANEL BÁSICO

### **Uso del Panel Tradicional**

**EN DESARROLLO (v0):**
\`\`\`
1. Ve al archivo: app/admin/page.tsx
2. Sección "Subir Inventario"
3. Seleccionar archivo .xlsx o .json
4. Clic "Subir Inventario"
\`\`\`

**EN PRODUCCIÓN:**
\`\`\`
1. Abre: https://tu-dominio.com/admin
2. Subir archivo Excel o JSON
3. Esperar procesamiento
4. Verificar mensaje de confirmación
\`\`\`

---

## ✅ VERIFICACIÓN DE CAMBIOS

### **1. Verificar en la Aplicación**
\`\`\`
1. Ir a sección "Productos" (footer)
2. Buscar productos actualizados
3. Verificar precios nuevos
4. Comprobar imágenes cargando
5. Probar filtros por categoría
\`\`\`

### **2. Verificar en el Carrito**
\`\`\`
1. Agregar productos al carrito
2. Verificar precios correctos
3. Probar envío de pedido
4. Confirmar datos en Make.com
\`\`\`

### **3. Verificar en Chat**
\`\`\`
1. Abrir chat flotante
2. Enviar mensaje con productos en carrito
3. Verificar que se envía información completa
4. Comprobar respuesta del bot
\`\`\`

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Problema: "JSON inválido"**
\`\`\`
CAUSA: Formato incorrecto del archivo
SOLUCIÓN:
1. Verificar que sea un array: [...]
2. Comprobar comas y llaves
3. Usar validador JSON online
4. Verificar caracteres especiales
\`\`\`

### **Problema: "Archivo no accesible"**
\`\`\`
CAUSA: Permisos de Google Drive
SOLUCIÓN:
1. Archivo → Compartir
2. "Cualquier persona con el enlace"
3. Permisos: "Lector"
4. Copiar nuevo enlace
\`\`\`

### **Problema: "Campos faltantes"**
\`\`\`
CAUSA: Estructura de producto incompleta
SOLUCIÓN:
1. Verificar todos los campos obligatorios
2. Comprobar tipos de datos (números vs texto)
3. Asegurar que price y stock sean números
4. Verificar que id sea único
\`\`\`

### **Problema: "Imágenes no cargan"**
\`\`\`
CAUSA: URLs de imagen inválidas
SOLUCIÓN:
1. URLs externas: Se manejan automáticamente
2. URLs rotas: Se reemplazan por placeholder
3. Verificar conectividad
4. Usar URLs de servicios confiables
\`\`\`

### **Problema: "Productos no aparecen"**
\`\`\`
CAUSA: Error en aplicación de cambios
SOLUCIÓN:
1. Verificar logs en consola (F12)
2. Comprobar mensaje de éxito
3. Refrescar página
4. Verificar backup creado
\`\`\`

---

## 📊 MONITOREO Y ESTADÍSTICAS

### **Dashboard de Estado**
\`\`\`
- Estado actual del sistema
- Última sincronización
- Cantidad de productos
- Errores recientes
- Fuentes configuradas
\`\`\`

### **Logs y Debugging**
\`\`\`
1. Abrir herramientas de desarrollador (F12)
2. Tab "Console"
3. Buscar mensajes de:
   - "Sincronización"
   - "Productos cargados"
   - "Error"
   - "Backup creado"
\`\`\`

### **Archivos de Backup**
\`\`\`
Ubicación: data/inventory_backup_*.json
Formato: inventory_backup_2024-01-20T10-30-00-000Z.json
Propósito: Restauración en caso de problemas
\`\`\`

---

## 🎯 MEJORES PRÁCTICAS

### **Para el Cliente**
1. **Mantener mismo archivo**: No crear archivos nuevos en Google Drive
2. **Estructura consistente**: Usar siempre el mismo formato JSON
3. **Backup manual**: Guardar copia local antes de cambios grandes
4. **Verificación**: Siempre revisar cambios en la aplicación
5. **Horarios**: Actualizar en horarios de menor tráfico

### **Para Desarrollo**
1. **Logs detallados**: Mantener logging completo
2. **Validación robusta**: Verificar todos los campos
3. **Backup automático**: Crear respaldo antes de cambios
4. **Error handling**: Manejar todos los casos de error
5. **Testing**: Probar con archivos de diferentes tamaños

---

## 📞 SOPORTE Y CONTACTO

### **Problemas Técnicos**
\`\`\`
1. Revisar esta documentación
2. Verificar logs en consola
3. Comprobar archivos de backup
4. Contactar soporte técnico
\`\`\`

### **Actualizaciones del Sistema**
\`\`\`
- Nuevas funcionalidades se documentan aquí
- Cambios en APIs se notifican
- Mejoras en UI se explican paso a paso
\`\`\`

### **Recursos Adicionales**
\`\`\`
- Documentación completa: docs/DOCUMENTACION_COMPLETA.md
- Ejemplos de JSON: data/inventory.json
- Código fuente: Todos los archivos están documentados
\`\`\`

---

## 🚀 PRÓXIMOS PASOS

### **Después de Leer Esta Guía**
1. **Elegir método** de actualización preferido
2. **Preparar archivo JSON** con productos reales
3. **Probar en desarrollo** antes de producción
4. **Configurar auto-sync** si es necesario
5. **Capacitar al equipo** en el proceso

### **Para Producción**
1. **Desplegar aplicación** en servidor
2. **Configurar variables de entorno**
3. **Probar todos los métodos**
4. **Documentar proceso específico** para el cliente
5. **Establecer rutinas** de backup y mantenimiento
