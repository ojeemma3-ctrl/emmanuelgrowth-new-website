import type { ReactNode } from 'react';
import { Footer } from '../home/Footer';
import { Header } from '../home/Header';
import { HomeInteractions } from '../home/HomeInteractions';
import { InteractionLayer } from '../home/InteractionLayer';

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <HomeInteractions>
      <div className="legal-page-shell">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content">
          <header className="legal-hero" id="top">
            <div className="container legal-container">
              <p className="kicker">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{intro}</p>
            </div>
          </header>
          <article className="container legal-container legal-content">
            {children}
          </article>
        </main>
        <Footer />
        <InteractionLayer />
      </div>
    </HomeInteractions>
  );
}
