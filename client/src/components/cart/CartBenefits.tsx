import { memo } from "react";
import { FiBriefcase, FiTruck, FiRefreshCw } from "react-icons/fi";

const benefits = [
  {
    title: "Secure Payments",
    description: "Your payments are safe with trusted providers.",
    Icon: FiBriefcase,
  },
  {
    title: "Nationwide Delivery",
    description: "Fast and reliable delivery across Nigeria.",
    Icon: FiTruck,
  },
  {
    title: "7-Day Return",
    description: "Change of mind? Return within 7 days.",
    Icon: FiRefreshCw,
  },
];

function CartBenefits() {
  return (
    <section
      aria-label="Shopping benefits"
      className="rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-4 sm:p-5"
    >
      <ul className="space-y-5">
        {benefits.map(({ title, description, Icon }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-ink)]">
              <Icon size={19} aria-hidden="true" />
            </span>

            <div className="min-w-0 pt-0.5">
              <h3 className="text-sm font-bold text-[var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default memo(CartBenefits);
