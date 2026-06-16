'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/productos")
  }, [router])

  return (
    <div className="login-page" style={{ background: "var(--admin-bg)", color: "var(--admin-text)", fontFamily: "Inter, sans-serif" }}>
      <p>Redirigiendo...</p>
    </div>
  )
}
