'use client';

import { useEffect, useRef, useState } from 'react';
import { SourceChip, type Source } from './shared';

// Step n shows cards whose `at` <= n. Step 1 adds "Found on Google" to the first card.
const cards: { at: number; source: Source; title: string; detail?: string; detailAt?: number; badge?: string; stars?: boolean }[] = [
  { at: 0, source: 'google', title: 'Someone searched “restaurant near me”', detail: 'Found on Google', detailAt: 1, badge: 'Found' },
  { at: 2, source: 'whatsapp', title: 'Customer asks', detail: '“Do you have space on Friday?”', badge: 'New' },
  { at: 3, source: 'whatsapp', title: 'Reply sent in seconds', detail: 'Friday has free slots. Tap a time to book.', badge: 'Replied' },
  { at: 4, source: 'whatsapp', title: 'Booking confirmed', detail: 'Friday 14:00', badge: 'Booked' },
  { at: 5, source: 'google', title: 'Review request sent', stars: true },
];

const stages = ['Get Found', 'Convert Enquiries', 'Get More Reviews'];

const FINAL_STEP = 5;
const RESET_STEP = 6;
// Time spent on each step before moving on (ms). Roughly 9 seconds per loop.
const durations = [1200, 1200, 1300, 1300, 1300, 2200, 500];

export function HeroStory() {
  // Server render and reduced motion show the finished story.
  const [step, setStep] = useState(FINAL_STEP);
  const [paused, setPaused] = useState(false);
  const [animated, setAnimated] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setAnimated(!motion.matches);
      setStep(motion.matches ? FINAL_STEP : RESET_STEP);
    };
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!animated || paused) return;
    timer.current = window.setTimeout(() => setStep((current) => (current + 1) % (RESET_STEP + 1)), durations[step]);
    return () => window.clearTimeout(timer.current);
  }, [animated, paused, step]);

  const visible = step === RESET_STEP ? -1 : step;
  const latest = cards.reduce((last, card, index) => (visible >= card.at ? index : last), -1);
  // Which service the story is on: search → Get Found, WhatsApp → Convert Enquiries, review → Get More Reviews.
  const activeStage = visible < 0 ? -1 : visible <= 1 ? 0 : visible <= 4 ? 1 : 2;

  return (
    <div
      className={`hero-stage${paused ? ' is-paused' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <ul className="stage-tags" aria-hidden="true">
        {stages.map((stage, index) => (
          <li className={`stage-tag stage-tag-${index + 1}${activeStage === index ? ' is-active' : ''}`} key={stage}>
            <span className="stage-dot" />{stage}
          </li>
        ))}
      </ul>
      <div className="hero-panel">
        <div className="hero-panel-bar">
          <span className="hero-panel-dots" aria-hidden="true"><i /><i /><i /></span>
          <span>Your growth system</span>
          <span className="story-progress" aria-hidden="true">
            {cards.map((card) => <i className={visible >= card.at ? 'is-done' : ''} key={card.title} />)}
          </span>
          <span className="hero-panel-label">Example</span>
        </div>
        <div
          className="hero-panel-body"
          role="img"
          aria-label="Example: someone searches for a restaurant and finds the business on Google, asks on WhatsApp about Friday, gets a reply in seconds, books Friday at 14:00, and is then asked for a five-star review."
        >
          {cards.map((card, index) => {
            const shown = visible >= card.at;
            const detailShown = shown && visible >= (card.detailAt ?? card.at);
            return (
              <div className={`story-card${shown ? ' is-shown' : ''}${index === latest ? ' is-latest' : ''}`} key={card.title} aria-hidden="true">
                <SourceChip source={card.source} />
                <div className="story-text">
                  <strong>{card.title}</strong>
                  {card.detail ? <small className={detailShown ? 'is-shown' : ''}>{card.detail}</small> : null}
                  {card.stars ? (
                    <span className={`story-stars${shown ? ' is-filling' : ''}`}>
                      {[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ animationDelay: `${300 + i * 200}ms` }}>★</i>)}
                    </span>
                  ) : null}
                </div>
                {card.badge ? <em className={detailShown ? 'is-shown' : ''}>{card.badge}</em> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
