'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface CartItem {
  sku: string
  nombre: string
  precio: number
  qty: number
}

interface CartContextType {
  items: CartItem[]
  count: number
  addToCart: (nombre: string, precio: number, sku: string) => void
  removeFromCart: (index: number) => void
  changeQty: (index: number, delta: number) => void
  clearCart: () => void
  subtotal: number
  tax: number
  total: number
}

const STORAGE_KEY = 'electro_core_cart'

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      } catch { /* ignore */ }
    }
    return []
  })

  const addToCart = useCallback((nombre: string, precio: number, sku: string) => {
    setItems(prev => {
      const existente = prev.find(item => item.sku === sku)
      let next: CartItem[]
      if (existente) {
        next = prev.map(item => item.sku === sku ? { ...item, qty: item.qty + 1 } : item)
      } else {
        next = [...prev, { sku, nombre, precio, qty: 1 }]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeFromCart = useCallback((index: number) => {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== index)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const changeQty = useCallback((index: number, delta: number) => {
    setItems(prev => {
      const next = prev.map((item, i) =>
        i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const count = items.length
  const subtotal = items.reduce((sum, item) => sum + item.precio * item.qty, 0)
  const tax = subtotal * 0.21
  const total = subtotal + tax

  return (
    <CartContext.Provider value={{ items, count, addToCart, removeFromCart, changeQty, clearCart, subtotal, tax, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
