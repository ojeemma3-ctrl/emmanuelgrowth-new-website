import type { Metadata } from 'next';
import { ConvertCard, FoundCard, ReviewsCard } from '../../components/home/OfferCards';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';
import { serviceMetadata } from '../../lib/service-metadata';

const plan = plans.find((p) => p.id === 'complete-system')!;
const featuresOf = (id: string) => plans.find((p) => p.id === id)!.features;
// Status from the pricing config (early access shows "Join the waitlist" on the plan card).
const earlyAccess = plan.status === 'early-access';

export const metadata: Metadata = serviceMetadata(
  '/complete-system',
  'Complete System: Get Found, Enquiries and Reviews Together | Emmanuel Growth',
  'Get Found, Convert Enquiries and Get More Reviews set up as one system, so a search can become an enquiry, a booking and then a review. In early access.',
);

// The three home tab graphics together, in small form.
const visual = (
  <div className="svc-trio">
    <div className="svc-trio-item"><span>Get Found</span><FoundCard /></div>
    <div className="svc-trio-item"><span>Convert Enquiries</span><ConvertCard /></div>
    <div className="svc-trio-item"><span>Get More Reviews</span><ReviewsCard /></div>
  </div>
);

export default function CompleteSystemPage() {
  return (
    <ServicePage
      planId="complete-system"
      kicker={`Complete system${earlyAccess ? ' · Early access' : ''}`}
      title="All three, working together."
      description="Get Found, Convert Enquiries and Get More Reviews set up as one system, so a search can become an enquiry, a booking and then a review."
      visual={visual}
      wide
      why={[
        { title: 'Each step leads to the next', text: 'Customers need to find you before they can message you, and they need a good experience before they leave a review. Fixing one step may leave gaps in the others.' },
        { title: 'One setup instead of three', text: 'Setting everything up together means your website, Google profile, inbox and review requests all show the same details and point the same way.' },
        { title: 'Fewer things to manage', text: 'One plan and one person to talk to: Emmanuel, personally. You don’t have to connect three separate tools yourself.' },
        { title: 'Reviews help the next search', text: 'New reviews make your Google profile more convincing, which may help the next customer who finds you decide to get in touch.' },
      ]}
      included={plan.features.map((feature) => {
        const id = plans.find((p) => feature === `Everything in ${p.name}`)!.id;
        return { title: feature, features: featuresOf(id) };
      })}
      forWho={[
        plan.forWho,
        'Businesses that want customers to find them, reach them and review them, without managing three tools.',
        'Owners who would rather have one plan than three.',
      ]}
      notThis={[
        `Not a fixed price. It starts ${plan.price.replace(/^From/, 'from')} a month, plus usage.`,
        'Not all or nothing. You can start with one service and add the others later.',
        ...(earlyAccess ? ['Not open to everyone yet. It’s in early access, with a waitlist.'] : []),
        'No guaranteed rankings or number of enquiries.',
      ]}
      faqs={[
        { question: 'How is this different from the three plans?', answer: 'Each plan covers one area. The Complete system includes everything in Get Found, Convert Enquiries and Get More Reviews, set up to work together.' },
        { question: 'Can I start with one service and add the others?', answer: 'Yes. You can start with one service and add the others later.' },
        { question: 'Do I get everything in each plan?', answer: 'Yes. Everything listed under What you get on this page is included.' },
        ...(earlyAccess ? [
          { question: 'Is it available now?', answer: 'The Complete system is in early access. Use “Join the waitlist” and tell us a little about your business.' },
          // TODO(owner): add a start date only once it is decided.
          { question: 'When does it start?', answer: 'We haven’t set a start date yet. Join the waitlist and we’ll let you know.' },
        ] : []),
        { question: 'How does pricing work?', answer: `${plan.price} ${plan.period.replace('/month', 'a month').replace(' + ', ' plus ')}. ${plan.finePrint.join(' ')}` },
      ]}
      closingHeading="Get all three working together."
    />
  );
}
