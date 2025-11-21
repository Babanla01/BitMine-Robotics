import { Users, Target, Zap, Award, ArrowRight, Star, Instagram, Linkedin, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
  const navigate = useNavigate()
  return (
    <div>
      {/* Hero Section */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-lg-6 mb-5 mb-lg-0">
              <h1 className="h-display fw-bold mb-4 concertOne text-primary">About BitMine Robotics</h1>
              <p className="fs-5 mb-4 text-muted">
                We're on a mission to transform education through hands-on robotics and coding, empowering the next generation of innovators.
              </p>
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-primary btn-lg px-5 fw-semibold" 
                  onClick={() => document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg px-5 fw-semibold" 
                  onClick={() => navigate('/contact')}
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="rounded-4 overflow-hidden shadow-lg">
                <img 
                  src="/assets/About-Image-1.jpg" 
                  alt="BitMine Team" 
                  className="w-100 object-fit-cover"
                  style={{ height: '400px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      {/* <section className="py-5 py-md-8" style={{ background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <h2 className="h2 fw-bold text-white mb-3 concertOne">Join Us on Our Journey</h2>
              <p className="fs-5 text-white mb-4">
                Be part of a community transforming how students learn STEM through practical, engaging robotics education.
              </p>
              <button className="btn btn-light btn-lg px-5 fw-semibold">Get in Touch</button>
            </div>
          </div>
        </div>
      </section> */}

      {/* Our Story Section - Image + Text */}
      <section id="our-story" className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <div className="rounded-4 overflow-hidden shadow-lg" style={{ minHeight: '400px' }}>
                <img src="/assets/About-Image-2.jpg" alt="Our Story" className="w-100 h-100 object-fit-cover" />
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <h2 className="h2 fw-bold text-dark mb-4 concertOne">Our Story</h2>
              <p className="fs-5 text-medium mb-3">
                BitMine Robotics was founded with a simple belief: every student deserves access to quality STEM education that's engaging, practical, and fun.
              </p>
              <p className="fs-5 text-medium mb-3">
                We recognized a gap in the Nigerian education system. While technology is reshaping the world, many students had limited opportunities to explore robotics and coding in hands-on ways.
              </p>
              <p className="fs-5 text-medium">
                Today, we're proud to be at the forefront of educational transformation, equipping students and teachers with the tools, knowledge, and confidence to thrive in a tech-driven future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Target Section - Image + Grid */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <h2 className="h2 fw-bold text-primary mb-4 concertOne">Our Target</h2>
              <p className="fs-5 text-muted mb-4">
                We aim to reach thousands of students across Nigeria and beyond, making STEM education accessible, affordable, and inspiring.
              </p>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="card border-0 p-4 shadow-sm">
                    <div className="mb-2 text-primary">
                      <Zap size={28} />
                    </div>
                    <h6 className="fw-bold mb-1">Empower Students</h6>
                    <p className="text-muted small">10,000+ annually</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 p-4 shadow-sm">
                    <div className="mb-2 text-primary">
                      <Users size={28} />
                    </div>
                    <h6 className="fw-bold mb-1">Engage Schools</h6>
                    <p className="text-muted small">50+ partner schools</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 p-4 shadow-sm">
                    <div className="mb-2 text-primary">
                      <Award size={28} />
                    </div>
                    <h6 className="fw-bold mb-1">Train Teachers</h6>
                    <p className="text-muted small">500+ educators trained</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 p-4 shadow-sm">
                    <div className="mb-2 text-primary">
                      <Target size={28} />
                    </div>
                    <h6 className="fw-bold mb-1">National Reach</h6>
                    <p className="text-muted small">10+ states covered</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <img src="/assets/serviceShop-2.png" alt="Our Target" className="rounded-4 shadow-lg w-100" style={{ minHeight: '400px', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Success Stats Section - Image + Stats */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <img src="/assets/serviceTutor.png" alt="Success Stories" className="rounded-4 shadow-lg w-100" style={{ minHeight: '400px', objectFit: 'cover', display: 'block' }} />
            </div>
            <div className="col-12 col-lg-6">
              <h2 className="h2 fw-bold text-dark mb-4 concertOne">Our Proven Success Stories</h2>
              <p className="fs-5 text-medium mb-5">Measurable impact in education and innovation</p>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm p-4 text-center" style={{ background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)' }}>
                    <h3 className="h2 fw-bold text-white mb-1 concertOne">5,000+</h3>
                    <p className="text-white small">Students Trained</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm p-4 text-center" style={{ background: 'linear-gradient(135deg, #0052CC 0%, #003D99 100%)' }}>
                    <h3 className="h2 fw-bold text-white mb-1 concertOne">250+</h3>
                    <p className="text-white small">Teachers Equipped</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm p-4 text-center" style={{ background: 'linear-gradient(135deg, #003D99 0%, #002966 100%)' }}>
                    <h3 className="h2 fw-bold text-white mb-1 concertOne">50+</h3>
                    <p className="text-white small">Schools Partnered</p>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm p-4 text-center" style={{ background: 'linear-gradient(135deg, #0066FF 0%, #003D99 100%)' }}>
                    <h3 className="h2 fw-bold text-white mb-1 concertOne">15+</h3>
                    <p className="text-white small">Years Expertise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <h2 className="h2 fw-bold text-primary mb-4 concertOne">Our Core Values</h2>
              <p className="fs-5 text-muted mb-4">What drives us every day to make a difference</p>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                      <Zap size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Innovation</h6>
                      <p className="text-muted small mb-0">Constantly pushing boundaries in STEM education</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                      <Users size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Inclusivity</h6>
                      <p className="text-muted small mb-0">Making tech education accessible to all</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                      <Award size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Excellence</h6>
                      <p className="text-muted small mb-0">Striving for the highest standards in everything we do</p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex gap-3 align-items-start p-3 bg-light rounded-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                      <Heart size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Passion</h6>
                      <p className="text-muted small mb-0">Inspiring a love for learning and technology</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <img src="/assets/serviceEvent.png" alt="Our Values" className="rounded-4 shadow-lg w-100" style={{ minHeight: '400px', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Experts Section */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold text-dark mb-3 concertOne">Meet our experts</h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Discover the passionate team of innovators, strategists, and educators working tirelessly to help you achieve your goals
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Instructor 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 text-dark overflow-hidden" style={{ borderRadius: '20px', backgroundColor: '#E0F2FE' }}>
                <div style={{ height: '300px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                  <img src="/assets/About-Image-1.jpg" alt="Instructor 1" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="p-4">
                  <h5 className="fw-bold mb-1 text-dark">John Okafor</h5>
                  <p className="text-muted small mb-3">Lead Robotics Instructor</p>
                  <div className="d-flex gap-3">
                    <a href="#" className="text-muted" style={{ textDecoration: 'none' }}>
                      <Instagram size={18} />
                    </a>
                    <a href="#" className="text-muted" style={{ textDecoration: 'none' }}>
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 text-dark overflow-hidden" style={{ borderRadius: '20px', backgroundColor: '#E0F2FE' }}>
                <div style={{ height: '300px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                  <img src="/assets/About-Image-2.jpg" alt="Instructor 2" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="p-4">
                  <h5 className="fw-bold mb-1 text-dark">Chioma Adeyemi</h5>
                  <p className="text-muted small mb-3">Coding Specialist</p>
                  <div className="d-flex gap-3">
                    <a href="#" className="text-muted" style={{ textDecoration: 'none' }}>
                      <Instagram size={18} />
                    </a>
                    <a href="#" className="text-muted" style={{ textDecoration: 'none' }}>
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 text-dark overflow-hidden" style={{ borderRadius: '20px', backgroundColor: '#E0F2FE' }}>
                <div style={{ height: '300px', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                  <img src="/assets/serviceEvent.png" alt="Instructor 3" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="p-4">
                  <h5 className="fw-bold mb-1 text-dark">Emeka Nwosu</h5>
                  <p className="text-muted small mb-3">STEM Curriculum Developer</p>
                  <div className="d-flex gap-3">
                    <a href="#" className="text-muted" style={{ textDecoration: 'none' }}>
                      <Instagram size={18} />
                    </a>
                    <a href="#" className="text-muted" style={{ textDecoration: 'none' }}>
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-5">
              <div className="rounded-4 overflow-hidden shadow-lg">
                <img 
                  src="/assets/About-Image-1.jpg" 
                  alt="Founder" 
                  className="w-100" 
                  style={{ minHeight: '400px', objectFit: 'cover' }} 
                />
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <div className="bg-light p-4 p-md-5 rounded-4">
                <p className="fs-5 text-dark mb-4 lh-lg">
                  The success of any organization doesn't just come from its products or services; it comes from its people, their dedication, and their ability to build meaningful connections with customers. A great company starts with a great culture, one that prioritizes trust, relationships, and a shared vision for the future.
                </p>
                <div className="mt-5">
                  <h5 className="fw-bold text-primary mb-1">PrinceWill Ugo</h5>
                  <p className="text-muted small mb-3">Founder & CEO of BitMine Robotics</p>
                  <div className="d-flex gap-3">
                    <a href="#" className="text-primary" style={{ textDecoration: 'none' }}>
                      <Instagram size={20} />
                    </a>
                    <a href="#" className="text-primary" style={{ textDecoration: 'none' }}>
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <div className="card border-0 shadow-lg p-5 rounded-4" style={{ background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)' }}>
                <h2 className="h2 fw-bold text-white mb-3 concertOne">Ready to Transform Education?</h2>
                <p className="fs-5 text-white mb-4">
                  Join BitMine Robotics in our mission to empower the next generation of innovators.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button className="btn btn-light btn-lg px-5 fw-semibold d-flex align-items-center gap-2" onClick={() => navigate('/contact')}>
                    Get Started <ArrowRight size={20} />
                  </button>
                  <button className="btn btn-outline-light btn-lg px-5 fw-semibold" onClick={() => navigate('/contact')}>Contact Us</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
