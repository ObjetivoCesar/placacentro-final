import { type NextRequest, NextResponse } from "next/server"

/**
 * API ROUTE: Chat Handler
 * CORREGIDO: Asegurar que userId siempre se envíe a Make.com
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=== CHAT API: Procesando mensaje ===")

    const chatData = await request.json()

    // VALIDACIÓN CRÍTICA: userId es obligatorio
    if (!chatData.userId) {
      console.error("❌ CRÍTICO: userId faltante en request")
      console.log("Datos recibidos:", Object.keys(chatData))
      return NextResponse.json(
        {
          error: "userId requerido para identificación",
          success: false,
        },
        { status: 400 },
      )
    }

    if (!chatData.message) {
      console.error("❌ Mensaje vacío")
      return NextResponse.json(
        {
          error: "Mensaje requerido",
          success: false,
        },
        { status: 400 },
      )
    }

    console.log("✅ Datos recibidos:")
    console.log("   - UserId:", chatData.userId)
    console.log("   - Mensaje:", chatData.message.substring(0, 50) + "...")
    console.log("   - Items en carrito:", chatData.cartData?.length || 0)

    // URL del webhook de Make.com
    const webhookUrl = process.env.CHAT_WEBHOOK_URL || "https://hook.us2.make.com/ql05r0bkj8p9f5ddtyv0m3sq8muz487p"

    // ESTRUCTURA CORREGIDA - USERID EN NIVEL SUPERIOR
    const webhookData = {
      // IDENTIFICACIÓN EN PRIMER NIVEL (CRÍTICO PARA MAKE.COM)
      userId: chatData.userId,
      userIdentifier: chatData.userId, // Duplicado para asegurar recepción

      // METADATOS DEL MENSAJE
      source: "placacentro-floating-chat",
      type: "chat-with-cart",
      message: chatData.message,
      timestamp: chatData.timestamp || new Date().toISOString(),

      // INFORMACIÓN DEL CARRITO
      cartData: chatData.cartData || [],
      cartSummary: chatData.cartSummary || {
        totalItems: 0,
        totalValue: 0,
        products: [],
      },

      // INFORMACIÓN ADICIONAL DEL USUARIO
      userInfo: {
        userId: chatData.userId, // Repetido aquí también
        hasCart: (chatData.cartData?.length || 0) > 0,
        cartValue: chatData.cartSummary?.totalValue || 0,
        cartItems: chatData.cartSummary?.totalItems || 0,
        userAgent: chatData.userAgent || "unknown",
        sessionInfo: chatData.sessionInfo || {},
      },

      // ORGANIZACIÓN PARA MAKE.COM
      folderName: `user_${chatData.userId}`,
      chatSession: {
        sessionId: `${chatData.userId}_${new Date().toISOString().split("T")[0]}`,
        userIdentifier: chatData.userId,
        date: new Date().toISOString().split("T")[0],
      },

      // DATOS PLANOS PARA FÁCIL ACCESO EN MAKE.COM
      user_id: chatData.userId, // Snake case por si Make.com lo prefiere
      user_identifier: chatData.userId,
      chat_user_id: chatData.userId,
    }

    console.log("📤 ENVIANDO A MAKE.COM:")
    console.log("   - Webhook URL:", webhookUrl.substring(0, 50) + "...")
    console.log("   - UserId confirmado:", webhookData.userId)
    console.log("   - UserIdentifier:", webhookData.userIdentifier)
    console.log("   - Estructura completa:", Object.keys(webhookData))

    // Enviar datos a Make.com
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    console.log("📥 Respuesta de Make.com - Status:", webhookResponse.status)

    // Procesar respuesta del webhook
    let botResponse = null

    if (webhookResponse.ok) {
      try {
        const responseText = await webhookResponse.text()
        console.log("📄 Respuesta recibida (primeros 200 chars):", responseText.substring(0, 200))

        if (responseText && responseText.trim()) {
          try {
            const webhookResponseData = JSON.parse(responseText)
            botResponse =
              webhookResponseData.response ||
              webhookResponseData.message ||
              webhookResponseData.botResponse ||
              webhookResponseData.reply
            console.log("✅ Respuesta JSON parseada correctamente")
          } catch (parseError) {
            botResponse = responseText.trim()
            console.log("✅ Respuesta como texto plano")
          }
        }
      } catch (readError) {
        console.log("⚠️ No se pudo leer respuesta del webhook:", readError.message)
      }
    } else {
      console.log("⚠️ Webhook respondió con error:", webhookResponse.status)
      const errorText = await webhookResponse.text()
      console.log("Error details:", errorText)
    }

    console.log("✅ PROCESAMIENTO COMPLETADO")
    console.log("   - UserId enviado:", chatData.userId)
    console.log("   - Bot response disponible:", !!botResponse)

    return NextResponse.json({
      success: true,
      message: "Mensaje procesado exitosamente",
      timestamp: new Date().toISOString(),
      cartIncluded: (chatData.cartData?.length || 0) > 0,
      userId: chatData.userId,
      botResponse: botResponse,
    })
  } catch (error) {
    console.error("❌ Error procesando mensaje de chat:", error)

    return NextResponse.json({
      success: true,
      message: "Mensaje recibido con problemas técnicos",
      timestamp: new Date().toISOString(),
      botResponse: "Tu mensaje ha sido recibido. Un asesor se pondrá en contacto contigo pronto.",
      error: error.message,
    })
  }
}
