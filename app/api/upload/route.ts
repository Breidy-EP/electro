import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  if (!serviceKey || !supabaseUrl || !privateKey) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 })
  }

  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)
  const { data: { user } } = await adminClient.auth.getUser(authHeader.slice(7))
  if (!user) return NextResponse.json({ error: "Token inválido" }, { status: 401 })

  const { data: cliente } = await adminClient
    .from("clientes")
    .select("es_admin")
    .eq("usuario_auth_id", user.id)
    .maybeSingle()

  if (!cliente?.es_admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const fileName = file.name || `upload-${Date.now()}.jpg`

    const ikForm = new FormData()
    ikForm.append("file", new Blob([bytes], { type: file.type }), fileName)
    ikForm.append("fileName", fileName)
    ikForm.append("useUniqueFileName", "true")
    ikForm.append("folder", "/products")

    const encoded = Buffer.from(privateKey + ":").toString("base64")

    const resp = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: `Basic ${encoded}` },
      body: ikForm,
    })

    const data = await resp.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
