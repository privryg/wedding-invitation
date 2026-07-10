import { useState } from 'react'
import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { isValidWish } from './wish.js'
import { useGuestbook } from './useGuestbook.js'
import './guestbook.css'

/** "Ucapan & Doa" — the guestbook: leave a wish, see the wishes wall. */
export default function WishesSection() {
  const { wishes, status, addWish } = useGuestbook()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null) // { text, ok }

  const send = async () => {
    if (!isValidWish(name, message)) {
      setFeedback({ text: 'Mohon isi nama dan ucapan.', ok: false })
      return
    }
    setSending(true)
    const { ok } = await addWish(name.trim(), message.trim())
    setSending(false)

    if (ok) {
      setName('')
      setMessage('')
      setFeedback({ text: 'Terima kasih atas ucapan & doanya.', ok: true })
    } else {
      setFeedback({ text: 'Ucapan gagal terkirim. Silakan coba lagi.', ok: false })
    }
  }

  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">Ucapan &amp; Doa</div>
        <div className="serif-lg">Untuk Kedua Mempelai</div>
        <div className="wish-box">
          <input
            type="text"
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Tulis ucapan & doa terbaik Anda..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="send-btn"
            style={{ marginTop: 12 }}
            onClick={send}
            disabled={sending}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            {sending ? 'Mengirim...' : 'Kirim Ucapan'}
          </button>
          {feedback && (
            <div className="rsvp-err" style={{ color: feedback.ok ? '#a7d3a7' : '#e2a3a3' }}>
              {feedback.text}
            </div>
          )}
        </div>
        <div className="wishes">
          {status === 'loading' && <div className="wish-msg">Memuat ucapan...</div>}
          {status === 'error' && (
            <div className="wish-msg">Ucapan tidak dapat dimuat saat ini.</div>
          )}
          {status === 'ready' &&
            wishes.map((w) => (
              <div className="wish" key={w.id}>
                <div className="wish-name">{w.name}</div>
                <div className="wish-msg">{w.message}</div>
              </div>
            ))}
        </div>
      </Reveal>
    </section>
  )
}
