'use client'

import { useState, useMemo } from "react"
import ProductCards from "@/components/ProductCard"
import type { Producto } from "@/lib/supabase-queries"

export default function CatalogoClient({ productos }: { productos: Producto[] }) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sort, setSort] = useState("Novedades")

  const filtered = useMemo(() => {
    return productos.filter(p => {
      if (!selectedCategory) return true
      return p.categoria?.slug === selectedCategory
    })
  }, [productos, selectedCategory])

  const uniqueCategories = useMemo(() => {
    const map = new Map<string, string>()
    productos.forEach(p => {
      if (p.categoria) map.set(p.categoria.slug, p.categoria.nombre)
    })
    return Array.from(map.entries())
  }, [productos])

  return (
    <>
      <aside className="filter-sidebar">
        <div className="filter-section">
          <h4>Categoría</h4>
          <select className="filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Todo</option>
            {uniqueCategories.map(([slug, nombre]) => (
              <option key={slug} value={slug}>{nombre}</option>
            ))}
          </select>
        </div>
      </aside>

      <div>
        <div className="catalog-header">
          <div>
            <h1 className="page-title" style={{ fontSize: 24, fontWeight: 700 }}>Catálogo de Componentes</h1>
            <div className="results-count">
              Mostrando {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} técnicos
            </div>
          </div>
          <div className="sort-select">
            <span style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>ORDENAR POR:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Novedades</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
              <option>Más Populares</option>
            </select>
          </div>
        </div>

        <div className="products-grid" id="product-grid">
          {filtered.length > 0 ? (
            <ProductCards productos={filtered} />
          ) : (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: "var(--on-surface-variant)" }}>
              No se encontraron productos con los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
