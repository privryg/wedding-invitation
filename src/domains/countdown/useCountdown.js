import { useEffect, useState } from 'react'
import { computeCountdown } from './countdown.js'

/** Ticks every second toward `targetISO`, returning { d, h, m, s } strings. */
export function useCountdown(targetISO) {
  const target = new Date(targetISO).getTime()
  const [time, setTime] = useState(() => computeCountdown(target, Date.now()))

  useEffect(() => {
    const tick = () => setTime(computeCountdown(target, Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return time
}
