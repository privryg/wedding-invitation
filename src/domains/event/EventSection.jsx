import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import CopyButton from '../../shared/components/CopyButton.jsx'
import { event } from '../../config/invitation.config.js'
import './event.css'

/** "Save The Date" — venue card with maps and copy-address actions.
 *  The calendar button now lives under the countdown. */
export default function EventSection() {
  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">Save The Date</div>
        <div className="card">
          <h3>{event.cardTitle}</h3>
          <div className="when">{event.when}</div>
          <div className="time">{event.time}</div>
          <div className="divider" />
          <div className="venue">{event.venue}</div>
          <div className="addr">{event.address}</div>
          <div className="card-actions">
            <a className="map-btn" href={event.mapsUrl} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Lihat Lokasi
            </a>
            <CopyButton className="map-btn" value={event.copyAddress}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 012-2h10" />
              </svg>
              Salin Alamat
            </CopyButton>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
