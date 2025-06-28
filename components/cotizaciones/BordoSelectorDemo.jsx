"use client"
import { useState } from 'react'
import BordoSelector from './BordoSelector'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const BordoSelectorDemo = () => {
  const [medidas, setMedidas] = useState([])

  const handleAddMedidas = (lados) => {
    setMedidas((prev) => [
      ...prev,
      {
        superior: lados[0],
        derecha: lados[1],
        inferior: lados[2],
        izquierda: lados[3],
      },
    ])
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Demo BordoSelector</CardTitle>
        </CardHeader>
        <CardContent>
          <BordoSelector onAddMedidas={handleAddMedidas} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Medidas agregadas</CardTitle>
        </CardHeader>
        <CardContent>
          {medidas.length === 0 ? (
            <p className="text-gray-500 text-center">No hay medidas agregadas</p>
          ) : (
            <ul className="space-y-2">
              {medidas.map((m, idx) => (
                <li key={idx} className="border p-2 rounded bg-gray-50 text-sm">
                  Sup: <b>{m.superior}</b> | Der: <b>{m.derecha}</b> | Inf: <b>{m.inferior}</b> | Izq: <b>{m.izquierda}</b>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BordoSelectorDemo
