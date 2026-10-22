import Link from 'next/link';
import { HeroDashboard } from './HeroDashboard';

// Four boxes overlapping the bottom of the hero; each links to its part of the page.
const boxes = [
  { title: 'Get Found', line: 'Show up in local search', href: '#get-found' },
  { title: 'Convert Enquiries', line: 'Answer every enquiry', href: '#convert-enquiries' },
  { title: 'Get More Reviews', line: 'Ask after every job', href: '#get-more-reviews' },
  { title: 'One Simple System', line: 'Set up for you', href: '#how-it-works' },
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
            <Link className="button button-growth hero-cta" href="/visibility-check">
              Get a free visibility check
              <span className="hero-cta-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8h9M8.5 4l4 4-4 4" /></svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
      <HeroDashboard />
      <div className="container hero-boxes">
        {boxes.map((box) => (
          <a key={box.title} href={box.href}>
            <strong>{box.title}</strong>
            <span>{box.line}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
