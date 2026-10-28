import AboutHero from "../components/about/AboutHero";
import AboutTrustFeatures from "../components/about/AboutTrustFeatures";
import AboutStory from "../components/about/AboutStory";
import AboutValues from "../components/about/AboutValues";

export default function AboutPage() {
  return (
    <main className="min-w-0 overflow-hidden bg-[var(--color-paper)]">
      <AboutHero />
      <AboutTrustFeatures />
      <AboutStory />
      <AboutValues />
    </main>
  );
}
