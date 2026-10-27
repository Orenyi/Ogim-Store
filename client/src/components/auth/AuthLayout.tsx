import type { ReactNode } from "react";
import heroPhones from "../../assets/images/heroPhones.webp";
import AuthBenefits from "./AuthBenefits";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative isolate min-h-full overflow-hidden bg-[var(--color-paper)]">
      {/* Background image covering the entire registration layout */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <img
          src={heroPhones}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.12] sm:opacity-[0.15] lg:opacity-[0.20]"
          loading="eager"
        />

        {/* Light overlay keeps the entire page calm and readable */}
        <div className="absolute inset-0 bg-[var(--color-paper)]/75" />

        {/* Subtle Ogim orange glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(240,100,40,0.06),transparent_65%)]" />
      </div>

      <div className="page-container py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(390px,440px)] lg:gap-8 xl:gap-12">
          {/* Left introduction */}
          <AuthBenefits />

          {/* Right registration form */}
          <section
            aria-labelledby="register-heading"
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-[440px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-7 lg:p-8">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
