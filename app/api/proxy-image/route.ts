export const dynamic = "force-dynamic";
import { type NextRequest, NextResponse } from "next/server"

/**
 * API Route para servir imágenes externas via proxy
 * Soluciona problemas de CORS y hotlinking
 * GET /api/proxy-image?url=https://example.com/image.jpg
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "URL de imagen requerida" }, { status: 400 })
    }

    console.log("🖼️ Proxy imagen:", imageUrl)

    // Fetch de la imagen externa
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PlacacentroBot/1.0)",
        Accept: "image/*",
      },
    })

    if (!response.ok) {
      console.error("❌ Error fetching imagen:", response.status)
      // Devolver imagen placeholder si falla
      return NextResponse.redirect("/placeholder.svg?height=200&width=200")
    }

    const imageBuffer = await response.arrayBuffer()
    let contentType = response.headers.get("content-type") || "image/jpeg"

    // Forzar content-type correcto para Cloudinary y otros CDNs si es necesario
    if (
      imageUrl.includes("cloudinary.com") &&
      (contentType === "application/octet-stream" || !contentType.startsWith("image/"))
    ) {
      // Detectar extensión
      if (imageUrl.match(/\.webp($|\?)/)) contentType = "image/webp"
      else if (imageUrl.match(/\.png($|\?)/)) contentType = "image/png"
      else if (imageUrl.match(/\.jpe?g($|\?)/)) contentType = "image/jpeg"
      else if (imageUrl.match(/\.gif($|\?)/)) contentType = "image/gif"
      else contentType = "image/jpeg"
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache 24 horas
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("❌ Error en proxy imagen:", error)
    return NextResponse.redirect("/placeholder.svg?height=200&width=200")
  }
}
