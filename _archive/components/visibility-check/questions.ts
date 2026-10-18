// Edit the visibility check here: question text, area, and the plain fix sentence shown
// when a question is one of the visitor's top gaps.

export type Area = 'Found' | 'Reviews' | 'Website' | 'Contact' | 'Consistency';

export type Answer = { label: string; points: number };

export type Question = {
  id: string;
  area: Area;
  text: string;
  fix: string;
  answers: Answer[];
};

export const areas: Area[] = ['Found', 'Reviews', 'Website', 'Contact', 'Consistency'];

export const standardAnswers: Answer[] = [
  { label: 'Yes', points: 2 },
  { label: 'Not sure', points: 1 },
  { label: 'No', points: 0 },
];

export const questions: Question[] = [
  {
    id: 'maps',
    area: 'Found',
    text: 'When someone searches your service plus your town, does your business appear on Google Maps?',
    fix: 'Make sure your business shows on Google Maps for your main service and town, so local searchers can find you.',
    answers: standardAnswers,
  },
  {
    id: 'profile',
    area: 'Found',
    text: 'Is your Google business profile claimed, with photos, opening hours and your phone or website?',
    fix: 'Claim and complete your Google business profile with photos, opening hours and a way to contact you.',
    answers: standardAnswers,
  },
  {
    id: 'recent-review',
    area: 'Reviews',
    text: 'Have you had a new review in the last 2 months?',
    fix: 'Recent reviews help people trust you. Aim for a steady flow of new ones rather than a few old ones.',
    answers: standardAnswers,
  },
  {
    id: 'ask-reviews',
    area: 'Reviews',
    text: 'Do you ask customers for a review after every job?',
    fix: 'Ask every happy customer for a review, with a simple link they can tap straight away.',
    answers: standardAnswers,
  },
  {
    id: 'website',
    area: 'Website',
    text: 'Does your website work well on a phone and explain what you do within a few seconds?',
    fix: 'Have a simple, phone-friendly page that says what you do, where you work and how to get in touch.',
    answers: [...standardAnswers, { label: 'I don’t have a website', points: 0 }],
  },
  {
    id: 'one-tap',
    area: 'Contact',
    text: 'Can a customer call, WhatsApp or book in one tap from your website and profile?',
    fix: 'Add one-tap call, WhatsApp or booking buttons so interested customers can reach you straight away.',
    answers: standardAnswers,
  },
  {
    id: 'reply-time',
    area: 'Contact',
    text: 'Do you usually reply to new enquiries within an hour?',
    fix: 'Set up a quick first reply so new enquiries hear back fast, even when you are busy.',
    answers: standardAnswers,
  },
  {
    id: 'nap',
    area: 'Consistency',
    text: 'Are your business name, address and phone number the same on your website, Google and social pages?',
    fix: 'Use exactly the same business name, address and phone number everywhere your business appears online.',
    answers: standardAnswers,
  },
];

export const MAX_POINTS = 2;

// Overall label from the share of points scored.
export function overallLabel(ratio: number) {
  if (ratio >= 0.8) return 'Strong';
  if (ratio >= 0.5) return 'Getting there';
  return 'Needs attention';
}

// Area rating from the share of points scored in that area.
export function areaRating(ratio: number): 'green' | 'amber' | 'red' {
  if (ratio >= 0.75) return 'green';
  if (ratio >= 0.4) return 'amber';
  return 'red';
}

export const ratingLabel = { green: 'Strong', amber: 'Getting there', red: 'Needs attention' } as const;
