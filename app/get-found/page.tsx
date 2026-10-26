import type { Metadata } from 'next';
import { CustomWebsiteCard } from '../../components/home/CustomWebsiteCard';
import { FoundCard } from '../../components/home/OfferCards';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';
import { serviceMetadata } from '../../lib/service-metadata';

const plan = plans.find((p) => p.id === 'get-found')!;

export const metadata: Metadata = serviceMetadata(
  '/get-found',
  'Get Found: A Simple Landing Page and Google Profile | Emmanuel Growth',
  'A simple one-page landing page, a clear Google Business Profile and one-tap call, WhatsApp and booking buttons, set up for you and checked every month.',
);

export default function GetFoundPage() {
  return (
    <ServicePage
      planId="get-found"
      kicker="Service 01 · Get Found"
      title="Help local customers find you."
      description="A simple one-page landing page, a clear Google profile and one-tap buttons to call, message or book. Set up for you, then checked every month."
      visual={<FoundCard />}
      why={[
        { title: 'Customers look before they call', text: 'Many people check a business online before they get in touch. If they can’t find you, or your details look out of date, they may choose someone they can find.' },
        { title: 'Your Google profile is a first impression', text: 'When someone searches nearby for what you offer, your Google profile may be the first thing they see. Clear photos, opening times and contact details help them trust it’s the right place.' },
        { title: 'A landing page answers more questions', text: 'A simple landing page explains what you offer, where you work and how to book. It gives customers one place to check that you’re real and up to date.' },
        { title: 'One tap makes it easy to act', text: 'When calling, messaging or booking takes one tap, fewer people give up halfway. A small step like this can be the difference between a new customer and a missed one.' },
      ]}
      included={[
        { title: 'Set up for you', features: ['A simple one-page landing page (not a full website)', 'Call, WhatsApp and booking buttons'] },
        { title: 'Every month', features: ['Google Business Profile set up, improved and checked each month', 'Up to 3 update requests a month, done within 2 working days'] },
      ]}
      afterIncluded={(
        <section className="svc-section svc-custom" aria-label="Custom websites">
          <div className="container"><CustomWebsiteCard heading="Need more than a landing page?" as="h2" /></div>
        </section>
      )}
      how={{
        title: 'How Get Found works',
        steps: [
          { title: 'Customers find you', text: 'When someone searches nearby, they find your Google profile, set up and improved with the right details.' },
          { title: 'They see who you are', text: 'Your one-page landing page shows who you are, what you offer and how to reach you.' },
          { title: 'One tap to get in touch', text: 'Call, WhatsApp and booking buttons let them contact you or book straight away.' },
          { title: 'Kept up to date', text: 'We check your Google profile every month and handle up to 3 update requests, done within 2 working days.' },
        ],
      }}
      forWho={[
        plan.forWho,
        'Businesses with no website, or only a social media page.',
        'Owners who want it set up for them, without learning new software.',
      ]}
      notThis={[
        'Not a promise of a top Google ranking. Nobody can guarantee one.',
        'Not paid advertising. Ads aren’t part of this plan.',
        'Not a full website. It’s a simple one-page landing page; custom websites are quoted separately.',
        'Not unlimited changes. Up to 3 update requests a month.',
      ]}
      faqs={[
        { question: 'What do you actually change?', answer: 'We set up a simple one-page landing page, set up and improve your Google Business Profile and check it each month, and add call, WhatsApp and booking buttons. You can also send up to 3 update requests a month, done within 2 working days.' },
        { question: 'Is this a full website?', answer: 'No. It is a simple one-page landing page that gives customers your key details and contact buttons. If you need a custom website with 5 to 10 pages, tell me what you need and I will quote it as a separate project.' },
        // TODO(owner): decide "What happens to my landing page if I cancel?" and add it here. Not shown on the page until then.
        { question: 'Do you guarantee a top Google ranking?', answer: 'No. Nobody can guarantee a ranking on Google. We make your details clear, correct and easy to act on, which helps the customers who do find you.' },
        { question: 'How long before I notice a difference?', answer: 'It varies. It depends on your area, the businesses near you and how people search. We check your Google profile every month to keep it correct.' },
        // TODO(owner): confirm the exact list of what you need from a new Get Found client.
        { question: 'What do you need from me?', answer: 'Basic details about your business, such as what you offer, your opening times and a few photos, and access to your Google Business Profile so we can set it up.' },
        { question: 'Do I need a website already?', answer: 'No. Get Found includes a simple one-page landing page. If you already have a website, the free visibility check shows whether to improve it or start fresh.' },
        // TODO(owner): confirm any notice period after the minimum term.
        { question: 'Is there a contract or minimum term?', answer: `Yes. ${plan.finePrint.join(' ')} After that you can cancel.` },
        { question: 'What happens after the free check?', answer: 'You get your report on screen and can save it as a PDF. If you want, ask for a free personal review and we will talk it through. There is no obligation.' },
      ]}
      closingHeading="Make it easy for local customers to find you."
    />
  );
}
