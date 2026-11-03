import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiDownload,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";

import AccountLayout from "../components/account/AccountLayout";
import AccountMobileMenu from "../components/account/AccountMobileMenu";

import {
  ApiError,
  getCustomerOrderById,
  type OrderApiRecord,
} from "../lib/api";

import {
  formatNaira,
  type CustomerOrder,
  type OrderStatus,
  type ProductCondition,
  type PaymentStatus,
} from "../data/orders";

// ============================================
// TYPES
// ============================================

type PageStatus = "loading" | "success" | "error" | "not-found";

// ============================================
// STATUS STYLES
// ============================================

const statusClasses: Record<OrderStatus, string> = {
  Delivered: "bg-[var(--color-success-soft)] text-[var(--color-success)]",

  Processing: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",

  Shipped: "bg-sky-100 text-sky-700",

  Cancelled: "bg-[var(--color-stone)] text-[var(--color-muted)]",
};

const paymentStatusClasses: Record<PaymentStatus, string> = {
  Paid: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  Pending: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  Failed: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  Refunded: "bg-sky-100 text-sky-700",
};

const progressSteps = ["Order placed", "Processing", "Shipped", "Delivered"];

// ============================================
// DATE FORMATTING
// ============================================

function formatOrderDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

// ============================================
// ORDER STATUS MAPPING
// ============================================

function mapOrderStatus(status: OrderApiRecord["status"]): OrderStatus {
  switch (status) {
    case "fulfilled":
      return "Delivered";

    case "cancelled":
    case "expired":
      return "Cancelled";

    case "confirmed":
    case "pending":
    default:
      return "Processing";
  }
}

// ============================================
// PRODUCT CONDITION MAPPING
// ============================================

function mapProductCondition(
  condition: OrderApiRecord["items"][number]["condition"],
): ProductCondition {
  switch (condition) {
    case "brand-new":
      return "Brand New";

    case "uk-used":
      return "UK-Used";

    case "refurbished":
      return "Refurbished";
  }
}

// ============================================
// PAYMENT STATUS MAPPING
// ============================================

function mapPaymentStatus(
  status: OrderApiRecord["paymentStatus"],
): PaymentStatus {
  switch (status) {
    case "paid":
      return "Paid";

    case "failed":
      return "Failed";

    case "refunded":
      return "Refunded";

    case "pending":
    default:
      return "Pending";
  }
}

// ============================================
// DELIVERY METHOD MAPPING
// ============================================

function mapDeliveryMethod(method: OrderApiRecord["deliveryMethod"]): string {
  switch (method) {
    case "express":
      return "Express Delivery";

    case "same-day":
      return "Same-day Delivery";

    case "standard":
    default:
      return "Standard Delivery";
  }
}

// ============================================
// ORDER TIMELINE
// ============================================

function createOrderTimeline(order: OrderApiRecord): CustomerOrder["timeline"] {
  const placedDate = formatOrderDate(order.createdAt);

  if (order.status === "cancelled" || order.status === "expired") {
    return [
      {
        label: "Order placed",
        description: "Your order was received.",
        date: placedDate,
        completed: true,
      },
      {
        label: "Cancelled",
        description:
          order.status === "expired"
            ? "The order reservation expired before payment was completed."
            : "This order was cancelled.",
        date: formatOrderDate(order.updatedAt),
        completed: true,
      },
    ];
  }

  const isConfirmed =
    order.status === "confirmed" || order.status === "fulfilled";

  const isFulfilled = order.status === "fulfilled";

  return [
    {
      label: "Order placed",
      description: "Your order was successfully received.",
      date: placedDate,
      completed: true,
    },
    {
      label: "Processing",
      description: isConfirmed
        ? "Your order has been confirmed."
        : "Your order is awaiting confirmation.",
      date: isConfirmed ? formatOrderDate(order.updatedAt) : undefined,
      completed: isConfirmed,
    },
    {
      label: "Shipped",
      description: "Awaiting dispatch information.",
      completed: false,
    },
    {
      label: "Delivered",
      description: isFulfilled
        ? "Your order has been fulfilled."
        : "Awaiting delivery.",
      date: isFulfilled ? formatOrderDate(order.updatedAt) : undefined,
      completed: isFulfilled,
    },
  ];
}

