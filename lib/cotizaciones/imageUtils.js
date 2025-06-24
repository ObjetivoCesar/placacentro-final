// Función para procesar imagen con OpenAI Vision
export const processImageWithOpenAI = async (imageFile) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('API Key de OpenAI no configurada')
    }

    // Convertir imagen a base64
    const base64Image = await fileToBase64(imageFile)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analiza esta imagen y extrae las medidas de las piezas de madera o muebles que veas. Devuelve la información en formato JSON con los campos: cantidad, largo, ancho. Si no encuentras medidas específicas, describe lo que ves."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error al procesar imagen con OpenAI:', error)
    throw error
  }
}

// Función para enviar mensaje a WhatsApp
export const sendToWhatsApp = async (message, phoneNumber) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY
    
    if (!apiKey) {
      throw new Error('API Key de WhatsApp no configurada')
    }

    // Aquí iría la lógica para enviar mensaje a WhatsApp
    // Esto depende del proveedor de API de WhatsApp que uses
    console.log('Enviando mensaje a WhatsApp:', { message, phoneNumber })
    
    return { success: true, message: 'Mensaje enviado correctamente' }
  } catch (error) {
    console.error('Error al enviar mensaje a WhatsApp:', error)
    throw error
  }
}

// Función auxiliar para convertir archivo a base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

// Función para analizar imagen y extraer medidas
export const analyzeImageForMeasurements = async (imageFile) => {
  try {
    const analysis = await processImageWithOpenAI(imageFile)
    
    // Intentar parsear JSON si la respuesta lo contiene
    let measurements = []
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsedData)) {
          measurements = parsedData
        } else if (parsedData.medidas) {
          measurements = parsedData.medidas
        }
      }
    } catch (parseError) {
      console.log('No se pudo parsear JSON, usando análisis como texto')
    }

    return {
      measurements,
      fullAnalysis: analysis
    }
  } catch (error) {
    console.error('Error al analizar imagen:', error)
    throw error
  }
}

