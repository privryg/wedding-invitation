import Reveal from '../../shared/components/Reveal.jsx'
import { closing } from '../../config/invitation.config.js'

/** Closing blessing, signature, and footer. */
export default function ClosingSection() {
  return (
    <>
      <section className="closing">
        <Reveal>
          <div className="orn">
            <span className="rule" />
            <span className="dot">&#10022;</span>
            <span className="rule r" />
          </div>
          <p className="body-cop">{closing.body}</p>
          <div className="couple-role" style={{ marginTop: 28 }}>
            {closing.wassalam}
          </div>
          <div className="sign">{closing.sign}</div>
        </Reveal>
      </section>
      <div className="foot">
        <div className="tiny">{closing.footDate}</div>
        <div className="tiny2">{closing.footNote}</div>
      </div>
    </>
  )
}
