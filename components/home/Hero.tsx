import { HeroReport } from './HeroReport';
import Link from 'next/link';
import { Arrow } from './shared';

const outcomes = [
  { title: 'Get Found', text: 'Show up when local customers search.', href: '#get-found' },
  { title: 'Convert Enquiries', text: 'Every enquiry gets a quick first answer.', href: '#convert-enquiries' },
  { title: 'Get More Reviews', text: 'Happy customers leave proof for you.', href: '#get-more-reviews' },
  { title: 'One simple system', text: 'Set up for you, easy to run day to day.', href: '#how-it-works' },
];

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy hero-reveal">
          <p className="hero-badge"><span aria-hidden="true">●</span>Practical marketing systems for real businesses</p>
          <h1>Get found.<br />Convert more enquiries.<br />Get more <em>reviews.</em></h1>
          <p>All the simple tools you need to turn searches into enquiries, enquiries into bookings, and customers into reviews.</p>
          <div className="button-row">
            <Link className="button button-growth" href="/visibility-check">Get a free visibility check <Arrow /></Link>
            <a className="button button-ghost" href="#services">See Our Services</a>
          </div>
          <p className="hero-cta-note">Takes about 60 seconds</p>
        </div>
        <HeroReport />
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
