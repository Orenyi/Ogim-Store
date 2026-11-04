import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCopy,
  FiPrinter,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { useState } from "react";

import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

import type { AdminOrder } from "../../types/orders.types";

type Props = {
  order: AdminOrder;
  onUpdateStatus: () => void;
};

export default function OrderDetailHeader({ order, onUpdateStatus }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyOrderNumber() {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function printOrder() {
    window.print();
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)] sm:p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <Link
            to="/admin/orders"
            aria-label="Back to orders"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            <FiArrowLeft size={19} />
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate font-heading text-xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-2xl">
              {order.orderNumber}
            </h2>

            <button
              type="button"
              onClick={copyOrderNumber}
              aria-label="Copy order number"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-accent)]"
            >
              {copied ? (
                <FiCheck size={16} className="text-[var(--color-success)]" />
              ) : (
                <FiCopy size={16} />
              )}
            </button>
          </div>

          <PaymentStatusBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.fulfilmentStatus} />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={printOrder}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-3 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] sm:px-4"
          >
            <FiPrinter size={16} />
            Print Order
          </button>

          <button
            type="button"
            onClick={onUpdateStatus}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] sm:px-4"
          >
            Update Status
            <FiChevronDown size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
