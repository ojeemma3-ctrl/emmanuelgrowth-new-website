import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from './shared';

const principles = [
  'We start with the business problem, not the software.',
  'We use simple tools that fit how you already work.',
  'We keep checking and improving once it is live.',
];

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
);

export function About() {
  return (
    <section className="about-section" id="about">
      <div className="container about-panel">
        <div className="about-photo">
          <span className="about-photo-block" aria-hidden="true" />
          <div className="about-photo-frame">
            {/* TODO(owner): replace with a larger original (at least 1200px wide); the current file is 399x711. */}
            <Image src="/images/emmanuel-founder.webp" alt="Emmanuel, founder of Emmanuel Growth" width={399} height={711} sizes="(max-width: 767px) 300px, 340px" loading="eager" />
            <p className="about-photo-label"><strong>Emmanuel</strong><span>Founder, Emmanuel Growth</span></p>
          </div>
        </div>
        <div className="about-copy">
          <p className="kicker">About Emmanuel Growth</p>
          <h2>Simple marketing systems for <em>real</em> businesses.</h2>
          <p>Emmanuel Growth combines practical sales and marketing experience with modern tools. We start with the business problem. Then we use the right system to help solve it.</p>
          <ul className="about-principles">
            {principles.map((item) => <li key={item}><span aria-hidden="true"><CheckIcon /></span>{item}</li>)}
          </ul>
          <Link className="button button-dark about-cta" href="/visibility-check">Get a free visibility check <Arrow /></Link>
        </div>
      </div>
    </section>
  );
}
