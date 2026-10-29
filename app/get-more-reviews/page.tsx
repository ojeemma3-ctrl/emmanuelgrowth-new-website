import type { Metadata } from 'next';
import { ReviewsCard } from '../../components/home/OfferCards';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';
import { serviceMetadata } from '../../lib/service-metadata';

const plan = plans.find((p) => p.id === 'get-more-reviews')!;

export const metadata: Metadata = serviceMetadata(
  '/get-more-reviews',
  'Get More Reviews: Honest Reviews After Every Job | Emmanuel Growth',
  'A friendly review request after every job, one tap to your Google or Trustpilot page, help replying to reviews and a short monthly summary.',
);

export default function GetMoreReviewsPage() {
  return (
    <ServicePage
      planId="get-more-reviews"
      kicker="Service 03 · Get More Reviews"
      title="Turn happy customers into honest reviews."
      description="After every job, your customer gets a friendly message with one tap to your Google or Trustpilot page. I help you reply, and send a short summary each month."
      visual={<ReviewsCard />}
      why={[
        { title: 'People read reviews before they choose', text: 'Many customers look at reviews before they call, book or visit. Recent reviews show that people are still happy with your work today.' },
        { title: 'Happy customers forget to ask', text: 'A customer who was happy with your work may simply forget to leave a review. A short, friendly message at the right time makes it easy.' },
        { title: 'Replies show how you treat people', text: 'When you reply to reviews, good or bad, future customers see how you look after people. A calm, helpful reply can matter as much as the review itself.' },
        { title: 'Asking every time keeps it steady', text: 'Asking after every job, not just now and then, helps new reviews keep arriving, so your profile stays current.' },
      ]}
      included={[
        { title: 'Set up for you', features: ['One tap to your Google or Trustpilot page'] },
        { title: 'After every job', features: ['A review request after every job'] },
        { title: 'Ongoing', features: ['Help replying to new reviews'] },
        { title: 'Reports', features: ['A short monthly summary'] },
      ]}
      // TODO(owner): how customers are added after a job, and which channel sends the request, are not stated here yet.
      how={{
        title: 'How Get More Reviews works',
        steps: [
          { title: 'A job is finished', text: 'After each job, your customer gets a short, friendly message asking for an honest review.' },
          { title: 'One tap to review', text: 'The message takes them straight to your Google or Trustpilot page.' },
          { title: 'Help with replies', text: 'When new reviews arrive, I help you write clear, polite replies.' },
          { title: 'A short monthly summary', text: 'Once a month, you get a short summary so you can see how your reviews are going.' },
        ],
      }}
      forWho={[
        plan.forWho,
        'Businesses that finish jobs, visits or stays and want more customers to say how it went.',
        'Owners who want review requests sent every time, without having to remember.',
      ]}
      notThis={[
        'I never write, buy or fake reviews.',
        'No promise of positive reviews. Customers are asked for honest feedback.',
        'Not a way to remove reviews you don’t like. I help you reply to them instead.',
        `No long contract. ${plan.finePrint.join(' ')}`,
      ]}
      faqs={[
        { question: 'Do you write or buy reviews?', answer: 'No, never. I don’t write, buy or fake reviews. Your customers are asked for an honest review, in their own words.' },
        // TODO(owner): confirm how customers are added after a job (for example, you share their details, or it connects to your booking tool).
        { question: 'Who gets asked for a review?', answer: 'Your customers, after each job. Before I start, I agree with you how a finished job leads to a review request.' },
        { question: 'What if I get a bad review?', answer: 'It can happen to any business. I help you write a calm, polite reply, which future customers will see too.' },
        { question: 'Which review sites does it cover?', answer: 'Google or Trustpilot. The message gives your customer one tap to your review page.' },
        // TODO(owner): confirm the channels for review requests (text message, WhatsApp, email) and add them here.
        { question: 'How are customers asked?', answer: 'With a short, friendly message after each job that links straight to your review page. I agree with you the best way to reach your customers.' },
        // TODO(owner): confirm what the owner does day to day (for example, marking a job as done).
        { question: 'What do I do day to day?', answer: 'Very little. Review requests go out after each job, I help you reply to new reviews, and you get a short summary each month.' },
        // TODO(owner): confirm any notice period when cancelling.
        { question: 'Can I cancel?', answer: `Yes. ${plan.finePrint.join(' ')}` },
      ]}
      closingHeading="Make it easy for happy customers to say so."
    />
  );
}
