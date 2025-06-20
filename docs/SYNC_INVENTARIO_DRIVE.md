# 🛠️ DOCUMENTACIÓN DEL MÓDULO: SINCRONIZACIÓN DE INVENTARIO DESDE GOOGLE DRIVE

## Descripción
Permite actualizar el inventario automáticamente desde un archivo JSON alojado en Google Drive, ideal para clientes que prefieren editar en Drive.

## Ubicación
- Script: `scripts/sync-from-drive.js`

## Funcionalidad
- Descarga el archivo JSON desde Drive (requiere que sea público).
- Valida estructura y datos.
- Sobrescribe `data/inventory.json` y crea un backup automático.
- Muestra estadísticas y preview en consola.

## Uso
```sh
node scripts/sync-from-drive.js
```

## Notas
- El enlace de Drive debe ser público y en formato de descarga directa.
- Se recomienda ejecutar el script diariamente (cron o tarea programada).
- Los backups se guardan en `data/inventory_backup_*.json`.
