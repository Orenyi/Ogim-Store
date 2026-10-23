import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import { featuredProducts } from "../../../data/products";
import type { ProductBrand } from "../../../types/product";
import ProductGrid from "../../product/ProductGrid";

const brandFilters: Array<{
  label: string;
  value: ProductBrand | "All";
}> = [
  { label: "All", value: "All" },
  { label: "iPhone", value: "Apple" },
  { label: "Samsung", value: "Samsung" },
  { label: "Google", value: "Google" },
  { label: "Xiaomi", value: "Xiaomi" },
  { label: "Tecno", value: "Tecno" },
  { label: "Infinix", value: "Infinix" },
];

export default function FeaturedProductsSection() {
  const [activeBrand, setActiveBrand] = useState<ProductBrand | "All">("All");

  const filteredProducts = useMemo(() => {
    if (activeBrand === "All") {
      return featuredProducts;
    }

    return featuredProducts.filter((product) => product.brand === activeBrand);
  }, [activeBrand]);

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="py-10 sm:py-12 lg:py-16"
    >
      <div className="page-container">
        {/* Section heading */}
        <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
          <h2
            id="featured-products-heading"
            className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl lg:text-3xl"
          >
            Featured Phones
          </h2>

          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
          >
            View all
            <FiArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* Brand filters */}
        <div
          aria-label="Filter featured phones by brand"
          className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:mb-7"
        >
          {brandFilters.map((filter) => {
            const isActive = activeBrand === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveBrand(filter.value)}
                className={[
                  "inline-flex min-h-9 shrink-0 items-center justify-center",
                  "rounded-full border px-4 py-2",
                  "font-body text-xs font-semibold transition-colors duration-200 sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  isActive
                    ? "border-accent bg-accent text-white bg-[var(--color-accent)]"
                    : "border-transparent bg-white/70 text-muted hover:border-stone hover:bg-white hover:text-ink",
                ].join(" ")}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Existing product cards and responsive grid */}
        <ProductGrid
          products={filteredProducts}
          columns={4}
          emptyMessage="No featured phones from this brand yet."
        />
      </div>
    </section>
  );
}
