import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiMapPin,
  FiShoppingBag,
  FiShoppingCart,
  FiRefreshCw,
  FiTrash2,
  FiAlertTriangle,
  FiX,
  FiLoader,
  FiShield,
} from "react-icons/fi";

import AccountLayout from "../components/account/AccountLayout";
import AccountMobileMenu from "../components/account/AccountMobileMenu";
import AccountStatCard from "../components/account/AccountStatCard";
import RecentOrderCard from "../components/account/RecentOrderCard";

import { useAuth } from "../context/AuthContext";

import {
  ApiError,
  getCart,
  getCustomerOrders,
  deleteCustomerAccount,
  type OrderApiRecord,
} from "../lib/api";

import type {
  CustomerOrder,
  ProductCondition,
  PaymentStatus,
} from "../data/orders";

// ============================================
// TYPES
// ============================================

interface DashboardData {
  orders: CustomerOrder[];
  totalOrders: number;
  cartItems: number;
}

type DashboardStatus = "loading" | "success" | "error";

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
  }).format(parsedDate);
}

// ============================================
// ORDER STATUS MAPPING
// ============================================

function mapOrderStatus(
  status: OrderApiRecord["status"],
): CustomerOrder["status"] {
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
// ORDER TIMELINE MAPPING
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

  return [
    {
      label: "Order placed",
      description: "Your order was successfully received.",
      date: placedDate,
      completed: true,
    },
    {
      label: "Processing",
      description:
        order.status === "confirmed" || order.status === "fulfilled"
          ? "Your order has been confirmed."
          : "Your order is awaiting confirmation.",
      date:
        order.status === "confirmed" || order.status === "fulfilled"
          ? formatOrderDate(order.updatedAt)
          : undefined,
      completed: order.status === "confirmed" || order.status === "fulfilled",
    },
    {
      label: "Shipped",
      description: "Awaiting dispatch information.",
      completed: false,
    },
    {
      label: "Delivered",
      description:
        order.status === "fulfilled"
          ? "Your order has been fulfilled."
          : "Awaiting delivery.",
      date:
        order.status === "fulfilled"
          ? formatOrderDate(order.updatedAt)
          : undefined,
      completed: order.status === "fulfilled",
    },
  ];
}

// ============================================
// BACKEND ORDER ADAPTER
// ============================================

function mapOrderToCustomerOrder(order: OrderApiRecord): CustomerOrder {
  return {
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
    estimatedDelivery: "Pending confirmation",
    trackingNumber: "",
    paymentMethod: "Paystack",
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    timeline: createOrderTimeline(order),
  };
}

// ============================================
// SECTION HEADING
// ============================================

function SectionHeading({
  title,
  actionLabel,
  actionTo,
}: {
  title: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold tracking-tight text-[var(--color-ink)] sm:text-lg">
        {title}
      </h2>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] sm:text-sm"
        >
          {actionLabel}
          <FiArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

// ============================================
// ERROR MESSAGE
// ============================================

function getDashboardErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Your session may have expired. Please sign in again.";
    }

    return error.message;
  }

  return "Unable to load your account information. Please try again.";
}

// ============================================
// ACCOUNT DELETION MODAL
// ============================================

