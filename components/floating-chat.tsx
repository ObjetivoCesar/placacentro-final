"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Minimize2, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  isMarkdown?: boolean
}

/**
 * COMPONENTE: Chat Flotante
 * CORREGIDO: Input styling y envío garantizado de userId
 */
export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "¡Hola! Soy tu asistente virtual de Placacentro. ¿En qué puedo ayudarte?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Generar o recuperar ID único del usuario
    let userIdentifier = localStorage.getItem("placacentro-user-id")
    if (!userIdentifier) {
      userIdentifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("placacentro-user-id", userIdentifier)
      console.log("🆔 Nuevo userId generado:", userIdentifier)
    } else {
      console.log("🆔 UserId recuperado:", userIdentifier)
    }
    setUserId(userIdentifier)

    // Escuchar evento para abrir el chat desde el footer
    const handleOpenChat = () => {
      setIsOpen(true)
      setIsMinimized(false)
    }

    window.addEventListener("openFloatingChat", handleOpenChat)

    // NUEVO: Escuchar evento para setear el input del chat desde el carrito
    const handleSetChatInput = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (typeof customEvent.detail === "string") {
        setIsOpen(true)
        setIsMinimized(false)
        setInputMessage(customEvent.detail)
        // Opcional: enfocar el input automáticamente
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>("input[placeholder='Escribe tu mensaje...']")
          input?.focus()
        }, 100)
      }
    }
    window.addEventListener("setChatInput", handleSetChatInput)

    return () => {
      window.removeEventListener("openFloatingChat", handleOpenChat)
      window.removeEventListener("setChatInput", handleSetChatInput)
    }
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim()) {
      console.log("⚠️ Mensaje vacío, no enviando")
      return
    }

    if (!userId) {
      console.error("❌ CRÍTICO: userId no disponible")
      alert("Error: ID de usuario no disponible. Recarga la página.")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsTyping(true)

    try {
      // Obtener información del carrito
      const cartData = localStorage.getItem("placacentro-cart")
      let parsedCartData = []

      if (cartData) {
        try {
          parsedCartData = JSON.parse(cartData)
          console.log("🛒 Carrito cargado:", parsedCartData.length, "items")
        } catch (e) {
          console.error("Error parsing cart data:", e)
          parsedCartData = []
        }
      }

      // Calcular resumen del carrito
      const cartSummary = {
        totalItems: (parsedCartData as Array<{ quantity: number }>).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
        totalValue: (parsedCartData as Array<{ product: { price: number }, quantity: number }>).reduce((sum: number, item: any) => sum + (item.product?.price || 0) * (item.quantity || 0), 0),
        products: (parsedCartData as Array<{ product: { name: string, price: number }, quantity: number }>).map((item: any) => ({
          name: item.product?.name || "Producto",
          quantity: item.quantity || 0,
          price: item.product?.price || 0,
        })),
      }

      console.log("📤 PREPARANDO ENVÍO:")
      console.log("   - UserId:", userId)
      console.log("   - Mensaje:", currentMessage.substring(0, 50) + "...")
      console.log("   - Carrito:", cartSummary.totalItems, "items")

      // DATOS PARA API - USERID GARANTIZADO
      const requestPayload = {
        // USERID EN MÚLTIPLES FORMATOS PARA ASEGURAR RECEPCIÓN
        userId: userId,
        userIdentifier: userId,
        user_id: userId,

        // MENSAJE
        message: currentMessage,
        timestamp: new Date().toISOString(),
        source: "placacentro-floating-chat",

        // CARRITO
        cartData: parsedCartData,
        cartSummary: cartSummary,

        // INFO ADICIONAL
        userAgent: navigator.userAgent,
        sessionInfo: {
          url: window.location.href,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
        },
      }

      console.log("📡 Enviando al API con userId:", requestPayload.userId)

      // Enviar mensaje al API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      console.log("📥 Respuesta del API - Status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error del servidor:", errorText)
        throw new Error(`Error del servidor: ${response.status}`)
      }

      // Procesar respuesta
      const responseData = await response.json()
      console.log("✅ Respuesta procesada:", {
        success: responseData.success,
        hasBotResponse: !!responseData.botResponse,
        userIdConfirmed: responseData.userId,
      })

      // Mostrar respuesta del bot
      if (responseData.botResponse) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: responseData.botResponse,
          timestamp: new Date(),
          isMarkdown: true,
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        const confirmationMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: "Mensaje recibido correctamente. Un asesor se pondrá en contacto contigo pronto.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, confirmationMessage])
      }
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Tu mensaje ha sido recibido. Un asesor se pondrá en contacto contigo pronto.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed bottom-24 right-6 z-[100]">
      <Card className={`w-80 shadow-2xl transition-all duration-300 ${isMinimized ? "h-14" : "h-[460px]"}`}>
        <CardHeader className="p-4 bg-green-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Asistente Virtual</h3>
                <p className="text-xs text-green-100">En línea • ID: {userId.slice(-6)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-green-500 h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-500 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[400px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start space-x-2 max-w-xs`}>
                    {message.type === "bot" && (
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        message.type === "user"
                          ? "bg-green-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {message.isMarkdown ? (
                        <ReactMarkdown
                          // @ts-expect-error: className no está en los tipos de ReactMarkdown pero sí es soportado
                          className="leading-relaxed prose prose-sm max-w-none"
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900">{children}</strong>
                            ),
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            h1: ({ children }) => <h1 className="font-bold text-base mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="font-bold text-sm mb-1">{children}</h2>,
                            h3: ({ children }) => <h3 className="font-semibold text-sm mb-1">{children}</h3>,
                            // Personalización para imágenes en markdown
                            img: ({ src, alt }) => (
                              <img
                                src={src ?? ''}
                                alt={alt ?? ''}
                                className="rounded-lg max-w-full h-auto my-2 border border-gray-200 shadow"
                                style={{ maxHeight: 200 }}
                              />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="leading-relaxed">{message.content}</p>
                      )}
                      <p className={`text-xs mt-1 ${message.type === "user" ? "text-green-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {message.type === "user" && (
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - CORREGIDO: Styling mejorado para evitar superposiciones */}
            <div className="border-t border-gray-100 bg-white">
              <div className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje..."
                      rows={4}
                      className="w-full text-sm border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-12 pl-4 py-2 resize-vertical min-h-[80px] max-h-[200px]"
                      style={{
                        fontSize: "14px",
                        lineHeight: "20px",
                      }}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping || !userId}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full h-10 w-10 p-0 flex-shrink-0"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
