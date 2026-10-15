const steps = [
  {
    title: 'Free visibility check',
    text: 'We look at how customers find you, how they contact you and what happens after they do.',
  },
  {
    title: 'We set it up',
    text: 'We fix the gaps we find: your online presence, your replies and your review requests.',
  },
  {
    title: 'More customers, less chasing',
    text: 'Everything keeps working in the background, and we check in to keep improving it.',
  },
];

export function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="container">
        <div className="how-heading">
          <p className="kicker">How it works</p>
          <h2>Three <em>simple</em> steps.</h2>
        </div>
        <ol className="how-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="how-step-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
