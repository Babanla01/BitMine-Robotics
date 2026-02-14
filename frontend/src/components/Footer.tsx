import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../assets/Frame 20.png'
import { FaTiktok } from 'react-icons/fa6'

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          {/* Company Info */}
          <div className="col-12 col-md-6 col-lg-3">
            <img src={logo} alt="BitMine Robotics" style={{ height: '50px' }} className='mb-3' />
            <p className="text-white-50">
              Empowering the next generation of innovators through robotics education and hands-on learning experiences.
            </p>
            <div className="d-flex gap-3 mt-2">
              <a href="https://www.tiktok.com/@bitmineroboticscw" target="_blank" rel="noopener noreferrer" className="text-white-50 text-decoration-none hover-text-white" style={{ transition: 'color 0.2s' }}>
                <FaTiktok size={20} />
              </a>
              <a href="https://www.instagram.com/bitmineroboticscw/" target="_blank" rel="noopener noreferrer" className="text-white-50 text-decoration-none hover-text-white" style={{ transition: 'color 0.2s' }}>
                <Instagram size={20} />
              </a>
              <a href="https://x.com/bitminerobotics" target="_blank" rel="noopener noreferrer" className="text-white-50 text-decoration-none hover-text-white" style={{ transition: 'color 0.2s' }}>
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com/company/bitminerobotics" target="_blank" rel="noopener noreferrer" className="text-white-50 text-decoration-none hover-text-white" style={{ transition: 'color 0.2s' }}>
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-12 col-md-6 col-lg-3">
            <h3 className="h5 fw-semibold">Quick Links</h3>
            <ul className="list-unstyled mt-3">
              <li className="mb-2"><Link to="/" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Home</Link></li>
              <li className="mb-2"><Link to="/about" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Contact</Link></li>
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Robotics Kits</Link></li>
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Training Programs</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-12 col-md-6 col-lg-3">
            <h3 className="h5 fw-semibold">Our Services</h3>
            <ul className="list-unstyled mt-3">
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Kids Programs (6-12)</Link></li>
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Teen Programs (13-17)</Link></li>
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Adult Programs (18+)</Link></li>
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Corporate Training</Link></li>
              <li className="mb-2"><Link to="/contact" className="link-light link-underline-opacity-0 link-underline-opacity-50-hover">Instructor Certification</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-12 col-md-6 col-lg-3">
            <h3 className="h5 fw-semibold">Contact Info</h3>
            <div className="mt-3 text-white-50">
              <div className="d-flex align-items-center gap-2 mb-2">
                <MapPin size={18} color="#0d6efd" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Phone size={18} color="#0d6efd" />
                <a href="tel:+2349039404716" className="text-white-50 text-decoration-none">+234 903 940 4716</a>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={18} color="#0d6efd" />
                <a href="mailto:bitmineroboticscw@gmail.com" className="text-white-50 text-decoration-none">bitmineroboticscw@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-top border-secondary mt-4 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-white-50 small mb-2 mb-md-0">© {new Date().getFullYear()} BitMine Robotics. All rights reserved.</p>
          <div className="d-flex gap-4">
            <Link to="/about" className="text-white-50 small link-underline-opacity-0 link-underline-opacity-50-hover">Privacy Policy</Link>
            <Link to="/about" className="text-white-50 small link-underline-opacity-0 link-underline-opacity-50-hover">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
