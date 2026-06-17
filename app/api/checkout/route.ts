import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) throw new Error("Server config error")
  return createClient(supabaseUrl, serviceKey)
}

export async function POST(req: NextRequest) {
  try {
    const { items, nombre_completo, email, telefono, metodo_envio, notas } = await req.json()

    if (!items?.length) return NextResponse.json({ error: "Carrito vacío" }, { status: 400 })
    if (!nombre_completo || !email) return NextResponse.json({ error: "Nombre y email requeridos" }, { status: 400 })

    const adminClient = getAdminClient()

    const { data: productos, error: prodErr } = await adminClient
      .from("productos")
      .select("id, sku, stock, precio")
      .in("sku", items.map((i: { sku: string }) => i.sku))
    if (prodErr) throw prodErr

    const skuMap = new Map((productos || []).map(p => [p.sku, p]))

    for (const item of items) {
      const prod = skuMap.get(item.sku)
      if (!prod) return NextResponse.json({ error: `Producto ${item.sku} no encontrado` }, { status: 400 })
      if (prod.stock < item.qty) return NextResponse.json({ error: `Stock insuficiente para ${item.nombre}` }, { status: 400 })
    }

    let { data: cliente } = await adminClient
      .from("clientes")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (!cliente) {
      const { data: newCliente, error: insertErr } = await adminClient
        .from("clientes")
        .insert({ email, nombre_completo, telefono: telefono || null })
        .select("id")
        .single()
      if (insertErr) throw insertErr
      cliente = newCliente as { id: string }
    } else if (telefono) {
      await adminClient.from("clientes").update({ telefono }).eq("id", cliente.id)
    }

    const subtotal = items.reduce((s: number, i: { precio: number; qty: number }) => s + i.precio * i.qty, 0)
    const total = subtotal

    const { data: orden, error: ordenErr } = await adminClient
      .from("ordenes")
      .insert({
        cliente_id: cliente.id,
        estado: "pendiente",
        subtotal, impuesto: 0, costo_envio: 0, total,
        metodo_envio: metodo_envio || "estandar",
        notas: notas || null,
      })
      .select()
      .single()
    if (ordenErr) throw ordenErr

    const detalle = items.map((i: { sku: string; nombre: string; precio: number; qty: number }) => {
      const prod = skuMap.get(i.sku)!
      return {
        orden_id: orden.id,
        producto_id: prod.id,
        producto_nombre: i.nombre,
        producto_sku: i.sku,
        precio_unitario: i.precio,
        cantidad: i.qty,
        subtotal: i.precio * i.qty,
      }
    })

    const { error: detErr } = await adminClient.from("detalle_orden").insert(detalle)
    if (detErr) throw detErr

    for (const item of items) {
      const prod = skuMap.get(item.sku)!
      await adminClient.from("productos").update({ stock: prod.stock - item.qty }).eq("id", prod.id)
    }

    return NextResponse.json({ orden_id: orden.id, total })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error en checkout"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
