import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueDataPoint } from "../../types/dashboard.types";

type RevenueChartProps = {
  data: RevenueDataPoint[];
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullCurrencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const chartDateFormatter = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "short",
});

const tooltipDateFormatter = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// ============================================
// DATE FORMATTER
// ============================================

function formatChartDate(value: string): string {
  // Backend returns dates in YYYY-MM-DD format.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12),
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return chartDateFormatter.format(date);
}

function formatTooltipDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12),
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return tooltipDateFormatter.format(date);
}

// ============================================
// TOOLTIP
// ============================================

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: RevenueDataPoint;
  }>;
};

function RevenueTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 shadow-[var(--shadow-dropdown)]">
      <p className="text-xs text-[var(--color-muted)]">
        {formatTooltipDate(point.date)}
      </p>

      <p className="mt-1 text-sm font-bold text-[var(--color-ink)]">
        {fullCurrencyFormatter.format(point.revenue)}
      </p>
    </div>
  );
}

// ============================================
// REVENUE CHART
// ============================================

export default function RevenueChart({ data }: RevenueChartProps) {
  const shouldReduceMotion = useReducedMotion();

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        shortDate: formatChartDate(item.date),
      })),
    [data],
  );

  const hasData = chartData.some((item) => Number(item.revenue) > 0);

  if (!hasData) {
    return (
      <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl bg-[var(--color-surface-muted)]/50 px-4 text-center sm:min-h-[300px]">
        <p className="text-sm font-semibold text-[var(--color-ink)]">
          No revenue data available
        </p>

        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Revenue activity will appear here when orders are paid.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-[245px] w-full min-w-0 sm:h-[290px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 4, left: -10, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="0"
          />

          <XAxis
            dataKey="shortDate"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--color-muted)",
              fontSize: 11,
              fontFamily: "DM Sans",
            }}
            tickMargin={12}
            interval="preserveStartEnd"
            minTickGap={18}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width={48}
            tick={{
              fill: "var(--color-muted)",
              fontSize: 10,
              fontFamily: "DM Sans",
            }}
            tickFormatter={(value: number) =>
              value === 0 ? "₦0" : currencyFormatter.format(value)
            }
            domain={[0, "auto"]}
            tickCount={6}
          />

          <Tooltip
            content={<RevenueTooltip />}
            cursor={{
              fill: "var(--color-accent-soft)",
              opacity: 0.5,
            }}
          />

          <Bar
            dataKey="revenue"
            name="Revenue"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
            isAnimationActive={!shouldReduceMotion}
            animationDuration={650}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`${entry.date}-${index}`}
                fill="var(--color-accent)"
                fillOpacity={index === chartData.length - 1 ? 1 : 0.52}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
