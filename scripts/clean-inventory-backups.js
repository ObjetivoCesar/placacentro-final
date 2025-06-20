/**
 * SCRIPT: Limpieza de backups antiguos de inventario
 *
 * - Borra backups en data/ que tengan más de 30 días, dejando siempre los 2 más recientes.
 * - Si hay solo 2 backups, no borra nada.
 */

const fs = require("fs")
const path = require("path")

const BACKUP_DIR = path.join(__dirname, "../data")
const BACKUP_PREFIX = "inventory_backup_"
const BACKUP_SUFFIX = ".json"
const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000

function getBackups() {
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith(BACKUP_PREFIX) && f.endsWith(BACKUP_SUFFIX))
    .map((f) => ({
      file: f,
      timestamp: Number(f.replace(BACKUP_PREFIX, "").replace(BACKUP_SUFFIX, "")),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
}

function cleanBackups() {
  const backups = getBackups()
  if (backups.length <= 2) {
    console.log("Solo existen 2 o menos backups, no se borra ninguno.")
    return
  }
  const now = Date.now()
  const toDelete = backups.slice(2).filter((b) => now - b.timestamp > MS_30_DAYS)
  toDelete.forEach((b) => {
    fs.unlinkSync(path.join(BACKUP_DIR, b.file))
    console.log("Backup eliminado:", b.file)
  })
  if (toDelete.length === 0) {
    console.log("No hay backups antiguos para borrar.")
  }
}

cleanBackups()
