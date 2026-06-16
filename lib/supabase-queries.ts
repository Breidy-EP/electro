import { supabase } from './supabase'

const PRODUCTO_SELECT = `*, categoria:categorias(nombre, slug, icono), imagenes:imagenes_producto(url, texto_alt, orden), etiquetas:productos_etiquetas(etiqueta:etiquetas(nombre, slug, color))`

export interface Producto {
  id: string
  sku: string
  nombre: string
  slug: string
  descripcion: string | null
  categoria_id: string
  precio: number
  precio_original: number | null
  costo: number | null
  stock: number
  stock_minimo: number
  visible: boolean
  destacado: boolean
  meta_titulo: string | null
  meta_descripcion: string | null
  creado_en: string
  actualizado_en: string
  categoria: { nombre: string; slug: string; icono: string } | null
  imagenes: { url: string; texto_alt: string | null; orden: number }[]
  etiquetas: { etiqueta: { nombre: string; slug: string; color: string } | null }[]
}

export interface Categoria {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  icono: string | null
  creado_en: string
}

export interface Cliente {
  id: string
  usuario_auth_id: string
  email: string
  nombre_completo: string
  telefono: string | null
  es_admin: boolean
  creado_en: string
}

export interface Orden {
  id: string
  cliente_id: string
  estado: string
  subtotal: number
  impuesto: number
  costo_envio: number
  total: number
  metodo_envio: string
  direccion_id: string | null
  notas: string | null
  creado_en: string
  actualizado_en: string
  cliente: { nombre_completo: string; email: string; telefono?: string | null } | null
  items: DetalleOrden[]
}

export interface DetalleOrden {
  id: string
  orden_id: string
  producto_id: string | null
  producto_nombre: string
  producto_sku: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export async function obtenerProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_SELECT)
    .eq('visible', true)
    .order('creado_en', { ascending: false })
  if (error) throw new Error(error.message)
  return data as unknown as Producto[]
}

export async function obtenerProductoPorSlug(slug: string) {
  const { data, error } = await supabase
    .from('productos')
    .select(`${PRODUCTO_SELECT}, especificaciones(atributo, valor, orden)`)
    .eq('slug', slug)
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Producto & { especificaciones: { atributo: string; valor: string; orden: number }[] }
}

export async function obtenerCategorias() {
  const { data, error } = await supabase.from('categorias').select('*').order('nombre')
  if (error) throw new Error(error.message)
  return data as Categoria[]
}

export async function obtenerDestacados() {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_SELECT)
    .eq('destacado', true)
    .eq('visible', true)
    .order('creado_en', { ascending: false })
  if (error) throw new Error(error.message)
  return data as unknown as Producto[]
}

export async function obtenerProductosPorCategoria(slugCategoria: string) {
  const { data, error } = await supabase
    .from('productos')
    .select(PRODUCTO_SELECT)
    .eq('categoria.slug', slugCategoria)
    .eq('visible', true)
  if (error) throw new Error(error.message)
  return data as unknown as Producto[]
}

export async function iniciarSesion(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

export async function registrarUsuario(email: string, password: string, nombreCompleto: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
  if (authError) throw new Error(authError.message)
  if (authData.user) {
    const { error: insertError } = await supabase.from('clientes').insert({
      usuario_auth_id: authData.user.id,
      email,
      nombre_completo: nombreCompleto,
    })
    if (insertError) throw new Error(insertError.message)
  }
  return authData
}

export function cerrarSesion() {
  return supabase.auth.signOut()
}

export function onAuthChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

export async function obtenerClienteActual() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('usuario_auth_id', session.user.id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Cliente | null
}

export async function esAdmin() {
  const cliente = await obtenerClienteActual()
  return cliente?.es_admin === true
}

export async function adminObtenerProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select(`*, categoria:categorias(nombre, slug), imagenes:imagenes_producto(url, texto_alt, orden)`)
    .order('creado_en', { ascending: false })
  if (error) throw new Error(error.message)
  return data as unknown as Producto[]
}

export async function adminCrearProducto(producto: Partial<Producto>) {
  const { data, error } = await supabase.from('productos').insert(producto).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminActualizarProducto(id: string, cambios: Partial<Producto>) {
  const { data, error } = await supabase.from('productos').update(cambios).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminEliminarProducto(id: string) {
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function adminActualizarStock(id: string, stock: number) {
  const { data, error } = await supabase.from('productos').update({ stock }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminObtenerCategorias() {
  const { data, error } = await supabase.from('categorias').select('*').order('nombre')
  if (error) throw new Error(error.message)
  return data as Categoria[]
}

export async function adminCrearCategoria(categoria: Partial<Categoria>) {
  const { data, error } = await supabase.from('categorias').insert(categoria).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminActualizarCategoria(id: string, cambios: Partial<Categoria>) {
  const { data, error } = await supabase.from('categorias').update(cambios).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminEliminarCategoria(id: string) {
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function adminObtenerPedidos() {
  const { data, error } = await supabase
    .from('ordenes')
    .select(`*, cliente:clientes(nombre_completo, email), items:detalle_orden(*)`)
    .order('creado_en', { ascending: false })
  if (error) throw new Error(error.message)
  return data as unknown as Orden[]
}

export async function adminActualizarEstadoPedido(id: string, estado: string) {
  const { data, error } = await supabase.from('ordenes').update({ estado }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminObtenerEstadisticas() {
  const { count: totalProductos, error: err1 } = await supabase.from('productos').select('*', { count: 'exact', head: true })
  if (err1) throw new Error(err1.message)
  const { count: totalPedidos, error: err2 } = await supabase.from('ordenes').select('*', { count: 'exact', head: true })
  if (err2) throw new Error(err2.message)
  const { count: totalClientes, error: err3 } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
  if (err3) throw new Error(err3.message)
  const { count: pedidosPendientes, error: err4 } = await supabase.from('ordenes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente')
  if (err4) throw new Error(err4.message)
  const stockBajo = await adminProductosStockBajo()
  return { totalProductos: totalProductos ?? 0, totalPedidos: totalPedidos ?? 0, totalClientes: totalClientes ?? 0, pedidosPendientes: pedidosPendientes ?? 0, stockBajo }
}

export async function adminProductosStockBajo() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, sku, nombre, stock, stock_minimo, precio')
    .order('stock', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).filter(p => p.stock <= p.stock_minimo)
}
