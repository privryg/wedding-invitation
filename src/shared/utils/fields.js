/**
 * Pure generators for the decorative particle/star fields. Each returns an
 * array of React style objects; components memoize them so the randomness is
 * frozen for the component's lifetime (matching the original one-shot DOM fill).
 */

const rand = Math.random

export function coverParticles(n = 26, dimmer = false) {
  const out = []
  for (let i = 0; i < n; i++) {
    const s = (rand() * 3 + 1.5).toFixed(1)
    out.push({
      left: (rand() * 100).toFixed(2) + '%',
      width: s + 'px',
      height: s + 'px',
      animationDuration: (rand() * 12 + (dimmer ? 16 : 12)).toFixed(1) + 's',
      animationDelay: (-rand() * 24).toFixed(1) + 's',
      opacity: (rand() * (dimmer ? 0.22 : 0.4) + (dimmer ? 0.14 : 0.4)).toFixed(2),
    })
  }
  return out
}

export function envStars(n = 46) {
  const out = []
  for (let i = 0; i < n; i++) {
    const s = (rand() * 2.6 + 1).toFixed(2)
    out.push({
      left: (rand() * 100).toFixed(2) + '%',
      width: s + 'px',
      height: s + 'px',
      animationDuration: (rand() * 4 + 3).toFixed(1) + 's',
      animationDelay: (-rand() * 7).toFixed(1) + 's',
    })
  }
  return out
}

export function galaxyStars(n = 110) {
  const out = []
  for (let i = 0; i < n; i++) {
    // cluster more stars toward the galactic band (center)
    const band = rand() < 0.5
    const s = (rand() * 1.6 + 0.5).toFixed(2)
    out.push({
      left: (rand() * 100).toFixed(2) + '%',
      top: (band ? 30 + rand() * 40 : rand() * 100).toFixed(2) + '%',
      width: s + 'px',
      height: s + 'px',
      boxShadow: '0 0 ' + (1.5 + rand() * 2.5).toFixed(1) + 'px rgba(255,255,255,.8)',
      animationDuration: (rand() * 3 + 2).toFixed(1) + 's',
      animationDelay: (-rand() * 5).toFixed(1) + 's',
    })
  }
  return out
}

export function cosmicStars(n = 70) {
  const out = []
  for (let i = 0; i < n; i++) {
    const s = (rand() * 1.8 + 0.6).toFixed(2)
    out.push({
      left: (rand() * 100).toFixed(2) + '%',
      top: (rand() * 100).toFixed(2) + '%',
      width: s + 'px',
      height: s + 'px',
      boxShadow: '0 0 ' + (2 + rand() * 3).toFixed(1) + 'px rgba(255,255,255,.8)',
      animationDuration: (rand() * 3 + 2).toFixed(1) + 's',
      animationDelay: (-rand() * 5).toFixed(1) + 's',
    })
  }
  return out
}
