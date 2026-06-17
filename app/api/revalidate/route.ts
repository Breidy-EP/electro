import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(_req: NextRequest) {
  revalidatePath("/")
  revalidatePath("/catalogo")
  return NextResponse.json({ revalidated: true })
}
