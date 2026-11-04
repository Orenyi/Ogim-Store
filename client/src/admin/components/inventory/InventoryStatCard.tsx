import type { IconType } from "react-icons";

type Props = {
  title: string;
  value: number;
  icon: IconType;
  tone: "accent" | "success" | "warning" | "error";
  helper?: string;
};

const tones = {
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
};

export default function InventoryStatCard({
  title,
  value,
  icon: Icon,
  tone,
  helper,
}: Props) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)] sm:gap-4 sm:p-4">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14 ${tones[tone]}`}
      >
        <Icon size={22} />
      </span>

      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[var(--color-muted)] sm:text-sm">
          {title}
        </p>

        <p className="mt-0.5 font-heading text-xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-2xl">
          {value.toLocaleString("en-NG")}
        </p>

        {helper && (
          <p className="mt-1 text-[10px] font-semibold text-[var(--color-muted)] sm:text-xs">
            {helper}
          </p>
        )}
      </div>
    </article>
  );
}
