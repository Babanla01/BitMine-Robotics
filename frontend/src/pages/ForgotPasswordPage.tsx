import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { API_BASE_URL } from '../config/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 1: Request OTP
  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      addToast('OTP sent to your email address. Check your inbox and spam folder.', 'success')
      setStep('otp')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to send OTP', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP and Reset Password
  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }

    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      addToast('Password reset successfully! Redirecting to login...', 'success')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to reset password', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="section-padding bg-light">
      <div className="container-custom max-w-40rem">
        <div className="card border-0 shadow-sm p-5">
          <div className="text-center mb-5">
            <h1 className="h-lg fw-bold">Reset Your Password</h1>
            <p className="text-medium text-muted">
              {step === 'email'
                ? 'Enter your email to receive an OTP'
                : 'Enter the OTP and your new password'}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div className="text-center">
                <p className="text-medium mb-0">
                  Remember your password?{' '}
                  <Link to="/login" className="fw-semibold text-primary">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold">OTP</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  inputMode="numeric"
                />
                <small className="text-muted">6-digit code sent to {email}</small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{ paddingRight: '3rem' }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword(s => !s)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
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
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.27-3.11-11-7.5C2.73 8.11 6.95 5 12 5c2.04 0 3.94.5 5.65 1.36"/><path d="M1 1l22 22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <small className="text-muted">Minimum 8 characters</small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{ paddingRight: '3rem' }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(s => !s)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.05 0-9.27-3.11-11-7.5C2.73 8.11 6.95 5 12 5c2.04 0 3.94.5 5.65 1.36"/><path d="M1 1l22 22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={isLoading || !otp || !newPassword || !confirmPassword}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link text-primary p-0"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  disabled={isLoading}
                >
                  Didn't receive OTP? Try again
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
