import { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { User, Mail, Phone, GraduationCap, Briefcase, MessageSquare, FileText, CheckCircle, Upload } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';

interface TutorFormData {
  fullName: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  skills: string;
  message: string;
}

export default function BecomeATutorPage() {
  const navigate = useNavigate();
  const [tutorFormData, setTutorFormData] = useState<TutorFormData>({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    skills: '',
    message: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [tutorIsSubmitting, setTutorIsSubmitting] = useState(false);
  const [tutorSubmitSuccess, setTutorSubmitSuccess] = useState(false);
  const [tutorSubmitError, setTutorSubmitError] = useState('');

  const handleTutorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTutorFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setTutorSubmitError('Please upload a PDF or Word document');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setTutorSubmitError('File size must be less than 5MB');
        return;
      }
      setCvFile(file);
      setTutorSubmitError('');
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTutorIsSubmitting(true);
    setTutorSubmitError('');

    try {
      if (!cvFile) {
        setTutorSubmitError('Please upload your CV');
        setTutorIsSubmitting(false);
        return;
      }

      // Upload CV file
      const uploadFormData = new FormData();
      uploadFormData.append('file', cvFile);

      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: uploadFormData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const uploadedFile = await uploadResponse.json();

      // Submit tutor application
      const applicationResponse = await fetch(`${API_BASE_URL}/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: tutorFormData.fullName,
          email: tutorFormData.email,
          phone: tutorFormData.phone,
          education: tutorFormData.education,
          experience: tutorFormData.experience,
          skills: tutorFormData.skills,
          message: tutorFormData.message,
          cvFilename: uploadedFile.filename
        })
      });

      if (!applicationResponse.ok) {
        const errorText = await applicationResponse.text();
        throw new Error(`Application submission failed: ${errorText}`);
      }

      // Send confirmation email
      const serviceId = 'service_c4xxg3q';
      const templateId = 'template_aiqy5z9';
      const publicKey = 'DIAu_wU0XjhTN9yc8';

      const templateParams = {
        from_name: tutorFormData.fullName,
        from_email: tutorFormData.email,
        phone: tutorFormData.phone,
        education: tutorFormData.education,
        experience: tutorFormData.experience,
        skills: tutorFormData.skills,
        message: tutorFormData.message,
        cv_filename: cvFile.name,
        to_email: 'bitmineroboticscw@gmail.com'
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setTutorSubmitSuccess(true);
      setTutorFormData({
        fullName: '',
        email: '',
        phone: '',
        education: '',
        experience: '',
        skills: '',
        message: ''
      });
      setCvFile(null);

      const cvInput = document.getElementById('cv') as HTMLInputElement;
      if (cvInput) cvInput.value = '';

      setTimeout(() => {
        navigate('/tutor');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTutorSubmitError(`Failed to submit application: ${errorMessage}`);
    } finally {
      setTutorIsSubmitting(false);
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
                <h1 className="h1 fw-bold text-dark mb-3 concertOne">Become an Instructor</h1>
                <p className="text-muted fs-5">Fill out the form below to apply as an instructor with BitMine Robotics</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-4 p-4 p-lg-5 shadow-lg">
              <form onSubmit={handleTutorSubmit}>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-12">
                    <label htmlFor="tutorFullName" className="form-label fw-medium">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <User size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="tutorFullName"
                        name="fullName"
                        value={tutorFormData.fullName}
                        onChange={handleTutorFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="tutorEmail" className="form-label fw-medium">
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Mail size={20} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="tutorEmail"
                        name="email"
                        value={tutorFormData.email}
                        onChange={handleTutorFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="tutorPhone" className="form-label fw-medium">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Phone size={20} className="text-muted" />
                      </span>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        id="tutorPhone"
                        name="phone"
                        value={tutorFormData.phone}
                        onChange={handleTutorFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="col-12">
                    <label htmlFor="tutorEducation" className="form-label fw-medium">
                      Education Background <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <GraduationCap size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="tutorEducation"
                        name="education"
                        placeholder="e.g., B.Sc. in Computer Science"
                        value={tutorFormData.education}
                        onChange={handleTutorFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="col-12">
                    <label htmlFor="tutorExperience" className="form-label fw-medium">
                      Teaching/Tutoring Experience <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                        <Briefcase size={20} className="text-muted" />
                      </span>
                      <textarea
                        className="form-control form-control-lg"
                        id="tutorExperience"
                        name="experience"
                        rows={3}
                        placeholder="Please describe your teaching or tutoring experience"
                        value={tutorFormData.experience}
                        onChange={handleTutorFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="col-12">
                    <label htmlFor="tutorSkills" className="form-label fw-medium">
                      Technical Skills <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FileText size={20} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="tutorSkills"
                        name="skills"
                        placeholder="e.g., Python, JavaScript, Robotics, Web Development"
                        value={tutorFormData.skills}
                        onChange={handleTutorFormChange}
                        required
                      />
                    </div>
                    <div className="form-text">Please list your technical skills separated by commas</div>
                  </div>

                  {/* CV Upload */}
                  <div className="col-12">
                    <label htmlFor="cv" className="form-label fw-medium">
                      Upload Your CV <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Upload size={20} className="text-muted" />
                      </span>
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        id="cv"
                        name="cv"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                        required
                      />
                    </div>
                    <div className="form-text">
                      {cvFile ? (
                        <span className="text-success">✓ {cvFile.name} uploaded</span>
                      ) : (
                        <span>Accepted formats: PDF, DOC, DOCX (Max 5MB)</span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="col-12">
                    <label htmlFor="tutorMessage" className="form-label fw-medium">
                      Why do you want to join as an instructor? <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 align-items-start pt-3">
                        <MessageSquare size={20} className="text-muted" />
                      </span>
                      <textarea
                        className="form-control form-control-lg"
                        id="tutorMessage"
                        name="message"
                        rows={4}
                        placeholder="Tell us why you'd be a great fit for our team"
                        value={tutorFormData.message}
                        onChange={handleTutorFormChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Success/Error Messages */}
                  {tutorSubmitSuccess && (
                    <div className="col-12">
                      <div className="alert alert-success d-flex align-items-center gap-3" role="alert">
                        <CheckCircle size={24} />
                        <div>
                          <strong>Success!</strong> Your application has been submitted. We'll get back to you soon. Redirecting...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {tutorSubmitError && (
                    <div className="col-12">
                      <div className="alert alert-danger d-flex align-items-center gap-3" role="alert">
                        <div>
                          <strong>Error:</strong> {tutorSubmitError}
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
                      disabled={tutorIsSubmitting}
                    >
                      {tutorIsSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : 'Submit Application'}
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
