import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiAlertCircle } from "react-icons/fi";

import TrackingStats from "../admin/components/tracking/TrackingStats";
import TrackingToolbar from "../admin/components/tracking/TrackingToolbar";
import TrackingOrdersTable from "../admin/components/tracking/TrackingOrdersTable";
import TrackingPagination from "../admin/components/tracking/TrackingPagination";
import UpdateTrackingForm from "../admin/components/tracking/UpdateTrackingForm";
import TrackingTimeline from "../admin/components/tracking/TrackingTimeline";
import TrackingOrderDetailsModal from "../admin/components/tracking/TrackingOrderDetailsModal";

import {
  getAdminTrackingOrders,
  updateAdminTracking,
} from "../admin/services/adminTracking.service";

import type {
  TrackingOrder,
  TrackingQuery,
  TrackingResponse,
  TrackingSummary,
  TrackingUpdateInput,
} from "../admin/types/tracking.types";

import { getTrackingPartners } from "../admin/utils/tracking.utils";

// ============================================
// INITIAL STATE
// ============================================

const initialQuery: TrackingQuery = {
  search: "",
  status: "all",
  partner: "all",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 5,
};

const initialSummary: TrackingSummary = {
  totalTracked: 0,
  inTransit: 0,
  delivered: 0,
  pendingUpdate: 0,
};

const initialResponse: TrackingResponse = {
  orders: [],
  summary: initialSummary,
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },
};

// ============================================
// PAGE
// ============================================

export default function TrackingManagementPage() {
  const [query, setQuery] = useState<TrackingQuery>(initialQuery);

  const [response, setResponse] = useState<TrackingResponse>(initialResponse);

  const [allOrders, setAllOrders] = useState<TrackingOrder[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(
    null,
  );

  const [detailsOrder, setDetailsOrder] = useState<TrackingOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  // ============================================
  // LOAD TRACKING ORDERS
  // ============================================

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminTrackingOrders(query);

      setResponse(result);

      // The API is paginated, so keep the form's order list
      // synchronized with the currently loaded records.
      setAllOrders(result.orders);

      // Refresh selected order data when it appears in the
      // current API response.
      setSelectedOrder((current) => {
        if (!current) return null;

        return (
          result.orders.find((order) => order.id === current.id) ?? current
        );
      });

      // Keep the details modal synchronized as well.
      setDetailsOrder((current) => {
        if (!current) return null;

        return (
          result.orders.find((order) => order.id === current.id) ?? current
        );
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load tracking orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  // ============================================
  // DELIVERY PARTNERS
  // ============================================

  const partners = useMemo(() => getTrackingPartners(allOrders), [allOrders]);

  const summary: TrackingSummary = response.summary ?? initialSummary;

  // ============================================
  // UPDATE TRACKING
  // ============================================

  async function handleUpdateTracking(
    input: TrackingUpdateInput,
  ): Promise<void> {
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      // The backend persists the update before returning.
      const updated = await updateAdminTracking(input);

      // Update the form's order list.
      setAllOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order)),
      );

      // Update the selected order and its timeline.
      setSelectedOrder((current) =>
        current?.id === updated.id ? updated : current,
      );

      // Update the details modal if it is showing this order.
      setDetailsOrder((current) =>
        current?.id === updated.id ? updated : current,
      );

      setFeedback(`${updated.orderId} tracking updated successfully.`);

      // Reload the current page to get authoritative records
      // and updated summary information from the backend.
      const result = await getAdminTrackingOrders(query);

      setResponse(result);
      setAllOrders(result.orders);

      // Preserve the updated order even if it is no longer
      // included in the current filtered page.
      setSelectedOrder((current) => {
        if (!current || current.id !== updated.id) {
          return current;
        }

        return (
          result.orders.find((order) => order.id === updated.id) ?? updated
        );
      });

      setDetailsOrder((current) => {
        if (!current || current.id !== updated.id) {
          return current;
        }

        return (
          result.orders.find((order) => order.id === updated.id) ?? updated
        );
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to update tracking information.";

      setError(message);

      // Re-throw so the form can also display the error.
      throw err;
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // EXPORT TRACKING ORDERS
  // ============================================

  function handleExport(): void {
    if (!response.orders.length) {
      setError("There are no tracking orders to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Phone",
      "Tracking Number",
      "Delivery Partner",
      "Destination",
      "Status",
      "Last Updated",
    ];

    const rows = response.orders.map((order) => [
      order.orderId,
      order.customer.fullName,
      order.customer.email,
      order.customer.phoneNumber,
      order.trackingNumber,
      order.deliveryPartner,
      order.destination,
      order.status,
      order.lastUpdatedAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "ogim-tracking-orders.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  // ============================================
  // SELECT ORDER
  // ============================================

  function handleSelectOrder(order: TrackingOrder | null): void {
    setSelectedOrder(order);
    setFeedback("");
    setError("");
  }

  // ============================================
  // OPEN ORDER DETAILS
  // ============================================

  function handleOpenDetails(order: TrackingOrder): void {
    setDetailsOrder(order);
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <main className="min-w-0 space-y-5 pb-8">
      {/* PAGE HEADING */}

      <div>
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] sm:text-sm"
        >
          <span>Dashboard</span>
          <FiChevronRight size={14} />
          <span className="text-[var(--color-ink)]">Tracking Management</span>
        </nav>

        <h1 className="font-heading text-2xl font-extrabold tracking-[-0.045em] text-[var(--color-ink)] sm:text-3xl">
          Tracking Management
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
          Update customer-visible tracking information for orders.
        </p>
      </div>

      {/* SUMMARY CARDS */}

      <TrackingStats summary={summary} />

      {/* TRACKING ORDERS */}

      <section className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-3 shadow-[var(--shadow-card)] sm:p-4">
        <TrackingToolbar
          query={query}
          partners={partners}
          onChange={setQuery}
          onExport={handleExport}
        />

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-3 text-sm text-[var(--color-error)]"
          >
            <FiAlertCircle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {feedback && (
          <p
            role="status"
            className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-3 py-2.5 text-sm font-medium text-[var(--color-success)]"
          >
            {feedback}
          </p>
        )}

        {/* TABLE */}

        <div className="overflow-visible rounded-xl border border-[var(--color-border)]">
          <TrackingOrdersTable
            orders={response.orders}
            loading={loading}
            onSelect={handleOpenDetails}
            onUpdate={(order) => {
              handleSelectOrder(order);
            }}
          />

          {!loading && (
            <TrackingPagination
              page={response.pagination.page}
              totalPages={response.pagination.totalPages}
              total={response.pagination.total}
              limit={response.pagination.limit}
              onPageChange={(page) =>
                setQuery((current) => ({
                  ...current,
                  page,
                }))
              }
              onLimitChange={(limit) =>
                setQuery((current) => ({
                  ...current,
                  limit,
                  page: 1,
                }))
              }
            />
          )}
        </div>
      </section>

      {/* UPDATE FORM AND TIMELINE */}

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <UpdateTrackingForm
          orders={allOrders}
          selectedOrder={selectedOrder}
          saving={saving}
          onSelectOrder={handleSelectOrder}
          onSubmit={handleUpdateTracking}
        />

        <TrackingTimeline
          events={selectedOrder?.events ?? []}
          title={
            selectedOrder
              ? `Tracking Timeline · ${selectedOrder.orderId}`
              : "Tracking Timeline"
          }
        />
      </section>

      {/* ORDER DETAILS MODAL */}

      <TrackingOrderDetailsModal
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
      />
    </main>
  );
}
