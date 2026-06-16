'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProyectosPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/stitch/dashboard")
  }, [router])

  return null
}
