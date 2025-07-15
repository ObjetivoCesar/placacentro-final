import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Nuevo componente visual para ingresar 4 medidas
const BordoSelector = ({ onAddMedidas }) => {
  const [medidas, setMedidas] = useState({
    superior: '',
    derecha: '',
    inferior: '',
    izquierda: ''
  })

  const handleInput = (lado, valor) => {
    // Solo permitir números y punto
    if (/^\d*\.?\d*$/.test(valor)) {
      setMedidas((prev) => ({ ...prev, [lado]: valor }))
    }
  }

  const medidasCompletas = Object.values(medidas).every((v) => v && !isNaN(Number(v)))

  const handleAgregar = () => {
    if (medidasCompletas) {
      onAddMedidas([
        Number(medidas.superior),
        Number(medidas.derecha),
        Number(medidas.inferior),
        Number(medidas.izquierda)
      ])
      setMedidas({ superior: '', derecha: '', inferior: '', izquierda: '' })
    }
  }

  // Elimina el texto de "Pegado de Bordo" y "Tipo de Canto" y deja solo el selector visual y el botón
  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        type="button"
        onClick={handleAgregar}
        disabled={!medidasCompletas}
        className="w-40"
      >
        Agregar medidas
      </Button>
    </div>
  )
}

export default BordoSelector

