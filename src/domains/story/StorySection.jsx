import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { story, storyIntro, storyClosing } from '../../config/invitation.config.js'
import './story.css'

/** "Our Love Story" — four steps, each with the line-art illustration from the
 *  artwork. The copy is real text, not baked into the image, so it stays
 *  readable at phone widths and can be edited in the config. */
export default function StorySection() {
  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">Our</div>
        <div className="serif-lg">Love Story</div>
        <p className="story-intro">{storyIntro}</p>

        <div className="story">
          {story.map((item) => (
            <div className="story-item" key={item.step}>
              <img className="story-illo" src={item.illustration} alt="" />
              <div className="story-step">{item.step}</div>
              <div className="story-head">{item.head}</div>
              <div className="story-txt">{item.text}</div>
            </div>
          ))}
        </div>

        <p className="story-closing">{storyClosing}</p>
      </Reveal>
    </section>
  )
}
