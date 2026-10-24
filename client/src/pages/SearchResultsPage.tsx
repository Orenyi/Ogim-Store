import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import { sampleProducts } from "../data/products";
import ProductGrid from "../components/product/ProductGrid";
import SearchEmptyState from "../components/search/SearchEmptyState";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const results = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    if (!normalizedQuery) return [];

    return sampleProducts.filter((product) =>
      [
        product.name,
        product.brand,
        product.storage,
        product.colour,
        product.condition,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-paper">
      <div className="page-container py-5 sm:py-7">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-xs text-muted"
        >
          <Link to="/" className="transition-colors hover:text-accent">
            Home
          </Link>
          <FiChevronRight aria-hidden="true" size={13} />
          <span className="font-medium text-accent" aria-current="page">
            Search results
          </span>
        </nav>

        {!query ? (
          <section className="py-10 text-center">
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">
              Search for your next phone
            </h1>
            <p className="mt-2 text-sm text-muted">
              Use the search bar above to find phones by name or brand.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-flex min-h-11 items-center rounded-control bg-accent px-5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
            >
              Browse all phones
            </Link>
          </section>
        ) : (
          <>
            <header className="mb-6">
              <p className="text-xs text-muted">Search results for</p>
              <h1 className="mt-1 break-words font-heading text-2xl font-bold sm:text-3xl">
                "{query}"
              </h1>
              <p className="mt-2 text-sm text-muted" aria-live="polite">
                {results.length.toLocaleString("en-NG")}{" "}
                {results.length === 1 ? "product" : "products"} found
              </p>
            </header>

            {results.length > 0 ? (
              <ProductGrid
                products={results}
                columns={4}
                emptyMessage="No phones match your search."
              />
            ) : (
              <SearchEmptyState query={query} />
            )}

            <div className="mt-8 border-t border-stone pt-5">
              <button
                type="button"
                onClick={() => {
                  setSearchParams({});
                }}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Clear search
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
