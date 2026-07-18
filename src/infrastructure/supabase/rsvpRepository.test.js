import { describe, it, expect, vi, beforeEach } from 'vitest'

const insert = vi.fn()
const from = vi.fn(() => ({ insert }))

vi.mock('./client.js', () => ({ supabase: { from: (...a) => from(...a) } }))

const { insertRsvp } = await import('./rsvpRepository.js')

beforeEach(() => vi.clearAllMocks())

describe('insertRsvp', () => {
  it('inserts a row, coercing guestCount to an int', async () => {
    insert.mockResolvedValue({ error: null })

    await insertRsvp({ name: 'Sri', whatsapp: '0812 3456 7890', attendance: 'Hadir', guestCount: '2' })

    expect(from).toHaveBeenCalledWith('rsvps')
    expect(insert).toHaveBeenCalledWith({
      name: 'Sri',
      whatsapp: '0812 3456 7890',
      attendance: 'Hadir',
      guest_count: 2,
    })
  })

  it('throws when the insert is rejected by RLS', async () => {
    insert.mockResolvedValue({ error: { message: 'violates row-level security policy' } })
    await expect(
      insertRsvp({ name: '', whatsapp: '', attendance: 'Hadir', guestCount: '1' }),
    ).rejects.toThrow('row-level security')
  })
})
