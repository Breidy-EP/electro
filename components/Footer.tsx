'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="navbar-brand" style={{ marginBottom: 'var(--stack-md)' }}>
              <img
                src="https://ik.imagekit.io/uix3ndxd4r/tr:w-32,h-32,q-80,fo-auto/brand/logo-icon.png"
                alt="ELECTRO FNI"
                className="brand-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2732%27 height=%2732%27%3E%3Crect fill=%27%234d8eff%27 width=%2732%27 height=%2732%27 rx=%276%27/%3E%3Ctext fill=%27white%27 font-size=%2720%27 x=%2716%27 y=%2722%27 text-anchor=%27middle%27%3E⚡%3C/text%3E%3C/svg%3E'
                }}
                style={{ width: 32, height: 32, borderRadius: 'var(--round-md)', objectFit: 'contain' }}
              />
              ELECTRO FNI
            </Link>
            <p>ElectroIngeniería FNI es una tienda virtual de comercio electrónico especializada en la comercialización de componentes electrónicos y herramientas básicas destinadas principalmente a estudiantes de ingeniería y personas que requieren materiales electrónicos dentro del entorno académico de la Facultad Nacional de Ingeniería.</p>
          </div>
          <div>
            <h4>Recursos</h4>
            <ul>
              <li><a href="#">Datasheets</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Proyectos Abiertos</a></li>
              <li><a href="#">Soporte Técnico</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Compliance</a></li>
              <li><a href="#">Terms of Sale</a></li>
              <li><a href="#">Privacidad</a></li>
            </ul>
          </div>
          <div>
            <h4>Comunidad</h4>
            <ul>
              <li><a href="#">Blog Técnico</a></li>
              <li><a href="#">Foro</a></li>
              <li><a href="#">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ELECTRO FNI — ElectroIngeniería FNI. Todos los derechos reservados.</span>
          <div className="footer-social">
            <a href="#" aria-label="GitHub">⌘</a>
            <a href="#" aria-label="Share">↗</a>
            <a href="#" aria-label="Terminal">⎔</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
