import { useMemo, useState, type ReactNode } from "react";
import { FiChevronDown, FiChevronUp, FiSearch, FiX } from "react-icons/fi";

import type {
  Product,
  ProductBrand,
  ProductCondition,
} from "../../types/product";

export interface ShopFilterState {
  brands: ProductBrand[];
  conditions: ProductCondition[];
  storages: string[];
  minPrice: string;
  maxPrice: string;
  availability: "all" | "in-stock" | "out-of-stock";
}

interface ShopFiltersProps {
  products: Product[];
  filters: ShopFilterState;
  onChange: (filters: ShopFilterState) => void;
  onClear: () => void;
  onApply?: () => void;
}

const brandOptions: ProductBrand[] = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Tecno",
  "Infinix",
  "Other",
];

const conditionOptions: { label: string; value: ProductCondition }[] = [
  { label: "Brand New", value: "new" },
  { label: "UK-Used", value: "uk-used" },
  { label: "Refurbished", value: "refurbished" },
];

const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];

const formatPrice = (price: number) => `₦${price.toLocaleString("en-NG")}`;

export default function ShopFilters({
  products,
  filters,
  onChange,
  onClear,
  onApply,
}: ShopFiltersProps) {
  const [brandSearch, setBrandSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const brandCounts = useMemo(
    () =>
      products.reduce<Record<string, number>>((counts, product) => {
        counts[product.brand] = (counts[product.brand] ?? 0) + 1;
        return counts;
      }, {}),
    [products],
  );

  const conditionCounts = useMemo(
    () =>
      products.reduce<Record<string, number>>((counts, product) => {
        counts[product.condition] = (counts[product.condition] ?? 0) + 1;
        return counts;
      }, {}),
    [products],
  );

  const storageCounts = useMemo(
    () =>
      products.reduce<Record<string, number>>((counts, product) => {
        counts[product.storage] = (counts[product.storage] ?? 0) + 1;
        return counts;
      }, {}),
    [products],
  );

  const availabilityCounts = useMemo(
    () => ({
      inStock: products.filter((product) => product.inStock).length,
      outOfStock: products.filter((product) => !product.inStock).length,
    }),
    [products],
  );

  const visibleBrands = brandOptions.filter((brand) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  function toggleValue<T extends string>(
    key: "brands" | "conditions" | "storages",
    value: T,
  ) {
    const current = filters[key] as T[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    onChange({ ...filters, [key]: next });
  }

  function toggleSection(section: string) {
    setCollapsed((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  }
  function renderSection(key: string, title: string, children: ReactNode) {
    const isCollapsed = collapsed[key];

    return (
      <section className="border-b border-stone/80 py-4 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection(key)}
          aria-expanded={!isCollapsed}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="font-heading text-sm font-bold text-ink">
            {title}
          </span>
          {isCollapsed ? (
            <FiChevronDown aria-hidden="true" size={16} />
          ) : (
            <FiChevronUp aria-hidden="true" size={16} />
          )}
        </button>

        {!isCollapsed && <div className="mt-3">{children}</div>}
      </section>
    );
  }

  function renderCheckbox(
    label: string,
    checked: boolean,
    count: number,
    onToggle: () => void,
  ) {
    return (
      <label
        key={label}
        className="flex min-h-7 cursor-pointer items-center gap-2 text-xs text-ink"
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-3.5 w-3.5 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="min-w-0 flex-1">{label}</span>
        <span className="text-muted">({count})</span>
      </label>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-stone px-4 py-4">
        <h2 className="font-heading text-base font-bold text-ink">Filters</h2>
        <button
          type="button"
          onClick={() => {
            setBrandSearch("");
            onClear();
          }}
          className="text-xs font-medium text-accent hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        {renderSection(
          "brand",
          "Brand",
          <>
            <div className="mb-3 flex h-9 items-center gap-2 rounded-lg border border-stone px-2.5 focus-within:border-accent">
              <FiSearch aria-hidden="true" size={14} className="text-muted" />
              <input
                value={brandSearch}
                onChange={(event) => setBrandSearch(event.target.value)}
                placeholder="Search brands..."
                aria-label="Search brands"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs outline-none focus:ring-0"
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch("")}
                  aria-label="Clear brand search"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {visibleBrands.map((brand) =>
                renderCheckbox(
                  brand === "Other" ? "Others" : brand,
                  filters.brands.includes(brand),
                  brandCounts[brand] ?? 0,
                  () => toggleValue("brands", brand),
                ),
              )}
            </div>
          </>,
        )}

        {renderSection(
          "price",
          "Price (₦)",
          <div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex min-w-0 items-center rounded-lg border border-stone px-2.5">
                <span className="sr-only">Minimum price</span>
                <input
                  type="number"
                  min={0}
                  value={filters.minPrice}
                  onChange={(event) =>
                    onChange({ ...filters, minPrice: event.target.value })
                  }
                  placeholder="Min"
                  className="w-full min-w-0 border-0 bg-transparent px-0 py-2 text-xs outline-none focus:ring-0"
                />
              </label>

              <label className="flex min-w-0 items-center rounded-lg border border-stone px-2.5">
                <span className="sr-only">Maximum price</span>
                <input
                  type="number"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(event) =>
                    onChange({ ...filters, maxPrice: event.target.value })
                  }
                  placeholder="Max"
                  className="w-full min-w-0 border-0 bg-transparent px-0 py-2 text-xs outline-none focus:ring-0"
                />
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted">
              <span>
                {formatPrice(Math.min(...products.map((p) => p.price), 0) || 0)}
              </span>
              <span>
                {formatPrice(
                  products.length
                    ? Math.max(...products.map((p) => p.price))
                    : 0,
                )}
              </span>
            </div>
          </div>,
        )}

        {renderSection(
          "condition",
          "Condition",
          <div className="space-y-1.5">
            {conditionOptions.map((option) =>
              renderCheckbox(
                option.label,
                filters.conditions.includes(option.value),
                conditionCounts[option.value] ?? 0,
                () => toggleValue("conditions", option.value),
              ),
            )}
          </div>,
        )}

        {renderSection(
          "storage",
          "Storage",
          <div className="space-y-1.5">
            {storageOptions.map((storage) =>
              renderCheckbox(
                storage,
                filters.storages.includes(storage),
                storageCounts[storage] ?? 0,
                () => toggleValue("storages", storage),
              ),
            )}
          </div>,
        )}

        {renderSection(
          "availability",
          "Availability",
          <div className="space-y-1.5">
            {renderCheckbox(
              "In stock",
              filters.availability === "in-stock",
              availabilityCounts.inStock,
              () =>
                onChange({
                  ...filters,
                  availability:
                    filters.availability === "in-stock" ? "all" : "in-stock",
                }),
            )}
            {renderCheckbox(
              "Out of stock",
              filters.availability === "out-of-stock",
              availabilityCounts.outOfStock,
              () =>
                onChange({
                  ...filters,
                  availability:
                    filters.availability === "out-of-stock"
                      ? "all"
                      : "out-of-stock",
                }),
            )}
          </div>,
        )}
      </div>

      {onApply && (
        <div className="border-t border-stone p-4">
          <button
            type="button"
            onClick={onApply}
            className="min-h-11 w-full rounded-control bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Show products
          </button>
        </div>
      )}
    </div>
  );
}
