"use client"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import type { CartItem } from "@/types"
import { getOrCreateBrowserUserId } from "@/lib/utils"

interface CartProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
}

/**
 * COMPONENTE: Carrito de Compras (Sidebar)
 * CORREGIDO: Ahora incluye userId en los pedidos (igual que el chat)
 */
export default function Cart({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart }: CartProps) {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [userId, setUserId] = useState<string>("")

  // OBTENER USERID (IGUAL QUE EL CHAT)
  useEffect(() => {
    // Usar el método universal para obtener el userId
    const userIdentifier = getOrCreateBrowserUserId()
    setUserId(userIdentifier)
  }, [])

  // Calcular totales
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
      // DATOS DEL PEDIDO CON USERID (IGUAL QUE EL CHAT)
      const orderData = {
        // USERID INCLUIDO
        userId: userId,
        userIdentifier: userId,

        // DATOS DEL PEDIDO
        whatsappNumber: whatsappNumber.replace(/\D/g, ""),
        items: cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
        totalItems,
        subtotal: subtotal.toFixed(2),
        timestamp: new Date().toISOString(),

        // METADATOS
        type: "ecommerce-order",
        source: "placacentro-ecommerce",
      }

      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el pedido")
      }

      const result = await response.json()

      setSubmitMessage("¡Pedido enviado exitosamente! Pronto te contactaremos.")

      // Limpiar después de 2 segundos
      setTimeout(() => {
        onClearCart()
        setWhatsappNumber("")
        setSubmitMessage("")
        onClose()
      }, 2000)
    } catch (error) {
      setSubmitMessage("Error al enviar el pedido. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Carrito de Compras</span>
            {userId && <span className="text-xs text-gray-500">ID: {userId.slice(-6)}</span>}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <Button onClick={onClose} variant="outline">
                  Continuar Comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-16 h-16 relative bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                        <p className="text-green-600 font-semibold">${item.product.price.toFixed(2)}</p>

                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="py-4 space-y-4">
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

                <Separator />

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

                <div className="space-y-2">
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

                  <Button onClick={onClearCart} variant="outline" className="w-full" disabled={isSubmitting}>
                    Limpiar Carrito
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
