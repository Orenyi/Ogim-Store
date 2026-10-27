import { memo } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useCart } from "../../hooks/useCart";
import CartItem from "./CartItem";

interface CartItemListProps {
  compact?: boolean;
}

function CartItemList({ compact = false }: CartItemListProps) {
  const {
    items,
    isAllSelected,
    isAnySelected,
    selectAll,
    removeSelectedItems,
  } = useCart();

  if (items.length === 0) return null;

  const selectedCount = items.filter((item) => item.selected).length;

  return (
    <section aria-labelledby="cart-items-heading" className="min-w-0">
      <h2 id="cart-items-heading" className="sr-only">
        Items in your cart
      </h2>

      <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 px-1 pb-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[var(--color-ink)]">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={(event) => selectAll(event.currentTarget.checked)}
            aria-label="Select all cart items"
            className="size-[17px] cursor-pointer accent-[var(--color-accent)]"
          />
          <span>Select all items</span>
          <span className="text-xs font-normal text-[var(--color-muted)]">
            ({selectedCount} of {items.length})
          </span>
        </label>

        <button
          type="button"
          onClick={removeSelectedItems}
          disabled={!isAnySelected}
          className="inline-flex items-center gap-2 rounded-md py-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
        >
          <FiTrash2 size={15} aria-hidden="true" />
          Remove selected
        </button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} compact={compact} />
        ))}
      </div>
    </section>
  );
}

export default memo(CartItemList);
