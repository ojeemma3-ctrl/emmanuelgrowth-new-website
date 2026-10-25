import type { Metadata } from 'next';
import { ConvertCard } from '../../components/home/OfferCards';
import { ServicePage } from '../../components/home/ServicePage';
import { plans } from '../../lib/pricing-config';
import { serviceMetadata } from '../../lib/service-metadata';

const plan = plans.find((p) => p.id === 'convert-enquiries')!;
// Status from the pricing config (early access shows "Join the waitlist" on the plan card).
const earlyAccess = plan.status === 'early-access';

export const metadata: Metadata = serviceMetadata(
  '/convert-enquiries',
  'Convert Enquiries: One Inbox and a Quick First Reply | Emmanuel Growth',
  'WhatsApp, Instagram, Facebook and website chat in one inbox, with an AI first reply, follow-up and booking links. In early access.',
);

export default function ConvertEnquiriesPage() {
  return (
    <ServicePage
      planId="convert-enquiries"
      kicker={`Service 02 · Convert Enquiries${earlyAccess ? ' · Early access' : ''}`}
      title="Answer every enquiry, from one inbox."
      description="Messages from WhatsApp, Instagram, Facebook and your website chat arrive in one place. A quick AI first reply and a follow-up help each enquiry move towards a booking."
      visual={<ConvertCard />}
      why={[
        { title: 'Enquiries arrive in many places', text: 'Customers may message you on WhatsApp, Instagram, Facebook or your website. Checking each one takes time, and some messages get missed.' },
        { title: 'A quick reply helps', text: 'Someone who asks a question may be comparing a few businesses. A quick, friendly first reply shows them you’re there.' },
        { title: 'Follow-up brings back the quiet ones', text: 'Some people ask, then go quiet. A polite follow-up gives them an easy way to come back and book.' },
        { title: 'You stay in control', text: 'The AI handles the first, repetitive steps. You can see every conversation in one inbox and step in at any time.' },
      ]}
      included={[
        { title: 'Set up for you', features: ['One inbox for WhatsApp, Instagram, Facebook and website chat', 'Booking links'] },
        { title: 'Every day', features: ['An AI first reply and follow-up'] },
      ]}
      forWho={[
        plan.forWho,
        'Businesses that get messages on several apps.',
        'Owners who can’t always reply quickly while they work.',
      ]}
      notThis={[
        'The AI doesn’t replace you. It handles the first steps; people stay in control.',
        'Not every channel. WhatsApp, Instagram, Facebook and website chat, where supported. TikTok isn’t included.',
        'Messaging and AI usage isn’t in the monthly price. It’s billed separately.',
        ...(earlyAccess ? ['Not open to everyone yet. It’s in early access, with a waitlist.'] : []),
      ]}
      faqs={[
        { question: 'Which messages are covered?', answer: 'WhatsApp, Instagram, Facebook and your website chat, in one inbox, where supported.' },
        // TODO(owner): confirm whether the owner also gets an alert for new enquiries, and how.
        { question: 'Does it reply for me, or alert me?', answer: 'It sends an AI first reply and a follow-up. Every conversation is in one inbox, so you can read it and step in at any time.' },
        ...(earlyAccess ? [
          { question: 'What does early access mean?', answer: 'Convert Enquiries isn’t fully open yet. Join the waitlist and tell us a little about your business, and we’ll be in touch.' },
          // TODO(owner): add a start date only once it is decided.
          { question: 'When does it start?', answer: 'We haven’t set a start date yet. Join the waitlist and we’ll let you know.' },
        ] : []),
        // TODO(owner): confirm what a client needs to set up (accounts, access, website chat).
        { question: 'What do I need to set it up?', answer: 'Access to the accounts you use for messages, such as WhatsApp, Instagram and Facebook, and to your website for the chat. We do the setup with you.' },
        { question: 'How is it priced?', answer: `${plan.price} ${plan.period.replace('/month', 'a month').replace(' + ', ' plus ')}. ${plan.finePrint.join(' ')}` },
        { question: 'Do I need the other services too?', answer: 'No. You can start with one service and add the others later.' },
      ]}
      closingHeading="Make sure every enquiry gets an answer."
    />
  );
}
