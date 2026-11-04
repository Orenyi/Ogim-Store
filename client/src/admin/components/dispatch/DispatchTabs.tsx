import type {
  DispatchStatus,
  DispatchSummary,
} from "../../types/dispatch.types";

type TabValue = DispatchStatus | "all";

type Props = {
  value: TabValue;
  summary: DispatchSummary;
  onChange: (value: TabValue) => void;
};

export default function DispatchTabs({ value, summary, onChange }: Props) {
  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "All Dispatches", value: "all", count: summary.total },
    { label: "Pending", value: "pending", count: summary.pending },
    { label: "Dispatched", value: "dispatched", count: summary.dispatched },
    { label: "In Transit", value: "in_transit", count: summary.inTransit },
    { label: "Delivered", value: "delivered", count: summary.delivered },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-border)] px-3 scrollbar-hide sm:px-4">
      {tabs.map((tab) => {
        const active = value === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={active}
            className={`relative flex shrink-0 items-center gap-2 px-3 py-4 text-xs font-semibold transition-colors ${
              active
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                active
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "bg-[var(--color-surface-muted)]"
              }`}
            >
              {tab.count}
            </span>

            {active && (
              <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[var(--color-accent)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
