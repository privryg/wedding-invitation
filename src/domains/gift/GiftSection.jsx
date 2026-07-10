import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import CopyButton from '../../shared/components/CopyButton.jsx'
import { gifts, giftAddress, giftHeadings } from '../../config/invitation.config.js'
import './gift.css'

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 012-2h10" />
  </svg>
)

/** "Tanda Kasih" — bank transfers (Amplop Digital) and a postal address (Kirim Kado). */
export default function GiftSection() {
  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="serif-lg">Tanda Kasih</div>
        <p className="body-cop" style={{ maxWidth: 340, margin: '10px auto 0', fontSize: 18 }}>
          Doa restu Anda merupakan karunia yang sangat berarti. Namun bila memberi adalah tanda kasih,
          Anda dapat mengirimkannya melalui:
        </p>

        <div className="gift-group-title">{giftHeadings.transfer}</div>
        <div className="gift">
          {gifts.map((g, i) => (
            <div className="gift-card" key={i}>
              <div className="gift-bank">
                {/* when a logo exists it stands in for the bank name; alt keeps it announced */}
                {g.logo ? <img className="gift-logo" src={g.logo} alt={g.bank} /> : g.bank}
              </div>
              <div className="gift-no">{g.number}</div>
              <div className="gift-name">{g.holder}</div>
              <CopyButton className="copy-btn" value={g.copyValue}>
                <CopyIcon />
                {g.copyLabel}
              </CopyButton>
            </div>
          ))}
        </div>

        <div className="gift-group-title">{giftHeadings.parcel}</div>
        <div className="gift">
          <div className="gift-addr">
            {/* heading above already names this group, so the mark is decorative */}
            <div className="gift-bank">
              <img className="gift-icon" src={giftAddress.icon} alt="" />
            </div>
            <div className="gift-addr-line">{giftAddress.address}</div>
            <div className="gift-name">{giftAddress.recipient}</div>
            <CopyButton className="copy-btn" value={giftAddress.copyValue}>
              <CopyIcon />
              {giftAddress.copyLabel}
            </CopyButton>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
