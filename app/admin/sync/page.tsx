"use client"

import { useState, useEffect } from "react"
import { Download, RefreshCw, CheckCircle, AlertCircle, Copy, ExternalLink, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * MÓDULO: Panel de Sincronización con Google Drive
 *
 * PROPÓSITO:
 * - Permitir sincronización automática del inventario desde Google Drive
 * - Convertir URLs de Google Drive automáticamente
 * - Validar y procesar archivos JSON de productos
 * - Crear backups automáticos antes de actualizar
 * - Mostrar preview de productos sincronizados
 *
 * FLUJO PARA EL CLIENTE:
 * 1. Cliente tiene archivo JSON en Google Drive (compartido públicamente)
 * 2. Para actualizar productos: abre archivo, borra contenido, pega nuevo JSON
 * 3. Guarda archivo (mismo nombre, misma ubicación)
 * 4. Sistema detecta cambio y actualiza inventario automáticamente
 *
 * CARACTERÍSTICAS:
 * - Conversión automática de URLs de Google Drive
 * - Validación completa de estructura JSON
 * - Manejo de imágenes externas via proxy
 * - Logs detallados para debugging
 * - Preview de productos sincronizados
 * - Historial de sincronizaciones
 *
 * COMPONENTES INTEGRADOS:
 * - /api/sync-inventory: API para descarga y procesamiento
 * - /api/proxy-image: Proxy para imágenes externas
 * - ProductImage: Componente para mostrar imágenes con fallback
 *
 * CONFIGURACIÓN:
 * - URL se guarda en localStorage para reutilización
 * - Backups automáticos en /data/inventory_backup_*.json
 * - Cache de 24 horas para imágenes externas
 */
export default function SyncPage() {
  const [driveUrl, setDriveUrl] = useState("")
  const [convertedUrl, setConvertedUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [lastSync, setLastSync] = useState("")
  const [syncStats, setSyncStats] = useState(null)
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)

  // Convertir URL de Google Drive automáticamente
  useEffect(() => {
    if (driveUrl.includes("drive.google.com/file/d/")) {
      const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`
        setConvertedUrl(downloadUrl)
      }
    } else if (driveUrl.includes("drive.google.com/uc?id=")) {
      setConvertedUrl(driveUrl)
    } else {
      setConvertedUrl("")
    }
  }, [driveUrl])

  const handleSync = async (showLogs = true) => {
    const urlToUse = convertedUrl || driveUrl

    if (!urlToUse.trim()) {
      setMessage("❌ Por favor ingresa la URL de Google Drive")
      return
    }

    setIsLoading(true)
    if (showLogs) setMessage("🔄 Sincronizando...")

    try {
      console.log("🔄 Iniciando sincronización manual...")

      const response = await fetch(`/api/sync-inventory?driveUrl=${encodeURIComponent(urlToUse)}&t=${Date.now()}`)
      const result = await response.json()

      console.log("📥 Respuesta recibida:", result)

      if (result.success) {
        setMessage(`✅ ${result.message} - ${result.productsCount} productos`)
        setLastSync(new Date().toLocaleString())
        setSyncStats(result)

        // Guardar URL para próximas sincronizaciones
        localStorage.setItem("placacentro-drive-url", driveUrl)

        // Forzar recarga de productos en otras pestañas
        window.dispatchEvent(new Event("inventory-updated"))

        console.log("✅ Sincronización completada exitosamente")
      } else {
        setMessage(`❌ ${result.error}`)
        console.error("❌ Error en sincronización:", result.error)
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      setMessage(`❌ Error de conexión: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh cada 30 segundos si está activado
  useEffect(() => {
    if (!isAutoRefresh || !driveUrl) return

    const interval = setInterval(() => {
      console.log("🔄 Auto-refresh activado, sincronizando...")
      handleSync(false)
    }, 30000)

    return () => clearInterval(interval)
  }, [isAutoRefresh, driveUrl])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage("📋 URL copiada al portapapeles")
    setTimeout(() => setMessage(""), 2000)
  }

  // Cargar configuración guardada
  useEffect(() => {
    const savedUrl = localStorage.getItem("placacentro-drive-url")
    const savedSync = localStorage.getItem("placacentro-last-sync")

    if (savedUrl) {
      setDriveUrl(savedUrl)
    }
    if (savedSync) {
      setLastSync(savedSync)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header con documentación */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sincronización de Inventario</h1>
          <p className="text-gray-600 mb-4">Sistema automático de actualización desde Google Drive</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Para el Cliente</h3>
              </div>
              <p className="text-sm text-blue-700">
                Solo reemplaza el contenido del archivo JSON en Google Drive. El sistema detecta cambios
                automáticamente.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Automático</h3>
              </div>
              <p className="text-sm text-green-700">
                Backups automáticos, validación de datos y manejo de imágenes externas incluido.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Simple</h3>
              </div>
              <p className="text-sm text-purple-700">
                Diseñado para clientes no técnicos. Una sola URL, un solo archivo, cero complicaciones.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Sincronización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Configuración de Sync</span>
              </CardTitle>
              <CardDescription>Configura la URL de Google Drive una sola vez</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="drive-url">URL de Google Drive</Label>
                <Input
                  id="drive-url"
                  type="url"
                  placeholder="https://drive.google.com/file/d/TU_FILE_ID/view?usp=sharing"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Pega cualquier enlace de Google Drive compartido</p>
              </div>

              {/* URL Convertida */}
              {convertedUrl && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-green-800 font-medium">URL de descarga</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(convertedUrl)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-700 break-all font-mono bg-white p-2 rounded border">
                    {convertedUrl}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleSync(true)}
                  disabled={isLoading || !driveUrl.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sincronizando...</span>
                    </div>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Sincronizar Ahora
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                  variant={isAutoRefresh ? "default" : "outline"}
                  className={isAutoRefresh ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {isAutoRefresh ? "Auto ON" : "Auto OFF"}
                </Button>
              </div>

              {message && (
                <Alert className={message.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={message.includes("✅") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Panel de Estado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Estado del Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lastSync && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Última sincronización: {lastSync}</span>
                </div>
              )}

              {isAutoRefresh && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Auto-refresh activado (cada 30s)</span>
                </div>
              )}

              {syncStats && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Última sincronización:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">{syncStats.productsCount}</div>
                      <div className="text-gray-600">Productos</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">{syncStats.externalImagesCount}</div>
                      <div className="text-gray-600">Imágenes externas</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">{syncStats.categories?.length || 0}</div>
                      <div className="text-gray-600">Categorías</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">{syncStats.backupCreated ? "✅" : "❌"}</div>
                      <div className="text-gray-600">Backup</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview de productos */}
              {syncStats?.products && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Productos sincronizados:</h4>
                  <div className="space-y-2">
                    {syncStats.products.map((product: any, index: number) => (
                      <div key={index} className="text-sm text-blue-700 flex justify-between">
                        <span>• {product.name}</span>
                        <span>${product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones para el Cliente */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Instrucciones para el Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">🎯 Proceso Simple</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span>Abre tu archivo JSON en Google Drive</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span>Selecciona todo el contenido y bórralo</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span>Pega tu nuevo JSON con los productos actualizados</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <span>Guarda el archivo (Ctrl+S)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <span className="font-medium">¡El sistema se actualiza automáticamente!</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">⚠️ Importante</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    • <strong>Mismo archivo:</strong> No crear archivos nuevos, usar el mismo
                  </p>
                  <p>
                    • <strong>Mismo nombre:</strong> No cambiar el nombre del archivo
                  </p>
                  <p>
                    • <strong>Mismo formato:</strong> Mantener estructura JSON exacta
                  </p>
                  <p>
                    • <strong>Imágenes:</strong> URLs externas funcionan automáticamente
                  </p>
                  <p>
                    • <strong>Backup:</strong> Se crea automáticamente antes de cada actualización
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prueba Rápida */}
        <Card className="mt-6 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="font-semibold text-green-800 mb-2">🧪 Prueba con tu archivo actual</h4>
              <p className="text-sm text-gray-600 mb-4">
                Archivo: inventory.json (ID: 1gdCOFgGFyBDKAycLBpCla3fislRLIFpR)
              </p>
              <Button
                onClick={() => {
                  setDriveUrl("https://drive.google.com/file/d/1gdCOFgGFyBDKAycLBpCla3fislRLIFpR/view?usp=sharing")
                  setTimeout(() => handleSync(true), 500)
                }}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                disabled={isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Probar Sincronización
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
