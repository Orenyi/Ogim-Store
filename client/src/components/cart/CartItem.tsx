import { memo } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import type { CartItem as CartItemType } from "../../types/cart";
import { useCart } from "../../hooks/useCart";
import { formatNaira, getMaxQuantity } from "../../utils/cartUtils";

interface CartItemProps {
  item: CartItemType;
  compact?: boolean;
}

const conditionLabels = {
  new: "Brand New",
  "uk-used": "UK-Used",
  refurbished: "Refurbished",
} as const;

const conditionStyles = {
  new: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  "uk-used": "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  refurbished: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
} as const;

function CartItem({ item, compact = false }: CartItemProps) {
  const {
    toggleItemSelection,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const { product, quantity, selected } = item;
  const maxQuantity = getMaxQuantity(product);
  const lineTotal = product.price * quantity;

  return (
    <article
      className={`grid min-w-0 grid-cols-[20px_minmax(0,1fr)_36px] items-center gap-3 ${
        compact ? "p-3 sm:p-4" : "p-4 sm:gap-4 sm:px-5 sm:py-5"
      }`}
      aria-label={product.name}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => toggleItemSelection(product.id)}
        aria-label={`Select ${product.name}`}
        className="size-[18px] cursor-pointer accent-[var(--color-accent)]"
      />

      <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-5">
        <a
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className={`flex items-center justify-center overflow-hidden rounded-[var(--radius-control)] bg-white ${
            compact ? "h-20 w-16" : "h-20 w-16 sm:h-24 sm:w-[84px]"
          }`}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-1.5"
          />
        </a>

        <div className="flex min-w-0 flex-col justify-center gap-2">
          <div className="min-w-0">
            <span
              className={`inline-flex max-w-full rounded-md px-2 py-0.5 text-[10px] font-semibold leading-4 ${
                conditionStyles[product.condition]
              }`}
            >
              {conditionLabels[product.condition]}
            </span>

            <a
              href={`/products/${product.slug}`}
              className="mt-1 block truncate text-sm font-semibold text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)] sm:text-base"
            >
              {product.name}
            </a>

            <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
              {product.storage} <span aria-hidden="true">|</span>{" "}
              {product.colour}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p className="text-sm font-bold text-[var(--color-ink)] sm:text-base">
              {formatNaira(product.price)}
            </p>

            <div
              className="inline-flex h-9 items-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white"
              aria-label={`Quantity for ${product.name}`}
            >
              <button
                type="button"
                onClick={() => decreaseQuantity(product.id)}
                disabled={quantity <= 1}
                aria-label={`Decrease ${product.name} quantity`}
                className="flex size-9 items-center justify-center text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiMinus size={14} aria-hidden="true" />
              </button>

              <output
                aria-live="polite"
                aria-label="Quantity"
                className="min-w-8 text-center text-sm font-medium tabular-nums"
              >
                {quantity}
              </output>

              <button
                type="button"
                onClick={() => increaseQuantity(product.id)}
                disabled={quantity >= maxQuantity}
                aria-label={`Increase ${product.name} quantity`}
                className="flex size-9 items-center justify-center text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiPlus size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          {quantity > 1 && (
            <p className="text-xs text-[var(--color-muted)]">
              Line total:{" "}
              <span className="font-semibold text-[var(--color-ink)]">
                {formatNaira(lineTotal)}
              </span>
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeFromCart(product.id)}
        aria-label={`Remove ${product.name} from cart`}
        title="Remove item"
        className="flex size-9 items-center justify-center self-center rounded-[var(--radius-control)] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)] focus-visible:outline-offset-2"
      >
        <FiTrash2 size={17} aria-hidden="true" />
      </button>
    </article>
  );
}

export default memo(CartItem);
