import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import emailjs from '@emailjs/browser'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// Initialize EmailJS with your public key
const EMAILJS_SERVICE_ID = 'service_cmkqtih';
const EMAILJS_TEMPLATE_ID = 'template_2siqp69';
const EMAILJS_PUBLIC_KEY = 'DIAu_wU0XjhTN9yc8';

export default function ContactPage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  useEffect(() => {
    // Initialize EmailJS with your public key
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      // Send the email using EmailJS
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message,
        to_email: 'bitmineroboticscw@gmail.com' // Your Gmail address
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitSuccess(true);
      reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitError('Failed to send message. Please try again later.');
      
      // Hide error message after 5 seconds
      setTimeout(() => setSubmitError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace '234YOURWHATSAPPNUMBER' with your actual WhatsApp number including country code (without + or 00)
  // Example: '2348123456789' for a Nigerian number
  // const whatsappNumber = '09079682962'; // Replace with your WhatsApp number
  // const whatsappMessage = 'Hello%20BitMine%20Robotics%2C%20I%20would%20like%20to%20get%20in%20touch';
  // const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const phoneNumber = '2349039404716'; // Your WhatsApp number without the '+' sign
  const message = 'Hello, I have a question about BitMine Robotics';
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-light">
      {/* Header Section */}
      <section className="bg-white border-bottom py-5 py-lg-8">
        <div className="container">
          <div className="row align-items-center">
            {/* Text Content - Takes full width on mobile, half on larger screens */}
            <div className="col-12 col-lg-6 order-2 order-lg-1 py-4 py-lg-0">
              <div className="pe-lg-5">
                <h1 className="display-4 fw-bold text-dark mb-4 concertOne">Get In Touch</h1>
                <p className="fs-5 text-muted mb-0">
                  We'd love to hear from you! Whether you have questions about our robotics programs, 
                  want to schedule a demo, or just want to say hello, our team at BitMine Robotics & 
                  Codeworld is here to help.
                </p>
              </div>
            </div>
            
            {/* Image Content - Takes full width on mobile, half on larger screens */}
            <div className="col-12 col-lg-6 order-1 order-lg-2">
              <div className="text-center">
                <img 
                  src="/assets/Hero-Bg.png" 
                  alt="BitMine Robotics Team" 
                  className="img-fluid rounded-4 shadow-lg"
                  style={{
                    maxHeight: 'min(400px, 50vh)',
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Contact Form Section */}
      <section className="py-5 py-md-8 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold text-dark mb-3 concertOne">Get in Touch</h2>
            <p className="text-medium fs-5">Let's discuss your next project</p>
          </div>

          <div className="row g-4 mb-5">
            {/* Address Card */}
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-2">Our Address</h5>
                    <p className="text-muted mb-0">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                    <Phone size={24} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-2">Phone Number</h5>
                    <p className="text-muted mb-0">+234 903 9404 716</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100 p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                    <Mail size={24} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-2">Email Address</h5>
                    <p className="text-muted mb-0">bitmineroboticscw@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Contact Section */}
          <div className="concertOne d-flex justify-content-center mb-5">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-lg px-5 d-inline-flex align-items-center justify-content-center">
              <FaWhatsapp className="me-3" size={30} />
              Ask more on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="bg-white rounded-3 p-3 py-5 p-lg-5 shadow-lg">
                {submitSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-3 mb-4" role="alert">
                    <CheckCircle size={24} />
                    <div>
                      <strong>Success!</strong> Your message has been sent. We'll get back to you soon.
                    </div>
                  </div>
                )}
                
                {submitError && (
                  <div className="alert alert-danger d-flex align-items-center gap-3 mb-4" role="alert">
                    <div>
                      <strong>Error:</strong> {submitError}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row g-3">
                    {/* Name Field */}
                    <div className="col-12">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        placeholder="Your Name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
                    </div>

                    {/* Email Field */}
                    <div className="col-12">
                      <input
                        type="email"
                        className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        placeholder="Your Email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                    </div>

                    {/* Subject Field */}
                    <div className="col-12">
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.subject ? 'is-invalid' : ''}`}
                        id="subject"
                        placeholder="Subject"
                        {...register('subject', { required: 'Subject is required' })}
                      />
                      {errors.subject && <div className="invalid-feedback d-block">{errors.subject.message}</div>}
                    </div>

                    {/* Message Field */}
                    <div className="col-12">
                      <textarea
                        className={`form-control form-control-lg ${errors.message ? 'is-invalid' : ''}`}
                        id="message"
                        rows={4}
                        placeholder="Your Message"
                        {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message must be at least 10 characters' } })}
                      ></textarea>
                      {errors.message && <div className="invalid-feedback d-block">{errors.message.message}</div>}
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 d-flex justify-content-center">
                      <button 
                        type="submit" 
                        className="btn btn-lg px-5 text-white fw-semibold d-flex align-items-center gap-2" 
                        style={{ background: '#0066FF' }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Contact Section */}
      {/* <section className="py-5 py-md-8">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-lg p-5 rounded-4 text-center" style={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
              }}>
                <div className="d-flex flex-column align-items-center gap-3 mb-4">
                  <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                    <MessageCircle size={40} className="text-white" />
                  </div>
                  <div>
                    <h3 className="h3 fw-bold text-white mb-2 concertOne">Quick Support</h3>
                    <p className="text-white mb-0">Chat with us on WhatsApp</p>
                  </div>
                </div>
                <p className="text-white fs-5 mb-4">
                  Need instant support? Reach out to our customer support team directly on WhatsApp for quick responses and assistance.
                </p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-lg px-5 d-flex justify-content-center align-items-center gap-2 ">
                  <MessageCircle size={20} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section> */}

           {/* Locations Section */}
      <section className="py-5 py-md-8">
        <div className="container">
          <div className="mb-5">
            <h2 className="h2 fw-bold text-dark mb-2 concertOne">Our Location</h2>
            <p className="text-medium fs-5">Visit us at our physical location in Lagos, Nigeria</p>
          </div>
          
          <div className="row g-4">
            <div className="col-12">
              <div className="rounded-lg overflow-hidden shadow" style={{ height: '400px' }}>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.6845621437!2d3.3711!3d6.5244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f6b8b8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1234567890"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="BitMine Robotics Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5 py-md-8 bg-white">
        <div className="container">
          <div className="mb-5">
            <h2 className="h2 fw-bold text-dark mb-2 concertOne">Frequently Asked Questions</h2>
            <p className="text-medium fs-5">Can't find what you're looking for?</p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">What are your operating hours?</h5>
                <p className="text-medium mb-0">We're open Monday to Friday from 9:00 AM to 6:00 PM, and Saturday from 10:00 AM to 4:00 PM. We're closed on Sundays.</p>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">How long does it take to respond?</h5>
                <p className="text-medium mb-0">We aim to respond to all inquiries within 24 business hours. For urgent matters, please call us directly.</p>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">Do you offer custom training programs?</h5>
                <p className="text-medium mb-0">Yes! We offer customized robotics training programs for schools, organizations, and corporate teams. Contact us for more details.</p>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">Can I visit your facility?</h5>
                <p className="text-medium mb-0">Absolutely! We welcome visits by appointment. Please contact us to schedule a tour of our robotics lab and facilities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


       
    </div>
  )
}
