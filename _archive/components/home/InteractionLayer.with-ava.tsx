'use client';

import { AvaDrawer } from './AvaDrawer';
import { ContactModal } from './ContactModal';
import { useHomeInteractions } from './HomeInteractions';

export function InteractionLayer({ showAvaLauncher = true }: { showAvaLauncher?: boolean }) {
  const { avaOpen, launcherRef, openAva } = useHomeInteractions();

  return <>
    {showAvaLauncher ? <button ref={launcherRef} className="ava-launcher" type="button" onClick={openAva} aria-haspopup="dialog" aria-expanded={avaOpen} aria-label="Open Ava interactive demo"><span className="ava-launcher-mark" aria-hidden="true">A</span><span aria-hidden="true"><strong>Ask Ava</strong><small>Interactive demo</small></span></button> : null}
    <ContactModal />
    <AvaDrawer />
  </>;
}
