"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Plus, Minus, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import type { CartItem } from "@/types"

/**
 * COMPONENTE: Sección dedicada del carrito
 * CORREGIDO: Ahora incluye userId en los pedidos (igual que el chat)
 */
export default function CartSection() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    loadCart()
    // OBTENER USERID (IGUAL QUE EL CHAT)
    const userIdentifier = localStorage.getItem("placacentro-user-id")
    if (userIdentifier) {
      setUserId(userIdentifier)
      console.log("🆔 CartSection - UserId cargado:", userIdentifier)
    }
    // Escuchar cambios en localStorage para sincronizar carrito
    const handleStorage = () => loadCart()
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const loadCart = () => {
    const savedCart = localStorage.getItem("placacentro-cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  const validateWhatsAppNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, "")
    return cleanNumber.length >= 10 && cleanNumber.length <= 15
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      setSubmitMessage("El carrito está vacío")
      return
    }

    if (!validateWhatsAppNumber(whatsappNumber)) {
      setSubmitMessage("Por favor ingresa un número de WhatsApp válido")
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      console.log("📤 ENVIANDO PEDIDO DESDE CART SECTION:")
      console.log("   - UserId:", userId)

      // NUEVO: Enviar pedido como mensaje al chat
      const chatPayload = {
        userId: userId,
        type: "order",
        message: `🛒 Pedido enviado:\n- Total: $${subtotal.toFixed(2)}\n- Productos: ${totalItems}\n- Fecha: ${new Date().toLocaleString()}`,
        cartData: cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
        cartSummary: {
          totalItems,
          totalValue: subtotal,
          products: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
          })),
        },
        whatsappNumber: whatsappNumber.replace(/\D/g, ""),
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "ecommerce",
        sessionInfo: {},
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatPayload),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el pedido")
      }

      console.log("✅ Pedido enviado exitosamente desde CartSection (por chat)")
      setSubmitMessage("¡Pedido enviado exitosamente! Pronto te contactaremos.")
      setTimeout(() => {
        clearCart()
        setWhatsappNumber("")
        setSubmitMessage("")
      }, 2000)
    } catch (error) {
      console.error("❌ Error enviando pedido:", error)
      setSubmitMessage("Error al enviar el pedido. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-500 to-green-600 py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-green-100">Compras</p>
          <h2 className="text-xl font-bold text-white">Carrito de Compras</h2>
          {userId && <p className="text-xs text-green-100">Usuario: {userId.slice(-8)}</p>}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500">Agrega productos desde nuestro catálogo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Productos en tu carrito ({totalItems})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-20 h-20 relative bg-gray-100 rounded-md overflow-hidden">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-lg">{item.product.name}</h4>
                          <p className="text-gray-600 text-sm">{item.product.description}</p>
                          <p className="text-green-600 font-semibold text-lg">${item.product.price.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-700 ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button onClick={clearCart} variant="outline" className="w-full">
                      Limpiar Carrito
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total de productos:</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Subtotal:</span>
                      <span className="text-green-600">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="Ej: 0987654321"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">Te contactaremos a este número para confirmar tu pedido</p>
                    </div>
                  </div>

                  {submitMessage && (
                    <Alert
                      className={
                        submitMessage.includes("exitosamente")
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }
                    >
                      <AlertDescription
                        className={submitMessage.includes("exitosamente") ? "text-green-800" : "text-red-800"}
                      >
                        {submitMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || !whatsappNumber.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Pedido
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
