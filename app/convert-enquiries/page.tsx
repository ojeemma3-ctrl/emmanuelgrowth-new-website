import type { Metadata } from 'next';
import { ServicePage } from '../../components/home/ServicePage';

export const metadata: Metadata = {
  title: 'Convert Enquiries | Emmanuel Growth',
  description: 'Respond faster, organise customer enquiries and move more conversations toward bookings or sales.',
  alternates: { canonical: '/convert-enquiries' },
};

export default function ConvertEnquiriesPage() {
  return (
    <ServicePage
      offerId="convert-enquiries"
      description="Reply faster, keep good enquiries moving and turn more of them into bookings."
    />
  );
}
