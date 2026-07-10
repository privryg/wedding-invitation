/** Copy text to the clipboard, falling back to a hidden textarea + execCommand
 *  on browsers without the async Clipboard API. */
export function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((res, rej) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
      res()
    } catch (e) {
      rej(e)
    }
    document.body.removeChild(ta)
  })
}
