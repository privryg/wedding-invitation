import { useRef, useState } from 'react'
import { copyText } from '../utils/clipboard.js'

/**
 * Button that copies `value` to the clipboard and briefly shows a "Tersalin ✓"
 * confirmation, mirroring the original `[data-copy]` handler.
 */
export default function CopyButton({ value, className = '', children }) {
  const [done, setDone] = useState(false)
  const timer = useRef(null)

  const handle = () => {
    copyText(value)
      .then(() => {
        setDone(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setDone(false), 1600)
      })
      .catch(() => {})
  }

  return (
    <button type="button" className={`${className}${done ? ' done' : ''}`} onClick={handle}>
      {done ? (
        'Tersalin ✓'
      ) : (
        children
      )}
    </button>
  )
}
