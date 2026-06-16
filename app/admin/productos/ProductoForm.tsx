'use client'

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"
import { supabase } from "@/lib/supabase"
import { adminObtenerProductos, adminObtenerCategorias } from "@/lib/supabase-queries"
import { uploadToImageKit } from "@/lib/imagekit"
import Link from "next/link"

interface ProductoFormProps {
  id?: string
}

function ProductoFormInner({ id }: ProductoFormProps) {
  const router = useRouter()
  const { show: toast } = useAdminToast()
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([])
  const [form, setForm] = useState({
    sku: "",
    nombre: "", descripcion: "", categoria_id: "",
    precio: "", precio_original: "", stock: "0", stock_minimo: "5",
    imagen: "",
  })
  const [uploading, setUploading] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/admin/login"); return }
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      const { admin } = await res.json()
      if (!admin) { router.replace("/admin/login"); return }
      setToken(session.access_token)

      const cats = await adminObtenerCategorias()
      setCategorias(cats)

      if (id) {
        const prods = await adminObtenerProductos()
        const p = prods.find(x => x.id === id)
        if (p) {
          setForm({
            sku: p.sku || "",
            nombre: p.nombre || "", descripcion: p.descripcion || "",
            categoria_id: p.categoria_id || "",
            precio: String(p.precio || ""),
            precio_original: String(p.precio_original || ""),
            stock: String(p.stock ?? 0), stock_minimo: String(p.stock_minimo ?? 5),
            imagen: (p as unknown as { imagenes?: { url?: string }[] }).imagenes?.[0]?.url || "",
          })
        }
      } else {
        if (!form.sku) setForm(prev => ({ ...prev, sku: `PROD-${Date.now()}` }))
      }
    }).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const generateSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, '-').replace(/(^-|-$)/g, '')

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadToImageKit(file, token)
      if (result.url) {
        setForm(prev => ({ ...prev, imagen: result.url }))
        toast("Imagen subida")
      } else {
        toast("Error al subir imagen: " + JSON.stringify(result), "error")
      }
    } catch {
      toast("Error al subir imagen", "error")
    }
    setUploading(false)
  }, [token, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = generateSlug(form.nombre)
    const data = {
      sku: form.sku, nombre: form.nombre, slug,
      descripcion: form.descripcion,
      categoria_id: form.categoria_id,
      precio: parseFloat(form.precio),
      precio_original: form.precio_original ? parseFloat(form.precio_original) : null,
      stock: parseInt(form.stock) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 5,
      visible: true, destacado: false,
      imagen: form.imagen || null,
    }
    try {
      const res = await fetch("/api/admin/productos", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id, ...data } : data),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Error en operación")
      }
      toast(id ? "Producto actualizado" : "Producto creado")
      setTimeout(() => router.push("/admin/productos"), 800)
    } catch (err) {
      toast("Error: " + (err instanceof Error ? err.message : String(err)), "error")
    }
  }

  return (
    <div className="admin-body">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">{id ? "Editar producto" : "Nuevo producto"}</div>
          <div className="admin-topbar-user"><span>Admin</span></div>
        </div>
        <div className="admin-content">
          <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>SKU</label>
                <input type="text" name="sku" className="admin-form-control" placeholder="PROD-1234" value={form.sku} onChange={handleChange} />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Categoría *</label>
                <select name="categoria_id" className="admin-form-control" value={form.categoria_id} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label>Nombre *</label>
              <input type="text" name="nombre" className="admin-form-control" placeholder="Ej: Arduino Uno R3" value={form.nombre} onChange={handleChange} required />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Precio *</label>
                <input type="number" name="precio" className="admin-form-control" step="0.01" min="0" placeholder="0.00" value={form.precio} onChange={handleChange} required />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Precio original (descuento)</label>
                <input type="number" name="precio_original" className="admin-form-control" step="0.01" min="0" placeholder="0.00" value={form.precio_original} onChange={handleChange} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Stock *</label>
                <input type="number" name="stock" className="admin-form-control" min="0" placeholder="0" value={form.stock} onChange={handleChange} required />
              </div>
              <div className="admin-form-group" style={{ flex: 1 }}>
                <label>Stock mínimo</label>
                <input type="number" name="stock_minimo" className="admin-form-control" min="0" placeholder="5" value={form.stock_minimo} onChange={handleChange} />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Descripción</label>
              <textarea name="descripcion" className="admin-form-control" placeholder="Descripción del producto" value={form.descripcion} onChange={handleChange} rows={4} />
            </div>

            <div className="admin-form-group">
              <label>Imagen</label>
              <div className="admin-upload-area">
                <input type="file" accept="image/*" id="img-upload" style={{ display: "none" }}
                  onChange={handleFileUpload} disabled={uploading} />
                <label htmlFor="img-upload" className="admin-upload-btn">
                  {uploading ? "Subiendo..." : "Subir imagen"}
                </label>
                <input type="url" name="imagen" className="admin-form-control"
                  placeholder="O pegar URL..." value={form.imagen} onChange={handleChange} />
              </div>
              {form.imagen && (
                <div style={{ marginTop: 8, position: "relative", display: "inline-block" }}>
                  <img src={form.imagen} alt="preview" className="admin-upload-preview" />
                  <button type="button" className="admin-btn admin-btn-danger admin-btn-sm"
                    style={{ position: "absolute", top: 4, right: 4 }}
                    onClick={() => setForm(prev => ({ ...prev, imagen: "" }))}>✕</button>
                </div>
              )}
            </div>

            <div className="admin-btn-group" style={{ marginTop: 24 }}>
              <button type="submit" className="admin-btn admin-btn-primary">{id ? "Guardar cambios" : "Crear producto"}</button>
              <Link href="/admin/productos" className="admin-btn admin-btn-ghost">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ProductoForm(props: ProductoFormProps) {
  return (
    <AdminToastProvider>
      <ProductoFormInner {...props} />
    </AdminToastProvider>
  )
}
