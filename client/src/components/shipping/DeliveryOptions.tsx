import { FiCheckCircle } from "react-icons/fi";

const deliveryOptions = [
  {
    name: "Standard Delivery",
    time: "2–4 business days",
    price: 5000,
    eligibility: "Available locations",
    description: "For regular deliveries.",
    featured: true,
  },
  {
    name: "Express Delivery",
    time: "1–2 business days",
    price: 10000,
    eligibility: "Select cities only",
    description: "For faster delivery where available.",
    featured: false,
  },
  {
    name: "Same Day Delivery",
    time: "Same day",
    price: 15000,
    eligibility: "Abuja only",
    description: "Subject to availability and order time.",
    featured: false,
  },
];

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function DeliveryOptions() {
  return (
    <section className="page-container py-5 sm:py-7">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
          Choose your delivery
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Delivery options
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
          Available methods, prices and estimated delivery times are shown
          below. Your eligible options should be confirmed at checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {deliveryOptions.map((option) => (
          <article
            key={option.name}
            className={`relative flex h-full flex-col rounded-[var(--radius-card)] border p-5 transition-colors ${
              option.featured
                ? "border-[var(--color-accent)] bg-[var(--color-white)]"
                : "border-[var(--color-border)] bg-[var(--color-white)] hover:border-[var(--color-border-strong)]"
            }`}
          >
            {option.featured && (
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--color-accent)]">
                <FiCheckCircle size={14} aria-hidden="true" />
                Popular choice
              </span>
            )}

            <h3 className="text-base font-extrabold text-[var(--color-ink)]">
              {option.name}
            </h3>

            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {option.time}
            </p>

            <p className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
              {formatNaira(option.price)}
            </p>

            <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
              {option.eligibility}
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
              {option.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
