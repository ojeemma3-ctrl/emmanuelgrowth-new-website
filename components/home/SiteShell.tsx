import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { HomeInteractions } from './HomeInteractions';
import { InteractionLayer } from './InteractionLayer';

type SiteShellProps = {
  children: ReactNode;
  beforeMain?: ReactNode;
  showAvaLauncher?: boolean;
};

export function SiteShell({ children, beforeMain, showAvaLauncher = true }: SiteShellProps) {
  return (
    <HomeInteractions>
      <div>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        {beforeMain}
        <main id="main-content">{children}</main>
        <Footer />
        <InteractionLayer showAvaLauncher={showAvaLauncher} />
      </div>
    </HomeInteractions>
  );
}
