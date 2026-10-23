import type { Metadata } from 'next';
import { ConvertCard, FoundCard, ReviewsCard } from '../../components/home/OfferCards';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';

export const metadata: Metadata = {
  title: 'Complete System | Emmanuel Growth',
  description: 'Get Found, Convert Enquiries and Get More Reviews working together as one simple system.',
  alternates: { canonical: '/complete-system' },
};

const plan = plans.find((p) => p.id === 'complete-system')!;
// The status shown on this page comes from the pricing config (for example early access and its waitlist button).
const status = plan.status === 'early-access' ? 'Early access' : 'Available';

const parts = [
  { name: 'Get Found', line: 'Local customers find you and contact you in one tap.', graphic: <FoundCard /> },
  { name: 'Convert Enquiries', line: 'Every enquiry gets a quick first reply and a follow-up.', graphic: <ConvertCard /> },
  { name: 'Get More Reviews', line: 'Happy customers get one tap to review you.', graphic: <ReviewsCard /> },
];

export default function CompleteSystemPage() {
  return (
    <ServicePage
      planId="complete-system"
      kicker={`Complete system · ${status}`}
      title="Complete system"
      description="Get Found, Convert Enquiries and Get More Reviews set up to work together, so a search can become an enquiry, a booking and then a review."
      visual={<ConvertCard />}
      pointsTitle="Three parts, one system"
      points={[
        'Get Found: show up in local search',
        'Convert Enquiries: answer every enquiry',
        'Get More Reviews: ask after every job',
      ]}
      faqs={[
        { question: 'Is it available now?', answer: plan.status === 'early-access' ? 'The Complete system is in early access. Use “Join the waitlist” and tell us a little about your business.' : 'Yes. Ask for a free personal review to get started.' },
        { question: 'Can I start with one service instead?', answer: 'Yes. You can start with one service and add the others later.' },
        { question: 'How is it billed?', answer: plan.finePrint.join(' ') },
      ]}
      closingHeading="Get all three working together."
    >
      <section className="svc-section svc-together" aria-labelledby="svc-together-title">
        <div className="container">
          <h2 id="svc-together-title">How they work together</h2>
          <ol className="svc-together-list">
            {parts.map((part, i) => (
              <li key={part.name}>
                <figure className="svc-together-visual">{part.graphic}</figure>
                <p className="svc-together-step">{String(i + 1).padStart(2, '0')}</p>
                <h3>{part.name}</h3>
                <p>{part.line}</p>
              </li>
            ))}
          </ol>
          <p className="svc-together-caption">Example</p>
        </div>
      </section>
    </ServicePage>
  );
}
