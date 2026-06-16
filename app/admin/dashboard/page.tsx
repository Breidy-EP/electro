'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { supabase } from "@/lib/supabase"
import { adminObtenerEstadisticas, adminObtenerPedidos } from "@/lib/supabase-queries"
import type { Orden } from "@/lib/supabase-queries"

interface Stats {
  totalProductos: number
  totalPedidos: number
  totalClientes: number
  pedidosPendientes: number
}

interface StockItem {
  sku: string
  nombre: string
  stock: number
  stock_minimo: number
  precio: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [stockBajo, setStockBajo] = useState<StockItem[]>([])
  const [orders, setOrders] = useState<Orden[]>([])
  const [userName, setUserName] = useState("Cargando...")
  const [userRole, setUserRole] = useState("ADMIN")
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/pedidos")
      if (!res.ok) throw new Error("Error")
      const p = await res.json()
      setOrders(p.slice(0, 5))
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/admin/login"); return }
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      const { admin, nombre } = await res.json()
      if (!admin) { router.replace("/admin/login"); return }
      setUserName(nombre || "Admin")
      try {
        const [s, bajo] = await Promise.all([
          adminObtenerEstadisticas(),
          import("@/lib/supabase-queries").then(m => m.adminProductosStockBajo()),
        ])
        setStats(s)
        setStockBajo(bajo)
        await fetchOrders()
      } catch (e) { console.error(e) }
      setLoading(false)
    }).catch(console.error)
  }, [router])

  const estadoClass: Record<string, string> = {
    pendiente: "warning", confirmada: "info", procesando: "info",
    enviada: "secondary", entregada: "success", cancelada: "danger",
  }
  const statusLabel: Record<string, string> = {
    pendiente: "PENDING", confirmada: "CONFIRMED", procesando: "PROCESSING",
    enviada: "SHIPPED", entregada: "DELIVERED", cancelada: "CANCELLED",
  }
  const statusPulse: Record<string, boolean> = {
    enviada: true, entregada: false, pendiente: false,
    confirmada: false, procesando: false, cancelada: false,
  }

  if (loading) {
    return (
      <div className="admin-body">
        <AdminSidebar />
        <div className="admin-main">
          <div className="admin-content">
            <p style={{ color: "var(--admin-text-secondary)" }}>Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-body">
      <AdminSidebar />
      <div className="admin-main">
        <header style={{
          position: "sticky", top: 0, zIndex: 20,
          background: "rgba(16, 19, 26, 0.6)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(66, 71, 84, 0.2)",
          padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                color: "var(--admin-text-secondary)", fontSize: 18,
              }}>🔍</span>
              <input
                type="text"
                placeholder="Scan SKU or Search Inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", background: "var(--admin-surface-lowest)",
                  border: "1px solid rgba(66, 71, 84, 0.2)", borderRadius: 8,
                  padding: "8px 12px 8px 40px", fontSize: 14, color: "var(--admin-text)",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--admin-secondary)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(66, 71, 84, 0.2)"}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{
              background: "none", border: "none", color: "var(--admin-text-secondary)",
              cursor: "pointer", position: "relative", fontSize: 20,
            }}>
              🔔
              <span style={{
                position: "absolute", top: 0, right: 0, width: 8, height: 8,
                background: "var(--admin-danger)", borderRadius: "50%",
              }} />
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              paddingLeft: 16, borderLeft: "1px solid rgba(66, 71, 84, 0.2)",
            }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1.2 }}>
                  {userName.toUpperCase()}
                </p>
                <p style={{ fontSize: 10, color: "var(--admin-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {userRole}
                </p>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--admin-primary-solid), var(--admin-secondary))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: "#fff",
                border: "2px solid rgba(93, 230, 255, 0.3)",
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: "32px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: "var(--admin-primary)", letterSpacing: "-0.01em" }}>
              Technical Workspace
            </h1>
            <p style={{ color: "var(--admin-text-secondary)", fontStyle: "italic", fontSize: 14 }}>
              Operational Status: Nominal | Syncing with industrial node #842...
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon" style={{ color: "var(--admin-secondary)" }}>💰</span>
                <span className="stat-trend" style={{ color: "var(--admin-secondary)" }}>+14.2% ↑</span>
              </div>
              <p className="label">Total Revenue</p>
              <p className="value" style={{ color: "var(--admin-text)" }}>
                {`Bs ${((stats?.totalPedidos || 0) * 1250).toLocaleString()}.00`}
              </p>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: "75%", background: "var(--admin-secondary)" }} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon" style={{ color: "var(--admin-primary)" }}>📦</span>
                <span className="stat-trend" style={{ color: "var(--admin-primary)" }}>
                  {stats?.totalPedidos || 0} Total
                </span>
              </div>
              <p className="label">Processing Units</p>
              <p className="value" style={{ color: "var(--admin-text)" }}>
                {(stats?.totalProductos || 0).toLocaleString()}
                <span className="value-sub"> Items</span>
              </p>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: "50%", background: "var(--admin-primary)" }} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon" style={{ color: "var(--admin-danger)" }}>⚠️</span>
                <span className="stat-trend" style={{ color: "var(--admin-danger)" }}>CRITICAL</span>
              </div>
              <p className="label">Restock Alerts</p>
              <p className="value" style={{ color: "var(--admin-danger)" }}>
                {stockBajo.length}
                <span className="value-sub"> SKUs</span>
              </p>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{
                  width: `${Math.min(stockBajo.length * 8, 100)}%`,
                  background: "var(--admin-danger)",
                }} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-icon" style={{ color: "var(--admin-primary)" }}>👥</span>
                <span className="stat-trend" style={{ color: "var(--admin-primary)" }}>New Nodes</span>
              </div>
              <p className="label">Client Expansion</p>
              <p className="value" style={{ color: "var(--admin-text)" }}>
                {stats?.totalClientes || 0}
                <span className="value-sub"> Accounts</span>
              </p>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: "65%", background: "#8392a6" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, marginBottom: 32 }}>
            <div className="admin-card">
              <div style={{
                padding: "20px 24px", borderBottom: "1px solid rgba(66, 71, 84, 0.2)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--admin-primary)" }}>
                  Recent Command Log
                </h2>
                <a href="/admin/pedidos" style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                  color: "var(--admin-secondary)", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  View Full Registry →
                </a>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Client</th>
                      <th>Contact</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--admin-text-secondary)" }}>
                        No orders yet
                      </td></tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} style={{ cursor: "pointer" }}>
                          <td className="font-mono" style={{ fontSize: 13, fontWeight: 500 }}>
                            #{o.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td style={{ fontSize: 14 }}>{o.cliente?.nombre_completo || 'Anonymous'}</td>
                          <td style={{ fontSize: 12, color: "var(--admin-text-secondary)" }}>
                            {o.cliente?.email || '-'}{(o.cliente as unknown as { telefono?: string })?.telefono ? ` | 📞${(o.cliente as unknown as { telefono?: string }).telefono}` : ''}
                          </td>
                          <td style={{ fontSize: 14, color: "var(--admin-text-secondary)" }}>
                            {new Date(o.creado_en).toLocaleDateString()}
                          </td>
                          <td>
                            <span className={`admin-status-badge ${estadoClass[o.estado] || "info"}`}>
                              <span className={`status-dot ${statusPulse[o.estado] ? "pulse-cyan" : ""}`}
                                style={{ background: o.estado === "cancelada" ? "var(--admin-danger)" : o.estado === "enviada" ? "var(--admin-secondary)" : o.estado === "pendiente" ? "var(--admin-warning)" : "var(--admin-primary)" }}
                              />
                              {statusLabel[o.estado] || o.estado.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "var(--admin-secondary)" }}>
                            {`Bs ${o.total.toFixed(2)}`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card">
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(66, 71, 84, 0.2)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--admin-primary)" }}>
                  Inventory Health
                </h2>
              </div>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                {stockBajo.length === 0 ? (
                  <p style={{ color: "var(--admin-success)", fontSize: 14 }}>
                    ✅ All products have sufficient stock
                  </p>
                ) : (
                  stockBajo.slice(0, 5).map((p) => {
                    const pct = Math.min((p.stock / Math.max(p.stock_minimo, 1)) * 100, 100)
                    const isCritical = p.stock <= 0
                    const isLow = p.stock <= p.stock_minimo
                    return (
                      <div key={p.sku} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span style={{ fontWeight: 500 }}>{p.nombre}</span>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: isCritical ? "var(--admin-danger)" : isLow ? "var(--admin-primary)" : "var(--admin-secondary)",
                          }}>
                            {p.stock} units left
                          </span>
                        </div>
                        <div style={{ height: 8, background: "var(--admin-surface-highest)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 999,
                            background: isCritical ? "var(--admin-danger)" : isLow ? "var(--admin-primary)" : "var(--admin-secondary)",
                            width: `${Math.max(pct, 4)}%`,
                            transition: "width 1.5s ease",
                          }} />
                        </div>
                        <p style={{ fontSize: 11, color: "var(--admin-text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                          {isCritical ? "Critical restocking required." : isLow ? "Low stock approaching threshold." : "Inventory levels nominal."}
                        </p>
                      </div>
                    )
                  })
                )}
                <div style={{
                  marginTop: 8, padding: 16, background: "var(--admin-surface-highest)",
                  borderRadius: 8, border: "1px solid rgba(66, 71, 84, 0.2)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ padding: 6, background: "rgba(93, 230, 255, 0.1)", borderRadius: 8, fontSize: 20 }}>
                    📊
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>Auto-Procurement</p>
                    <p style={{ fontSize: 11, color: "var(--admin-text-secondary)" }}>
                      Enabled for critical components.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", inset: 0, opacity: 0.3,
              background: "linear-gradient(135deg, #10131a 40%, transparent)",
              zIndex: 0,
            }} />
            <div style={{ position: "relative", zIndex: 1, padding: 40, display: "flex", gap: 32, alignItems: "center" }}>
              <div style={{ flex: 3 }}>
                <span style={{
                  background: "var(--admin-secondary)", color: "#00363e",
                  padding: "2px 12px", borderRadius: 4,
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                  display: "inline-block", marginBottom: 12,
                }}>
                  SUPPLY CHAIN UPDATE
                </span>
                <h3 style={{
                  fontSize: 32, fontWeight: 700, color: "#fff",
                  letterSpacing: "-0.02em", marginBottom: 12,
                }}>
                  Quantum Processors arriving in Q3.
                </h3>
                <p style={{ color: "var(--admin-text-secondary)", fontSize: 18, maxWidth: 560 }}>
                  Secure your pre-orders for the next-generation ELECTRO_CORE compute modules.
                  Optimized for extreme precision industrial automation.
                </p>
                <button style={{
                  marginTop: 16, background: "var(--admin-secondary)", color: "#00363e",
                  border: "none", padding: "12px 32px", borderRadius: 8,
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                  cursor: "pointer", transition: "box-shadow 0.2s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(93, 230, 255, 0.4)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                  Manage Pre-Orders
                </button>
              </div>
              <div className="admin-card" style={{
                flex: 1, padding: 32, textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: "4px solid rgba(93, 230, 255, 0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <span style={{ fontSize: 36 }}>🔒</span>
                  <div style={{
                    position: "absolute", inset: 0,
                    border: "4px solid var(--admin-secondary)",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }} />
                </div>
                <h4 style={{ fontSize: 20, fontWeight: 600, color: "var(--admin-primary)" }}>
                  System Integrity
                </h4>
                <p style={{ fontSize: 14, color: "var(--admin-text-secondary)" }}>
                  Global encryption protocols active across all nodes.
                </p>
                <span style={{ fontSize: 11, color: "var(--admin-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                  VERIFIED 100%
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer style={{
          padding: "32px 48px", textAlign: "center",
          background: "var(--admin-surface-lowest)",
          borderTop: "1px solid rgba(66, 71, 84, 0.2)",
          marginTop: "auto",
        }}>
          <p style={{ fontSize: 14, color: "var(--admin-text-secondary)" }}>
            © 2026 ELECTRO FNI — ElectroIngeniería FNI
          </p>
        </footer>
      </div>
    </div>
  )
}
