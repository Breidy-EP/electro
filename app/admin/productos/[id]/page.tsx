'use client'

import { use } from "react"
import ProductoForm from "../ProductoForm"

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ProductoForm id={id} />
}
