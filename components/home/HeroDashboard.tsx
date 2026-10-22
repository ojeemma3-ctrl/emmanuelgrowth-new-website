// Hero example: a dashboard window built in code that leans in from the right edge. Example data only.
const nav = ['Dashboard', 'Get Found', 'Conversations', 'Reviews', 'Calendar', 'Reports'];
const tiles = [
  { label: 'Found on Google', value: '128' },
  { label: 'New messages', value: '12' },
  { label: 'Replies sent', value: '11' },
  { label: 'New reviews', value: '4' },
];
const conversations = [
  { initials: 'SM', name: 'Sophie Martin', preview: 'Table for 4 on Saturday?', dot: 'pink' },
  { initials: 'JB', name: 'Julien Bernard', preview: 'Can I change my date?', dot: 'green' },
  { initials: 'LC', name: 'Léa Chevalier', preview: 'Do you ship wine?', dot: 'blue' },
];
const ratings = [{ stars: 5, width: 86 }, { stars: 4, width: 14 }, { stars: 3, width: 4 }];

export function HeroDashboard() {
  return (
    <div className="hd-wrap">
      <p className="sr-only">Example: a dashboard for a winery showing today’s Google views, new messages, replies sent and new reviews, with recent conversations and a 4.8 review rating.</p>
      <div className="hd-window" aria-hidden="true">
        <aside className="hd-side">
          <div className="hd-badge"><span>CL</span>Château Lumière</div>
          <ul>{nav.map((item, i) => <li key={item} className={i === 0 ? 'is-active' : undefined}>{item}</li>)}</ul>
        </aside>
        <div className="hd-main">
          <p className="hd-title">Today</p>
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
              <p className="hd-card-title">Reviews · 4.8 <span className="hd-stars">★★★★★</span></p>
              <ul className="hd-bars">
                {ratings.map((r) => <li key={r.stars}><span>{r.stars}★</span><span className="hd-track"><i style={{ width: `${r.width}%` }} /></span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p className="hd-caption">Example</p>
    </div>
  );
}
