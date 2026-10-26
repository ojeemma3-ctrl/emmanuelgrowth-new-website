import { CONTACT_TOPICS } from '../../lib/check-config';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

// The custom website offer (5 to 10 pages, quoted on request; no price shown). Used under the home pricing cards
// and after "What you get" on /get-found. The button opens the contact box with the website topic.
export function CustomWebsiteCard({ heading = 'Need a custom website?', as: Heading = 'h3' }: { heading?: string; as?: 'h2' | 'h3' }) {
  return (
    <div className="cw-card">
      <span className="cw-chip" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
          <path d="M3 9h18M6.5 6.8h.01M9 6.8h.01M7 13h6M7 16h10" />
        </svg>
      </span>
      <div className="cw-copy">
        <Heading className="cw-title">{heading}</Heading>
        <p>5 to 10 pages, designed around your business. Tell me what you need and I will quote it.</p>
      </div>
      <ContactTrigger className="button button-dark cw-button" topic={CONTACT_TOPICS.websiteImprovements}>Tell me what you need <Arrow /></ContactTrigger>
    </div>
  );
}
