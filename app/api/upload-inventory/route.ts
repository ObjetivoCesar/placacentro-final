import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import fs from "fs"
import path from "path"

/**
 * API Route para subir archivos de inventario (Excel o JSON)
 * POST /api/upload-inventory
 */
export async function POST(request: NextRequest) {
  try {
    console.log("API: Procesando subida de inventario")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    console.log("API: Archivo recibido:", file.name, "Tipo:", file.type)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let products: any[] = []

    // Procesar según el tipo de archivo
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // Procesar archivo Excel
      const workbook = XLSX.read(buffer, { type: "buffer" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Mapear datos de Excel al formato esperado
      products = jsonData.map((row: any, index: number) => ({
        id: row.id || `PROD${String(index + 1).padStart(3, "0")}`,
        name: row.name || row.nombre || "",
        category: row.category || row.categoria || "General",
        price: Number(row.price || row.precio || 0),
        stock: Number(row.stock || row.inventario || 0),
        image: row.image || row.imagen || "/placeholder.svg?height=200&width=200",
        description: row.description || row.descripcion || "",
      }))
    } else if (file.name.endsWith(".json")) {
      // Procesar archivo JSON
      const jsonString = buffer.toString("utf-8")
      products = JSON.parse(jsonString)
    } else {
      return NextResponse.json({ error: "Formato de archivo no soportado. Use .xlsx o .json" }, { status: 400 })
    }

    // Validar estructura de datos
    const requiredFields = ["id", "name", "category", "price", "stock"]
    for (const product of products) {
      for (const field of requiredFields) {
        if (!(field in product)) {
          return NextResponse.json({ error: `Campo requerido faltante: ${field}` }, { status: 400 })
        }
      }
    }

    // Crear backup del inventario actual
    const inventoryPath = path.join(process.cwd(), "data", "inventory.json")
    const backupPath = path.join(process.cwd(), "data", `inventory_backup_${Date.now()}.json`)

    if (fs.existsSync(inventoryPath)) {
      fs.copyFileSync(inventoryPath, backupPath)
      console.log("API: Backup creado:", backupPath)
    }

    // Guardar nuevo inventario
    const dirPath = path.dirname(inventoryPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    fs.writeFileSync(inventoryPath, JSON.stringify(products, null, 2))

    console.log(`API: Inventario actualizado con ${products.length} productos`)

    return NextResponse.json({
      success: true,
      message: `Inventario actualizado con ${products.length} productos`,
      productsCount: products.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error subiendo inventario:", error)
    return NextResponse.json({ error: "Error procesando el archivo" }, { status: 500 })
  }
}
