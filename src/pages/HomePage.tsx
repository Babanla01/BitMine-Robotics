import HeroSection from '../sections/HeroSection.tsx'
import QuickLinksSection from '../sections/Services.tsx'
import AboutSnapshotSection from '../sections/AboutSnapshotSection.tsx'
import NewsletterSection from '../sections/NewsletterSection.tsx'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSnapshotSection />
      <QuickLinksSection />

      <NewsletterSection />
    </>
  )
}
