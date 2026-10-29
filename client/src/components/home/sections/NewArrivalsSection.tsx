import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import { getProducts } from "../../../services/product.service";
import type { Product } from "../../../types/product";
import ProductGrid from "../../product/ProductGrid";

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNewArrivals() {
      try {
        const result = await getProducts({ page: 1, limit: 100 });

        if (isMounted) {
          setProducts(
            result.products.filter((product) => product.isNewArrival),
          );
        }
      } catch (error) {
        console.error("Failed to load new arrivals:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadNewArrivals();

    return () => {
      isMounted = false;
    };
  }, []);

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
          products={products}
          isLoading={isLoading}
          columns={4}
          emptyMessage="New arrivals will be available here soon."
        />
      </div>
    </section>
  );
}
