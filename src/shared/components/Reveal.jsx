import { useEffect, useRef, useState } from 'react'

/**
 * Wraps a block and fades/blurs it into view once it enters the viewport,
 * reproducing the original `.reveal` / `.reveal.in` scroll behavior with an
 * IntersectionObserver (no scroll listener thrash).
 */
export default function Reveal({ children, className = '', ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Mirror the original threshold: reveal when the top nears the fold.
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -70px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <div ref={ref} className={`reveal${shown ? ' in' : ''}${className ? ' ' + className : ''}`} {...rest}>
      {children}
    </div>
  )
}
