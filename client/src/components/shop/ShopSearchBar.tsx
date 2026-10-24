import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";

import SearchSuggestions from "../search/SearchSuggestions";

interface ShopSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ShopSearchBar({ value, onChange }: ShopSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = value.trim();
    if (!query) return;

    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative border-b border-stone/70 bg-paper py-3 lg:hidden"
    >
      <form
        role="search"
        onSubmit={submitSearch}
        className="flex h-10 w-full items-center gap-2 rounded-full border border-stone bg-white px-3.5 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10"
      >
        <label htmlFor="shop-search-mobile" className="sr-only">
          Search phones
        </label>

        <FiSearch
          aria-hidden="true"
          size={17}
          className="shrink-0 text-muted"
        />

        <input
          id="shop-search-mobile"
          type="search"
          name="q"
          autoComplete="off"
          placeholder="Search for iPhone, Samsung, ..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsFocused(false);
            }
          }}
          aria-expanded={isFocused && Boolean(value.trim())}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-body text-xs text-ink outline-none placeholder:text-muted focus:ring-0"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-stone/50 hover:text-ink"
          >
            <FiX aria-hidden="true" size={15} />
          </button>
        )}
      </form>

      {isFocused && value.trim() && (
        <div className="absolute inset-x-0 top-full z-[var(--z-dropdown)] px-0 pt-2">
          <SearchSuggestions
            query={value}
            mobile
            onSelect={() => setIsFocused(false)}
          />
        </div>
      )}
    </div>
  );
}
