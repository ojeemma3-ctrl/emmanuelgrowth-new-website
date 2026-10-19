// Keeps the finished, public result in this browser tab (sessionStorage) for up to 2 hours,
// so Back, refresh or an accidental click doesn't lose it. Restoring makes no API calls.
// Never stores the visitor's email or phone number: CheckState only holds public business data.
import type { CheckState } from './InstantCheck';

const KEY = 'emmanuel-growth:visibility-check:v1';
export const SAVED_MAX_AGE_MS = 2 * 60 * 60 * 1000;

type Saved = { savedAt: number; check: CheckState; ticket: string | null; unlocked?: boolean };

export function saveResult(check: CheckState, ticket: string | null, unlocked: boolean) {
  try {
    // Updating the same check (a keyword comparison, unlocking, a restore) keeps the original time,
    // so a result never lives longer than 2 hours from when the check ran.
    const previous = loadResult();
    const savedAt = previous && previous.ticket === ticket ? previous.savedAt : Date.now();
    const value: Saved = { savedAt, check, ticket, unlocked };
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the result still shows, it just won't survive a refresh.
  }
}

export function loadResult(): Saved | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    if (!saved?.check || typeof saved.savedAt !== 'number' || Date.now() - saved.savedAt > SAVED_MAX_AGE_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export function clearResult() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
