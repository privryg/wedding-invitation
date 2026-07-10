import { useEffect, useState } from 'react'

/**
 * Periodically launches 1–2 shooting stars, each living ~1.3s. Reproduces the
 * original setInterval spawner but as declarative React state.
 */
export default function ShootingStars() {
  const [stars, setStars] = useState([])

  useEffect(() => {
    let seq = 0
    const timers = new Set()

    const shoot = () => {
      const id = seq++
      const style = {
        left: (Math.random() * 38).toFixed(1) + '%',
        top: (Math.random() * 30).toFixed(1) + '%',
      }
      setStars((prev) => [...prev, { id, style, go: false }])
      // next frame -> add .go so the CSS animation fires
      requestAnimationFrame(() => {
        setStars((prev) => prev.map((s) => (s.id === id ? { ...s, go: true } : s)))
      })
      const t = setTimeout(() => {
        setStars((prev) => prev.filter((s) => s.id !== id))
        timers.delete(t)
      }, 1300)
      timers.add(t)
    }

    const interval = setInterval(() => {
      const n = 1 + Math.floor(Math.random() * 2)
      for (let i = 0; i < n; i++) {
        const t = setTimeout(shoot, i * 220)
        timers.add(t)
      }
    }, 900)

    return () => {
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="shooting">
      {stars.map((s) => (
        <span key={s.id} className={`shoot${s.go ? ' go' : ''}`} style={s.style} />
      ))}
    </div>
  )
}
