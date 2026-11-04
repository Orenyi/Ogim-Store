import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export default function DeliveryPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: Props) {
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-[var(--color-muted)] sm:text-sm">
        Showing{" "}
        <span className="font-semibold text-[var(--color-ink)]">
          {first} – {last}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[var(--color-ink)]">{total}</span>{" "}
        locations
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="delivery-page-size">
          Rows per page
        </label>
        <select
          id="delivery-page-size"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-9 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-white)] px-2 text-xs font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
        >
          {[8, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-ink)] transition hover:bg-[var(--color-stone)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft size={17} />
        </button>

        <span className="min-w-16 text-center text-xs font-semibold text-[var(--color-ink)]">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-ink)] transition hover:bg-[var(--color-stone)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
