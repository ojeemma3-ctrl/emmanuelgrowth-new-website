import type { Metadata } from 'next';
import { ServicePage } from '../../components/home/ServicePage';

export const metadata: Metadata = {
  title: 'Get More Reviews | Emmanuel Growth',
  description: 'Get more reviews from happy customers, with simple follow-up that builds trust and repeat business.',
  alternates: { canonical: '/build-trust' },
};

export default function BuildTrustPage() {
  return (
    <ServicePage
      offerId="get-more-reviews"
      description="Turn happy customers into reviews, repeat business and lasting trust."
    />
  );
}
