import type { Metadata } from 'next';
import { FoundCard } from '../../components/home/OfferCards';
import { offers } from '../../components/home/OfferSections';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';

export const metadata: Metadata = {
  title: 'Get Found | Emmanuel Growth',
  description: 'Make it easier for local customers to find your business and take the next step.',
  alternates: { canonical: '/get-found' },
};

const offer = offers.find((o) => o.id === 'get-found')!;
const plan = plans.find((p) => p.id === 'get-found')!;

export default function GetFoundPage() {
  return (
    <ServicePage
      planId="get-found"
      kicker="Service 01 · Get Found"
      title="Get Found"
      description="Help the right customers find your business and make it simple to call, message or book."
      visual={<FoundCard />}
      points={offer.home.bullets}
      faqs={[
        { question: 'Do I need a new website?', answer: 'Not always. During the free visibility check we look at what you already have and tell you whether to improve it or start fresh.' },
        { question: 'What does the monthly price cover?', answer: 'Everything listed under What’s included on this page. If something you need isn’t on the list, ask during your free personal review.' },
        { question: 'Is there a minimum term?', answer: plan.finePrint.join(' ') },
      ]}
      closingHeading="Make it easy for local customers to find you."
    />
  );
}
