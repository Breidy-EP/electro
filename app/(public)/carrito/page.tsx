'use client'

import { useState } from "react"
import { useCart } from "@/components/CartContext"
import { useToast } from "@/components/Toast"
import Link from "next/link"

export default function CarritoPage() {
  const { items, subtotal, tax, total, changeQty, removeFromCart, clearCart } = useCart()
  const { show } = useToast()
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [metodoEnv, setMetodoEnv] = useState("pickup")
  const [notas, setNotas] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) { show("El carrito está vacío"); return }
    if (!nombre.trim()) { show("Ingrese su nombre"); return }
    if (!email.trim()) { show("Ingrese su correo electrónico"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items, nombre_completo: nombre.trim(), email: email.trim(), telefono: telefono.trim() || null,
          metodo_envio: metodoEnv === "shipping" ? "envio" : "estandar",
          notas: notas.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al procesar")
      show(`✓ Reserva confirmada. Código: ${data.orden_id.slice(0, 8)}...`)
      clearCart()
    } catch (e) {
      show("✗ " + (e instanceof Error ? e.message : "Error al procesar"))
    }
    setLoading(false)
  }

  return (
    <>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          <span className="separator">›</span>
          <span>Mi Reserva</span>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <div>
            <h1 className="page-title" style={{ fontSize: 28, fontWeight: 700 }}>Mi Reserva</h1>
            <p className="page-subtitle">Revise sus componentes y complete los detalles técnicos para la reserva.</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="cart-layout">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Artículos Agregados</h3>
              <span className="text-code" style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                {items.length} ITEM{items.length !== 1 ? 'S' : ''}
              </span>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--on-surface-variant)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p style={{ marginTop: 8 }}><Link href="/catalogo" style={{ color: 'var(--primary)' }}>Explorar productos</Link></p>
              </div>
            ) : (
              <div className="cart-items">
                {items.map((item, i) => (
                  <div className="cart-item" key={i}>
                    <div className="item-info" style={{ flex: 1 }}>
                      <div className="item-name">{item.nombre}</div>
                      <div className="item-sku">SKU: {item.sku}</div>
                      <div className="item-bottom" style={{ marginTop: 12 }}>
                        <div className="item-price">{`Bs ${(item.precio * item.qty).toFixed(2)}`}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid var(--outline-variant)', background: 'var(--surface-container)', color: 'var(--on-surface)', cursor: 'pointer' }}
                        onClick={() => changeQty(i, -1)}
                      >−</button>
                      <span style={{ fontFamily: 'var(--mono-font)', minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                      <button
                        style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid var(--outline-variant)', background: 'var(--surface-container)', color: 'var(--on-surface)', cursor: 'pointer' }}
                        onClick={() => changeQty(i, 1)}
                      >+</button>
                    </div>
                    <button className="item-remove" onClick={() => removeFromCart(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="order-summary" style={{ marginBottom: 24 }}>
              <h3>📋 Resumen</h3>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{`Bs ${subtotal.toFixed(2)}`}</span>
              </div>
              <div className="summary-line">
                <span>Impuestos (21%)</span>
                <span>{`Bs ${tax.toFixed(2)}`}</span>
              </div>
              <div className="summary-line">
                <span>Gastos de Gestión</span>
                <span className="free">GRATIS</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>{`Bs ${total.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="checkout-form">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input type="text" className="input-field" placeholder="Ingrese su nombre"
                  value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input type="email" className="input-field" placeholder="correo@ejemplo.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" className="input-field" placeholder="+591 70000000"
                  value={telefono} onChange={e => setTelefono(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Método de Obtención</label>
                <div className="radio-group">
                  <label className={`radio-option ${metodoEnv === "pickup" ? "selected" : ""}`}>
                    <input type="radio" name="delivery" value="pickup" checked={metodoEnv === "pickup"}
                      onChange={() => setMetodoEnv("pickup")} />
                    <span className="radio-label"><span className="icon">🏪</span> Recogida Local</span>
                  </label>
                  <label className={`radio-option ${metodoEnv === "shipping" ? "selected" : ""}`}>
                    <input type="radio" name="delivery" value="shipping" checked={metodoEnv === "shipping"}
                      onChange={() => setMetodoEnv("shipping")} />
                    <span className="radio-label"><span className="icon">🚚</span> Envío Express</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Instrucciones Adicionales</label>
                <textarea placeholder="Instrucciones especiales para su pedido..."
                  value={notas} onChange={e => setNotas(e.target.value)} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                onClick={handleCheckout} disabled={loading}>
                {loading ? "Procesando..." : "⚡ RESERVAR AHORA"}
              </button>
              <p className="terms-notice">
                Al hacer clic en &quot;Reservar Ahora&quot;, aceptas nuestros Términos de Venta Industrial y el cumplimiento de normativas RoHS.
              </p>
              <div className="security-badge">
                <span>🔒</span>
                <span>CONEXIÓN SEGURA TLS 1.3 — AES-256 GCM ENCRYPTION</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
