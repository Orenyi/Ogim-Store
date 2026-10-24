import { FiChevronDown, FiSliders, FiX } from "react-icons/fi";

export type ShopSortOption = "newest" | "price-low" | "price-high" | "name-asc";

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ShopToolbarProps {
  resultCount: number;
  totalCount: number;
  activeFilterCount: number;
  activeChips: ActiveFilterChip[];
  sortBy: ShopSortOption;
  onSortChange: (sort: ShopSortOption) => void;
  onOpenFilters: () => void;
  onClearAll: () => void;
}

export default function ShopToolbar({
  resultCount,
  totalCount,
  activeFilterCount,
  activeChips,
  sortBy,
  onSortChange,
  onOpenFilters,
  onClearAll,
}: ShopToolbarProps) {
  return (
    <div className="mb-4 space-y-3">
      {/* Mobile/tablet controls */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-control border border-stone bg-white px-3 text-xs font-semibold text-ink transition-colors hover:border-accent sm:flex-none sm:min-w-[125px]"
        >
          <FiSliders aria-hidden="true" size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <label className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-control border border-stone bg-white px-3 sm:flex-none sm:min-w-[155px]">
          <span className="shrink-0 font-body text-xs text-muted">Sort:</span>
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as ShopSortOption)
            }
            aria-label="Sort products"
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-2 font-body text-xs text-ink outline-none focus:ring-0"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A–Z</option>
          </select>
          <FiChevronDown
            aria-hidden="true"
            size={14}
            className="shrink-0 text-muted"
          />
        </label>
      </div>

      {/* Active filters and desktop sort */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={`Remove ${chip.label} filter`}
              className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#F7D4C4] bg-[#FFF0E8] px-2.5 py-1 font-body text-[11px] font-medium text-[#B84218] transition-colors hover:border-accent hover:bg-[#FFE5D7]"
            >
              <span>{chip.label}</span>
              <FiX aria-hidden="true" size={12} />
            </button>
          ))}

          {activeChips.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-1 py-1 font-body text-[11px] font-medium text-accent transition-colors hover:text-[var(--color-accent-hover)] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Desktop sort */}
        <label className="hidden min-h-8 shrink-0 items-center gap-2 lg:flex">
          <span className="font-body text-[11px] text-muted">Sort by</span>
          <span className="relative flex min-w-[108px] items-center rounded-control border border-stone bg-white">
            <select
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as ShopSortOption)
              }
              aria-label="Sort products"
              className="w-full appearance-none border-0 bg-transparent py-1.5 pl-3 pr-8 font-body text-xs text-ink outline-none focus:ring-0"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
            <FiChevronDown
              aria-hidden="true"
              size={13}
              className="pointer-events-none absolute right-2.5 text-muted"
            />
          </span>
        </label>
      </div>

      {/* Live result count */}
      <p aria-live="polite" aria-atomic="true" className="text-xs text-muted">
        Showing {resultCount.toLocaleString("en-NG")} of{" "}
        {totalCount.toLocaleString("en-NG")} products
      </p>
    </div>
  );
}
