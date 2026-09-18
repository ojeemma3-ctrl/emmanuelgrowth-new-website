'use client';

import { AvaDrawer } from './AvaDrawer';
import { ContactModal } from './ContactModal';
import { useHomeInteractions } from './HomeInteractions';

export function InteractionLayer() {
  const { avaOpen, launcherRef, openAva } = useHomeInteractions();

  return <>
    <button ref={launcherRef} className="ava-launcher" type="button" onClick={openAva} aria-haspopup="dialog" aria-expanded={avaOpen} aria-label="Open Ava interactive demo"><span className="ava-launcher-mark" aria-hidden="true">A</span><span aria-hidden="true"><strong>Ask Ava</strong><small>Interactive demo</small></span></button>
    <ContactModal />
    <AvaDrawer />
  </>;
}
