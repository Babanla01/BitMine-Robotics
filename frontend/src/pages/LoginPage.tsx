import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const result = (await login(formData.email, formData.password)) as any
      addToast('Welcome back! You are now signed in.', 'success')
      
      // Navigate based on role and profile completion
      if (result?.role === 'admin') {
        navigate('/dashboard')
      } else if (result?.profile_completed === false) {
        // First-time login: show profile completion page
        navigate('/profile')
      } else {
        // Returning user: go directly to home
        navigate('/')
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Login failed. Please check your credentials.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="section-padding bg-light">
      <div className="container-custom max-w-40rem">
        <div className="card border-0 shadow-sm p-5">
          <div className="text-center mb-4">
            <h1 className="h-lg fw-bold">Sign in to BitMine</h1>
            <p className="text-medium">Access your cart and continue checkout.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={isLoading}
            />

            <label className="form-label fw-semibold">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control mb-2"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={isLoading}
                style={{ paddingRight: '3rem' }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.27-3.11-11-7.5C2.73 8.11 6.95 5 12 5c2.04 0 3.94.5 5.65 1.36"/><path d="M1 1l22 22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <div className="text-end mb-4">
              <Link to="/forgot-password" className="text-primary text-small">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isLoading || loading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-center text-medium mb-0">
              No account? <Link to="/signup" className="fw-semibold text-primary">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

