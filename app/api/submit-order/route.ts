import { type NextRequest, NextResponse } from "next/server"

/**
 * API Route para enviar pedidos a Make.com
 * CORREGIDO: Ahora incluye userId para identificación
 * POST /api/submit-order
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=== SUBMIT ORDER API: Procesando pedido ===")

    const orderData = await request.json()

    // Validar datos del pedido
    if (!orderData.whatsappNumber || !orderData.items || orderData.items.length === 0) {
      console.error("❌ Datos de pedido incompletos")
      return NextResponse.json({ error: "Datos de pedido incompletos" }, { status: 400 })
    }

    // OBTENER USERID DEL LOCALSTORAGE (igual que el chat)
    const userId = orderData.userId || null

    console.log("✅ Datos del pedido recibidos:")
    console.log("   - WhatsApp:", orderData.whatsappNumber)
    console.log("   - Items:", orderData.items.length)
    console.log("   - Total:", orderData.subtotal)
    console.log("   - UserId recibido:", userId)

    // URL del webhook de Make.com (mismo que el chat)
    const webhookUrl = process.env.CHAT_WEBHOOK_URL || "https://hook.us2.make.com/ql05r0bkj8p9f5ddtyv0m3sq8muz487p"

    // ESTRUCTURA CORREGIDA - INCLUIR USERID COMO EN EL CHAT
    const webhookData = {
      // IDENTIFICACIÓN (IGUAL QUE EL CHAT)
      userId: userId,
      userIdentifier: userId,
      user_id: userId,

      // DATOS ORIGINALES DEL PEDIDO
      source: "placacentro-ecommerce",
      type: "new-order",
      data: {
        whatsappNumber: orderData.whatsappNumber,
        items: orderData.items,
        totalItems: orderData.totalItems,
        subtotal: orderData.subtotal,
        timestamp: orderData.timestamp,

        // METADATOS ADICIONALES
        type: "ecommerce-order",
        source: "placacentro-ecommerce",

        // INFORMACIÓN DEL USUARIO
        userId: userId,
        userIdentifier: userId,
      },

      // ORGANIZACIÓN (IGUAL QUE EL CHAT)
      folderName: userId ? `user_${userId}` : `order_${Date.now()}`,
      orderSession: {
        sessionId: userId ? `${userId}_${new Date().toISOString().split("T")[0]}` : `order_${Date.now()}`,
        userIdentifier: userId,
        date: new Date().toISOString().split("T")[0],
      },
    }

    console.log("📤 ENVIANDO PEDIDO A MAKE.COM:")
    console.log("   - Webhook URL:", webhookUrl.substring(0, 50) + "...")
    console.log("   - UserId incluido:", webhookData.userId)
    console.log("   - Estructura:", Object.keys(webhookData))

    // Enviar datos a Make.com
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    if (!webhookResponse.ok) {
      console.error("❌ Error enviando webhook:", webhookResponse.status)
      const errorText = await webhookResponse.text()
      console.error("Error details:", errorText)
      throw new Error("Error enviando pedido a sistema de procesamiento")
    }

    // --- NUEVO: Registrar el pedido como mensaje en el chat ---
    try {
      const chatMessage = {
        userId: userId,
        message: `🛒 Pedido enviado:\n- Total: $${orderData.subtotal}\n- Productos: ${orderData.items.length}\n- Fecha: ${new Date().toLocaleString()}`,
        cartData: orderData.items,
        cartSummary: {
          totalItems: orderData.items.length,
          totalValue: orderData.subtotal,
          products: orderData.items,
        },
        timestamp: new Date().toISOString(),
        userAgent: orderData.userAgent || "ecommerce",
        sessionInfo: orderData.sessionInfo || {},
      }
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatMessage),
      })
      console.log("✅ Pedido registrado en el chat del usuario")
    } catch (chatError) {
      console.error("❌ No se pudo registrar el pedido en el chat:", chatError)
    }
    // --- FIN NUEVO ---

    console.log("✅ PEDIDO ENVIADO EXITOSAMENTE")
    console.log("   - UserId procesado:", userId)

    return NextResponse.json({
      success: true,
      message: "Pedido enviado exitosamente",
      orderId: `PC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: userId, // Confirmar userId procesado
    })
  } catch (error) {
    console.error("❌ Error procesando pedido:", error)
    return NextResponse.json({ error: "Error procesando el pedido" }, { status: 500 })
  }
}
