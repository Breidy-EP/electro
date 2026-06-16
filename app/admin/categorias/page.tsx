'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"
import { adminObtenerCategorias, adminCrearCategoria, adminActualizarCategoria, adminEliminarCategoria } from "@/lib/supabase-queries"
import type { Categoria } from "@/lib/supabase-queries"

function CategoriasPageInner() {
  const router = useRouter()
  const { show: toast } = useAdminToast()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [userName, setUserName] = useState("Cargando...")
  const [loading, setLoading] = useState(true)
  const [newCat, setNewCat] = useState({ nombre: "", slug: "", icono: "" })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nombre: "", slug: "", icono: "" })

  const load = async () => {
    try {
      const c = await adminObtenerCategorias()
      setCategorias(c)
    } catch (e) { console.error(e); setCategorias([]) }
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
      const { admin, nombre } = await res.json()
      if (!admin) { router.replace("/admin/login"); return }
      setUserName(nombre || "Admin")
      await load()
      setLoading(false)
    }).catch(console.error)
  }, [router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminCrearCategoria({ nombre: newCat.nombre, slug: newCat.slug, icono: newCat.icono || null })
      toast('Categoría creada')
      setNewCat({ nombre: "", slug: "", icono: "" })
      await load()
    } catch (err) { toast('Error: ' + (err instanceof Error ? err.message : String(err)), 'error') }
  }

  const handleEdit = (c: Categoria) => {
    setEditingId(c.id)
    setEditForm({ nombre: c.nombre, slug: c.slug, icono: c.icono || "" })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      await adminActualizarCategoria(id, { nombre: editForm.nombre, slug: editForm.slug, icono: editForm.icono || null })
      toast('Categoría actualizada')
      setEditingId(null)
      await load()
    } catch (err) { toast('Error: ' + (err instanceof Error ? err.message : String(err)), 'error') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await adminEliminarCategoria(id)
      toast('Categoría eliminada')
      await load()
    } catch (err) { toast('Error: ' + (err instanceof Error ? err.message : String(err)), 'error') }
  }

  const generateSlug = (val: string) => val.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, '-').replace(/(^-|-$)/g, '')

  return (
    <AdminShell userName={userName}>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header"><div className="admin-card-title">Nueva categoría</div></div>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 12, alignItems: "end" }}>
          <div className="admin-form-group" style={{ flex: 1, margin: 0 }}>
            <label>Nombre</label>
            <input type="text" className="admin-form-control" placeholder="Ej: Módulos RF" value={newCat.nombre} onChange={(e) => {
              setNewCat(prev => ({ ...prev, nombre: e.target.value, slug: generateSlug(e.target.value) }))
            }} required />
          </div>
          <div className="admin-form-group" style={{ flex: 1, margin: 0 }}>
            <label>Slug</label>
            <input type="text" className="admin-form-control" placeholder="modulos-rf" value={newCat.slug} onChange={(e) => setNewCat(prev => ({ ...prev, slug: e.target.value }))} required />
          </div>
          <div className="admin-form-group" style={{ flex: 0, margin: 0 }}>
            <label>Icono</label>
            <input type="text" className="admin-form-control" placeholder="📻" value={newCat.icono} onChange={(e) => setNewCat(prev => ({ ...prev, icono: e.target.value }))} style={{ maxWidth: 80 }} />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">Crear</button>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><div className="admin-card-title">Todas las categorías</div></div>
        <div className="table-container">
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Slug</th><th>Descripción</th><th>Acciones</th></tr></thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: 24 }}>No hay categorías</td></tr>
              ) : (
                categorias.map(c => (
                  <tr key={c.id}>
                    {editingId === c.id ? (
                      <>
                        <td>
                          <input type="text" className="admin-form-control" value={editForm.nombre}
                            onChange={(e) => setEditForm(p => ({ ...p, nombre: e.target.value, slug: generateSlug(e.target.value) }))} />
                        </td>
                        <td>
                          <input type="text" className="admin-form-control" value={editForm.slug}
                            onChange={(e) => setEditForm(p => ({ ...p, slug: e.target.value }))} />
                        </td>
                        <td>
                          <input type="text" className="admin-form-control" placeholder="📻" value={editForm.icono}
                            onChange={(e) => setEditForm(p => ({ ...p, icono: e.target.value }))} style={{ maxWidth: 80 }} />
                        </td>
                        <td>
                          <div className="admin-btn-group">
                            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleSaveEdit(c.id)}>💾</button>
                            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditingId(null)}>✕</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{c.icono || ''} {c.nombre}</td>
                        <td className="font-mono text-sm">{c.slug}</td>
                        <td className="text-sm" style={{ color: "var(--admin-text-secondary)" }}>{c.descripcion || '-'}</td>
                        <td>
                          <div className="admin-btn-group">
                            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => handleEdit(c)}>✏️</button>
                            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(c.id)}>🗑️</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}

function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="admin-body">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">Categorías</div>
          <div className="admin-topbar-user"><span>{userName}</span></div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

export default function CategoriasPage() {
  return (
    <AdminToastProvider>
      <CategoriasPageInner />
    </AdminToastProvider>
  )
}
