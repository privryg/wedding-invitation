import { event } from '../../config/invitation.config.js'
import { buildCalendarUrl } from './calendar.js'
import './event.css'

/**
 * "Simpan ke Kalender" — opens a prefilled Google Calendar event.
 *
 * Lives in the `event` domain (it is about the wedding date/venue) but is
 * rendered by the countdown section, so it ships as a standalone component
 * rather than being inlined into the venue card.
 */
export default function AddToCalendarButton() {
  const open = () => window.open(buildCalendarUrl(event.calendar), '_blank')

  return (
    <button className="map-btn" type="button" onClick={open}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      Simpan ke Kalender
    </button>
  )
}
