import type { Metadata } from 'next';
import { ReviewsCard } from '../../components/home/OfferCards';
import { offers } from '../../components/home/OfferSections';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';

export const metadata: Metadata = {
  title: 'Get More Reviews | Emmanuel Growth',
  description: 'Get more reviews from happy customers, with simple follow-up that builds trust and repeat business.',
  alternates: { canonical: '/build-trust' },
};

const offer = offers.find((o) => o.id === 'get-more-reviews')!;
const plan = plans.find((p) => p.id === 'get-more-reviews')!;

export default function GetMoreReviewsPage() {
  return (
    <ServicePage
      planId="get-more-reviews"
      kicker="Service 03 · Get More Reviews"
      title="Get More Reviews"
      description="Turn happy customers into reviews, repeat business and lasting trust."
      visual={<ReviewsCard />}
      points={offer.home.bullets}
      faqs={[
        { question: 'How do customers get the request?', answer: 'By text, WhatsApp or email after their visit, with one tap to your review page.' },
        { question: 'Do you write reviews for me?', answer: 'No. Reviews come from your real customers. We make it easy for them to leave one and help you reply.' },
        { question: 'Is there a minimum term?', answer: plan.finePrint.join(' ') },
      ]}
      closingHeading="Make it easy for happy customers to review you."
    />
  );
}
