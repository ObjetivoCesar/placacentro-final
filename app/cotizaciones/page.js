'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import BordoSelector from '@/components/cotizaciones/BordoSelector'
import VoiceRecorder from '@/components/cotizaciones/VoiceRecorder'
import CameraCapture from '@/components/cotizaciones/CameraCapture'
import FileUpload from '@/components/cotizaciones/FileUpload'
import { processImageWithOpenAI, sendToWhatsApp } from '@/lib/cotizaciones/imageUtils'

const CotizacionForm = () => {
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipoPlancha: '',
    color: '',
    vendedora: '',
    cliente: '',
    telefono: '',
    direccionTaller: '',
    entrega: '',
    fecha: '',
    comentarios: ''
  })

  // Estados para medidas
  const [medidas, setMedidas] = useState([])
  const [medidaActual, setMedidaActual] = useState({
    cantidad: '',
    largo: '',
    ancho: '',
    tipoBordo: '1-largo',
    perforacion: 'ninguna',
    cantoBordo: 'canto-suave'
  })

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')

  // Opciones para los selects
  const tiposPlanchas = [
    'Melamina 18mm',
    'Melamina 15mm',
    'MDF 18mm',
    'MDF 15mm',
    'Aglomerado 18mm',
    'Aglomerado 15mm'
  ]

  const colores = [
    'Blanco',
    'Negro',
    'Roble',
    'Cerezo',
    'Nogal',
    'Haya',
    'Pino',
    'Caoba'
  ]

  const vendedoras = [
    'Ana García',
    'María López',
    'Carmen Rodríguez',
    'Isabel Martín',
    'Lucía Fernández'
  ]

  const opcionesEntrega = [
    'Retiro en tienda',
    'Entrega a domicilio',
    'Envío por transporte'
  ]

  // Generar ID único al cargar el componente
  useEffect(() => {
    const id = uuidv4()
    setUserId(id)
  }, [])

  // Función para agregar medida
  const agregarMedida = () => {
    if (!medidaActual.cantidad || !medidaActual.largo || !medidaActual.ancho) {
      toast.error("Por favor completa todos los campos de la medida")
      return
    }

    const nuevaMedida = {
      id: uuidv4(),
      ...medidaActual,
      cantidad: parseInt(medidaActual.cantidad),
      largo: parseFloat(medidaActual.largo),
      ancho: parseFloat(medidaActual.ancho),
      descripcion: `${medidaActual.cantidad} unidades de ${medidaActual.largo} x ${medidaActual.ancho} cm`
    }

    setMedidas([...medidas, nuevaMedida])
    setMedidaActual({
      cantidad: '',
      largo: '',
      ancho: '',
      tipoBordo: '1-largo',
      perforacion: 'ninguna',
      cantoBordo: 'canto-suave'
    })
    toast.success("Medida agregada correctamente")
  }

  // Función para eliminar medida
  const eliminarMedida = (id) => {
    setMedidas(medidas.filter(medida => medida.id !== id))
    toast.success("Medida eliminada")
  }

  // Función para manejar transcripción de voz
  const manejarTranscripcionVoz = (transcripcion) => {
    // Aquí puedes procesar la transcripción para extraer medidas
    // Por ahora, simplemente la agregamos a los comentarios
    setFormData(prev => ({
      ...prev,
      comentarios: prev.comentarios + '\n' + transcripcion
    }))
    toast.success("Transcripción agregada a comentarios")
  }

  // Función para manejar análisis de imagen
  const manejarAnalisisImagen = (medidasDetectadas, analisisCompleto) => {
    if (medidasDetectadas && medidasDetectadas.length > 0) {
      const nuevasMedidas = medidasDetectadas.map(medida => ({
        id: uuidv4(),
        ...medida,
        descripcion: `${medida.cantidad} unidades de ${medida.largo} x ${medida.ancho} cm`
      }))
      
      setMedidas(prev => [...prev, ...nuevasMedidas])
      toast.success(`Se agregaron ${nuevasMedidas.length} medida(s) desde la imagen`)
    }
    
    // Agregar el análisis completo a comentarios
    if (analisisCompleto) {
      setFormData(prev => ({
        ...prev,
        comentarios: prev.comentarios + '\n\nAnálisis de imagen:\n' + analisisCompleto
      }))
    }
  }

  // Función para enviar formulario
  const enviarFormulario = async (e) => {
    e.preventDefault()
    
    if (!formData.tipoPlancha || !formData.color || !formData.vendedora || !formData.cliente) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    if (medidas.length === 0) {
      toast.error("Debes agregar al menos una medida")
      return
    }

    setIsLoading(true)

    try {
      // Preparar datos para envío
      const payload = {
        tipoPlancha: formData.tipoPlancha,
        color: formData.color,
        vendedora: formData.vendedora,
        cliente: formData.cliente,
        telefono: formData.telefono,
        direccionTaller: formData.direccionTaller,
        entrega: formData.entrega,
        fecha: formData.fecha,
        medidasTexto: medidas.map(m => m.descripcion).join('\n'),
        medidasArray: medidas.map(m => m.descripcion),
        medidasEstructuradas: medidas,
        totalMedidas: medidas.length,
        totalPiezas: medidas.reduce((total, medida) => total + medida.cantidad, 0),
        comentarios: formData.comentarios,
        userId: userId
      }

      const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || 'https://hook.us2.make.com/ql05r0bkj8p9f5ddtyv0m3sq8muz487p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success("Cotización enviada correctamente")
        
        // Limpiar formulario
        setFormData({
          tipoPlancha: '',
          color: '',
          vendedora: '',
          cliente: '',
          telefono: '',
          direccionTaller: '',
          entrega: '',
          fecha: '',
          comentarios: ''
        })
        setMedidas([])
        
        // Generar nuevo ID
        setUserId(uuidv4())
      } else {
        throw new Error('Error en el envío')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error("Error al enviar la cotización")
    } finally {
      setIsLoading(false)
    }
  }

   return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulario Principal (2/3) */}
      <div className="lg:col-span-2 space-y-6">
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

        {/* Sección 2: Datos del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cliente">Nombre del Cliente *</Label>
              <Input
                type="text"
                value={formData.cliente}
                onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                placeholder="Nombre completo del cliente"
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                placeholder="Número de teléfono"
              />
            </div>

            <div>
              <Label htmlFor="direccionTaller">Dirección del Taller</Label>
              <Input
                type="text"
                value={formData.direccionTaller}
                onChange={(e) => setFormData({...formData, direccionTaller: e.target.value})}
                placeholder="Dirección donde se realizará el trabajo"
              />
            </div>

            <div>
              <Label htmlFor="entrega">Tipo de Entrega</Label>
              <Select value={formData.entrega} onValueChange={(value) => setFormData({...formData, entrega: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de entrega" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesEntrega.map(opcion => (
                    <SelectItem key={opcion} value={opcion}>{opcion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fecha">Fecha de Entrega</Label>
              <Input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Ingreso de Medidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ingreso de Medidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nuevas opciones de entrada: Voz, Cámara y Subir Archivo */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Label className="text-sm font-medium mb-2 block">Dictar Medidas</Label>
                <VoiceRecorder 
                  onTranscription={manejarTranscripcionVoz}
                  isDisabled={isLoading}
                />
              </div>
              <div className="text-center">
                <Label className="text-sm font-medium mb-2 block">Foto de Medidas</Label>
                <CameraCapture 
                  onImageAnalysis={manejarAnalisisImagen}
                  isDisabled={isLoading}
                />
              </div>
              <div className="text-center">
                <Label className="text-sm font-medium mb-2 block">Subir Foto</Label>
                <FileUpload 
                  onImageAnalysis={manejarAnalisisImagen}
                  isDisabled={isLoading}
                />
              </div>
            </div>

            {/* Separador */}
            <div className="flex items-center space-x-4">
              <hr className="flex-1" />
              <span className="text-sm text-gray-500">o ingresa manualmente</span>
              <hr className="flex-1" />
            </div>

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
                value={medidaActual.cantidad}
                onChange={(e) => setMedidaActual({...medidaActual, cantidad: e.target.value})}
                placeholder="Número de piezas"
              />
            </div>

            <BordoSelector
              tipoBordo={medidaActual.tipoBordo}
              onTipoBordoChange={(tipo) => setMedidaActual({...medidaActual, tipoBordo: tipo})}
              perforacion={medidaActual.perforacion}
              onPerforacionChange={(perf) => setMedidaActual({...medidaActual, perforacion: perf})}
              cantoBordo={medidaActual.cantoBordo}
              onCantoBordoChange={(canto) => setMedidaActual({...medidaActual, cantoBordo: canto})}
            />

            <Button onClick={agregarMedida} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Medida
            </Button>
          </CardContent>
        </Card>

        {/* Sección 4: Comentarios */}
        <Card>
          <CardHeader>
            <CardTitle>Comentarios Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.comentarios}
              onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
              placeholder="Instrucciones especiales, observaciones, etc."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Panel Lateral - Resumen (1/3) */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Medidas</CardTitle>
          </CardHeader>
          <CardContent>
            {medidas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay medidas agregadas</p>
            ) : (
              <div className="space-y-3">
                {medidas.map((medida) => (
                  <div key={medida.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{medida.descripcion}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {medida.tipoBordo}
                        </Badge>
                        {medida.perforacion !== 'ninguna' && (
                          <Badge variant="outline" className="text-xs">
                            {medida.perforacion}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {medida.cantoBordo}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarMedida(medida.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total de medidas:</span>
                <span className="font-medium">{medidas.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total de piezas:</span>
                <span className="font-medium">
                  {medidas.reduce((total, medida) => total + medida.cantidad, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={enviarFormulario} 
          className="w-full" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar Cotización"}
        </Button>
      </div>
    </div>
  )
}

export default CotizacionForm

