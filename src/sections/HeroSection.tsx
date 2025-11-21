import { Bot, Cpu, Zap, Code, } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="hero-bg position-relative d-flex align-items-center border-none rounded-4 bg-gradient-soft-primary-secondary m-3">
      {/* Animated Background Elements */}
      <div className="position-absolute hero-element top-0 start-0 w-100 h-100 overflow-hidden">
        <div className="position-absolute hero-bot-element">
          <Bot size={64} color="#ffff9999" className="animate-float" />
        </div>
        <div className="position-absolute  hero-cpu-element">
          <Cpu size={48} color="#FF6600cc" className="animate-float" />
        </div>
        <div className="position-absolute  hero-zap-element">
          <Zap size={56} color="#00CC66cc" className="animate-float" />
        </div>
        <div className="position-absolute  hero-code-element">
          <Code size={48} color="#ffffffe6" className="animate-float" />
        </div>

        {/* Floating Geometric Shapes */}
        <div className="position-absolute rounded-circle animate-pulse-slow" style={{ top: '25%', left: '25%', width: 16, height: 16, backgroundColor: '#0066FF1A' }}></div>
        <div className="position-absolute animate-pulse-slow delay-1s" style={{ top: '33%', right: '33%', width: 24, height: 24, backgroundColor: '#FF66001A', transform: 'rotate(45deg)' }}></div>
        <div className="position-absolute rounded-circle animate-pulse-slow delay-2s" style={{ bottom: '33%', left: '33%', width: 20, height: 20, backgroundColor: '#00CC661A' }}></div>
      </div>

      <div className="container  hero-content">
        <div className="row g-4 align-items-center">
          {/* Left Content */}
          <div className="col-12  col-md-10 col-xl-9">
            <div className="d-flex flex-column gap-4">
              <div className="d-flex flex-column gap-3 section-content">
                <h1 className="h-display">
                  Unleash Your Creativity with Robotics  and Coding
                </h1>
                <p className="text-lead">
                  Explore our exciting range of robotics kits and coding classes designed for all ages. <br /> Join us to ignite your passion for technology and innovation!
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-3 concertOne">
                <Link to="/shop" className="btn btn-primary btn-lg fs-4 px-4 d-inline-flex align-items-center justify-content-center">
                  Shop Now
                </Link>
                <Link to="/contact" className="btn border-light text-light border-3 btn-lg fs-4 px-4 d-inline-flex align-items-center justify-content-center">
                  Book a Class
                </Link>
              </div>

            </div>
          </div>

          {/* Right Content - Hero Image/Animation */}

        </div>
      </div>
    </section>
  )
}
