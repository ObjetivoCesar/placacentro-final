"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import MainApp from "@/components/main-app"

/**
 * PÁGINA PRINCIPAL: Landing Page
 *
 * FUNCIONALIDAD:
 * - Portada minimalista con logo oficial de Placacentro
 * - Botón de entrada a la aplicación principal
 * - Transición suave entre landing y app principal
 *
 * DISEÑO:
 * - Fondo blanco limpio
 * - Logo centrado con texto integrado
 * - Botón verde consistente con branding
 * - Responsive para todos los dispositivos
 *
 * FLUJO:
 * 1. Usuario ve la portada
 * 2. Hace clic en "Entrar"
 * 3. Se carga la aplicación principal (MainApp)
 *
 * ASSETS:
 * - /images/logo-simple.png: Logo oficial con texto integrado
 */
export default function HomePage() {
  const [hasEntered, setHasEntered] = useState(false)

  // Si el usuario ya entró, mostrar la aplicación principal
  if (hasEntered) {
    return <MainApp />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo oficial con texto integrado */}
      <div className="mb-12">
        <Image
          src="/images/logo-simple.png"
          alt="Placacentro - todo lo que necesites para hacer realidad tus sueños"
          width={400}
          height={200}
          className="mx-auto"
          priority
        />
      </div>

      {/* Botón de entrada */}
      <Button
        onClick={() => setHasEntered(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        Entrar
      </Button>
    </div>
  )
}
