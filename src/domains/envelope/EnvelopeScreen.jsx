import { useMemo, useState } from 'react'
import { envStars, galaxyStars } from '../../shared/utils/fields.js'
import { couple, event } from '../../config/invitation.config.js'
import envDeco from './envDeco.svg?raw'
import './envelope.css'

/**
 * Page 1: the sealed envelope. Tapping it plays the open animation
 * (flap unfolds, letter slides up), starts the music, then calls `onOpened`
 * so the app can reveal the invitation and enable scrolling.
 */
export default function EnvelopeScreen({ onOpened, onOpenStart }) {
  const [opening, setOpening] = useState(false)
  const [gone, setGone] = useState(false)
  const [hidden, setHidden] = useState(false)

  const galaxy = useMemo(() => galaxyStars(110), [])
  const stars = useMemo(() => envStars(46), [])

  const open = () => {
    if (opening) return
    setOpening(true)
    onOpenStart?.()
    setTimeout(() => {
      setGone(true)
      onOpened?.()
    }, 1700)
    setTimeout(() => setHidden(true), 2700)
  }

  if (hidden) return null

  const dateLabel = event.dayLabel.replace(/^\w+\s·\s/, '') // "08 · 08 · 2026"

  return (
    <div className={`env-screen${opening ? ' opening' : ''}${gone ? ' gone' : ''}`}>
      <div className="galaxy">
        <span className="gx-swirl" />
        <span className="gx-band" />
        <span className="gx-core" />
        <span className="gxstars">
          {galaxy.map((style, i) => (
            <i key={i} style={style} />
          ))}
        </span>
      </div>
      <div className="env-stars">
        {stars.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
      <div className="env-eyebrow">
        We Invite You to The Wedding Of<b>{couple.displayNames}</b>
      </div>
      <div className="scene" onClick={open}>
        <div className="envelope">
          <div className="env-base" />
          <div className="env-letter">
            <div className="mono">{couple.shortMonogram}</div>
            <div className="sub">{dateLabel}</div>
          </div>
          <div className="env-pocket">
            <span className="fill" />
          </div>
          <div className="env-flap">
            <span className="fill" />
          </div>
          <div className="env-seal">R&amp;E</div>
          <span dangerouslySetInnerHTML={{ __html: envDeco }} />
        </div>
      </div>
      <div className="env-tap">Ketuk amplop untuk membuka</div>
    </div>
  )
}
