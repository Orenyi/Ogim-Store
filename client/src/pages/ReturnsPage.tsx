import ReturnsHero from "../components/returns/ReturnsHero";
import ReturnHighlights from "../components/returns/ReturnHighlights";
import ReturnPolicy from "../components/returns/ReturnPolicy";
import HowToReturn from "../components/returns/HowToReturn";

export default function ReturnsPage() {
  return (
    <main className="min-w-0 overflow-hidden bg-[var(--color-paper)]">
      <ReturnsHero />
      <ReturnHighlights />
      <ReturnPolicy />
      <HowToReturn />
    </main>
  );
}
