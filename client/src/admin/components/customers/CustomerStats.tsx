import {
  FiUsers,
  FiUserPlus,
  FiShoppingCart,
  FiSlash,
  FiTrendingUp,
} from "react-icons/fi";

import type { CustomersSummary } from "../../types/customers.types";

type Props = {
  summary: CustomersSummary;
};

const numberFormat = new Intl.NumberFormat("en-NG");

export default function CustomerStats({ summary }: Props) {
  const stats = [
    {
      label: "Total Customers",
      value: summary.totalCustomers,
      change: "+12.5%",
      icon: FiUsers,
    },
    {
      label: "New Customers",
      value: summary.newCustomers,
      change: "+8.3%",
      icon: FiUserPlus,
    },
    {
      label: "Customers with Orders",
      value: summary.customersWithOrders,
      change: "+10.9%",
      icon: FiShoppingCart,
    },
    {
      label: "Inactive Accounts",
      value: summary.inactiveAccounts,
      change: "+2.9%",
      icon: FiSlash,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

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

            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-1 text-[10px] font-bold text-[var(--color-success)] sm:text-xs">
                <FiTrendingUp size={12} />
                {stat.change}
              </span>
              <span className="text-[10px] text-[var(--color-muted)] sm:text-xs">
                this month
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
