import { FiStar } from "react-icons/fi";

import type { Product } from "../../types/product";
import PriceDisplay from "../product/PriceDisplay";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const hasRating =
    typeof product.rating === "number" &&
    typeof product.reviewCount === "number";

  return (
    <section aria-labelledby="product-title" className="min-w-0">
      <p className="text-sm font-semibold text-[var(--color-muted)]">
        {product.brand}
      </p>

      <h1 id="product-title" className="mt-1 text-2xl sm:text-3xl lg:text-4xl">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-muted)]">
        {hasRating ? (
          <>
            <span
              aria-label={`Rated ${product.rating} out of 5`}
              className="flex items-center gap-0.5 text-amber-500"
            >
              {Array.from({ length: 5 }, (_, index) => (
                <FiStar
                  key={index}
                  size={14}
                  aria-hidden="true"
                  className={
                    index < Math.round(product.rating!) ? "fill-current" : ""
                  }
                />
              ))}
            </span>

            <span className="font-medium text-[var(--color-ink)]">
              {product.rating!.toFixed(1)}
            </span>

            <span>({product.reviewCount} reviews)</span>
          </>
        ) : (
          <span>Customer reviews coming soon</span>
        )}
      </div>

      <div className="mt-5">
        <PriceDisplay
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="lg"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span
          aria-hidden="true"
          className={`size-2.5 shrink-0 rounded-full ${
            product.inStock
              ? "bg-[var(--color-success)]"
              : "bg-[var(--color-error)]"
          }`}
        />

        <span
          role="status"
          className={`font-medium ${
            product.inStock
              ? "text-[var(--color-success)]"
              : "text-[var(--color-error)]"
          }`}
        >
          {product.inStock ? "In stock" : "Currently unavailable"}
        </span>

        {product.inStock && typeof product.stockQuantity === "number" && (
          <span className="text-xs text-[var(--color-muted)]">
            ({product.stockQuantity} available)
          </span>
        )}
      </div>
    </section>
  );
}
