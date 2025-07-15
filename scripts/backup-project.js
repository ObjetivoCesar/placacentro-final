/**
 * SCRIPT: Backup ZIP de todo el proyecto Placacentro
 *
 * - Crea un archivo ZIP con los archivos clave del proyecto (data, scripts, docs, components, app)
 * - El ZIP se guarda en la carpeta raíz con timestamp
 */

const fs = require("fs")
const path = require("path")
const archiver = require("archiver")

const OUTPUT = path.join(__dirname, `../backup_placacentro_${Date.now()}.zip`)
const output = fs.createWriteStream(OUTPUT)
const archive = archiver("zip", { zlib: { level: 9 } })

output.on("close", () => {
  console.log(`Backup creado: ${OUTPUT} (${archive.pointer()} bytes)`)
})

archive.on("error", (err) => {
  throw err
})

archive.pipe(output)

// Incluir carpetas y archivos clave
archive.directory(path.join(__dirname, "../data"), "data")
archive.directory(path.join(__dirname, "../scripts"), "scripts")
archive.directory(path.join(__dirname, "../docs"), "docs")
archive.directory(path.join(__dirname, "../components"), "components")
archive.directory(path.join(__dirname, "../app"), "app")
archive.file(path.join(__dirname, "../package.json"), { name: "package.json" })
archive.file(path.join(__dirname, "../pnpm-lock.yaml"), { name: "pnpm-lock.yaml" })
archive.file(path.join(__dirname, "../tsconfig.json"), { name: "tsconfig.json" })

archive.finalize()
