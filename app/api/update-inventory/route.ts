import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

/**
 * API Route para actualizar el inventario (usado por n8n)
 * POST /api/update-inventory
 * Requiere API Key para seguridad
 */
export async function POST(request: NextRequest) {
  try {
    console.log("API: Solicitud de actualización de inventario recibida")

    // Verificar API Key
    const apiKey = request.headers.get("x-api-key")
    const expectedApiKey = process.env.INVENTORY_API_KEY || "placacentro-secret-key-2024"

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error("API: Clave API inválida o faltante")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar estructura de datos
    if (!Array.isArray(body) || body.length === 0) {
      console.error("API: Datos de inventario inválidos")
      return NextResponse.json({ error: "Datos de inventario inválidos" }, { status: 400 })
    }

    // Validar que cada producto tenga los campos requeridos
    const requiredFields = ["id", "name", "category", "price", "stock"]
    for (const product of body) {
      for (const field of requiredFields) {
        if (!(field in product)) {
          console.error(`API: Campo requerido faltante: ${field}`)
          return NextResponse.json({ error: `Campo requerido faltante: ${field}` }, { status: 400 })
        }
      }
    }

    // Guardar nuevo inventario
    const filePath = path.join(process.cwd(), "data", "inventory.json")
    const dirPath = path.dirname(filePath)

    // Crear directorio si no existe
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    fs.writeFileSync(filePath, JSON.stringify(body, null, 2))

    console.log(`API: Inventario actualizado con ${body.length} productos`)

    return NextResponse.json({
      success: true,
      message: `Inventario actualizado con ${body.length} productos`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error actualizando inventario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
