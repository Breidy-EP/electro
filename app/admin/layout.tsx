import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | ELECTRO FNI",
  description: "Panel de administración ELECTRO FNI",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
