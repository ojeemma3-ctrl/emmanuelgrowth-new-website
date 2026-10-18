'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Suggestion } from '../../lib/visibility/places';
import { Icon } from './ui';

// Accessible combobox backed by /api/visibility/autocomplete (Google key stays on the server).
export function BusinessSearch({ sessionToken, onPick, onUnavailable }: { sessionToken: string; onPick: (s: Suggestion) => void; onUnavailable: () => void }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const listId = useId();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (query.trim().length < 3) return;
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/visibility/autocomplete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: query, sessionToken }) });
        const data = await res.json() as { suggestions?: Suggestion[]; error?: string };
        if (data.error === 'not_configured') {
          setMessage('Business search isn’t switched on yet. Use “My business isn’t listed” below.');
          onUnavailable();
          return;
        }
        if (data.error) {
          setMessage('Search is busy right now. Please try again shortly.');
          return;
        }
        setItems(data.suggestions ?? []);
        setActive(-1);
        setOpen(true);
        setMessage((data.suggestions ?? []).length ? '' : 'No matches yet. Try adding your town.');
      } catch {
        setMessage('Search is not reachable right now. Please try again.');
      }
    }, 280);
    return () => window.clearTimeout(timer.current);
  }, [query, sessionToken, onUnavailable]);

  const pick = (s: Suggestion) => {
    setOpen(false);
    setQuery(s.main);
    onPick(s);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !items.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((a) => (a + 1) % items.length); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    if (event.key === 'Enter' && active >= 0) { event.preventDefault(); pick(items[active]); }
    if (event.key === 'Escape') setOpen(false);
  };

  const showList = open && items.length > 0 && query.trim().length >= 3;

  return (
    <div className="ic-search">
      <label htmlFor="ic-business">Business name</label>
      <div className="ic-field">
      <Icon name="search" />
      <input
        id="ic-business"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Start typing your business name"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
      />
      </div>
      {showList ? (
        <ul className="ic-suggestions" id={listId} role="listbox" aria-label="Matching businesses">
          {items.map((s, i) => (
            <li
              key={s.placeId}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'is-active' : ''}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
            >
              <strong>{s.main}</strong>
              <span>{s.secondary}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="ic-hint" aria-live="polite">{message || 'Pick your business from the list.'}</p>
    </div>
  );
}
