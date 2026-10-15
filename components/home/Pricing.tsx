import { ContactTrigger } from './InteractionTriggers';

// All pricing placeholders live here. Replace [PRICE] with real figures when ready.
const pricing = {
  heading: 'Simple monthly plans.',
  headingHighlight: 'monthly',
  intro: 'Start with the problem that costs you most, or put all three to work together.',
  period: '/month',
  plans: [
    {
      name: 'Get Found',
      price: '[PRICE]',
      forWho: 'For businesses local customers can’t find online yet.',
      includes: [
        'Simple website or landing page',
        'Google Business Profile setup',
        'Call, WhatsApp and booking buttons',
      ],
      cta: 'Choose this plan',
      highlighted: false,
    },
    {
      name: 'Convert Enquiries',
      price: '[PRICE]',
      forWho: 'For businesses that get enquiries but lose too many.',
      includes: [
        'One place for WhatsApp, calls and bookings',
        'Quick first reply to every enquiry',
        'Simple follow-up until they book',
      ],
      cta: 'Choose this plan',
      highlighted: false,
    },
    {
      name: 'Get More Reviews',
      price: '[PRICE]',
      forWho: 'For businesses with happy customers but few reviews.',
      includes: [
        'Review request after every job',
        'One tap to your Google or Trustpilot page',
        'Friendly follow-up that brings customers back',
      ],
      cta: 'Choose this plan',
      highlighted: false,
    },
    {
      name: 'Complete system',
      price: '[PRICE]',
      forWho: 'For businesses that want all three working together.',
      includes: [
        'Everything in Get Found',
        'Everything in Convert Enquiries',
        'Everything in Get More Reviews',
      ],
      cta: 'Choose this plan',
      highlighted: true,
    },
  ],
};

export function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="pricing-heading">
          <p className="kicker">Pricing</p>
          <h2>{pricing.heading.split(pricing.headingHighlight).flatMap((part, i) => (i === 0 ? [part] : [<em key={i}>{pricing.headingHighlight}</em>, part]))}</h2>
          <p>{pricing.intro}</p>
        </div>
        <div className="pricing-grid">
          {pricing.plans.map((plan) => (
            <article className={`price-card${plan.highlighted ? ' is-highlighted' : ''}`} key={plan.name}>
              <h3>{plan.name}</h3>
              <p className="price-amount"><strong>{plan.price}</strong><span>{pricing.period}</span></p>
              <p className="price-for">{plan.forWho}</p>
              <ul className="price-includes">
                {plan.includes.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
              </ul>
              <ContactTrigger className={`button ${plan.highlighted ? 'button-growth' : 'button-dark'} price-button`}>{plan.cta}</ContactTrigger>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
