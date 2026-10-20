'use client';

import { useHomeInteractions } from '../home/HomeInteractions';

// A quiet "Talk to me directly" link that opens the site's contact box.
export function TalkLink() {
  const { openContact } = useHomeInteractions();
  return (
    <button className="guide-talk-link" type="button" aria-haspopup="dialog" onClick={() => openContact()}>
      Talk to me directly
    </button>
  );
}
