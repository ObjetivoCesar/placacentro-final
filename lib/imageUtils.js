// Utilidades para manejo de imágenes
export const processImageWithOpenAI = async (imageFile, comment = "") => {
  try {
    // Convertir archivo a base64
    const base64Image = await fileToBase64(imageFile)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Eres un asistente experto en análisis de imágenes de cotizaciones de carpintería. Analiza la imagen y extrae SOLO las medidas de piezas detectadas, presentando cada una en una línea con el siguiente formato exacto: Cant: [cantidad], L[largo], A[ancho], P-[perforación], Bordo-[tipo de bordo], B-[tipo de canto]. Ejemplo: Cant: 1, L120, A61, P-ninguna, Bordo-4 Lados, B-Suave. Si hay varias piezas, escribe una por línea. Si no hay medidas, responde 'No se detectaron medidas'.

Reglas:
- No incluyas ningún texto adicional, solo la lista de medidas.
- Si falta algún dato, usa el valor por defecto: P-ninguna, Bordo-1 Largo, B-Suave.
- Si hay dudas en la imagen, indica el valor con un "?".
- No repitas encabezados ni explicaciones.
- El formato debe ser idéntico al ejemplo, una medida por línea.
${comment ? `Comentario adicional: ${comment}` : ''}`
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
    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error procesando imagen con OpenAI:', error)
    throw error
  }
}

export const sendToWhatsApp = async (transcription, vendedora) => {
  try {
    // Cambiar el número de WhatsApp fijo
    const phoneNumber = '593963425323'
    const response = await fetch('https://evolution-evolution-api.o6b5bz.easypanel.host/message/sendText/cheche', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_WHATSAPP_API_KEY || 'default-key'
      },
      body: JSON.stringify({
        number: phoneNumber,
        text: `Nueva transcripción de imagen de cotización:\n\n${transcription}`
      })
    })
    return response.ok
  } catch (error) {
    console.error('Error enviando a WhatsApp:', error)
    throw error
  }
}

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
