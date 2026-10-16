'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { SourceChip } from './shared';

type Phase = 'static' | 'waiting' | 'playing';

// Plays once when the panel scrolls into view. Server render, no-JS and reduced motion stay on the final state.
function usePlayOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('static');

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    // Already on screen at load: leave the final state rather than flash it away.
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;
    setPhase('waiting');
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setPhase('playing');
        observer.disconnect();
      }
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, phase };
}

function Stage({ phase, stageRef, children }: { phase: Phase; stageRef: React.RefObject<HTMLDivElement | null>; children: ReactNode }) {
  return <div className={`offer-ui${phase === 'static' ? '' : ` is-${phase}`}`} ref={stageRef} aria-hidden="true">{children}</div>;
}

const at = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

const query = 'plumber near me';

export function FoundVisual() {
  const { ref, phase } = usePlayOnView();
  const [typed, setTyped] = useState(0);
  const shownChars = phase === 'static' ? query.length : phase === 'waiting' ? 0 : typed;

  useEffect(() => {
    if (phase !== 'playing') return;
    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setTyped(count);
      if (count >= query.length) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [phase]);

  return (
    <Stage phase={phase} stageRef={ref}>
      <div className="ui-search seq" style={at(0)}>
        <SourceChip source="google" />
        <span className="ui-typed">{query.slice(0, shownChars)}<i className={phase === 'playing' && shownChars < query.length ? 'is-typing' : ''} /></span>
      </div>
      <div className="ui-card ui-listing seq" style={at(1100)}>
        <div className="ui-listing-head">
          <span className="ui-logo">Y</span>
          <div><strong>Your Business</strong><small>Plumber · Open now</small></div>
        </div>
        <div className="ui-actions"><span>Call</span><span>WhatsApp</span><span>Book</span></div>
      </div>
      <div className="ui-card ui-float ui-float-right ui-highlight seq" style={at(2000)}>Found on Google</div>
    </Stage>
  );
}

export function ConvertVisual() {
  const { ref, phase } = usePlayOnView();
  return (
    <Stage phase={phase} stageRef={ref}>
      <div className="ui-card ui-chat seq" style={at(0)}>
        <div className="ui-chat-head"><SourceChip source="whatsapp" /><span>New message</span></div>
        <p className="ui-msg ui-msg-in seq" style={at(300)}>Hi, can you fit me in this week?</p>
        <p className="ui-msg ui-msg-out seq" style={at(1000)}>Yes! Here are the free slots. Tap one to book.</p>
        <div className="ui-slots seq" style={at(1700)}><span>Tue 10:00</span><span className="is-picked" style={at(2300)}>Wed 14:30</span><span>Fri 09:00</span></div>
      </div>
      <div className="ui-card ui-float ui-float-left seq" style={at(2800)}><span className="ui-check">✓</span>Booking confirmed</div>
    </Stage>
  );
}

export function ReviewsVisual() {
  const { ref, phase } = usePlayOnView();
  return (
    <Stage phase={phase} stageRef={ref}>
      <div className="ui-card ui-chat seq" style={at(0)}>
        <p className="ui-msg ui-msg-out seq" style={at(300)}>Thanks for choosing us today! Would you leave a quick review?</p>
        <span className="ui-review-button seq" style={at(900)}>Leave a review</span>
        <div className="ui-stars">{[0, 1, 2, 3, 4].map((i) => <i key={i} style={at(1400 + i * 250)}>★</i>)}</div>
        <div className="ui-sources seq" style={at(2700)}><span>Review on</span><SourceChip source="google" /><SourceChip source="trustpilot" /></div>
      </div>
      <div className="ui-card ui-float ui-float-right seq" style={at(3100)}><span className="ui-dot" />New review received</div>
    </Stage>
  );
}
