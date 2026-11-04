import {
  FiSearch,
  FiCalendar,
  FiDownload,
  FiChevronDown,
  FiX,
} from "react-icons/fi";

import type { OrderListFilters } from "../../types/orders.types";

type Props = {
  filters: OrderListFilters;
  onChange: (filters: OrderListFilters) => void;
  onExport: () => void;
};

export default function OrdersToolbar({ filters, onChange, onExport }: Props) {
  function update<K extends keyof OrderListFilters>(
    key: K,
    value: OrderListFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  const hasFilters =
    filters.search ||
    filters.fulfilmentStatus !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.startDate ||
    filters.endDate;

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)] sm:p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_minmax(210px,1fr)_auto]">
        {/* Search */}
        <div className="relative min-w-0">
          <FiSearch
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Search by order ID, customer, phone or product..."
            aria-label="Search orders"
            className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white pl-10 pr-3 text-xs outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
          />
        </div>

        {/* Fulfilment status */}
        <div className="relative min-w-0">
          <select
            aria-label="Filter by fulfilment status"
            value={filters.fulfilmentStatus}
            onChange={(event) =>
              update(
                "fulfilmentStatus",
                event.target.value as OrderListFilters["fulfilmentStatus"],
              )
            }
            className="h-11 w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 pr-9 text-xs outline-none focus:border-[var(--color-accent)]"
          >
            <option value="all">Status: All</option>
            <option value="pending_dispatch">Pending Dispatch</option>
            <option value="processing">Processing</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <FiChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            size={15}
          />
        </div>

        {/* Payment status */}
        <div className="relative min-w-0">
          <select
            aria-label="Filter by payment status"
            value={filters.paymentStatus}
            onChange={(event) =>
              update(
                "paymentStatus",
                event.target.value as OrderListFilters["paymentStatus"],
              )
            }
            className="h-11 w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 pr-9 text-xs outline-none focus:border-[var(--color-accent)]"
          >
            <option value="all">Payment: All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>
          <FiChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            size={15}
          />
        </div>

        {/* Date range */}
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <label className="relative min-w-0">
            <span className="sr-only">Start date</span>
            <FiCalendar
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              type="date"
              value={filters.startDate}
              max={filters.endDate || undefined}
              onChange={(event) => update("startDate", event.target.value)}
              className="h-11 w-full min-w-0 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white pl-8 pr-1 text-[10px] outline-none focus:border-[var(--color-accent)] sm:text-xs"
            />
          </label>

          <label className="relative min-w-0">
            <span className="sr-only">End date</span>
            <FiCalendar
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(event) => update("endDate", event.target.value)}
              className="h-11 w-full min-w-0 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white pl-8 pr-1 text-[10px] outline-none focus:border-[var(--color-accent)] sm:text-xs"
            />
          </label>
        </div>

        {/* Export */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-accent)] px-4 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)]"
        >
          <FiDownload size={16} />
          Export
        </button>
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() =>
              onChange({
                search: "",
                fulfilmentStatus: "all",
                paymentStatus: "all",
                startDate: "",
                endDate: "",
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            <FiX size={14} />
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
