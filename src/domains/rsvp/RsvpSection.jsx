import { useState } from 'react'
import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { ATTENDANCE, isValidName, isValidWhatsapp, isValidRsvp } from './rsvp.js'
import { submitRsvp } from './submitRsvp.js'
import './rsvp.css'

/** "Konfirmasi Kehadiran" — RSVP form delivered to the couple via Telegram.
 *  Name and WhatsApp are both required before it will send. */
export default function RsvpSection() {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [attendance, setAttendance] = useState(ATTENDANCE.YES)
  const [guestCount, setGuestCount] = useState('1')
  const [sending, setSending] = useState(false)
  const [touched, setTouched] = useState({ name: false, whatsapp: false })
  const [feedback, setFeedback] = useState(null) // { text, ok }

  const nameOk = isValidName(name)
  const waOk = isValidWhatsapp(whatsapp)
  const valid = isValidRsvp({ name, whatsapp })

  /** Editing a field clears a stale validation error (but keeps the success note). */
  const clearError = () => setFeedback((f) => (f && !f.ok ? null : f))

  const send = async () => {
    if (!valid) {
      // surface whichever field is missing rather than a generic error
      setTouched({ name: true, whatsapp: true })
      setFeedback({
        text: !nameOk
          ? 'Mohon isi nama terlebih dahulu.'
          : 'Mohon isi nomor WhatsApp yang valid.',
        ok: false,
      })
      return
    }
    setSending(true)
    try {
      const { ok } = await submitRsvp({ name: name.trim(), whatsapp, attendance, guestCount })
      if (ok) {
        setFeedback({ text: 'Terima kasih, konfirmasi Anda telah terkirim.', ok: true })
        setName('')
        setWhatsapp('')
        setTouched({ name: false, whatsapp: false })
      } else {
        setFeedback({ text: 'Gagal mengirim. Coba lagi ya.', ok: false })
      }
    } catch {
      setFeedback({ text: 'Gagal mengirim (periksa koneksi internet).', ok: false })
    } finally {
      setSending(false)
    }
  }

  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">RSVP</div>
        <div className="serif-lg">Konfirmasi Kehadiran</div>
        <div className="rsvp-box">
          <div className="field">
            <label>Nama</label>
            <input
              type="text"
              className={touched.name && !nameOk ? 'err' : ''}
              placeholder="Nama Anda"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError() }}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
          </div>

          <div className="field">
            <label>No. WhatsApp</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={touched.whatsapp && !waOk ? 'err' : ''}
              placeholder="0812 3456 7890"
              value={whatsapp}
              onChange={(e) => { setWhatsapp(e.target.value); clearError() }}
              onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
            />
          </div>

          <div className="field">
            <label>Kehadiran</label>
            <div className="attend">
              {[ATTENDANCE.YES, ATTENDANCE.NO].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={attendance === v ? 'sel' : ''}
                  onClick={() => setAttendance(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Jumlah Tamu</label>
            <select value={guestCount} onChange={(e) => setGuestCount(e.target.value)}>
              <option value="1">1 Orang</option>
              <option value="2">2 Orang</option>
              <option value="3">3 Orang</option>
              <option value="4">4 Orang</option>
            </select>
          </div>

          <button className={`send-btn${valid ? '' : ' off'}`} onClick={send} disabled={sending}>
            {sending ? (
              'Mengirim...'
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Kirim Konfirmasi
              </>
            )}
          </button>

          {feedback && (
            <div className="rsvp-err" style={{ color: feedback.ok ? '#a7d3a7' : '#e2a3a3' }}>
              {feedback.text}
            </div>
          )}
          <div className="rsvp-note">Konfirmasi Anda akan langsung terkirim kepada mempelai.</div>
        </div>
      </Reveal>
    </section>
  )
}
