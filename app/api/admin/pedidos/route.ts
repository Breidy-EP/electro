import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) throw new Error("Server config error")
  return createClient(supabaseUrl, serviceKey)
}

export async function GET() {
  try {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from("ordenes")
      .select("*, cliente:clientes(nombre_completo, email, telefono), items:detalle_orden(*)")
      .order("creado_en", { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fetch failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, estado } = await req.json()
    if (!id || !estado) return NextResponse.json({ error: "id y estado requeridos" }, { status: 400 })
    const adminClient = getAdminClient()
    const { data, error } = await adminClient.from("ordenes").update({ estado }).eq("id", id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
