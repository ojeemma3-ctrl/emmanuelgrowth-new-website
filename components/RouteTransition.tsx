'use client';

// Page changes open at the top instantly, then fade the new page in (about 200ms).
// The site keeps smooth scrolling for in-page anchors; `html.is-routing` turns it off while
// the route changes, so the router's jump to the top (or Back's restore) isn't animated.
// Reduced motion: no fade (see .route-enter in globals.css).

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const html = () => document.documentElement;

export function RouteTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const fromBack = useRef(false);
  const lastPath = useRef(pathname);

  useEffect(() => {
    let fallback = 0;
    // Safety net: never leave smooth scrolling off if a page change doesn't happen.
    const startRouting = () => {
      html().classList.add('is-routing');
      window.clearTimeout(fallback);
      fallback = window.setTimeout(() => html().classList.remove('is-routing'), 5000);
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      startRouting();
    };
    // Browsers also fire popstate for in-page anchors (#...): those keep smooth scrolling.
    const onPop = () => {
      if (window.location.pathname === lastPath.current) return;
      fromBack.current = true;
      startRouting();
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    return () => {
      window.clearTimeout(fallback);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  useEffect(() => {
    lastPath.current = pathname;
    if (first.current) {
      first.current = false;
      return;
    }
    const root = html();
    root.classList.add('is-routing');
    // A new page opens at the top; Back and Forward keep the position the router restores.
    if (!fromBack.current && !window.location.hash) window.scrollTo(0, 0);
    root.classList.remove('route-enter');
    void root.offsetWidth; // restart the fade if pages change quickly
    root.classList.add('route-enter');
    const restoreAfter = fromBack.current ? 1000 : 50;
    fromBack.current = false;
    const restore = window.setTimeout(() => root.classList.remove('is-routing'), restoreAfter);
    const fade = window.setTimeout(() => root.classList.remove('route-enter'), 300);
    return () => {
      window.clearTimeout(restore);
      window.clearTimeout(fade);
    };
  }, [pathname]);

  return null;
}
