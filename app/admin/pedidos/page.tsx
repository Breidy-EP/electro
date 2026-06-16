'use client'

import { useEffect, useState, Fragment } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"
import type { Orden, DetalleOrden } from "@/lib/supabase-queries"

const estados = ["pendiente", "confirmada", "procesando", "enviada", "entregada", "cancelada"]
const estadoClass: Record<string, string> = {
  pendiente: "warning", confirmada: "info", procesando: "info",
  enviada: "success", entregada: "success", cancelada: "danger",
}
const metodoLabel: Record<string, string> = { estandar: "🏪 Recogida Local", envio: "🚚 Envío Express" }

function PedidosPageInner() {
  const router = useRouter()
  const { show: toast } = useAdminToast()
  const [pedidos, setPedidos] = useState<Orden[]>([])
  const [userName, setUserName] = useState("Cargando...")
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [expandido, setExpandido] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/admin/pedidos")
      if (!res.ok) throw new Error("Error al cargar pedidos")
      const data = await res.json()
      setPedidos(data)
    } catch { setPedidos([]) }
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

  const handleEstadoChange = async (id: string, estado: string) => {
    try {
      const res = await fetch("/api/admin/pedidos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Error")
      toast("Estado actualizado")
      await load()
    } catch (e) { toast("Error: " + (e instanceof Error ? e.message : String(e)), "error") }
  }

  const filtered = pedidos.filter(o => {
    if (filtroEstado && o.estado !== filtroEstado) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return o.id.toLowerCase().includes(q) || o.cliente?.nombre_completo?.toLowerCase().includes(q) || false
    }
    return true
  })

  const pendientes = pedidos.filter(o => o.estado === "pendiente").length

  if (loading) return <AdminShell userName={userName}><p style={{ color: "var(--admin-text-secondary)" }}>Cargando...</p></AdminShell>

  return (
    <AdminShell userName={userName}>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">Gestión de pedidos</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="text" className="admin-form-control" placeholder="Buscar por ID o cliente..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ width: 220 }} />
          </div>
        </div>
        <div style={{ padding: "0 24px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={`admin-btn admin-btn-sm ${!filtroEstado ? "admin-btn-primary" : "admin-btn-ghost"}`}
            onClick={() => setFiltroEstado("")}>Todos ({pedidos.length})</button>
          {estados.map(e => (
            <button key={e}
              className={`admin-btn admin-btn-sm ${filtroEstado === e ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => setFiltroEstado(e)}>
              {e} {e === "pendiente" ? `(${pendientes})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="table-container">
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", padding: 48, color: "var(--admin-text-secondary)" }}>
              {pedidos.length === 0 ? "No hay pedidos registrados" : "No se encontraron pedidos"}
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <Fragment key={o.id}>
                    <tr style={{ cursor: "pointer" }} onClick={() => setExpandido(expandido === o.id ? null : o.id)}>
                      <td style={{ textAlign: "center" }}>{expandido === o.id ? "▾" : "▸"}</td>
                      <td className="font-mono" style={{ fontSize: 12 }}>{o.id.slice(0, 8)}</td>
                      <td style={{ fontWeight: 500 }}>{o.cliente?.nombre_completo || "Anónimo"}</td>
                      <td style={{ fontSize: 12, color: "var(--admin-text-secondary)" }}>{o.cliente?.email || "-"}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--admin-primary)" }}>{`Bs ${o.total.toFixed(2)}`}</td>
                      <td><span className={`badge-pill ${estadoClass[o.estado] || "neutral"}`}>{o.estado}</span></td>
                      <td style={{ fontSize: 12, color: "var(--admin-text-secondary)" }}>{new Date(o.creado_en).toLocaleDateString("es-BO")}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <select className="admin-form-control" style={{ width: "auto", padding: "4px 8px", fontSize: 12 }}
                          value={o.estado} onChange={e => handleEstadoChange(o.id, e.target.value)}>
                          {estados.map(est => <option key={est} value={est}>{est}</option>)}
                        </select>
                      </td>
                    </tr>
                    {expandido === o.id && (
                      <tr>
                        <td colSpan={8} style={{ padding: "0 24px 20px", background: "var(--admin-surface)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                            <div>
                              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-secondary)", marginBottom: 8 }}>Información del cliente</p>
                              <p style={{ fontSize: 13 }}>{o.cliente?.nombre_completo || "Anónimo"}</p>
                              <p style={{ fontSize: 12, color: "var(--admin-text-secondary)" }}>{o.cliente?.email || "-"}</p>
                              {(o.cliente as unknown as { telefono?: string })?.telefono && <p style={{ fontSize: 12, color: "var(--admin-text-secondary)" }}>📞 {(o.cliente as unknown as { telefono?: string }).telefono}</p>}
                            </div>
                            <div>
                              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-secondary)", marginBottom: 8 }}>Entrega</p>
                              <p style={{ fontSize: 13 }}>{metodoLabel[o.metodo_envio] || o.metodo_envio}</p>
                              {o.notas && <p style={{ fontSize: 12, color: "var(--admin-text-secondary)", fontStyle: "italic", marginTop: 4 }}>Notas: {o.notas}</p>}
                            </div>
                          </div>
                          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-secondary)", marginBottom: 8 }}>Artículos</p>
                          <table className="admin-table" style={{ fontSize: 13 }}>
                            <thead>
                              <tr>
                                <th>Producto</th>
                                <th>SKU</th>
                                <th style={{ textAlign: "right" }}>Precio</th>
                                <th style={{ textAlign: "right" }}>Cant.</th>
                                <th style={{ textAlign: "right" }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(o.items as DetalleOrden[]).map((item) => (
                                <tr key={item.id}>
                                  <td>{item.producto_nombre}</td>
                                  <td className="font-mono" style={{ fontSize: 12 }}>{item.producto_sku}</td>
                                  <td style={{ textAlign: "right" }}>{`Bs ${item.precio_unitario.toFixed(2)}`}</td>
                                  <td style={{ textAlign: "right" }}>{item.cantidad}</td>
                                  <td style={{ textAlign: "right", fontWeight: 600 }}>{`Bs ${item.subtotal.toFixed(2)}`}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={4} style={{ textAlign: "right", fontSize: 12, color: "var(--admin-text-secondary)" }}>Subtotal</td>
                                <td style={{ textAlign: "right", fontSize: 12 }}>{`Bs ${o.subtotal.toFixed(2)}`}</td>
                              </tr>
                              <tr>
                                <td colSpan={4} style={{ textAlign: "right", fontSize: 12, color: "var(--admin-text-secondary)" }}>Impuesto (21%)</td>
                                <td style={{ textAlign: "right", fontSize: 12 }}>{`Bs ${o.impuesto.toFixed(2)}`}</td>
                              </tr>
                              <tr>
                                <td colSpan={4} style={{ textAlign: "right", fontSize: 14, fontWeight: 700 }}>Total</td>
                                <td style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: "var(--admin-primary)" }}>{`Bs ${o.total.toFixed(2)}`}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
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
          <div className="admin-topbar-title">Pedidos</div>
          <div className="admin-topbar-user"><span>{userName}</span></div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

export default function PedidosPage() {
  return (
    <AdminToastProvider>
      <PedidosPageInner />
    </AdminToastProvider>
  )
}
