// Edit questions and answers here.
const faqs = [
  {
    question: 'What is the free visibility check?',
    answer: 'We look at how customers find you online, how they get in touch and what happens after. You get a short, plain-English list of what to fix first. There is no cost for the check.',
  },
  {
    question: 'Do I need all three services?',
    answer: 'No. Most businesses start with the one problem that costs them the most customers, then add the others later. If you want all three working together, choose the complete system.',
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
];

export function FAQ() {
  return (
    <section className="faq-section" id="faq">
      <div className="container faq-grid">
        <div className="faq-heading">
          <p className="kicker">FAQ</p>
          <h2>Questions, <em>answered.</em></h2>
          <p>Something else on your mind? Ask during your free visibility check.</p>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
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
