import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) throw new Error("Server config error")
  return createClient(supabaseUrl, serviceKey)
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const adminClient = getAdminClient()
    const { error } = await adminClient.from("productos").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Delete failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, imagen, imagen_alt, ...productoData } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const adminClient = getAdminClient()

    const { data, error } = await adminClient.from("productos").update(productoData).eq("id", id).select().single()
    if (error) throw error

    if (imagen !== undefined) {
      const { data: existing } = await adminClient.from("imagenes_producto").select("id").eq("producto_id", id)
      if (existing?.length) {
        await adminClient.from("imagenes_producto").update({ url: imagen, texto_alt: imagen_alt || "" }).eq("producto_id", id)
      } else {
        await adminClient.from("imagenes_producto").insert({ producto_id: id, url: imagen, texto_alt: imagen_alt || "", orden: 0 })
      }
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imagen, imagen_alt, ...productoData } = body
    const adminClient = getAdminClient()

    const { data, error } = await adminClient.from("productos").insert(productoData).select().single()
    if (error) throw error

    if (imagen) {
      const prodId = (data as { id: string }).id
      await adminClient.from("imagenes_producto").insert({ producto_id: prodId, url: imagen, texto_alt: imagen_alt || "", orden: 0 })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Create failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
