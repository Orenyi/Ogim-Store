import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiRefreshCw } from "react-icons/fi";

import DispatchStats from "../admin/components/dispatch/DispatchStats";
import DispatchTabs from "../admin/components/dispatch/DispatchTabs";
import DispatchToolbar from "../admin/components/dispatch/DispatchToolbar";
import DispatchTable from "../admin/components/dispatch/DispatchTable";
import DispatchMobileList from "../admin/components/dispatch/DispatchMobileList";
import DispatchPagination from "../admin/components/dispatch/DispatchPagination";
import AssignDispatchModal from "../admin/components/dispatch/AssignDispatchModal";
import UpdateDispatchStatusModal from "../admin/components/dispatch/UpdateDispatchStatusModal";

import {
  assignAdminDispatch,
  getAdminDispatches,
  updateAdminDispatchStatus,
} from "../admin/services/adminDispatch.service";

import type {
  AssignDispatchInput,
  DeliveryPartner,
  DispatchOrder,
  DispatchQuery,
  DispatchResponse,
  DispatchStatus,
} from "../admin/types/dispatch.types";

const initialQuery: DispatchQuery = {
  search: "",
  status: "all",
  partner: "all",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 5,
};

const emptyResponse: DispatchResponse = {
  dispatches: [],
  summary: {
    pending: 0,
    dispatched: 0,
    inTransit: 0,
    delivered: 0,
    total: 0,
  },
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },
};

const nextStatus: Partial<Record<DispatchStatus, DispatchStatus>> = {
  dispatched: "in_transit",
  in_transit: "delivered",
};

const nextStatusLabel: Partial<Record<DispatchStatus, string>> = {
  dispatched: "Mark as In Transit",
  in_transit: "Mark as Delivered",
};

