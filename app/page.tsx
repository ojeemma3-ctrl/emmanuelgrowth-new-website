import { About } from '../components/home/About';
import { FAQ } from '../components/home/FAQ';
import { FinalCTA } from '../components/home/FinalCTA';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { OfferSections } from '../components/home/OfferSections';
import { Pricing } from '../components/home/Pricing';
import { SiteShell } from '../components/home/SiteShell';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://emmanuelgrowth.com/#organization',
      name: 'Emmanuel Growth',
      url: 'https://emmanuelgrowth.com/',
      logo: 'https://emmanuelgrowth.com/emmanuel-growth-logo-800.png',
      description:
        'Practical marketing systems that help businesses get found online, respond to enquiries faster and stay connected with their customers.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://emmanuelgrowth.com/#website',
      url: 'https://emmanuelgrowth.com/',
      name: 'Emmanuel Growth',
      publisher: {
        '@id': 'https://emmanuelgrowth.com/#organization',
      },
    },
  ],
};

export default function Home() {
  return (
    <SiteShell
      beforeMain={(
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    >
      <Hero />
      <OfferSections />
      <HowItWorks />
      <Pricing variant="home" />
      <FAQ />
      <About />
      <FinalCTA heading="See where your business can win more customers." />
    </SiteShell>
  );
}
