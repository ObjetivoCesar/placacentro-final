"use client"

import { useState } from "react"
import { Book, FileText, Download, Search, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * COMPONENTE: Visor de Documentación
 *
 * Permite acceder a toda la documentación del sistema
 * desde la interfaz de administración
 */
export default function DocumentationViewer() {
  const [searchTerm, setSearchTerm] = useState("")

  const documentationSections = [
    {
      id: "overview",
      title: "Visión General",
      description: "Arquitectura y estructura del sistema",
      icon: <Book className="h-5 w-5" />,
      content: [
        "Estructura de directorios",
        "Flujo de datos principal",
        "Configuración técnica",
        "Variables de entorno",
      ],
    },
    {
      id: "modules",
      title: "Módulos Actualizados",
      description: "Componentes y APIs modificados recientemente",
      icon: <FileText className="h-5 w-5" />,
      content: ["Sistema de chat flotante", "Inventario dinámico", "Carrito mejorado", "Sistema de imágenes con proxy"],
    },
    {
      id: "inventory",
      title: "Gestión de Inventarios",
      description: "Guía completa para actualizar productos",
      icon: <Download className="h-5 w-5" />,
      content: [
        "Métodos de actualización",
        "Preparación de archivos JSON",
        "Google Drive sync",
        "Solución de problemas",
      ],
    },
  ]

  const quickLinks = [
    {
      title: "Panel Dinámico",
      description: "Sistema avanzado de sincronización",
      path: "/admin/dynamic-sync",
      badge: "Recomendado",
    },
    {
      title: "Subida Simple",
      description: "Arrastra y suelta archivos JSON",
      path: "/admin/upload",
      badge: "Fácil",
    },
    {
      title: "Panel Básico",
      description: "Administración tradicional",
      path: "/admin",
      badge: "Clásico",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 Centro de Documentación</h1>
          <p className="text-gray-600">Guías completas y documentación técnica del sistema</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en documentación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visión General</TabsTrigger>
            <TabsTrigger value="guides">Guías</TabsTrigger>
            <TabsTrigger value="quick-access">Acceso Rápido</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentationSections.map((section) => (
                <Card key={section.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {section.icon}
                      <span>{section.title}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.content.map((item, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📋 Documentación Completa</CardTitle>
                  <p className="text-sm text-gray-600">Arquitectura, módulos y configuración técnica</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Contenido:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Estructura de directorios completa</li>
                      <li>• Documentación de todos los módulos</li>
                      <li>• APIs y endpoints disponibles</li>
                      <li>• Configuración de variables de entorno</li>
                      <li>• Flujos de datos y arquitectura</li>
                    </ul>
                  </div>
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Documentación Completa
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📦 Guía de Inventarios</CardTitle>
                  <p className="text-sm text-gray-600">Paso a paso para gestionar productos</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Incluye:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 3 métodos de actualización</li>
                      <li>• Configuración de Google Drive</li>
                      <li>• Formato de archivos JSON</li>
                      <li>• Solución de problemas comunes</li>
                      <li>• Mejores prácticas</li>
                    </ul>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Ver Guía de Inventarios
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>💻 Ejemplos de Código</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Estructura JSON de Producto:</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                      {`{
  "id": "PL001",
  "name": "Plancha MDF 15mm",
  "category": "Planchas",
  "price": 45.50,
  "stock": 150,
  "image": "https://ejemplo.com/imagen.jpg",
  "description": "Plancha MDF de 15mm, ideal para mueblería"
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Variables de Entorno:</h4>
                    <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
                      {`CHAT_WEBHOOK_URL=https://hook.us2.make.com/...
INVENTORY_API_KEY=placacentro-2024-secret`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Access Tab */}
          <TabsContent value="quick-access" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{link.title}</span>
                      <Badge variant={link.badge === "Recomendado" ? "default" : "secondary"}>{link.badge}</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm text-gray-700">{link.path}</code>
                      </div>
                      <Button className="w-full" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ir al Panel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Development vs Production */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Acceso en Diferentes Entornos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600">En Desarrollo (v0)</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm mb-2">Acceso directo a archivos:</p>
                      <ul className="text-sm space-y-1">
                        <li>
                          • <code>app/admin/dynamic-sync/page.tsx</code>
                        </li>
                        <li>
                          • <code>app/admin/upload/page.tsx</code>
                        </li>
                        <li>
                          • <code>app/admin/page.tsx</code>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">En Producción</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm mb-2">URLs de acceso:</p>
                      <ul className="text-sm space-y-1">
                        <li>
                          • <code>https://tu-dominio.com/admin/dynamic-sync</code>
                        </li>
                        <li>
                          • <code>https://tu-dominio.com/admin/upload</code>
                        </li>
                        <li>
                          • <code>https://tu-dominio.com/admin</code>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
