import { Link } from 'react-router-dom'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useState, useContext } from 'react'
import { useAuth } from '../context/AuthContext'
import UserAvatar from './UserAvatar'
import logo from '../assets/Frame 20.png'
import { CartContext } from '../context/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state: cartState } = useContext(CartContext)
  const { isAuthenticated, user, isAdmin } = useAuth()

  const toggleMenu = () => {
    // Toggle body class to prevent scrolling when menu is open
    if (!isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <>
      <header className="bg-white sticky-top">
        <div className="container">
          <nav className="navbar navbar-expand-md py-2 py-md-3 d-flex justify-content-between align-items-center">
            <Link to="/" className="navbar-brand ms-lg-1">
              <img src={logo} alt="BitMine Robotics" className="header-logo" />
            </Link>

            <div className="d-flex align-items-center gap-1 d-md-none">
              {/* Mobile Cart Icon */}
              <Link
                to="/cart"
                className="position-relative d-flex align-items-center text-decoration-none"
              >
                <div className="position-relative d-flex align-items-center p-1 rounded" style={{ backgroundColor: '#f0f4ff' }}>
                  <svg
                    className="text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: '20px', height: '20px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {cartState.items.length > 0 && (
                    <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                      {cartState.items.reduce((total, item) => total + item.qty, 0)}
                    </span>
                  )}
                </div>
              </Link>

              {/* Hamburger Button */}
              <button
                className="navbar-toggler border-0"
                type="button"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="d-none d-md-block me-4">
              <ul className="navbar-nav d-flex align-items-center gap-4">
                <li className="nav-item">
                  <Link to="/" className="nav-link fs-5 fw-medium">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/about" className="nav-link fs-5 fw-medium">
                    About
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/shop" className="nav-link fs-5 fw-medium">
                    Shop
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/contact" className="nav-link fs-5 fw-medium">
                    Contact
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/tutoring" className="nav-link fs-5 fw-medium">
                    Tutoring
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/partner" className="nav-link fs-5 fw-medium">
                    Partner
                  </Link>
                </li>
                <li className="nav-item position-relative d-flex align-items-center me-2">
                  <Link to="/cart" className="btn btn-light px-3 position-relative cart-icon-btn">
                    <ShoppingCart />
                    {cartState.items.length > 0 && (
                      <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger cart-badge">
                        {cartState.items.reduce((total, item) => total + item.qty, 0)}
                      </span>
                    )}
                  </Link>
                </li>
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <li className="nav-item">
                        <Link to="/dashboard" className="nav-link fs-5 fw-medium">
                          Dashboard
                        </Link>
                      </li>
                    )}
                    <li className="nav-item d-flex align-items-center ms-5">
                      <UserAvatar />
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link to="/login" className="btn btn-primary btn-lg fs-5 px-4 font-concert">
                      Get Started
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Side Navigation Overlay */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 overlay-z-1040 transition-all ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={toggleMenu}
        style={{ transition: 'opacity 0.3s ease-in-out' }}
      ></div>

      {/* Mobile Side Navigation */}
      <div
        className={`position-fixed top-0 end-0 h-100 bg-white shadow-lg transition-all ${isMenuOpen ? 'drawer-open' : 'drawer-closed'}`}
      >
        <div className="d-flex flex-column h-100">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <img src={logo} alt="BitMine Robotics" className="drawer-logo" />
            <button
              className="btn btn-link p-0"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-grow-1 p-4">
              <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/"
                  className="text-decoration-none text-dark fs-5 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-decoration-none text-dark fs-5 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  About
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/shop"
                  className="text-decoration-none text-dark fs-5 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Shop
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/contact"
                  className="text-decoration-none text-dark fs-5 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Contact
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/tutoring"
                  className="text-decoration-none text-dark fs-5 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Tutoring
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/partner"
                  className="text-decoration-none text-dark fs-5 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Partner With Us
                </Link>
              </li>
              {isAuthenticated && (
                <li className="mb-2">
                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      className="text-decoration-none text-dark fs-5 fw-medium d-block py-2"
                      onClick={toggleMenu}
                    >
                      Dashboard
                    </Link>
                  )}
                </li>
              )}
            </ul>
          </div>

          {/* Footer Button */}
          <div className="p-4 border-top">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <UserAvatar />
                <div>
                  <div className="fw-semibold">{user?.name}</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>{user?.email}</div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary btn-lg w-100 fs-4 font-concert text-center"
                onClick={toggleMenu}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}