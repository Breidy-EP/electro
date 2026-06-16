'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"
import { adminObtenerProductos } from "@/lib/supabase-queries"
import type { Producto } from "@/lib/supabase-queries"

function ProductosPageInner() {
  const router = useRouter()
  const { show: toast } = useAdminToast()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = async () => {
    try {
      const p = await adminObtenerProductos()
      setProductos(p as unknown as Producto[])
    } catch (e) { console.error(e); setProductos([]) }
  }

  useEffect(() => {
    import("@/lib/supabase").then(async ({ supabase }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace("/admin/login"); return }
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      const { admin } = await res.json()
      if (!admin) { router.replace("/admin/login"); return }
      await load()
      setLoading(false)
    }).catch(console.error)
  }, [router])

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const apiFetch = async (method: string, body: unknown) => {
    const res = await fetch("/api/admin/productos", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Error") }
    return res.json()
  }

  const handleStockSave = async (id: string, val: number) => {
    if (val < 0) { toast("Stock inválido", "error"); return }
    try {
      await apiFetch("PATCH", { id, stock: val })
      toast("Stock actualizado")
      await load()
    } catch (e) { toast('Error: ' + (e instanceof Error ? e.message : String(e)), 'error') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await apiFetch("DELETE", { id })
      toast('Producto eliminado')
      await load()
    } catch (e) { toast('Error: ' + (e instanceof Error ? e.message : String(e)), 'error') }
  }

  return (
    <div className="admin-body">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">Productos</div>
          <div className="admin-topbar-user"><span>Admin</span></div>
        </div>
        <div className="admin-content">
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <div className="admin-card-header">
              <div className="admin-card-title">Inventario de productos</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input type="text" className="admin-form-control" placeholder="Buscar por nombre o SKU..."
                  value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
                <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary admin-btn-lg admin-btn-glow" style={{ fontSize: 14 }}>➕ Nuevo producto</Link>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "var(--admin-text-secondary)" }}>Cargando...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--admin-text-secondary)", textAlign: "center", padding: 48 }}>
              {productos.length === 0 ? "No hay productos registrados" : "No se encontraron productos"}
            </p>
          ) : (
            <div className="admin-product-grid">
              {filtered.map(p => {
                const imgUrl = (p as unknown as { imagenes?: { url?: string }[] }).imagenes?.[0]?.url
                const catName = (p as unknown as { categoria?: { nombre: string } }).categoria?.nombre || '-'
                const stockPct = Math.min(100, p.stock_minimo > 0 ? Math.round((p.stock / p.stock_minimo) * 100) : 100)
                const stockColor = p.stock <= 0 ? "danger" : p.stock <= p.stock_minimo ? "warning" : "success"
                return (
                  <div key={p.id} className="admin-product-card">
                    <div className="admin-product-img" onClick={() => router.push(`/admin/productos/${p.id}`)}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.nombre} />
                      ) : (
                        <div className="admin-product-img-fallback">{p.nombre.slice(0, 2).toUpperCase()}</div>
                      )}
                      <div className="admin-product-cat-badge">{catName}</div>
                    </div>
                    <div className="admin-product-info">
                      <div className="admin-product-sku text-mono">{p.sku}</div>
                      <Link href={`/admin/productos/${p.id}`} className="admin-product-name">{p.nombre}</Link>
                      <div className="admin-product-price">{`Bs ${p.precio.toFixed(2)}`}</div>
                      <div className="admin-product-stock">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span className="text-caps" style={{ fontSize: 10 }}>Stock</span>
                          <span className={`badge-pill ${stockColor}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const v = prompt("Nuevo stock:", String(p.stock))
                              if (v !== null) handleStockSave(p.id, parseInt(v) || 0)
                            }}>
                            {p.stock}
                          </span>
                        </div>
                        <div className="stat-bar">
                          <div className={`stat-bar-fill ${stockColor}`} style={{ width: `${stockPct}%` }} />
                        </div>
                      </div>
                      <div className="admin-product-actions">
                        <Link href={`/admin/productos/${p.id}`} className="admin-btn admin-btn-ghost admin-btn-sm">✏️ Editar</Link>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <AdminToastProvider>
      <ProductosPageInner />
    </AdminToastProvider>
  )
}
