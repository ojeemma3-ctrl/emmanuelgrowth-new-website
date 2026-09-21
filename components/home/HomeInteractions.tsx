'use client';

import { createContext, FormEvent, ReactNode, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { whatsappNumber } from './content';

type QuickMessageResult = {
  success: boolean;
  message: string;
};

type HomeInteractionContextValue = {
  avaOpen: boolean;
  contactOpen: boolean;
  choice: string;
  message: string;
  submitted: string;
  drawerRef: RefObject<HTMLElement | null>;
  contactRef: RefObject<HTMLElement | null>;
  launcherRef: RefObject<HTMLButtonElement | null>;
  openContact: () => void;
  closeContact: () => void;
  openAva: () => void;
  closeAva: () => void;
  resetAva: () => void;
  setChoice: (choice: string) => void;
  setMessage: (message: string) => void;
  submitMessage: (event: FormEvent<HTMLFormElement>) => void;
  submitQuickMessage: (event: FormEvent<HTMLFormElement>, onResult?: (result: QuickMessageResult) => void) => Promise<void>;
};

const HomeInteractionContext = createContext<HomeInteractionContextValue | null>(null);

export function useHomeInteractions() {
  const context = useContext(HomeInteractionContext);
  if (!context) throw new Error('useHomeInteractions must be used within HomeInteractions');
  return context;
}

export function HomeInteractions({ children }: { children: ReactNode }) {
  const drawerRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const [avaOpen, setAvaOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [choice, setChoice] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState('');

  const rememberTrigger = () => {
    dialogTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : launcherRef.current;
  };
  const openContact = () => {
    rememberTrigger();
    setContactOpen(true);
  };
  const closeContact = () => {
    const target = dialogTrigger.current;
    setContactOpen(false);
    window.setTimeout(() => (target?.isConnected ? target : launcherRef.current)?.focus(), 0);
  };
  const openAva = () => {
    dialogTrigger.current = contactOpen ? launcherRef.current : (document.activeElement instanceof HTMLElement ? document.activeElement : launcherRef.current);
    setContactOpen(false);
    setAvaOpen(true);
  };
  const closeAva = () => {
    const target = dialogTrigger.current;
    setAvaOpen(false);
    window.setTimeout(() => (target?.isConnected ? target : launcherRef.current)?.focus(), 0);
  };
  const resetAva = () => {
    setChoice('');
    setMessage('');
    setSubmitted('');
  };
  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSubmitted(message.trim());
    setChoice('Not sure yet');
    setMessage('');
  };
  const submitQuickMessage = async (event: FormEvent<HTMLFormElement>, onResult?: (result: QuickMessageResult) => void) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
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

      event.currentTarget.reset();
      onResult?.({ success: true, message: 'Thanks — your message has been sent.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while sending your message.';
      onResult?.({ success: false, message });
    }
  };

  useEffect(() => {
    const dialog = contactOpen ? contactRef.current : avaOpen ? drawerRef.current : null;
    if (!dialog) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'));
    window.setTimeout(() => focusables()[0]?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (contactOpen) closeContact();
        else closeAva();
      }
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
  }, [avaOpen, contactOpen]);

  return (
    <HomeInteractionContext.Provider value={{
      avaOpen,
      contactOpen,
      choice,
      message,
      submitted,
      drawerRef,
      contactRef,
      launcherRef,
      openContact,
      closeContact,
      openAva,
      closeAva,
      resetAva,
      setChoice,
      setMessage,
      submitMessage,
      submitQuickMessage,
    }}>
      {children}
    </HomeInteractionContext.Provider>
  );
}
