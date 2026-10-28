import { FiMapPin, FiClock, FiPackage } from "react-icons/fi";

const highlights = [
  {
    title: "Nationwide delivery",
    description: "Delivery availability depends on your location.",
    icon: FiMapPin,
  },
  {
    title: "Clear delivery estimates",
    description: "Check the estimated timeframe for your order.",
    icon: FiClock,
  },
  {
    title: "Order tracking",
    description: "Follow your order when tracking is available.",
    icon: FiPackage,
  },
];

export default function DeliveryHighlights() {
  return (
    <section
      aria-label="Delivery benefits"
      className="page-container py-5 sm:py-7"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {highlights.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:flex-col sm:items-center sm:px-5 sm:py-6 sm:text-center"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Icon size={20} aria-hidden="true" />
            </span>

            <div>
              <h2 className="text-sm font-bold leading-5 text-[var(--color-ink)] sm:text-base">
                {title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)] sm:text-sm sm:leading-6">
                {description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
