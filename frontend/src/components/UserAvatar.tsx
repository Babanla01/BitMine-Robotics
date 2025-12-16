import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LogOut, Settings, ShoppingBag } from 'lucide-react'

export default function UserAvatar() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    addToast('Signed out successfully', 'info')
    setIsOpen(false)
    navigate('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
        style={{
          width: '40px',
          height: '40px',
          fontSize: '14px',
          fontWeight: 'bold',
          backgroundColor: '#e9ecef',
          border: '2px solid #dee2e6',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={() => setIsOpen(!isOpen)}
        title={user.name}
      >
        {getInitials(user.name)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="dropdown-menu show position-absolute end-0 mt-2"
          style={{
            minWidth: '250px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            top: '100%',
          }}
        >
          {/* User Info */}
          <div className="px-3 py-3 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#e9ecef',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(user.name)}
              </div>
              <div>
                <div className="fw-semibold" style={{ fontSize: '14px' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: 'none', color: '#000' }}
            >
              <Settings size={16} />
              <span>Edit Profile</span>
            </Link>

            <Link
              to="/orders"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: 'none', color: '#000' }}
            >
              <ShoppingBag size={16} />
              <span>My Orders</span>
            </Link>

            <button
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 w-100 text-start border-0 bg-transparent"
              onClick={handleLogout}
              style={{ color: '#d32f2f', cursor: 'pointer' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
