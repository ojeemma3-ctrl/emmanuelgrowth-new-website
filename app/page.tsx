import { About } from '../components/home/About';
import { AvaDemo } from '../components/home/AvaDemo';
import { ConvertMoreEnquiries } from '../components/home/ConvertMoreEnquiries';
import { CustomerJourney } from '../components/home/CustomerJourney';
import { FinalCTA } from '../components/home/FinalCTA';
import { Footer } from '../components/home/Footer';
import { GetFound } from '../components/home/GetFound';
import { Header } from '../components/home/Header';
import { Hero } from '../components/home/Hero';
import { HomeAnimations } from '../components/home/HomeAnimations';
import { HomeInteractions } from '../components/home/HomeInteractions';
import { InteractionLayer } from '../components/home/InteractionLayer';
import { ReviewsFollowUp } from '../components/home/ReviewsFollowUp';
import { Services } from '../components/home/Services';

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
    <HomeInteractions>
      <div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content">
          <Hero />
          <Services />
          <GetFound />
          <ConvertMoreEnquiries />
          <ReviewsFollowUp />
          <CustomerJourney />
          <AvaDemo />
          <About />
          <FinalCTA />
        </main>
        <Footer />
        <InteractionLayer />
        <HomeAnimations />
      </div>
    </HomeInteractions>
  );
}
