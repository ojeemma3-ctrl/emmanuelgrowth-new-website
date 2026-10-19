import { REQUIRE_CONTACT_BEFORE_REPORT } from '../../../../lib/check-config';
import { readContact } from '../../../../lib/visibility/contact';
import { PlacesError, profile } from '../../../../lib/visibility/places';
import { assertPublicUrl, FetchBlocked } from '../../../../lib/visibility/safe-fetch';
import { json, readJson, signTicket, str, takeLimit, verifyTurnstile } from '../../../../lib/visibility/server';
import { socialPlatform } from '../../../../lib/visibility/social';
import { normaliseUrl } from '../../../../lib/visibility/website';

const KEYWORD = /^[\p{L}\p{N}][\p{L}\p{N} '&-]{1,39}$/u;

// Starts a confirmed check: validates the form, applies limits, then runs check A (Google profile).
// With REQUIRE_CONTACT_BEFORE_REPORT, the contact and consent are checked first, before any Google
// or PageSpeed call. The contact isn't stored here; it is only validated.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return json({ error: 'invalid' }, 400);
  if (str(body.company_url)) return json({ error: 'invalid' }, 400); // honeypot
  if (REQUIRE_CONTACT_BEFORE_REPORT) {
    const checked = readContact(body);
    if ('error' in checked) return json({ error: checked.error }, 400);
  }
  const keyword = str(body.keyword, 40) || undefined;
  if (keyword && !KEYWORD.test(keyword)) return json({ error: 'keyword' }, 400);
  if (!(await verifyTurnstile(str(body.turnstileToken, 2048), request))) return json({ error: 'verification' }, 400);

  const mode = body.mode === 'manual' ? 'manual' : 'place';
  const placeId = str(body.placeId, 300);
  const manualName = str(body.name, 120);
  const manualTown = str(body.town, 80);
  const manualWebsite = str(body.website, 300);
  if (mode === 'place' && !/^[\w-]{10,300}$/.test(placeId)) return json({ error: 'invalid' }, 400);
  if (mode === 'manual' && (!manualName || !manualTown)) return json({ error: 'invalid' }, 400);

  let website: string | undefined;
  if (mode === 'manual' && manualWebsite) {
    try {
      website = (await assertPublicUrl(normaliseUrl(manualWebsite))).toString();
    } catch (error) {
      return json({ error: error instanceof FetchBlocked ? 'bad_website' : 'invalid' }, 400);
    }
  }

  const limit = await takeLimit(request, 'check');
  if (!limit.ok) return json({ error: limit.reason }, 429);

  if (mode === 'manual') {
    const social = socialPlatform(website) ?? undefined;
    const ticket = await signTicket({ name: manualName, town: manualTown, website, social, keyword });
    return json({ ticket, profile: null, website: website ?? null, social: social ?? null });
  }

  try {
    const place = await profile(placeId);
    const social = socialPlatform(place.website) ?? undefined;
    const ticket = await signTicket({ placeId: place.placeId, name: place.name, town: place.town, category: place.category, categoryType: place.categoryType, website: place.website, address: place.address, social, keyword });
    return json({ ticket, profile: place, website: place.website ?? null, social: social ?? null });
  } catch (error) {
    return json({ error: error instanceof PlacesError ? error.kind : 'upstream' }, 502);
  }
}
