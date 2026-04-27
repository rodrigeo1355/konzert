import type { ReactNode } from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Konzert — Eventos en Santiago",
  description: "Descubre eventos en Santiago de Chile en un mapa interactivo.",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  )
}
