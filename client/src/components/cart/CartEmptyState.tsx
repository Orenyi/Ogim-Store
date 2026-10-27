import { Link } from "react-router-dom";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";

interface CartEmptyStateProps {
  title?: string;
  description?: string;
}

export default function CartEmptyState({
  title = "Your cart is empty",
  description = "You haven't added any phones to your cart yet. Explore our collection and find your next phone.",
}: CartEmptyStateProps) {
  return (
    <section
      aria-labelledby="cart-empty-heading"
      className="flex min-h-[360px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-12 text-center sm:min-h-[420px] sm:px-8"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <FiShoppingBag size={28} aria-hidden="true" />
      </div>

      <h1
        id="cart-empty-heading"
        className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        {title}
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)] sm:text-base">
        {description}
      </p>

      <Link
        to="/shop"
        className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Explore Phones
        <FiArrowRight size={17} aria-hidden="true" />
      </Link>

      <p className="mt-4 text-xs text-[var(--color-muted)]">
        Brand-new, UK-used and refurbished phones.
      </p>
    </section>
  );
}
