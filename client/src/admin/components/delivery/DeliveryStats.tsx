import { FiMapPin, FiLayers, FiPauseCircle, FiBox } from "react-icons/fi";
import type { DeliverySummary } from "../../types/delivery.types";
import { formatDeliveryCurrency } from "../../utils/delivery.utils";

type Props = {
  summary: DeliverySummary;
};

export default function DeliveryStats({ summary }: Props) {
  const stats = [
    {
      label: "Total Locations",
      value: summary.totalLocations.toLocaleString(),
      icon: FiMapPin,
      tone: "accent",
    },
    {
      label: "Active Fees",
      value: summary.activeFees.toLocaleString(),
      icon: FiLayers,
      tone: "success",
    },
    {
      label: "Inactive Fees",
      value: summary.inactiveFees.toLocaleString(),
      icon: FiPauseCircle,
      tone: "warning",
    },
    {
      label: "Default Fee",
      value: formatDeliveryCurrency(summary.defaultFee),
      icon: FiBox,
      tone: "accent",
    },
  ];

  return (
    <section
      aria-label="Delivery fee summary"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className="flex min-w-0 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:gap-4 sm:p-4"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                stat.tone === "success"
                  ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                  : stat.tone === "warning"
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
              }`}
            >
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
          </article>
        );
      })}
    </section>
  );
}
