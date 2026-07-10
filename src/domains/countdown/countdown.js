/**
 * Pure countdown domain logic. Given a target timestamp and "now", return the
 * remaining days/hours/minutes/seconds. Hours/minutes/seconds are zero-padded
 * to two digits; days are shown as-is, exactly like the original.
 */
export function computeCountdown(targetMs, nowMs) {
  let diff = targetMs - nowMs
  if (diff < 0) diff = 0
  const d = Math.floor(diff / 864e5)
  const h = Math.floor((diff % 864e5) / 36e5)
  const m = Math.floor((diff % 36e5) / 6e4)
  const s = Math.floor((diff % 6e4) / 1e3)
  const pad = (n) => ('0' + n).slice(-2)
  return { d: String(d), h: pad(h), m: pad(m), s: pad(s) }
}
