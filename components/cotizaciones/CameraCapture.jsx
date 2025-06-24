'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X } from 'lucide-react'
import { toast } from 'sonner'

const CameraCapture = ({ onImageAnalysis, isDisabled = false }) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsCapturing(true)
      toast.success("Cámara activada")
    } catch (error) {
      console.error('Error al acceder a la cámara:', error)
      toast.error("Error al acceder a la cámara. Verifica los permisos.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob)
          setCapturedImage(imageUrl)
          processImage(blob)
          stopCamera()
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const processImage = async (imageBlob) => {
    setIsProcessing(true)
    try {
      // Aquí iría la lógica de análisis con OpenAI Vision
      // Por ahora, simulamos un análisis
      const mockAnalysis = "Análisis de imagen: Se detectaron medidas de 120cm x 60cm"
      const mockMedidas = [
        {
          cantidad: 1,
          largo: 120,
          ancho: 60,
          tipoBordo: '1-largo',
          perforacion: 'ninguna',
          cantoBordo: 'canto-suave'
        }
      ]
      
      setTimeout(() => {
        onImageAnalysis(mockMedidas, mockAnalysis)
        setIsProcessing(false)
        toast.success("Imagen analizada correctamente")
      }, 2000)
    } catch (error) {
      console.error('Error al procesar imagen:', error)
      setIsProcessing(false)
      toast.error("Error al procesar la imagen")
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }
  }

  if (capturedImage) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <img 
            src={capturedImage} 
            alt="Imagen capturada" 
            className="w-32 h-24 object-cover rounded-lg border-2 border-gray-300"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <Button
          onClick={resetCapture}
          variant="outline"
          size="sm"
          disabled={isProcessing}
        >
          <X className="w-4 h-4 mr-1" />
          Nueva foto
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {isCapturing ? (
        <div className="flex flex-col items-center space-y-2">
          <video
            ref={videoRef}
            className="w-64 h-48 object-cover rounded-lg border-2 border-gray-300"
            autoPlay
            playsInline
            muted
          />
          <div className="flex space-x-2">
            <Button onClick={capturePhoto} className="bg-green-500 hover:bg-green-600">
              Capturar
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Button
            onClick={startCamera}
            disabled={isDisabled}
            className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600"
          >
            <Camera className="w-6 h-6" />
          </Button>
          <span className="text-xs text-center">
            Haz clic para tomar foto
          </span>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default CameraCapture

