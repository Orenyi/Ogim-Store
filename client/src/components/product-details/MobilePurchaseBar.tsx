import { FiShoppingCart } from "react-icons/fi";

import type { Product } from "../../types/product";
import PriceDisplay from "../product/PriceDisplay";

interface MobilePurchaseBarProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  quantity?: number;
}

export default function MobilePurchaseBar({
  product,
  onAddToCart,
  quantity = 1,
}: MobilePurchaseBarProps) {
  const canPurchase = product.inStock && quantity > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[var(--color-stone)] bg-white/95 shadow-[0_-4px_20px_rgba(21,23,28,0.08)] backdrop-blur-md md:hidden">
      <div
        className="mx-auto flex w-full max-w-[var(--container-max)] items-center gap-3 px-4 py-3"
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="min-w-0 flex-1">
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="md"
          />

          <p
            className={`mt-1 flex items-center gap-1.5 text-xs ${
              product.inStock
                ? "text-[var(--color-success)]"
                : "text-[var(--color-error)]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${
                product.inStock
                  ? "bg-[var(--color-success)]"
                  : "bg-[var(--color-error)]"
              }`}
            />

            {product.inStock ? "In stock" : "Out of stock"}
          </p>
        </div>

        <button
          type="button"
          disabled={!canPurchase}
          onClick={() => onAddToCart?.(product, quantity)}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiShoppingCart size={17} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
