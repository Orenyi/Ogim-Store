import type { ReactNode } from "react";
import heroPhones from "../../assets/images/heroPhones.webp";
import AuthBenefits from "./AuthBenefits";

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow: string;
  heading: string;
  description: string;
  showBenefits?: boolean;
}

export default function AuthLayout({
  children,
  eyebrow,
  heading,
  description,
  showBenefits = true,
}: AuthLayoutProps) {
  return (
    <main className="relative isolate min-h-full overflow-hidden ">
      {/* Shared background image across the complete auth layout */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src={heroPhones}
          alt=""
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.20]"
        />
      </div>

      <div className="page-container relative z-10 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(390px,440px)] lg:gap-8 xl:gap-12">
          <AuthBenefits
            eyebrow={eyebrow}
            heading={heading}
            description={description}
            showBenefits={showBenefits}
          />

          <section
            aria-labelledby="auth-form-heading"
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
