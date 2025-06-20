import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

/**
 * API Route para obtener la lista de productos
 * GET /api/products
 */
export async function GET() {
  try {
    console.log("API: Obteniendo lista de productos")

    const filePath = path.join(process.cwd(), "data", "inventory.json")

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error("Archivo de inventario no encontrado:", filePath)
      return NextResponse.json({ error: "Inventario no disponible" }, { status: 404 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const products = JSON.parse(fileContents)

    console.log(`API: Devolviendo ${products.length} productos`)

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
