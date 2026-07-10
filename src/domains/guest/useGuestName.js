import { defaultGuestName } from '../../config/invitation.config.js'

/**
 * Resolves the invited guest's name from the `?to=` query parameter, falling
 * back to a generic label. Read once at render — the URL doesn't change during
 * a visit.
 */
export function useGuestName() {
  const to = new URLSearchParams(window.location.search).get('to')
  if (!to) return defaultGuestName
  try {
    return decodeURIComponent(to)
  } catch {
    return to
  }
}
