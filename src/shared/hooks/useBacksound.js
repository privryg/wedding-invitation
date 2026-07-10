import { useCallback, useEffect, useRef } from 'react'

/**
 * Embedded backsound. Browsers block audio until the first user gesture, so we
 * start on the first pointer/touch/click/key event and also expose play() for
 * the envelope-open handler to call explicitly.
 *
 * The <audio> lives in the DOM (attach `audioRef` to it) rather than being an
 * off-screen `new Audio()`, matching the original invitation and letting the
 * browser manage buffering.
 */
export default function useBacksound() {
  const audioRef = useRef(null)
  const startedRef = useRef(false)

  const play = useCallback(() => {
    const song = audioRef.current
    if (!song) return
    try {
      song.volume = 0.7
    } catch {
      /* ignore */
    }
    const p = song.play()
    if (p && p.then) p.then(() => {}).catch(() => {})
  }, [])

  useEffect(() => {
    const firstStart = () => {
      if (startedRef.current) return
      startedRef.current = true
      play()
    }
    const events = ['pointerdown', 'touchstart', 'click', 'keydown']
    events.forEach((ev) => document.addEventListener(ev, firstStart, { passive: true }))
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, firstStart))
    }
  }, [play])

  return { audioRef, play }
}
