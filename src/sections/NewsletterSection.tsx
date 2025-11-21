import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Bot, Cpu, Zap, Code, CheckCircle } from 'lucide-react'

const newsletterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

export default function NewsletterSection() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema)
  })

  const onSubmit = async (data: NewsletterFormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Newsletter signup:', data)
    setIsSubmitted(true)
    reset()
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  return (
    <section className=" position-relative overflow-hidden section-padding" style={{ background: 'linear-gradient(135deg, #0066FF0D, #FF66000D, #00CC660D)' }}>
      {/* Playful Background Illustrations */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden d-none d-lg-block">
        {/* Floating Robot Icons */}
        <div className="position-absolute animate-float" style={{ top: '3.5rem', left: '30rem' }}>
          <Bot size={48} color="#0066FF33" />
        </div>
        <div className="position-absolute animate-float delay-1s" style={{ top: '5rem', right: '30rem' }}>
          <Cpu size={40} color="#FF660033" />
        </div>
        <div className="position-absolute animate-float delay-2s" style={{ bottom: '5rem', left: '25rem' }}>
          <Zap size={56} color="#00CC6633" />
        </div>
        <div className="position-absolute animate-float delay-3s" style={{ bottom: '2.5rem', right: '25rem' }}>
          <Code size={40} color="#0066FF33" />
        </div>

        {/* Geometric Shapes */}
        <div className="position-absolute rounded-circle animate-pulse-slow" style={{ top: '25%', left: '25%', width: 24, height: 24, background: '#0066FF1A' }}></div>
        <div className="position-absolute animate-pulse-slow delay-1s" style={{ top: '33%', right: '33%', width: 16, height: 16, background: '#FF66001A', transform: 'rotate(45deg)' }}></div>
        <div className="position-absolute rounded-circle animate-pulse-slow delay-2s" style={{ bottom: '33%', left: '33%', width: 20, height: 20, background: '#00CC661A' }}></div>
        <div className="position-absolute animate-pulse-slow delay-3s" style={{ bottom: '25%', right: '25%', width: 12, height: 12, background: '#0066FF1A', transform: 'rotate(12deg)' }}></div>
      </div>

      <div className="container position-relative z-10">
        <div className="mx-auto text-center w-md-50">
          <div className="">
            <h2 className="h-xl fw-bold concertOne text-dark mb-3">
              Stay Updated with BitMine
            </h2>
            <p className="text-lead text-medium mx-auto max-w-40rem">
              Get the latest updates on new robotics kits, training programs,
              upcoming events, and exclusive learning resources.
            </p>
          </div>

          <div className="  p-4 position-relative overflow-hidden ">
            <div className="position-relative">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row g-3 justify-content-center">
                    {/* Name Field */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <label htmlFor="name" className="form-label text-start w-100 fw-semibold text-dark">
                        Full Name
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        id="name"
                        placeholder="Enter your full name"
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                      />
                      {errors.name && (
                        <div id="name-error" className="invalid-feedback text-start">{errors.name.message}</div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="col-12 col-md-6 col-lg-3">
                      <label htmlFor="email" className="form-label text-start w-100 fw-semibold text-dark">
                        Email Address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        placeholder="Enter your email address"
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`form-control-lg form-control ${errors.email ? 'is-invalid' : ''}`}
                      />
                      {errors.email && (
                        <div id="email-error" className="invalid-feedback text-start">{errors.email.message}</div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-flex flex-column  align-items-center mt-4 gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary btn-lg px-4 d-inline-flex align-items-center justify-content-center">
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Mail className="me-2" size={20} />
                          Subscribe to Newsletter
                        </>
                      )}
                    </button>

                    <p className="text-medium small mb-0">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}>
                    <CheckCircle size={32} color="#ffffff" />
                  </div>
                  <h3 className="h4 fw-bold text-dark mb-2">
                    Welcome to the BitMine Family!
                  </h3>
                  <p className="text-medium mb-0">
                    Thank you for subscribing! You'll receive our latest updates and exclusive content soon.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
