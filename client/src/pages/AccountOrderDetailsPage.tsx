import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiDownload,
  FiMapPin,
  FiPackage,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";

import AccountLayout from "../components/account/AccountLayout";
import AccountMobileMenu from "../components/account/AccountMobileMenu";
import {
  orders,
  formatNaira,
  getOrderSubtotal,
  getOrderTotal,
  type CustomerOrder,
  type OrderStatus,
} from "../data/orders";

const statusClasses: Record<OrderStatus, string> = {
  Delivered: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  Processing: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  Shipped: "bg-sky-100 text-sky-700",
  Cancelled: "bg-[var(--color-stone)] text-[var(--color-muted)]",
};

const progressSteps = ["Order placed", "Processing", "Shipped", "Delivered"];

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

function OrderTimeline({ order }: { order: CustomerOrder }) {
  if (order.status === "Cancelled") {
    return (
      <div className="rounded-[var(--radius-control)] bg-[var(--color-error-soft)] p-4">
        <p className="text-sm font-semibold text-[var(--color-error)]">
          This order was cancelled
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
          Shipping progress is unavailable for a cancelled order. Contact
          support if you need help with this purchase.
        </p>
        <Link
          to="/contact"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-error)] hover:underline"
        >
          Contact support
          <FiChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const currentStep =
    order.status === "Delivered" ? 3 : order.status === "Shipped" ? 2 : 1;

  return (
    <div className="grid grid-cols-4 gap-2">
      {progressSteps.map((step, index) => {
        const complete = index <= currentStep;
        const event = order.timeline?.find((entry) => entry.label === step);

        return (
          <div key={step} className="min-w-0">
            <div
              className={`relative mb-3 grid h-7 w-7 place-items-center rounded-full ${
                complete
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-stone)] text-[var(--color-muted)]"
              }`}
            >
              {complete ? (
                <FiCheck size={15} aria-hidden="true" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}

              {index < progressSteps.length - 1 && (
                <span
                  className={`absolute left-full top-1/2 h-0.5 w-[calc(100%+0.5rem)] -translate-y-1/2 ${
                    index < currentStep
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-border)]"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>

            <p className="text-[10px] font-semibold leading-4 text-[var(--color-ink)] sm:text-xs">
              {step}
            </p>
            <p className="mt-1 hidden text-[10px] leading-4 text-[var(--color-muted)] sm:block">
              {event?.date ?? (complete ? "Completed" : "Pending")}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function OrderItemRow({ item }: { item: CustomerOrder["items"][number] }) {
  const conditionClasses = {
    "Brand New": "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    "UK-Used": "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
    Refurbished: "bg-sky-100 text-sky-700",
  };

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="grid h-[62px] w-[54px] shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-paper)]">
        <FiSmartphone
          size={30}
          className="text-[var(--color-ink)]"
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--color-ink)] sm:text-sm">
          {item.name}
        </p>
        <p className="mt-1 text-[10px] leading-4 text-[var(--color-muted)] sm:text-xs">
          {item.variant}
        </p>
        <span
          className={`mt-1.5 inline-flex rounded px-1.5 py-0.5 text-[9px] font-semibold ${conditionClasses[item.condition]}`}
        >
          {item.condition}
        </span>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-bold text-[var(--color-ink)] sm:text-sm">
          {formatNaira(item.price * item.quantity)}
        </p>
        <p className="mt-1 text-[10px] text-[var(--color-muted)]">
          Qty: {item.quantity}
        </p>
      </div>
    </div>
  );
}

function OrderSummary({ order }: { order: CustomerOrder }) {
  return (
    <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-[var(--color-muted)]">Subtotal</span>
        <span className="font-medium text-[var(--color-ink)]">
          {formatNaira(getOrderSubtotal(order))}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-[var(--color-muted)]">Delivery</span>
        <span className="font-medium text-[var(--color-ink)]">
          {order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
        <span className="text-sm font-bold text-[var(--color-ink)]">
          Total paid
        </span>
        <span className="text-lg font-bold tracking-tight text-[var(--color-ink)] sm:text-xl">
          {formatNaira(getOrderTotal(order))}
        </span>
      </div>
    </div>
  );
}

function OrderDetailsContent({ order }: { order: CustomerOrder }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <header>
        <div className="mb-3 flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <Link
            to="/account/orders"
            className="hover:text-[var(--color-accent)]"
          >
            My orders
          </Link>
          <FiChevronRight size={13} aria-hidden="true" />
          <span className="font-medium text-[var(--color-ink)]">
            {order.id}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-ink)] sm:text-2xl">
              Order {order.id}
            </h1>
            <p className="mt-1 text-xs text-[var(--color-muted)] sm:text-sm">
              Placed on {order.date}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3 py-2.5 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] sm:inline-flex"
            >
              <FiDownload size={14} aria-hidden="true" />
              Print invoice
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-5">
        <h2 className="mb-5 text-sm font-bold text-[var(--color-ink)]">
          Order progress
        </h2>
        <OrderTimeline order={order} />
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-bold text-[var(--color-ink)]">
          Delivery information
        </h2>

        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <FiMapPin size={19} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-ink)]">
              {order.customerName}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {order.customerPhone}
            </p>
            <address className="mt-2 text-xs not-italic leading-5 text-[var(--color-muted)]">
              {order.deliveryAddress.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 border-t border-[var(--color-border)] pt-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-paper)] text-[var(--color-ink)]">
            <FiTruck size={19} aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--color-ink)]">
              {order.deliveryMethod ?? "Standard delivery"}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
              {order.status === "Delivered"
                ? `Delivered on ${order.estimatedDelivery}`
                : order.status === "Cancelled"
                  ? "Delivery cancelled"
                  : order.estimatedDelivery === "Pending confirmation"
                    ? "Delivery date to be confirmed"
                    : `Estimated delivery: ${order.estimatedDelivery}`}
            </p>
          </div>
        </div>

        {order.status !== "Cancelled" && (
          <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-paper)] p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
              Tracking reference
            </p>
            <p className="mt-1 break-all text-xs font-semibold text-[var(--color-ink)]">
              {order.trackingNumber}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-5">
        <div className="mb-1 flex items-center gap-2">
          <FiPackage
            size={17}
            className="text-[var(--color-muted)]"
            aria-hidden="true"
          />
          <h2 className="text-sm font-bold text-[var(--color-ink)]">
            Order items (
            {order.items.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </div>

        <OrderSummary order={order} />
      </section>

      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] sm:hidden"
      >
        <FiDownload size={16} aria-hidden="true" />
        Print / save invoice
      </button>

      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:underline"
      >
        <FiArrowLeft size={16} aria-hidden="true" />
        Back to my orders
      </Link>
    </div>
  );
}

export default function AccountOrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const order = orders.find(
    (item) => item.id.toLowerCase() === orderId?.toLowerCase(),
  );

  return (
    <AccountLayout>
      <div className="space-y-5">
        <AccountMobileMenu />

        {order ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <OrderDetailsContent order={order} />
          </motion.div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-paper)]">
              <FiPackage
                size={25}
                className="text-[var(--color-muted)]"
                aria-hidden="true"
              />
            </span>

            <h1 className="mt-4 text-lg font-bold text-[var(--color-ink)]">
              Order not found
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
              We couldn&apos;t find that order. Check the order reference or
              return to your order history.
            </p>

            <Link
              to="/account/orders"
              className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
            >
              <FiArrowLeft size={16} aria-hidden="true" />
              Back to my orders
            </Link>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
