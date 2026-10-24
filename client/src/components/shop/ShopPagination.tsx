import { useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ShopPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ShopPaginationProps) {
  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const visible = new Set<number>([
      1,
      totalPages,
      currentPage,
      currentPage - 1,
      currentPage + 1,
    ]);

    if (currentPage <= 3) {
      visible.add(2);
      visible.add(3);
      visible.add(4);
    }

    if (currentPage >= totalPages - 2) {
      visible.add(totalPages - 1);
      visible.add(totalPages - 2);
      visible.add(totalPages - 3);
    }

    const sorted = [...visible]
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);

    const result: (number | "ellipsis")[] = [];

    sorted.forEach((page, index) => {
      if (index > 0 && page - sorted[index - 1] > 1) {
        result.push("ellipsis");
      }

      result.push(page);
    });

    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Product pages"
      className="mt-7 flex items-center justify-center gap-1.5 sm:gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone bg-white text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronLeft aria-hidden="true" size={16} />
      </button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="flex h-9 min-w-5 items-center justify-center text-xs text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            className={[
              "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2",
              "font-body text-xs transition-colors",
              currentPage === page
                ? "border-accent bg-accent font-semibold text-white"
                : "border-stone bg-white text-ink hover:border-accent",
            ].join(" ")}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone bg-white text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronRight aria-hidden="true" size={16} />
      </button>
    </nav>
  );
}
