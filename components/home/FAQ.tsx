import { plans } from '../../lib/pricing-config';

// Minimum terms, read from the pricing config so this answer never disagrees with the plans.
const termOf = (name: string, lines: string[]) => {
  const text = lines.join(' ');
  if (/3-month minimum/i.test(text)) return `${name} has a 3-month minimum`;
  if (/month to month/i.test(text)) return `${name} is month to month`;
  return `${name}: see its plan`;
};
const cancelAnswer = `Yes. ${plans.map((p) => termOf(p.name, p.finePrint)).join('. ')}.`;
// TODO(owner): confirm how cancelling works after the minimum term (any notice period), then add it here.

// Edit the home page questions and answers here. Service pages pass their own with the items prop.
export type FaqItem = { question: string; answer: string };
const faqs: FaqItem[] = [
  {
    question: 'What is the free visibility check?',
    answer: 'We look at how customers find you online, how they get in touch and what happens after. You get a short, plain-English list of what to fix first. There is no cost for the check.',
  },
  {
    question: 'Do I need all three services?',
    answer: 'No. Most businesses start with the one area they most want to improve, then add the others later. If you want all three working together, choose the complete system.',
  },
  {
    question: 'Do I need to be good with technology?',
    answer: 'No. We set everything up for you and show you how it works. Day to day, it should feel simple.',
  },
  {
    question: 'Can you work with my existing website?',
    answer: 'Often, yes. During the visibility check we look at what you already have and tell you whether to improve it or start fresh.',
  },
  {
    question: 'How long does setup take?',
    answer: 'It depends on what you need. After the visibility check we give you a clear plan and timeline before anything starts.',
  },
  {
    question: 'What happens after the free check?',
    answer: 'You get your report on screen and can save it as a PDF. If you want, ask for a free personal review and we will talk it through. There is no obligation.',
  },
  {
    question: 'Can I cancel?',
    answer: cancelAnswer,
  },
  {
    question: 'Do you work with businesses outside the UK?',
    answer: 'Yes, for example in Europe, Nigeria and the US. WhatsApp is welcome.',
  },
  {
    question: 'Who will I be working with?',
    answer: 'Emmanuel, personally.',
  },
];

export function FAQ({ items = faqs, intro = 'Something else on your mind? Ask during your free visibility check.' }: { items?: FaqItem[]; intro?: string }) {
  return (
    <section className="faq-section" id="faq">
      <div className="container faq-grid">
        <div className="faq-heading">
          <p className="kicker">FAQ</p>
          <h2>Questions, <em>answered.</em></h2>
          <p>{intro}</p>
        </div>
        <div className="faq-list">
          {items.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true" /></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
