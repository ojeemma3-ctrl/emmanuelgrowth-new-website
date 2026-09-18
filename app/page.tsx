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

export default function Home() {
  return (
    <HomeInteractions>
      <div>
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
