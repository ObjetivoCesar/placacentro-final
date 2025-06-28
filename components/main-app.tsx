"use client"

import { useState } from "react"
import { Scissors, Wrench, ArrowRight } from "lucide-react"
import Image from "next/image"
import EcommerceSection from "@/components/ecommerce-section"
import OptimizationSection from "@/components/optimization-section"
import CartSection from "@/components/cart-section"
import FloatingChat from "@/components/floating-chat"
import FixedFooter from "@/components/fixed-footer"
import ContactCards from "@/components/contact-cards"
import CotizacionForm from "@/components/cotizaciones/CotizacionForm"

/**
 * COMPONENTE PRINCIPAL: Aplicación después del landing
 *
 * FUNCIONALIDAD:
 * - Hub central con navegación entre secciones
 * - Header minimalista con branding
 * - Secciones principales: Optimización y E-commerce
 * - Footer fijo con navegación
 * - Chat flotante integrado
 *
 * SECCIONES:
 * - home: Página principal con servicios y contacto
 * - optimization: Herramienta de optimización de cortes (iframe)
 * - ecommerce: Catálogo de productos con carrito
 * - cart: Vista dedicada del carrito de compras
 *
 * COMPONENTES INTEGRADOS:
 * - EcommerceSection: Catálogo y carrito
 * - OptimizationSection: Iframe de herramienta externa
 * - CartSection: Vista completa del carrito
 * - FloatingChat: Chat con Make.com
 * - FixedFooter: Navegación inferior
 * - ContactCards: Información de contacto
 *
 * ESTADO:
 * - activeSection: Controla qué sección se muestra
 * - Se pasa a FixedFooter para sincronizar navegación
 */
export default function MainApp() {
  const [activeSection, setActiveSection] = useState<"home" | "optimization" | "ecommerce" | "cart">("home")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#18181b] pb-20">
      {/* HERO: Video ancho completo y título */}
      <section className="w-full max-w-5xl mx-auto mt-8 mb-8">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#23232a] bg-[#18181b]">
          <div style={{position:'relative',paddingTop:'56.25%'}}>
            <iframe
              src="https://iframe.mediadelivery.net/embed/455329/9d4dc6d4-034c-4bf8-8477-138ffc896ab2?autoplay=true&loop=true&muted=true&preload=true&responsive=true"
              loading="lazy"
              style={{border:0,position:'absolute',top:0,left:0,height:'100%',width:'100%'}}
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
              title="Sistema de Mensajería Objetivo"
            ></iframe>
          </div>
        </div>
        <div className="text-center mt-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">Sistema de Mensajería Objetivo</h1>
          <h2 className="text-lg md:text-2xl text-orange-400 font-medium">Aplicado a la atención y optimización de empresas</h2>
        </div>
      </section>

      {/* Header minimalista con branding */}
      <header className="bg-[#23232a]/80 backdrop-blur-md border-b border-[#23232a] sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-[#23232a] rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DISTRIBUIDORA DE ALUMINIO Y VIDRIO</h1>
                <p className="text-xs text-orange-400">Aluvril</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main>
        {activeSection === "home" && (
          <>
            {/* Tarjetas de servicios principales */}
            <section className="container mx-auto px-6 py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Optimización de Cortes */}
                <div className="group cursor-pointer relative" onClick={() => setActiveSection("optimization")}> 
                  {/* Halo decorativo */}
                  <div className="absolute -inset-2 z-0 rounded-3xl bg-gradient-to-br from-orange-400/30 to-orange-600/10 blur-xl opacity-80 group-hover:opacity-100 transition-all"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl z-10">
                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Scissors className="h-6 w-6 text-white" />
                    </div>

                    <div className="mt-8">
                      <h3 className="text-2xl font-bold mb-3">Optimización de Cortes</h3>
                      <p className="text-blue-100 mb-6 leading-relaxed">
                        Calcula el aprovechamiento óptimo de tus planchas y reduce desperdicios al máximo
                      </p>

                      <div className="space-y-2 text-sm text-blue-100 mb-8">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Cálculo automático de cortes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Minimización de desperdicios</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Reportes detallados</span>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Comenzar</span>
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accesorios de Carpintería */}
                <div className="group cursor-pointer relative" onClick={() => setActiveSection("ecommerce")}> 
                  {/* Halo decorativo */}
                  <div className="absolute -inset-2 z-0 rounded-3xl bg-gradient-to-br from-orange-400/30 to-orange-600/10 blur-xl opacity-80 group-hover:opacity-100 transition-all"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-8 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl z-10">
                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>

                    <div className="mt-8">
                      <h3 className="text-2xl font-bold mb-3">Accesorios de Carpintería</h3>
                      <p className="text-green-100 mb-6 leading-relaxed">
                        Catálogo completo de productos para todos tus proyectos profesionales
                      </p>

                      <div className="space-y-2 text-sm text-green-100 mb-8">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Planchas y tableros</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Tornillería y herrajes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <span>Pedidos por WhatsApp</span>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Ver Catálogo</span>
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tarjetas de contacto */}
            <ContactCards />

            {/* Sección Acerca de */}
            <section className="bg-white py-16">
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-6">Más de 20 años de experiencia</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      En DISTRIBUIDORA DE ALUMINIO Y VIDRIO somos especialistas en brindar soluciones integrales para
                      carpinteros y profesionales de la construcción. Nuestro compromiso es ofrecer productos de la más
                      alta calidad y un servicio excepcional.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">500+</div>
                        <div className="text-sm text-gray-600">Clientes Satisfechos</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">1000+</div>
                        <div className="text-sm text-gray-600">Proyectos Realizados</div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Image
                      src="/images/instalaciones.jpeg"
                      alt="Instalaciones Aluvril"
                      width={600}
                      height={400}
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Renderizado condicional de secciones */}
        {activeSection === "optimization" && (
          <div>
            {/* Franja azul y encabezado */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-4">
              <div className="container mx-auto px-6 text-center">
                <p className="text-sm text-blue-100">Herramientas</p>
                <h2 className="text-xl font-bold text-white">Optimización de Cortes</h2>
              </div>
            </div>
            {/* Cotizador nativo debajo de la franja azul */}
            <div className="container mx-auto px-6 py-8">
              <CotizacionForm />
            </div>
          </div>
        )}
        {activeSection === "ecommerce" && <EcommerceSection />}
        {activeSection === "cart" && <CartSection />}
      </main>

      {/* Footer fijo con navegación */}
      <FixedFooter activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Chat flotante */}
      <FloatingChat />
    </div>
  )
}
