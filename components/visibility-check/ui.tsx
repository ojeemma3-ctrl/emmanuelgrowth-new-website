// Small presentational pieces for the visibility check: inline SVG icons, status chip, step bar, ring.
import type { CSSProperties, ReactNode } from 'react';
import type { Status } from './findings';

const paths: Record<string, ReactNode> = {
  building: <><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" /><path d="M15 10h4a1 1 0 0 1 1 1v10" /><path d="M8 8h3M8 12h3M8 16h3M3 21h18" /></>,
  pin: <><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: <><path d="M12 8v5" /><path d="M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></>,
  cross: <path d="M7 7l10 10M17 7 7 17" />,
  question: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.4M12 17v.1" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.2 6L12 16.8 6.5 19.6l1.2-6-4.5-4.2 6.1-.8Z" />,
  chat: <path d="M4 18V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8Z" />,
  bolt: <path d="M13 3 5 13h6l-1 8 8-10h-6Z" />,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  table: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16" /></>,
  cards: <><rect x="3" y="4" width="8" height="7" rx="1.5" /><rect x="13" y="4" width="8" height="7" rx="1.5" /><rect x="3" y="13" width="8" height="7" rx="1.5" /><rect x="13" y="13" width="8" height="7" rx="1.5" /></>,
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="ic-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

const statusLook: Record<Status, { cls: string; icon: IconName }> = {
  Good: { cls: 'is-good', icon: 'check' },
  'Needs attention': { cls: 'is-attention', icon: 'alert' },
  Problem: { cls: 'is-problem', icon: 'cross' },
  'Couldn’t check': { cls: 'is-unknown', icon: 'question' },
  'Not checked automatically': { cls: 'is-unknown', icon: 'question' },
};

export const statusClass = (status: Status) => statusLook[status].cls;

// Status is always shown with an icon and its text label, never colour alone.
export function StatusChip({ status, label }: { status: Status; label?: string }) {
  const look = statusLook[status];
  return <span className={`ic-status ${look.cls}`}><Icon name={look.icon} size={14} />{label ?? status}</span>;
}

export type StepState = 'done' | 'current' | 'upcoming';

export function StepBar({ steps }: { steps: { label: string; state: StepState; href?: string }[] }) {
  return (
    <nav className="ic-steps" aria-label="Check progress">
      <ol>
        {steps.map((step, i) => {
          const body = (
            <>
              <span className="ic-step-num" aria-hidden="true">{step.state === 'done' ? <Icon name="check" size={14} /> : i + 1}</span>
              <span className="ic-step-label">{step.label}</span>
            </>
          );
          return (
            <li key={step.label} className={`ic-step is-${step.state}`} aria-current={step.state === 'current' ? 'step' : undefined}>
              {step.href ? <a href={step.href}>{body}</a> : <span>{body}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Ring showing the real share of checks passed. The fill animates only when motion is allowed (see CSS).
export function Ring({ passed, total }: { passed: number; total: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const share = total ? passed / total : 0;
  return (
    <div className="ic-ring" role="img" aria-label={`${passed} of ${total} checks passed`}>
      <svg viewBox="0 0 100 100" width="112" height="112" aria-hidden="true">
        <circle className="ic-ring-track" cx="50" cy="50" r={r} />
        <circle className="ic-ring-fill" cx="50" cy="50" r={r} style={{ '--ring-c': c, '--ring-offset': c * (1 - share) } as CSSProperties} />
      </svg>
      <span className="ic-ring-text" aria-hidden="true"><strong>{passed}</strong><small>of {total}</small></span>
    </div>
  );
}
