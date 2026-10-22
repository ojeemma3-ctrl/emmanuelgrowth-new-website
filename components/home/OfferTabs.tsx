'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

export type OfferTab = { id: string; number: string; name: string; problem: string; fix: string; bullets: string[]; phone: ReactNode };

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
);

// Three tabs, one panel. The first tab is selected by default. Arrow keys, Home and End move between tabs.
// Links to #get-found, #convert-enquiries and #get-more-reviews (the tab ids) select that tab.
export function OfferTabs({ items }: { items: OfferTab[] }) {
  const [active, setActive] = useState(0);
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
    if (focus) tabs.current[index]?.focus();
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
      <div className="ot-panel" id="offer-tabpanel" role="tabpanel" aria-labelledby={item.id} tabIndex={0}>
        <div className="ot-fade" key={item.id}>
          <div className="ot-text">
            <span className="ot-number">{item.number}</span>
            <h3 id={`${item.id}-title`}>&ldquo;{item.problem}&rdquo;</h3>
            <p className="offer-fix">{item.fix}</p>
            <ul className="offer-bullets">
              {item.bullets.map((b) => <li key={b}><span aria-hidden="true"><CheckIcon /></span>{b}</li>)}
            </ul>
            <ContactTrigger className="button button-dark">Fix this problem <Arrow /></ContactTrigger>
          </div>
          <div className="ot-stage">{item.phone}</div>
        </div>
      </div>
      <p className="ot-caption">Example</p>
    </>
  );
}
