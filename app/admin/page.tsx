"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, RefreshCw, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Panel de administración para gestión de inventario
 * Permite subir archivos Excel/JSON para actualizar productos
 */
export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [productsCount, setProductsCount] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadMessage("")
    }
  }

  const uploadInventory = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-inventory", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadMessage(`✅ ${result.message}`)
        setProductsCount(result.productsCount)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setUploadMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error subiendo archivo:", error)
      setUploadMessage("❌ Error subiendo el archivo")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Crear template de ejemplo
    const template = [
      {
        id: "PROD001",
        name: "Ejemplo Producto",
        category: "Categoria",
        price: 10.5,
        stock: 100,
        image: "/placeholder.svg?height=200&width=200",
        description: "Descripción del producto",
      },
    ]

    const dataStr = JSON.stringify(template, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "template_inventario.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestión de inventario para Placacentro Masisa Decomaderas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Subir Inventario</span>
              </CardTitle>
              <CardDescription>Sube un archivo Excel (.xlsx) o JSON con los productos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-input">Seleccionar archivo</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,.json"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Formatos soportados: .xlsx, .xls, .json</p>
              </div>

              {file && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Archivo seleccionado: {file.name}
                  </p>
                  <p className="text-xs text-blue-600">Tamaño: {(file.size / 1024).toFixed(1)} KB</p>
                </div>
              )}

              <Button
                onClick={uploadInventory}
                disabled={!file || isUploading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Inventario
                  </>
                )}
              </Button>

              {uploadMessage && (
                <Alert
                  className={uploadMessage.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <AlertDescription className={uploadMessage.includes("✅") ? "text-green-800" : "text-red-800"}>
                    {uploadMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Instrucciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Formato requerido:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • <strong>id:</strong> Código único del producto
                  </li>
                  <li>
                    • <strong>name:</strong> Nombre del producto
                  </li>
                  <li>
                    • <strong>category:</strong> Categoría
                  </li>
                  <li>
                    • <strong>price:</strong> Precio (número)
                  </li>
                  <li>
                    • <strong>stock:</strong> Cantidad disponible
                  </li>
                  <li>
                    • <strong>image:</strong> URL de la imagen
                  </li>
                  <li>
                    • <strong>description:</strong> Descripción
                  </li>
                </ul>
              </div>

              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar Template JSON
              </Button>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Se creará un backup automático del inventario actual antes de la actualización.
                </p>
              </div>

              {productsCount > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">✅ Último inventario: {productsCount} productos cargados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
