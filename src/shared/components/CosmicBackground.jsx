import { useMemo } from 'react'
import { cosmicStars } from '../utils/fields.js'
import ShootingStars from './ShootingStars.jsx'

/** The fixed cosmic backdrop (nebulae, starfield, planets, satellite) behind
 *  all content pages. */
export default function CosmicBackground() {
  const stars = useMemo(() => cosmicStars(70), [])

  return (
    <div className="bg-motif" aria-hidden="true">
      <div className="nebula a" />
      <div className="nebula b" />
      <div className="stars">
        {stars.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
      <ShootingStars />
      <div className="planet p1">
        <span className="surface" />
        <span className="ring" />
      </div>
      <div className="planet p2">
        <span className="surface" />
      </div>
      <div className="planet p3">
        <span className="surface" />
      </div>
      <div className="satellite">
        <span className="trail" />
        <span className="body">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9l3-3 3 3-3 3zM6 15l3-3 3 3-3 3z" />
            <path d="M10.5 10.5l3 3" />
            <path d="M15 6l2-2M18 9l2-2" />
            <path d="M9 15l-2 2M6 18l-2 2" />
          </svg>
        </span>
      </div>
    </div>
  )
}
