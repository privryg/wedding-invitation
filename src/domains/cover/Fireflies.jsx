import { useMemo } from 'react'

/**
 * Fireflies drifting down through the cover artwork's night sky, each looping
 * around its own descent so they read as circling rather than falling.
 *
 * The wrapper reproduces the exact box that `background-size:cover` gives
 * .cover-photo (same aspect ratio, min 100% on both axes), so every percentage
 * below is measured against the artwork itself and never drifts when the
 * viewport crops the image.
 */
const COUNT = 16

export default function Fireflies() {
  const flies = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        left: 26 + Math.random() * 46, // % — spread across the open sky, clear of the border
        radius: 4 + Math.random() * 7, // cqw — orbit radius, 1cqw = 1% of artwork width
        fall: 9 + Math.random() * 7, // s  — hair -> hem
        orbit: 4 + Math.random() * 4, // s  — one loop around
        blink: 1.2 + Math.random() * 2, // s
        size: 3 + Math.random() * 2.4, // px
        delay: -Math.random() * 16, // s  — negative: already mid-flight on load
        reverse: Math.random() < 0.5,
      })),
    [],
  )

  return (
    <div className="fireflies" aria-hidden="true">
      {flies.map((f, i) => (
        <span
          key={i}
          className="ff"
          style={{ left: `${f.left}%`, animationDuration: `${f.fall}s`, animationDelay: `${f.delay}s` }}
        >
          <i
            style={{
              '--r': `${f.radius}cqw`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDuration: `${f.orbit}s, ${f.blink}s`,
              animationDelay: `${f.delay}s, ${f.delay / 2}s`,
              animationDirection: f.reverse ? 'reverse, normal' : 'normal, normal',
            }}
          />
        </span>
      ))}
    </div>
  )
}
