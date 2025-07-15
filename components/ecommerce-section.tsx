"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ProductCard from "@/components/product-card"
import Cart from "@/components/cart"
import type { Product, CartItem } from "@/types"

/**
 * Sección de E-commerce con catálogo de productos
 */
export default function EcommerceSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const tabsListRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  useEffect(() => {
    loadProducts()
    loadCart()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, activeTab])

  useEffect(() => {
    // Guardar carrito en localStorage
    localStorage.setItem("placacentro-cart", JSON.stringify(cart))
    // Disparar evento para actualizar el contador del footer
    window.dispatchEvent(new Event("storage"))
  }, [cart])

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabsListRef.current
    if (!el) return
    const amount = el.clientWidth * 0.7
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Error al cargar productos")
      }
      const data = await response.json()
      setProducts(data)
      setLoading(false)
    } catch (err) {
      setError("No se pudieron cargar los productos")
      setLoading(false)
    }
  }

  const loadCart = () => {
    const savedCart = localStorage.getItem("placacentro-cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (activeTab !== "all") {
      filtered = filtered.filter((product) => product.category === activeTab)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProducts(filtered)
  }

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        return [...prevCart, { product, quantity }]
      }
    })
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const categories = [...new Set(products.map((product) => product.category))]
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      const el = tabsListRef.current
      if (!el) return
      setShowLeftArrow(el.scrollLeft > 5)
      setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
    }
    const el = tabsListRef.current
    if (el) {
      el.addEventListener('scroll', handleScroll)
      handleScroll()
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll)
    }
  }, [filteredProducts, categories, activeTab])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProducts} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Accesorios</p>
              <h2 className="text-xl font-bold text-white">Carpintería</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="relative bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full px-4"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrito
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">{cartItemsCount}</Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-2 mt-2 mx-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-gray-200 mb-2"
            />
          </div>
        </div>
      </div>

      {/* Tabs de categorías */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList ref={tabsListRef} className="relative mb-4 mx-2 flex gap-2 bg-white rounded-xl p-2 shadow overflow-x-auto whitespace-nowrap flex-nowrap pl-4">
          {showLeftArrow && (
            <button onClick={() => scrollTabs('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-gray-500 hover:bg-white" style={{ pointerEvents: 'auto' }}>
              &#8592;
            </button>
          )}
          {showRightArrow && (
            <button onClick={() => scrollTabs('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md text-gray-500 hover:bg-white" style={{ pointerEvents: 'auto' }}>
              &#8594;
            </button>
          )}
          {["all", ...categories].map((category, idx) => (
            <>
              {idx !== 0 && <span className="text-gray-300 mx-1 select-none">|</span>}
              <TabsTrigger key={category} value={category} className="min-w-[120px] capitalize">{category === "all" ? "Todas las categorías" : category}</TabsTrigger>
            </>
          ))}
        </TabsList>
        <div className="mt-2 mb-4 text-gray-600 text-sm px-4">
          Mostrando {filteredProducts.filter(p => activeTab === "all" || p.category === activeTab).length} de {products.length} productos
        </div>
        {/* Contenido de cada tab */}
        {["all", ...categories].map((category) => (
          <TabsContent key={category} value={category} className="w-full">
            {/* Slide horizontal en móvil */}
            <div className="flex flex-nowrap overflow-x-auto gap-4 px-2 md:hidden">
              {filteredProducts
                .filter((product) => category === "all" || product.category === category)
                .map((product) => (
                  <div key={product.id} className="min-w-[80vw] max-w-xs flex-shrink-0">
                    <ProductCard product={product} onAddToCart={addToCart} />
                  </div>
                ))}
            </div>
            {/* Grid en escritorio */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts
                .filter((product) => category === "all" || product.category === category)
                .map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  )
}
