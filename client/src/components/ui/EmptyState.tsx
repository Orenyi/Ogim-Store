import type { ReactNode } from "react";
import { FiPackage } from "react-icons/fi";
import Button from "./Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <section
      className={[
        "flex min-h-60 flex-col items-center justify-center",
        "rounded-[var(--radius-card)] border border-dashed",
        "border-[var(--color-border-strong)] bg-white px-6 py-10",
        "text-center",
        className,
      ].join(" ")}
      aria-labelledby="empty-state-title"
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-muted)]">
        {icon ?? <FiPackage size={25} aria-hidden="true" />}
      </div>

      <h2
        id="empty-state-title"
        className="text-lg font-bold text-[var(--color-ink)]"
      >
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} showArrow>
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
