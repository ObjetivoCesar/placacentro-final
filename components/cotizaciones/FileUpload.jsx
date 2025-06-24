'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

const FileUpload = ({ onImageAnalysis, isDisabled = false }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor selecciona un archivo de imagen")
        return
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande. Máximo 10MB.")
        return
      }

      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
      processImage(file)
    }
  }

  const processImage = async (imageFile) => {
    setIsProcessing(true)
    try {
      // Aquí iría la lógica de análisis con OpenAI Vision
      // Por ahora, simulamos un análisis
      const mockAnalysis = "Análisis de imagen subida: Se detectaron medidas de 150cm x 80cm"
      const mockMedidas = [
        {
          cantidad: 1,
          largo: 150,
          ancho: 80,
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

  const resetSelection = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (selectedImage) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <img 
            src={selectedImage} 
            alt="Imagen seleccionada" 
            className="w-32 h-24 object-cover rounded-lg border-2 border-gray-300"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <Button
          onClick={resetSelection}
          variant="outline"
          size="sm"
          disabled={isProcessing}
        >
          <X className="w-4 h-4 mr-1" />
          Cambiar imagen
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        onClick={openFileDialog}
        disabled={isDisabled}
        className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
      >
        <Upload className="w-6 h-6" />
      </Button>
      <span className="text-xs text-center">
        Haz clic para subir foto
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

export default FileUpload