// ============================================
// BACKEND ORDER ADAPTER
// ============================================

function mapOrderToCustomerOrder(order: OrderApiRecord): CustomerOrder {
  return {
    // Keep the MongoDB ID here because it is used by the detail route.
    id: order._id,

    createdAt: order.createdAt,

    date: formatOrderDate(order.createdAt),

    status: mapOrderStatus(order.status),

    items: order.items.map((item) => ({
      id: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image || undefined,

      variant: [item.brand, item.model].filter(Boolean).join(" "),

      condition: mapProductCondition(item.condition),

      price: item.unitPrice,

      quantity: item.quantity,
    })),

    deliveryFee: order.deliveryFee,

    customerName: order.deliveryAddress.fullName,

    customerPhone: order.deliveryAddress.phone,

    deliveryAddress: [
      order.deliveryAddress.address,
      [order.deliveryAddress.city, order.deliveryAddress.state]
        .filter(Boolean)
        .join(", "),
    ].filter(Boolean),

    deliveryMethod: mapDeliveryMethod(order.deliveryMethod),

    estimatedDelivery: "",

    trackingNumber: "",

    paymentMethod: "Paystack",

    paymentStatus: mapPaymentStatus(order.paymentStatus),

    timeline: createOrderTimeline(order),
  };
}

// ============================================
// ERROR MESSAGE
// ============================================

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Your session may have expired. Please sign in again.";
    }

    if (error.status === 404) {
      return "We couldn't find this order in your account.";
    }

    return error.message;
  }

  return "Unable to load this order. Please try again.";
}

// ============================================
// ORDER STATUS BADGE
// ============================================

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

