import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

const outcomes = [
  { title: 'Get Found', text: 'Show up when local customers search.', href: '#get-found' },
  { title: 'Convert Enquiries', text: 'Every enquiry gets a quick first answer.', href: '#convert-enquiries' },
  { title: 'Get More Reviews', text: 'Happy customers leave proof for you.', href: '#get-more-reviews' },
  { title: 'One simple system', text: 'Set up for you, easy to run day to day.', href: '#journey' },
];

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy hero-reveal">
          <p className="hero-badge"><span aria-hidden="true">●</span>Practical marketing systems for real businesses</p>
          <h1>Get found.<br />Convert more enquiries.<br /><em>Get more reviews.</em></h1>
          <p>All the simple tools you need to turn searches into enquiries, enquiries into bookings, and customers into reviews.</p>
          <div className="button-row">
            <ContactTrigger className="button button-growth">Get a free visibility check <Arrow /></ContactTrigger>
            <a className="button button-ghost" href="#services">See Our Services</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Example of what your growth dashboard could look like">
          <div className="hero-panel-bar">
            <span className="hero-panel-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>Your growth system · example</span>
          </div>
          <div className="hero-panel-body">
            <div className="panel-row panel-enquiry">
              <span className="panel-avatar" aria-hidden="true">S</span>
              <div><strong>New enquiry · WhatsApp</strong><small>&ldquo;Do you have space this Friday?&rdquo;</small></div>
              <em>Replied</em>
            </div>
            <div className="panel-row panel-booking">
              <span className="panel-avatar" aria-hidden="true">✓</span>
              <div><strong>Booking confirmed</strong><small>Reminder sent the day before</small></div>
              <em>Booked</em>
            </div>
            <div className="panel-row panel-review">
              <span className="panel-avatar" aria-hidden="true">★</span>
              <div><strong>Review request sent</strong><small>One tap to your Google page</small></div>
              <em>★★★★★</em>
            </div>
            <div className="panel-journey" aria-hidden="true">
              {['Found', 'Enquiry', 'Booked', 'Review'].map((step) => <span key={step}>{step}</span>)}
            </div>
          </div>
        </div>
      </div>
      <div className="container hero-outcomes">
        {outcomes.map((item) => (
          <a key={item.title} href={item.href}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
