import { useMemo, useState } from "react";
import { FiChevronDown, FiTrendingUp } from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

import RevenueChart from "./RevenueChart";

import type { RevenueDataPoint } from "../../types/dashboard.types";

type RevenuePeriod = "7days" | "30days" | "thisMonth";

type RevenueOverviewProps = {
  data: RevenueDataPoint[];
};

const periodOptions: { label: string; value: RevenuePeriod }[] = [
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "This month", value: "thisMonth" },
];

const compactCurrencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function RevenueOverview({ data }: RevenueOverviewProps) {
  const [period, setPeriod] = useState<RevenuePeriod>("30days");
  const shouldReduceMotion = useReducedMotion();

  const filteredData = useMemo(() => {
    if (period === "7days") return data.slice(-7);
    if (period === "30days") return data.slice(-30);

    return data;
  }, [data, period]);

  const totalRevenue = useMemo(
    () => filteredData.reduce((total, item) => total + item.revenue, 0),
    [filteredData],
  );

  const selectedLabel =
    periodOptions.find((option) => option.value === period)?.label ??
    "Last 30 days";

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-labelledby="revenue-overview-title"
      className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
    >
      {/* Card heading */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="revenue-overview-title"
            className="font-heading text-lg font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-xl"
          >
            Revenue Overview
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <FiTrendingUp size={13} className="text-[var(--color-success)]" />
            <span>{selectedLabel}</span>
          </div>
        </div>

        {/* Period selector */}
        <div className="relative shrink-0">
          <select
            aria-label="Revenue chart period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as RevenuePeriod)}
            className="h-9 min-w-[125px] appearance-none rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white py-1.5 pl-3 pr-9 text-xs font-medium text-[var(--color-ink)] outline-none transition-colors hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] sm:min-w-[140px]"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <FiChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3 flex items-baseline gap-2">
        <p className="font-heading text-lg font-extrabold tracking-[-0.035em] text-[var(--color-ink)] sm:text-xl">
          {compactCurrencyFormatter.format(totalRevenue)}
        </p>
        <span className="text-[11px] text-[var(--color-muted)]">
          revenue in selected period
        </span>
      </div>

      {/* Chart */}
      <RevenueChart data={filteredData} />
    </motion.section>
  );
}
