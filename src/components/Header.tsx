import { Link } from 'react-router-dom'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useState, useContext } from 'react'
import logo from '../assets/Frame 20.png'
import { CartContext } from '../context/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state: cartState } = useContext(CartContext)

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
            <Link to="/" className="navbar-brand ms-lg-5">
              <img src={logo} alt="BitMine Robotics" className="header-logo" />
            </Link>

            <button
              className="navbar-toggler border-0"
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <div className="d-none d-md-block">
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
                <li className="nav-item">
                  <Link to="/login" className="btn btn-primary btn-lg fs-5 px-4 font-concert">
                    Get Started
                  </Link>
                </li>
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
              <li className="mb-3">
                <Link
                  to="/"
                  className="text-decoration-none text-dark fs-4 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              </li>
              <li className="mb-3">
                <Link
                  to="/about"
                  className="text-decoration-none text-dark fs-4 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  About
                </Link>
              </li>
              <li className="mb-3">
                <Link
                  to="/shop"
                  className="text-decoration-none text-dark fs-4 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Shop
                </Link>
              </li>
              <li className="mb-3">
                <Link
                  to="/contact"
                  className="text-decoration-none text-dark fs-4 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Contact
                </Link>
              </li>
              <li className="mb-3">
                <Link
                  to="/tutoring"
                  className="text-decoration-none text-dark fs-4 fw-medium d-block py-2"
                  onClick={toggleMenu}
                >
                  Tutoring
                </Link>
              </li>
            </ul>
          </div>

          {/* Footer Button */}
          <div className="p-4 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <Link to="/cart" className="btn btn-light px-3 position-relative me-3 cart-icon-btn" onClick={toggleMenu}>
                <ShoppingCart />
                {cartState.items.length > 0 && (
                  <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger cart-badge">
                    {cartState.items.reduce((total, item) => total + item.qty, 0)}
                  </span>
                )}
              </Link>
              <Link
                to="/login"
                className="btn btn-primary btn-lg w-100 fs-4 font-concert text-center"
                onClick={toggleMenu}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}