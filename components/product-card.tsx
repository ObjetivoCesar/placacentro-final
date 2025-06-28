"use client"

import { useState } from "react"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductImage from "@/components/product-image"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
}

/**
 * Componente para mostrar un producto individual en el catálogo
 * ACTUALIZADO: Usa ProductImage para manejar URLs externas
 */
export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    setQuantity(1)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
          <ProductImage
            src={product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            fill
            className="rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Stock: {product.stock}</div>
        </div>

        {product.stock === 0 && (
          <Badge variant="destructive" className="w-full justify-center">
            Sin Stock
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {product.stock > 0 ? (
          <>
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-medium min-w-[2rem] text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button onClick={handleAddToCart} className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Añadir al Carrito
            </Button>
            <a
              href={`/productos/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block mt-1 text-center bg-blue-700 hover:bg-blue-800 text-white py-2 rounded font-semibold text-sm transition-colors"
            >
              Ver detalles
            </a>
          </>
        ) : (
          <Button disabled className="w-full" size="sm">
            Sin Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
