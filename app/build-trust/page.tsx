import type { Metadata } from 'next';
import { ReviewsFollowUp } from '../../components/home/ReviewsFollowUp';
import { ServicePage } from '../../components/home/ServicePage';

export const metadata: Metadata = {
  title: 'Build Trust | Emmanuel Growth',
  description: 'Build customer trust with reviews, thoughtful follow-up and stronger repeat relationships.',
  alternates: { canonical: '/build-trust' },
};

export default function BuildTrustPage() {
  return (
    <ServicePage
      eyebrow="03 / REVIEWS + CUSTOMER FOLLOW-UP"
      title="Build Trust"
      description="Turn good customer experiences into stronger reviews, lasting relationships and repeat business."
    >
      <ReviewsFollowUp />
    </ServicePage>
  );
}
