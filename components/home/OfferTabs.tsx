'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

export type OfferTab = { id: string; number: string; name: string; problem: string; fix: string; bullets: string[]; graphic: ReactNode };

// Line icons for the circle beside each tab's headline: search, chat bubble, star.
const icons: Record<string, ReactNode> = {
  'get-found': <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  'convert-enquiries': <path d="M5 18.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8Z" />,
  'get-more-reviews': <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8Z" />,
};

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
);

// Three tabs, one panel. The first tab is selected by default. Arrow keys, Home and End move between tabs.
// Links to #get-found, #convert-enquiries and #get-more-reviews (the tab ids) select that tab.
export function OfferTabs({ items }: { items: OfferTab[] }) {
  const [active, setActive] = useState(0);
  // The graphic plays only while the panel is on screen; it restarts each time the panel comes back into view.
  const [visible, setVisible] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasVisible = useRef(false);

  useEffect(() => {
    const node = panelRef.current;
    if (!node || !('IntersectionObserver' in window)) { const t = window.setTimeout(() => setVisible(true), 0); return () => window.clearTimeout(t); }
    const observer = new IntersectionObserver((entries) => {
      const on = entries.some((e) => e.isIntersecting);
      if (on && !wasVisible.current) setPlayKey((k) => k + 1);
      wasVisible.current = on;
      setVisible(on);
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const fromHash = () => {
      const index = items.findIndex((item) => `#${item.id}` === window.location.hash);
      if (index >= 0) setActive(index);
    };
    const start = window.setTimeout(fromHash, 0);
    window.addEventListener('hashchange', fromHash);
    return () => { window.clearTimeout(start); window.removeEventListener('hashchange', fromHash); };
  }, [items]);

  const select = (index: number, focus = false) => {
    setActive(index);
    const tab = tabs.current[index];
    if (focus) tab?.focus({ preventScroll: true });
    // On narrow screens the tab row scrolls sideways: keep the selected tab fully in view (row only, not the page).
    const row = tab?.parentElement;
    if (tab && row && row.scrollWidth > row.clientWidth) {
      const left = tab.offsetLeft - 20;
      const right = tab.offsetLeft + tab.offsetWidth + 20 - row.clientWidth;
      if (row.scrollLeft > left) row.scrollLeft = left;
      else if (row.scrollLeft < right) row.scrollLeft = right;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = items.length - 1;
    const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  const item = items[active];
  return (
    <>
      <div className="ot-tabs" role="tablist" aria-label="Three places to win more customers">
        {items.map((tab, index) => (
          <button
            key={tab.id}
            id={tab.id}
            ref={(el) => { tabs.current[index] = el; }}
            className="ot-tab"
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls="offer-tabpanel"
            tabIndex={index === active ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={onKeyDown}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="ot-panel" id="offer-tabpanel" role="tabpanel" aria-labelledby={item.id} tabIndex={0} ref={panelRef}>
        <div className="ot-fade" key={item.id}>
          <div className="ot-text">
            <span className="ot-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icons[item.id]}</svg></span>
            <h3 id={`${item.id}-title`}>&ldquo;{item.problem}&rdquo;</h3>
            <p className="offer-fix">{item.fix}</p>
            <ul className="offer-bullets">
              {item.bullets.map((b) => <li key={b}><span aria-hidden="true"><CheckIcon /></span>{b}</li>)}
            </ul>
            <ContactTrigger className="button button-dark">Fix this problem <Arrow /></ContactTrigger>
          </div>
          <div className={`ot-graphic${visible ? '' : ' is-paused'}`} key={playKey}>{item.graphic}</div>
        </div>
      </div>
      <p className="ot-caption">Example</p>
    </>
  );
}
