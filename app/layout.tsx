import type { Metadata } from "next"
import "./globals.css"
import GoogleAnalytics from "@/components/GoogleAnalytics"

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
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics id={process.env.NEXT_PUBLIC_GA_ID} />}
        {children}
      </body>
    </html>
  )
}
