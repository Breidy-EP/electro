'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import { AdminToastProvider, useAdminToast } from "@/components/admin/AdminToast"


interface DesignSystem {
  name: string
  displayName?: string
  theme?: {
    colorMode?: string
    colorVariant?: string
    customColor?: string
    headlineFont?: string
    bodyFont?: string
    roundness?: string
    designMd?: string
    overridePrimaryColor?: string
    overrideNeutralColor?: string
  }
}

const FONTS = [
  "INTER", "MANROPE", "DM_SANS", "IBM_PLEX_SANS", "SORA",
  "GEIST", "RUBIK", "NUNITO_SANS", "SOURCE_SANS_3", "WORK_SANS",
  "SPACE_GROTESK", "SYNE", "RALEWAY", "MONTSERRAT", "OPEN_SANS",
  "NOTO_SANS", "PLAYFAIR_DISPLAY", "EB_GARAMOND", "LIBRE_FRANKLIN",
  "OSWALD", "ANTON", "BARLOW_CONDENSED",
]

const COLOR_VARIANTS = [
  "TONAL_SPOT", "MONOCHROME", "NEUTRAL", "VIBRANT",
  "EXPRESSIVE", "FIDELITY", "CONTENT", "RAINBOW", "FRUIT_SALAD",
]

const ROUNDNESS_OPTIONS = ["ROUND_FOUR", "ROUND_EIGHT", "ROUND_TWELVE", "ROUND_FULL"]

