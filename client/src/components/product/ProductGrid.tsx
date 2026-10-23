import type { Product } from "../../types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  onToggleWishlist?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  wishlistedIds?: string[];
  emptyMessage?: string;
  className?: string;
}

export default function ProductGrid({
  products,
  isLoading = false,
  columns = 4,
  onToggleWishlist,
  onAddToCart,
  wishlistedIds = [],
  emptyMessage = "No phones found. Try adjusting your filters.",
  className = "",
}: ProductGridProps) {
  const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (isLoading) {
    return (
      <div
        aria-label="Loading products"
        aria-busy="true"
        className={`grid ${columnClasses[columns]} gap-3 sm:gap-4 ${className}`}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-stone)] bg-white"
          >
            <div className="aspect-[4/4.5] animate-pulse bg-[var(--color-stone)]/60" />
            <div className="space-y-3 p-3">
              <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-stone)]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-stone)]" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--color-stone)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-stone)] px-5 py-12 text-center">
        <p className="text-sm text-[var(--color-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid ${columnClasses[columns]} gap-3 sm:gap-4 ${className}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistedIds.includes(product.id)}
          onToggleWishlist={onToggleWishlist}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
