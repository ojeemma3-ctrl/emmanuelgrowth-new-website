'use client';

import { ReactNode } from 'react';
import { useHomeInteractions } from './HomeInteractions';

// topic: prefilled as the help topic in the contact box (for example a plan name).
export function ContactTrigger({ className, children, topic }: { className: string; children: ReactNode; topic?: string }) {
  const { openContact } = useHomeInteractions();
  return <button className={className} onClick={() => openContact(topic)} type="button" aria-haspopup="dialog">{children}</button>;
}
