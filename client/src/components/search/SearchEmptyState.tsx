import { Link } from "react-router-dom";
import { FiArrowRight, FiSearch } from "react-icons/fi";

interface SearchEmptyStateProps {
  query: string;
  suggestions?: string[];
}

const defaultSuggestions = [
  "iPhone",
  "Samsung",
  "Google Pixel",
  "Infinix",
  "Tecno",
];

export default function SearchEmptyState({
  query,
  suggestions = defaultSuggestions,
}: SearchEmptyStateProps) {
  return (
    <section
      aria-labelledby="search-empty-heading"
      className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-12 text-center sm:py-16"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <FiSearch aria-hidden="true" size={28} />
      </div>

      <h2
        id="search-empty-heading"
        className="mt-5 font-heading text-xl font-bold sm:text-2xl"
      >
        No products found
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        We couldn't find any phones matching{" "}
        <span className="font-semibold text-ink">"{query}"</span>. Check your
        spelling or try a broader search.
      </p>

      <Link
        to="/shop"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Browse all phones
      </Link>

      <div className="mt-8 w-full max-w-sm text-left">
        <h3 className="mb-3 font-heading text-sm font-bold">
          Try searching for
        </h3>

        <ul className="divide-y divide-stone">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <Link
                to={`/search?q=${encodeURIComponent(suggestion)}`}
                className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm transition-colors hover:text-accent"
              >
                <span className="flex items-center gap-2">
                  <FiSearch
                    aria-hidden="true"
                    size={14}
                    className="text-muted"
                  />
                  {suggestion}
                </span>
                <FiArrowRight aria-hidden="true" size={14} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
