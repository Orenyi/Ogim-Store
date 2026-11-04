import { motion, useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type {
  DashboardOrderStatus,
  OrderStatusSummary,
} from "../../types/dashboard.types";

type OrdersByStatusProps = {
  data: OrderStatusSummary[];
};

const statusConfig: Record<
  DashboardOrderStatus,
  { label: string; color: string }
> = {
  delivered: {
    label: "Delivered",
    color: "var(--color-success)",
  },
  in_transit: {
    label: "In Transit",
    color: "var(--color-accent)",
  },
  processing: {
    label: "Processing",
    color: "#60A5FA",
  },
  pending: {
    label: "Pending",
    color: "var(--color-border-strong)",
  },
  dispatched: {
    label: "Dispatched",
    color: "var(--color-warning)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--color-error)",
  },
  refunded: {
    label: "Refunded",
    color: "var(--color-muted)",
  },
};

type StatusTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: OrderStatusSummary;
  }>;
};

function StatusTooltip({ active, payload }: StatusTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const config = statusConfig[item.status];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 shadow-[var(--shadow-dropdown)]">
      <p className="text-xs text-[var(--color-muted)]">{config.label}</p>
      <p className="mt-1 text-sm font-bold text-[var(--color-ink)]">
        {item.count.toLocaleString("en-NG")} orders
      </p>
      <p className="text-xs text-[var(--color-muted)]">
        {item.percentage.toFixed(1)}% of orders
      </p>
    </div>
  );
}

export default function OrdersByStatus({ data }: OrdersByStatusProps) {
  const shouldReduceMotion = useReducedMotion();

  const chartData = data.filter((item) => item.count > 0);

  const totalOrders = chartData.reduce((total, item) => total + item.count, 0);

  const hasData = totalOrders > 0;

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      aria-labelledby="orders-by-status-title"
      className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
    >
      <div className="mb-4">
        <h2
          id="orders-by-status-title"
          className="font-heading text-lg font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-xl"
        >
          Orders by Status
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Current order distribution
        </p>
      </div>

      {!hasData ? (
        <div className="flex min-h-[245px] items-center justify-center rounded-xl bg-[var(--color-surface-muted)]/50 px-4 text-center">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              No order data available
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Order statuses will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-3 lg:grid-cols-[minmax(145px,0.9fr)_minmax(0,1fr)] lg:gap-4">
          {/* Doughnut chart */}
          <div className="relative mx-auto h-[220px] w-full max-w-[250px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius="61%"
                  outerRadius="87%"
                  paddingAngle={1.5}
                  stroke="none"
                  isAnimationActive={!shouldReduceMotion}
                  animationDuration={650}
                >
                  {chartData.map((item) => (
                    <Cell
                      key={item.status}
                      fill={statusConfig[item.status].color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={<StatusTooltip />}
                  wrapperStyle={{ outline: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-extrabold tracking-[-0.045em] text-[var(--color-ink)] sm:text-[27px]">
                {totalOrders.toLocaleString("en-NG")}
              </span>
              <span className="text-xs font-medium text-[var(--color-muted)]">
                Orders
              </span>
            </div>
          </div>

          {/* Status legend */}
          <div className="min-w-0 space-y-3">
            {chartData.map((item) => {
              const config = statusConfig[item.status];

              return (
                <div
                  key={item.status}
                  className="flex min-w-0 items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />

                    <span className="truncate text-xs text-[var(--color-ink)] sm:text-sm">
                      {config.label}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-semibold tabular-nums text-[var(--color-ink)]">
                      {item.count.toLocaleString("en-NG")}
                    </span>
                    <span className="ml-1 text-[10px] text-[var(--color-muted)] sm:text-xs">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
}
