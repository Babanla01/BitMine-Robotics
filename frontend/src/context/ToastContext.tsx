import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'info' | 'error'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const generateId = () => Math.random().toString(36).slice(2)

const TOAST_DURATION = 4000

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (TOAST_DURATION / 50))
        if (newProgress <= 0) {
          onRemove(toast.id)
          return 0
        }
        return newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [toast.id, onRemove])

  const icons = {
    success: <CheckCircle2 />,
    info: <Info />,
    error: <XCircle />
  }

  const titles = {
    success: 'Success',
    info: 'Info',
    error: 'Error'
  }

  return (
    <div className={`toast-modern toast-${toast.type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {icons[toast.type]}
        </div>
        <div className="toast-body">
          <div className="toast-title">{titles[toast.type]}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
        <button
          className="toast-close-btn"
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onRemove(toast.id)}
        >
          <X />
        </button>
      </div>
      <div className="toast-progress">
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <div 
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = generateId()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-stack-modern">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

