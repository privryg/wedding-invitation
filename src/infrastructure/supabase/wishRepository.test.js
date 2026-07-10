import { describe, it, expect, vi, beforeEach } from 'vitest'

const order = vi.fn()
const select = vi.fn(() => ({ order }))
const single = vi.fn()
const insertSelect = vi.fn(() => ({ single }))
const insert = vi.fn(() => ({ select: insertSelect }))
const from = vi.fn(() => ({ select, insert }))

vi.mock('./client.js', () => ({ supabase: { from: (...a) => from(...a) } }))

const { fetchWishes, insertWish } = await import('./wishRepository.js')

beforeEach(() => vi.clearAllMocks())

describe('fetchWishes', () => {
  it('returns wishes newest first, stripped to id/name/message', async () => {
    order.mockResolvedValue({
      data: [
        { id: 'b', name: 'Bagus', message: 'kedua', created_at: '2026-07-02' },
        { id: 'a', name: 'Rina', message: 'pertama', created_at: '2026-07-01' },
      ],
      error: null,
    })

    const wishes = await fetchWishes()

    expect(from).toHaveBeenCalledWith('wishes')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(wishes).toEqual([
      { id: 'b', name: 'Bagus', message: 'kedua' },
      { id: 'a', name: 'Rina', message: 'pertama' },
    ])
  })

  it('throws when supabase returns an error', async () => {
    order.mockResolvedValue({ data: null, error: { message: 'boom' } })
    await expect(fetchWishes()).rejects.toThrow('boom')
  })
})

describe('insertWish', () => {
  it('returns the created wish', async () => {
    single.mockResolvedValue({ data: { id: 'c', name: 'Sri', message: 'selamat' }, error: null })
    const wish = await insertWish({ name: 'Sri', message: 'selamat' })
    expect(insert).toHaveBeenCalledWith({ name: 'Sri', message: 'selamat' })
    expect(wish).toEqual({ id: 'c', name: 'Sri', message: 'selamat' })
  })

  it('throws when the insert is rejected by RLS', async () => {
    single.mockResolvedValue({ data: null, error: { message: 'violates row-level security policy' } })
    await expect(insertWish({ name: '', message: '' })).rejects.toThrow('row-level security')
  })
})
