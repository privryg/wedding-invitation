import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { event } from '../../config/invitation.config.js'
import AddToCalendarButton from '../event/AddToCalendarButton.jsx'
import { useCountdown } from './useCountdown.js'
import './countdown.css'

/** Live countdown to the wedding date. */
export default function CountdownSection() {
  const { d, h, m, s } = useCountdown(event.dateISO)

  const boxes = [
    { value: d, label: 'Hari' },
    { value: h, label: 'Jam' },
    { value: m, label: 'Menit' },
    { value: s, label: 'Detik' },
  ]

  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">Menuju Hari Bahagia</div>
        <div className="serif-lg">{event.longDate}</div>
        <div className="cd">
          {boxes.map((b) => (
            <div className="box" key={b.label}>
              <div className="num">{b.value}</div>
              <div className="lab">{b.label}</div>
            </div>
          ))}
        </div>
        <div className="cd-actions">
          <AddToCalendarButton />
        </div>
      </Reveal>
    </section>
  )
}
