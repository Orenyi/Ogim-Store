import { FiCheck } from "react-icons/fi";

export type CheckoutStep = 1 | 2 | 3 | 4;

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

const steps = [
  { number: 1, label: "Contact & Delivery" },
  { number: 2, label: "Delivery Method" },
  { number: 3, label: "Payment" },
  { number: 4, label: "Review" },
] as const;

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isComplete = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <li
              key={step.number}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex min-w-0 flex-1 flex-col items-center"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={[
                    "absolute right-1/2 top-4 h-px w-full -translate-y-1/2",
                    isComplete
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-border-strong)]",
                  ].join(" ")}
                />
              )}

              <span
                className={[
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors duration-150",
                  isComplete
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : isCurrent
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-muted)]",
                ].join(" ")}
              >
                {isComplete ? (
                  <FiCheck size={15} aria-hidden="true" />
                ) : (
                  step.number
                )}
              </span>

              <span
                className={[
                  "mt-2 max-w-full px-1 text-center text-[10px] leading-4 sm:text-xs",
                  isCurrent
                    ? "font-bold text-[var(--color-ink)]"
                    : isComplete
                      ? "font-medium text-[var(--color-ink)]"
                      : "text-[var(--color-muted)]",
                ].join(" ")}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
