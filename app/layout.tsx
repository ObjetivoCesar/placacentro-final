import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Placacentro Decomaderas - Catálogo Digital",
  description:
    "Placacentro Decomaderas: Su proveedor confiable de tableros, ferretería, sillas y más. Catálogo digital para profesionales y empresas.",
  keywords: "placacentro, decomaderas, tableros, ferretería, sillas, catálogo, Loja, Ecuador",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#18181b] text-white min-h-screen`}>{children}</body>
    </html>
  )
}
