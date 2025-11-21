import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { CartProvider } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import { AuthProvider } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <div className="min-vh-100 d-flex flex-column bg-light">
            <Header />
            <main className="flex-grow-1">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
