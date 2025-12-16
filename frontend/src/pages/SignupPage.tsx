import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      // Use signup from AuthContext which handles API call and state management
      await signup(formData.name || 'BitMine Learner', formData.email, formData.password)
      addToast('Account created! You are now signed in.', 'success')
      // After signup, send users to their profile
      navigate('/profile')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to create account', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="section-padding bg-light">
      <div className="container-custom max-w-40rem">
        <div className="card border-0 shadow-sm p-5">
          <div className="text-center mb-4">
            <h1 className="h-lg fw-bold">Create an account</h1>
            <p className="text-medium">Save your cart, track orders, and get updates.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="form-label fw-semibold">Full Name</label>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Ada Lovelace"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />

            <label className="form-label fw-semibold">Password</label>
            <div style={{ position: 'relative' }} className="mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Create a password"
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

            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            <p className="text-center text-medium mb-0">
              Already have an account? <Link to="/login" className="fw-semibold text-primary">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

