import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";

import type { Product } from "../../types/product";
import PriceDisplay from "./PriceDisplay";
import ConditionBadge from "./ConditionBadge";

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  className = "",
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const hasRating =
    typeof product.rating === "number" &&
    typeof product.reviewCount === "number";

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-stone)]/70 bg-white transition-shadow duration-200 hover:shadow-[var(--shadow-card,0_6px_20px_rgba(21,23,28,0.07))] ${className}`}
    >
      <div className="relative">
        <Link
          to={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="relative flex aspect-[4/4.5] items-center justify-center overflow-hidden bg-white p-3 sm:p-4"
        >
          <div className="absolute left-3 top-3 z-10">
            <ConditionBadge condition={product.condition} />
          </div>

          {imageFailed ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-[var(--color-paper)] px-3 text-center">
              <span className="text-2xl text-[var(--color-muted)]">📱</span>
              <span className="text-xs text-[var(--color-muted)]">
                Product image unavailable
              </span>
            </div>
          ) : (
            <img
              src={product.image}
              alt={`${product.name} in ${product.colour}`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => onToggleWishlist?.(product)}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white/95 text-[var(--color-ink)] shadow-sm transition-colors hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <FiHeart
            size={16}
            className={
              isWishlisted ? "fill-current text-[var(--color-accent)]" : ""
            }
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-1 sm:px-3.5">
        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-1 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)] sm:text-sm"
        >
          {product.name}
        </Link>

        <p className="mt-1 line-clamp-1 text-[10px] text-[var(--color-muted)] sm:text-[11px]">
          {product.storage} | {product.colour}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
            className="min-w-0"
          />

          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => onAddToCart?.(product)}
            aria-label={
              product.inStock
                ? `Add ${product.name} to cart`
                : `${product.name} is out of stock`
            }
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] text-white transition-colors hover:bg-[#D9531D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--color-stone)] disabled:text-[var(--color-muted)]"
          >
            <FiShoppingCart size={15} />
          </button>
        </div>

        <div className="mt-2 flex min-h-4 items-center gap-1 text-[10px] text-[var(--color-muted)] sm:text-[11px]">
          {hasRating ? (
            <>
              <FiStar
                size={12}
                aria-hidden="true"
                className="fill-amber-500 text-amber-500"
              />
              <span className="font-medium text-[var(--color-ink)]">
                {product.rating!.toFixed(1)}
              </span>
              <span>({product.reviewCount})</span>
            </>
          ) : (
            <span>{product.inStock ? "Available" : "Out of stock"}</span>
          )}
        </div>
      </div>
    </article>
  );
}