// ============================================
// PAYMENT STATUS BADGE
// ============================================

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${paymentStatusClasses[status]}`}
    >
      {status}
    </span>
  );
}

// ============================================
// ORDER TIMELINE COMPONENT
// ============================================

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
        const event = order.timeline.find((entry) => entry.label === step);

        const complete = event?.completed ?? index <= currentStep;

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
                    complete && event?.completed
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

// ============================================
// ORDER ITEM ROW
// ============================================

function OrderItemRow({ item }: { item: CustomerOrder["items"][number] }) {
  const conditionClasses: Record<ProductCondition, string> = {
    "Brand New": "bg-[var(--color-success-soft)] text-[var(--color-success)]",

    "UK-Used": "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",

    Refurbished: "bg-sky-100 text-sky-700",
  };

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="grid h-[62px] w-[54px] shrink-0 place-items-center overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-paper)]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <FiSmartphone
            size={30}
            className="text-[var(--color-ink)]"
            aria-hidden="true"
          />
        )}
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

// ============================================
// ORDER SUMMARY
// ============================================

function OrderSummary({
  order,
  subtotal,
}: {
  order: CustomerOrder;
  subtotal: number;
}) {
  const total = subtotal + order.deliveryFee;

  return (
    <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-[var(--color-muted)]">Subtotal</span>

        <span className="font-medium text-[var(--color-ink)]">
          {formatNaira(subtotal)}
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
          Order total
        </span>

        <span className="text-lg font-bold tracking-tight text-[var(--color-ink)] sm:text-xl">
          {formatNaira(total)}
        </span>
      </div>
    </div>
  );
}

// ============================================
// ORDER DETAILS CONTENT
// ============================================

function OrderDetailsContent({
  order,
  orderNumber,
}: {
  order: CustomerOrder;
  orderNumber: string;
}) {
  const subtotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const paymentLabel =
    order.paymentStatus === "Paid"
      ? "Payment completed successfully."
      : order.paymentStatus === "Pending"
        ? "Payment is awaiting confirmation."
        : order.paymentStatus === "Refunded"
          ? "This payment has been refunded."
          : "Payment was unsuccessful.";

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Order heading */}
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
            {orderNumber}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-ink)] sm:text-2xl">
              Order {orderNumber}
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

      {/* Order progress */}
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-5">
        <h2 className="mb-5 text-sm font-bold text-[var(--color-ink)]">
          Order progress
        </h2>

        <OrderTimeline order={order} />
      </section>

      {/* Delivery information */}
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
              {order.deliveryAddress.map((line, index) => (
                <span key={`${line}-${index}`} className="block">
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
              {order.deliveryMethod}
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
              {order.status === "Delivered"
                ? "Your order has been fulfilled."
                : order.status === "Cancelled"
                  ? "Delivery was cancelled."
                  : "Delivery date and dispatch information will be updated when available."}
            </p>
          </div>
        </div>

        {order.trackingNumber && (
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

      {/* Order items */}
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-5">
        <div className="mb-1 flex items-center gap-2">
          <FiPackage
            size={17}
            className="text-[var(--color-muted)]"
            aria-hidden="true"
          />

          <h2 className="text-sm font-bold text-[var(--color-ink)]">
            Order items ({itemCount})
          </h2>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </div>

        <OrderSummary order={order} subtotal={subtotal} />
      </section>

      {/* Payment information */}
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-bold text-[var(--color-ink)]">
          Payment information
        </h2>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[var(--color-ink)]">
              Paystack
            </p>

            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {paymentLabel}
            </p>
          </div>

          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </section>

      {/* Print invoice - mobile */}
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

// ============================================
// ORDER DETAILS PAGE
// ============================================

export default function AccountOrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<CustomerOrder | null>(null);

  const [orderNumber, setOrderNumber] = useState("");

  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");

  const [errorMessage, setErrorMessage] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  // ============================================
  // FETCH ORDER FROM BACKEND
  // ============================================

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderId) {
        setPageStatus("not-found");
        return;
      }

      setPageStatus("loading");
      setErrorMessage("");

      try {
        const response = await getCustomerOrderById(orderId);

        if (!isMounted) return;

        const apiOrder = response.data.order;

        setOrder(mapOrderToCustomerOrder(apiOrder));
        setOrderNumber(apiOrder.orderNumber);

        setPageStatus("success");
      } catch (error: unknown) {
        if (!isMounted) return;

        console.error("Order details error:", error);

        if (error instanceof ApiError && error.status === 404) {
          setPageStatus("not-found");
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setPageStatus("error");
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, retryKey]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AccountLayout>
      <div className="space-y-5">
        <AccountMobileMenu />

        {pageStatus === "loading" && (
          <div className="space-y-4" aria-label="Loading order details">
            <div className="h-20 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-stone)]" />

            <div className="h-36 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-stone)]" />

            <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-stone)]" />

            <div className="h-48 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-stone)]" />
          </div>
        )}

        {pageStatus === "success" && order && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <OrderDetailsContent order={order} orderNumber={orderNumber} />
          </motion.div>
        )}

        {pageStatus === "error" && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-paper)]">
              <FiPackage
                size={25}
                className="text-[var(--color-muted)]"
                aria-hidden="true"
              />
            </span>

            <h1 className="mt-4 text-lg font-bold text-[var(--color-ink)]">
              Unable to load order
            </h1>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
            >
              <FiRefreshCw size={15} aria-hidden="true" />
              Try again
            </button>

            <Link
              to="/account/orders"
              className="mt-4 text-sm font-semibold text-[var(--color-accent)] hover:underline"
            >
              Back to my orders
            </Link>
          </div>
        )}

        {pageStatus === "not-found" && (
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
              We couldn&apos;t find that order in your account. Check the order
              reference or return to your order history.
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
