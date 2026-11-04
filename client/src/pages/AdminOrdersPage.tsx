import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronRight,
  FiAlertCircle,
  FiRefreshCw,
  FiX,
  FiCheck,
} from "react-icons/fi";

import OrdersStats from "../admin/components/orders/OrdersStats";
import OrdersToolbar from "../admin/components/orders/OrdersToolbar";
import OrdersTable from "../admin/components/orders/OrdersTable";
import OrdersMobileList from "../admin/components/orders/OrdersMobileList";
import OrdersPagination from "../admin/components/orders/OrdersPagination";
import OrderStatusBadge from "../admin/components/orders/OrderStatusBadge";

import { getAdminOrders } from "../admin/services/adminOrders.service";

import type {
  AdminOrder,
  AdminOrdersResponse,
  OrderFulfilmentStatus,
  OrderListFilters,
} from "../admin/types/orders.types";

const initialFilters: OrderListFilters = {
  search: "",
  fulfilmentStatus: "all",
  paymentStatus: "all",
  startDate: "",
  endDate: "",
};

const initialResponse: AdminOrdersResponse = {
  orders: [],
  summary: {
    allOrders: 0,
    processing: 0,
    inTransit: 0,
    delivered: 0,
    pendingDispatch: 0,
  },
  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  },
};

const statusOptions: {
  value: OrderFulfilmentStatus;
  label: string;
}[] = [
  { value: "pending_dispatch", label: "Pending Dispatch" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [response, setResponse] =
    useState<AdminOrdersResponse>(initialResponse);

  const [filters, setFilters] = useState<OrderListFilters>(initialFilters);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [nextStatus, setNextStatus] =
    useState<OrderFulfilmentStatus>("processing");

  const isDemoMode = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAdminOrders({
        page,
        limit,
        search: filters.search,
        fulfilmentStatus: filters.fulfilmentStatus,
        paymentStatus: filters.paymentStatus,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      setResponse(result);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        void loadOrders();
      },
      filters.search ? 250 : 0,
    );

    return () => window.clearTimeout(timeout);
  }, [loadOrders, filters.search]);

  function handleFiltersChange(nextFilters: OrderListFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleStatusUpdate(orderId: string, status: OrderFulfilmentStatus) {
    if (!isDemoMode) {
      setNotice(
        "Status updates will be enabled when the admin API is connected.",
      );
      return;
    }

    setResponse((current) => ({
      ...current,
      orders: current.orders.map((order) =>
        order.id === orderId ? { ...order, fulfilmentStatus: status } : order,
      ),
    }));

    setEditingOrder(null);
    setNotice(
      "Demo order status updated locally. This change is not saved to the database.",
    );
  }

  function openStatusEditor(orderId: string) {
    const order = response.orders.find((item) => item.id === orderId);

    if (!order) return;

    setEditingOrder(order);
    setNextStatus(order.fulfilmentStatus);
  }

  function handleCreateDispatch(orderId: string) {
    setNotice(
      `Dispatch management for ${orderId} will be available in the Dispatch module.`,
    );
  }

  function handleSendUpdate(orderId: string) {
    setNotice(
      `Customer updates for ${orderId} will be connected to the notification service.`,
    );
  }

  function exportOrders() {
    const rows = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Phone",
        "Items",
        "Total",
        "Payment Status",
        "Fulfilment Status",
        "Ordered At",
      ],
      ...response.orders.map((order) => [
        order.orderNumber,
        order.customer.fullName,
        order.customer.email,
        order.customer.phoneNumber,
        order.itemSummary,
        String(order.total),
        order.paymentStatus,
        order.fulfilmentStatus,
        order.orderedAt,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "ogim-store-orders.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-[var(--color-muted)]"
      >
        <Link to="/admin" className="hover:text-[var(--color-accent)]">
          Dashboard
        </Link>
        <FiChevronRight size={14} />
        <span className="font-semibold text-[var(--color-ink)]">Orders</span>
      </nav>

      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-ink)] sm:text-4xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
            View, filter and manage customer orders.
          </p>
        </div>

        {isDemoMode && (
          <span className="rounded-full bg-[var(--color-warning-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-warning)]">
            Demo data
          </span>
        )}
      </div>

      {/* Summary cards */}
      <OrdersStats summary={response.summary} />

      {/* Notice */}
      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white px-4 py-3"
        >
          <p className="text-xs leading-5 text-[var(--color-muted)]">
            {notice}
          </p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notice"
            className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Search and filters */}
      <OrdersToolbar
        filters={filters}
        onChange={handleFiltersChange}
        onExport={exportOrders}
      />

      {/* Orders table */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
            <FiAlertCircle size={24} className="text-[var(--color-error)]" />
            <p className="text-sm font-semibold">Unable to load orders</p>
            <p className="text-xs text-[var(--color-muted)]">{error}</p>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-2.5 text-xs font-semibold text-white"
            >
              <FiRefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4 p-5" role="status">
            <span className="sr-only">Loading orders...</span>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex animate-pulse gap-3">
                <div className="h-9 w-9 rounded-full bg-[var(--color-surface-muted)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-[var(--color-surface-muted)]" />
                  <div className="h-3 w-2/3 rounded bg-[var(--color-surface-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <OrdersTable
              orders={response.orders}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onStatusChange={handleStatusUpdate}
              onCreateDispatch={handleCreateDispatch}
              onSendUpdate={handleSendUpdate}
            />

            <div className="p-3 md:hidden">
              <OrdersMobileList
                orders={response.orders}
                onUpdateStatus={openStatusEditor}
                onStatusChange={handleStatusUpdate}
                onCreateDispatch={handleCreateDispatch}
                onSendUpdate={handleSendUpdate}
              />
            </div>

            <OrdersPagination
              page={response.pagination.page}
              limit={response.pagination.limit}
              total={response.pagination.total}
              totalPages={response.pagination.totalPages}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </section>

      {/* Status update modal */}
      {editingOrder && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[var(--color-ink)]/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingOrder(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-order-status-title"
            className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-dropdown)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="update-order-status-title"
                  className="font-heading text-lg font-extrabold"
                >
                  Update order status
                </h2>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {editingOrder.orderNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-[var(--color-ink)]">
                Current status
              </p>
              <OrderStatusBadge status={editingOrder.fulfilmentStatus} />

              <label
                htmlFor="next-order-status"
                className="mb-2 mt-5 block text-xs font-semibold text-[var(--color-ink)]"
              >
                New fulfilment status
              </label>

              <select
                id="next-order-status"
                value={nextStatus}
                onChange={(event) =>
                  setNextStatus(event.target.value as OrderFulfilmentStatus)
                }
                className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-sm font-semibold hover:bg-[var(--color-surface-muted)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate(editingOrder.id, nextStatus)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
              >
                <FiCheck size={16} />
                Save status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
