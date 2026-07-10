import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { gallery } from '../../config/invitation.config.js'
import './gallery.css'

/** "Momen Kami" — the photos laid out as a 2-column grid. */
export default function GallerySection() {
  return (
    <section className="gallery">
      <Reveal>
        <OrnDivider />
        <div className="kicker">Galeri</div>
        <div className="serif-lg">Momen Kami</div>
        <div className="gal-grid">
          {gallery.map((src, i) => (
            <div className="gal-item" key={i}>
              <div className="ph" style={{ backgroundImage: `url('${src}')` }} />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
