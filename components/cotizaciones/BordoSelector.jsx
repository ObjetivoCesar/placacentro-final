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
      <span className="text-lg font-semibold mb-2 text-white">Ingresa las medidas del vidrio</span>
      <div className="relative w-40 h-40 border-2 border-gray-300 rounded bg-white flex items-center justify-center">
        {/* Superior */}
        <input
          type="text"
          value={medidas.superior}
          onChange={e => handleInput('superior', e.target.value)}
          placeholder="Superior"
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 text-center border-b border-gray-400 focus:outline-none bg-white text-blue-700 font-bold shadow"
        />
        {/* Derecha */}
        <input
          type="text"
          value={medidas.derecha}
          onChange={e => handleInput('derecha', e.target.value)}
          placeholder="Derecha"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-20 text-center border-l border-gray-400 focus:outline-none bg-white text-blue-700 font-bold shadow -mr-8"
        />
        {/* Inferior */}
        <input
          type="text"
          value={medidas.inferior}
          onChange={e => handleInput('inferior', e.target.value)}
          placeholder="Inferior"
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 text-center border-t border-gray-400 focus:outline-none bg-white text-blue-700 font-bold shadow"
        />
        {/* Izquierda */}
        <input
          type="text"
          value={medidas.izquierda}
          onChange={e => handleInput('izquierda', e.target.value)}
          placeholder="Izquierda"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-20 text-center border-r border-gray-400 focus:outline-none bg-white text-blue-700 font-bold shadow -ml-8"
        />
      </div>
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

