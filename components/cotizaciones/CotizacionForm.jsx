import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, Upload, Plus } from 'lucide-react'
import { toast } from 'sonner'
import BordoSelector from './BordoSelector.jsx'
import { processImageWithOpenAI, sendToWhatsApp } from '../lib/imageUtils.js'
import { getOrCreateBrowserUserId } from '@/lib/utils'

const CotizacionForm = () => {
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipoPlancha: '',
    color: '',
    vendedora: '',
    comentarios: ''
  })

  // Estados para medidas
  const [medidaActual, setMedidaActual] = useState({
    largo: '',
    ancho: '',
    cantidad: 1,
    perforacion: 'ninguna',
    tipoBordo: '1-largo',
    cantoBordo: 'canto-suave'
  })

  const [medidas, setMedidas] = useState([])
  const [imagenes, setImagenes] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Opciones para los selectores
  const tiposPlanchas = ['MDF', 'Melamina', 'Terciado', 'Aglomerado']
  const colores = ['Blanco', 'Negro', 'Madera Natural', 'Cerezo', 'Nogal', 'Haya']
  const vendedoras = ['Ana Martínez', 'María López', 'Carolina Rodríguez', 'Valentina Pérez']
  const perforaciones = ['ninguna', 'largo', 'ancho']
  const cantos = ['canto-suave', 'canto-duro']

  // Mapeo de tipos de bordo para mostrar texto legible
  const bordoTexto = {
    '1-largo': '1 Largo',
    '1-largo-1-corto': '1 Largo y 1 Corto',
    '1-largo-2-cortos': '1 Largo y 2 Cortos',
    '4-lados': '4 Lados'
  }

  // Función para agregar medida
  const agregarMedida = () => {
    if (!medidaActual.largo || !medidaActual.ancho) {
      toast.error("Largo y ancho son obligatorios")
      return
    }

    const nuevaMedida = {
      linea: medidas.length + 1,
      cantidad: parseInt(medidaActual.cantidad),
      largo: medidaActual.largo,
      ancho: medidaActual.ancho,
      perforacion: medidaActual.perforacion,
      tipoBordo: medidaActual.tipoBordo,
      cantoBordo: medidaActual.cantoBordo,
      descripcion: `Cant: ${medidaActual.cantidad}, L${medidaActual.largo}, A${medidaActual.ancho}, P-${medidaActual.perforacion}, Bordo-${bordoTexto[medidaActual.tipoBordo]}, B-${medidaActual.cantoBordo === 'canto-suave' ? 'Suave' : 'Duro'}`
    }

    setMedidas([...medidas, nuevaMedida])
    
    // Limpiar formulario de medida
    setMedidaActual({
      largo: '',
      ancho: '',
      cantidad: 1,
      perforacion: 'ninguna',
      tipoBordo: '1-largo',
      cantoBordo: 'canto-suave'
    })

    toast.success("La medida se ha agregado correctamente")
  }

  // Función para eliminar medida
  const eliminarMedida = (index) => {
    const nuevasMedidas = medidas.filter((_, i) => i !== index)
    // Reindexar las líneas
    const medidasReindexadas = nuevasMedidas.map((medida, i) => ({
      ...medida,
      linea: i + 1
    }))
    setMedidas(medidasReindexadas)
    
    toast.success("La medida se ha eliminado correctamente")
  }

  // Función para manejar subida de imágenes
  const manejarSubidaImagen = async (event) => {
    const files = Array.from(event.target.files)
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`El archivo ${file.name} es muy grande (máx. 10MB)`)
        continue
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`)
        continue
      }

      setIsLoading(true)
      
      try {
        // Procesar imagen con OpenAI Vision
        const transcripcion = await processImageWithOpenAI(file)
        
        // Enviar transcripción a WhatsApp si hay vendedora seleccionada
        if (formData.vendedora) {
          await sendToWhatsApp(transcripcion, formData.vendedora)
        }
        
        const nuevaImagen = {
          nombre: file.name,
          transcripcion: transcripcion,
          url: URL.createObjectURL(file)
        }

        setImagenes(prev => [...prev, nuevaImagen])
        
        toast.success(`${file.name} se ha procesado correctamente`)
      } catch (error) {
        toast.error(`Error al procesar ${file.name}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Función para enviar cotización
  const enviarCotizacion = async () => {
    // Validaciones
    if (!formData.tipoPlancha || !formData.color || !formData.vendedora) {
      toast.error("Tipo de plancha, color y vendedora son obligatorios")
      return
    }

    if (medidas.length === 0 && imagenes.length === 0) {
      toast.error("Debe agregar al menos una medida o una imagen")
      return
    }

    setIsLoading(true)

    try {
      const userId = getOrCreateBrowserUserId()
      // Formatear mensaje para el chat
      const cotizacionMensaje = `📝 Nueva cotización enviada:\n- Tipo de plancha: ${formData.tipoPlancha}\n- Color: ${formData.color}\n- Vendedora: ${formData.vendedora}\n- Medidas:\n${medidas.map(m => `  • ${m.descripcion} (${m.cantidad} piezas)`).join("\n")}\n- Comentarios: ${formData.comentarios || "Sin comentarios"}`
      const payload = {
        userId,
        message: cotizacionMensaje,
        timestamp: new Date().toISOString(),
        source: "placacentro-cotizacion-form",
        cotizacion: {
          tipoPlancha: formData.tipoPlancha,
          color: formData.color,
          vendedora: formData.vendedora,
          medidas: medidas,
          imagenes: imagenes,
          comentarios: formData.comentarios,
        },
      }

      // Enviar al chat (NO al webhook de Make)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success("Su cotización se ha enviado correctamente y aparecerá en el chat")
        
        // Reset del formulario
        setFormData({
          tipoPlancha: '',
          color: '',
          vendedora: '',
          comentarios: ''
        })
        setMedidas([])
        setImagenes([])
      } else {
        toast.error("Error al enviar la cotización al chat")
      }
    } catch (err) {
      toast.error("Error inesperado al enviar la cotización")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulario Principal */}
      <div className="space-y-6">
        {/* Sección 1: Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tipoPlancha">Tipo de Plancha *</Label>
              <Select value={formData.tipoPlancha} onValueChange={(value) => setFormData({...formData, tipoPlancha: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de plancha" />
                </SelectTrigger>
                <SelectContent>
                  {tiposPlanchas.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Color *</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({...formData, color: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione color" />
                </SelectTrigger>
                <SelectContent>
                  {colores.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vendedora">Vendedora *</Label>
              <Select value={formData.vendedora} onValueChange={(value) => setFormData({...formData, vendedora: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione vendedora" />
                </SelectTrigger>
                <SelectContent>
                  {vendedoras.map(vendedora => (
                    <SelectItem key={vendedora} value={vendedora}>{vendedora}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Ingreso de Medidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ingreso de Medidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="largo">Largo (cm)</Label>
                <Input
                  type="number"
                  value={medidaActual.largo}
                  onChange={(e) => setMedidaActual({...medidaActual, largo: e.target.value})}
                  placeholder="Ej: 120"
                />
              </div>
              <div>
                <Label htmlFor="ancho">Ancho (cm)</Label>
                <Input
                  type="number"
                  value={medidaActual.ancho}
                  onChange={(e) => setMedidaActual({...medidaActual, ancho: e.target.value})}
                  placeholder="Ej: 60"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={medidaActual.cantidad}
                onChange={(e) => setMedidaActual({...medidaActual, cantidad: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="perforacion">Perforación</Label>
              <Select value={medidaActual.perforacion} onValueChange={(value) => setMedidaActual({...medidaActual, perforacion: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perforaciones.map(perf => (
                    <SelectItem key={perf} value={perf}>{perf === 'ninguna' ? 'Ninguna' : perf.charAt(0).toUpperCase() + perf.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pegado de Bordo</Label>
              <BordoSelector 
                value={medidaActual.tipoBordo}
                onChange={(value) => setMedidaActual({...medidaActual, tipoBordo: value})}
              />
            </div>

            <div>
              <Label htmlFor="cantoBordo">Tipo de Canto</Label>
              <Select value={medidaActual.cantoBordo} onValueChange={(value) => setMedidaActual({...medidaActual, cantoBordo: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cantos.map(canto => (
                    <SelectItem key={canto} value={canto}>
                      {canto === 'canto-suave' ? 'Canto Suave' : 'Canto Duro'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={agregarMedida} className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Medida
            </Button>
          </CardContent>
        </Card>

        {/* Sección 3: Imágenes de Referencia */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes de Referencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Arrastra imágenes aquí o haz clic para seleccionar</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={manejarSubidaImagen}
                className="hidden"
                id="upload-images"
              />
              <Button asChild variant="outline">
                <label htmlFor="upload-images" className="cursor-pointer">
                  Seleccionar Imágenes
                </label>
              </Button>
              <p className="text-sm text-gray-500 mt-2">Máximo 10MB por imagen</p>
            </div>
          </CardContent>
        </Card>

        {/* Sección 4: Comentarios */}
        <Card>
          <CardHeader>
            <CardTitle>Comentarios</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.comentarios}
              onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
              placeholder="Comentarios adicionales..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Panel de Resumen */}
      <div className="space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Resumen de Cotización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información Básica */}
            <div>
              <h4 className="font-semibold mb-2">Información Básica</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Tipo:</span> {formData.tipoPlancha || 'No seleccionado'}</p>
                <p><span className="font-medium">Color:</span> {formData.color || 'No seleccionado'}</p>
                <p><span className="font-medium">Vendedora:</span> {formData.vendedora || 'No seleccionada'}</p>
              </div>
            </div>

            {/* Lista de Medidas */}
            {medidas.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Medidas ({medidas.length} líneas, {medidas.reduce((total, medida) => total + medida.cantidad, 0)} piezas)</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {medidas.map((medida, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{medida.descripcion}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => eliminarMedida(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imágenes */}
            {imagenes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Imágenes ({imagenes.length})</h4>
                <div className="space-y-2">
                  {imagenes.map((imagen, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{imagen.nombre}</p>
                      <p className="text-gray-600 text-xs">{imagen.transcripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comentarios */}
            {formData.comentarios && (
              <div>
                <h4 className="font-semibold mb-2">Comentarios</h4>
                <p className="text-sm text-gray-600">{formData.comentarios}</p>
              </div>
            )}

            {/* Botón de Envío */}
            <Button 
              onClick={enviarCotizacion}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Enviando...' : 'Enviar Cotización'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CotizacionForm

