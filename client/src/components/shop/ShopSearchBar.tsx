import { FiSearch, FiX } from "react-icons/fi";

interface ShopSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ShopSearchBar({ value, onChange }: ShopSearchBarProps) {
  return (
    <div className="border-b border-stone/70 bg-paper px-0 py-3 lg:hidden">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="flex h-10 w-full items-center gap-2 rounded-full border border-stone bg-white px-3.5 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10"
      >
        <label htmlFor="shop-search-mobile" className="sr-only">
          Search phones
        </label>

        <input
          id="shop-search-mobile"
          type="search"
          name="q"
          autoComplete="off"
          placeholder="Search for iPhone, Samsung, ..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-body text-xs text-ink outline-none placeholder:text-muted focus:ring-0"
        />

        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-stone/50 hover:text-ink"
          >
            <FiX aria-hidden="true" size={15} />
          </button>
        ) : (
          <FiSearch
            aria-hidden="true"
            size={17}
            className="shrink-0 text-muted"
          />
        )}
      </form>
    </div>
  );
}
