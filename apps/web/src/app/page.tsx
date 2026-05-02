import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import RaritySpectrum from '../components/landing/RaritySpectrum';
import FuseTeaser from '../components/landing/FuseTeaser';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Index() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <RaritySpectrum />
      <FuseTeaser />
      <FinalCTA />
      <Footer />
    </>
  );
}
