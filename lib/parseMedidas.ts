import { Medida } from './messageFormatter'

/**
 * Parsea un texto con líneas en formato:
 * Cant: 1, L120, A61, P-ninguna, Bordo-4 Lados, B-Suave
 * a un array de objetos Medida
 */
export function parseMedidasFromText(text: string): Medida[] {
  const medidas: Medida[] = []
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    const match = line.match(/Cant:\s*(\d+),\s*L(\d+(?:\.\d+)?),\s*A(\d+(?:\.\d+)?),\s*P-([^,]+),\s*Bordo-([^,]+),\s*B-([^,\n]+)/i)
    if (match) {
      const [, cantidad, largo, ancho, perforacion, tipoBordo, cantoBordo] = match
      medidas.push({
        cantidad: parseInt(cantidad),
        largo,
        ancho,
        perforacion: perforacion.trim(),
        tipoBordo: tipoBordo.trim(),
        cantoBordo: cantoBordo.trim(),
        descripcion: `Cant: ${cantidad}, L${largo}, A${ancho}, P-${perforacion.trim()}, Bordo-${tipoBordo.trim()}, B-${cantoBordo.trim()}`
      })
    }
  }
  return medidas
}
