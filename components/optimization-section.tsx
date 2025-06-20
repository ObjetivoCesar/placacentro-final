"use client"

import { useEffect, useRef } from "react"

/**
 * Sección de Optimización de Cortes
 * Integra la aplicación externa via iframe con permisos completos
 */
export default function OptimizationSection() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Configurar permisos del iframe para acceso al micrófono
    if (iframeRef.current) {
      iframeRef.current.allow = "microphone *; camera *; autoplay *; encrypted-media *; fullscreen *; geolocation *"
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-blue-100">Herramientas</p>
          <h2 className="text-xl font-bold text-white">Optimización de Cortes</h2>
        </div>
      </div>

      {/* Iframe container - Full screen */}
      <div className="w-full" style={{ height: "calc(100vh - 140px)" }}>
        <iframe
          ref={iframeRef}
          src="https://placacentro3.vercel.app/"
          className="w-full h-full border-0"
          title="Optimización de Cortes"
          allow="microphone *; camera *; autoplay *; encrypted-media *; fullscreen *; geolocation *"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation allow-microphone allow-camera"
        />
      </div>
    </div>
  )
}
