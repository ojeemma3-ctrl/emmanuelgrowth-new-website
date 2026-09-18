import { OfferSection } from './OfferSection';

function ConversionVisual() {
  return <div className="system-visual conversion-visual" aria-label="An enquiry receives a fast response, is qualified and moves toward a booking">
    <div className="conversation-head"><span className="ava-symbol">A</span><span><strong>AI Lead Concierge</strong><small>First response, organised</small></span><i /></div>
    <div className="demo-chat"><p className="bubble customer">Hi, do you have availability this week?</p><p className="bubble assistant">Yes — I can help with that. What service are you looking for?</p><div className="captured"><span>DETAILS CAPTURED</span><strong>Service · preferred day · contact</strong></div><p className="bubble assistant confirmation">You are ready for the next step.</p></div>
    <div className="handoff-row"><span>Qualified</span><strong>Book or hand over →</strong></div>
  </div>;
}

export function ConvertMoreEnquiries() {
  return <OfferSection id="convert" eyebrow="02 / AI LEAD CONCIERGE" title="Do not let good leads disappear." problem="Enquiries lose momentum when replies are slow or the next step is unclear." body="We help you reply faster, collect customer details and move enquiries towards a booking or sale." items={['AI-assisted first responses', 'Website and supported messaging channels', 'Customer detail capture and qualification', 'Booking, routing and human handoff']} visual={<ConversionVisual />} dark reverse />;
}