function DeleteAccountModal({
  onClose,
  onConfirm,
  isDeleting,
  errorMessage,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  errorMessage: string;
}) {
  const [confirmation, setConfirmation] = useState("");

  const canDelete = confirmation.trim() === "DELETE" && !isDeleting;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, isDeleting]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[var(--color-ink)]/60 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
        className="my-auto w-full max-w-[460px] overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-white)] shadow-2xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-error-soft)] text-[var(--color-error)]">
              <FiTrash2 size={17} aria-hidden="true" />
            </div>

            <span className="text-sm font-bold text-[var(--color-ink)]">
              Account deletion
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={19} aria-hidden="true" />
          </button>
        </div>

        {/* Modal content */}
        <div className="px-5 py-6 sm:px-6 sm:py-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error-soft)] text-[var(--color-error)]">
            <FiAlertTriangle size={23} aria-hidden="true" />
          </div>

          <h2
            id="delete-account-title"
            className="text-xl font-bold tracking-tight text-[var(--color-ink)] sm:text-2xl"
          >
            Are you sure you want to leave Ogim?
          </h2>

          <p
            id="delete-account-description"
            className="mt-2 text-sm leading-6 text-[var(--color-muted)]"
          >
            This action will permanently deactivate your customer account. You
            won&apos;t be able to sign in or access your account again.
          </p>

          {/* Consequences */}
          <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-ink)]">
              Before you continue
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <FiX
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--color-error)]"
                  aria-hidden="true"
                />
                <span className="text-xs leading-5 text-[var(--color-muted)]">
                  Your personal account details will be anonymized.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <FiX
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--color-error)]"
                  aria-hidden="true"
                />
                <span className="text-xs leading-5 text-[var(--color-muted)]">
                  You will lose access to your account, profile and active
                  sessions.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <FiShield
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  aria-hidden="true"
                />
                <span className="text-xs leading-5 text-[var(--color-muted)]">
                  Your existing orders and payment records will be preserved for
                  transaction history.
                </span>
              </li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div className="mt-5">
            <label
              htmlFor="delete-account-confirmation"
              className="mb-2 block text-xs font-semibold text-[var(--color-ink)]"
            >
              Type{" "}
              <span className="font-bold text-[var(--color-error)]">
                DELETE
              </span>{" "}
              to confirm
            </label>

            <input
              id="delete-account-confirmation"
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={isDeleting}
              autoComplete="off"
              spellCheck={false}
              placeholder="Type DELETE here"
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 py-3 text-sm font-semibold tracking-wide text-[var(--color-ink)] outline-none transition-colors placeholder:font-normal placeholder:tracking-normal placeholder:text-[var(--color-muted)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/10 disabled:opacity-60"
            />
          </div>

          {/* API error */}
          {errorMessage && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-3 py-2.5 text-xs leading-5 text-[var(--color-error)]"
            >
              {errorMessage}
            </p>
          )}
        </div>

        {/* Modal actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] bg-[var(--color-paper)]/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep my account
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-error)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                Deleting account...
              </>
            ) : (
              <>
                <FiTrash2 size={15} aria-hidden="true" />
                Delete my account
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

// ============================================
// ACCOUNT OVERVIEW PAGE
// ============================================

export default function AccountOverviewPage() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData>({
    orders: [],
    totalOrders: 0,
    cartItems: 0,
  });

  const [status, setStatus] = useState<DashboardStatus>("loading");

  const [errorMessage, setErrorMessage] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "there";

  // ============================================
  // FETCH CUSTOMER DASHBOARD DATA
  // ============================================

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const [ordersResponse, cartResponse] = await Promise.all([
          getCustomerOrders(),
          getCart(),
        ]);

        if (!isMounted) return;

        const customerOrders = ordersResponse.data.orders.map(
          mapOrderToCustomerOrder,
        );

        const cartItemCount = cartResponse.data.items.reduce(
          (total, item) => total + item.quantity,
          0,
        );

        setDashboard({
          orders: customerOrders,
          totalOrders: ordersResponse.data.total,
          cartItems: cartItemCount,
        });

        setStatus("success");
      } catch (error: unknown) {
        if (!isMounted) return;

        console.error("Account dashboard error:", error);

        setErrorMessage(getDashboardErrorMessage(error));

        setStatus("error");
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [retryKey]);

  // ============================================
  // DELETE CUSTOMER ACCOUNT
  // ============================================

  async function handleDeleteAccount() {
    if (isDeletingAccount) return;

    setIsDeletingAccount(true);
    setDeleteError("");

    try {
      await deleteCustomerAccount();

      // Force a fresh application session after the backend clears
      // authentication cookies and deactivates the customer account.
      window.location.assign("/login");
    } catch (error: unknown) {
      console.error("Account deletion request failed:", error);

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete your account. Please try again.",
      );

      setIsDeletingAccount(false);
    }
  }

  function openDeleteModal() {
    setDeleteError("");
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (isDeletingAccount) return;

    setDeleteError("");
    setIsDeleteModalOpen(false);
  }

  // ============================================
  // ACCOUNT STATISTICS
  // ============================================

  const statistics = [
    {
      label: "Total orders",
      value: dashboard.totalOrders,
      linkLabel: "View orders",
      to: "/account/orders",
      icon: FiShoppingBag,
      iconClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    },
    {
      label: "Cart items",
      value: dashboard.cartItems,
      linkLabel: "View cart",
      to: "/cart",
      icon: FiShoppingCart,
      iconClass: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
    },
    {
      label: "Addresses",
      value: "—",
      linkLabel: "Contact support",
      to: "/contact",
      icon: FiMapPin,
      iconClass: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    },
  ];

  const recentOrders = dashboard.orders.slice(0, 3);

  // ============================================
  // RENDER
  // ============================================

  return (
    <AccountLayout>
      <div className="space-y-6 sm:space-y-7">
        <AccountMobileMenu />

        {/* Page heading */}
        <header>
          <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">
            Your account
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Account overview
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Welcome back, {firstName}! Here&apos;s a quick view of your
            activity.
          </p>
        </header>

        {/* Account statistics */}
        <section aria-label="Account statistics">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {statistics.map((stat, index) => (
              <AccountStatCard key={stat.label} {...stat} index={index} />
            ))}
          </div>
        </section>

        {/* Promotional banner */}
        <section
          aria-label="Shop new phones"
          className="relative isolate overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-accent-soft)]"
        >
          <div className="relative z-10 flex min-h-[170px] items-center p-5 sm:min-h-[190px] sm:p-7">
            <div className="max-w-[65%] sm:max-w-[58%]">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)] sm:text-xs">
                Find your next phone
              </p>

              <h2 className="text-lg font-bold leading-snug tracking-tight text-[var(--color-ink)] sm:text-2xl">
                A better phone is one click away.
              </h2>

              <p className="mt-2 hidden max-w-sm text-xs leading-5 text-[var(--color-muted)] sm:block sm:text-sm">
                Explore the latest arrivals and discover phones selected for
                you.
              </p>

              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] sm:text-sm"
              >
                Shop now
                <FiArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {/* Decorative phone illustration */}
            <div
              className="pointer-events-none absolute -right-1 bottom-0 top-0 flex w-[39%] items-center justify-center sm:right-4 sm:w-[34%]"
              aria-hidden="true"
            >
              <div className="absolute h-28 w-28 rounded-full bg-white/50 sm:h-40 sm:w-40" />

              <div className="absolute right-[48%] top-[22%] h-[88px] w-[48px] rotate-[-12deg] rounded-[13px] border-[3px] border-[var(--color-ink)] bg-[var(--color-stone)] shadow-lg sm:h-[120px] sm:w-[64px]">
                <div className="absolute left-1.5 top-1.5 h-5 w-5 rounded-lg bg-[var(--color-muted)] sm:h-7 sm:w-7" />
                <div className="absolute inset-x-1.5 bottom-2 h-1 rounded-full bg-[var(--color-border-strong)]" />
              </div>

              <div className="absolute right-[17%] top-[12%] h-[105px] w-[53px] rotate-[9deg] rounded-[14px] border-[3px] border-[var(--color-ink)] bg-[var(--color-white)] shadow-xl sm:h-[145px] sm:w-[72px]">
                <div className="absolute left-1.5 top-1.5 h-6 w-6 rounded-lg bg-[var(--color-stone)] sm:h-8 sm:w-8" />
                <div className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-[var(--color-stone)]" />
              </div>
            </div>
          </div>
        </section>

        {/* Recent orders */}
        <section aria-label="Recent orders">
          <SectionHeading
            title="Recent orders"
            actionLabel="View all orders"
            actionTo="/account/orders"
          />

          {status === "loading" ? (
            <div className="space-y-3" aria-label="Loading recent orders">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)]"
                />
              ))}
            </div>
          ) : status === "error" ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-8 text-center">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                We couldn&apos;t load your recent orders
              </p>

              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                <FiRefreshCw size={15} aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <RecentOrderCard key={order.id} order={order} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-10 text-center">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                No orders yet
              </p>

              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Your purchases will appear here when you place an order.
              </p>

              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
              >
                Start shopping
                <FiArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}

          <Link
            to="/account/orders"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-white)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] sm:hidden"
          >
            View all orders
            <FiArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>

        {/* ========================================
            ACCOUNT DANGER ZONE
        ======================================== */}

        <section
          aria-labelledby="account-deletion-heading"
          className="border-t border-[var(--color-border)] pt-6 sm:pt-8"
        >
          <div className="rounded-[var(--radius-card)] border border-[var(--color-error)]/20 bg-[var(--color-white)] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-error-soft)] text-[var(--color-error)]">
                  <FiTrash2 size={18} aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <h2
                    id="account-deletion-heading"
                    className="text-sm font-bold text-[var(--color-ink)]"
                  >
                    Delete account
                  </h2>

                  <p className="mt-1 max-w-lg text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
                    No longer want to use Ogim Store? You can permanently
                    deactivate your account. Your existing order and payment
                    records will remain preserved.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openDeleteModal}
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[var(--radius-control)] border border-[var(--color-error)]/30 px-4 py-2.5 text-xs font-semibold text-[var(--color-error)] transition-colors hover:border-[var(--color-error)] hover:bg-[var(--color-error-soft)] sm:self-center sm:text-sm"
              >
                Delete account
                <FiArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Account deletion confirmation */}
      {isDeleteModalOpen && (
        <DeleteAccountModal
          onClose={closeDeleteModal}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeletingAccount}
          errorMessage={deleteError}
        />
      )}
    </AccountLayout>
  );
}
