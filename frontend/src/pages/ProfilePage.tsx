import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'

const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Kaduna', 'Enugu', 'Calabar', 'Warri',
  'Ilorin', 'Benin City', 'Akure', 'Abeokuta', 'Gusau', 'Yola', 'Bauchi', 'Zaria', 'Lafia',
  'Jos', 'Okada', 'Other'
]

export default function ProfilePage() {
  const { user, token } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    
    // Fetch existing profile data if available
    const fetchProfile = async () => {
      try {
        if (!token) return
        const response = await fetch(`${API_BASE_URL}/admin/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setFormData(prev => ({
            ...prev,
            name: data.user?.name || prev.name,
            email: data.user?.email || prev.email,
            phone: data.user?.phone || prev.phone,
            street_address: data.defaultAddress?.street_address || prev.street_address,
            city: data.defaultAddress?.city || prev.city,
            state: data.defaultAddress?.state || prev.state,
            postal_code: data.defaultAddress?.postal_code || prev.postal_code
          }))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user?.id])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!user?.id) {
      addToast('User not authenticated', 'error')
      return
    }

    if (!formData.name || !formData.phone || !formData.street_address || !formData.city || !formData.state || !formData.postal_code) {
      addToast('Please fill all required fields', 'error')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
          , Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      addToast('Profile completed! You can now shop.', 'success')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <section className="section-padding bg-light">
      <div className="container-custom max-w-40rem">
        <div className="card border-0 shadow-sm p-5">
          <div className="text-center mb-4">
            <h1 className="h-lg fw-bold">Complete Your Profile</h1>
            <p className="text-medium">Add your contact info and billing address to get started</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Contact Information Section */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-3">Contact Information</h5>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="your@email.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
                <small className="text-muted d-block mt-2">Email cannot be changed</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+234 8012345678"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="mb-4">
              <h5 className="fw-semibold mb-3">Billing Address</h5>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Street Address *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123 Main Street"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">City *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="stateSelect" className="form-label fw-semibold">State *</label>
                <select
                  id="stateSelect"
                  className="form-control"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a state</option>
                  {NIGERIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Postal Code *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123456"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 mb-3"
              disabled={isLoading}
            >
              {isLoading ? 'Saving Profile...' : 'Complete Profile & Continue'}
            </button>

            <button 
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
