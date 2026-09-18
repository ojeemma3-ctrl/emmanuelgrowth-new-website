'use client';

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
        <a className="brand" href="#top" aria-label="Emmanuel Growth home">EMMANUEL <span>GROWTH</span></a>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
        <nav id="site-nav" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#journey" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <button className="button button-dark nav-button" onClick={startContact} type="button">Get Started <Arrow /></button>
        </nav>
      </div>
    </header>
  );
}
