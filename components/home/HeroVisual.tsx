// The hero's example visual: a dashboard for an invented hotel, built in code. Example data only.
// This file is ONLY the picture. Position, cropping, dimming and every fade live in HeroVisualFrame.tsx,
// so this component can be replaced by an image or a video (any element that fills its box) and keep
// the same place and fades. Keep the replacement decorative: the frame already marks it aria-hidden.
const nav = ['Dashboard', 'Get Found', 'Conversations', 'Reviews', 'Calendar', 'Reports'];
const tiles = [
  { label: 'Found on Google', value: '128' },
  { label: 'New messages', value: '12' },
  { label: 'Replies sent', value: '11' },
  { label: 'New reviews', value: '4' },
];
const conversations = [
  { initials: 'SM', name: 'Sophie Martin', preview: 'Room for 2 on Friday?', dot: 'pink' },
  { initials: 'JB', name: 'Julien Bernard', preview: 'Can I change my dates?', dot: 'green' },
  { initials: 'LC', name: 'Léa Chevalier', preview: 'Is breakfast included?', dot: 'blue' },
];
const ratings = [{ stars: 5, width: 86 }, { stars: 4, width: 14 }, { stars: 3, width: 4 }];

// Read by HeroVisualFrame for screen readers; update it when the visual changes.
export const heroVisualDescription = 'Example: a dashboard for a hotel showing today’s Google views, new messages, replies sent and new reviews, with recent guest conversations and a 4.6 review rating.';

export function HeroVisual() {
  return (
    <div className="hd-window">
      <aside className="hd-side">
        <div className="hd-badge"><span>HH</span>Harbour Hotel</div>
        <ul>{nav.map((item, i) => <li key={item} className={i === 0 ? 'is-active' : undefined}>{item}</li>)}</ul>
      </aside>
      <div className="hd-main">
        <div className="hd-head"><p className="hd-title">Today</p><span className="hd-pill">Example</span></div>
        <div className="hd-tiles">
          {tiles.map((t) => <div key={t.label}><span>{t.label}</span><b>{t.value}</b></div>)}
        </div>
        <div className="hd-cards">
          <div className="hd-card">
            <p className="hd-card-title">Conversations</p>
            <ul className="hd-convs">
              {conversations.map((c) => (
                <li key={c.initials}>
                  <span className="hd-avatar">{c.initials}<i className={`hd-dot is-${c.dot}`} /></span>
                  <span><strong>{c.name}</strong><span>{c.preview}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hd-card">
            <p className="hd-card-title">Reviews · 4.6 <span className="hd-stars">★★★★★</span></p>
            <ul className="hd-bars">
              {ratings.map((r) => <li key={r.stars}><span>{r.stars}★</span><span className="hd-track"><i style={{ width: `${r.width}%` }} /></span></li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
