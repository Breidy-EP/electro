import Link from "next/link"
import { obtenerDestacados } from "@/lib/supabase-queries"
import HomeClient from "./HomeClient"

export default async function HomePage() {
  let productos: Awaited<ReturnType<typeof obtenerDestacados>> = []
  try {
    productos = await obtenerDestacados()
  } catch (e) {
    console.error("Error fetching destacados:", e)
  }

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text-col">
              <div className="hero-badge">
                <span>TIENDA OFICIAL FNI</span>
              </div>
              <h1 className="hero-title text-headline-xl">ElectroIngeniería FNI</h1>
              <p className="hero-subtitle text-body-lg">
                ElectroIngeniería FNI es una tienda virtual de comercio electrónico especializada en la comercialización de componentes electrónicos y herramientas básicas destinadas principalmente a estudiantes de ingeniería y personas que requieren materiales electrónicos dentro del entorno académico de la Facultad Nacional de Ingeniería.
              </p>
              <div className="hero-actions">
                <Link href="/catalogo" className="btn btn-secondary">
                  Ver Catálogo
                </Link>
              </div>
            </div>
            <div className="hero-image-col">
              <img src="/image.png" alt="ElectroIngeniería FNI" className="hero-image" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="part-id-display">
            <span>📦</span>
            <span>PART ID: EC-9000-XT</span>
            <span style={{ opacity: 0.4, margin: "0 4px" }}>|</span>
            <span>Core Processor v.Alpha</span>
            <span style={{ marginLeft: 8 }}>⎔</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Categorías Destacadas</h2>
            </div>
          </div>
          <div className="categories-grid">
            <Link href="/catalogo" className="category-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="icon-wrap">
                <img src="https://ik.imagekit.io/uix3ndxd4r/tr:w-56,h-56,q-80,fo-auto/products/arduino-uno-r3.png" alt="Microcontrollers" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
              </div>
              <h3>Microcontrollers</h3>
              <p>Arduino Ecosystem</p>
              <span className="explore-link">Explorar →</span>
            </Link>
            <Link href="/catalogo" className="category-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="icon-wrap">
                <img src="https://ik.imagekit.io/uix3ndxd4r/tr:w-56,h-56,q-80,fo-auto/products/esp32-devkit-v1.png" alt="Computing" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
              </div>
              <h3>Computing</h3>
              <p>Raspberry Pi</p>
              <span className="explore-link">Explorar →</span>
            </Link>
            <Link href="/catalogo" className="category-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="icon-wrap">
                <img src="https://ik.imagekit.io/uix3ndxd4r/tr:w-56,h-56,q-80,fo-auto/products/hc-sr04-ultrasonic.png" alt="Sensores" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
              </div>
              <h3>Detection</h3>
              <p>Sensores</p>
              <span className="explore-link">Explorar →</span>
            </Link>
            <Link href="/catalogo" className="category-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="icon-wrap">
                <img src="https://ik.imagekit.io/uix3ndxd4r/tr:w-56,h-56,q-80,fo-auto/products/battery-9v.png" alt="Energy" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
              </div>
              <h3>Energy Management</h3>
              <p>Módulos de Energía Pro</p>
              <span className="explore-link">Explorar →</span>
            </Link>
          </div>

        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Best-Sellers</h2>
              <p className="section-subtitle">Los componentes más demandados por nuestra comunidad.</p>
            </div>
            <Link href="/catalogo" className="section-link">Ver Todos →</Link>
          </div>
          {productos.length > 0 ? (
            <HomeClient productos={JSON.parse(JSON.stringify(productos))} />
          ) : (
            <div className="products-grid" id="featured-grid">
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: "var(--on-surface-variant)" }}>
                No se pudieron cargar los productos destacados.
              </div>
            </div>
          )}
        </div>
      </section>


    </>
  )
}
