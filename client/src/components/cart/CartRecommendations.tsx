import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { sampleProducts } from "../../data/products";
import { useCart } from "../../hooks/useCart";
// import { useToast } from "../ui/ToastProvider";
import type { Product } from "../../types/product";
import ProductCard from "../product/ProductCard";

interface CartRecommendationsProps {
  limit?: number;
}

function CartRecommendations({ limit = 4 }: CartRecommendationsProps) {
  const { items, addToCart } = useCart();
  //   const toast = useToast();

  const recommendations = useMemo(() => {
    const cartProductIds = new Set(items.map((item) => item.product.id));

    return sampleProducts
      .filter((product) => product.inStock && !cartProductIds.has(product.id))
      .slice(0, Math.max(0, limit));
  }, [items, limit]);

  function handleAddToCart(product: Product) {
    addToCart(product);
  }

  if (recommendations.length === 0) return null;

  return (
    <section
      aria-labelledby="cart-recommendations-heading"
      className="mt-10 sm:mt-12"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2
            id="cart-recommendations-heading"
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            You may also like
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Discover more phones from Ogim Store.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
        >
          View all <FiArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {recommendations.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(CartRecommendations);
