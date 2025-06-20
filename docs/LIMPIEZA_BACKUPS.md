# 🛠️ DOCUMENTACIÓN DEL MÓDULO: LIMPIEZA DE BACKUPS DE INVENTARIO

## Descripción
Script para eliminar backups antiguos de inventario, manteniendo siempre los 2 más recientes y borrando los que tengan más de 30 días.

## Ubicación
- Script: `scripts/clean-inventory-backups.js`

## Funcionalidad
- Busca archivos `data/inventory_backup_*.json`.
- Si hay más de 2, elimina los que tengan más de 30 días.
- Si solo hay 2 o menos, no borra ninguno.

## Uso
```sh
node scripts/clean-inventory-backups.js
```

## Notas
- Útil para mantener limpio el almacenamiento.
- Se recomienda ejecutar periódicamente (cron o tarea programada).
