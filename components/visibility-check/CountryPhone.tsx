'use client';

// WhatsApp number with a searchable country selector. Countries and dial codes come from
// libphonenumber-js (min metadata); names come from the browser (Intl.DisplayNames).
// Flags are shown as a two-letter code pill: SVG flags would need another dependency.
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js/min';
import { Icon } from './ui';

export type Country = { code: CountryCode; name: string; dial: string };

let cached: Country[] | null = null;
export function countryList(): Country[] {
  if (cached) return cached;
  const names = typeof Intl !== 'undefined' && 'DisplayNames' in Intl ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
  cached = getCountries()
    .map((code) => ({ code, name: names?.of(code) ?? code, dial: `+${getCountryCallingCode(code)}` }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return cached;
}

export const findCountry = (code?: string | null) => countryList().find((c) => c.code === code?.toUpperCase());

function CodePill({ country }: { country: Country }) {
  return <span className="ic-code-pill" aria-hidden="true">{country.code}</span>;
}

export function CountryPhone({ country, onCountry, value, onValue, invalid, describedBy }: {
  country: Country;
  onCountry: (c: Country) => void;
  value: string;
  onValue: (v: string) => void;
  invalid: boolean;
  describedBy?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return countryList();
    return countryList().filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.dial.slice(1).startsWith(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const openList = () => {
    setQuery('');
    setActive(Math.max(0, countryList().findIndex((c) => c.code === country.code)));
    setOpen(true);
  };

  const choose = (c: Country) => {
    onCountry(c);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(matches.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (matches[active]) choose(matches[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  const listId = `${id}-list`;
  return (
    <div className="ic-phone" ref={wrapRef}>
      <div className="ic-phone-row">
        <button
          ref={buttonRef}
          type="button"
          className="ic-country-btn"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${country.name} ${country.dial}. Change country`}
          onClick={() => (open ? setOpen(false) : openList())}
        >
          <CodePill country={country} />
          <span className="ic-country-dial">{country.dial}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        <div className="ic-phone-input">
          <input
            id="ic-unlock-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            maxLength={20}
            value={value}
            onChange={(e) => onValue(e.target.value)}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          />
        </div>
      </div>

      {open ? (
        <div className="ic-country-pop">
          <label className="sr-only" htmlFor={`${id}-search`}>Search countries</label>
          <div className="ic-field">
            <Icon name="search" />
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={matches[active] ? `${id}-${matches[active].code}` : undefined}
              placeholder="Search country or code"
              autoComplete="off"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onKey}
            />
          </div>
          <ul className="ic-country-list" role="listbox" id={listId} ref={listRef} aria-label="Countries">
            {matches.length ? matches.map((c, i) => (
              <li
                key={c.code}
                id={`${id}-${c.code}`}
                role="option"
                aria-selected={i === active}
                className={c.code === country.code ? 'is-current' : undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
                onMouseEnter={() => setActive(i)}
              >
                <CodePill country={c} />
                <span className="ic-country-name">{c.name}</span>
                <span className="ic-country-dial">{c.dial}</span>
              </li>
            )) : <li className="ic-country-empty" role="presentation">No country matches “{query}”.</li>}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
