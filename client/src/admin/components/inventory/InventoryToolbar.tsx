import { FiDownload, FiFilter, FiPlus, FiSearch } from "react-icons/fi";

import type {
  InventoryCategory,
  InventoryStatus,
  ProductBrand,
} from "../../types/inventory.types";

type Props = {
  search: string;
  category: InventoryCategory;
  status: InventoryStatus | "all";
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: InventoryCategory) => void;
  onStatusChange: (value: InventoryStatus | "all") => void;
  onAddProduct: () => void;
  onExport: () => void;
};

const brands: ProductBrand[] = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Tecno",
  "Infinix",
  "Other",
];

export default function InventoryToolbar({
  search,
  category,
  status,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onAddProduct,
  onExport,
}: Props) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)] sm:p-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_170px_auto_auto]">
        <label className="relative min-w-0">
          <FiSearch
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products, SKU or brand..."
            aria-label="Search inventory"
            className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white pl-10 pr-3 text-xs outline-none transition focus:border-[var(--color-accent)]"
          />
        </label>

        <select
          aria-label="Filter by category"
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as InventoryCategory)
          }
          className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-xs outline-none focus:border-[var(--color-accent)]"
        >
          <option value="all">Category: All</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by stock status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as InventoryStatus | "all")
          }
          className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-xs outline-none focus:border-[var(--color-accent)]"
        >
          <option value="all">Stock Status: All</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-accent)] px-4 text-xs font-bold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)]"
        >
          <FiDownload size={16} />
          Export
        </button>

        <button
          type="button"
          onClick={onAddProduct}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-xs font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <FiPlus size={17} />
          Add Product
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-muted)] sm:hidden">
        <FiFilter size={13} />
        Search and filter your product catalogue
      </div>
    </section>
  );
}
