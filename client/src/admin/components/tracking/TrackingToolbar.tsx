import { FiSearch, FiDownload, FiX } from "react-icons/fi";
import type { TrackingQuery } from "../../types/tracking.types";

type Props = {
  query: TrackingQuery;
  partners: string[];
  onChange: (query: TrackingQuery) => void;
  onExport: () => void;
};

const selectClass =
  "h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] sm:w-auto";

export default function TrackingToolbar({
  query,
  partners,
  onChange,
  onExport,
}: Props) {
  function update<K extends keyof TrackingQuery>(
    key: K,
    value: TrackingQuery[K],
  ) {
    onChange({
      ...query,
      [key]: value,
      page: 1,
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-3 sm:p-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center">
        <label className="relative min-w-0 xl:flex-1">
          <span className="sr-only">Search tracking orders</span>
          <FiSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            value={query.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Search order ID, tracking number or customer..."
            className="h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] pl-10 pr-10 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
          />
          {query.search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            >
              <FiX size={16} />
            </button>
          )}
        </label>

        <label>
          <span className="sr-only">Filter by tracking status</span>
          <select
            value={query.status}
            onChange={(event) =>
              update("status", event.target.value as TrackingQuery["status"])
            }
            className={selectClass}
          >
            <option value="all">Status: All</option>
            <option value="processing">Processing</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Filter by delivery partner</span>
          <select
            value={query.partner}
            onChange={(event) => update("partner", event.target.value)}
            className={selectClass}
          >
            <option value="all">Partner: All</option>
            {partners.map((partner) => (
              <option key={partner} value={partner}>
                {partner}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Start date</span>
          <input
            aria-label="Start date"
            type="date"
            value={query.startDate}
            onChange={(event) => update("startDate", event.target.value)}
            className={selectClass}
          />
        </label>

        <label>
          <span className="sr-only">End date</span>
          <input
            aria-label="End date"
            type="date"
            value={query.endDate}
            onChange={(event) => update("endDate", event.target.value)}
            min={query.startDate || undefined}
            className={selectClass}
          />
        </label>

        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent-soft)]"
        >
          <FiDownload size={16} />
          Export
        </button>
      </div>
    </section>
  );
}
