import { FiMoreHorizontal, FiPackage } from "react-icons/fi";

import type { InventoryProduct } from "../../types/inventory.types";
import {
  formatNaira,
  getProductInventoryStatus,
} from "../../utils/inventory.utils";
import InventoryStatusBadge from "./InventoryStatusBadge";

export default function InventoryMobileList({
  products,
  onEditStock,
}: {
  products: InventoryProduct[];
  onEditStock: (product: InventoryProduct) => void;
}) {
  return (
    <div className="grid gap-3 md:hidden">
      {products.map((product) => (
        <article
          key={product.id}
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-surface-muted)]">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <FiPackage size={23} className="text-[var(--color-muted)]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-[var(--color-ink)]">
                {product.name}
              </h3>

              <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                {product.storage} • {product.colour}
              </p>

              <p className="mt-2 text-xs font-extrabold text-[var(--color-ink)]">
                {formatNaira(product.price)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onEditStock(product)}
              aria-label={`Update stock for ${product.name}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
            >
              <FiMoreHorizontal size={19} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
            <InventoryStatusBadge status={getProductInventoryStatus(product)} />

            <span className="text-xs font-semibold text-[var(--color-ink)]">
              {product.stockQuantity} units
            </span>
          </div>
        </article>
      ))}

      {products.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-4 py-12 text-center">
          <FiPackage className="mx-auto text-2xl text-[var(--color-muted)]" />
          <p className="mt-3 text-sm font-bold">No products found</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Try another search or filter.
          </p>
        </div>
      )}
    </div>
  );
}
