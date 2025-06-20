/**
 * SCRIPT: Sincronización Directa desde Google Drive
 *
 * PROPÓSITO:
 * - Descargar JSON desde Google Drive del cliente
 * - Validar estructura de datos
 * - Actualizar inventario local
 * - Mostrar estadísticas de sincronización
 */

// URL del Google Drive proporcionada por el cliente
const driveUrl = "https://drive.google.com/file/d/1gdCOFgGFyBDKAycLBpCla3fislRLIFpR/view?usp=sharing"

// Convertir URL de Google Drive a URL de descarga directa
function convertGoogleDriveUrl(url) {
  const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
  if (fileId) {
    return `https://drive.google.com/uc?id=${fileId}&export=download`
  }
  return url
}

const fs = require("fs")

async function syncInventoryFromDrive() {
  try {
    console.log("=== SINCRONIZACIÓN DESDE GOOGLE DRIVE ===")
    console.log("🔄 Iniciando sincronización...")

    const downloadUrl = convertGoogleDriveUrl(driveUrl)
    console.log("📍 URL original:", driveUrl)
    console.log("📍 URL de descarga:", downloadUrl)

    console.log("📥 Descargando archivo...")

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

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
    }

    const responseText = await response.text()
    console.log("📄 Tamaño de respuesta:", responseText.length, "caracteres")
    console.log("📄 Primeros 500 caracteres:")
    console.log(responseText.substring(0, 500))

    // Verificar si es HTML (error de Google Drive)
    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      console.error("❌ PROBLEMA: La respuesta es HTML, no JSON")
      console.log("🔍 Esto significa que el archivo no es accesible públicamente")
      console.log("📋 SOLUCIÓN:")
      console.log("   1. Abre el archivo en Google Drive")
      console.log("   2. Haz clic en 'Compartir' (botón azul)")
      console.log("   3. Cambia a 'Cualquier persona con el enlace'")
      console.log("   4. Asegúrate que dice 'Lector' o 'Editor'")
      console.log("   5. Copia el nuevo enlace")
      return
    }

    // Parsear JSON
    let jsonData
    try {
      jsonData = JSON.parse(responseText)
      console.log("✅ JSON parseado correctamente")
    } catch (parseError) {
      console.error("❌ Error parsing JSON:", parseError.message)
      console.error("❌ Contenido problemático (primeros 200 chars):")
      console.error(responseText.substring(0, 200))
      throw new Error(`JSON inválido: ${parseError.message}`)
    }

    // Validar que sea array
    if (!Array.isArray(jsonData)) {
      console.error("❌ El contenido no es un array:", typeof jsonData)
      console.log("📄 Contenido recibido:", jsonData)
      throw new Error("El archivo debe contener un array de productos")
    }

    console.log("📊 Productos encontrados:", jsonData.length)

    // Validar estructura de cada producto
    const requiredFields = ["id", "name", "category", "price", "stock"]
    const errors = []

    for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
      // Validar solo los primeros 5
      const product = jsonData[i]
      console.log(`🔍 Validando producto ${i + 1}:`, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
      })

      for (const field of requiredFields) {
        if (!(field in product) || product[field] === null || product[field] === undefined) {
          errors.push(`Producto ${i + 1} (${product.name || "sin nombre"}): Campo '${field}' faltante o vacío`)
        }
      }
    }

    if (errors.length > 0) {
      console.error("❌ Errores de validación encontrados:")
      errors.forEach((error) => console.error("   •", error))
      throw new Error(`Errores de validación: ${errors.length} problemas encontrados`)
    }

    console.log("✅ Validación completada exitosamente")

    // Mostrar estadísticas
    const externalImages = jsonData.filter((p) => p.image?.startsWith("http"))
    const categories = [...new Set(jsonData.map((p) => p.category))]
    const totalValue = jsonData.reduce((sum, p) => sum + p.price * p.stock, 0)

    console.log("📊 ESTADÍSTICAS DEL INVENTARIO:")
    console.log("   📦 Total productos:", jsonData.length)
    console.log("   🖼️ Imágenes externas:", externalImages.length)
    console.log("   📂 Categorías:", categories.length)
    console.log("   💰 Valor total inventario: $", totalValue.toFixed(2))
    console.log("   📋 Categorías encontradas:", categories.join(", "))

    // Mostrar preview de productos
    console.log("\n🔍 PREVIEW DE PRODUCTOS (primeros 5):")
    jsonData.slice(0, 5).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`)
      console.log(`      💰 Precio: $${product.price}`)
      console.log(`      📦 Stock: ${product.stock}`)
      console.log(`      📂 Categoría: ${product.category}`)
      console.log(
        `      🖼️ Imagen: ${product.image ? (product.image.startsWith("http") ? "Externa" : "Local") : "Sin imagen"}`,
      )
      console.log("")
    })

    // Guardar inventario actualizado
    fs.writeFileSync("data/inventory.json", JSON.stringify(jsonData, null, 2), "utf-8")
    // Crear backup
    fs.writeFileSync(
      `data/inventory_backup_${Date.now()}.json`,
      JSON.stringify(jsonData, null, 2),
      "utf-8"
    )
    console.log("💾 Inventario actualizado y backup creado.")

    console.log("\n✅ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE")
    console.log("🎉 El inventario se ha actualizado con", jsonData.length, "productos")
    console.log("📱 Los productos aparecerán inmediatamente en la aplicación")

    return {
      success: true,
      productsCount: jsonData.length,
      externalImagesCount: externalImages.length,
      categories: categories,
      totalValue: totalValue,
      products: jsonData.slice(0, 3), // Muestra solo los primeros 3
    }
  } catch (error) {
    console.error("❌ ERROR EN SINCRONIZACIÓN:")
    console.error("   Mensaje:", error.message)
    console.error("   Tipo:", error.name)

    console.log("\n🔧 POSIBLES SOLUCIONES:")
    console.log("   1. Verificar que el archivo esté compartido públicamente")
    console.log("   2. Comprobar que el contenido sea JSON válido")
    console.log("   3. Asegurar que tenga la estructura correcta de productos")
    console.log("   4. Intentar con un archivo más pequeño para pruebas")

    return {
      success: false,
      error: error.message,
    }
  }
}

// Ejecutar sincronización
console.log("🚀 INICIANDO PROCESO DE SINCRONIZACIÓN...")
syncInventoryFromDrive()
  .then((result) => {
    if (result.success) {
      console.log("\n🎊 ¡PROCESO COMPLETADO CON ÉXITO!")
      console.log("📊 Resumen final:")
      console.log("   ✅ Productos sincronizados:", result.productsCount)
      console.log("   🖼️ Imágenes externas:", result.externalImagesCount)
      console.log("   📂 Categorías:", result.categories.length)
      console.log("   💰 Valor total: $", result.totalValue?.toFixed(2))
    } else {
      console.log("\n❌ PROCESO FALLÓ")
      console.log("🔍 Revisar los mensajes de error arriba para más detalles")
    }
  })
  .catch((error) => {
    console.error("\n💥 ERROR CRÍTICO:", error.message)
  })
