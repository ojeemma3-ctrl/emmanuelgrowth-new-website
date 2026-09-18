import { ReactNode } from 'react';
import { ContactTrigger } from './InteractionTriggers';
import { Arrow, CheckList } from './shared';

type OfferProps = {
  id: string;
  eyebrow: string;
  title: string;
  problem: string;
  body: string;
  items: string[];
  visual: ReactNode;
  dark?: boolean;
  reverse?: boolean;
};

export function OfferSection({ id, eyebrow, title, problem, body, items, visual, dark, reverse }: OfferProps) {
  return (
    <section className={`offer-section ${dark ? 'offer-dark' : ''} ${reverse ? 'offer-reverse' : ''}`} id={id}>
      <div className="container offer-grid reveal">
        <div className="offer-copy">
          <p className="kicker">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="offer-problem">{problem}</p>
          <p>{body}</p>
          <CheckList items={items} />
          <ContactTrigger className={`button ${dark ? 'button-light' : 'button-dark'}`}>Get Started <Arrow /></ContactTrigger>
        </div>
        <div className="offer-visual">{visual}</div>
      </div>
    </section>
  );
}
