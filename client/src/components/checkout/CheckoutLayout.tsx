import type { ReactNode } from "react";

import CheckoutOrderSummary from "./CheckoutOrderSummary";
import CheckoutStepper, { type CheckoutStep } from "./CheckoutStepper";

interface CheckoutLayoutProps {
  children: ReactNode;
  currentStep: CheckoutStep;
  deliveryFee?: number;
  showEditCartLink?: boolean;
  showOrderSummary?: boolean;
}

export default function CheckoutLayout({
  children,
  currentStep,
  deliveryFee = 0,
  showEditCartLink = true,
  showOrderSummary = true,
}: CheckoutLayoutProps) {
  return (
    <main className="min-h-screen bg-[var(--color-paper)] pb-10">
      <div className="page-container">
        <header className="pb-6 pt-6 sm:pb-8 sm:pt-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                Secure checkout
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-3xl">
                Complete your order
              </h1>
            </div>

            <span className="hidden items-center gap-2 text-xs font-medium text-[var(--color-muted)] sm:inline-flex">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[var(--color-success)]"
              />
              Secure shopping
            </span>
          </div>

          <div className="mx-auto max-w-3xl">
            <CheckoutStepper currentStep={currentStep} />
          </div>
        </header>

        <div
          className={[
            "grid items-start gap-5 lg:gap-6",
            showOrderSummary
              ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)]"
              : "grid-cols-1",
          ].join(" ")}
        >
          <section
            aria-label="Checkout details"
            className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] sm:p-6 lg:p-7"
          >
            {children}
          </section>

          {showOrderSummary && (
            <div className="min-w-0 lg:sticky lg:top-6">
              <CheckoutOrderSummary
                deliveryFee={deliveryFee}
                showEditLink={showEditCartLink}
              />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-[var(--color-muted)]">
          Need help with your order? Contact our customer support team.
        </p>
      </div>
    </main>
  );
}
