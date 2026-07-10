import { useMemo } from 'react'

/**
 * A flock of black birds crossing the cover's night sky, half drifting right
 * and half drifting left.
 *
 * Like <Fireflies>, the wrapper mirrors the box that `background-size:cover`
 * gives .cover-photo, so the `top` percentages stay in the sky and never sink
 * into the painted mountains as the viewport crops the artwork.
 */
const COUNT = 18

export default function Birds() {
  const birds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        rtl: i % 2 === 1, // alternate direction: half fly right, half fly left
        top: 6 + Math.random() * 52, // % — sky only; mountains start near 70%
        size: 13 + Math.random() * 14, // px wingspan — matches the painted birds in the artwork
        cross: 16 + Math.random() * 20, // s to cross the sky
        flap: 0.35 + Math.random() * 0.45, // s per wingbeat
        delay: -Math.random() * 30, // s — negative: already in flight on load
        opacity: 0.6 + Math.random() * 0.35,
      })),
    [],
  )

  return (
    <div className="birds" aria-hidden="true">
      {birds.map((b, i) => (
        <span
          key={i}
          className={`bird${b.rtl ? ' rtl' : ''}`}
          style={{
            top: `${b.top}%`,
            width: `${b.size}px`,
            opacity: b.opacity,
            animationDuration: `${b.cross}s`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <i style={{ animationDuration: `${b.flap}s`, animationDelay: `${b.delay}s` }}>
            <svg viewBox="0 0 24 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M1 7.5 Q 6 1 11.6 6.6" />
              <path d="M12.4 6.6 Q 18 1 23 7.5" />
            </svg>
          </i>
        </span>
      ))}
    </div>
  )
}
