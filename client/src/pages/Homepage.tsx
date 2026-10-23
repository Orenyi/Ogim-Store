import HeroSection from "../components/home/sections/HeroSection";
import TrustBenefitsSection from "../components/home/sections/TrustBenefitsSection";

export default function Homepage() {
  return (
    <main className="min-w-0 overflow-x-clip">
      <HeroSection />
      <TrustBenefitsSection />

      {/* Add each section here after reviewing its UI/UX:
          TrustBenefitsSection
          ShopByBrandSection
          FeaturedProductsSection
          NewArrivalsSection
          ShopByConditionSection
          WhyOgimSection
          FAQSection
          NewsletterSection
      */}
    </main>
  );
}
