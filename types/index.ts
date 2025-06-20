/**
 * TIPOS DE DATOS: Sistema E-commerce Placacentro
 *
 * PROPÓSITO:
 * - Definir interfaces TypeScript para type safety
 * - Documentar estructura de datos del sistema
 * - Facilitar mantenimiento y evolución del código
 *
 * TIPOS PRINCIPALES:
 * - Product: Estructura de productos del inventario
 * - CartItem: Items en el carrito con cantidad
 * - OrderData: Datos completos de pedidos para WhatsApp/Make.com
 *
 * EVOLUCIÓN:
 * - Agregar nuevos tipos aquí cuando se añadan funcionalidades
 * - Mantener compatibilidad con versiones anteriores
 * - Documentar cambios importantes en comentarios
 */

/**
 * PRODUCTO: Estructura base del inventario
 *
 * CAMPOS:
 * - id: Código único del producto (ej: "PL001")
 * - name: Nombre descriptivo del producto
 * - category: Categoría para filtrado (Planchas, Herrajes, etc.)
 * - price: Precio unitario en USD
 * - stock: Cantidad disponible en inventario
 * - image: URL de la imagen del producto
 * - description: Descripción detallada
 *
 * FUENTE DE DATOS:
 * - data/inventory.json (archivo local)
 * - API /api/products (lectura)
 * - API /api/update-inventory (actualización desde Make.com)
 */
export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string
  description: string
}

/**
 * ITEM DEL CARRITO: Producto + cantidad seleccionada
 *
 * ESTRUCTURA:
 * - product: Objeto Product completo
 * - quantity: Cantidad seleccionada por el usuario
 *
 * USO:
 * - Array de CartItem forma el carrito completo
 * - Se persiste en localStorage como "placacentro-cart"
 * - Se envía completo en mensajes de chat y pedidos
 */
export interface CartItem {
  product: Product
  quantity: number
}

/**
 * DATOS DE PEDIDO: Estructura para WhatsApp y Make.com
 *
 * CAMPOS:
 * - whatsappNumber: Número de contacto del cliente
 * - items: Array de productos con cálculos de subtotal
 * - totalItems: Suma total de cantidades
 * - subtotal: Total del pedido formateado
 * - timestamp: Fecha y hora del pedido
 *
 * DESTINOS:
 * - API /api/submit-order (pedidos desde carrito)
 * - Make.com webhook (procesamiento automático)
 * - WhatsApp (notificación al cliente)
 */
export interface OrderData {
  whatsappNumber: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
    subtotal: number
  }[]
  totalItems: number
  subtotal: string
  timestamp: string
}
