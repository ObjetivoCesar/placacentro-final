"use client"

import { useState } from "react"
import Image from "next/image"

interface ProductImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
}

/**
 * COMPONENTE: Imagen de Producto con Proxy
 *
 * FUNCIONALIDAD:
 * - Maneja imágenes externas via proxy para evitar CORS
 * - Fallback automático a placeholder si falla la carga
 * - Loading state con animación
 * - Cache automático de 24 horas
 *
 * USO:
 * - Reemplaza Image de Next.js para productos
 * - Detecta URLs externas automáticamente
 * - Aplica proxy solo cuando es necesario
 *
 * PROXY:
 * - URLs externas → /api/proxy-image?url=...
 * - URLs locales → directo
 * - Error → placeholder.svg
 */
export default function ProductImage({ src, alt, width, height, className, fill }: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Determinar la URL de la imagen
  const getImageSrc = () => {
    if (imageError) {
      return "/placeholder.svg?height=200&width=200"
    }

    // Si es URL externa, usar proxy
    if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
      return `/api/proxy-image?url=${encodeURIComponent(src)}`
    }

    // Si es URL local o placeholder, usar directamente
    return src || "/placeholder.svg?height=200&width=200"
  }

  // Si se usa fill, forzar altura mínima y responsividad
  const containerClass = fill
    ? `relative ${className || ""} min-h-[180px] aspect-square w-full flex items-center justify-center`
    : `relative ${className || ""}`

  return (
    <div className={containerClass}>
      <Image
        src={getImageSrc() || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`object-cover object-center w-full h-full transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        sizes="(max-width: 640px) 100vw, 33vw"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.log("❌ Error cargando imagen:", src)
          setImageError(true)
          setIsLoading(false)
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-xs">Cargando...</div>
        </div>
      )}
    </div>
  )
}
