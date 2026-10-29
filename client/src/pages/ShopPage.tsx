import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getProducts } from "../services/product.service";
import type { Product, ProductBrand, ProductCondition } from "../types/product";

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

const validBrands: ProductBrand[] = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Tecno",
  "Infinix",
  "Other",
];

const allBrandsExceptOther = validBrands.filter((brand) => brand !== "Other");

const validConditions: ProductCondition[] = ["new", "uk-used", "refurbished"];

const validSortOptions: ShopSortOption[] = [
  "newest",
  "price-low",
  "price-high",
  "name-asc",
];

function getFiltersFromParams(params: URLSearchParams): ShopFilterState {
  const brand = params.get("brand");
  const condition = params.get("condition");
  const brands = params.get("brands");

  return {
    ...initialFilters,
    brands:
      brands === "all"
        ? allBrandsExceptOther
        : brand && validBrands.includes(brand as ProductBrand)
          ? [brand as ProductBrand]
          : [],
    conditions:
      condition && validConditions.includes(condition as ProductCondition)
        ? [condition as ProductCondition]
        : [],
  };
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read navbar filters directly from the URL.
  const filters = useMemo(
    () => getFiltersFromParams(searchParams),
    [searchParams],
  );

  const sortBy = useMemo<ShopSortOption>(() => {
    const sort = searchParams.get("sort") as ShopSortOption | null;

    return sort && validSortOptions.includes(sort) ? sort : "newest";
  }, [searchParams]);

  // Update brand and condition filters without competing URL effects.
  const updateFilters = useCallback(
    (nextFilters: ShopFilterState) => {
      const params = new URLSearchParams(searchParams);

      const isAllBrandsSelected =
        nextFilters.brands.length === allBrandsExceptOther.length &&
        allBrandsExceptOther.every((brand) =>
          nextFilters.brands.includes(brand),
        );

      params.delete("brand");
      params.delete("brands");
      params.delete("condition");

      if (isAllBrandsSelected) {
        params.set("brands", "all");
      } else if (nextFilters.brands.length === 1) {
        params.set("brand", nextFilters.brands[0]);
      }

      if (nextFilters.conditions.length === 1) {
        params.set("condition", nextFilters.conditions[0]);
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Keep sorting in the URL so navbar navigation stays consistent.
  const updateSort = useCallback(
    (nextSort: ShopSortOption) => {
      const params = new URLSearchParams(searchParams);

      if (nextSort === "newest") {
        params.delete("sort");
      } else {
        params.set("sort", nextSort);
      }

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      // Load the catalogue once; existing filters run on the fetched data.
      const result = await getProducts({ page: 1, limit: 100 });
      setProducts(result.products);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const minPrice = filters.minPrice.trim() ? Number(filters.minPrice) : null;
    const maxPrice = filters.maxPrice.trim() ? Number(filters.maxPrice) : null;

    return products.filter((product) => {
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
  }, [products, searchQuery, filters]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return result.sort((a, b) => a.price - b.price);

      case "price-high":
        return result.sort((a, b) => b.price - a.price);

      case "name-asc":
        return result.sort((a, b) => a.name.localeCompare(b.name));

      case "newest":
      default:
        return result;
    }
  }, [filteredProducts, sortBy]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);

    params.delete("brand");
    params.delete("brands");
    params.delete("condition");

    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const activeFilterCount =
    filters.brands.length +
    filters.conditions.length +
    filters.storages.length +
    Number(filters.minPrice !== "") +
    Number(filters.maxPrice !== "") +
    Number(filters.availability !== "all");

  const removeBrand = (brand: ProductBrand) => {
    updateFilters({
      ...filters,
      brands: filters.brands.filter((item) => item !== brand),
    });
  };

  const removeCondition = (condition: ProductCondition) => {
    updateFilters({
      ...filters,
      conditions: filters.conditions.filter((item) => item !== condition),
    });
  };

  const removeStorage = (storage: string) => {
    updateFilters({
      ...filters,
      storages: filters.storages.filter((item) => item !== storage),
    });
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
            onRemove: () => updateFilters({ ...filters, minPrice: "" }),
          },
        ]
      : []),

    ...(filters.maxPrice
      ? [
          {
            key: "max-price",
            label: `Max ₦${Number(filters.maxPrice).toLocaleString("en-NG")}`,
            onRemove: () => updateFilters({ ...filters, maxPrice: "" }),
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
              updateFilters({
                ...filters,
                availability: "all",
              }),
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-paper">
      <div className="page-container">
        <ShopSearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <ShopPageHeader productCount={products.length} />

      <div className="page-container py-5 lg:py-6">
        <div className="flex items-start gap-5 xl:gap-6">
          <aside className="hidden w-[220px] shrink-0 self-start overflow-hidden rounded-xl border border-stone bg-white lg:block xl:w-[240px]">
            <ShopFilters
              products={products}
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </aside>

          <section aria-label="Shop products" className="min-w-0 flex-1">
            <ShopToolbar
              resultCount={sortedProducts.length}
              totalCount={products.length}
              activeFilterCount={activeFilterCount}
              activeChips={activeChips}
              sortBy={sortBy}
              onSortChange={updateSort}
              onOpenFilters={() => setMobileFiltersOpen(true)}
              onClearAll={clearFilters}
            />

            {error && !isLoading ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-[var(--color-error)]/30 bg-white p-6 text-center"
              >
                <p className="text-sm text-[var(--color-error)]">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadProducts()}
                  className="mt-3 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[#D9531D]"
                >
                  Try again
                </button>
              </div>
            ) : (
              <ProductGrid
                products={sortedProducts}
                isLoading={isLoading}
                columns={4}
                emptyMessage="No phones match your search or filters. Try adjusting your selections."
              />
            )}
          </section>
        </div>
      </div>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        products={products}
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        onClose={() => setMobileFiltersOpen(false)}
        onApply={() => setMobileFiltersOpen(false)}
        resultCount={sortedProducts.length}
      />
    </main>
  );
}
