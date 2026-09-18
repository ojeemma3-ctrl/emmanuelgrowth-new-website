'use client';

import Script from 'next/script';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { OPEN_COOKIE_SETTINGS_EVENT } from './CookieSettingsButton';

type ConsentChoice = 'accepted' | 'rejected';
type StoredConsent = { choice: ConsentChoice; updatedAt: number };

const STORAGE_KEY = 'emmanuel-growth-analytics-consent:v1';
const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;

function readConsent(): ConsentChoice | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const value = JSON.parse(stored) as Partial<StoredConsent>;
    const validChoice = value.choice === 'accepted' || value.choice === 'rejected';
    const validDate = typeof value.updatedAt === 'number' && Date.now() - value.updatedAt < CONSENT_LIFETIME;
    return validChoice && validDate ? value.choice : null;
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, updatedAt: Date.now() } satisfies StoredConsent));
  } catch {
    // Consent still applies for this page view when browser storage is unavailable.
  }
}

function removeAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));

  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.emmanuelgrowth.com; SameSite=Lax`;
  }
}

export function AnalyticsConsent({ measurementId }: { measurementId: string }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const initialization = window.setTimeout(() => {
      setChoice(readConsent());
      setReady(true);
    }, 0);

    const openSettings = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setSettingsOpen(true);
      window.setTimeout(() => panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus(), 0);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => {
      window.clearTimeout(initialization);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  const closeSettings = () => {
    setSettingsOpen(false);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  };

  const acceptAnalytics = () => {
    saveConsent('accepted');
    setChoice('accepted');
    setSettingsOpen(false);
  };

  const rejectAnalytics = () => {
    const wasAccepted = choice === 'accepted';
    saveConsent('rejected');
    setChoice('rejected');
    setSettingsOpen(false);
    removeAnalyticsCookies();
    if (wasAccepted) window.location.reload();
  };

  const showPanel = ready && (choice === null || settingsOpen);

  return (
    <>
      {choice === 'accepted' ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
          <Script id="emmanuel-growth-google-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('config','${measurementId}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
          </Script>
        </>
      ) : null}

      {showPanel ? (
        <div className="cookie-banner" ref={panelRef} role="dialog" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description">
          <div className="cookie-banner-copy">
            <p className="kicker">YOUR PRIVACY</p>
            <h2 id="cookie-consent-title">Choose whether to share analytics.</h2>
            <p id="cookie-consent-description">
              We use optional Google Analytics cookies to understand how the website is used. They stay off unless you accept. Read our <Link href="/cookie-policy">Cookie Policy</Link>.
            </p>
          </div>
          <div className="cookie-banner-actions">
            <button className="button button-outline" type="button" onClick={rejectAnalytics}>Reject analytics</button>
            <button className="button button-dark" type="button" onClick={acceptAnalytics}>Accept analytics</button>
            {choice !== null ? <button className="cookie-close" type="button" onClick={closeSettings}>Keep current choice</button> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
