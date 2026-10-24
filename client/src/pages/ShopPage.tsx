import { useCallback, useMemo, useState } from "react";

import { sampleProducts } from "../data/products";
import type { ProductBrand, ProductCondition } from "../types/product";

import ShopToolbar from "../components/shop/ShopToolbar";
import type {
  ActiveFilterChip,
  ShopSortOption,
} from "../components/shop/ShopToolbar";

import ShopSearchBar from "../components/shop/ShopSearchBar";
import ShopPageHeader from "../components/shop/ShopPageHeader";
import ShopFilters from "../components/shop/ShopFilters";
import type { ShopFilterState } from "../components/shop/ShopFilters";
import MobileFilterDrawer from "../components/shop/MobileFilterDrawer";
import ProductGrid from "../components/product/ProductGrid";

const initialFilters: ShopFilterState = {
  brands: [],
  conditions: [],
  storages: [],
  minPrice: "",
  maxPrice: "",
  availability: "all",
};

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ShopFilterState>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<ShopSortOption>("newest");

  // Search and filter the existing product catalogue.
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const minPrice = filters.minPrice.trim() ? Number(filters.minPrice) : null;

    const maxPrice = filters.maxPrice.trim() ? Number(filters.maxPrice) : null;

    return sampleProducts.filter((product) => {
      const searchableValues = [
        product.name,
        product.brand,
        product.storage,
        product.colour,
        product.condition,
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) => value.toLowerCase().includes(query));

      const matchesBrand =
        filters.brands.length === 0 || filters.brands.includes(product.brand);

      const matchesCondition =
        filters.conditions.length === 0 ||
        filters.conditions.includes(product.condition);

      const matchesStorage =
        filters.storages.length === 0 ||
        filters.storages.includes(product.storage);

      const matchesMinPrice = minPrice === null || product.price >= minPrice;

      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

      const matchesAvailability =
        filters.availability === "all" ||
        (filters.availability === "in-stock" && product.inStock) ||
        (filters.availability === "out-of-stock" && !product.inStock);

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCondition &&
        matchesStorage &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesAvailability
      );
    });
  }, [searchQuery, filters]);

  // Sorting is applied after filtering.
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return products.sort((a, b) => a.price - b.price);

      case "price-high":
        return products.sort((a, b) => b.price - a.price);

      case "name-asc":
        return products.sort((a, b) => a.name.localeCompare(b.name));

      case "newest":
      default:
        // Retains source order until products have creation timestamps.
        return products;
    }
  }, [filteredProducts, sortBy]);

  const clearFilters = useCallback(() => {
    setFilters({ ...initialFilters });
  }, []);

  const activeFilterCount =
    filters.brands.length +
    filters.conditions.length +
    filters.storages.length +
    Number(filters.minPrice !== "") +
    Number(filters.maxPrice !== "") +
    Number(filters.availability !== "all");

  const removeBrand = (brand: ProductBrand) => {
    setFilters((current) => ({
      ...current,
      brands: current.brands.filter((item) => item !== brand),
    }));
  };

  const removeCondition = (condition: ProductCondition) => {
    setFilters((current) => ({
      ...current,
      conditions: current.conditions.filter((item) => item !== condition),
    }));
  };

  const removeStorage = (storage: string) => {
    setFilters((current) => ({
      ...current,
      storages: current.storages.filter((item) => item !== storage),
    }));
  };

  const activeChips: ActiveFilterChip[] = [
    ...filters.brands.map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      onRemove: () => removeBrand(brand),
    })),

    ...filters.conditions.map((condition) => ({
      key: `condition-${condition}`,
      label:
        condition === "new"
          ? "Brand New"
          : condition === "uk-used"
            ? "UK-Used"
            : "Refurbished",
      onRemove: () => removeCondition(condition),
    })),

    ...filters.storages.map((storage) => ({
      key: `storage-${storage}`,
      label: storage,
      onRemove: () => removeStorage(storage),
    })),

    ...(filters.minPrice
      ? [
          {
            key: "min-price",
            label: `Min ₦${Number(filters.minPrice).toLocaleString("en-NG")}`,
            onRemove: () =>
              setFilters((current) => ({
                ...current,
                minPrice: "",
              })),
          },
        ]
      : []),

    ...(filters.maxPrice
      ? [
          {
            key: "max-price",
            label: `Max ₦${Number(filters.maxPrice).toLocaleString("en-NG")}`,
            onRemove: () =>
              setFilters((current) => ({
                ...current,
                maxPrice: "",
              })),
          },
        ]
      : []),

    ...(filters.availability !== "all"
      ? [
          {
            key: "availability",
            label:
              filters.availability === "in-stock" ? "In stock" : "Out of stock",
            onRemove: () =>
              setFilters((current) => ({
                ...current,
                availability: "all",
              })),
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-paper">
      {/* Mobile search appears before the Shop header */}
      <div className="page-container">
        <ShopSearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Keep the header count as the total catalogue count */}
      <ShopPageHeader productCount={sampleProducts.length} />

      <div className="page-container py-5 lg:py-6">
        <div className="flex items-start gap-5 xl:gap-6">
          {/* Desktop filter sidebar */}
          <aside className="hidden w-[220px] shrink-0 self-start overflow-hidden rounded-xl border border-stone bg-white lg:block xl:w-[240px]">
            <ShopFilters
              products={sampleProducts}
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
            />
          </aside>

          {/* Product results */}
          <section aria-label="Shop products" className="min-w-0 flex-1">
            <ShopToolbar
              resultCount={sortedProducts.length}
              totalCount={sampleProducts.length}
              activeFilterCount={activeFilterCount}
              activeChips={activeChips}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onOpenFilters={() => setMobileFiltersOpen(true)}
              onClearAll={clearFilters}
            />

            <ProductGrid
              products={sortedProducts}
              columns={4}
              emptyMessage="No phones match your search or filters. Try adjusting your selections."
            />
          </section>
        </div>
      </div>

      {/* Bottom-sheet filters for mobile and tablet */}
      <MobileFilterDrawer
        open={mobileFiltersOpen}
        products={sampleProducts}
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        onClose={() => setMobileFiltersOpen(false)}
        onApply={() => setMobileFiltersOpen(false)}
        resultCount={sortedProducts.length}
      />
    </main>
  );
}
