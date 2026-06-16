'use client'

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"


interface Screen {
  name: string
  displayName?: string
  imageUri?: string
}

function ProyectoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("id")
  const { show: toast } = useAdminToast()
  const [userName, setUserName] = useState("Cargando...")
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<{ title?: string; displayName?: string } | null>(null)
  const [screens, setScreens] = useState<Screen[]>([])
  const [generatePrompt, setGeneratePrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editPrompt, setEditPrompt] = useState("")
  const [selectedScreens, setSelectedScreens] = useState<Set<string>>(new Set())

  const fetchProjectData = async () => {
    if (!projectId) return
    try {
      const [projRes, screensRes] = await Promise.all([
        fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "stitch_get_project", args: { name: `projects/${projectId}` } }),
        }),
        fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "stitch_list_screens", args: { projectId } }),
        }),
      ])
      const projData = await projRes.json()
      const screensData = await screensRes.json()
      if (projData.data) setProject(projData.data)
      if (screensData.data) {
        setScreens(Array.isArray(screensData.data) ? screensData.data : [])
      }
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
      if (projectId) await fetchProjectData()
      setLoading(false)
    }).catch(console.error)
  }, [router, projectId])

  const handleGenerateScreen = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !generatePrompt.trim()) return
    setGenerating(true)
    try {
      const res = await fetch("/api/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "stitch_generate_screen_from_text",
          args: { projectId, prompt: generatePrompt, deviceType: "DESKTOP" },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast("Pantalla generada exitosamente")
      setGeneratePrompt("")
      await fetchProjectData()
    } catch (err) {
      toast("Error: " + (err instanceof Error ? err.message : String(err)), "error")
    }
    setGenerating(false)
  }

  const handleEditScreens = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !editPrompt.trim() || selectedScreens.size === 0) return
    try {
      const res = await fetch("/api/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "stitch_edit_screens",
          args: {
            projectId,
            selectedScreenIds: Array.from(selectedScreens),
            prompt: editPrompt,
            deviceType: "DESKTOP",
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast("Pantallas editadas")
      setEditPrompt("")
      setSelectedScreens(new Set())
      setEditMode(false)
      await fetchProjectData()
    } catch (err) {
      toast("Error: " + (err instanceof Error ? err.message : String(err)), "error")
    }
  }

  const toggleScreen = (id: string) => {
    setSelectedScreens((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const extractScreenId = (name: string) => {
    const parts = name.split("/screens/")
    return parts[parts.length - 1]
  }

  if (!projectId) {
    return <Shell userName={userName}><p style={{ color: "var(--admin-text-secondary)" }}>ID de proyecto no especificado.</p></Shell>
  }

  if (loading) return <Shell userName={userName}><p style={{ color: "var(--admin-text-secondary)" }}>Cargando...</p></Shell>

  return (
    <Shell userName={userName}>
      <Link href="/admin/stitch/dashboard" style={{ color: "var(--admin-primary)", fontSize: 14, marginBottom: 16, display: "inline-block" }}>
        ← Volver a proyectos
      </Link>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">📐 {project?.title || project?.displayName || "Proyecto"}</div>
          <span style={{ fontSize: 12, color: "var(--admin-text-secondary)", fontFamily: "monospace" }}>{projectId}</span>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">✨ Generar nueva pantalla</div>
        </div>
        <form onSubmit={handleGenerateScreen} style={{ padding: "0 24px 24px" }}>
          <div className="admin-form-group">
            <label>Describe la pantalla que quieres generar</label>
            <textarea
              className="admin-form-control"
              placeholder="Ej: Una página de inicio con hero, features y footer..."
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              required
              style={{ minHeight: 80 }}
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={generating}>
            {generating ? "Generando..." : "Generar pantalla"}
          </button>
        </form>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">🖥️ Pantallas ({screens.length})</div>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancelar edición" : "Editar pantallas"}
          </button>
        </div>

        {editMode && (
          <form onSubmit={handleEditScreens} style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--admin-border)", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--admin-text-secondary)", marginBottom: 12 }}>
              Selecciona las pantallas a editar y describe los cambios.
            </p>
            <div className="admin-form-group">
              <label>Descripción de los cambios</label>
              <textarea
                className="admin-form-control"
                placeholder="Ej: Cambiar el color del botón a azul y actualizar el texto del hero..."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                required
                style={{ minHeight: 80 }}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={selectedScreens.size === 0}>
              Aplicar cambios ({selectedScreens.size} seleccionadas)
            </button>
          </form>
        )}

        <div className="table-container">
          <table className="admin-table">
            <thead><tr>
              {editMode && <th style={{ width: 40 }}></th>}
              <th>ID</th>
              <th>Nombre</th>
            </tr></thead>
            <tbody>
              {screens.length === 0 ? (
                <tr><td colSpan={editMode ? 3 : 2} style={{ textAlign: "center", padding: 24, color: "var(--admin-text-secondary)" }}>
                  No hay pantallas en este proyecto.
                </td></tr>
              ) : (
                screens.map((s) => {
                  const screenId = extractScreenId(s.name)
                  return (
                    <tr key={s.name}>
                      {editMode && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedScreens.has(screenId)}
                            onChange={() => toggleScreen(screenId)}
                            style={{ accentColor: "var(--admin-primary)" }}
                          />
                        </td>
                      )}
                      <td className="font-mono text-sm">{screenId}</td>
                      <td>{s.displayName || "Sin nombre"}</td>
                    </tr>
                  )
                })
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
          <div className="admin-topbar-title">Proyecto Stitch</div>
          <div className="admin-topbar-user"><span>{userName}</span></div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

export default function ProyectoPage() {
  return (
    <Suspense fallback={<div className="admin-body" style={{ padding: 32, color: "var(--admin-text-secondary)" }}>Cargando...</div>}>
      <AdminToastProvider>
        <ProyectoInner />
      </AdminToastProvider>
    </Suspense>
  )
}
