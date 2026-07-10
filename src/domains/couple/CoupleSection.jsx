import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { couple } from '../../config/invitation.config.js'
import './couple.css'

function Person({ person }) {
  return (
    <>
      {person.photo && (
        <div className="couple-portrait">
          <img src={person.photo} alt={person.full} />
        </div>
      )}
      <div className="couple-name">{person.nick}</div>
      <div className="couple-sub">{person.full}</div>
      <div className="couple-role">
        <span className="lbl">{person.parentsLabel}</span>
        <span dangerouslySetInnerHTML={{ __html: person.parents }} />
      </div>
    </>
  )
}

/** "Bride & Groom" — the couple and their parents. Bride first, matching the heading. */
export default function CoupleSection() {
  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">{couple.heading}</div>
        <p className="body-cop couple-intro">{couple.intro}</p>
        <Person person={couple.bride} />
        <div className="amp-big">&amp;</div>
        <Person person={couple.groom} />
      </Reveal>
    </section>
  )
}
