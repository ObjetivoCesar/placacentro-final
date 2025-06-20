# 📚 DOCUMENTACIÓN COMPLETA - PLACACENTRO E-COMMERCE

> Esta documentación general resume la arquitectura y enlaza a la documentación específica de cada módulo clave.

## 🏗️ ARQUITECTURA DEL SISTEMA

- **Inventario:** `data/inventory.json` (fuente principal de productos)
- **Panel Admin:** `/admin/inventario` (edición visual de productos)
- **API Inventario:** `/api/admin-inventory` (lectura/escritura del inventario)
- **Proxy de Imágenes:** `/api/proxy-image` y `components/product-image.tsx` (manejo universal de imágenes)
- **Sincronización Drive:** `scripts/sync-from-drive.js` (actualización automática desde Google Drive)
- **Limpieza de Backups:** `scripts/clean-inventory-backups.js` (mantiene solo los backups recientes)

## 📄 DOCUMENTACIÓN POR MÓDULO

- [Inventario y métodos de actualización](./GUIA_INVENTARIOS.md)
- [API de Inventario Admin](./API_ADMIN_INVENTORY.md)
- [Panel de Inventario](./PANEL_INVENTARIO.md)
- [Proxy de Imágenes](./PROXY_IMAGENES.md)
- [Sincronización desde Google Drive](./SYNC_INVENTARIO_DRIVE.md)
- [Limpieza de Backups](./LIMPIEZA_BACKUPS.md)

## 📝 NOTAS GENERALES

- Todos los módulos están validados y documentados.
- Los cambios en inventario pueden hacerse por panel, por Drive o por subida manual.
- El sistema es seguro, escalable y fácil de mantener.
- Para producción, agregar autenticación a los endpoints de administración.

---

> Para detalles y ejemplos de cada módulo, consulta la documentación específica enlazada arriba.
