import { useState } from 'react';
import { User, Mail, Phone, GraduationCap, Briefcase, MessageSquare, FileText, Users } from 'lucide-react';

export default function TutorPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    skills: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You can add API call or other logic here
  };

  return (
    <div className="bg-light">
      {/* Hero Section */}
      {/* <section className="py-5 py-md-8" style={{ background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 text-center text-white">
              <h1 className="h-display fw-bold mb-4 concertOne">Become an Instructor</h1>
              <p className="fs-5 mb-4">
                Join our team of passionate educators and help shape the next generation of innovators in robotics and coding.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Application Form */}
      <section className="py-5 py-md-8">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-body p-5">
                  <div className="text-center mb-5">
                    <h2 className="h2 fw-bold mb-3 concertOne">Become an Instructor</h2>
                    <p className="text-muted">Fill out the form below to apply as an instructor</p>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* Full Name */}
                      <div className="col-12">
                        <label htmlFor="fullName" className="form-label fw-medium">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <User size={20} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-12 col-md-6">
                        <label htmlFor="email" className="form-label fw-medium">
                          Email <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Mail size={20} className="text-muted" />
                          </span>
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="col-12 col-md-6">
                        <label htmlFor="phone" className="form-label fw-medium">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Phone size={20} className="text-muted" />
                          </span>
                          <input
                            type="tel"
                            className="form-control form-control-lg"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Education */}
                      <div className="col-12">
                        <label htmlFor="education" className="form-label fw-medium">
                          Education Background <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <GraduationCap size={20} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="education"
                            name="education"
                            placeholder="e.g., B.Sc. in Computer Science"
                            value={formData.education}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="col-12">
                        <label htmlFor="experience" className="form-label fw-medium">
                          Teaching/Tutoring Experience <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                            <Briefcase size={20} className="text-muted" />
                          </span>
                          <textarea
                            className="form-control form-control-lg"
                            id="experience"
                            name="experience"
                            rows={3}
                            placeholder="Please describe your teaching or tutoring experience"
                            value={formData.experience}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="col-12">
                        <label htmlFor="skills" className="form-label fw-medium">
                          Technical Skills <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FileText size={20} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="skills"
                            name="skills"
                            placeholder="e.g., Python, JavaScript, Robotics, Web Development"
                            value={formData.skills}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-text">Please list your technical skills separated by commas</div>
                      </div>

                      {/* Additional Message */}
                      <div className="col-12">
                        <label htmlFor="message" className="form-label fw-medium">
                          Why do you want to join as an instructor? <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                            <MessageSquare size={20} className="text-muted" />
                          </span>
                          <textarea
                            className="form-control form-control-lg"
                            id="message"
                            name="message"
                            rows={4}
                            placeholder="Tell us why you'd be a great fit for our team"
                            value={formData.message}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="col-12 mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                          style={{ background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%' }}
                        >
                          Submit Application
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      {/* <section className="py-5 py-md-8" style={{ background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%' }}>
        <div className="container">
          <div className="text-center text-white mb-5">
            <h2 className="h2 fw-bold mb-3 concertOne">Why Join Our Team?</h2>
            <p className="fs-5">Be part of an innovative educational community</p>
          </div>
          
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 bg-white bg-opacity-10 text-white p-4 rounded-4">
                <div className="card-body text-center">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)' }}>
                    <Users size={28} className="text-white" />
                  </div>
                  <h5 className="fw-bold mb-3">Impact Lives</h5>
                  <p className="mb-0">Inspire and mentor the next generation of tech innovators and problem solvers.</p>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 bg-white bg-opacity-10 text-white p-4 rounded-4">
                <div className="card-body text-center">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)' }}>
                    <Briefcase size={28} className="text-white" />
                  </div>
                  <h5 className="fw-bold mb-3">Flexible Hours</h5>
                  <p className="mb-0">Choose teaching hours that fit your schedule and availability.</p>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 bg-white bg-opacity-10 text-white p-4 rounded-4">
                <div className="card-body text-center">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)' }}>
                    <GraduationCap size={28} className="text-white" />
                  </div>
                  <h5 className="fw-bold mb-3">Professional Growth</h5>
                  <p className="mb-0">Access to training and development resources to enhance your teaching skills.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
