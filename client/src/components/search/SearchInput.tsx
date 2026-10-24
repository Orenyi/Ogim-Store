import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";

import SearchSuggestions from "./SearchSuggestions";

interface SearchInputProps {
  variant?: "desktop" | "mobile";
  initialValue?: string;
  onSearch?: (query: string) => void;
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function SearchInput({
  variant = "desktop",
  initialValue = "",
  onSearch,
  onClose,
  autoFocus = false,
}: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!autoFocus) return;

    const input = wrapperRef.current?.querySelector("input");
    input?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();
    if (!value) return;

    setFocused(false);
    onSearch?.(value);

    if (!onSearch) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }

    onClose?.();
  }

  const mobile = variant === "mobile";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        role="search"
        onSubmit={submitSearch}
        className={[
          "flex min-h-10 items-center gap-2 rounded-full border bg-white px-3 transition-colors",
          focused ? "border-accent" : "border-stone",
        ].join(" ")}
      >
        <FiSearch
          aria-hidden="true"
          size={16}
          className="shrink-0 text-muted"
        />

        <label htmlFor={`store-search-${variant}`} className="sr-only">
          Search phones
        </label>

        <input
          id={`store-search-${variant}`}
          type="search"
          name="q"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search for iPhone, Samsung, ..."
          className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none focus:ring-0"
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-ink"
          >
            <FiX aria-hidden="true" size={15} />
          </button>
        )}

        {mobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-xs font-semibold text-accent"
          >
            Cancel
          </button>
        )}
      </form>

      {focused && query.trim() && (
        <SearchSuggestions
          query={query}
          onSelect={() => {
            setFocused(false);
            onClose?.();
          }}
        />
      )}
    </div>
  );
}
