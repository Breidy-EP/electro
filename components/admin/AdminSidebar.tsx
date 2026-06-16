'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cerrarSesion } from "@/lib/supabase-queries"
import { useRouter } from "next/navigation"

const iconMap: Record<string, string> = {
  "/admin/productos": "💾",
  "/admin/categorias": "🏷️",
  "/admin/pedidos": "📋",
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await cerrarSesion()
      router.replace("/admin/login")
    } catch (e) { console.error(e) }
  }

  const links = [
    { href: "/admin/productos", label: "Productos" },
    { href: "/admin/categorias", label: "Categorías" },
    { href: "/admin/pedidos", label: "Pedidos" },
  ]

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">ELECTRO FNI</div>
        <div className="admin-sidebar-badge">
          <span>⚙️</span>
          <span>Engineer Mode</span>
        </div>
      </div>
      <nav className="admin-sidebar-nav">
        {links.map(l => {
          const isActive = pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={isActive ? "active" : ""}
            >
              <span className="admin-nav-icon">{iconMap[l.href] || "📄"}</span>
              <span>{l.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout() }} className="admin-sidebar-logout">
          🚪 Logout
        </a>
      </div>
    </aside>
  )
}
