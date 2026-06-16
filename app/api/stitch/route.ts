import { NextRequest, NextResponse } from "next/server"

const STITCH_URL = "https://stitch.googleapis.com/mcp"
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

let requestId = 1

export async function POST(req: NextRequest) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "GOOGLE_API_KEY no configurada" }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { tool, args } = body

    if (!tool) {
      return NextResponse.json({ error: "Se requiere 'tool'" }, { status: 400 })
    }

    const mcpBody = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: tool, arguments: args || {} },
      id: requestId++,
    }

    const res = await fetch(STITCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
      },
      body: JSON.stringify(mcpBody),
    })

    const data = await res.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }

    if (!data.result) {
      return NextResponse.json({ data: null })
    }

    if (data.result.isError) {
      return NextResponse.json(
        { error: data.result.content[0]?.text || "Error desconocido" },
        { status: 400 }
      )
    }

    const text = data.result.content[0]?.text
    let parsed = text
    try { parsed = JSON.parse(text) } catch { /* leave as text */ }

    return NextResponse.json({ data: parsed })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    )
  }
}
