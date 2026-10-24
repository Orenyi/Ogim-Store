import { FiArrowRight, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

import { sampleProducts } from "../../data/products";

interface SearchSuggestionsProps {
  query: string;
  onSelect?: () => void;
  mobile?: boolean;
}

const popularSearches = [
  "iPhone",
  "Samsung",
  "Google Pixel",
  "Infinix",
  "Tecno",
];

export default function SearchSuggestions({
  query,
  onSelect,
  mobile = false,
}: SearchSuggestionsProps) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return null;

  const matchingProducts = sampleProducts
    .filter((product) =>
      [product.name, product.brand, product.storage, product.colour].some(
        (value) => value.toLowerCase().includes(normalizedQuery),
      ),
    )
    .slice(0, 6);

  const matchingPopular = popularSearches
    .filter((term) => term.toLowerCase().includes(normalizedQuery))
    .slice(0, 4);

  return (
    <div
      className={[
        "overflow-hidden rounded-xl border border-stone bg-white shadow-dropdown",
        mobile ? "w-full" : "absolute inset-x-0 top-full z-20 mt-2",
      ].join(" ")}
    >
      <ul aria-label="Search suggestions" className="py-2">
        {matchingProducts.map((product) => (
          <li key={product.id}>
            <Link
              to={`/search?q=${encodeURIComponent(product.name)}`}
              onClick={onSelect}
              className="flex min-h-10 items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-surface-muted"
            >
              <FiSearch
                aria-hidden="true"
                size={15}
                className="shrink-0 text-muted"
              />
              <span className="min-w-0 flex-1 truncate">{product.name}</span>
              <FiArrowRight
                aria-hidden="true"
                size={14}
                className="shrink-0 text-muted"
              />
            </Link>
          </li>
        ))}

        {matchingPopular.map((term) => (
          <li key={term}>
            <Link
              to={`/search?q=${encodeURIComponent(term)}`}
              onClick={onSelect}
              className="flex min-h-10 items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-surface-muted"
            >
              <FiSearch
                aria-hidden="true"
                size={15}
                className="shrink-0 text-muted"
              />
              <span className="min-w-0 flex-1 truncate">{term}</span>
              <FiArrowRight
                aria-hidden="true"
                size={14}
                className="shrink-0 text-muted"
              />
            </Link>
          </li>
        ))}

        {matchingProducts.length === 0 && matchingPopular.length === 0 && (
          <li className="px-4 py-4 text-sm text-muted">
            No suggestions for "{query}". Press Enter to search.
          </li>
        )}

        <li className="border-t border-stone">
          <Link
            to={`/search?q=${encodeURIComponent(query.trim())}`}
            onClick={onSelect}
            className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-soft"
          >
            Search for "{query.trim()}"
            <FiArrowRight aria-hidden="true" size={15} />
          </Link>
        </li>
      </ul>
    </div>
  );
}
