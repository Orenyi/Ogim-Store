import { FiSearch, FiFilter, FiPlus, FiDownload, FiX } from "react-icons/fi";
import type {
  DeliveryFeeStatus,
  DeliveryFeesQuery,
} from "../../types/delivery.types";

type Props = {
  query: DeliveryFeesQuery;
  states: string[];
  onQueryChange: (query: DeliveryFeesQuery) => void;
  onAdd: () => void;
  onExport: () => void;
};

const selectClass =
  "h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]";

export default function DeliveryToolbar({
  query,
  states,
  onQueryChange,
  onAdd,
  onExport,
}: Props) {
  function update<K extends keyof DeliveryFeesQuery>(
    key: K,
    value: DeliveryFeesQuery[K],
  ) {
    onQueryChange({
      ...query,
      [key]: value,
      ...(key === "search" || key === "state" || key === "status"
        ? { page: 1 }
        : {}),
    });
  }

  const hasFilters =
    query.search.trim() !== "" ||
    query.state !== "all" ||
    query.status !== "all";

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search delivery locations</span>
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            size={18}
          />
          <input
            value={query.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Search location (state, LGA or city)..."
            className="h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] pl-10 pr-10 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
          />
          {query.search && (
            <button
              type="button"
              onClick={() => update("search", "")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <FiX size={16} />
            </button>
          )}
        </label>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <label className="relative">
            <span className="sr-only">Filter by state</span>
            <FiFilter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] sm:hidden"
            />
            <select
              value={query.state}
              onChange={(event) => update("state", event.target.value)}
              className={`${selectClass} w-full pl-3 sm:w-auto`}
            >
              <option value="all">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by status</span>
            <select
              value={query.status}
              onChange={(event) =>
                update(
                  "status",
                  event.target.value as DeliveryFeeStatus | "all",
                )
              }
              className={`${selectClass} w-full sm:w-auto`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-accent)] px-3 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent-soft)] sm:px-4"
          >
            <FiDownload size={16} />
            Export
          </button>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-accent-hover)] sm:px-4"
          >
            <FiPlus size={17} />
            Add Fee
          </button>
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() =>
            onQueryChange({
              ...query,
              search: "",
              state: "all",
              status: "all",
              page: 1,
            })
          }
          className="mt-3 text-xs font-semibold text-[var(--color-accent)] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </section>
  );
}
