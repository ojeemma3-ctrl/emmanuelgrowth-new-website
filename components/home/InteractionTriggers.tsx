'use client';

import { ReactNode } from 'react';
import { useHomeInteractions } from './HomeInteractions';

export function ContactTrigger({ className, children }: { className: string; children: ReactNode }) {
  const { openContact } = useHomeInteractions();
  return <button className={className} onClick={openContact} type="button" aria-haspopup="dialog">{children}</button>;
}
