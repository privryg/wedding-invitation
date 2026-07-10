/** Floating "back to top" control, shown once the invitation is open. */
export default function BackToTop({ show }) {
  const toTop = (e) => {
    e.stopPropagation()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <button
      className={`fab backtop${show ? ' show' : ''}`}
      aria-label="Kembali ke awal"
      onClick={toTop}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 19V6" />
        <path d="M6 12l6-6 6 6" />
      </svg>
    </button>
  )
}
