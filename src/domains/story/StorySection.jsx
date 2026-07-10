import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { story } from '../../config/invitation.config.js'
import './story.css'

/** "Perjalanan Kami" — the couple's love-story timeline. */
export default function StorySection() {
  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">Love Story</div>
        <div className="serif-lg">Perjalanan Kami</div>
        <div className="story">
          {story.map((item, i) => (
            <div className="story-item" key={i}>
              <div className="story-year">{item.year}</div>
              <div className="story-head">{item.head}</div>
              <div className="story-txt">{item.text}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
