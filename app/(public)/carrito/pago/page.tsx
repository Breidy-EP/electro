'use client'

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ikUrl } from "@/lib/imagekit"

function PagoContent() {
  const params = useSearchParams()
  const ordenId = params.get("orden") ?? ""
  const total = params.get("total") ?? "0.00"

  return (
    <>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          <span className="separator">›</span>
          <Link href="/carrito">Mi Reserva</Link>
          <span className="separator">›</span>
          <span>Pago</span>
        </div>
      </div>

      <div className="container">
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 0 80px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Reserva Confirmada</h1>
          <p style={{ color: "var(--on-surface-variant)", marginBottom: 32 }}>
            Su reserva ha sido registrada con éxito. Complete el pago para confirmar su pedido.
          </p>

          <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)", letterSpacing: "0.05em", marginBottom: 4 }}>
              CÓDIGO DE RESERVA
            </p>
            <p style={{ fontFamily: "var(--mono-font)", fontSize: 20, fontWeight: 600, color: "var(--primary)", marginBottom: 20 }}>
              {ordenId.slice(0, 8).toUpperCase()}
            </p>

            <p style={{ fontSize: 13, color: "var(--on-surface-variant)", letterSpacing: "0.05em", marginBottom: 4 }}>
              TOTAL A PAGAR
            </p>
            <p style={{ fontFamily: "var(--mono-font)", fontSize: 32, fontWeight: 700, color: "var(--secondary)", marginBottom: 28 }}>
              Bs {parseFloat(total).toFixed(2)}
            </p>

            <div style={{
              width: 220, height: 220, margin: "0 auto 20px",
              background: "#fff", borderRadius: 16, padding: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img
                src={ikUrl("products/QR.jpeg", { w: 400, h: 400, q: 90 })}
                alt="QR de pago"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden")
                }}
              />
              <span id="qr-fallback" className="hidden" style={{ display: "none", fontSize: 13, color: "#666" }}>
                Escanea el código QR para realizar el pago
              </span>
            </div>

            <p style={{ fontSize: 14, color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
              Escanee el código QR con su aplicación bancaria para realizar el pago.
              Una vez realizado, su pedido será procesado.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/catalogo" className="btn btn-ghost">
              ← Seguir Comprando
            </Link>
            <a
              href={`https://wa.me/59172304973?text=${encodeURIComponent(`Hola, acabo de realizar una reserva. Código: ${ordenId.slice(0, 8).toUpperCase()}, Total: Bs ${parseFloat(total).toFixed(2)}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default function PagoPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "var(--on-surface-variant)" }}>Cargando...</p>
      </div>
    }>
      <PagoContent />
    </Suspense>
  )
}
