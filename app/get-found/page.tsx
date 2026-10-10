import type { Metadata } from 'next';
import { GetFound } from '../../components/home/GetFound';
import { ServicePage } from '../../components/home/ServicePage';

export const metadata: Metadata = {
  title: 'Get Found | Emmanuel Growth',
  description: 'Make it easier for local customers to find your business and take the next step.',
  alternates: { canonical: '/get-found' },
};

export default function GetFoundPage() {
  return (
    <ServicePage
      eyebrow="01 / LOCAL VISIBILITY + LEAD CAPTURE"
      title="Get Found"
      description="Help the right customers find your business and make it simple to call, message or book."
    >
      <GetFound />
    </ServicePage>
  );
}
