'use client';

import { useEffect, useRef, useState } from 'react';
import { whatsappNumber } from '../home/content';
import { Arrow } from '../home/shared';
import { areaRating, areas, MAX_POINTS, overallLabel, questions, ratingLabel } from './questions';

const contactEmail = 'emmanuel@emmanuelgrowth.com';

type Stage = 'intro' | 'questions' | 'result';

// Progress lives in memory only: nothing is stored in the browser, cookies or the URL.
export function VisibilityCheck() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [choices, setChoices] = useState<(number | null)[]>(() => questions.map(() => null));
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new heading so keyboard and screen-reader users follow each step.
  useEffect(() => {
    if (stage !== 'intro') headingRef.current?.focus();
  }, [stage, current]);

  const choose = (answerIndex: number) => {
    const next = [...choices];
    next[current] = answerIndex;
    setChoices(next);
    if (current < questions.length - 1) setCurrent(current + 1);
    else setStage('result');
  };

  const restart = () => {
    setChoices(questions.map(() => null));
    setCurrent(0);
    setStage('questions');
  };

  if (stage === 'intro') {
    return (
      <div className="vc-card">
        <p className="kicker">Free visibility check</p>
        <h1 className="vc-title">Where might customers be slipping away?</h1>
        <p className="vc-lead">Answer 8 quick questions to see where customers might be slipping away. This is a self-check based on your answers, not an automatic scan of your business.</p>
        <button className="button button-growth vc-start" type="button" onClick={() => setStage('questions')}>Start the check <Arrow /></button>
        <p className="vc-note">Takes about 60 seconds. Nothing is saved on this site.</p>
      </div>
    );
  }

  if (stage === 'questions') {
    const question = questions[current];
    const progress = Math.round((current / questions.length) * 100);
    return (
      <div className="vc-card">
        <div className="vc-progress-row">
          <span>Question {current + 1} of {questions.length}</span>
          <span className="vc-area">{question.area}</span>
        </div>
        <div className="vc-progress" role="progressbar" aria-label="Check progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={current} aria-valuetext={`${current} of ${questions.length} answered`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <h1 className="vc-question" tabIndex={-1} ref={headingRef} id="vc-question">{question.text}</h1>
        <div className="vc-answers" role="group" aria-labelledby="vc-question">
          {question.answers.map((answer, index) => (
            <button
              className={`vc-answer${choices[current] === index ? ' is-selected' : ''}`}
              type="button"
              key={answer.label}
              aria-pressed={choices[current] === index}
              onClick={() => choose(index)}
            >
              {answer.label}
            </button>
          ))}
        </div>
        {current > 0 ? <button className="vc-back" type="button" onClick={() => setCurrent(current - 1)}>← Previous question</button> : null}
      </div>
    );
  }

  // Result
  const points = questions.map((q, i) => (choices[i] === null ? 0 : q.answers[choices[i] as number].points));
  const total = points.reduce((a, b) => a + b, 0);
  const max = questions.length * MAX_POINTS;
  const label = overallLabel(total / max);
  const areaResults = areas.map((area) => {
    const idx = questions.map((q, i) => (q.area === area ? i : -1)).filter((i) => i >= 0);
    const ratio = idx.reduce((sum, i) => sum + points[i], 0) / (idx.length * MAX_POINTS);
    const rating = areaRating(ratio);
    return { area, rating, text: ratingLabel[rating] };
  });
  // Top 3 gaps: lowest-scoring questions that were not a full "Yes", in question order on ties.
  const gaps = questions
    .map((q, i) => ({ q, score: points[i], i }))
    .filter((g) => g.score < MAX_POINTS)
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .slice(0, 3);

  const lines = [
    'Hi Emmanuel, I did the free visibility check on your website.',
    '',
    `My score: ${total} out of ${max} (${label})`,
    '',
    'Area ratings:',
    ...areaResults.map((a) => `- ${a.area}: ${a.text}`),
    '',
    gaps.length ? 'My top gaps:' : 'No gaps flagged.',
    ...gaps.map((g, n) => `${n + 1}. ${g.q.text}`),
    '',
    'Could you do a personal check of my business?',
  ];
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  const mailHref = `mailto:${contactEmail}?subject=${encodeURIComponent('My visibility check result')}&body=${encodeURIComponent(lines.join('\r\n'))}`;

  return (
    <div className="vc-card">
      <p className="kicker">Your result</p>
      <h1 className="vc-score" tabIndex={-1} ref={headingRef}>
        <span>{total}<small>/{max}</small></span>
        {label}
      </h1>
      <p className="vc-lead">This is based only on your answers. It shows where to look first, not what will happen.</p>

      <h2 className="vc-subhead">By area</h2>
      <ul className="vc-areas">
        {areaResults.map((a) => (
          <li key={a.area}>
            <span>{a.area}</span>
            <span className={`vc-rating is-${a.rating}`}><i aria-hidden="true" />{a.text}</span>
          </li>
        ))}
      </ul>

      <h2 className="vc-subhead">{gaps.length ? `Your top ${gaps.length === 1 ? 'gap' : `${gaps.length} gaps`}` : 'No gaps flagged'}</h2>
      {gaps.length ? (
        <ol className="vc-gaps">
          {gaps.map((g) => (
            <li key={g.q.id}>
              <strong>{g.q.text}</strong>
              <p>{g.q.fix}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="vc-lead">You answered yes to every question. A personal check can still spot smaller improvements.</p>
      )}

      <div className="vc-actions">
        <a className="button button-growth" href={whatsappHref} target="_blank" rel="noreferrer">Send me my personal review on WhatsApp <Arrow /></a>
        <a className="button button-outline" href={mailHref}>Email me instead</a>
      </div>
      <p className="vc-note">Nothing is saved on this site. You choose what to send.</p>
      <button className="vc-back" type="button" onClick={restart}>Start again</button>
    </div>
  );
}
