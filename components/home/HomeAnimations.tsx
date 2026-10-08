'use client';

import { useEffect } from 'react';

export function HomeAnimations() {
  useEffect(() => {
    let cancelled = false;
    let revertAnimations: (() => void) | undefined;

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.from('.hero-reveal > *', { y: 20, autoAlpha: 0, duration: 0.65, stagger: 0.08, ease: 'power3.out' });
          gsap.utils.toArray<HTMLElement>('.reveal').forEach((section) => gsap.from(section.children, { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 82%', once: true } }));
          gsap.timeline({ scrollTrigger: { trigger: document.getElementById('how-it-works'), start: 'top 72%', once: true }, defaults: { duration: 0.5, ease: 'power2.out' } }).from('.demo-message', { y: 12, autoAlpha: 0, stagger: 0.28 }).from('.demo-capture', { y: 10, autoAlpha: 0 }, '>-0.1').from('.demo-action', { y: 10, autoAlpha: 0 }, '>-0.1');
        });
        revertAnimations = () => media.revert();
      })
      .catch((error: unknown) => {
        if (!cancelled) console.error('[HomeAnimations] GSAP initialization failed.', error);
      });

    return () => {
      cancelled = true;
      revertAnimations?.();
    };
  }, []);

  return null;
}
