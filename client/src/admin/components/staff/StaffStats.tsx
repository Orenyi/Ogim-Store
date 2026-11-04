import {
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiPauseCircle,
  FiTrendingUp,
} from "react-icons/fi";
import type { StaffSummary } from "../../types/staff.types";

type Props = {
  summary: StaffSummary;
};

export default function StaffStats({ summary }: Props) {
  const stats = [
    {
      label: "Total Staff",
      value: summary.totalStaff,
      icon: FiUsers,
      tone: "accent",
    },
    {
      label: "Roles",
      value: summary.totalRoles,
      icon: FiShield,
      tone: "orange",
    },
    {
      label: "Active Staff",
      value: summary.activeStaff,
      icon: FiCheckCircle,
      tone: "success",
    },
    {
      label: "Inactive Staff",
      value: summary.inactiveStaff,
      icon: FiPauseCircle,
      tone: "danger",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className="flex min-w-0 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:gap-4 sm:p-4"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14 ${
                stat.tone === "success"
                  ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                  : stat.tone === "danger"
                    ? "bg-[var(--color-error-soft)] text-[var(--color-error)]"
                    : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
              }`}
            >
              <Icon size={22} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--color-muted)] sm:text-sm">
                {stat.label}
              </p>
              <p className="mt-1 font-heading text-xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-2xl">
                {stat.value.toLocaleString()}
              </p>

              {stat.label === "Total Staff" && summary.growth !== undefined && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-1 text-[10px] font-bold text-[var(--color-success)] sm:text-xs">
                  <FiTrendingUp size={12} />+{summary.growth}%
                </span>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
