import {
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import type { RevenueSummary } from "../../types/revenue.types";

type Props = {
  summary: RevenueSummary;
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const number = (amount: number) =>
  new Intl.NumberFormat("en-NG").format(amount);

export default function RevenueStats({ summary }: Props) {
  const stats = [
    {
      label: "Total Revenue",
      value: currency(summary.totalRevenue.value),
      change: summary.totalRevenue.percentageChange,
      icon: FiBox,
      format: "currency",
    },
    {
      label: "Total Orders",
      value: number(summary.totalOrders.value),
      change: summary.totalOrders.percentageChange,
      icon: FiLayersIcon,
      format: "number",
    },
    {
      label: "Units Sold",
      value: number(summary.unitsSold.value),
      change: summary.unitsSold.percentageChange,
      icon: FiShoppingBag,
      format: "number",
    },
    {
      label: "Avg. Order Value",
      value: currency(summary.averageOrderValue.value),
      change: summary.averageOrderValue.percentageChange,
      icon: FiUsers,
      format: "currency",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const positive = stat.change >= 0;

        return (
          <article
            key={stat.label}
            className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:p-4"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] sm:h-12 sm:w-12">
                <Icon size={21} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--color-muted)] sm:text-sm">
                  {stat.label}
                </p>
                <p className="mt-1 truncate font-heading text-lg font-extrabold tracking-tight text-[var(--color-ink)] sm:text-2xl">
                  {stat.value}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold sm:text-xs ${
                  positive
                    ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                    : "bg-[var(--color-error-soft)] text-[var(--color-error)]"
                }`}
              >
                {positive ? (
                  <FiTrendingUp size={12} />
                ) : (
                  <FiTrendingDown size={12} />
                )}
                {positive ? "+" : ""}
                {stat.change.toFixed(1)}%
              </span>
              <span className="text-[10px] text-[var(--color-muted)] sm:text-xs">
                vs. previous period
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function FiLayersIcon(props: { size?: number }) {
  return <FiBox {...props} />;
}
