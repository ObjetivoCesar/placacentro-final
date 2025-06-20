import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

/**
 * API Route para crear backup del inventario actual
 * POST /api/backup-inventory
 */
export async function POST() {
  try {
    const inventoryPath = path.join(process.cwd(), "data", "inventory.json")

    if (!fs.existsSync(inventoryPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay inventario para respaldar",
        },
        { status: 404 },
      )
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupPath = path.join(process.cwd(), "data", `inventory_backup_${timestamp}.json`)

    fs.copyFileSync(inventoryPath, backupPath)

    return NextResponse.json({
      success: true,
      message: "Backup creado exitosamente",
      backupPath: `inventory_backup_${timestamp}.json`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creando backup:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creando backup",
      },
      { status: 500 },
    )
  }
}
