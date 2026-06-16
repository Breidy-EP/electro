'use client'

import ProductCards from "@/components/ProductCard"
import type { Producto } from "@/lib/supabase-queries"

export default function HomeClient({ productos }: { productos: Producto[] }) {
  return (
    <div className="products-grid" id="featured-grid">
      <ProductCards productos={productos} />
    </div>
  )
}