function DisenoInner() {
  const router = useRouter()
  const { show: toast } = useAdminToast()
  const [userName, setUserName] = useState("Cargando...")
  const [loading, setLoading] = useState(true)
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>([])
  const [selectedDs, setSelectedDs] = useState<string>("")
  const [projects, setProjects] = useState<{ name: string; title?: string }[]>([])
  const [selectedProject, setSelectedProject] = useState("")

  const [form, setForm] = useState({
    displayName: "",
    colorMode: "LIGHT",
    colorVariant: "TONAL_SPOT",
    customColor: "#4d8eff",
    headlineFont: "INTER",
    bodyFont: "INTER",
    roundness: "ROUND_EIGHT",
    overridePrimaryColor: "",
    overrideNeutralColor: "",
  })

  const fetchData = async () => {
    try {
      const [dsRes, projRes] = await Promise.all([
        fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "stitch_list_design_systems", args: {} }),
        }),
        fetch("/api/stitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "stitch_list_projects", args: {} }),
        }),
      ])
      const dsData = await dsRes.json()
      const projData = await projRes.json()
      if (dsData.data) setDesignSystems(Array.isArray(dsData.data) ? dsData.data : [])
      if (projData.data) setProjects(Array.isArray(projData.data) ? projData.data : [])
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

  useEffect(() => {
    if (!selectedDs || !designSystems.length) return
    const ds = designSystems.find((d) => d.name === selectedDs)
    if (ds?.theme) {
      const t = ds.theme
      setForm({
        displayName: ds.displayName || "",
        colorMode: t.colorMode || "LIGHT",
        colorVariant: t.colorVariant || "TONAL_SPOT",
        customColor: t.customColor || "#4d8eff",
        headlineFont: t.headlineFont || "INTER",
        bodyFont: t.bodyFont || "INTER",
        roundness: t.roundness || "ROUND_EIGHT",
        overridePrimaryColor: t.overridePrimaryColor || "",
        overrideNeutralColor: t.overrideNeutralColor || "",
      })
    }
  }, [selectedDs, designSystems])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) {
      toast("Selecciona un proyecto", "warning")
      return
    }
    try {
      const res = await fetch("/api/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "stitch_create_design_system",
          args: {
            projectId: selectedProject,
            designSystem: {
              displayName: form.displayName,
              theme: {
                colorMode: form.colorMode,
                colorVariant: form.colorVariant,
                customColor: form.customColor,
                headlineFont: form.headlineFont,
                bodyFont: form.bodyFont,
                roundness: form.roundness,
                ...(form.overridePrimaryColor && { overridePrimaryColor: form.overridePrimaryColor }),
                ...(form.overrideNeutralColor && { overrideNeutralColor: form.overrideNeutralColor }),
              },
            },
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast("Sistema de diseño creado")
      await fetchData()
    } catch (err) {
      toast("Error: " + (err instanceof Error ? err.message : String(err)), "error")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDs || !selectedProject) {
      toast("Selecciona un sistema de diseño y un proyecto", "warning")
      return
    }
    try {
      const res = await fetch("/api/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "stitch_update_design_system",
          args: {
            name: selectedDs,
            projectId: selectedProject,
            designSystem: {
              displayName: form.displayName,
              theme: {
                colorMode: form.colorMode,
                colorVariant: form.colorVariant,
                customColor: form.customColor,
                headlineFont: form.headlineFont,
                bodyFont: form.bodyFont,
                roundness: form.roundness,
                ...(form.overridePrimaryColor && { overridePrimaryColor: form.overridePrimaryColor }),
                ...(form.overrideNeutralColor && { overrideNeutralColor: form.overrideNeutralColor }),
              },
            },
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast("Sistema de diseño actualizado")
    } catch (err) {
      toast("Error: " + (err instanceof Error ? err.message : String(err)), "error")
    }
  }

  const extractProjectId = (name: string) => name.replace("projects/", "")
  const extractDsId = (name: string) => name.replace("assets/", "")

  if (loading) return <Shell userName={userName}><p style={{ color: "var(--admin-text-secondary)" }}>Cargando...</p></Shell>

  return (
    <Shell userName={userName}>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">🎯 Sistema de diseño</div>
        </div>
        <form style={{ padding: 24 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Proyecto destino</label>
              <select
                className="admin-form-control"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map((p) => (
                  <option key={p.name} value={extractProjectId(p.name)}>
                    {p.title || extractProjectId(p.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Sistema existente (opcional)</label>
              <select
                className="admin-form-control"
                value={selectedDs}
                onChange={(e) => setSelectedDs(e.target.value)}
              >
                <option value="">Crear nuevo...</option>
                {designSystems.map((ds) => (
                  <option key={ds.name} value={ds.name}>
                    {ds.displayName || extractDsId(ds.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Nombre del sistema</label>
            <input
              type="text"
              className="admin-form-control"
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              required
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Modo de color</label>
              <select
                className="admin-form-control"
                value={form.colorMode}
                onChange={(e) => setForm((prev) => ({ ...prev, colorMode: e.target.value }))}
              >
                <option value="LIGHT">Claro</option>
                <option value="DARK">Oscuro</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Variante de color</label>
              <select
                className="admin-form-control"
                value={form.colorVariant}
                onChange={(e) => setForm((prev) => ({ ...prev, colorVariant: e.target.value }))}
              >
                {COLOR_VARIANTS.map((v) => (
                  <option key={v} value={v}>{v.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Color semilla / primario</label>
              <input
                type="color"
                className="admin-form-control"
                style={{ height: 48, padding: 4 }}
                value={form.customColor}
                onChange={(e) => setForm((prev) => ({ ...prev, customColor: e.target.value }))}
              />
            </div>
            <div className="admin-form-group">
              <label>Redondez</label>
              <select
                className="admin-form-control"
                value={form.roundness}
                onChange={(e) => setForm((prev) => ({ ...prev, roundness: e.target.value }))}
              >
                {ROUNDNESS_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Fuente para títulos</label>
              <select
                className="admin-form-control"
                value={form.headlineFont}
                onChange={(e) => setForm((prev) => ({ ...prev, headlineFont: e.target.value }))}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Fuente para cuerpo</label>
              <select
                className="admin-form-control"
                value={form.bodyFont}
                onChange={(e) => setForm((prev) => ({ ...prev, bodyFont: e.target.value }))}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Override color primario (opcional)</label>
              <input
                type="color"
                className="admin-form-control"
                style={{ height: 48, padding: 4 }}
                value={form.overridePrimaryColor}
                onChange={(e) => setForm((prev) => ({ ...prev, overridePrimaryColor: e.target.value }))}
              />
            </div>
            <div className="admin-form-group">
              <label>Override color neutro (opcional)</label>
              <input
                type="color"
                className="admin-form-control"
                style={{ height: 48, padding: 4 }}
                value={form.overrideNeutralColor}
                onChange={(e) => setForm((prev) => ({ ...prev, overrideNeutralColor: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleCreate}>
              Crear sistema
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={handleUpdate}
              disabled={!selectedDs}
            >
              Actualizar existente
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">Sistemas de diseño existentes</div>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Modo</th></tr></thead>
            <tbody>
              {designSystems.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "var(--admin-text-secondary)" }}>
                  No hay sistemas de diseño.
                </td></tr>
              ) : (
                designSystems.map((ds) => (
                  <tr
                    key={ds.name}
                    style={{ cursor: "pointer", background: selectedDs === ds.name ? "var(--admin-surface-2)" : undefined }}
                    onClick={() => setSelectedDs(ds.name)}
                  >
                    <td className="font-mono text-sm">{extractDsId(ds.name)}</td>
                    <td>{ds.displayName || "Sin nombre"}</td>
                    <td>{ds.theme?.colorMode || "—"}</td>
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
          <div className="admin-topbar-title">Sistema de diseño</div>
          <div className="admin-topbar-user"><span>{userName}</span></div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}

export default function DisenoPage() {
  return (
    <AdminToastProvider>
      <DisenoInner />
    </AdminToastProvider>
  )
}
