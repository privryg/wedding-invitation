import { describe, it, expect, vi, beforeEach } from 'vitest'

const invoke = vi.fn()

vi.mock('./client.js', () => ({ supabase: { functions: { invoke: (...a) => invoke(...a) } } }))

const { notifyRsvp } = await import('./rsvpNotifier.js')

beforeEach(() => vi.clearAllMocks())

describe('notifyRsvp', () => {
  it('resolves ok: true when the function reports success', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null })

    const result = await notifyRsvp({ name: 'Sri', whatsapp: '0812', attendance: 'yes', guestCount: 2 })

    expect(result).toEqual({ ok: true })
  })

  it('resolves ok: false when invoke reports a transport/function error', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'invalid rsvp' } })

    const result = await notifyRsvp({ name: 'Sri', whatsapp: '0812', attendance: 'yes', guestCount: 2 })

    expect(result).toEqual({ ok: false })
  })

  it('resolves ok: false when the function body itself reports ok: false', async () => {
    invoke.mockResolvedValue({ data: { ok: false }, error: null })

    const result = await notifyRsvp({ name: 'Sri', whatsapp: '0812', attendance: 'yes', guestCount: 2 })

    expect(result).toEqual({ ok: false })
  })

  it('resolves ok: false without throwing when the body is a non-JSON string', async () => {
    invoke.mockResolvedValue({ data: 'some string', error: null })

    await expect(
      notifyRsvp({ name: 'Sri', whatsapp: '0812', attendance: 'yes', guestCount: 2 })
    ).resolves.toEqual({ ok: false })
  })

  it('invokes notify-rsvp with exactly the rsvp fields as the body', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null })

    await notifyRsvp({ name: 'Sri', whatsapp: '0812', attendance: 'yes', guestCount: 2 })

    expect(invoke).toHaveBeenCalledWith('notify-rsvp', {
      body: { name: 'Sri', whatsapp: '0812', attendance: 'yes', guestCount: 2 },
    })
  })
})
