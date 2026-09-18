'use client';

export const OPEN_COOKIE_SETTINGS_EVENT = 'emmanuel-growth:open-cookie-settings';

export function CookieSettingsButton() {
  return (
    <button
      className="footer-link-button"
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  );
}
