import type { ReactNode } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import Button from "./Button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  className?: string;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't complete your request. Please try again.",
  icon,
  onRetry,
  retryLabel = "Try again",
  isRetrying = false,
  className = "",
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={[
        "flex min-h-60 flex-col items-center justify-center",
        "rounded-[var(--radius-card)] border border-[var(--color-error)]/20",
        "bg-white px-6 py-10 text-center",
        className,
      ].join(" ")}
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-error-soft)] text-[var(--color-error)]">
        {icon ?? <FiAlertCircle size={25} aria-hidden="true" />}
      </div>

      <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
        {description}
      </p>

      {onRetry && (
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={onRetry}
            loading={isRetrying}
            leftIcon={
              isRetrying ? undefined : (
                <FiRefreshCw size={15} aria-hidden="true" />
              )
            }
          >
            {isRetrying ? "Retrying..." : retryLabel}
          </Button>
        </div>
      )}
    </section>
  );
}
