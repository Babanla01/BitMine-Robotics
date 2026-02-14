import { Clock, Users, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useRef } from 'react';

export default function TutorPage() {
  const bookClassRef = useRef<HTMLDivElement | null>(null);
  const becomeATutorRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section className="hero-bg tutor-bg position-relative d-flex align-items-center border-none rounded-4 bg-gradient-soft-primary-secondary m-3">
        <div className="position-absolute hero-element top-0 start-0 w-100 h-100 overflow-hidden">
          <div className="position-absolute hero-bot-element">
            <GraduationCap size={64} color="#ffff9999" className="animate-float" />
          </div>
          <div className="position-absolute hero-cpu-element">
            <Users size={48} color="#FF6600cc" className="animate-float" />
          </div>
          <div className="position-absolute hero-zap-element">
            <Zap size={56} color="#00CC66cc" className="animate-float" />
          </div>
          <div className="position-absolute hero-code-element">
            <Award size={48} color="#ffffffe6" className="animate-float" />
          </div>

          <div className="position-absolute rounded-circle animate-pulse-slow" style={{ top: '25%', left: '25%', width: 16, height: 16, backgroundColor: '#0066FF1A' }}></div>
          <div className="position-absolute animate-pulse-slow delay-1s" style={{ top: '33%', right: '33%', width: 24, height: 24, backgroundColor: '#FF66001A', transform: 'rotate(45deg)' }}></div>
          <div className="position-absolute rounded-circle animate-pulse-slow delay-2s" style={{ bottom: '33%', left: '33%', width: 20, height: 20, backgroundColor: '#00CC661A' }}></div>
        </div>

        <div className="container hero-content">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-10 col-xl-9">
              <div className="d-flex flex-column gap-4">
                <div className="d-flex flex-column gap-3 section-content">
                  <h1 className="h-display">
                    Join Our Community of Expert Tutors & Learners
                  </h1>
                  <p className="text-lead">
                    Become an instructor and inspire the next generation, or book a class with our expert tutors. <br /> Explore robotics, coding, and STEM education tailored to your needs.
                  </p>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 concertOne">
                  <button 
                    onClick={() => scrollToSection(becomeATutorRef)}
                    className="btn btn-primary btn-lg fs-4 px-4 d-inline-flex align-items-center justify-content-center"
                  >
                    Become a Tutor
                  </button>
                  <button 
                    onClick={() => scrollToSection(bookClassRef)}
                    className="btn border-light text-light border-3 btn-lg fs-4 px-4 d-inline-flex align-items-center justify-content-center"
                  >
                    Book a Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book a Class Section - PRIMARY FOCUS */}
      <section ref={bookClassRef} className="section-padding bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="h1 fw-bold text-dark mb-3 concertOne" style={{ fontSize: '2.5rem' }}>Learn from Expert Tutors</h1>
            <p className="text-muted fs-5">Choose from our diverse range of classes and start your learning journey today</p>
          </div>

          <div className="row g-4 mb-5">
            {/* Class Type 1 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-lg p-4 rounded-4" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '60px', height: '60px', background: '#0066FF1A' }}>
                  <GraduationCap size={28} className="text-primary" />
                </div>
                <h5 className="fw-bold text-dark mb-2">Beginner Robotics</h5>
                <p className="text-muted small mb-3">Perfect for those just starting their robotics journey.</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary bg-opacity-10 text-primary">Beginner</span>
                  <span className="text-muted small">4-8 weeks</span>
                </div>
              </div>
            </div>

            {/* Class Type 2 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-lg p-4 rounded-4" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '60px', height: '60px', background: '#FF66001A' }}>
                  <Zap size={28} className="text-warning" />
                </div>
                <h5 className="fw-bold text-dark mb-2">Advanced Coding</h5>
                <p className="text-muted small mb-3">Master programming languages and advanced concepts.</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-warning bg-opacity-10 text-warning">Advanced</span>
                  <span className="text-muted small">8-12 weeks</span>
                </div>
              </div>
            </div>

            {/* Class Type 3 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-lg p-4 rounded-4" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '60px', height: '60px', background: '#00CC661A' }}>
                  <Award size={28} className="text-success" />
                </div>
                <h5 className="fw-bold text-dark mb-2">STEM Workshop</h5>
                <p className="text-muted small mb-3">Comprehensive STEM education combining multiple disciplines.</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-success bg-opacity-10 text-success">Intermediate</span>
                  <span className="text-muted small">6-10 weeks</span>
                </div>
              </div>
            </div>

            {/* Class Type 4 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-lg p-4 rounded-4" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '60px', height: '60px', background: '#6366F11A' }}>
                  <Users size={28} className="text-info" />
                </div>
                <h5 className="fw-bold text-dark mb-2">One-on-One Mentoring</h5>
                <p className="text-muted small mb-3">Personalized guidance tailored to your learning goals.</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-info bg-opacity-10 text-info">All Levels</span>
                  <span className="text-muted small">Flexible</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/book-class"
              className="btn btn-light btn-lg px-6 py-3 fw-semibold"
              style={{ fontSize: '1.1rem', color: '#0066FF' }}
            >
              Book Your Class Now
            </Link>
          </div>
        </div>
      </section>

      {/* Become a Tutor Section - SECONDARY */}
      <section ref={becomeATutorRef} className="section-padding bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold text-dark mb-3 concertOne">Why Become a Tutor with BitMine?</h2>
            <p className="text-muted fs-5">Join our community and make a real impact on students' lives</p>
          </div>

          <div className="row g-4 mb-5">
            {/* Benefit 1 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle mx-auto" style={{ width: '60px', height: '60px', background: '#0066FF1A' }}>
                  <Clock size={28} className="text-primary" />
                </div>
                <h5 className="fw-bold text-dark mb-3">Flexible Schedule</h5>
                <p className="text-muted mb-0">Choose teaching hours that fit your lifestyle and availability.</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle mx-auto" style={{ width: '60px', height: '60px', background: '#FF66001A' }}>
                  <Award size={28} className="text-warning" />
                </div>
                <h5 className="fw-bold text-dark mb-3">Competitive Compensation</h5>
                <p className="text-muted mb-0">Earn competitive rates for your expertise and experience.</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle mx-auto" style={{ width: '60px', height: '60px', background: '#00CC661A' }}>
                  <Zap size={28} className="text-success" />
                </div>
                <h5 className="fw-bold text-dark mb-3">Professional Growth</h5>
                <p className="text-muted mb-0">Access training and development resources to enhance your skills.</p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle mx-auto" style={{ width: '60px', height: '60px', background: '#6366F11A' }}>
                  <Users size={28} className="text-info" />
                </div>
                <h5 className="fw-bold text-dark mb-3">Impact Lives</h5>
                <p className="text-muted mb-0">Inspire and mentor the next generation of tech innovators.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/become-tutor"
              className="btn btn-outline-primary btn-lg px-5 py-3 fw-semibold"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
