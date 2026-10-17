import type { Metadata } from 'next';
import { SiteShell } from '../../components/home/SiteShell';
import { VisibilityCheck } from '../../components/visibility-check/VisibilityCheck';

export const metadata: Metadata = {
  title: 'Free Visibility Check | Emmanuel Growth',
  description: 'Answer 8 quick questions to see where customers might be slipping away. A free self-check based on your answers — nothing is saved.',
  alternates: { canonical: '/visibility-check' },
};

export default function VisibilityCheckPage() {
  return (
    <SiteShell>
      <section className="vc-section">
        <div className="container vc-container">
          <VisibilityCheck />
        </div>
      </section>
    </SiteShell>
  );
}
