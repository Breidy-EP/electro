'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"


interface StitchProject {
  name: string
  title?: string
  displayName?: string
}

interface StitchDesignSystem {
  name: string
  displayName?: string
}

function DashboardInner() {
  const router = useRouter()
  const { show: toast } = useAdminToast()
  const [userName, setUserName] = useState("Cargando...")
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<StitchProject[]>([])
  const [designSystems, setDesignSystems] = useState<StitchDesignSystem[]>([])
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [showNewForm, setShowNewForm] = useState(false)

  const fetchData = async () => {
    try {
      const [projRes, dsRes] = await Promise.all([
        fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "stitch_list_projects", args: {} }),
        }),
        fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "stitch_list_design_systems", args: {} }),
        }),
      ])
      const projData = await projRes.json()
      const dsData = await dsRes.json()
      if (projData.data) setProjects(Array.isArray(projData.data) ? projData.data : [])
      if (dsData.data) setDesignSystems(Array.isArray(dsData.data) ? dsData.data : [])
    } catch (e) {
      console.error(e)
    }
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
      await fetchData()
      setLoading(false)
    }).catch(console.error)
  }, [router])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "stitch_create_project", args: { title: newProjectTitle } }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast("Proyecto creado")
      setNewProjectTitle("")
      setShowNewForm(false)
      await fetchData()
    } catch (err) {
      toast("Error: " + (err instanceof Error ? err.message : String(err)), "error")
    }
  }

  const extractId = (name: string) => name.replace("projects/", "")
  const extractDsId = (name: string) => name.replace("assets/", "")

  if (loading) return <Shell userName={userName}><p style={{ color: "var(--admin-text-secondary)" }}>Cargando...</p></Shell>

  return (
    <Shell userName={userName}>
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="label">Proyectos Stitch</div>
          <div className="value">{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Sistemas de diseño</div>
          <div className="value">{designSystems.length}</div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">🎨 Proyectos Stitch</div>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowNewForm(!showNewForm)}>
            {showNewForm ? "Cancelar" : "+ Nuevo proyecto"}
          </button>
        </div>

        {showNewForm && (
          <form onSubmit={handleCreateProject} style={{ padding: "0 24px 24px", display: "flex", gap: 12, alignItems: "end" }}>
            <div className="admin-form-group" style={{ flex: 1, margin: 0 }}>
              <label>Título del proyecto</label>
              <input
                type="text"
                className="admin-form-control"
                placeholder="Ej: Landing Page"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">Crear</button>
          </form>
        )}

        <div className="table-container">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Título</th><th>Acciones</th></tr></thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "var(--admin-text-secondary)" }}>
                  No hay proyectos. Crea uno para empezar.
                </td></tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.name}>
                    <td className="font-mono text-sm">{extractId(p.name)}</td>
                    <td>{p.title || p.displayName || "Sin título"}</td>
                    <td>
                      <Link href={`/admin/stitch/proyectos/proyecto?id=${extractId(p.name)}`} className="admin-btn admin-btn-ghost admin-btn-sm">
                        Ver proyecto →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">🎯 Sistemas de diseño</div>
          <Link href="/admin/stitch/diseno" className="admin-btn admin-btn-ghost admin-btn-sm">Gestionar</Link>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th></tr></thead>
            <tbody>
              {designSystems.length === 0 ? (
                <tr><td colSpan={2} style={{ textAlign: "center", padding: 24, color: "var(--admin-text-secondary)" }}>
                  No hay sistemas de diseño.
                </td></tr>
              ) : (
                designSystems.map((ds) => (
                  <tr key={ds.name}>
                    <td className="font-mono text-sm">{extractDsId(ds.name)}</td>
                    <td>{ds.displayName || "Sin nombre"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="admin-body">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">Stitch</div>
          <div className="admin-topbar-user"><span>{userName}</span></div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

export default function StitchDashboardPage() {
  return (
    <AdminToastProvider>
      <DashboardInner />
    </AdminToastProvider>
  )
}
