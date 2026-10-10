import type { ReactNode } from 'react';
import { FinalCTA } from './FinalCTA';
import { SiteShell } from './SiteShell';

type ServicePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ServicePage({ eyebrow, title, description, children }: ServicePageProps) {
  return (
    <SiteShell>
      <section className="service-page-heading">
        <div className="container">
          <p className="kicker">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
      {children}
      <FinalCTA />
    </SiteShell>
  );
}
