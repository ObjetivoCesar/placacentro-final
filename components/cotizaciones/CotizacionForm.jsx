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
import { formatCotizacionMensaje } from '@/lib/messageFormatter'

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
    sucursal: '' // Nuevo campo para sucursal si aplica
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
  const [transcripcionVoz, setTranscripcionVoz] = useState([])
  const [transcripcionImagen, setTranscripcionImagen] = useState([])

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
      const fechaActual = new Date().toISOString()
      // Formatear mensaje para el chat
      const cotizacionMensaje = formatCotizacionMensaje({
        formData,
        medidas,
        transcripcionVoz,
        transcripcionImagen,
        imagenes
      })
      
      // Enviar resumen de cotización al chat flotante en vez de hacer fetch
      window.dispatchEvent(new CustomEvent("setChatInput", { detail: cotizacionMensaje }))
      window.dispatchEvent(new Event("openFloatingChat"))
      toast.success("El resumen de tu cotización ha sido copiado al chat. Revísalo y envíalo para continuar.")
      
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
        sucursal: ''
      })
      setMedidas([])
      setImagenes([])
    } catch (err) {
      toast.error("Error inesperado al enviar la cotización")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para agregar medidas desde transcripción de voz
  const manejarTranscripcionVoz = (medidasVoz, texto) => {
    setTranscripcionVoz(prev => [...prev, texto])
    setMedidas(prevMedidas => {
      const nuevas = medidasVoz.map(medida => ({
        linea: prevMedidas.length + 1,
        cantidad: medida.cantidad,
        largo: medida.largo.toString(),
        ancho: medida.ancho.toString(),
        perforacion: medida.perforacion,
        tipoBordo: medida.tipoBordo,
        cantoBordo: medida.cantoBordo,
        descripcion: `Cant: ${medida.cantidad}, L${medida.largo}, A${medida.ancho}, P-${medida.perforacion}, Bordo-${bordoTexto[medida.tipoBordo]}, B-${medida.cantoBordo === 'canto-suave' ? 'Suave' : 'Duro'}`
      }))
      const combinadas = [...prevMedidas, ...nuevas]
      return combinadas.map((m, i) => ({ ...m, linea: i + 1 }))
    })
    toast.success(`Se agregaron ${medidasVoz.length} medidas desde el audio.`)
  }
  // Función para agregar medidas desde análisis de imagen
  const manejarAnalisisImagen = (medidasImg, texto) => {
    setMedidas(prevMedidas => {
      const nuevas = medidasImg.map(medida => ({
        linea: prevMedidas.length + 1,
        cantidad: medida.cantidad,
        largo: medida.largo.toString(),
        ancho: medida.ancho.toString(),
        perforacion: medida.perforacion,
        tipoBordo: medida.tipoBordo,
        cantoBordo: medida.cantoBordo,
        descripcion: `Cant: ${medida.cantidad}, L${medida.largo}, A${medida.ancho}, P-${medida.perforacion}, Bordo-${bordoTexto[medida.tipoBordo]}, B-${medida.cantoBordo === 'canto-suave' ? 'Suave' : 'Duro'}`
      }))
      const combinadas = [...prevMedidas, ...nuevas]
      return combinadas.map((m, i) => ({ ...m, linea: i + 1 }))
    })
    setTranscripcionImagen(prev => [...prev, texto])
    toast.success(`Se agregaron ${medidasImg.length} medidas desde la imagen.`)
  }

  // Panel visual de ingreso de medidas
  const MedidasVisual = () => (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
      <div className="flex flex-col items-center flex-1">
        <VoiceRecorder
          onTranscription={manejarTranscripcionVoz}
          onClose={() => {}}
        />
        <div className="font-bold text-center text-white">Dictar Medidas</div>
        <div className="text-sm text-gray-300 text-center">Haz clic para grabar medidas</div>
      </div>
      <div className="flex flex-col items-center flex-1">
        <CameraCapture
          onImageAnalysis={manejarAnalisisImagen}
          onClose={() => {}}
        />
        <div className="font-bold text-center text-white">Foto de Medidas</div>
        <div className="text-sm text-gray-300 text-center">Tomar foto de medidas<br/>Requiere HTTPS y permisos</div>
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
              <Select value={formData.entrega} onValueChange={value => setFormData({...formData, entrega: value, sucursal: value === 'sucursal' ? formData.sucursal : ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domicilio">A Domicilio</SelectItem>
                  <SelectItem value="sucursal">En Sucursal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.entrega === 'sucursal' && (
              <div>
                <Label htmlFor="sucursal">Sucursal</Label>
                <Select value={formData.sucursal} onValueChange={value => setFormData({...formData, sucursal: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valle">Sucursal Valle</SelectItem>
                    <SelectItem value="centro">Sucursal Centro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
              {/* Separador */}
              <div className="flex items-center space-x-4 my-4">
                <hr className="flex-1 border-gray-600" />
                <span className="text-sm text-gray-400">o ingresa manualmente</span>
                <hr className="flex-1 border-gray-600" />
              </div>
              {/* Formulario de ingreso manual de medidas */}
              <form className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="largo">Largo (cm)</Label>
                  <Input type="number" value={medidaActual.largo} onChange={e => setMedidaActual({...medidaActual, largo: e.target.value})} placeholder="Ej: 120" />
                </div>
                <div>
                  <Label htmlFor="ancho">Ancho (cm)</Label>
                  <Input type="number" value={medidaActual.ancho} onChange={e => setMedidaActual({...medidaActual, ancho: e.target.value})} placeholder="Ej: 60" />
                </div>
                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input type="number" min="1" value={medidaActual.cantidad} onChange={e => setMedidaActual({...medidaActual, cantidad: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="perforacion">Perforación</Label>
                  <Select value={medidaActual.perforacion} onValueChange={value => setMedidaActual({...medidaActual, perforacion: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {perforaciones.map(perf => (
                        <SelectItem key={perf} value={perf}>{perf === 'ninguna' ? 'Ninguna' : perf.charAt(0).toUpperCase() + perf.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Pegado de Bordo</Label>
                  <BordoSelector value={medidaActual.tipoBordo} onChange={value => setMedidaActual({...medidaActual, tipoBordo: value})} />
                </div>
                <div>
                  <Label htmlFor="cantoBordo">Tipo de Canto</Label>
                  <Select value={medidaActual.cantoBordo} onValueChange={value => setMedidaActual({...medidaActual, cantoBordo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {cantos.map(canto => (
                        <SelectItem key={canto} value={canto}>{canto === 'canto-suave' ? 'Canto Suave' : 'Canto Duro'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button type="button" onClick={agregarMedida} className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Medida
                  </Button>
                </div>
              </form>
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
                <p><span className="font-medium">Fecha:</span> <b>{new Date().toLocaleDateString('es-ES')}</b></p>
              </div>
            </div>

            {/* Lista de Medidas */}
            <div>
              <h4 className="font-semibold mb-2">Medidas</h4>
              {medidas.length === 0 ? (
                <div className="text-gray-300 text-sm">
                  No hay medidas agregadas.
                  {transcripcionVoz.length > 0 && (
                    <div className="mt-2 text-gray-400">
                      <span className="font-medium">Transcripción de Voz:</span>
                      {transcripcionVoz.map((t, i) => (
                        <div key={i} className="italic bg-slate-800 text-white rounded px-2 py-1 my-1">{t}</div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {medidas.map((medida, idx) => (
                    <li key={idx}>{medida.descripcion}</li>
                  ))}
                </ul>
              )}
              {/* Mostrar todas las transcripciones de voz debajo de las medidas */}
              {transcripcionVoz.length > 0 && medidas.length > 0 && (
                <div className="mt-4">
                  <span className="font-semibold">Transcripción de Voz</span>:
                  {transcripcionVoz.map((t, i) => (
                    <div key={i} className="italic bg-slate-800 text-white rounded px-2 py-1 my-1">{t}</div>
                  ))}
                </div>
              )}
              {/* Mostrar todas las transcripciones de imagen debajo de las medidas */}
              {transcripcionImagen.length > 0 && medidas.length > 0 && (
                <div className="mt-4">
                  <span className="font-semibold">Transcripción de Imagen</span>:
                  {transcripcionImagen.map((t, i) => (
                    <div key={i} className="italic bg-slate-800 text-white rounded px-2 py-1 my-1">{t}</div>
                  ))}
                </div>
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

