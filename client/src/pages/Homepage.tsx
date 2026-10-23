import HeroSection from "../components/home/sections/HeroSection";
import TrustBenefitsSection from "../components/home/sections/TrustBenefitsSection";
import ShopByBrandSection from "../components/home/sections/ShopByBrandSection";
import FeaturedProductsSection from "../components/home/sections/FeaturedProductsSection";
import NewArrivalsSection from "../components/home/sections/NewArrivalsSection";
import WhyOgimSection from "../components/home/sections/WhyOgimSection";
import FAQSection from "../components/home/sections/FAQSection";
import ShopByConditionSection from "../components/home/sections/ShopByConditionSection";
import NewsletterSection from "../components/home/sections/NewsletterSection";

export default function Homepage() {
  return (
    <main className="min-w-0 overflow-x-clip">
      <HeroSection />
      <TrustBenefitsSection />

      <ShopByBrandSection />
      <FeaturedProductsSection />
      <NewArrivalsSection />

      <ShopByConditionSection />
      <WhyOgimSection />
      <FAQSection />
      <NewsletterSection />

      {/* Add each section here after reviewing its UI/UX:
         
          NewArrivalsSection
          ShopByConditionSection
          WhyOgimSection
          FAQSection
          NewsletterSection
      */}
    </main>
  );
}
