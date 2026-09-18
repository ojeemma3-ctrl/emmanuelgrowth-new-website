import { OfferSection } from './OfferSection';

function DiscoveryVisual() {
  return <div className="system-visual discovery-visual" aria-label="A customer finds a business online, visits its website and chooses to call, message or book">
    <div className="search-bar"><span aria-hidden="true">⌕</span><span>service near me</span></div>
    <div className="search-result"><div className="result-mark">EG</div><div><small>LOCAL BUSINESS</small><strong>Clear, useful, easy to choose.</strong><p>Open today · Nearby</p></div></div>
    <div className="visual-path" aria-hidden="true"><i /><i /><i /></div>
    <div className="action-row"><span>Visit</span><span>Message</span><span>Book</span></div>
  </div>;
}

export function GetFound() {
  return <OfferSection id="get-found" eyebrow="01 / LOCAL VISIBILITY + LEAD CAPTURE" title="Make it easier for customers to find you." problem="People cannot choose a business they cannot find or understand." body="We improve your online presence and give people a simple way to call, message or book." items={['Google Business Profile setup and improvement', 'Simple websites and landing pages', 'Contact forms, WhatsApp and call buttons', 'Booking, lead capture and basic tracking']} visual={<DiscoveryVisual />} />;
}
