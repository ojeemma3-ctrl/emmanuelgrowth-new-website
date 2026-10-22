'use client';

import { useEffect, useRef, useState } from 'react';

// Hero example: a calm preview of a visibility check report. Example data only.
// Fades up once when it scrolls into view; server render, no-JS and reduced motion show it straight away.
const rows = [
  { area: 'Reviews', status: 'Good', tone: 'good' },
  { area: 'Website', status: 'Needs attention', tone: 'attention' },
  { area: 'Consistency', status: 'Needs attention', tone: 'attention' },
] as const;

const PASSED = 16;
const TOTAL = 21;

export function HeroReport() {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return; // already on screen: no flash
    const start = window.setTimeout(() => setHidden(true), 0);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setHidden(false);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => { window.clearTimeout(start); observer.disconnect(); };
  }, []);

  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <figure className={`calm-figure calm-hero${hidden ? ' is-hidden' : ''}`} ref={ref}>
      <p className="sr-only">Example: a sample visibility check report showing 16 of 21 checks passed, with Reviews marked Good and Website and Consistency marked Needs attention.</p>
      <div className="calm-card" aria-hidden="true">
        <div className="calm-head"><strong>Visibility check</strong><span className="calm-tag">Sample report</span></div>
        <div className="calm-score">
          <div className="calm-ring">
            <svg viewBox="0 0 108 108" width="116" height="116">
              <circle cx="54" cy="54" r={r} fill="none" stroke="#EEEEEA" strokeWidth="10" />
              <circle cx="54" cy="54" r={r} fill="none" stroke="#C6F135" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - PASSED / TOTAL)} transform="rotate(-90 54 54)" />
            </svg>
            <span><b>{PASSED}</b><small>of {TOTAL}</small></span>
          </div>
          <div>
            <p className="calm-score-title">{PASSED} of {TOTAL} checks passed</p>
            <p className="calm-muted">Automated checks of your public Google profile and website.</p>
          </div>
        </div>
        <ul className="calm-rows">
          {rows.map((row) => <li key={row.area}><span>{row.area}</span><span className={`calm-pill is-${row.tone}`}>{row.status}</span></li>)}
        </ul>
      </div>
      <figcaption className="calm-caption">Example</figcaption>
    </figure>
  );
}
