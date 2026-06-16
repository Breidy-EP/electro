'use client'

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'

interface AdminToastContextType {
  show: (message: string, type?: 'success' | 'error' | 'warning') => void
}

const AdminToastContext = createContext<AdminToastContextType | null>(null)

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const [borderColor, setBorderColor] = useState('var(--admin-success)')

  const show = useCallback((msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setMessage(msg)
    setBorderColor(type === 'error' ? 'var(--admin-danger)' : type === 'warning' ? 'var(--admin-warning)' : 'var(--admin-success)')
    setVisible(true)
    setTimeout(() => setVisible(false), 3500)
  }, [])

  return (
    <AdminToastContext.Provider value={{ show }}>
      {children}
      <div className="admin-toast" style={{ borderColor, display: visible ? 'block' : 'none', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}>
        {message}
      </div>
    </AdminToastContext.Provider>
  )
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext)
  if (!ctx) throw new Error('useAdminToast must be used within AdminToastProvider')
  return ctx
}
