import type { Metadata } from 'next';
import { ConvertMoreEnquiries } from '../../components/home/ConvertMoreEnquiries';
import { ServicePage } from '../../components/home/ServicePage';

export const metadata: Metadata = {
  title: 'Convert Enquiries | Emmanuel Growth',
  description: 'Respond faster, organise customer enquiries and move more conversations toward bookings or sales.',
  alternates: { canonical: '/convert-enquiries' },
};

export default function ConvertEnquiriesPage() {
  return (
    <ServicePage
      eyebrow="02 / AI LEAD CONCIERGE"
      title="Convert Enquiries"
      description="Keep promising conversations moving with faster responses, clear next steps and a smooth handoff."
    >
      <ConvertMoreEnquiries />
    </ServicePage>
  );
}
