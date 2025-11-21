import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import aboutImage1 from '../assets/About-Image-1.jpg'
import aboutImage2 from '../assets/About-Image-2.jpg'

export default function AboutSnapshotSection() {
  return (
    <section className="container d-flex align-items-center justify-content-center about-section" >

      <div className="row align-items-center justify-content-center text-center position-relative ">

        {/* Text Content */}
        <div className="col-12 col-md-10 col-lg-6 mb-5 mb-lg-0">
          <div className="d-flex flex-column gap-4">
            <div className="d-flex flex-column gap-4">

              <div className="concertOne">
                <Link to="/about" className="btn bg-primary bg-opacity-25 text-primary btn-lg px-5 d-inline-flex align-items-center justify-content-center">
                  About BitMine
                </Link>
              </div>

              <h2 className="text-dark h-lg concertOne">
                Shaping the Future of Innovation with Robotics and Coding
              </h2>
              <div>
                <p className="fs-5 text-dark mb-4">
                  Bitmine Robotics is a Nigeria-based startup committed to transforming education through hands-on robotics and coding.
                  We bring learning to life with hands-on robotics kits, guiding students as they build and program their own robots.
                  <span className='d-none d-md-block'>Our mission is to make STEM education engaging and practical, opening doors for everyone to explore these fields with confidence.</span>
                </p>
                <p className="fs-5 text-dark">
                  We also empower teachers by equipping them with the tools and skills to inspire the next lesson, fostering a supportive
                  environment for growth.
                  <span className='d-none d-md-block'>
                    Our ultimate goal is to spark a wave of creativity and problem-solving, nurturing a new generation of innovators who will shape the future!
                  </span>
                </p>
              </div>
            </div>



            {/* CTA Buttons */}
            <div className="concertOne">
              <a href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer" className="btn btn-success btn-lg px-5 d-inline-flex align-items-center justify-content-center">
                <FaWhatsapp className="me-3" size={30} />
                Ask more on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Images - These will be positioned absolutely on larger screens and as regular elements on mobile */}
        <div className="d-none d-lg-block rounded-4 shadow-lg about-image-1">
          <img src={aboutImage1} alt="Students working with robotics" />
        </div>

        <div className="d-none d-lg-block rounded-4 shadow-lg about-image-2">
          <img src={aboutImage2} alt="Robotics education" />
        </div>

        {/* Mobile Images - Only visible on smaller screens */}
        <div className="col-12 d-lg-none mt-4">
          <div className="row justify-content-center gap-0 gap-md-4">
            <div className="col-6 col-md-5">
              <div className="rounded-4 shadow-lg about-image-mobile-1">
                <img src={aboutImage1} alt="Students working with robotics" className="img-fluid" />
              </div>
            </div>
            <div className="col-6 col-md-5">
              <div className="rounded-4 shadow-lg about-image-mobile-2">
                <img src={aboutImage2} alt="Robotics education" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}