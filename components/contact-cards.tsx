"use client"

import { Phone, MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Cards de contacto, ubicación y horarios
 * Información resumida y actualizada
 */
export default function ContactCards() {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Contacto */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Contacto</h3>
            <p className="text-gray-600 text-sm">(07) 258-9909</p>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
            <p className="text-gray-600 text-sm">Ramón Pinto entre Maximiliano Rodriguez y José María Peña, Loja</p>
          </CardContent>
        </Card>

        {/* Horarios */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Horarios</h3>
            <p className="text-gray-600 text-sm">
              Lun-Vie: 8:00-18:00
              <br />
              Sáb: 8:00-16:00
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
