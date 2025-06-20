"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string
  description: string
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/admin-inventory")
      .then((res) => res.json())
      .then(setProducts)
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(product: Product) {
    setEditing(product)
    setMessage("")
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!editing) return
    setEditing({ ...editing, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    if (!editing) return
    setLoading(true)
    setMessage("")
    const updated = products.map((p) => (p.id === editing.id ? { ...editing, price: Number(editing.price), stock: Number(editing.stock) } : p))
    const res = await fetch("/api/admin-inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      setProducts(updated)
      setEditing(null)
      setMessage("¡Producto actualizado!")
    } else {
      setMessage("Error al guardar")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Inventario</h1>
      <Input
        placeholder="Buscar por nombre, ID o categoría..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="border rounded p-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-gray-500">{p.category} | Stock: {p.stock} | ${p.price}</div>
            </div>
            <Button size="sm" onClick={() => handleEdit(p)}>
              Editar
            </Button>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400" onClick={() => setEditing(null)}>
              ✕
            </button>
            <h2 className="text-lg font-bold mb-2">Editar producto</h2>
            <Input name="name" value={editing.name} onChange={handleChange} className="mb-2" placeholder="Nombre" />
            <Input name="category" value={editing.category} onChange={handleChange} className="mb-2" placeholder="Categoría" />
            <Input name="price" value={editing.price} onChange={handleChange} className="mb-2" placeholder="Precio" type="number" />
            <Input name="stock" value={editing.stock} onChange={handleChange} className="mb-2" placeholder="Stock" type="number" />
            <Input name="image" value={editing.image} onChange={handleChange} className="mb-2" placeholder="URL de imagen" />
            <Textarea name="description" value={editing.description} onChange={handleChange} className="mb-2" placeholder="Descripción" />
            <Button onClick={handleSave} disabled={loading} className="w-full mt-2">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            {message && <div className="mt-2 text-center text-green-600">{message}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
