import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiFilter,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
} from "react-icons/fi";

import AccountLayout from "../components/account/AccountLayout";
import AccountMobileMenu from "../components/account/AccountMobileMenu";
import RecentOrderCard from "../components/account/RecentOrderCard";

import { ApiError, getCustomerOrders, type OrderApiRecord } from "../lib/api";

import type {
  CustomerOrder,
  OrderStatus,
  ProductCondition,
  PaymentStatus,
} from "../data/orders";

// ============================================
// TYPES
// ============================================

type OrderFilter = "All" | OrderStatus;

type PageStatus = "loading" | "success" | "error";

// ============================================
// FILTERS
// ============================================

const filters: OrderFilter[] = [
  "All",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

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
// STATUS MAPPING
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
// ERROR MESSAGE
// ============================================

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Your session may have expired. Please sign in again.";
    }

    return error.message;
  }

  return "Unable to load your orders. Please try again.";
}

// ============================================
// ACCOUNT ORDERS PAGE
// ============================================

export default function AccountOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");

  const [errorMessage, setErrorMessage] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  // ============================================
  // FETCH REAL CUSTOMER ORDERS
  // ============================================

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setPageStatus("loading");
      setErrorMessage("");

      try {
        const response = await getCustomerOrders();

        if (!isMounted) return;

        const customerOrders = response.data.orders
          .map(mapOrderToCustomerOrder)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

        setOrders(customerOrders);

        setPageStatus("success");
      } catch (error: unknown) {
        if (!isMounted) return;

        console.error("Customer orders error:", error);

        setErrorMessage(getErrorMessage(error));

        setPageStatus("error");
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [retryKey]);

  // ============================================
  // ORDER COUNTS
  // ============================================

  const orderCounts = useMemo(() => {
    return {
      All: orders.length,

      Processing: orders.filter((order) => order.status === "Processing")
        .length,

      Shipped: orders.filter((order) => order.status === "Shipped").length,

      Delivered: orders.filter((order) => order.status === "Delivered").length,

      Cancelled: orders.filter((order) => order.status === "Cancelled").length,
    };
  }, [orders]);

  // ============================================
  // FILTER AND SEARCH
  // ============================================

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "All" || order.status === activeFilter;

      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  // ============================================
  // CLEAR FILTERS
  // ============================================

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("All");
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <AccountLayout>
      <div className="space-y-5 sm:space-y-6">
        <AccountMobileMenu />

        {/* Page heading */}
        <header>
          <Link
            to="/account"
            className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] lg:hidden"
          >
            <FiArrowLeft size={15} aria-hidden="true" />
            Account overview
          </Link>

          <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">
            Your purchases
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            My orders
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            View and track all your orders in one place.
          </p>
        </header>

        {/* Order status filters */}
        <div
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Filter orders by status"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                id={`order-filter-${filter.toLowerCase()}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="account-orders-results"
                onClick={() => setActiveFilter(filter)}
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                  isActive
                    ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]",
                ].join(" ")}
              >
                {filter}

                <span
                  className={[
                    "grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-stone)] text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  {pageStatus === "success" ? orderCounts[filter] : "—"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search orders</span>

            <FiSearch
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search orders by reference or product..."
              className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-white)] pl-10 pr-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
            />
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-white)] px-3 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)] sm:px-4 sm:text-sm"
            aria-label="Clear order filters"
          >
            <FiFilter size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Clear filters</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>

        {/* Order results */}
        <section
          id="account-orders-results"
          role="tabpanel"
          aria-labelledby={`order-filter-${activeFilter.toLowerCase()}`}
          aria-live="polite"
          className="space-y-3"
        >
          {pageStatus === "loading" ? (
            <div className="space-y-3" aria-label="Loading orders">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)]"
                />
              ))}
            </div>
          ) : pageStatus === "error" ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-white)] px-5 py-10 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-paper)]">
                <FiPackage
                  size={25}
                  className="text-[var(--color-muted)]"
                  aria-hidden="true"
                />
              </div>

              <h2 className="text-base font-bold text-[var(--color-ink)]">
                Unable to load your orders
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                <FiRefreshCw size={15} aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <RecentOrderCard order={order} />
              </motion.div>
            ))
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-white)] px-5 py-10 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--color-paper)]">
                {searchQuery ? (
                  <FiSearch
                    size={25}
                    className="text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                ) : (
                  <FiPackage
                    size={25}
                    className="text-[var(--color-muted)]"
                    aria-hidden="true"
                  />
                )}
              </div>

              <h2 className="text-base font-bold text-[var(--color-ink)]">
                {searchQuery
                  ? "No matching orders"
                  : orders.length === 0
                    ? "No orders yet"
                    : "No orders found"}
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                {searchQuery
                  ? "Try another order reference or product name, or clear your filters."
                  : orders.length === 0
                    ? "Your purchases will appear here when you place your first order."
                    : `You don't have any ${activeFilter.toLowerCase()} orders right now.`}
              </p>

              {searchQuery || activeFilter !== "All" ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-paper)]"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/shop"
                  className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
                >
                  <FiShoppingBag size={16} aria-hidden="true" />
                  Start shopping
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </AccountLayout>
  );
}
