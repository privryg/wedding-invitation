/** The four-point star ornament divider that heads most content sections. */
export default function OrnDivider() {
  return (
    <div className="orn-div">
      <span className="ln" />
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
      </svg>
      <span className="ln r" />
    </div>
  )
}
