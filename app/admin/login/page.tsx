'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const res = await fetch("/api/admin/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        })
        const { admin } = await res.json()
        if (admin) router.replace("/admin/productos")
      }
    })
  }, [router])

  async function handleSubmit(form: FormData) {
    const email = form.get("email") as string
    const password = form.get("password") as string

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      const msg = signInError.message === "Invalid login credentials" ? "Credenciales inválidas" : signInError.message
      const el = document.getElementById("login-error")
      if (el) el.textContent = msg
      return
    }

    const res = await fetch("/api/admin/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const { admin, nombre } = await res.json()

    if (!admin) {
      await supabase.auth.signOut()
      const el = document.getElementById("login-error")
      if (el) el.textContent = nombre ? "No tienes permisos de administrador" : "Tu cuenta no está registrada como administrador. No existe un perfil en la base de datos."
      return
    }
    router.replace("/admin/productos")
  }

  return (
    <div className="login-page" style={{ background: "var(--admin-bg)", color: "var(--admin-text)", fontFamily: "Inter, sans-serif" }}>
      <div className="login-card">
        <h1>⚡ Panel Admin</h1>
        <p>ELECTRO FNI — Gestión de inventario</p>
        <form action={handleSubmit}>
          <div className="admin-form-group">
            <label>Email</label>
            <input name="email" type="email" className="admin-form-control" placeholder="admin@electrocore.com" required />
          </div>
          <div className="admin-form-group">
            <label>Contraseña</label>
            <input name="password" type="password" className="admin-form-control" placeholder="••••••••" required />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">Ingresar</button>
          <div id="login-error" className="login-error" />
        </form>
      </div>
    </div>
  )
}
