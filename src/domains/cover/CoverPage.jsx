import { useMemo } from 'react'
import { coverParticles } from '../../shared/utils/fields.js'
import { couple, event } from '../../config/invitation.config.js'
import { useGuestName } from '../guest/useGuestName.js'
import Fireflies from './Fireflies.jsx'
import Birds from './Birds.jsx'
import './cover.css'

/** The full-screen cover: artwork, couple names, date, and the addressed guest.
 *  `opened` slides its contents in once the envelope has been torn away. */
export default function CoverPage({ opened = false }) {
  const particles = useMemo(() => coverParticles(26, false), [])
  const guestName = useGuestName()

  return (
    <div className={`cover${opened ? ' revealed' : ''}`}>
      <div className="cover-photo" />
      <Birds />
      <Fireflies />
      <div className="motif">
        <div className="aura" />
        <div className="particles">
          {particles.map((style, i) => (
            <i key={i} style={style} />
          ))}
        </div>
      </div>
      <div className="cover-inner">
        <div>
          <div className="eyebrow">The Wedding Of</div>
          <div className="cover-names">
            {couple.groom.nick}
            <span className="cover-amp">&amp;</span>
            {couple.bride.nick}
          </div>
        </div>
        <div className="cover-bottom">
          <div className="cover-date">{event.dayLabel}</div>
          <div className="orn">
            <span className="rule" />
            <span className="dot">&#10022;</span>
            <span className="rule r" />
          </div>
          <div>
            <div className="to-line">Kepada Yth. Bapak/Ibu/Saudara/i</div>
            <div className="guest">{guestName}</div>
          </div>
          <div className="scroll-cue" aria-hidden="true">
            <span>Geser ke bawah</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M6 13l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
