import type { Metadata } from 'next';
import { TalkLink } from '../../../components/guides/TalkLink';
import { LegalPage } from '../../../components/legal/LegalPage';
import { LISTINGS_BY_COUNTRY, listingsFor, type CountryCode } from '../../../lib/listings-by-country';

export const metadata: Metadata = {
  title: 'Where Your Business Details Should Match | Emmanuel Growth',
  description: 'Why your business name, address and phone should match across Google, Apple, Bing, Facebook and local directories, and where to check them.',
  alternates: { canonical: '/guides/listings' },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ListingsGuidePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const hospitality = first(params.type) === 'hospitality';
  const list = listingsFor(first(params.country), hospitality);
  const countryLink = (code?: CountryCode) => {
    const q = new URLSearchParams();
    if (code) q.set('country', code);
    if (hospitality) q.set('type', 'hospitality');
    const s = q.toString();
    return `/guides/listings${s ? `?${s}` : ''}`;
  };
  const codes = (Object.keys(LISTINGS_BY_COUNTRY) as CountryCode[]).filter((code) => LISTINGS_BY_COUNTRY[code].entries.length > 0);

  return (
    <LegalPage
      eyebrow="GUIDE"
      title="Where your business details should match"
      intro="Customers may find your business in more places than your Google profile. Keeping your name, address and phone the same everywhere helps them trust they’ve found the right business."
    >
      <section>
        <h2>Why matching details help</h2>
        <p>When someone sees your business on Google, then on a directory or a Facebook page, the same name, address and phone number reassure them it’s the same business and that the details are current.</p>
        <p>Search engines and AI assistants read these listings too. When your details match, it may be easier for them to understand which business is yours and where you are. When they differ, they may show an older address or number.</p>
      </section>

      <section>
        <h2>How to check</h2>
        <ul>
          <li>Write down your business name, address and phone exactly as they appear on your Google profile.</li>
          <li>Search for your business on each listing below.</li>
          <li>Where you find a listing, check the details match, and update or claim it if you can.</li>
          <li>You don’t need to be everywhere: start with the listings your customers use.</li>
        </ul>
      </section>

      <section aria-labelledby="listings-title">
        <h2 id="listings-title">Listings to check{list.label ? ` in ${list.label}` : ''}</h2>
        <nav className="guide-countries" aria-label="Choose a country">
          {codes.map((code) => (
            <a key={code} href={countryLink(code)} aria-current={list.code === code ? 'page' : undefined}>{LISTINGS_BY_COUNTRY[code].label}</a>
          ))}
          <a href={countryLink()} aria-current={list.code ? undefined : 'page'}>Other countries</a>
        </nav>
        <ul className="guide-listings">
          {list.entries.map((entry) => (
            <li key={entry.name}>
              <h3>{entry.name}</h3>
              <p>{entry.why}</p>
              <a href={`https://${entry.domain}`} target="_blank" rel="noreferrer">{entry.domain}</a>
            </li>
          ))}
        </ul>
        {list.note ? <p>{list.note}</p> : null}
        {list.code === 'FR' ? <p>We haven’t added French directories yet. Start with the main listings above.</p> : null}
        {!list.code ? <p>These are the main listings in most countries. Local directories vary, so it may help to search for your business name and see which sites come up.</p> : null}
        <p className="guide-note">I haven’t checked these directories’ fees, sign-up rules or terms. Please read them on each site before you sign up.</p>
      </section>

      <p className="guide-talk"><TalkLink /></p>
    </LegalPage>
  );
}
