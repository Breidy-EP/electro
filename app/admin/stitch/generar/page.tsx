'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"


function GenerarInner() {
  const router = useRouter()
  const { show: toast } = useAdminToast()
  const [userName, setUserName] = useState("Cargando...")
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<{ name: string; title?: string }[]>([])
  const [designSystems, setDesignSystems] = useState<{ name: string; displayName?: string }[]>([])

  const [selectedProject, setSelectedProject] = useState("")
  const [selectedDs, setSelectedDs] = useState("")
  const [prompt, setPrompt] = useState("")
  const [deviceType, setDeviceType] = useState("DESKTOP")
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const [variantMode, setVariantMode] = useState(false)
  const [variantCount, setVariantCount] = useState(3)
  const [creativeRange, setCreativeRange] = useState("EXPLORE")
  const [selectedScreenIds, setSelectedScreenIds] = useState("")
  const [screens, setScreens] = useState<{ name: string; displayName?: string }[]>([])

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
    } catch (e) { console.error(e) }
  }

  const fetchScreens = async (projectId: string) => {
    try {
      const res = await fetch("/api/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "stitch_list_screens", args: { projectId } }),
      })
      const data = await res.json()
      if (data.data) setScreens(Array.isArray(data.data) ? data.data : [])
    } catch (e) { console.error(e) }
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

  useEffect(() => {
    if (selectedProject) fetchScreens(selectedProject)
  }, [selectedProject])

  const extractProjectId = (name: string) => name.replace("projects/", "")
  const extractScreenId = (name: string) => name.split("/screens/").pop() || ""

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !prompt.trim()) {
      toast("Completa todos los campos", "warning")
      return
    }
    setGenerating(true)
    setResult(null)
    try {
      if (variantMode) {
        const ids = selectedScreenIds
          ? selectedScreenIds.split(",").map((s) => s.trim())
          : screens.slice(0, 1).map((s) => extractScreenId(s.name))
        if (ids.length === 0) { toast("No hay pantallas seleccionadas", "warning"); setGenerating(false); return }
        const res = await fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: "stitch_generate_variants",
            args: {
              projectId: selectedProject,
              selectedScreenIds: ids,
              prompt,
              variantOptions: {
                variantCount,
                creativeRange,
              },
            },
          }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        toast("Variantes generadas")
        setResult(JSON.stringify(data.data, null, 2))
      } else {
        const args: Record<string, unknown> = {
          projectId: selectedProject,
          prompt,
          deviceType,
        }
        if (selectedDs) args.designSystem = selectedDs
        const res = await fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "stitch_generate_screen_from_text", args }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        toast("Pantalla generada")
        setResult(JSON.stringify(data.data, null, 2))
      }
    } catch (err) {
      toast("Error: " + (err instanceof Error ? err.message : String(err)), "error")
    }
    setGenerating(false)
  }

  if (loading) return <Shell userName={userName}><p style={{ color: "var(--admin-text-secondary)" }}>Cargando...</p></Shell>

  return (
    <Shell userName={userName}>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">
            {variantMode ? "🔄 Generar variantes" : "✨ Generar pantalla desde texto"}
          </div>
          <label className="admin-form-checkbox" style={{ fontSize: 13 }}>
            <input
              type="checkbox"
              checked={variantMode}
              onChange={(e) => setVariantMode(e.target.checked)}
            />
            Modo variantes
          </label>
        </div>

        <form onSubmit={handleGenerate} style={{ padding: 24 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Proyecto</label>
              <select
                className="admin-form-control"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {projects.map((p) => (
                  <option key={p.name} value={extractProjectId(p.name)}>
                    {p.title || extractProjectId(p.name)}
                  </option>
                ))}
              </select>
            </div>
            {!variantMode && (
              <div className="admin-form-group">
                <label>Sistema de diseño (opcional)</label>
                <select
                  className="admin-form-control"
                  value={selectedDs}
                  onChange={(e) => setSelectedDs(e.target.value)}
                >
                  <option value="">Ninguno</option>
                  {designSystems.map((ds) => (
                    <option key={ds.name} value={ds.name}>
                      {ds.displayName || ds.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {!variantMode && (
              <div className="admin-form-group">
                <label>Dispositivo</label>
                <select
                  className="admin-form-control"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                >
                  <option value="DESKTOP">Desktop</option>
                  <option value="MOBILE">Mobile</option>
                  <option value="TABLET">Tablet</option>
                </select>
              </div>
            )}
          </div>

          {variantMode && (
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Cantidad de variantes</label>
                <input
                  type="number"
                  className="admin-form-control"
                  min={1}
                  max={5}
                  value={variantCount}
                  onChange={(e) => setVariantCount(Number(e.target.value))}
                />
              </div>
              <div className="admin-form-group">
                <label>Rango creativo</label>
                <select
                  className="admin-form-control"
                  value={creativeRange}
                  onChange={(e) => setCreativeRange(e.target.value)}
                >
                  <option value="REFINE">Refinar (sutiles)</option>
                  <option value="EXPLORE">Explorar (balanceado)</option>
                  <option value="REIMAGINE">Reimaginar (radical)</option>
                </select>
              </div>
            </div>
          )}

          {variantMode && screens.length > 0 && (
            <div className="admin-form-group">
              <label>IDs de pantalla (separados por coma, o vacío para usar la primera)</label>
              <input
                type="text"
                className="admin-form-control"
                placeholder={screens.slice(0, 3).map((s) => extractScreenId(s.name)).join(", ")}
                value={selectedScreenIds}
                onChange={(e) => setSelectedScreenIds(e.target.value)}
              />
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {screens.map((s) => (
                  <span
                    key={s.name}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "var(--admin-surface-2)",
                      color: "var(--admin-text-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {extractScreenId(s.name)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="admin-form-group">
            <label>{variantMode ? "Describe las variaciones" : "Describe la pantalla a generar"}</label>
            <textarea
              className="admin-form-control"
              placeholder={
                variantMode
                  ? "Ej: Prueba diferentes paletas de color y disposiciones del layout..."
                  : "Ej: Una página de aterrizaje con hero image, sección de características, y formulario de contacto..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              style={{ minHeight: 100 }}
            />
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" disabled={generating}>
            {generating ? "Generando..." : variantMode ? "Generar variantes" : "Generar pantalla"}
          </button>
        </form>
      </div>

      {result && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Resultado</div>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setResult(null)}>Cerrar</button>
          </div>
          <div style={{ padding: 24 }}>
            <pre style={{
              background: "var(--admin-bg)",
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              overflow: "auto",
              maxHeight: 400,
              color: "var(--admin-text)",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>{result}</pre>
          </div>
        </div>
      )}
    </Shell>
  )
}

function Shell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="admin-body">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">Generar con IA</div>
          <div className="admin-topbar-user"><span>{userName}</span></div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

export default function GenerarPage() {
  return (
    <AdminToastProvider>
      <GenerarInner />
    </AdminToastProvider>
  )
}
