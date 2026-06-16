'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StitchPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/stitch/dashboard")
  }, [router])

  return (
    <div style={{ background: "var(--admin-bg)", color: "var(--admin-text)", fontFamily: "Inter, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Redirigiendo...</p>
    </div>
  )
}
