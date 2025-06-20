import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Placacentro Masisa Decomaderas - Catálogo Digital",
  description:
    "Sistema digital de generación de pedidos para maderera. Catálogo de productos para carpinteros y profesionales de la construcción.",
  keywords: "maderera, planchas, tornillos, herrajes, carpintería, Loja, Ecuador",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
