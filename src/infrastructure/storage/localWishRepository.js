/**
 * Persistence adapter for the guestbook (wishes wall).
 *
 * Wishes survive page reloads via localStorage, exactly like the original
 * invitation. This is the *only* place that knows the storage key or how the
 * wishes are serialized — the guestbook domain talks to this interface.
 */

const WKEY = 'wishes_ryan_eci'

const seed = [
  {
    name: 'Rina',
    message:
      'Selamat menempuh hidup baru, semoga menjadi keluarga sakinah, mawaddah, warahmah!',
  },
  {
    name: 'Bagus',
    message:
      'Barakallahu lakuma wa baraka alaikuma. Bahagia selalu untuk kalian berdua.',
  },
]

export function loadWishes() {
  try {
    return JSON.parse(localStorage.getItem(WKEY)) || seed.slice()
  } catch {
    return seed.slice()
  }
}

export function saveWishes(wishes) {
  try {
    localStorage.setItem(WKEY, JSON.stringify(wishes))
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}
