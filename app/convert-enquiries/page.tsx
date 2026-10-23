import type { Metadata } from 'next';
import { ConvertCard } from '../../components/home/OfferCards';
import { offers } from '../../components/home/OfferSections';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';

export const metadata: Metadata = {
  title: 'Convert Enquiries | Emmanuel Growth',
  description: 'Reply faster, keep good enquiries moving and turn more of them into bookings.',
  alternates: { canonical: '/convert-enquiries' },
};

const offer = offers.find((o) => o.id === 'convert-enquiries')!;
const plan = plans.find((p) => p.id === 'convert-enquiries')!;

export default function ConvertEnquiriesPage() {
  return (
    <ServicePage
      planId="convert-enquiries"
      kicker="Service 02 · Convert Enquiries"
      title="Convert Enquiries"
      description="Reply faster, keep good enquiries moving and turn more of them into bookings."
      visual={<ConvertCard />}
      points={offer.home.bullets}
      faqs={[
        { question: 'Is it available now?', answer: 'Convert Enquiries is in early access. Use “Join the waitlist” and tell us a little about your business.' },
        { question: 'Which channels are included?', answer: `${plan.features[0]}.` },
        { question: 'How is it billed?', answer: plan.finePrint.join(' ') },
      ]}
      closingHeading="Reply to every enquiry, quickly and simply."
    />
  );
}
