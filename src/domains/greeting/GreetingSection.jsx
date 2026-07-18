import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { greeting } from '../../config/invitation.config.js'

/** Opening greeting: salam, intention, and the Ar-Rum : 21 verse. */
export default function GreetingSection() {
  return (
    <section className="greeting">
      <Reveal>
        <OrnDivider />
        <div className="salam">{greeting.salam}</div>
        <p className="body-cop">{greeting.intro}</p>
        <p className="ayat">{greeting.ayat}</p>
        <p className="note-track">{greeting.ayatSource}</p>
      </Reveal>
    </section>
  )
}
