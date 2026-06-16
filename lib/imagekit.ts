export const urlEndpoint = () => process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/uix3ndxd4r'
export const publicKey = () => process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_whefSKNUyp3sKclUhUPmnbVVrd8='

export function ikUrl(path: string, opts: { w?: number; h?: number; q?: number } = {}) {
  const { w = 400, h = 300, q = 80 } = opts
  return `${urlEndpoint()}/tr:w-${w},h-${h},q-${q},fo-auto/${path}`
}

export function svgFallback(label: string) {
  const safe = encodeURIComponent(label)
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23272a31' width='400' height='300'/%3E%3Crect fill='%2332353c' x='40' y='40' width='320' height='220' rx='8'/%3E%3Ctext fill='%23adc6ff' font-family='JetBrains%20Mono,monospace' font-size='13' x='200' y='167' text-anchor='middle' dominant-baseline='middle' letter-spacing='2'%3E${safe}%3C/text%3E%3Ctext fill='%238c909f' font-family='Inter,sans-serif' font-size='11' x='200' y='195' text-anchor='middle'%3E📦%20ELECTRO_CORE%3C/text%3E%3C/svg%3E`
}

export async function uploadToImageKit(file: File, authToken?: string) {
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  if (authToken) headers['authorization'] = `Bearer ${authToken}`

  const resp = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: formData,
  })
  return resp.json()
}
