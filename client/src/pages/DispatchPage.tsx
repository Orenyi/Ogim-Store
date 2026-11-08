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
  getEligibleDispatchOrders,
  updateAdminDispatchStatus,
} from "../admin/services/adminDispatch.service";

import type {
  AssignDispatchInput,
  DeliveryPartner,
  DispatchOrder,
  DispatchQuery,
  DispatchResponse,
  DispatchStatus,
  EligibleDispatchOrder,
} from "../admin/types/dispatch.types";

// ============================================
// INITIAL DATA
// ============================================

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

// ============================================
// STATUS CONFIGURATION
// ============================================

const nextStatus: Partial<Record<DispatchStatus, DispatchStatus>> = {
  dispatched: "in_transit",
  in_transit: "delivered",
};

const nextStatusLabel: Partial<Record<DispatchStatus, string>> = {
  dispatched: "Mark as In Transit",
  in_transit: "Mark as Delivered",
};

// ============================================
// PAGE
// ============================================

export default function DispatchPage() {
  // ------------------------------------------
  // DISPATCH DATA
  // ------------------------------------------

  const [query, setQuery] = useState<DispatchQuery>(initialQuery);
  const [data, setData] = useState<DispatchResponse>(emptyResponse);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ------------------------------------------
  // ELIGIBLE ORDERS
  // ------------------------------------------

  const [eligibleOrders, setEligibleOrders] = useState<EligibleDispatchOrder[]>(
    [],
  );

  const [eligibleOrdersLoading, setEligibleOrdersLoading] = useState(false);
  const [eligibleOrdersError, setEligibleOrdersError] = useState("");

  // ------------------------------------------
  // ASSIGN DISPATCH MODAL
  // ------------------------------------------

  const [assignOpen, setAssignOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<EligibleDispatchOrder | null>(null);

  // ------------------------------------------
  // STATUS MODAL
  // ------------------------------------------

  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [selectedStatusDispatch, setSelectedStatusDispatch] =
    useState<DispatchOrder | null>(null);

  // ============================================
  // LOAD DISPATCH RECORDS
  // ============================================

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

  // ============================================
  // LOAD ELIGIBLE ORDERS
  // ============================================

  const loadEligibleOrders = useCallback(async () => {
    setEligibleOrdersLoading(true);
    setEligibleOrdersError("");

    try {
      const orders = await getEligibleDispatchOrders();

      setEligibleOrders(orders);
    } catch (err) {
      setEligibleOrdersError(
        err instanceof Error ? err.message : "Unable to load eligible orders.",
      );
    } finally {
      setEligibleOrdersLoading(false);
    }
  }, []);

  // ============================================
  // QUERY MANAGEMENT
  // ============================================

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

  // ============================================
  // OPEN ASSIGNMENT MODAL
  // ============================================

  function openAssignment(order?: EligibleDispatchOrder) {
    setSelectedOrder(order ?? null);
    setAssignOpen(true);

    void loadEligibleOrders();
  }

  // ============================================
  // CLOSE ASSIGNMENT MODAL
  // ============================================

  function closeAssignment() {
    if (saving) return;

    setAssignOpen(false);
    setSelectedOrder(null);
    setEligibleOrdersError("");
  }

  // ============================================
  // ASSIGN DISPATCH
  // ============================================

  async function handleAssign(input: AssignDispatchInput) {
    setSaving(true);
    setError("");

    try {
      await assignAdminDispatch(input);

      setAssignOpen(false);
      setSelectedOrder(null);

      setNotice("Dispatch assigned successfully.");

      // Refresh dispatch records and eligible orders.
      await Promise.all([loadDispatches(), loadEligibleOrders()]);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Unable to assign dispatch.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // OPEN STATUS MODAL
  // ============================================

  function openStatusModal(dispatch: DispatchOrder) {
    setSelectedStatusDispatch(dispatch);
    setStatusModalOpen(true);
  }

  // ============================================
  // CONFIRM STATUS UPDATE
  // ============================================

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

  // ============================================
  // EXPORT DISPATCHES
  // ============================================

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

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      {/* BREADCRUMB */}
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

      {/* HEADING */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-ink)] sm:text-4xl">
          Dispatch Management
        </h1>

        <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
          Assign orders to delivery partners and update dispatch status.
        </p>
      </div>

      {/* SUMMARY */}
      <DispatchStats summary={data.summary} />

      {/* MAIN DISPATCH PANEL */}
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        {/* STATUS TABS */}
        <DispatchTabs
          value={query.status}
          summary={data.summary}
          onChange={(value) => updateQuery("status", value)}
        />

        {/* TOOLBAR */}
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

        {/* SUCCESS NOTICE */}
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

        {/* ERROR NOTICE */}
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

        {/* DISPATCH CONTENT */}
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
            {/* DESKTOP TABLE */}
            <DispatchTable
              dispatches={data.dispatches}
              onAssign={() => openAssignment()}
              onUpdateStatus={openStatusModal}
            />

            {/* MOBILE LIST */}
            <div className="p-3 md:hidden">
              <DispatchMobileList
                dispatches={data.dispatches}
                onAssign={() => openAssignment()}
                onUpdateStatus={openStatusModal}
              />
            </div>

            {/* PAGINATION */}
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

      {/* ========================================
          ASSIGN DISPATCH MODAL
      ======================================== */}

      <AssignDispatchModal
        open={assignOpen}
        orders={eligibleOrders}
        selectedOrder={selectedOrder}
        saving={saving}
        onClose={closeAssignment}
        onSubmit={handleAssign}
      />

      {/* ELIGIBLE ORDERS LOADING AND ERROR */}
      {assignOpen && (
        <div className="sr-only" role="status" aria-live="polite">
          {eligibleOrdersLoading
            ? "Loading eligible orders."
            : `${eligibleOrders.length} eligible orders available.`}
        </div>
      )}

      {assignOpen && eligibleOrdersError && (
        <div
          role="alert"
          className="fixed bottom-4 left-4 right-4 z-[var(--z-toast)] flex items-center justify-between gap-3 rounded-xl border border-[var(--color-error)]/20 bg-white p-4 shadow-lg sm:left-auto sm:right-6 sm:max-w-md"
        >
          <p className="text-xs text-[var(--color-error)]">
            {eligibleOrdersError}
          </p>

          <button
            type="button"
            onClick={() => void loadEligibleOrders()}
            disabled={eligibleOrdersLoading}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--color-accent)] disabled:opacity-50"
          >
            <FiRefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {/* SAVING ANNOUNCEMENT */}
      {saving && (
        <span className="sr-only" role="status">
          Saving dispatch changes...
        </span>
      )}

      {/* STATUS ACTION ANNOUNCEMENT */}
      <div className="sr-only" aria-live="polite">
        {Object.entries(nextStatusLabel).length} dispatch status actions
        available.
      </div>

      {/* ========================================
          UPDATE DISPATCH STATUS MODAL
      ======================================== */}

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
