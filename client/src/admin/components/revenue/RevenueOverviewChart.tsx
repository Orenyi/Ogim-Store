import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiBarChart2 } from "react-icons/fi";

import type {
  RevenueChartMode,
  RevenueChartPoint,
} from "../../types/revenue.types";

type Props = {
  data: RevenueChartPoint[];
};

const formatNaira = (value: number) =>
  `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-NG").format(value);

export default function RevenueOverviewChart({ data }: Props) {
  const [mode, setMode] = useState<RevenueChartMode>("revenue");

  const chartData = useMemo(() => data, [data]);

  const hasData = chartData.some((item) => item.revenue > 0 || item.orders > 0);

  return (
    <section className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <FiBarChart2 size={19} />
          </span>
          <div>
            <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
              Revenue Overview
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              {mode === "revenue"
                ? "Total sales revenue over time."
                : "Number of orders over time."}
            </p>
          </div>
        </div>

        <div className="flex rounded-full bg-[var(--color-surface-muted)] p-1">
          {(["revenue", "orders"] as RevenueChartMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                mode === item
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-[250px] w-full sm:h-[285px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueAreaFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#F06428" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="#F06428" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ordersAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#287A55" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#287A55" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 4"
              />

              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={16}
              />

              <YAxis
                width={mode === "revenue" ? 58 : 38}
                tickFormatter={(value) =>
                  mode === "revenue" ? formatNaira(value) : formatNumber(value)
                }
                tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickMargin={6}
              />

              <Tooltip
                cursor={{
                  stroke: "var(--color-border-strong)",
                  strokeDasharray: "4 4",
                }}
                formatter={(value) => [
                  mode === "revenue"
                    ? formatNaira(Number(value))
                    : formatNumber(Number(value)),
                  mode === "revenue" ? "Revenue" : "Orders",
                ]}
                labelStyle={{ color: "#15171C", fontWeight: 700 }}
                contentStyle={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  background: "var(--color-white)",
                  boxShadow: "0 8px 24px rgba(21,23,28,0.08)",
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey={mode}
                stroke={mode === "revenue" ? "#F06428" : "#287A55"}
                strokeWidth={2.5}
                fill={`url(#${mode === "revenue" ? "revenueAreaFill" : "ordersAreaFill"})`}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  fill: "#FFFFFF",
                }}
                dot={{
                  r: 2.5,
                  strokeWidth: 2,
                  fill: "#FFFFFF",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <FiBarChart2 size={28} className="text-[var(--color-muted)]" />
            <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
              No chart data available
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Select a different date range or connect your reports API.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
