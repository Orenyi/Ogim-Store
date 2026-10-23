import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import { newArrivals } from "../../../data/products";
import ProductGrid from "../../product/ProductGrid";

export default function NewArrivalsSection() {
  return (
    <section
      aria-labelledby="new-arrivals-heading"
      className="py-10 sm:py-12 lg:py-16"
    >
      <div className="page-container">
        <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
          <h2
            id="new-arrivals-heading"
            className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl lg:text-3xl"
          >
            New Arrivals
          </h2>

          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
          >
            View all
            <FiArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <ProductGrid
          products={newArrivals}
          columns={4}
          emptyMessage="New arrivals will be available here soon."
        />
      </div>
    </section>
  );
}
