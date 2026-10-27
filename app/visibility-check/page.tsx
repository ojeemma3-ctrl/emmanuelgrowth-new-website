import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/service-metadata';
import { SiteShell } from '../../components/home/SiteShell';
import { InstantCheck } from '../../components/visibility-check/InstantCheck';

export const metadata: Metadata = pageMetadata(
  '/visibility-check',
  'Free Visibility Check | Emmanuel Growth',
  'Find your business and get instant automated checks of your public Google profile and website, with the top 3 fixes in plain words.',
);

export default function VisibilityCheckPage() {
  return (
    <SiteShell>
      <section className="vc-section">
        <div className="container vc-container">
          <InstantCheck />
        </div>
      </section>
    </SiteShell>
  );
}
