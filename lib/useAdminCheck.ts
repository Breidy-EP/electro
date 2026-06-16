'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useAdminCheck() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch("/api/admin/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "" }),
    }).then(async () => {
      const { data: { session } } = await (await import("@/lib/supabase")).supabase.auth.getSession()
      if (!session) { router.replace("/admin/login"); return }
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      const { admin } = await res.json()
      if (!admin) { router.replace("/admin/login"); return }
      setChecked(true)
    }).catch(() => router.replace("/admin/login"))
  }, [router])

  return checked
}
