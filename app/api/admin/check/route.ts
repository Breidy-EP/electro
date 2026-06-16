import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)

  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ admin: false })

    const { data } = await adminClient
      .from("clientes")
      .select("es_admin, nombre_completo")
      .eq("email", email)
      .maybeSingle()

    return NextResponse.json({
      admin: data?.es_admin === true,
      nombre: data?.nombre_completo || null,
    })
  } catch {
    return NextResponse.json({ admin: false })
  }
}
