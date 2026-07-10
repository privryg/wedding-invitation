import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Reveal (rendered by WishesSection) observes its ref with IntersectionObserver,
// which jsdom does not implement.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = IntersectionObserverStub

const useGuestbook = vi.fn()

vi.mock('./useGuestbook.js', () => ({
  useGuestbook: (...a) => useGuestbook(...a),
}))

const { default: WishesSection } = await import('./WishesSection.jsx')

const ERROR_MSG = 'Ucapan tidak dapat dimuat saat ini.'
const LOADING_MSG = 'Memuat ucapan...'

describe('WishesSection', () => {
  it('renders a saved wish even when the fetch is in the error state', () => {
    useGuestbook.mockReturnValue({
      wishes: [{ id: 'b', name: 'Sri', message: 'bahagia' }],
      status: 'error',
      addWish: vi.fn(),
    })
    render(<WishesSection />)

    expect(screen.getByText('Sri')).not.toBeNull()
    expect(screen.getByText('bahagia')).not.toBeNull()
    expect(screen.queryByText(ERROR_MSG)).toBeNull()
  })

  it('renders a saved wish while the fetch is still loading', () => {
    useGuestbook.mockReturnValue({
      wishes: [{ id: 'b', name: 'Sri', message: 'bahagia' }],
      status: 'loading',
      addWish: vi.fn(),
    })
    render(<WishesSection />)

    expect(screen.getByText('Sri')).not.toBeNull()
    expect(screen.getByText('bahagia')).not.toBeNull()
    expect(screen.queryByText(LOADING_MSG)).toBeNull()
  })

  it('shows an error message when the fetch failed and no wishes are available', () => {
    useGuestbook.mockReturnValue({
      wishes: [],
      status: 'error',
      addWish: vi.fn(),
    })
    render(<WishesSection />)

    expect(screen.getByText(ERROR_MSG)).not.toBeNull()
  })

  it('shows a loading message while fetching and no wishes are available yet', () => {
    useGuestbook.mockReturnValue({
      wishes: [],
      status: 'loading',
      addWish: vi.fn(),
    })
    render(<WishesSection />)

    expect(screen.getByText(LOADING_MSG)).not.toBeNull()
  })
})
