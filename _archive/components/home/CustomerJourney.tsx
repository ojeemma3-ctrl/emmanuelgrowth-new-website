export function CustomerJourney() {
  return (
    <section className="journey-section" id="journey">
      <div className="container reveal">
        <p className="kicker">THE CUSTOMER JOURNEY</p>
        <div className="intro-grid">
          <h2>From stranger to customer.<br />Then customer again.</h2>
          <p>Emmanuel Growth helps improve the important steps between someone finding your business and becoming a repeat customer.</p>
        </div>
        <ol className="journey-list">
          {['Get found', 'Send a message / enquire', 'Become a customer', 'Leave feedback', 'Stay connected / come back'].map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong></li>)}
        </ol>
      </div>
    </section>
  );
}
