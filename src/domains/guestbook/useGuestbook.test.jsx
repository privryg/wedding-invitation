import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const fetchWishes = vi.fn()
const insertWish = vi.fn()

vi.mock('../../infrastructure/supabase/wishRepository.js', () => ({
  fetchWishes: (...a) => fetchWishes(...a),
  insertWish: (...a) => insertWish(...a),
}))

const { useGuestbook } = await import('./useGuestbook.js')

beforeEach(() => vi.clearAllMocks())

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useGuestbook', () => {
  it('loads wishes and reports ready', async () => {
    fetchWishes.mockResolvedValue([{ id: 'a', name: 'Rina', message: 'selamat' }])
    const { result } = renderHook(() => useGuestbook())

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.wishes).toHaveLength(1)
  })

  it('reports error when the initial fetch fails', async () => {
    fetchWishes.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useGuestbook())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.wishes).toEqual([])
  })

  it('prepends the saved wish on success', async () => {
    fetchWishes.mockResolvedValue([{ id: 'a', name: 'Rina', message: 'selamat' }])
    insertWish.mockResolvedValue({ id: 'b', name: 'Sri', message: 'bahagia' })

    const { result } = renderHook(() => useGuestbook())
    await waitFor(() => expect(result.current.status).toBe('ready'))

    let outcome
    await act(async () => {
      outcome = await result.current.addWish('Sri', 'bahagia')
    })

    expect(outcome).toEqual({ ok: true })
    expect(result.current.wishes.map((w) => w.id)).toEqual(['b', 'a'])
  })

  it('rolls the optimistic wish back off the wall when the insert fails', async () => {
    fetchWishes.mockResolvedValue([{ id: 'a', name: 'Rina', message: 'selamat' }])
    insertWish.mockRejectedValue(new Error('violates row-level security policy'))

    const { result } = renderHook(() => useGuestbook())
    await waitFor(() => expect(result.current.status).toBe('ready'))

    let outcome
    await act(async () => {
      outcome = await result.current.addWish('Sri', 'bahagia')
    })

    expect(outcome).toEqual({ ok: false })
    expect(result.current.wishes.map((w) => w.id)).toEqual(['a'])
  })

  it('keeps a wish saved during the initial fetch ahead of the resolved list', async () => {
    const { promise, resolve } = deferred()
    fetchWishes.mockReturnValue(promise)
    insertWish.mockResolvedValue({ id: 'b', name: 'Sri', message: 'bahagia' })

    const { result } = renderHook(() => useGuestbook())
    expect(result.current.status).toBe('loading')

    let outcome
    await act(async () => {
      outcome = await result.current.addWish('Sri', 'bahagia')
    })
    expect(outcome).toEqual({ ok: true })
    expect(result.current.wishes.map((w) => w.id)).toEqual(['b'])

    await act(async () => {
      resolve([{ id: 'a', name: 'Rina', message: 'selamat' }])
      await promise
    })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.wishes.map((w) => w.id)).toEqual(['b', 'a'])
  })

  it('keeps a wish saved during the initial fetch when the fetch rejects', async () => {
    const { promise, reject } = deferred()
    fetchWishes.mockReturnValue(promise)
    insertWish.mockResolvedValue({ id: 'b', name: 'Sri', message: 'bahagia' })
    promise.catch(() => {})

    const { result } = renderHook(() => useGuestbook())
    expect(result.current.status).toBe('loading')

    let outcome
    await act(async () => {
      outcome = await result.current.addWish('Sri', 'bahagia')
    })
    expect(outcome).toEqual({ ok: true })
    expect(result.current.wishes.map((w) => w.id)).toEqual(['b'])

    await act(async () => {
      reject(new Error('offline'))
      await promise.catch(() => {})
    })

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.wishes.map((w) => w.id)).toEqual(['b'])
  })
})
