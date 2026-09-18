'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useHomeInteractions } from './HomeInteractions';
import { Arrow } from './shared';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openContact } = useHomeInteractions();
  const startContact = () => {
    openContact();
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link className="brand" href="/" aria-label="Emmanuel Growth home">
          <Image className="brand-mark" src="/favicon.svg" alt="" width={36} height={36} priority />
          <span className="brand-label">EMMANUEL <b>GROWTH</b></span>
        </Link>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
        <nav id="site-nav" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
          <Link href="/#services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
          <button className="button button-dark nav-button" onClick={startContact} type="button">Get Started <Arrow /></button>
        </nav>
      </div>
    </header>
  );
}
