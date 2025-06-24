'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const VoiceRecorder = ({ onTranscription, isDisabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Verificar soporte del navegador
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Tu navegador no soporta grabación de audio")
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        
        // Detener todas las pistas de audio
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success("Grabación iniciada. Dicta las medidas claramente.")
      
    } catch (error) {
      console.error('Error al acceder al micrófono:', error)
      toast.error("No se pudo acceder al micrófono. Verifica los permisos.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
      toast.info("Procesando audio...")
    }
  }

  const processAudio = async (audioBlob) => {
    try {
      // Convertir webm a mp3 si es necesario (para mejor compatibilidad con Whisper)
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
      
      // Llamar a la API de Whisper
      const transcription = await transcribeAudio(audioFile)
      
      if (transcription) {
        // Parsear la transcripción para extraer medidas
        const parsedMeasures = parseMeasuresFromText(transcription)
        
        if (parsedMeasures.length > 0) {
          onTranscription(parsedMeasures, transcription)
          toast.success(`Se detectaron ${parsedMeasures.length} medida(s) en el audio`)
        } else {
          toast.warning("No se detectaron medidas válidas en el audio")
          onTranscription([], transcription)
        }
      }
      
    } catch (error) {
      console.error('Error procesando audio:', error)
      toast.error("Error al procesar el audio")
    } finally {
      setIsProcessing(false)
    }
  }

  const transcribeAudio = async (audioFile) => {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')
    formData.append('language', 'es')
    formData.append('prompt', `Eres el asistente de César especializado en extraer cantidades y medidas dictadas por voz.\n\n1. PRE-PROCESO:\n   • Elimina ruidos y repeticiones.\n   • Asegúrate de que sólo queden números y palabras clave.\n\n2. POR CADA FILA O FRASE:\n   a) Extrae “cantidad” como un entero (1–10).\n      - Si no coincide con 1–10, añade “?” tras el número.\n   b) Extrae “largo” y “ancho” siguiendo el patrón \\d+(?:\\.\\d+)?[x×por ]+\\d+(?:\\.\\d+)?\n      - Si algún caracter no se ajusta, reemplázalo por “?” en esa posición.\n   c) Detecta bordos según reglas:\n      - Si se menciona un lado largo = "un lado largo"\n      - Si se menciona un lado corto = "un lado corto"\n      - Si se mencionan dos lados largos = "dos largos"\n      - Si se mencionan dos lados cortos = "dos cortos"\n      - Si se menciona un lado largo y un lado corto = "un largo un corto"\n      - Si se mencionan dos lados largos y un lado corto = "dos largos un corto"\n      - Si se menciona un lado largo y dos lados cortos = "un largo dos cortos"\n      - Si se mencionan cuatro lados = "4 lados"\n\n   La respuesta esperada va a ser:\n   Cant (número) L()XA() Bordo (descripción)\n   Ejemplo de respuesta:\n   1 / 23.5X43.7 / 1 largo\n   12 / 32.7x98 / 2 largos un corto\n\n3. FORMATO DE SALIDA PARA USUARIO:\n   Cant / Largo×Ancho / descripción bordos\n   (p. ej. 2 / 35.6×29 / dos largos un corto)\n\n4. DETECCIÓN DE TEXTOS ADICIONALES:\n   • Si el audio contiene otros fragmentos de texto (títulos, nombres de planchas, lista de materiales, anotaciones, etc.), extrae esos textos completos.\n   • Consolida todos esos fragmentos bajo el encabezado Texto del audio:.\n   • Después, lista las medidas extraídas (según puntos 2–3) bajo el encabezado Medidas del audio:.\n\nEjemplo de salida final (siguiendo al pie de la letra el formato solicitado):\n\nTexto del audio:\nMELAMINA BLANCA HR\n15 mm BORDO BLANCO\n\nMedidas del audio:\n1 / 89.5×30 / un lado largo\n12? / 61.7×30 / dos largos\n12 / 58.7×30 / dos largos un corto\n12 / 58.7×10 / un largo un corto\n12 / 92.5×30? / ?\n(par) 12 / – / –\n12 / – / –\n200 / – / –\n\nEl formato de salida debe ser Cant: 1, L12, A23, P-ninguna, Bordo-1 Largo, B-Suave donde cant es cantidad, L es el largo, A es el ancho, P es perforación y si no se menciona no pasa nada seria 0, Bordo depende del dictado y representa 1 rectángulo y generalmente puede ser algunas combinaciones.`)

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Error en la transcripción de audio')
    }

    const data = await response.json()
    return data.text
  }

  const parseMeasuresFromText = (text) => {
    const measures = []
    
    // Patrones para detectar medidas
    const patterns = [
      /\d+\s*(?:unidad|unidades|pieza|piezas)?\s*(?:de)?\s*(\d+(?:\.\d+)?)\s*(?:por|x|×)\s*(\d+(?:\.\d+)?)\s*(?:bordo|borde)?\s*([\w\s\d]+)?/gi,
      /\d+(?:\.\d+)?\s*(?:por|x|×)\s*(\d+(?:\.\d+)?)\s*(?:cantidad|cant)?\s*(\d+)?\s*(?:bordo|borde)?\s*([\w\s\d]+)?/gi,
      /(?:largo|l)\s*(\d+(?:\.\d+)?)\s*(?:ancho|a)\s*(\d+(?:\.\d+)?)\s*(?:cantidad|cant)?\s*(\d+)?/gi
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        let cantidad, largo, ancho, bordoText
        if (pattern.source.includes("largo") && pattern.source.includes("ancho")) {
          largo = match[1]
          ancho = match[2]
          cantidad = match[3] || 1
          bordoText = "1 largo"
        } else if (pattern.source.includes("unidad")) {
          cantidad = match[1]
          largo = match[2]
          ancho = match[3]
          bordoText = match[4] || "1 largo"
        } else {
          largo = match[1]
          ancho = match[2]
          cantidad = match[3] || 1
          bordoText = match[4] || "1 largo"
        }
        const parsedLargo = parseFloat(largo)
        const parsedAncho = parseFloat(ancho)
        if (isNaN(parsedLargo) || isNaN(parsedAncho) || parsedLargo <= 0 || parsedAncho <= 0) {
          continue
        }
        const bordoMapping = {
          "1 lado largo": "1-largo",
          "un lado largo": "1-largo",
          "1 largo": "1-largo",
          "un largo": "1-largo",
          "1 lado largo y 1 lado corto": "1-largo-1-corto",
          "un lado largo y un lado corto": "1-largo-1-corto",
          "1 largo 1 corto": "1-largo-1-corto",
          "un largo un corto": "1-largo-1-corto",
          "1 lado largo y 2 lados cortos": "1-largo-2-cortos",
          "un lado largo y dos lados cortos": "1-largo-2-cortos",
          "1 largo 2 cortos": "1-largo-2-cortos",
          "un largo dos cortos": "1-largo-2-cortos",
          "4 lados": "4-lados",
          "cuatro lados": "4-lados",
          "todos los lados": "4-lados"
        }
        const tipoBordo = bordoMapping[bordoText ? bordoText.toLowerCase().trim() : ""] || "1-largo"
        measures.push({
          cantidad: parseInt(cantidad),
          largo: parsedLargo,
          ancho: parsedAncho,
          tipoBordo: tipoBordo,
          perforacion: "ninguna",
          cantoBordo: "canto-suave"
        })
      }
    }
    return measures
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={toggleRecording}
        disabled={isDisabled || isProcessing}
        className={`w-16 h-16 rounded-full ${
          isRecording 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      
      <p className="text-sm text-gray-600 text-center">
        {isProcessing 
          ? "Procesando audio..." 
          : isRecording 
            ? "Grabando... Haz clic para detener" 
            : "Haz clic para grabar medidas"
        }
      </p>
      
      {isRecording && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Ejemplo: "1 unidad de 120 por 60 bordo 4 lados"
        </p>
      )}
    </div>
  )
}

export default VoiceRecorder

