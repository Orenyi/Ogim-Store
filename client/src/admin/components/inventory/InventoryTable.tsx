import { FiMoreHorizontal, FiPackage } from "react-icons/fi";

import type { InventoryProduct } from "../../types/inventory.types";
import {
  formatNaira,
  getProductInventoryStatus,
} from "../../utils/inventory.utils";
import InventoryStatusBadge from "./InventoryStatusBadge";

type Props = {
  products: InventoryProduct[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onEditStock: (product: InventoryProduct) => void;
};

export default function InventoryTable({
  products,
  selectedIds,
  onToggle,
  onToggleAll,
  onEditStock,
}: Props) {
  const allSelected =
    products.length > 0 &&
    products.every((product) => selectedIds.includes(product.id));

  return (
    <div className="hidden overflow-visible rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)] md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-muted)]">
              <th className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="Select all products on this page"
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
              </th>
              <th className="px-3 py-4">Product</th>
              <th className="px-3 py-4">SKU</th>
              <th className="px-3 py-4">Category</th>
              <th className="px-3 py-4">Price</th>
              <th className="px-3 py-4">Stock</th>
              <th className="px-3 py-4">Status</th>
              <th className="px-3 py-4">Last Updated</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[var(--color-paper)]/70"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => onToggle(product.id)}
                    aria-label={`Select ${product.name}`}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                </td>

                <td className="px-3 py-3">
                  <div className="flex min-w-[200px] items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-surface-muted)]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <FiPackage
                          size={20}
                          className="text-[var(--color-muted)]"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[var(--color-ink)]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                        {product.storage} • {product.colour}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3 text-xs font-medium text-[var(--color-ink)]">
                  {product.sku}
                </td>

                <td className="px-3 py-3 text-xs text-[var(--color-ink)]">
                  {product.category}
                </td>

                <td className="px-3 py-3 text-xs font-bold text-[var(--color-ink)]">
                  {formatNaira(product.price)}
                </td>

                <td className="px-3 py-3 text-xs font-bold text-[var(--color-ink)]">
                  {product.stockQuantity}
                </td>

                <td className="px-3 py-3">
                  <InventoryStatusBadge
                    status={getProductInventoryStatus(product)}
                  />
                </td>

                <td className="px-3 py-3 text-xs text-[var(--color-muted)]">
                  {new Date(product.updatedAt).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEditStock(product)}
                    aria-label={`Update stock for ${product.name}`}
                    title="Update stock quantity"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                  >
                    <FiMoreHorizontal size={19} />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <FiPackage className="mx-auto text-2xl text-[var(--color-muted)]" />
                  <p className="mt-3 text-sm font-bold">No products found</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