export default function DispatchPage() {
  const [query, setQuery] = useState<DispatchQuery>(initialQuery);
  const [data, setData] = useState<DispatchResponse>(emptyResponse);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(
    null,
  );

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatusDispatch, setSelectedStatusDispatch] =
    useState<DispatchOrder | null>(null);

  const loadDispatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminDispatches(query);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dispatch records.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadDispatches();
  }, [loadDispatches]);

  function updateQuery<K extends keyof DispatchQuery>(
    key: K,
    value: DispatchQuery[K],
  ) {
    setQuery((current) => ({
      ...current,
      [key]: value,
      ...(key === "page" ? {} : { page: 1 }),
    }));
  }

  function openAssignment(order?: DispatchOrder) {
    setSelectedOrder(order ?? null);
    setAssignOpen(true);
  }

  async function handleAssign(input: AssignDispatchInput) {
    setSaving(true);

    try {
      await assignAdminDispatch(input);

      setAssignOpen(false);
      setSelectedOrder(null);
      setNotice("Dispatch assigned successfully in demo mode.");

      await loadDispatches();
    } finally {
      setSaving(false);
    }
  }

  // Opens our custom status modal instead of the browser popup.
  function openStatusModal(dispatch: DispatchOrder) {
    setSelectedStatusDispatch(dispatch);
    setStatusModalOpen(true);
  }

  // Performs the actual status update after admin confirmation.
  async function confirmStatusUpdate() {
    if (!selectedStatusDispatch) return;

    const status = nextStatus[selectedStatusDispatch.status];

    if (!status) return;

    setSaving(true);
    setError("");

    try {
      await updateAdminDispatchStatus(selectedStatusDispatch.id, status);

      setStatusModalOpen(false);
      setNotice(
        `${selectedStatusDispatch.orderNumber} updated to ${status.replace("_", " ")}.`,
      );
      setSelectedStatusDispatch(null);

      await loadDispatches();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update dispatch status.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const headers = [
      "Order Number",
      "Customer",
      "Phone",
      "Destination",
      "Delivery Partner",
      "Tracking Number",
      "Status",
      "Dispatched At",
      "Estimated Delivery",
    ];

    const rows = data.dispatches.map((item) => [
      item.orderNumber,
      item.customer.fullName,
      item.customer.phoneNumber,
      `${item.destination.addressLine}, ${item.destination.city}, ${item.destination.state}, ${item.destination.country}`,
      item.deliveryPartner ?? "",
      item.trackingNumber ?? "",
      item.status,
      item.dispatchedAt ?? "",
      item.estimatedDelivery ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ogim-dispatches.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const pendingOrders = data.dispatches.filter(
    (item) => item.status === "pending",
  );

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-[var(--color-muted)]"
      >
        <Link to="/admin" className="hover:text-[var(--color-accent)]">
          Dashboard
        </Link>

        <FiChevronRight size={13} />

        <span className="font-semibold text-[var(--color-ink)]">Dispatch</span>
      </nav>

      {/* Heading */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-ink)] sm:text-4xl">
          Dispatch Management
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
          Assign orders to delivery partners and update dispatch status.
        </p>
      </div>

      {/* Summary */}
      <DispatchStats summary={data.summary} />

      {/* Main dispatch panel */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        <DispatchTabs
          value={query.status}
          summary={data.summary}
          onChange={(value) => updateQuery("status", value)}
        />

        <div className="p-3 sm:p-4">
          <DispatchToolbar
            search={query.search}
            partner={query.partner}
            status={query.status}
            onSearchChange={(value) => updateQuery("search", value)}
            onPartnerChange={(value: DeliveryPartner | "all") =>
              updateQuery("partner", value)
            }
            onStatusChange={(value) => updateQuery("status", value)}
            onExport={handleExport}
            onAssign={() => openAssignment()}
          />
        </div>

        {notice && (
          <div
            role="status"
            className="mx-3 mb-3 flex items-start justify-between gap-3 rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] px-4 py-3 sm:mx-4"
          >
            <p className="text-xs leading-5 text-[var(--color-success)]">
              {notice}
            </p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="shrink-0 text-xs font-bold text-[var(--color-success)]"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mx-3 mb-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-4 py-3 sm:mx-4"
          >
            <p className="text-xs text-[var(--color-error)]">{error}</p>
            <button
              type="button"
              onClick={() => void loadDispatches()}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--color-error)]"
            >
              <FiRefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 p-4" role="status">
            <span className="sr-only">Loading dispatches...</span>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-[var(--color-surface-muted)]"
              />
            ))}
          </div>
        ) : (
          <>
            <DispatchTable
              dispatches={data.dispatches}
              onAssign={openAssignment}
              onUpdateStatus={openStatusModal}
            />

            <div className="p-3 md:hidden">
              <DispatchMobileList
                dispatches={data.dispatches}
                onAssign={openAssignment}
                onUpdateStatus={openStatusModal}
              />
            </div>

            <DispatchPagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(page) => updateQuery("page", page)}
              onLimitChange={(limit) => updateQuery("limit", limit)}
            />
          </>
        )}
      </section>

      {/* Assign dispatch */}
      <AssignDispatchModal
        open={assignOpen}
        orders={pendingOrders}
        selectedOrder={selectedOrder}
        saving={saving}
        onClose={() => {
          setAssignOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleAssign}
      />

      {/* Quick status action */}
      {saving && (
        <span className="sr-only" role="status">
          Saving dispatch changes...
        </span>
      )}

      {/* Status action is handled through the table and mobile list. */}
      <div className="sr-only" aria-live="polite">
        {Object.entries(nextStatusLabel).length} dispatch status actions
        available.
      </div>
      <UpdateDispatchStatusModal
        open={statusModalOpen}
        dispatch={selectedStatusDispatch}
        nextStatus={
          selectedStatusDispatch
            ? (nextStatus[selectedStatusDispatch.status] ?? null)
            : null
        }
        saving={saving}
        onClose={() => {
          if (saving) return;

          setStatusModalOpen(false);
          setSelectedStatusDispatch(null);
        }}
        onConfirm={confirmStatusUpdate}
      />
    </div>
  );
}
