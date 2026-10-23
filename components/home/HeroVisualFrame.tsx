// The frame around the hero's example visual. It owns everything except the picture itself: position
// (under the nav, cropped by the right edge of the page), height, dimming and all the fade masks
// (top, bottom and left), plus the screen-reader text. The hero imports only this frame.
// To use an image or video instead, replace <HeroVisual /> below with it (sized to fill the frame,
// for example width/height 100% and object-fit cover) and update the description; the frame stays as is.
import { HeroVisual, heroVisualDescription } from './HeroVisual';

export function HeroVisualFrame() {
  return (
    <div className="hv-frame">
      <p className="sr-only">{heroVisualDescription}</p>
      <div className="hv-frame-inner" aria-hidden="true">
        <HeroVisual />
      </div>
    </div>
  );
}
