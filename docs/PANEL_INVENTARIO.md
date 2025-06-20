# 🛠️ DOCUMENTACIÓN DEL MÓDULO: PANEL DE INVENTARIO

## Descripción
Panel web para buscar, editar y actualizar productos del inventario de forma sencilla y visual, sin necesidad de editar archivos manualmente.

## Ubicación
- Código: `app/admin/inventario/page.tsx`
- Acceso: `/admin/inventario`

## Funcionalidades
- Buscar productos por nombre, ID o categoría.
- Editar nombre, categoría, precio, stock, imagen y descripción.
- Guardar cambios que se reflejan en `data/inventory.json`.
- Feedback visual de éxito/error.

## Flujo de uso
1. Buscar producto.
2. Hacer clic en "Editar".
3. Modificar campos necesarios.
4. Guardar cambios.
5. Ver mensaje de confirmación.

## Notas
- Los cambios son inmediatos y afectan el inventario usado por el e-commerce.
- No requiere conocimientos técnicos.
- Ideal para clientes que no desean manipular archivos JSON.
- ¡Agregar autenticación antes de producción!
