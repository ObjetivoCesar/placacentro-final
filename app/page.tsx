"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import MainApp from "@/components/main-app"

/**
 * PÁGINA PRINCIPAL: Landing Page
 *
 * FUNCIONALIDAD:
 * - Portada moderna y oscura con fondo degradado
 * - Logo centrado con acentos naranjas
 * - Botón destacado para entrar a la aplicación
 * - Transición suave entre landing y app principal
 *
 * DISEÑO:
 * - Fondo degradado oscuro
 * - Tipografía moderna y limpia
 * - Botón naranja consistente con branding
 * - Responsive para todos los dispositivos
 *
 * FLUJO:
 * 1. Usuario ve la portada
 * 2. Hace clic en "Get Started"
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#18181b] px-4">
      {/* Esfera animada o imagen decorativa */}
      <div className="mb-10 flex flex-col items-center">
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          {/* Media luna decorativa detrás del botón, desplazada hacia la derecha */}
          <div
            className="absolute top-1/2 left-1/2 w-48 h-24 bg-gradient-to-tr from-orange-500/30 to-orange-300/10 rounded-b-full blur-2xl z-0"
            style={{
              zIndex: 0,
              transform: 'translate(-10%, -50%)', // Desplaza la media luna hacia la derecha
            }}
          />
          <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-orange-500/80 to-orange-300/40 shadow-2xl flex items-center justify-center animate-pulse z-10">
            <Image
              src="/images/logo-simple.png"
              alt="Placacentro"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center drop-shadow-lg">
          Manage your daily tasks
        </h1>
        <p className="text-orange-400 text-base md:text-lg font-medium text-center mb-6 max-w-xs">
          Team and Project management with solution providing App
        </p>
      </div>
      {/* Botón de entrada */}
      <Button
        onClick={() => setHasEntered(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
      >
        Get Started
      </Button>
    </div>
  )
}
