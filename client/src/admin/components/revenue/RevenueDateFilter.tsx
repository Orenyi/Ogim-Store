import { useState } from "react";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import type {
  RevenueDateRange,
  RevenuePeriod,
} from "../../types/revenue.types";

type Props = {
  value: RevenueDateRange;
  onChange: (value: RevenueDateRange) => void;
};

const periods: { label: string; value: RevenuePeriod }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this-week" },
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "This Year", value: "this-year" },
  { label: "Custom Range", value: "custom" },
];

export default function RevenueDateFilter({ value, onChange }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [startDate, setStartDate] = useState(value.startDate ?? "");
  const [endDate, setEndDate] = useState(value.endDate ?? "");

  function handlePeriodChange(period: RevenuePeriod) {
    if (period === "custom") {
      setCustomOpen(true);
      return;
    }

    setCustomOpen(false);
    onChange({ period });
  }

  function applyCustomRange() {
    if (!startDate || !endDate || startDate > endDate) return;

    onChange({
      period: "custom",
      startDate,
      endDate,
    });
    setCustomOpen(false);
  }

  const selectedLabel =
    value.period === "custom"
      ? "Custom Range"
      : (periods.find((period) => period.value === value.period)?.label ??
        "This Month");

  return (
    <div className="relative">
      <label className="flex h-11 min-w-[170px] items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5">
        <FiCalendar className="shrink-0 text-[var(--color-muted)]" size={17} />
        <select
          aria-label="Revenue reporting period"
          value={value.period}
          onChange={(event) =>
            handlePeriodChange(event.target.value as RevenuePeriod)
          }
          className="min-w-0 flex-1 appearance-none bg-transparent text-sm font-medium text-[var(--color-ink)] outline-none"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
        <FiChevronDown
          size={15}
          className="pointer-events-none text-[var(--color-muted)]"
        />
      </label>

      {customOpen && (
        <>
          <button
            type="button"
            aria-label="Close custom date range"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setCustomOpen(false)}
          />
          <div className="absolute right-0 top-14 z-40 w-[min(330px,calc(100vw-2rem))] rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-dropdown)]">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              Custom date range
            </h3>
            <div className="mt-3 grid gap-3">
              <label className="text-xs font-medium text-[var(--color-muted)]">
                Start date
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                />
              </label>
              <label className="text-xs font-medium text-[var(--color-muted)]">
                End date
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="h-9 rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-ink)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!startDate || !endDate || startDate > endDate}
                onClick={applyCustomRange}
                className="h-9 rounded-lg bg-[var(--color-accent)] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply range
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
