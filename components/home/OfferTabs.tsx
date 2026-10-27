'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ContactTrigger } from './InteractionTriggers';
import { FOUND_LOOP_MS } from './OfferCards';
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

// Length of one motion-graphic loop: 9.6s (mg-* keyframes in globals.css), Get Found 11.2s (gf-* keyframes).
// The progress bar under the active tab fills over this time, then the next tab opens.
const LOOP_MS: Record<string, number> = { 'get-found': FOUND_LOOP_MS };
const loopMs = (id: string) => LOOP_MS[id] ?? 9600;

// One tab's text half. `sizer` copies are invisible and inert: all three sit in the same grid cell as the
// visible panel so the panel always takes the tallest tab's height and never jumps when the tab changes.
function TabText({ item, sizer = false }: { item: OfferTab; sizer?: boolean }) {
  return (
    <div className="ot-text">
      <span className="ot-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icons[item.id]}</svg></span>
      <h3 id={sizer ? undefined : `${item.id}-title`}>{item.problem}</h3>
      <p className="offer-fix">{item.fix}</p>
      <ul className="offer-bullets">
        {item.bullets.map((b) => <li key={b}><span aria-hidden="true"><CheckIcon /></span>{b}</li>)}
      </ul>
      {sizer ? <span className="button button-dark">Fix this problem <Arrow /></span> : <ContactTrigger className="button button-dark">Fix this problem <Arrow /></ContactTrigger>}
    </div>
  );
}

// Three tabs, one panel. The first tab is selected by default. Arrow keys, Home and End move between tabs.
// Links to #get-found, #convert-enquiries and #get-more-reviews (the tab ids) select that tab.
// Automatic switching (1 → 2 → 3 → 1) runs until the visitor clicks a tab, the Next button, uses the keyboard
// on the tabs or follows a tab link; then it stops for this page view. It pauses while the section is
// off-screen and while the pointer or focus is inside the panel, and never runs with reduced motion.
export function OfferTabs({ items }: { items: OfferTab[] }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [visible, setVisible] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [auto, setAuto] = useState(false);
  const [holding, setHolding] = useState(false); // pointer or focus inside the panel
  const panelRef = useRef<HTMLDivElement>(null);
  const wasVisible = useRef(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Automatic switching only when motion is allowed (decided after mount, so the server render stays static).
  useEffect(() => {
    const t = window.setTimeout(() => setAuto(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), 0);
    return () => window.clearTimeout(t);
  }, []);

  // The graphic plays only while the panel is on screen; it restarts each time the panel comes back into view.
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

  useEffect(() => {
    const fromHash = (user: boolean) => {
      const index = items.findIndex((item) => `#${item.id}` === window.location.hash);
      if (index < 0) return;
      setActive(index);
      if (user) setAuto(false);
    };
    const start = window.setTimeout(() => fromHash(true), 0);
    const onHash = () => fromHash(true);
    window.addEventListener('hashchange', onHash);
    return () => { window.clearTimeout(start); window.removeEventListener('hashchange', onHash); };
  }, [items]);

  const select = (index: number, { focus = false, user = true }: { focus?: boolean; user?: boolean } = {}) => {
    const last = items.length - 1;
    const forward = index > active || (active === last && index === 0);
    setDirection(index === active ? direction : forward ? 'next' : 'prev');
    setActive(index);
    if (user) setAuto(false);
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
  const nextIndex = active === items.length - 1 ? 0 : active + 1;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = items.length - 1;
    const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, { focus: true });
  };

  const paused = !visible || (auto && holding);
  const item = items[active];
  return (
    <>
      <div className="ot-tabbar">
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
              {auto && index === active ? (
                <span
                  className={`ot-progress${paused ? ' is-paused' : ''}`}
                  key={`${active}-${playKey}`}
                  style={{ animationDuration: `${loopMs(tab.id)}ms` }}
                  onAnimationEnd={() => select(nextIndex, { user: false })}
                  aria-hidden="true"
                />
              ) : null}
            </button>
          ))}
        </div>
        <button className="ot-next" type="button" aria-controls="offer-tabpanel" onClick={() => select(nextIndex)}>
          Next <span aria-hidden="true">→</span><span className="sr-only">: {items[nextIndex].name}</span>
        </button>
      </div>
      <div
        className="ot-panel"
        id="offer-tabpanel"
        role="tabpanel"
        aria-labelledby={item.id}
        aria-live="off"
        tabIndex={0}
        ref={panelRef}
        onMouseEnter={() => setHolding(true)}
        onMouseLeave={() => setHolding(false)}
        onFocus={() => setHolding(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHolding(false); }}
      >
        {items.map((tab) => (
          <div className="ot-fade ot-sizer" key={`sizer-${tab.id}`} aria-hidden="true" inert>
            <TabText item={tab} sizer />
            <div className="ot-graphic" />
          </div>
        ))}
        <div className={`ot-fade is-${direction}`} key={item.id}>
          <TabText item={item} />
          <div className={`ot-graphic${paused ? ' is-paused' : ''}`} key={playKey}>{item.graphic}</div>
        </div>
      </div>
    </>
  );
}
