"use client"

import { Home, Scissors, ShoppingBag, ShoppingCart, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface FixedFooterProps {
  activeSection: string
  onSectionChange: (section: "home" | "optimization" | "ecommerce" | "cart") => void
}

/**
 * Footer fijo que aparece en todas las páginas
 * Incluye: Chat, Inicio, Optimizar, Productos, Carrito
 */
export default function FixedFooter({ activeSection, onSectionChange }: FixedFooterProps) {
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Simular conteo del carrito (en producción vendría del estado global)
  useEffect(() => {
    const updateCartCount = () => {
      const cartData = localStorage.getItem("placacentro-cart")
      if (cartData) {
        const cart = JSON.parse(cartData)
        const count = cart.reduce((total: number, item: any) => total + item.quantity, 0)
        setCartItemsCount(count)
      }
    }

    updateCartCount()
    // Escuchar cambios en el localStorage
    window.addEventListener("storage", updateCartCount)
    return () => window.removeEventListener("storage", updateCartCount)
  }, [])

  const handleChatClick = () => {
    // Activar el chat flotante
    const chatEvent = new CustomEvent("openFloatingChat")
    window.dispatchEvent(chatEvent)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-2 z-50">
      {/* Curved top border */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-white/95 backdrop-blur-md rounded-t-full"></div>

      <div className="flex items-center justify-around pt-2 max-w-md mx-auto">
        {/* Chat */}
        <button onClick={handleChatClick} className="flex flex-col items-center space-y-1 p-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-gray-600" />
          </div>
          <span className="text-xs text-gray-600">Chat</span>
        </button>

        {/* Inicio */}
        <button onClick={() => onSectionChange("home")} className="flex flex-col items-center space-y-1 p-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <Home className={`h-5 w-5 ${activeSection === "home" ? "text-green-600" : "text-gray-600"}`} />
          </div>
          <span className={`text-xs ${activeSection === "home" ? "text-green-600 font-medium" : "text-gray-600"}`}>
            Inicio
          </span>
        </button>

        {/* Optimizar - Botón central elevado */}
        <button
          onClick={() => onSectionChange("optimization")}
          className="flex flex-col items-center space-y-1 p-2 -mt-4"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${
              activeSection === "optimization"
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : "bg-gradient-to-br from-green-500 to-green-600"
            }`}
          >
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <span
            className={`text-xs font-medium mt-1 ${
              activeSection === "optimization" ? "text-blue-600" : "text-green-600"
            }`}
          >
            Optimizar
          </span>
        </button>

        {/* Productos */}
        <button onClick={() => onSectionChange("ecommerce")} className="flex flex-col items-center space-y-1 p-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <ShoppingBag className={`h-5 w-5 ${activeSection === "ecommerce" ? "text-green-600" : "text-gray-600"}`} />
          </div>
          <span className={`text-xs ${activeSection === "ecommerce" ? "text-green-600 font-medium" : "text-gray-600"}`}>
            Productos
          </span>
        </button>

        {/* Carrito */}
        <button onClick={() => onSectionChange("cart")} className="flex flex-col items-center space-y-1 p-2 relative">
          <div className="w-6 h-6 flex items-center justify-center relative">
            <ShoppingCart className={`h-5 w-5 ${activeSection === "cart" ? "text-green-600" : "text-gray-600"}`} />
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-4 w-4 flex items-center justify-center p-0">
                {cartItemsCount > 9 ? "9+" : cartItemsCount}
              </Badge>
            )}
          </div>
          <span className={`text-xs ${activeSection === "cart" ? "text-green-600 font-medium" : "text-gray-600"}`}>
            Carrito
          </span>
        </button>
      </div>
    </div>
  )
}
