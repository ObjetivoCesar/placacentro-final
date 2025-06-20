export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

/**
 * API ROUTE: Sincronización de Inventario desde Google Drive
 *
 * FUNCIONALIDAD:
 * - Descarga JSON desde Google Drive público
 * - Valida estructura de datos
 * - Crea backup automático del inventario actual
 * - Actualiza inventario con nuevos productos
 * - Maneja imágenes externas via proxy
 *
 * PROCESO PARA EL CLIENTE:
 * 1. Cliente abre su archivo en Google Drive
 * 2. Borra contenido actual
 * 3. Pega nuevo contenido JSON
 * 4. Guarda el archivo (mismo nombre, misma ubicación)
 * 5. Sistema detecta cambio y actualiza automáticamente
 *
 * ESTRUCTURA JSON REQUERIDA:
 * [
 *   {
 *     "id": "PROD001",
 *     "name": "Nombre del Producto",
 *     "category": "Categoría",
 *     "price": 99.99,
 *     "stock": 100,
 *     "image": "https://url-de-imagen.com/imagen.jpg",
 *     "description": "Descripción del producto"
 *   }
 * ]
 *
 * DEBUGGING:
 * - Logs detallados en consola
 * - Validación paso a paso
 * - Manejo de errores específicos
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const driveUrl = searchParams.get("driveUrl")

    console.log("=== SYNC INVENTORY API ===")
    console.log("🔄 Iniciando sincronización...")
    console.log("📍 URL recibida:", driveUrl)

    if (!driveUrl) {
      console.error("❌ URL faltante")
      return NextResponse.json({ error: "URL de Google Drive requerida" }, { status: 400 })
    }

    // Convertir URL si es necesario
    let downloadUrl = driveUrl
    if (driveUrl.includes("/file/d/") && driveUrl.includes("/view")) {
      const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`
        console.log("🔄 URL convertida:", downloadUrl)
      }
    }

    console.log("📥 Descargando desde:", downloadUrl)

    // Descargar con headers específicos para Google Drive
    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })

    console.log("📡 Status de respuesta:", response.status)
    console.log("📡 Headers de respuesta:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error("❌ Error HTTP:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("❌ Contenido de error:", errorText.substring(0, 500))
      throw new Error(`Error descargando archivo: ${response.status} - ${response.statusText}`)
    }

    const responseText = await response.text()
    console.log("📄 Tamaño de respuesta:", responseText.length, "caracteres")
    console.log("📄 Primeros 300 caracteres:", responseText.substring(0, 300))

    // Verificar si es HTML (error de Google Drive)
    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      console.error("❌ Respuesta es HTML, no JSON")
      throw new Error("El archivo no es accesible públicamente. Verifica que esté compartido correctamente.")
    }

    // Parsear JSON
    let jsonData
    try {
      jsonData = JSON.parse(responseText)
      console.log("✅ JSON parseado correctamente")
    } catch (parseError) {
      const err = parseError instanceof Error ? parseError : new Error(String(parseError))
      console.error("❌ Error parsing JSON:", err.message)
      console.error("❌ Contenido problemático:", responseText.substring(0, 200))
      throw new Error(`JSON inválido: ${err.message}`)
    }

    // Validar que sea array
    if (!Array.isArray(jsonData)) {
      console.error("❌ No es un array:", typeof jsonData)
      throw new Error("El archivo debe contener un array de productos")
    }

    console.log("📊 Productos encontrados:", jsonData.length)

    // Validar estructura de cada producto
    const requiredFields = ["id", "name", "category", "price", "stock"]
    const errors = []

    for (let i = 0; i < jsonData.length; i++) {
      const product = jsonData[i]
      for (const field of requiredFields) {
        if (!(field in product) || product[field] === null || product[field] === undefined) {
          errors.push(`Producto ${i + 1} (${product.name || "sin nombre"}): Campo '${field}' faltante o vacío`)
        }
      }
    }

    if (errors.length > 0) {
      console.error("❌ Errores de validación:", errors)
      throw new Error(`Errores de validación:\n${errors.join("\n")}`)
    }

    console.log("✅ Validación completada")

    // Crear backup del inventario actual
    const inventoryPath = path.join(process.cwd(), "data", "inventory.json")
    const backupPath = path.join(process.cwd(), "data", `inventory_backup_${Date.now()}.json`)

    if (fs.existsSync(inventoryPath)) {
      fs.copyFileSync(inventoryPath, backupPath)
      console.log("💾 Backup creado:", backupPath)
    }

    // Crear directorio si no existe
    const dirPath = path.dirname(inventoryPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log("📁 Directorio creado:", dirPath)
    }

    // Guardar nuevo inventario
    fs.writeFileSync(inventoryPath, JSON.stringify(jsonData, null, 2))
    console.log("💾 Inventario guardado:", inventoryPath)

    // Estadísticas
    const externalImages = jsonData.filter((p: any) => p.image?.startsWith("http"))
    const categories = [...new Set(jsonData.map((p: any) => p.category))]

    console.log("📊 Estadísticas:")
    console.log("   - Total productos:", jsonData.length)
    console.log("   - Imágenes externas:", externalImages.length)
    console.log("   - Categorías:", categories.length)
    console.log("   - Categorías encontradas:", categories)

    console.log("✅ SINCRONIZACIÓN COMPLETADA")

    return NextResponse.json({
      success: true,
      message: `Inventario sincronizado exitosamente`,
      productsCount: jsonData.length,
      externalImagesCount: externalImages.length,
      categories: categories,
      products: jsonData.slice(0, 3), // Preview
      timestamp: new Date().toISOString(),
      backupCreated: fs.existsSync(backupPath),
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("❌ ERROR EN SINCRONIZACIÓN:", err)
    return NextResponse.json(
      {
        success: false,
        error: `Error sincronizando inventario: ${err.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
