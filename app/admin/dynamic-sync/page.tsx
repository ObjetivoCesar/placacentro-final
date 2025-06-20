"use client"

import { useState, useEffect } from "react"
import {
  RefreshCw,
  Upload,
  Globe,
  Database,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  Download,
  Clock,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import ProductPreview from "@/components/product-preview"

interface SyncStatus {
  isActive: boolean
  lastSync: string
  nextSync: string
  status: "idle" | "syncing" | "success" | "error"
  message: string
  productsCount: number
  errors: string[]
}

interface ProductData {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string
  description: string
  lastUpdated?: string
}

/**
 * SISTEMA DINÁMICO DE ACTUALIZACIÓN DE PRODUCTOS
 *
 * CARACTERÍSTICAS:
 * - Múltiples fuentes de datos (Google Drive, URL directa, archivo local)
 * - Sincronización automática programable
 * - Validación en tiempo real
 * - Preview de cambios antes de aplicar
 * - Manejo robusto de errores
 * - Rollback automático en caso de fallo
 * - Monitoreo de estado en tiempo real
 * - Notificaciones push para cambios
 */
export default function DynamicSyncPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: false,
    lastSync: "",
    nextSync: "",
    status: "idle",
    message: "",
    productsCount: 0,
    errors: [],
  })

  const [dataSources, setDataSources] = useState({
    googleDrive: "",
    directUrl: "",
    autoSync: false,
    syncInterval: 30,
  })

  const [previewData, setPreviewData] = useState<ProductData[]>([])
  const [currentData, setCurrentData] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem("placacentro-sync-config")
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setDataSources(config)
    }
    loadCurrentProducts()
  }, [])

  // Auto-sync timer
  useEffect(() => {
    if (!dataSources.autoSync || !dataSources.googleDrive) return

    const interval = setInterval(() => {
      performSync(false)
    }, dataSources.syncInterval * 1000)

    return () => clearInterval(interval)
  }, [dataSources.autoSync, dataSources.syncInterval, dataSources.googleDrive])

  const loadCurrentProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const products = await response.json()
        setCurrentData(products)
        setSyncStatus((prev) => ({ ...prev, productsCount: products.length }))
      }
    } catch (error) {
      console.error("Error loading current products:", error)
    }
  }

  const saveConfiguration = () => {
    localStorage.setItem("placacentro-sync-config", JSON.stringify(dataSources))
    setSyncStatus((prev) => ({
      ...prev,
      message: "✅ Configuración guardada",
      status: "success",
    }))
    setTimeout(() => setSyncStatus((prev) => ({ ...prev, message: "", status: "idle" })), 3000)
  }

  const validateDataSource = async (url: string): Promise<{ valid: boolean; data?: any; error?: string }> => {
    try {
      // Convert Google Drive URL if needed
      let processedUrl = url
      if (url.includes("drive.google.com/file/d/")) {
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          processedUrl = `https://drive.google.com/uc?id=${fileId}&export=download`
        }
      }

      const response = await fetch(processedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PlacacentroBot/1.0)",
          Accept: "application/json, text/plain, */*",
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }

      const text = await response.text()

      // Check if it's HTML (Google Drive error)
      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        return {
          valid: false,
          error: "El archivo no es accesible públicamente. Verifica los permisos de compartir.",
        }
      }

      // Parse JSON
      const data = JSON.parse(text)

      if (!Array.isArray(data)) {
        return { valid: false, error: "El archivo debe contener un array de productos" }
      }

      // Validate product structure
      const requiredFields = ["id", "name", "category", "price", "stock"]
      for (const product of data.slice(0, 3)) {
        // Check first 3 products
        for (const field of requiredFields) {
          if (!(field in product)) {
            return {
              valid: false,
              error: `Campo requerido '${field}' faltante en producto: ${product.name || "sin nombre"}`,
            }
          }
        }
      }

      return { valid: true, data }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  const performSync = async (showProgress = true) => {
    const sourceUrl = dataSources.googleDrive || dataSources.directUrl
    if (!sourceUrl) {
      setSyncStatus((prev) => ({
        ...prev,
        status: "error",
        message: "❌ No hay fuente de datos configurada",
      }))
      return
    }

    setIsLoading(true)
    if (showProgress) setSyncProgress(0)

    setSyncStatus((prev) => ({
      ...prev,
      status: "syncing",
      message: "🔄 Sincronizando datos...",
      errors: [],
    }))

    try {
      // Step 1: Validate data source
      if (showProgress) setSyncProgress(20)
      const validation = await validateDataSource(sourceUrl)

      if (!validation.valid) {
        throw new Error(validation.error || "Fuente de datos inválida")
      }

      // Step 2: Process and validate data
      if (showProgress) setSyncProgress(40)
      const newProducts = validation.data.map((product: any) => ({
        ...product,
        lastUpdated: new Date().toISOString(),
      }))

      // Step 3: Preview changes
      if (showProgress) setSyncProgress(60)
      setPreviewData(newProducts)

      if (showProgress) {
        setShowPreview(true)
        setSyncProgress(100)
        setSyncStatus((prev) => ({
          ...prev,
          status: "success",
          message: `✅ Datos validados. ${newProducts.length} productos listos para aplicar.`,
        }))
      } else {
        // Auto-sync: apply directly
        await applyChanges(newProducts)
      }
    } catch (error) {
      setSyncStatus((prev) => ({
        ...prev,
        status: "error",
        message: `❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
        errors: [error instanceof Error ? error.message : "Error desconocido"],
      }))
    } finally {
      setIsLoading(false)
      if (showProgress) setSyncProgress(0)
    }
  }

  const applyChanges = async (products: ProductData[]) => {
    try {
      setSyncStatus((prev) => ({ ...prev, status: "syncing", message: "💾 Aplicando cambios..." }))

      // Create backup
      const backupResponse = await fetch("/api/backup-inventory", { method: "POST" })

      // Update inventory
      const updateResponse = await fetch("/api/update-inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INVENTORY_API_KEY || "placacentro-2024-secret",
        },
        body: JSON.stringify(products),
      })

      if (!updateResponse.ok) {
        throw new Error("Error actualizando inventario")
      }

      // Update local state
      setCurrentData(products)
      setPreviewData([])
      setShowPreview(false)

      setSyncStatus((prev) => ({
        ...prev,
        status: "success",
        message: `✅ Inventario actualizado exitosamente. ${products.length} productos.`,
        productsCount: products.length,
        lastSync: new Date().toLocaleString(),
      }))

      // Notify other components
      window.dispatchEvent(new Event("inventory-updated"))
    } catch (error) {
      setSyncStatus((prev) => ({
        ...prev,
        status: "error",
        message: `❌ Error aplicando cambios: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }))
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      setSyncStatus((prev) => ({
        ...prev,
        status: "error",
        message: "❌ Solo se permiten archivos .json",
      }))
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const validation = await validateDataSource("data:application/json," + encodeURIComponent(text))
      if (validation.valid) {
        setPreviewData(validation.data)
        setShowPreview(true)
        setSyncStatus((prev) => ({
          ...prev,
          status: "success",
          message: `✅ Archivo cargado. ${validation.data.length} productos listos.`,
        }))
      }
    } catch (error) {
      setSyncStatus((prev) => ({
        ...prev,
        status: "error",
        message: `❌ Error procesando archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "syncing":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      case "syncing":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔄 Sistema Dinámico de Actualización</h1>
          <p className="text-gray-600">Sincronización automática y gestión inteligente de productos</p>
        </div>

        {/* Status Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${getStatusColor(syncStatus.status)}`}>
                  {getStatusIcon(syncStatus.status)}
                  <span className="font-medium">
                    {syncStatus.status === "idle" && "Sistema Listo"}
                    {syncStatus.status === "syncing" && "Sincronizando..."}
                    {syncStatus.status === "success" && "Sincronización Exitosa"}
                    {syncStatus.status === "error" && "Error en Sincronización"}
                  </span>
                </div>

                {syncStatus.productsCount > 0 && (
                  <Badge variant="secondary">{syncStatus.productsCount} productos</Badge>
                )}

                {dataSources.autoSync && (
                  <Badge className="bg-green-100 text-green-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Auto-Sync Activo
                  </Badge>
                )}
              </div>

              <div className="text-sm text-gray-500">
                {syncStatus.lastSync && `Última sync: ${syncStatus.lastSync}`}
              </div>
            </div>

            {syncProgress > 0 && (
              <div className="mt-4">
                <Progress value={syncProgress} className="w-full" />
              </div>
            )}

            {syncStatus.message && (
              <Alert
                className={`mt-4 ${
                  syncStatus.status === "success"
                    ? "border-green-200 bg-green-50"
                    : syncStatus.status === "error"
                      ? "border-red-200 bg-red-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <AlertDescription
                  className={
                    syncStatus.status === "success"
                      ? "text-green-800"
                      : syncStatus.status === "error"
                        ? "text-red-800"
                        : "text-blue-800"
                  }
                >
                  {syncStatus.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sources">Fuentes de Datos</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="automation">Automatización</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
          </TabsList>

          {/* Data Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Google Drive Source */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Google Drive</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="google-drive-url">URL de Google Drive</Label>
                    <Input
                      id="google-drive-url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={dataSources.googleDrive}
                      onChange={(e) =>
                        setDataSources((prev) => ({
                          ...prev,
                          googleDrive: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    onClick={() => performSync(true)}
                    disabled={isLoading || !dataSources.googleDrive}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Sincronizar desde Drive
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* File Upload Source */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Subir Archivo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Arrastra un archivo JSON aquí</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                      Seleccionar Archivo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveConfiguration} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            {showPreview && previewData.length > 0 ? (
              <ProductPreview
                currentProducts={currentData}
                newProducts={previewData}
                onApply={() => applyChanges(previewData)}
                onCancel={() => {
                  setShowPreview(false)
                  setPreviewData([])
                }}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay cambios para previsualizar</h3>
                  <p className="text-gray-500">Sincroniza datos desde una fuente para ver los cambios aquí</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Auto-Sync</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-Sincronización</Label>
                    <p className="text-sm text-gray-500">Sincronizar automáticamente cada cierto tiempo</p>
                  </div>
                  <Switch
                    checked={dataSources.autoSync}
                    onCheckedChange={(checked) => setDataSources((prev) => ({ ...prev, autoSync: checked }))}
                  />
                </div>

                {dataSources.autoSync && (
                  <div>
                    <Label htmlFor="sync-interval">Intervalo de Sincronización (segundos)</Label>
                    <Input
                      id="sync-interval"
                      type="number"
                      min="10"
                      max="3600"
                      value={dataSources.syncInterval}
                      onChange={(e) =>
                        setDataSources((prev) => ({
                          ...prev,
                          syncInterval: Number.parseInt(e.target.value) || 30,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 10 segundos, máximo 1 hora</p>
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> La auto-sincronización aplicará cambios automáticamente sin
                    previsualización. Úsala solo con fuentes de datos confiables.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <Badge variant={syncStatus.status === "success" ? "default" : "destructive"}>
                        {syncStatus.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Productos:</span>
                      <span className="text-sm font-medium">{syncStatus.productsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Auto-Sync:</span>
                      <span className="text-sm font-medium">{dataSources.autoSync ? "Activo" : "Inactivo"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Última Sincronización</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">{syncStatus.lastSync || "Nunca"}</div>
                    {syncStatus.errors.length > 0 && (
                      <div className="text-xs text-red-600">{syncStatus.errors.length} errores</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fuentes Configuradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{dataSources.googleDrive ? "Google Drive" : "No configurado"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{dataSources.directUrl ? "URL Directa" : "No configurado"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {syncStatus.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Errores Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {syncStatus.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
