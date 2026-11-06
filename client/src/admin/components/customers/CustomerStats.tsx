import {
  FiUsers,
  FiUserPlus,
  FiShoppingCart,
  FiSlash,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
} from "react-icons/fi";

import type { CustomersSummary } from "../../types/customers.types";

type Props = {
  summary: CustomersSummary;
};

const numberFormat = new Intl.NumberFormat("en-NG");

function formatPercentage(value: number | null): string {
  if (value === null) {
    return "New";
  }

  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
}

export default function CustomerStats({ summary }: Props) {
  const stats = [
    {
      label: "Total Customers",
      value: summary.totalCustomers,
      change: summary.percentageChanges.totalCustomers,
      icon: FiUsers,
      inverse: false,
    },
    {
      label: "New Customers",
      value: summary.newCustomers,
      change: summary.percentageChanges.newCustomers,
      icon: FiUserPlus,
      inverse: false,
    },
    {
      label: "Customers with Orders",
      value: summary.customersWithOrders,
      change: summary.percentageChanges.customersWithOrders,
      icon: FiShoppingCart,
      inverse: false,
    },
    {
      label: "Inactive Accounts",
      value: summary.inactiveAccounts,
      change: summary.percentageChanges.inactiveAccounts,
      icon: FiSlash,
      inverse: true,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const change = stat.change;

        const isNeutral = change === 0;
        const isIncrease = change !== null && change > 0;
        const isDecrease = change !== null && change < 0;

        const isNegative =
          !isNeutral && (stat.inverse ? isIncrease : isDecrease);

        const TrendIcon = isNeutral
          ? FiMinus
          : isDecrease
            ? FiTrendingDown
            : FiTrendingUp;

        const changeColor = isNeutral
          ? "bg-[var(--color-stone)] text-[var(--color-muted)]"
          : isNegative
            ? "bg-[var(--color-error-soft)] text-[var(--color-error)]"
            : "bg-[var(--color-success-soft)] text-[var(--color-success)]";

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
                <p className="truncate text-[11px] font-medium text-[var(--color-muted)] sm:text-sm">
                  {stat.label}
                </p>

                <p className="mt-1 font-heading text-xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-2xl">
                  {numberFormat.format(stat.value)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold sm:text-xs ${changeColor}`}
              >
                <TrendIcon size={12} />
                {formatPercentage(change)}
              </span>

              <span className="text-[10px] text-[var(--color-muted)] sm:text-xs">
                vs last month
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
