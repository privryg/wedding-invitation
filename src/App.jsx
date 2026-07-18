import { useEffect, useState } from 'react'
import useBacksound from './shared/hooks/useBacksound.js'
import BackToTop from './shared/components/BackToTop.jsx'
import CosmicBackground from './shared/components/CosmicBackground.jsx'
import EnvelopeScreen from './domains/envelope/EnvelopeScreen.jsx'
import CoverPage from './domains/cover/CoverPage.jsx'
import GreetingSection from './domains/greeting/GreetingSection.jsx'
import CoupleSection from './domains/couple/CoupleSection.jsx'
import CountdownSection from './domains/countdown/CountdownSection.jsx'
import GallerySection from './domains/gallery/GallerySection.jsx'
import EventSection from './domains/event/EventSection.jsx'
import GiftSection from './domains/gift/GiftSection.jsx'
import FamiliesSection from './domains/families/FamiliesSection.jsx'
import RsvpSection from './domains/rsvp/RsvpSection.jsx'
import WishesSection from './domains/guestbook/WishesSection.jsx'
import ClosingSection from './domains/closing/ClosingSection.jsx'

/**
 * Composition root. Wires the envelope → cover → content flow together and
 * gates page scrolling until the envelope is opened.
 */
export default function App() {
  const [opened, setOpened] = useState(false)
  const { audioRef, play } = useBacksound()

  // Lock scrolling until the invitation is opened (as in the original).
  useEffect(() => {
    document.body.style.overflow = opened ? 'auto' : 'hidden'
  }, [opened])

  return (
    <div className="stage">
      <audio ref={audioRef} id="song" src="/assets/song.mp3" loop preload="auto" />

      <BackToTop show={opened} />

      <EnvelopeScreen onOpenStart={play} onOpened={() => setOpened(true)} />

      <CoverPage opened={opened} />

      {/* the cosmic backdrop lives INSIDE the content layer so page 3 is opaque
          and slides up over the sticky cover (page 2 -> 3) */}
      <main id="content">
        <CosmicBackground />

        <GreetingSection />
        <CoupleSection />
        <CountdownSection />
        <GallerySection />
        <EventSection />
        <GiftSection />
        <FamiliesSection />
        <RsvpSection />
        <WishesSection />
        <ClosingSection />
      </main>
    </div>
  )
}
