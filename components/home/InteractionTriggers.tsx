'use client';

import { ReactNode } from 'react';
import { useHomeInteractions } from './HomeInteractions';

export function ContactTrigger({ className, children }: { className: string; children: ReactNode }) {
  const { openContact } = useHomeInteractions();
  return <button className={className} onClick={openContact} type="button">{children}</button>;
}

export function AvaTrigger({ className, children }: { className: string; children: ReactNode }) {
  const { openAva } = useHomeInteractions();
  return <button className={className} onClick={openAva} type="button">{children}</button>;
}
