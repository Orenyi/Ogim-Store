import { FiCheckCircle, FiPackage, FiTruck } from "react-icons/fi";

const steps = [
  {
    number: "01",
    title: "Order confirmed",
    description: "We prepare your order for dispatch.",
    icon: FiCheckCircle,
  },
  {
    number: "02",
    title: "Order dispatched",
    description: "Your order is handed over for delivery.",
    icon: FiPackage,
  },
  {
    number: "03",
    title: "Delivered to you",
    description: "Receive your order at the delivery address.",
    icon: FiTruck,
  },
];

export default function DeliveryProcess() {
  return (
    <section className="page-container py-5 sm:py-8">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          From checkout to doorstep
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          How delivery works
        </h2>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map(({ number, title, description, icon: Icon }) => (
          <li
            key={number}
            className="flex items-start gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:flex-col sm:p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <Icon size={20} aria-hidden="true" />
            </span>

            <div>
              <p className="text-xs font-bold tracking-wider text-[var(--color-accent)]">
                STEP {number}
              </p>
              <h3 className="mt-1 text-base font-extrabold text-[var(--color-ink)]">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] px-4 py-3 text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
        Delivery times are estimates and may vary depending on your location,
        product availability, dispatch time and delivery conditions.
      </p>
    </section>
  );
}
