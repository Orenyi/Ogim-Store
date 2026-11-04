import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiChevronRight, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import OrderDetailHeader from "../admin/components/orders/OrderDetailHeader";
import OrderSummaryCard from "../admin/components/orders/OrderSummaryCard";
import CustomerInfoCard from "../admin/components/orders/CustomerInfoCard";
import DeliveryInfoCard from "../admin/components/orders/DeliveryInfoCard";
import OrderItemsCard from "../admin/components/orders/OrderItemsCard";
import PaymentInfoCard from "../admin/components/orders/PaymentInfoCard";
import OrderTotalCard from "../admin/components/orders/OrderTotalCard";
import FulfilmentTimeline from "../admin/components/orders/FulfilmentTimeline";
import OrderStatusModal from "../admin/components/orders/OrderStatusModal";

import { getAdminOrderById } from "../admin/services/adminOrders.service";

import type {
  AdminOrder,
  OrderFulfilmentStatus,
} from "../admin/types/orders.types";

export default function AdminOrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError("An order ID was not provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getAdminOrderById(orderId);
      setOrder(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load order details.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  function handleStatusUpdate(status: OrderFulfilmentStatus) {
    if (!order) return;

    const isDemoMode = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

    if (!isDemoMode) {
      setNotice(
        "Order status updates will be available when the admin API is connected.",
      );
      setStatusModalOpen(false);
      return;
    }

    const updatedAt = new Date().toISOString();

    setOrder((current) => {
      if (!current) return current;

      return {
        ...current,
        fulfilmentStatus: status,
        updatedAt,
      };
    });

    setStatusModalOpen(false);
    setNotice(
      "Demo fulfilment status updated locally. This change has not been saved to the database.",
    );
  }

  if (loading) {
    return (
      <div className="space-y-5" role="status">
        <span className="sr-only">Loading order details...</span>
        <div className="h-5 w-48 animate-pulse rounded bg-[var(--color-surface-muted)]" />
        <div className="h-20 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]" />
          <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-muted)]" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-5 text-center">
        <FiAlertCircle size={30} className="text-[var(--color-error)]" />

        <h1 className="mt-4 font-heading text-xl font-extrabold text-[var(--color-ink)]">
          Order not found
        </h1>

        <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
          {error || "We couldn't find the requested order."}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => void loadOrder()}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-xs font-semibold hover:bg-[var(--color-surface-muted)]"
          >
            <FiRefreshCw size={14} />
            Try again
          </button>

          <Link
            to="/admin/orders"
            className="inline-flex h-10 items-center rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-xs font-semibold text-white"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6 sm:space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]"
      >
        <Link to="/admin" className="hover:text-[var(--color-accent)]">
          Dashboard
        </Link>
        <FiChevronRight size={13} />

        <Link to="/admin/orders" className="hover:text-[var(--color-accent)]">
          Orders
        </Link>
        <FiChevronRight size={13} />

        <span className="font-semibold text-[var(--color-ink)]">
          Order Details
        </span>
      </nav>

      {/* Heading */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-[-0.05em] text-[var(--color-ink)] sm:text-4xl">
          Order Details
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
          View full order information, payment, items and delivery details.
        </p>
      </div>

      {/* Order actions */}
      <OrderDetailHeader
        order={order}
        onUpdateStatus={() => setStatusModalOpen(true)}
      />

      {/* Local demo notice */}
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
            className="shrink-0 text-xs font-semibold text-[var(--color-accent)]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.58fr)]">
        {/* Left column */}
        <div className="flex min-w-0 flex-col gap-4">
          <OrderSummaryCard order={order} />
          <CustomerInfoCard order={order} />
          <DeliveryInfoCard order={order} />
        </div>

        {/* Right column */}
        <div className="flex min-w-0 flex-col gap-4">
          <OrderItemsCard order={order} />
          <PaymentInfoCard order={order} />
          <OrderTotalCard order={order} />
          <FulfilmentTimeline order={order} />
        </div>
      </div>

      <OrderStatusModal
        order={statusModalOpen ? order : null}
        onClose={() => setStatusModalOpen(false)}
        onSave={handleStatusUpdate}
      />
    </div>
  );
}
