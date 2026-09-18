'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-reveal > *', { y: 20, autoAlpha: 0, duration: 0.65, stagger: 0.08, ease: 'power3.out' });
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((section) => gsap.from(section.children, { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 82%', once: true } }));
      gsap.timeline({ scrollTrigger: { trigger: document.getElementById('how-it-works'), start: 'top 72%', once: true }, defaults: { duration: 0.5, ease: 'power2.out' } }).from('.demo-message', { y: 12, autoAlpha: 0, stagger: 0.28 }).from('.demo-capture', { y: 10, autoAlpha: 0 }, '>-0.1').from('.demo-action', { y: 10, autoAlpha: 0 }, '>-0.1');
    });
    return () => mm.revert();
  });

  return null;
}
