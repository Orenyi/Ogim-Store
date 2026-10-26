import { Link } from "react-router-dom";

import type { Product } from "../../types/product";
import ProductCard from "../product/ProductCard";

interface RelatedProductsProps {
  product: Product;
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistedProductIds?: string[];
  limit?: number;
}

export default function RelatedProducts({
  product,
  products,
  onAddToCart,
  onToggleWishlist,
  wishlistedProductIds = [],
  limit = 4,
}: RelatedProductsProps) {
  const relatedProducts = products
    .filter((item) => item.brand === product.brand && item.id !== product.id)
    .slice(0, limit);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-products-title" className="min-w-0">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id="related-products-title" className="text-xl sm:text-2xl">
            More from {product.brand}
          </h2>

          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Explore other {product.brand} phones.
          </p>
        </div>

        <Link
          to={`/shop?brand=${encodeURIComponent(product.brand)}`}
          className="shrink-0 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard
            key={relatedProduct.id}
            product={relatedProduct}
            isWishlisted={wishlistedProductIds.includes(relatedProduct.id)}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </section>
  );
}
