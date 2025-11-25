import { useState } from 'react';
import { Building2, User, Mail, Phone, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function PartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    partnershipType: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceId = 'service_c4xxg3q';
      const templateId = 'template_partnership'; // You'll need to create this in EmailJS
      const publicKey = 'DIAu_wU0XjhTN9yc8';

      const templateParams = {
        from_name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        partnership_type: formData.partnershipType,
        message: formData.message,
        to_email: 'partnerships@bitminerobotics.com' // Your partnership email
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      setSubmitSuccess(true);
      setSubmitError('');

      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        partnershipType: '',
        message: ''
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitError('Failed to submit partnership request. Please try again later.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-lg-5 p-3">
                <div className="text-center mb-5">
                  <h2 className="h2 fw-bold mb-3">Become a Partner</h2>
                  <p className="text-muted">Fill out the form below to explore partnership opportunities with BitMine Robotics</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Name */}
                    <div className="col-12">
                      <label htmlFor="name" className="form-label fw-medium">
                        Your Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <User size={20} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div className="col-12">
                      <label htmlFor="company" className="form-label fw-medium">
                        Company/Organization <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <Building2 size={20} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="company"
                          name="company"
                          value={formData.company}
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
                        Phone Number
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
                        />
                      </div>
                    </div>

                    {/* Partnership Type */}
                    <div className="col-12">
                      <label htmlFor="partnershipType" className="form-label fw-medium">
                        Type of Partnership <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <Briefcase size={20} className="text-muted" />
                        </span>
                        <select
                          className="form-select form-select-lg"
                          id="partnershipType"
                          name="partnershipType"
                          value={formData.partnershipType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select partnership type</option>
                          <option value="education">Education Institution</option>
                          <option value="corporate">Corporate Partnership</option>
                          <option value="community">Community Organization</option>
                          <option value="technology">Technology Partner</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label htmlFor="message" className="form-label fw-medium">
                        How can we collaborate? <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                          <MessageSquare size={20} className="text-muted" />
                        </span>
                        <textarea
                          className="form-control form-control-lg"
                          id="message"
                          name="message"
                          rows={5}
                          placeholder="Tell us about your organization and how you'd like to partner with us..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                    </div>

                    {/* Success/Error Messages */}
                    {submitSuccess && (
                      <div className="col-12">
                        <div className="alert alert-success d-flex align-items-center gap-3" role="alert">
                          <CheckCircle size={24} />
                          <div>
                            <strong>Thank you!</strong> Your partnership request has been submitted. We'll get back to you soon.
                          </div>
                        </div>
                      </div>
                    )}

                    {submitError && (
                      <div className="col-12">
                        <div className="alert alert-danger d-flex align-items-center gap-3" role="alert">
                          <div>
                            <strong>Error:</strong> {submitError}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="col-12 text-center mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg px-5"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Partnership Request'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
