const principles = [
  'We start with the business problem, not the software.',
  'We use simple tools that fit how you already work.',
  'We keep checking and improving once it is live.',
];

export function About() {
  return (
    <section className="about-section" id="about">
      <div className="container about-panel">
        <div>
          <p className="kicker">About Emmanuel Growth</p>
          <h2>Simple marketing systems for <em>real</em> businesses.</h2>
        </div>
        <div>
          <p>Emmanuel Growth combines practical sales and marketing experience with modern tools. We start with the business problem. Then we use the right system to help solve it.</p>
          <ul className="about-principles">
            {principles.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
