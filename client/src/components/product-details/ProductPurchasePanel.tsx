import { useState } from "react";
import { FiMinus, FiPlus, FiShoppingCart } from "react-icons/fi";

import type { Product } from "../../types/product";

interface ProductPurchasePanelProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
}

export default function ProductPurchasePanel({
  product,
  onAddToCart,
  onBuyNow,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = Math.max(0, product.stockQuantity ?? 99);
  const canPurchase = product.inStock && maxQuantity > 0;

  function changeQuantity(amount: number) {
    setQuantity((current) =>
      Math.min(Math.max(1, current + amount), Math.max(1, maxQuantity)),
    );
  }

  return (
    <section aria-label="Purchase options" className="mt-6">
      <div className="flex flex-col items-stretch gap-3">
        {/* Quantity selector: its own row */}
        <div
          aria-label="Quantity selector"
          className="inline-flex h-11 w-fit items-center self-start overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-stone)] sm:h-12"
        >
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            disabled={!canPurchase || quantity <= 1}
            aria-label="Decrease quantity"
            className="flex size-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40 sm:size-11"
          >
            <FiMinus size={14} />
          </button>

          <span
            aria-live="polite"
            className="min-w-9 text-center text-sm font-medium"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => changeQuantity(1)}
            disabled={!canPurchase || quantity >= maxQuantity}
            aria-label="Increase quantity"
            className="flex size-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40 sm:size-11"
          >
            <FiPlus size={14} />
          </button>
        </div>

        {/* Add to Cart: full width on every device */}
        <button
          type="button"
          disabled={!canPurchase}
          onClick={() => onAddToCart?.(product, quantity)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-stone)] bg-white px-4 text-sm font-semibold transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
        >
          <FiShoppingCart size={17} />
          Add to Cart
        </button>

        {/* Buy Now: full width on every device */}
        <button
          type="button"
          disabled={!canPurchase}
          onClick={() => onBuyNow?.(product, quantity)}
          className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
        >
          Buy Now
        </button>
      </div>
    </section>
  );
}
