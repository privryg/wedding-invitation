import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { invitedFamilies } from '../../config/invitation.config.js'
import './families.css'

/** "Turut Mengundang" — extended families and friends. */
export default function FamiliesSection() {
  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">Turut Mengundang</div>
        <div className="serif-lg">Keluarga Besar</div>
        <div className="invite-list">
          {invitedFamilies.map((name, i) => (
            <span key={i}>{name}</span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
