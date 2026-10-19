'use client';

import { createContext, FormEvent, ReactNode, RefObject, useContext, useEffect, useRef, useState } from 'react';

type QuickMessageResult = {
  success: boolean;
  message: string;
};

type HomeInteractionContextValue = {
  contactOpen: boolean;
  contactRef: RefObject<HTMLElement | null>;
  contactTopic: string | null; // e.g. "Get Found" or "Waitlist: Convert Enquiries", prefilled in the contact box
  openContact: (topic?: string) => void;
  closeContact: () => void;
  submitQuickMessage: (event: FormEvent<HTMLFormElement>, onResult?: (result: QuickMessageResult) => void) => Promise<void>;
};

const HomeInteractionContext = createContext<HomeInteractionContextValue | null>(null);

export function useHomeInteractions() {
  const context = useContext(HomeInteractionContext);
  if (!context) throw new Error('useHomeInteractions must be used within HomeInteractions');
  return context;
}

export function HomeInteractions({ children }: { children: ReactNode }) {
  const contactRef = useRef<HTMLElement>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactTopic, setContactTopic] = useState<string | null>(null);

  const openContact = (topic?: string) => {
    dialogTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setContactTopic(typeof topic === 'string' && topic ? topic : null);
    setContactOpen(true);
  };
  const closeContact = () => {
    const target = dialogTrigger.current;
    setContactOpen(false);
    window.setTimeout(() => { if (target?.isConnected) target.focus(); }, 0);
  };
  const submitQuickMessage = async (event: FormEvent<HTMLFormElement>, onResult?: (result: QuickMessageResult) => void) => {
    event.preventDefault();
    const form = event.currentTarget;

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const contactValue = String(data.get('contact') ?? '').trim();
    const help = String(data.get('help') ?? '').trim();

    if (!name || !contactValue || !help) {
      onResult?.({ success: false, message: 'Please complete all fields and try again.' });
      return;
    }

    try {
      const isEmail = contactValue.includes('@');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact: contactValue,
          help,
          isEmail,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Something went wrong while sending your message.');
      }

      form.reset();
      onResult?.({ success: true, message: 'Thanks — your message has been sent.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while sending your message.';
      onResult?.({ success: false, message });
    }
  };

  useEffect(() => {
    const dialog = contactOpen ? contactRef.current : null;
    if (!dialog) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'));
    window.setTimeout(() => focusables()[0]?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeContact();
      if (event.key !== 'Tab') return;
      const nodes = focusables();
      if (!nodes.length) return;
      if (event.shiftKey && document.activeElement === nodes[0]) {
        event.preventDefault();
        nodes[nodes.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) {
        event.preventDefault();
        nodes[0].focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [contactOpen]);

  return (
    <HomeInteractionContext.Provider value={{
      contactOpen,
      contactTopic,
      contactRef,
      openContact,
      closeContact,
      submitQuickMessage,
    }}>
      {children}
    </HomeInteractionContext.Provider>
  );
}
