/**
 * Script para inicializar la base de datos con productos de muestra
 * Este script se ejecuta automáticamente al desplegar la aplicación
 */

const fs = require("fs")
const path = require("path")

const sampleProducts = [
  {
    id: "PL001",
    name: "Plancha MDF 15mm",
    category: "Planchas",
    price: 45.5,
    stock: 150,
    image: "/placeholder.svg?height=200&width=200",
    description: "Plancha MDF de 15mm, ideal para mueblería",
  },
  {
    id: "PL002",
    name: "Plancha OSB 12mm",
    category: "Planchas",
    price: 32.75,
    stock: 200,
    image: "/placeholder.svg?height=200&width=200",
    description: "Plancha OSB resistente al agua",
  },
  // ... resto de productos
]

// Crear directorio data si no existe
const dataDir = path.join(__dirname, "..", "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Escribir archivo de inventario
const inventoryPath = path.join(dataDir, "inventory.json")
fs.writeFileSync(inventoryPath, JSON.stringify(sampleProducts, null, 2))

console.log("Base de datos inicializada con productos de muestra")
console.log(`Productos creados: ${sampleProducts.length}`)
