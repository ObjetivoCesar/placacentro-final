'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square } from 'lucide-react'
import { toast } from 'sonner'

const VoiceRecorder = ({ onTranscription, isDisabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success("Grabación iniciada")
    } catch (error) {
      console.error('Error al acceder al micrófono:', error)
      toast.error("Error al acceder al micrófono")
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
      // Aquí iría la lógica de transcripción con OpenAI Whisper
      // Por ahora, simulamos una transcripción
      const mockTranscription = "Medida transcrita desde audio: 120cm x 60cm, cantidad 2"
      
      setTimeout(() => {
        onTranscription(mockTranscription)
        setIsProcessing(false)
        toast.success("Audio transcrito correctamente")
      }, 2000)
    } catch (error) {
      console.error('Error al procesar audio:', error)
      setIsProcessing(false)
      toast.error("Error al procesar el audio")
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isDisabled || isProcessing}
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        className={`w-16 h-16 rounded-full ${
          isRecording 
            ? "bg-red-500 hover:bg-red-600 animate-pulse" 
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : isRecording ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      <span className="text-xs text-center">
        {isProcessing 
          ? "Procesando..." 
          : isRecording 
            ? "Grabando..." 
            : "Haz clic para grabar"
        }
      </span>
    </div>
  )
}

export default VoiceRecorder

