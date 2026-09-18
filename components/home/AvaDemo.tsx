import { AvaTrigger } from './InteractionTriggers';
import { Arrow } from './shared';

export function AvaDemo() {
  return (
    <section className="concierge-section" id="how-it-works">
      <div className="container concierge-grid reveal">
        <div className="concierge-copy">
          <p className="kicker">AI LEAD CONCIERGE / WORKING DEMO</p>
          <h2>See how a good enquiry keeps moving.</h2>
          <p>The AI Lead Concierge handles the repetitive first steps, keeps the conversation organised and gives a person control whenever they are needed.</p>
          <ol className="concierge-steps">
            {['Customer message', 'Fast first response', 'Details collected', 'Enquiry organised and qualified', 'Book or hand over to a person'].map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}
          </ol>
          <AvaTrigger className="button button-light">Try the Ava Demo <Arrow /></AvaTrigger>
          <p className="demo-note">Ava is the interaction layer for this demonstration—not a human representative.</p>
        </div>
        <div className="concierge-demo" aria-label="Example AI Lead Concierge conversation">
          <div className="demo-head"><span className="ava-symbol">A</span><span><strong>Ava</strong><small>AI Lead Concierge · Demo</small></span><i>AI</i></div>
          <div className="demo-messages">
            <p className="demo-message demo-in">Hi, I would like to know if you have availability next week.</p>
            <p className="demo-message demo-out">I can help with that. Which service are you interested in?</p>
            <p className="demo-message demo-in">A consultation for my business.</p>
            <div className="demo-capture"><small>ENQUIRY ORGANISED</small><strong>Consultation · Next week · New lead</strong></div>
            <div className="demo-action"><span>Ready for next step</span><strong>Offer times or hand over →</strong></div>
          </div>
          <div className="demo-composer"><span>Type a message…</span><i aria-hidden="true">↑</i></div>
        </div>
      </div>
    </section>
  );
}
