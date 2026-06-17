import Link from "next/link"
import { obtenerProductos } from "@/lib/supabase-queries"
import CatalogoClient from "./CatalogoClient"

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  let productos: Awaited<ReturnType<typeof obtenerProductos>> = []
  try {
    productos = await obtenerProductos()
  } catch (e) {
    console.error("Error fetching productos:", e)
  }

  return (
    <>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          <span className="separator">›</span>
          <span>Catálogo de Componentes</span>
        </div>
      </div>

      <div className="container">
        <div className="catalog-layout">
          <CatalogoClient productos={JSON.parse(JSON.stringify(productos))} />
        </div>
      </div>
    </>
  )
}
