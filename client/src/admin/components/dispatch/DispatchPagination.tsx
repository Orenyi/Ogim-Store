import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export default function DispatchPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: Props) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--color-muted)]">
        Showing{" "}
        <strong className="text-[var(--color-ink)]">
          {start}–{end}
        </strong>{" "}
        of <strong className="text-[var(--color-ink)]">{total}</strong>{" "}
        dispatches
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Dispatches per page"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-9 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white px-2 text-xs outline-none"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] disabled:opacity-40"
        >
          <FiChevronLeft size={16} />
        </button>

        <span className="flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3 text-xs font-bold text-white">
          {page}
        </span>

        <span className="px-1 text-xs text-[var(--color-muted)]">
          of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] disabled:opacity-40"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
