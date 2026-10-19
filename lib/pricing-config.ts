// Every price and term shown in the pricing section. Edit here only. Currency: EUR.

export type PlanStatus = 'live' | 'early-access';

export type Plan = {
  id: string; // anchor: /#<id>-plan
  name: string;
  status: PlanStatus;
  price: string; // shown large, e.g. "€97" or "From €197"
  period: string; // shown after the price, e.g. "/month" or "/month + usage"
  billingNote?: string; // small line under the price; "Early-client price" only when showEarlyClientNote is true
  forWho: string;
  features: string[];
  finePrint: string[];
  primaryLabel: string; // live: "Get started"; early access: "Join the waitlist"
  contactTopic: string; // prefilled in the contact box
  detailsLabel: string;
  detailsHref: string;
  highlighted?: boolean;
};

export const currency = 'EUR';

// null: show "One-time setup fee quoted on request". Set a text such as "€300" to show a figure.
export const conciergeSetupFee: string | null = null;

// The early-client offer: subheading sentence and the "Early-client price" note on live plans.
export const showEarlyClientNote = true;

export const nigeriaNote = 'Paying from Nigeria or the UK? Message me for local payment options.';

export const setupFeeText = conciergeSetupFee ? `One-time setup fee of ${conciergeSetupFee}` : 'One-time setup fee quoted on request';

export const pricingCopy = {
  heading: 'Simple monthly plans.',
  headingHighlight: 'monthly',
  intro: 'Start with the problem that costs you most.',
  earlyClientNote: 'Early-client prices for the first 5 businesses.',
  footNote: `Updates are limited to 3 requests a month on Get Found. Prices are in euros. ${nigeriaNote}`,
};

const earlyClient = showEarlyClientNote ? 'Early-client price' : undefined;
const usageFinePrint = [
  `${setupFeeText} and a 3-month minimum.`,
  'AI and messaging usage is billed separately, based on how many messages you receive.',
];

export const plans: Plan[] = [
  {
    id: 'get-found',
    name: 'Get Found',
    status: 'live',
    price: '€97',
    period: '/month',
    billingNote: earlyClient,
    forWho: 'For businesses local customers can’t find online yet.',
    features: [
      'A simple website or landing page',
      'Google Business Profile set up and checked each month',
      'Call, WhatsApp and booking buttons',
      'Up to 3 update requests a month, done within 2 working days',
    ],
    finePrint: ['3-month minimum.'],
    primaryLabel: 'Get started',
    contactTopic: 'Get Found',
    detailsLabel: 'See what’s included',
    detailsHref: '/get-found',
  },
  {
    id: 'get-more-reviews',
    name: 'Get More Reviews',
    status: 'live',
    price: '€97',
    period: '/month',
    billingNote: earlyClient,
    forWho: 'For businesses with happy customers but few reviews.',
    features: [
      'A review request after every job',
      'One tap to your Google or Trustpilot page',
      'Help replying to new reviews',
      'A short monthly summary',
    ],
    finePrint: ['Month to month.'],
    primaryLabel: 'Get started',
    contactTopic: 'Get More Reviews',
    detailsLabel: 'See what’s included',
    detailsHref: '/build-trust',
  },
  {
    id: 'convert-enquiries',
    name: 'Convert Enquiries',
    status: 'early-access',
    price: 'From €197',
    period: '/month + usage',
    forWho: 'For businesses that get enquiries but lose too many.',
    features: [
      'One inbox for WhatsApp, Instagram, Facebook and website chat',
      'An AI first reply and follow-up',
      'Booking links',
    ],
    finePrint: usageFinePrint,
    primaryLabel: 'Join the waitlist',
    contactTopic: 'Waitlist: Convert Enquiries',
    detailsLabel: 'See what’s included',
    detailsHref: '/convert-enquiries',
  },
  {
    id: 'complete-system',
    name: 'Complete system',
    status: 'early-access',
    price: 'From €297',
    period: '/month + usage',
    forWho: 'For businesses that want all three working together.',
    features: [
      'Everything in Get Found',
      'Everything in Convert Enquiries',
      'Everything in Get More Reviews',
    ],
    finePrint: usageFinePrint,
    primaryLabel: 'Join the waitlist',
    contactTopic: 'Waitlist: Complete system',
    detailsLabel: 'See what’s included',
    detailsHref: '/#services', // no separate page; the services overview covers all three
    highlighted: true,
  },
];
