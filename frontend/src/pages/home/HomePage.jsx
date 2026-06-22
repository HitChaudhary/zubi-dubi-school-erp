import HeroSection    from '../../components/home/HeroSection';
import FeaturesSection from '../../components/home/FeaturesSection';
import UserRolesSection from '../../components/home/UserRolesSection';
import StatsSection    from '../../components/home/StatsSection';
import PricingSection  from '../../components/home/PricingSection';
import CTASection      from '../../components/home/CTASection';
import Footer          from '../../components/common/Footer';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <UserRolesSection />
      <StatsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </>
  );
}
