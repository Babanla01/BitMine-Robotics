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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    signup({ name: formData.name || 'BitMine Learner', email: formData.email })
    addToast('Account created! You are now signed in.', 'success')
    navigate('/cart')
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
            <input
              type="password"
              className="form-control mb-4"
              placeholder="Create a password"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />

            <button type="submit" className="btn btn-primary w-100 mb-3">
              Create Account
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

