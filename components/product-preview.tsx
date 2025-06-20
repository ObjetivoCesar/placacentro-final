"use client"

import { useState } from "react"
import { ArrowRight, Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import ProductImage from "@/components/product-image"

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

interface ProductPreviewProps {
  currentProducts: ProductData[]
  newProducts: ProductData[]
  onApply: () => void
  onCancel: () => void
}

/**
 * COMPONENTE: Preview de Cambios de Productos
 *
 * FUNCIONALIDAD:
 * - Comparación lado a lado de productos actuales vs nuevos
 * - Detección automática de cambios (precio, stock, imagen, etc.)
 * - Resaltado visual de diferencias
 * - Estadísticas de cambios
 * - Confirmación antes de aplicar
 */
export default function ProductPreview({ currentProducts, newProducts, onApply, onCancel }: ProductPreviewProps) {
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])

  // Analyze changes
  const analyzeChanges = () => {
    const changes = {
      new: [] as ProductData[],
      updated: [] as { current: ProductData; new: ProductData; changes: string[] }[],
      removed: [] as ProductData[],
      unchanged: [] as ProductData[],
    }

    const currentMap = new Map(currentProducts.map((p) => [p.id, p]))
    const newMap = new Map(newProducts.map((p) => [p.id, p]))

    // Find new products
    newProducts.forEach((newProduct) => {
      if (!currentMap.has(newProduct.id)) {
        changes.new.push(newProduct)
      }
    })

    // Find removed products
    currentProducts.forEach((currentProduct) => {
      if (!newMap.has(currentProduct.id)) {
        changes.removed.push(currentProduct)
      }
    })

    // Find updated products
    currentProducts.forEach((currentProduct) => {
      const newProduct = newMap.get(currentProduct.id)
      if (newProduct) {
        const productChanges: string[] = []

        if (currentProduct.name !== newProduct.name) productChanges.push("name")
        if (currentProduct.price !== newProduct.price) productChanges.push("price")
        if (currentProduct.stock !== newProduct.stock) productChanges.push("stock")
        if (currentProduct.image !== newProduct.image) productChanges.push("image")
        if (currentProduct.description !== newProduct.description) productChanges.push("description")
        if (currentProduct.category !== newProduct.category) productChanges.push("category")

        if (productChanges.length > 0) {
          changes.updated.push({
            current: currentProduct,
            new: newProduct,
            changes: productChanges,
          })
        } else {
          changes.unchanged.push(currentProduct)
        }
      }
    })

    return changes
  }

  const changes = analyzeChanges()
  const totalChanges = changes.new.length + changes.updated.length + changes.removed.length

  const getPriceChangeIcon = (currentPrice: number, newPrice: number) => {
    if (newPrice > currentPrice) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (newPrice < currentPrice) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const formatPriceChange = (currentPrice: number, newPrice: number) => {
    const diff = newPrice - currentPrice
    const percentage = ((diff / currentPrice) * 100).toFixed(1)
    return {
      diff: diff.toFixed(2),
      percentage,
      isIncrease: diff > 0,
      isDecrease: diff < 0,
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resumen de Cambios</span>
            <Badge variant={totalChanges > 0 ? "default" : "secondary"}>{totalChanges} cambios detectados</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{changes.new.length}</div>
              <div className="text-sm text-green-700">Nuevos</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{changes.updated.length}</div>
              <div className="text-sm text-blue-700">Actualizados</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{changes.removed.length}</div>
              <div className="text-sm text-red-700">Eliminados</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{changes.unchanged.length}</div>
              <div className="text-sm text-gray-700">Sin cambios</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changes Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Products */}
        {changes.new.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Productos Nuevos ({changes.new.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {changes.new.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                        <ProductImage src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.category}</p>
                        <p className="text-sm font-semibold text-green-600">${product.price.toFixed(2)}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Nuevo</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Updated Products */}
        {changes.updated.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Productos Actualizados ({changes.updated.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {changes.updated.map(({ current, new: newProduct, changes: productChanges }) => (
                    <div key={current.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{current.name}</h4>
                        <div className="flex space-x-1">
                          {productChanges.map((change) => (
                            <Badge key={change} variant="outline" className="text-xs">
                              {change}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {productChanges.includes("price") && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Precio:</span>
                          <div className="flex items-center space-x-2">
                            <span className="line-through text-gray-400">${current.price.toFixed(2)}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-semibold">${newProduct.price.toFixed(2)}</span>
                            {getPriceChangeIcon(current.price, newProduct.price)}
                          </div>
                        </div>
                      )}

                      {productChanges.includes("stock") && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <div className="flex items-center space-x-2">
                            <span className="line-through text-gray-400">{current.stock}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-semibold">{newProduct.stock}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Removed Products */}
        {changes.removed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Productos Eliminados ({changes.removed.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {changes.removed.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                        <ProductImage src={product.image} alt={product.name} fill className="object-cover opacity-50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate line-through text-gray-500">{product.name}</h4>
                        <p className="text-xs text-gray-400">{product.category}</p>
                        <p className="text-sm text-gray-400">${product.price.toFixed(2)}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Eliminado</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-gray-600">
          {totalChanges > 0 ? `Se aplicarán ${totalChanges} cambios al inventario` : "No hay cambios para aplicar"}
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          <Button onClick={onApply} disabled={totalChanges === 0} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" />
            Aplicar Cambios ({totalChanges})
          </Button>
        </div>
      </div>
    </div>
  )
}
