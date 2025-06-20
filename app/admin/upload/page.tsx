"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * PÁGINA SÚPER SIMPLE: Subir Inventario
 *
 * PARA CLIENTES NO TÉCNICOS:
 * - Solo arrastrar y soltar archivo JSON
 * - O hacer clic para seleccionar archivo
 * - Validación automática
 * - Actualización inmediata
 *
 * ACCESO: /admin/upload
 */
export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadStats, setUploadStats] = useState(null)

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      setMessage("❌ Por favor sube un archivo .json")
      return
    }

    setIsUploading(true)
    setMessage("📤 Subiendo archivo...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-inventory", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✅ ${result.message}`)
        setUploadStats(result)

        // Forzar actualización en otras pestañas
        window.dispatchEvent(new Event("inventory-updated"))
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error subiendo archivo: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header Simple */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 Actualizar Productos</h1>
          <p className="text-gray-600">Arrastra tu archivo JSON aquí o haz clic para seleccionarlo</p>
        </div>

        {/* Zona de Subida */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-400 hover:bg-green-50"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />

              <h3 className="text-xl font-semibold text-gray-700 mb-2">Arrastra tu archivo aquí</h3>

              <p className="text-gray-500 mb-6">O haz clic en el botón de abajo para seleccionar</p>

              <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" id="file-input" />

              <Button
                onClick={() => document.getElementById("file-input")?.click()}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Seleccionar Archivo JSON
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de Estado */}
        {message && (
          <Alert className={message.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("✅") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas */}
        {uploadStats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Archivo Procesado Exitosamente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{uploadStats.productsCount}</div>
                  <div className="text-sm text-green-700">Productos Cargados</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">✅</div>
                  <div className="text-sm text-blue-700">Backup Creado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instrucciones */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Prepara tu archivo JSON con los productos actualizados</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Arrastra el archivo a la zona de arriba o haz clic en "Seleccionar Archivo"</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>El sistema validará y actualizará automáticamente</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span className="font-medium">¡Los productos se actualizan inmediatamente!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
