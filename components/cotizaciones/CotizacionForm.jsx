import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Trash2, Upload, Plus, Mic, Camera } from 'lucide-react'
import { toast } from 'sonner'
import BordoSelector from './BordoSelector.jsx'
import { processImageWithOpenAI, sendToWhatsApp } from '@/lib/imageUtils.js'
import { getOrCreateBrowserUserId } from '@/lib/utils'
import VoiceRecorder from './VoiceRecorder.jsx'
import CameraCapture from './CameraCapture.jsx'
import FileUpload from './FileUpload.jsx'

const CotizacionForm = () => {
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipoPlancha: '',
    color: '',
    vendedora: '',
    comentarios: '',
    nombreCliente: '',
    telefono: '',
    direccionTaller: '',
    entrega: 'domicilio',
    fecha: new Date().toISOString().slice(0, 10)
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
  };

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
          comentarios: '',
          nombreCliente: '',
          telefono: '',
          direccionTaller: '',
          entrega: 'domicilio',
          fecha: new Date().toISOString().slice(0, 10)
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

  // Panel visual de ingreso de medidas
  const MedidasVisual = () => (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
      <div className="flex flex-col items-center flex-1">
        <button type="button" className="rounded-full bg-blue-600 w-24 h-24 flex items-center justify-center mb-2 focus:outline-none">
          <Mic className="w-10 h-10 text-white" />
        </button>
        <div className="font-bold text-center text-white">Dictar Medidas</div>
        <div className="text-sm text-gray-300 text-center">Haz clic para grabar medidas</div>
      </div>
      <div className="flex flex-col items-center flex-1">
        <button type="button" className="rounded-full bg-blue-600 w-24 h-24 flex items-center justify-center mb-2 focus:outline-none">
          <Camera className="w-10 h-10 text-white" />
        </button>
        <div className="font-bold text-center text-white">Foto de Medidas</div>
        <div className="text-sm text-gray-300 text-center">Tomar foto de medidas<br/>Requiere HTTPS y permisos</div>
      </div>
      <div className="flex flex-col items-center flex-1">
        <button type="button" className="rounded-full bg-green-500 w-24 h-24 flex items-center justify-center mb-2 focus:outline-none">
          <Upload className="w-10 h-10 text-white" />
        </button>
        <div className="font-bold text-center text-white">Subir Foto</div>
        <div className="text-sm text-gray-300 text-center">Subir foto de medidas<br/>Formatos: JPG, PNG, WebP (máx. 10MB)</div>
      </div>
    </div>
  )

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

            <div>
              <Label htmlFor="nombreCliente">Cliente</Label>
              <Input value={formData.nombreCliente} onChange={e => setFormData({...formData, nombreCliente: e.target.value})} placeholder="Nombre del cliente" />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="Teléfono" />
            </div>

            <div>
              <Label htmlFor="direccionTaller">Dirección</Label>
              <Input value={formData.direccionTaller} onChange={e => setFormData({...formData, direccionTaller: e.target.value})} placeholder="Dirección de entrega o taller" />
            </div>

            <div>
              <Label htmlFor="entrega">Entrega</Label>
              <Select value={formData.entrega} onValueChange={value => setFormData({...formData, entrega: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domicilio">A Domicilio</SelectItem>
                  <SelectItem value="sucursal">En Sucursal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Ingreso de Medidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ingreso de Medidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <MedidasVisual />
              {/* Fila de botones pequeños eliminada para dejar solo la fila superior de botones grandes */}
            </div>
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
        <Card className="sticky top-24 bg-[#23232a] text-white">
          <CardHeader>
            <CardTitle>Resumen de Cotización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información Básica */}
            <div>
              <h4 className="font-semibold mb-2">Información Básica</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Tipo:</span> {formData.tipoPlancha || <span className="text-gray-400">-</span>}</p>
                <p><span className="font-medium">Color:</span> {formData.color || <span className="text-gray-400">-</span>}</p>
                <p><span className="font-medium">Vendedora:</span> {formData.vendedora || <span className="text-gray-400">-</span>}</p>
                <p><span className="font-medium">Cliente:</span> {formData.nombreCliente || <span className="text-gray-400">-</span>}</p>
                <p><span className="font-medium">Teléfono:</span> {formData.telefono || <span className="text-gray-400">-</span>}</p>
                <p><span className="font-medium">Dirección:</span> {formData.direccionTaller || <span className="text-gray-400">-</span>}</p>
                <p><span className="font-medium">Entrega:</span> {formData.entrega === 'domicilio' ? <b>A Domicilio</b> : <b>En Sucursal</b>}</p>
                <p><span className="font-medium">Fecha:</span> <b>{formData.fecha ? new Date(formData.fecha).toLocaleDateString('es-ES') : <span className="text-gray-400">-</span>}</b></p>
              </div>
            </div>

            {/* Lista de Medidas */}
            <div>
              <h4 className="font-semibold mb-2">Medidas</h4>
              {medidas.length === 0 ? (
                <div className="text-gray-300 text-sm">No hay medidas agregadas.</div>
              ) : (
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {medidas.map((medida, idx) => (
                    <li key={idx}>{medida.descripcion}</li>
                  ))}
                </ul>
              )}
            </div>

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

