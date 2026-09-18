'use client';

import { avaChoices, insights } from './content';
import { useHomeInteractions } from './HomeInteractions';
import { Arrow } from './shared';

export function AvaDrawer() {
  const {
    avaOpen,
    choice,
    message,
    submitted,
    drawerRef,
    closeAva,
    resetAva,
    setChoice,
    setMessage,
    submitMessage,
  } = useHomeInteractions();
  if (!avaOpen) return null;

  return (
    <div className="ava-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAva(); }}>
      <aside className="ava-drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="ava-title" aria-describedby="ava-description">
        <div className="ava-top">
          <div className="ava-id">
            <span className="ava-symbol">A</span>
            <span><strong id="ava-title">Ava</strong><small>AI Lead Concierge · GrowthOS</small></span>
          </div>
          <button className="icon-button" onClick={closeAva} type="button" aria-label="Close Ava demo">×</button>
        </div>
        <div className="ava-body" aria-live="polite">
          <p className="demo-label">INTERACTIVE FRONTEND DEMO</p>
          <p className="ava-bubble" id="ava-description">Hi, I&apos;m Ava. I can help you find the first part of your customer journey worth improving.</p>
          {!choice && <>
            <p className="ava-question">What would you like to improve?</p>
            <div className="ava-choices">
              {avaChoices.map((item) => <button key={item} onClick={() => setChoice(item)} type="button">{item}<Arrow /></button>)}
            </div>
            <div className="or-line"><span>or tell me what is happening</span></div>
            <form className="ava-input" onSubmit={submitMessage}>
              <label className="sr-only" htmlFor="ava-message">Tell Ava what is happening</label>
              <input id="ava-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your answer…" />
              <button type="submit" aria-label="Send message">↑</button>
            </form>
          </>}
          {choice && <div className="ava-result">
            <p className="visitor-bubble">{submitted || choice}</p>
            <p className="ava-bubble">{insights[choice]}</p>
            <div className="ava-summary">
              <small>LIKELY PLACE TO START</small>
              <strong>{choice === 'Get found online' ? 'Local Visibility & Lead Capture' : choice === 'Respond to enquiries faster' ? 'AI Lead Concierge' : 'Reviews & Customer Follow-Up'}</strong>
            </div>
            <p className="ava-disclaimer">In a live setup, this conversation can collect the right details, offer a booking or hand over to a person. This demo does not send your data anywhere.</p>
            <button className="button button-dark" onClick={resetAva} type="button">Try another answer</button>
          </div>}
        </div>
      </aside>
    </div>
  );
}
