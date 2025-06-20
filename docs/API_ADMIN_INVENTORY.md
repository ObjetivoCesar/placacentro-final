# 🛠️ DOCUMENTACIÓN DEL MÓDULO: API DE INVENTARIO ADMINISTRATIVO

## Descripción
Permite leer y actualizar el inventario (`data/inventory.json`) desde el panel de administración web. Usado por `/admin/inventario`.

## Ubicación
- Código: `app/api/admin-inventory/route.ts`

## Endpoints
- **GET** `/api/admin-inventory` — Devuelve el inventario completo en formato JSON.
- **PUT** `/api/admin-inventory` — Reemplaza el inventario con el array recibido (valida que sea un array).

## Seguridad
- Actualmente sin autenticación (¡agregar en producción!).

## Ejemplo de uso
```js
// Obtener inventario
fetch('/api/admin-inventory').then(r => r.json())

// Actualizar inventario
fetch('/api/admin-inventory', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productosArray)
})
```

## Notas
- El archivo `data/inventory.json` se sobrescribe completamente.
- Se recomienda hacer backup antes de cambios masivos.
- Usado por el panel `/admin/inventario` para edición directa.
