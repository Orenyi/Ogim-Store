import TermsHero from "../components/terms/TermsHero";
import TermsTableOfContents from "../components/terms/TermsTableOfContents";
import TermsContent from "../components/terms/TermsContent";

export default function TermsPage() {
  return (
    <main className="min-w-0 overflow-hidden bg-[var(--color-paper)]">
      <TermsHero />

      <div className="page-container py-7 sm:py-10 lg:py-12">
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <div className="min-w-0 lg:sticky lg:top-6">
            <TermsTableOfContents />
          </div>

          <div className="min-w-0">
            <TermsContent />
          </div>
        </div>
      </div>
    </main>
  );
}
