'use client';

import Image from 'next/image';
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
        <a className="brand" href="/" aria-label="Emmanuel Growth home">
          <Image className="brand-mark" src="/favicon.svg" alt="" width={36} height={36} priority />
          <span className="brand-label">EMMANUEL <b>GROWTH</b></span>
        </a>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
        <nav id="site-nav" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
          <a href="/#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
          <button className="button button-dark nav-button" onClick={startContact} type="button">Get Started <Arrow /></button>
        </nav>
      </div>
    </header>
  );
}
