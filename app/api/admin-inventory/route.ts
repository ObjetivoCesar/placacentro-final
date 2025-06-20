import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const INVENTORY_PATH = path.join(process.cwd(), "data", "inventory.json")

export async function GET() {
  try {
    const data = await fs.readFile(INVENTORY_PATH, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch (e) {
    return NextResponse.json({ error: "No se pudo leer el inventario" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const productos = await request.json()
    if (!Array.isArray(productos)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
    }
    await fs.writeFile(INVENTORY_PATH, JSON.stringify(productos, null, 2), "utf-8")
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "No se pudo actualizar el inventario" }, { status: 500 })
  }
}
