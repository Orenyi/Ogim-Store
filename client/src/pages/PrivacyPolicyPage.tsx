import PrivacyHero from "../components/privacy/PrivacyHero";
import PrivacyTableOfContents from "../components/privacy/PrivacyTableOfContents";
import PrivacyPolicyContent from "../components/privacy/PrivacyPolicyContent";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-w-0 overflow-hidden bg-[var(--color-paper)]">
      <PrivacyHero />

      <div className="page-container py-7 sm:py-10 lg:py-12">
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <div className="min-w-0 lg:sticky lg:top-6">
            <PrivacyTableOfContents />
          </div>

          <div className="min-w-0">
            <PrivacyPolicyContent />
          </div>
        </div>
      </div>
    </main>
  );
}
