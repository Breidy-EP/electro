'use client'

export default function NewsletterForm() {
  return (
    <form className="newsletter-form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); alert("¡Suscripción exitosa! Gracias por unirte.") }}>
      <input type="email" className="input-field" placeholder="tu@email.com" required />
      <button type="submit" className="btn btn-primary">Suscribirme</button>
    </form>
  )
}
