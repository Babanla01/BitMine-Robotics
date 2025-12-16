import { useState } from 'react';
import { User, Mail, Phone, Calendar, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  courseType: string;
  level: string;
  specialRequests: string;
}

// Course duration mapping
const courseDurations: { [key: string]: string } = {
  'Scratch Basic': '8 weeks',
  'Scratch Master': '8 weeks',
  'Pictoblox & Robotics Series 1': '8 weeks',
  'Pictoblox & Robotics Series 2': '8 weeks',
  'Pictoblox & Robotics Series 3': '8 weeks',
  'Robotics and Coding': '8 weeks',
  'Robotics Engineering': '12 weeks',
  'Robotics Tutoring': '12 weeks',
  'AI & Machine Learning': '8 weeks',
  'AI Automation': '8 weeks',
  'Python': '8 weeks'
};

export default function BookClassPage() {
  const navigate = useNavigate();
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    fullName: '',
    email: '',
    phone: '',
    courseType: '',
    level: '',
    specialRequests: ''
  });
  const [bookingIsSubmitting, setBookingIsSubmitting] = useState(false);
  const [bookingSubmitSuccess, setBookingSubmitSuccess] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState('');

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingIsSubmitting(true);
    setBookingSubmitError('');

    try {
      // Validate required fields
      if (!bookingFormData.fullName || !bookingFormData.email || !bookingFormData.phone || 
          !bookingFormData.courseType || !bookingFormData.level) {
        setBookingSubmitError('Please fill in all required fields');
        setBookingIsSubmitting(false);
        return;
      }

      // Get duration based on course type
      const duration = courseDurations[bookingFormData.courseType];

      // Submit booking to backend
      const bookingResponse = await fetch('http://localhost:5001/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: bookingFormData.fullName,
          email: bookingFormData.email,
          phone: bookingFormData.phone,
          courseType: bookingFormData.courseType,
          level: bookingFormData.level,
          duration: duration,
          specialRequests: bookingFormData.specialRequests
        })
      });

      if (!bookingResponse.ok) {
        const errorText = await bookingResponse.text();
        throw new Error(`Booking submission failed: ${errorText}`);
      }

      // Send confirmation email
      const serviceId = 'service_cmkqtih';
      const templateId = 'template_2siqp69';
      const publicKey = 'DIAu_wU0XjhTN9yc8';

      const templateParams = {
        from_name: bookingFormData.fullName,
        from_email: bookingFormData.email,
        subject: `Class Booking Confirmation - ${bookingFormData.courseType}`,
        message: `
          Course: ${bookingFormData.courseType}
          Level: ${bookingFormData.level}
          Duration: ${duration}
          Special Requests: ${bookingFormData.specialRequests || 'None'}
        `,
        to_email: 'bitmineroboticscw@gmail.com'
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setBookingSubmitSuccess(true);
      setBookingFormData({
        fullName: '',
        email: '',
        phone: '',
        courseType: '',
        level: '',
        specialRequests: ''
      });

      setTimeout(() => {
        navigate('/tutor');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setBookingSubmitError(`Failed to submit booking: ${errorMessage}`);
    } finally {
      setBookingIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5 py-md-8">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Header */}
            <div className="mb-5">
              <button 
                onClick={() => navigate('/tutor')}
                className="btn btn-outline-primary btn-sm mb-4"
              >
                ← Back to Tutoring
              </button>
              <div className="text-center">
                <h1 className="h1 fw-bold text-dark mb-3 concertOne">Book a Class</h1>
                <p className="text-muted fs-5">Fill out the form below to book your class with our expert tutors</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-4 p-4 p-lg-5 shadow-lg">
              <form onSubmit={handleBookingSubmit}>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-12">
                    <label htmlFor="bookingFullName" className="form-label fw-medium">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <User size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="bookingFullName"
                        name="fullName"
                        value={bookingFormData.fullName}
                        onChange={handleBookingFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="bookingEmail" className="form-label fw-medium">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Mail size={20} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="bookingEmail"
                        name="email"
                        value={bookingFormData.email}
                        onChange={handleBookingFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="bookingPhone" className="form-label fw-medium">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Phone size={20} className="text-muted" />
                      </span>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        id="bookingPhone"
                        name="phone"
                        value={bookingFormData.phone}
                        onChange={handleBookingFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Course Type */}
                  <div className="col-12">
                    <label htmlFor="courseType" className="form-label fw-medium">
                      Course Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="courseType"
                      name="courseType"
                      value={bookingFormData.courseType}
                      onChange={handleBookingFormChange}
                      required
                    >
                      <option value="">Select a course</option>
                      <option value="Scratch Basic">Scratch Basic</option>
                      <option value="Scratch Master">Scratch Master</option>
                      <option value="Pictoblox & Robotics Series 1">Pictoblox & Robotics Series 1</option>
                      <option value="Pictoblox & Robotics Series 2">Pictoblox & Robotics Series 2</option>
                      <option value="Pictoblox & Robotics Series 3">Pictoblox & Robotics Series 3</option>
                      <option value="Robotics and Coding">Robotics and Coding</option>
                      <option value="Robotics Engineering">Robotics Engineering</option>
                      <option value="Robotics Tutoring">Robotics Tutoring</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="AI Automation">AI Automation</option>
                      <option value="Python">Python</option>
                    </select>
                  </div>

                  {/* Level */}
                  <div className="col-12">
                    <label htmlFor="level" className="form-label fw-medium">
                      Preferred Level <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="level"
                      name="level"
                      value={bookingFormData.level}
                      onChange={handleBookingFormChange}
                      required
                    >
                      <option value="">Select a level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Duration Display */}
                  {bookingFormData.courseType && (
                    <div className="col-12">
                      <div className="alert alert-info d-flex align-items-center gap-3" role="alert">
                        <div>
                          <strong>Course Duration:</strong> {courseDurations[bookingFormData.courseType]}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  <div className="col-12">
                    <label htmlFor="specialRequests" className="form-label fw-medium">
                      Special Requests (Optional)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                        <MessageSquare size={20} className="text-muted" />
                      </span>
                      <textarea
                        className="form-control form-control-lg"
                        id="specialRequests"
                        name="specialRequests"
                        rows={3}
                        placeholder="Any special requests or preferences?"
                        value={bookingFormData.specialRequests}
                        onChange={handleBookingFormChange}
                      />
                    </div>
                  </div>

                  {/* Success/Error Messages */}
                  {bookingSubmitSuccess && (
                    <div className="col-12">
                      <div className="alert alert-success d-flex align-items-center gap-3" role="alert">
                        <CheckCircle size={24} />
                        <div>
                          <strong>Success!</strong> Your class booking has been submitted. We'll confirm your booking soon. Redirecting...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {bookingSubmitError && (
                    <div className="col-12">
                      <div className="alert alert-danger d-flex align-items-center gap-3" role="alert">
                        <div>
                          <strong>Error:</strong> {bookingSubmitError}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)' }}
                      disabled={bookingIsSubmitting}
                    >
                      {bookingIsSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Booking...
                        </>
                      ) : 'Book Class'}
                    </button>
                  </div>

                  {/* Back Button */}
                  <div className="col-12">
                    <button
                      type="button"
                      onClick={() => navigate('/tutor')}
                      className="btn btn-outline-secondary btn-lg w-100 py-3 fw-semibold"
                    >
                      Back to Tutoring
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
