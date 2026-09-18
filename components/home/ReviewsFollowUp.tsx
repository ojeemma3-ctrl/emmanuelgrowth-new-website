import { OfferSection } from './OfferSection';

function RetentionVisual() {
  return <div className="system-visual retention-visual" aria-label="A customer receives follow-up, leaves a review and stays connected">
    <div className="customer-row"><span>✓</span><div><small>CUSTOMER SERVED</small><strong>Keep the relationship moving.</strong></div></div><div className="follow-line" aria-hidden="true" />
    <div className="follow-card"><small>2 DAYS LATER</small><strong>How was your experience?</strong><span>Leave honest feedback →</span></div>
    <div className="review-card"><span aria-label="5 stars">★★★★★</span><p>Review received and ready for a thoughtful reply.</p></div><div className="return-row"><span>Customer follow-up</span><strong>Stay connected →</strong></div>
  </div>;
}

export function ReviewsFollowUp() {
  return <OfferSection id="retain" eyebrow="03 / REVIEWS + CUSTOMER FOLLOW-UP" title="Turn happy customers into trust." problem="The relationship should not end when the first sale is complete." body="We help you ask for reviews, reply to customers and stay connected after the sale." items={['Review requests and Google review follow-up', 'AI-assisted review replies', 'Customer follow-up and reactivation', 'Repeat campaigns across appropriate channels']} visual={<RetentionVisual />} />;
}
