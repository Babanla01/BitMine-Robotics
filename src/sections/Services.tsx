
import { Link } from 'react-router-dom'

export default function QuickLinksSection() {
    return (
        <section className="section-padding ">
            <div className="container">
                {/* Top Section - Summary Cards */}
                <div className='concertOne text-center mb-5'>
                    <Link to="/about" className="btn bg-primary bg-opacity-25 text-primary btn-lg px-5 d-inline-flex align-items-center justify-content-center ">
                        Our Services
                    </Link>
                </div>

                {/* bottom Section - Services  */}
                <div className="row g-4 mb-5">
                    {/* Card 1 - Shop */}
                    <div className="col-12 col-md-7 d-flex">
                        <div className="rounded-4 p-4 services-shop d-flex flex-column justify-content-end h-100 w-100 service-card">
                            <div className='services-shop-content'>
                                <h3 className="h2 fw-bold text-white mb-3 concertOne">Shop Robotics Kits & Materials</h3>
                                <p className="text-white mb-0 w-lg-75">
                                    From starter kits to advanced components, plus guides and
                                    textbooks everything you need to build and learn robotics.
                                </p>
                                {/* <Link to="/shop" className="btn btn-primary btn-sm fs-4 px-4 ">
                Shop Now
              </Link> */}
                            </div>
                        </div>
                    </div>

                    {/* Card 2 - Training and partnership */}
                    <div className="col-12 col-md-5 d-flex">
                        <div className="rounded-4 p-4 services-training d-flex flex-column justify-content-end h-100 w-100 service-card">
                            <div className='services-training-content'>
                                <h3 className="h2 fw-bold text-white mb-3 concertOne">Tutors & Trainings</h3>
                                <p className="text-white mb-0 w-lg-75">
                                    Training graduates to become certified robotics tutors, equipped with both technical and teaching skills.
                                </p>
                                {/* <Link to="/contact" className="btn btn-primary btn-lg fs-4 px-4 d-inline-flex align-items-center justify-content-center">
                  Shop Now
                </Link> */}
                            </div>
                        </div>
                    </div>

                    {/* Card 3 - Competitions and events */}
                    <div className="col-12 col-md-5 d-flex">
                        <div className="rounded-4 p-4 service-competitions d-flex flex-column justify-content-end h-100 w-100 service-card">
                            <div className='service-competitions-content'>
                                <h3 className="h2 fw-bold text-white mb-3 concertOne">Competitions & Events</h3>
                                <p className="text-white mb-0 w-lg-75 ">
                                    Join hackathons, contests, and challenges that test creativity
                                    and innovation with real-world robotics.
                                </p>
                                {/* <Link to="/contact" className="btn btn-primary btn-lg fs-4 px-4 d-inline-flex align-items-center justify-content-center">
                Shop Now
              </Link> */}
                            </div>
                        </div>
                    </div>


                    {/* Card 4 - Custom Robotics Solution */}
                    <div className="col-12 col-md-7 d-flex">
                        <div className="rounded-4 p-4 service-solution d-flex flex-column justify-content-end h-100 w-100 service-card">
                            <div className='service-solution-content'>
                                <h3 className="h2 fw-bold text-white mb-3 concertOne">Custom Robotics Solutions</h3>
                                <p className="text-white mb-0 w-lg-75">
                                    Need something unique? We design tailored robotics projects and
                                    provide expert advisory services.
                                </p>
                                {/* <Link to="/contact" className="btn btn-primary btn-lg fs-4 px-4 d-inline-flex align-items-center justify-content-center">
                  Shop Now
                </Link> */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}


