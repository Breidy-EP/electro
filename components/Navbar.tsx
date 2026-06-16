'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from './CartContext'

export default function Navbar() {
  const pathname = usePathname()
  const { count } = useCart()

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="navbar-brand">
          <div className="brand-icon">⚡</div>
          ELECTRO FNI
        </Link>
        <ul className="navbar-nav">
          <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Inicio</Link></li>
          <li><Link href="/catalogo" className={pathname.startsWith('/catalogo') ? 'active' : ''}>Catálogo</Link></li>
        </ul>
        <div className="navbar-actions">
          <Link href="/carrito" className="icon-btn" aria-label="Carrito">
            <span>🛒</span>
            <span className="badge-count">{count}</span>
          </Link>
          <Link href="/admin/login" className="icon-btn" aria-label="Admin" title="Panel administrativo">
            <span>🔒</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
