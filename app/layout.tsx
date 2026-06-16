import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ELECTRO FNI | ElectroIngeniería FNI",
  description: "Tienda virtual de componentes electrónicos y herramientas para estudiantes de ingeniería.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}
