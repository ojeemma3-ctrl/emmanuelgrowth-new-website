'use client';

import { avaChoices, whatsappHref } from './content';
import { useHomeInteractions } from './HomeInteractions';
import { Arrow } from './shared';

export function ContactModal() {
  const { contactOpen, contactRef, closeContact, openAva, submitQuickMessage } = useHomeInteractions();
  if (!contactOpen) return null;

  return (
    <div className="contact-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeContact(); }}>
      <section className="contact-modal" ref={contactRef} role="dialog" aria-modal="true" aria-labelledby="contact-title" aria-describedby="contact-description">
        <div className="contact-head">
          <div>
            <h2 id="contact-title">How would you like to talk?</h2>
            <p id="contact-description">Choose the easiest way for you.</p>
          </div>
          <button className="icon-button" onClick={closeContact} type="button" aria-label="Close contact options">×</button>
        </div>
        <div className="contact-options">
          <article className="contact-option">
            <span className="contact-number">01</span>
            <div>
              <h3>Chat on WhatsApp</h3>
              <p>Talk directly with Emmanuel.</p>
              <a className="contact-email" href="mailto:emmanuel@emmanuelgrowth.com">Prefer email? emmanuel@emmanuelgrowth.com</a>
            </div>
            <a className="button button-dark" href={whatsappHref} target="_blank" rel="noreferrer">Open WhatsApp <Arrow /></a>
          </article>
          <article className="contact-option">
            <span className="contact-number">02</span>
            <div><h3>Try Ava</h3><p>See how the AI Lead Concierge works.</p></div>
            <button className="button button-outline" onClick={openAva} type="button">Try the Demo <Arrow /></button>
          </article>
          <article className="contact-option contact-form-option">
            <span className="contact-number">03</span>
            <div><h3>Send a quick message</h3><p>Leave your details and we will get back to you.</p></div>
            <form className="quick-message-form" onSubmit={submitQuickMessage}>
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" name="name" autoComplete="name" required />
              <label htmlFor="contact-detail">Email or WhatsApp</label>
              <input id="contact-detail" name="contact" autoComplete="email" required />
              <label htmlFor="contact-help">What do you need help with?</label>
              <select id="contact-help" name="help" defaultValue="" required>
                <option value="" disabled>Choose one</option>
                {avaChoices.map((item) => <option key={item}>{item}</option>)}
              </select>
              <button className="button button-dark" type="submit">Send Message <Arrow /></button>
              <small>Your message will open in WhatsApp for you to review and send.</small>
            </form>
          </article>
        </div>
      </section>
    </div>
  );
}
