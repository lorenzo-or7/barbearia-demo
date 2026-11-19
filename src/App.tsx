import { MotionConfig } from 'motion/react'
import { BookingDialog } from './features/booking/BookingDialog'
import { BookingProvider } from './features/booking/BookingContext'
import { Closing } from './sections/Closing'
import { Experience } from './sections/Experience'
import { Footer } from './sections/Footer'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { Location } from './sections/Location'
import { Manifesto } from './sections/Manifesto'
import { Navbar } from './sections/Navbar'
import { Plans } from './sections/Plans'
import { Services } from './sections/Services'
import { Team } from './sections/Team'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BookingProvider>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <Navbar />
        <main id="conteudo" tabIndex={-1}>
          <Hero />
          <Manifesto />
          <Services />
          <Gallery />
          <Team />
          <Plans />
          <Experience />
          <Location />
          <Closing />
        </main>
        <Footer />
        <BookingDialog />
      </BookingProvider>
    </MotionConfig>
  )
}
