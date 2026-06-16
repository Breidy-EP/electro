'use client'

import Link from 'next/link'
import type { Producto } from '@/lib/supabase-queries'
import { useCart } from './CartContext'
import { useToast } from './Toast'

export default function ProductCards({ productos }: { productos: Producto[] }) {
  const { addToCart } = useCart()
  const { show } = useToast()

  return (
    <>
      {productos.map(p => {
        const img = p.imagenes?.[0]
        const etiq = p.etiquetas?.map(e => e.etiqueta).filter(Boolean) || []
        const descuento = p.precio_original
          ? Math.round((1 - p.precio / p.precio_original) * 100)
          : 0
        const stockClass = p.stock <= 0 ? 'out-stock'
          : p.stock <= p.stock_minimo ? 'low-stock'
          : 'in-stock'
        const stockText = p.stock <= 0 ? 'AGOTADO'
          : p.stock <= p.stock_minimo ? 'BAJO STOCK'
          : 'STOCK'
        const stockColor = stockClass === 'low-stock' ? '#fbbf24' : stockClass === 'out-stock' ? '#ef4444' : 'var(--secondary)'

        return (
          <div className="product-card" key={p.id}>
            <Link href={`/producto/${p.slug}`} className="product-image" style={{ display: 'block' }}>
              <img
                className="product-img"
                src={img?.url || ''}
                alt={p.nombre}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) parent.innerHTML = `<span style="font-size:48px;opacity:0.3;">${p.categoria?.icono || '⚡'}</span>`
                }}
              />
              {(etiq.length || descuento > 0) && (
                <div className="product-badges">
                  {etiq.map((t, i) => (
                    <span key={i} className="badge" style={{ background: (t as { color: string }).color }}>
                      {(t as { nombre: string }).nombre}
                    </span>
                  ))}
                  {descuento > 0 && <span className="badge badge-off">-{descuento}% OFF</span>}
                </div>
              )}
            </Link>
            <div className="product-body">
              <div className="product-sku">SKU: {p.sku}</div>
              <Link href={`/producto/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-name">{p.nombre}</div>
              </Link>
              <div className="product-stock" style={{ marginBottom: 8 }}>
                <span className={`status-dot ${stockClass}`}></span>
                <span style={{ fontFamily: 'var(--mono-font)', fontSize: 11, color: stockColor, letterSpacing: '0.05em' }}>
                  {stockText}
                </span>
              </div>
              <div className="text-body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                {p.descripcion || ''}
              </div>
              <div className="product-price" style={{ fontSize: 20 }}>
                {p.precio_original && (
                  <span style={{ color: 'var(--outline)', textDecoration: 'line-through', fontSize: 14, fontWeight: 400, marginRight: 8 }}>
                    {`Bs ${p.precio_original.toFixed(2)}`}
                  </span>
                )}
                {`Bs ${p.precio.toFixed(2)}`}
              </div>
              <div className="product-footer" style={{ marginTop: 12 }}>
                <button
                  className="btn-add"
                  onClick={() => {
                    addToCart(p.nombre, p.precio, p.sku)
                    show(`✓ ${p.nombre} añadido al carrito`)
                  }}
                >
                  🛒 AÑADIR
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
