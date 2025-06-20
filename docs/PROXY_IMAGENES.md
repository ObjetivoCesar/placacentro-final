# 🛠️ DOCUMENTACIÓN DEL MÓDULO: PROXY DE IMÁGENES DE PRODUCTO

## Descripción
Permite mostrar imágenes externas en productos evitando problemas de CORS y asegurando compatibilidad y fallback.

## Ubicación
- Código: `components/product-image.tsx` (componente)
- API: `app/api/proxy-image/route.ts` (proxy)

## Funcionalidad
- Detecta URLs externas y las sirve vía `/api/proxy-image?url=...`.
- Si la imagen falla, muestra un placeholder.
- Soporta imágenes de Google Drive, Cloudinary y CDNs públicos.
- Centrado, responsivo y con `object-cover` para visualización óptima.

## Uso
```tsx
<ProductImage src={product.image} alt={product.name} fill />
```

## Notas
- El proxy fuerza el content-type correcto según la extensión.
- El contenedor del componente asegura altura y aspecto cuadrado.
- Si la imagen no es accesible, se muestra un placeholder.
